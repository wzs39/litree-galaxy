import type {
  GraphIndex,
  KnowledgeEdge,
  KnowledgeNode,
  NodeVisualState,
  PackDocument,
  PackProgress,
  UserNodeProgress
} from './types'

const EMPTY_NODES: readonly KnowledgeNode[] = Object.freeze([])
const EMPTY_EDGES: readonly KnowledgeEdge[] = Object.freeze([])

const litLeavesCache = new WeakMap<PackProgress, Set<string>>()
const closureCache = new WeakMap<GraphIndex, WeakMap<ReadonlySet<string>, Map<string, string[]>>>()

export function getLitLeavesSet(progress: PackProgress | null, index?: GraphIndex): Set<string> {
  if (!progress) return new Set<string>()
  let cached = litLeavesCache.get(progress)
  if (!cached) {
    cached = new Set<string>()
    for (const [id, entry] of Object.entries(progress.nodes)) {
      if (entry && entry.status === 'lit') {
        cached.add(id)
      }
    }
    litLeavesCache.set(progress, cached)
  }
  if (!index) return new Set(cached)
  const filtered = new Set<string>()
  for (const id of cached) {
    if (index.nodesById.get(id)?.kind === 'leaf') {
      filtered.add(id)
    }
  }
  return filtered
}

export function buildGraphIndex(pack: PackDocument): GraphIndex {
  const nodesById = new Map<string, KnowledgeNode>()
  const edgesById = new Map<string, KnowledgeEdge>()
  const childrenMutable = new Map<string | null, KnowledgeNode[]>()

  for (const node of pack.nodes) {
    nodesById.set(node.id, node)
    let list = childrenMutable.get(node.parentId)
    if (!list) {
      list = []
      childrenMutable.set(node.parentId, list)
    }
    list.push(node)
  }

  const childrenByParent = new Map<string | null, readonly KnowledgeNode[]>()
  for (const [pid, list] of childrenMutable) {
    childrenByParent.set(pid, Object.freeze(list))
  }

  const hardPrereqsMutable = new Map<string, KnowledgeEdge[]>()
  const softPrereqsMutable = new Map<string, KnowledgeEdge[]>()
  const hardDepsMutable = new Map<string, KnowledgeEdge[]>()
  const softDepsMutable = new Map<string, KnowledgeEdge[]>()
  const relatedMutable = new Map<string, KnowledgeEdge[]>()
  const reasonsMutable = new Map<string, KnowledgeEdge[]>()

  const pushEdge = (map: Map<string, KnowledgeEdge[]>, key: string, edge: KnowledgeEdge) => {
    let list = map.get(key)
    if (!list) {
      list = []
      map.set(key, list)
    }
    list.push(edge)
  }

  for (const edge of pack.edges) {
    edgesById.set(edge.id, edge)
    if (edge.type === 'hard') {
      pushEdge(hardPrereqsMutable, edge.to, edge)
      pushEdge(hardDepsMutable, edge.from, edge)
      if (edge.reason && edge.reason.length > 0) {
        pushEdge(reasonsMutable, edge.to, edge)
      }
    } else if (edge.type === 'soft') {
      pushEdge(softPrereqsMutable, edge.to, edge)
      pushEdge(softDepsMutable, edge.from, edge)
      if (edge.reason && edge.reason.length > 0) {
        pushEdge(reasonsMutable, edge.to, edge)
      }
    } else if (edge.type === 'related') {
      pushEdge(relatedMutable, edge.from, edge)
      pushEdge(relatedMutable, edge.to, edge)
    }
  }

  const freezeEdgeMap = (src: Map<string, KnowledgeEdge[]>): ReadonlyMap<string, readonly KnowledgeEdge[]> => {
    const out = new Map<string, readonly KnowledgeEdge[]>()
    for (const [k, v] of src) out.set(k, Object.freeze(v))
    return out
  }

  const hardPrereqsByNode = freezeEdgeMap(hardPrereqsMutable)
  const softPrereqsByNode = freezeEdgeMap(softPrereqsMutable)
  const hardDependentsByNode = freezeEdgeMap(hardDepsMutable)
  const softDependentsByNode = freezeEdgeMap(softDepsMutable)
  const relatedEdgesByNode = freezeEdgeMap(relatedMutable)
  const edgeReasons = freezeEdgeMap(reasonsMutable)

  // Precompute DAG depths over unit nodes (longest hard + soft prerequisite chain)
  const dagDepthMap = new Map<string, number>()
  {
    const unitIds: string[] = []
    const inDeg = new Map<string, number>()
    const adj = new Map<string, string[]>()

    for (const n of pack.nodes) {
      if (n.kind === 'unit') {
        unitIds.push(n.id)
        inDeg.set(n.id, 0)
        adj.set(n.id, [])
        dagDepthMap.set(n.id, 0)
      }
    }

    for (const e of pack.edges) {
      if (e.type !== 'hard' && e.type !== 'soft') continue
      if (!inDeg.has(e.from) || !inDeg.has(e.to) || e.from === e.to) continue
      adj.get(e.from)!.push(e.to)
      inDeg.set(e.to, (inDeg.get(e.to) ?? 0) + 1)
    }

    const q: string[] = []
    for (const id of unitIds) {
      if ((inDeg.get(id) ?? 0) === 0) q.push(id)
    }

    let head = 0
    while (head < q.length) {
      const u = q[head++]!
      const uDepth = dagDepthMap.get(u) ?? 0
      for (const v of adj.get(u) ?? []) {
        const nextDepth = Math.max(dagDepthMap.get(v) ?? 0, uDepth + 1)
        dagDepthMap.set(v, nextDepth)
        const rem = (inDeg.get(v) ?? 0) - 1
        inDeg.set(v, rem)
        if (rem === 0) q.push(v)
      }
    }
  }

  const owningUnitCache = new Map<string, string | undefined>()
  const owningBranchCache = new Map<string, string | undefined>()
  const depthCache = new Map<string, number>()
  const leavesCache = new Map<string, readonly KnowledgeNode[]>()
  const unitsCache = new Map<string, readonly KnowledgeNode[]>()
  const chaptersCache = new Map<string, readonly KnowledgeNode[]>()
  let topoCache: readonly KnowledgeNode[] | null = null

  const owningUnit = (nodeId: string): string | undefined => {
    if (owningUnitCache.has(nodeId)) return owningUnitCache.get(nodeId)
    let cur = nodesById.get(nodeId)
    const seen = new Set<string>()
    let result: string | undefined
    while (cur && !seen.has(cur.id) && seen.size < 64) {
      seen.add(cur.id)
      if (cur.kind === 'unit') {
        result = cur.id
        break
      }
      cur = cur.parentId !== null ? nodesById.get(cur.parentId) : undefined
    }
    owningUnitCache.set(nodeId, result)
    return result
  }

  const hasUnitAncestor = (node: KnowledgeNode): boolean => {
    let cur: KnowledgeNode | undefined = node.parentId !== null ? nodesById.get(node.parentId) : undefined
    const seen = new Set<string>([node.id])
    while (cur && !seen.has(cur.id) && seen.size < 64) {
      seen.add(cur.id)
      if (cur.kind === 'unit') return true
      cur = cur.parentId !== null ? nodesById.get(cur.parentId) : undefined
    }
    return false
  }

  const owningBranch = (nodeId: string): string | undefined => {
    if (owningBranchCache.has(nodeId)) return owningBranchCache.get(nodeId)
    let cur = nodesById.get(nodeId)
    const seen = new Set<string>()
    let result: string | undefined
    while (cur && !seen.has(cur.id) && seen.size < 64) {
      seen.add(cur.id)
      if (cur.kind === 'branch' && !hasUnitAncestor(cur)) {
        result = cur.id
        break
      }
      cur = cur.parentId !== null ? nodesById.get(cur.parentId) : undefined
    }
    owningBranchCache.set(nodeId, result)
    return result
  }

  const depthOf = (nodeId: string): number => {
    const cached = depthCache.get(nodeId)
    if (cached !== undefined) return cached
    let depth = 0
    let cur = nodesById.get(nodeId)
    const seen = new Set<string>()
    while (cur && cur.parentId !== null && !seen.has(cur.id) && seen.size < 64) {
      seen.add(cur.id)
      const parent = nodesById.get(cur.parentId)
      if (!parent) break
      depth++
      cur = parent
    }
    depthCache.set(nodeId, depth)
    return depth
  }

  const dagDepthOf = (unitId: string): number => dagDepthMap.get(unitId) ?? 0

  const leavesOf = (id: string): readonly KnowledgeNode[] => {
    const cached = leavesCache.get(id)
    if (cached) return cached
    const root = nodesById.get(id)
    if (!root) return EMPTY_NODES
    if (root.kind === 'leaf') {
      const frozen = Object.freeze([root])
      leavesCache.set(id, frozen)
      return frozen
    }
    const acc: KnowledgeNode[] = []
    const stack: KnowledgeNode[] = [root]
    const visited = new Set<string>()
    while (stack.length > 0) {
      const cur = stack.pop()!
      if (visited.has(cur.id)) continue
      visited.add(cur.id)
      if (cur.kind === 'leaf') {
        acc.push(cur)
        continue
      }
      const children = childrenByParent.get(cur.id) ?? EMPTY_NODES
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i]!)
      }
    }
    const frozen = Object.freeze(acc)
    leavesCache.set(id, frozen)
    return frozen
  }

  const unitsOf = (id: string): readonly KnowledgeNode[] => {
    const cached = unitsCache.get(id)
    if (cached) return cached
    const node = nodesById.get(id)
    if (!node) return EMPTY_NODES
    if (node.kind === 'unit') {
      const frozen = Object.freeze([node])
      unitsCache.set(id, frozen)
      return frozen
    }
    if (node.kind === 'leaf' || (node.kind === 'branch' && hasUnitAncestor(node))) {
      const uid = owningUnit(id)
      const uNode = uid ? nodesById.get(uid) : undefined
      const frozen = uNode ? Object.freeze([uNode]) : EMPTY_NODES
      unitsCache.set(id, frozen)
      return frozen
    }
    const acc: KnowledgeNode[] = []
    const stack: KnowledgeNode[] = [node]
    const visited = new Set<string>()
    while (stack.length > 0) {
      const cur = stack.pop()!
      if (visited.has(cur.id)) continue
      visited.add(cur.id)
      if (cur.kind === 'unit') {
        acc.push(cur)
        continue
      }
      const children = childrenByParent.get(cur.id) ?? EMPTY_NODES
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i]!)
      }
    }
    const frozen = Object.freeze(acc)
    unitsCache.set(id, frozen)
    return frozen
  }

  const chaptersOf = (unitId: string): readonly KnowledgeNode[] => {
    const cached = chaptersCache.get(unitId)
    if (cached) return cached
    const node = nodesById.get(unitId)
    if (!node || node.kind !== 'unit') return EMPTY_NODES
    const children = childrenByParent.get(unitId) ?? EMPTY_NODES
    const chapters = Object.freeze(children.filter((c) => c.kind === 'branch'))
    chaptersCache.set(unitId, chapters)
    return chapters
  }

  const mapEdgeNodes = (
    edgeMap: ReadonlyMap<string, readonly KnowledgeEdge[]>,
    unitId: string,
    pick: 'from' | 'to'
  ): readonly KnowledgeNode[] => {
    const edges = edgeMap.get(unitId)
    if (!edges || edges.length === 0) return EMPTY_NODES
    const out: KnowledgeNode[] = []
    const seen = new Set<string>()
    for (const e of edges) {
      const targetId = pick === 'from' ? e.from : e.to
      if (seen.has(targetId)) continue
      const target = nodesById.get(targetId)
      if (target) {
        seen.add(targetId)
        out.push(target)
      }
    }
    return Object.freeze(out)
  }

  const edgesBetween = (from: string, to: string): readonly KnowledgeEdge[] => {
    const out: KnowledgeEdge[] = []
    for (const e of hardPrereqsByNode.get(to) ?? EMPTY_EDGES) {
      if (e.from === from) out.push(e)
    }
    for (const e of softPrereqsByNode.get(to) ?? EMPTY_EDGES) {
      if (e.from === from) out.push(e)
    }
    for (const e of relatedEdgesByNode.get(to) ?? EMPTY_EDGES) {
      if ((e.from === from && e.to === to) || (e.from === to && e.to === from)) {
        out.push(e)
      }
    }
    return out
  }

  const topoOrder = (): readonly KnowledgeNode[] => {
    if (topoCache) return topoCache
    const ordered: KnowledgeNode[] = []
    const visited = new Set<string>()
    const roots = childrenByParent.get(null) ?? EMPTY_NODES
    const q: KnowledgeNode[] = [...roots]
    let head = 0
    while (head < q.length) {
      const cur = q[head++]!
      if (visited.has(cur.id)) continue
      visited.add(cur.id)
      ordered.push(cur)
      for (const child of childrenByParent.get(cur.id) ?? EMPTY_NODES) {
        if (!visited.has(child.id)) q.push(child)
      }
    }
    // Include any disconnected nodes if any
    for (const n of pack.nodes) {
      if (!visited.has(n.id)) ordered.push(n)
    }
    topoCache = Object.freeze(ordered)
    return topoCache
  }

  return {
    pack,
    nodesById,
    edgesById,
    childrenByParent,
    hardPrereqsByNode,
    softPrereqsByNode,
    hardDependentsByNode,
    softDependentsByNode,
    relatedEdgesByNode,
    edgeReasons,
    edgesBetween,
    owningUnit,
    owningBranch,
    depthOf,
    dagDepthOf,
    leavesOf,
    unitsOf,
    chaptersOf,
    hardPrereqsOf: (unitId) => mapEdgeNodes(hardPrereqsByNode, unitId, 'from'),
    softPrereqsOf: (unitId) => mapEdgeNodes(softPrereqsByNode, unitId, 'from'),
    hardDependentsOf: (unitId) => mapEdgeNodes(hardDependentsByNode, unitId, 'to'),
    topoOrder
  }
}

export function isLit(
  id: string,
  index: GraphIndex,
  litLeaves: ReadonlySet<string>
): boolean {
  const node = index.nodesById.get(id)
  if (!node) return false
  if (node.kind === 'leaf') {
    return litLeaves.has(id)
  }
  const leaves = index.leavesOf(id)
  if (leaves.length === 0) return false
  return leaves.every((l) => litLeaves.has(l.id))
}

export function unitAvailable(
  unitId: string,
  index: GraphIndex,
  litLeaves: ReadonlySet<string>
): boolean {
  const node = index.nodesById.get(unitId)
  if (!node || node.kind !== 'unit') return false
  const prereqs = index.hardPrereqsByNode.get(unitId) ?? EMPTY_EDGES
  for (const e of prereqs) {
    if (!isLit(e.from, index, litLeaves)) return false
  }
  return true
}

export function leafAvailable(
  leafId: string,
  index: GraphIndex,
  litLeaves: ReadonlySet<string>
): boolean {
  const node = index.nodesById.get(leafId)
  if (!node || node.kind !== 'leaf') return false
  const unitId = index.owningUnit(leafId)
  return unitId !== undefined && unitAvailable(unitId, index, litLeaves)
}

export function isNodeReviewDue(
  entry: UserNodeProgress | undefined,
  nowMs: number = Date.now()
): boolean {
  if (!entry || entry.status !== 'lit' || typeof entry.nextReviewAt !== 'string') {
    return false
  }
  const dueMs = Date.parse(entry.nextReviewAt)
  return Number.isFinite(dueMs) && dueMs <= nowMs
}

export function computeNodeVisualState(
  id: string,
  index: GraphIndex,
  progress: PackProgress | null,
  litLeaves: ReadonlySet<string>,
  nowMs: number = Date.now()
): NodeVisualState {
  const node = index.nodesById.get(id)
  if (!node) return 'locked'

  if (isLit(id, index, litLeaves)) {
    const entry = progress?.nodes[id]
    if (isNodeReviewDue(entry, nowMs)) return 'review_due'
    if (node.kind !== 'leaf') {
      const leaves = index.leavesOf(id)
      if (leaves.some((l) => isNodeReviewDue(progress?.nodes[l.id], nowMs))) {
        return 'review_due'
      }
    }
    return 'lit'
  }

  const status = progress?.nodes[id]?.status
  if (status === 'learning') return 'learning'
  if (status === 'queued') return 'queued'

  if (node.kind === 'leaf') {
    return leafAvailable(id, index, litLeaves) ? 'available' : 'locked'
  }
  if (node.kind === 'unit') {
    return unitAvailable(id, index, litLeaves) ? 'available' : 'locked'
  }
  // Branch: available if any descendant leaf is available (or if branch has direct available units)
  const leaves = index.leavesOf(id)
  if (leaves.some((l) => leafAvailable(l.id, index, litLeaves))) {
    return 'available'
  }
  return 'locked'
}

export function getNodeVisualState(
  id: string,
  index: GraphIndex,
  progress: PackProgress | null,
  nowOrIso?: number | string
): NodeVisualState {
  const nowMs =
    typeof nowOrIso === 'string'
      ? Date.parse(nowOrIso)
      : (nowOrIso ?? Date.now())
  const litLeaves = getLitLeavesSet(progress, index)
  return computeNodeVisualState(id, index, progress, litLeaves, nowMs)
}

/**
 * Returns missing hard prerequisite unit IDs for `unitId` in topological prerequisite order.
 */
export function minimalHardClosure(
  unitId: string,
  index: GraphIndex,
  litLeaves: ReadonlySet<string>
): string[] {
  let bySet = closureCache.get(index)
  if (!bySet) {
    bySet = new WeakMap()
    closureCache.set(index, bySet)
  }
  let byUnit = bySet.get(litLeaves)
  if (!byUnit) {
    byUnit = new Map()
    bySet.set(litLeaves, byUnit)
  }
  const cached = byUnit.get(unitId)
  if (cached) return [...cached]

  const node = index.nodesById.get(unitId)
  if (!node || node.kind !== 'unit') {
    byUnit.set(unitId, [])
    return []
  }

  // Step 1: Collect the unlit hard-prerequisite closure set (excluding unitId itself)
  const closure = new Set<string>()
  const queue: string[] = []
  for (const pre of index.hardPrereqsOf(unitId)) {
    if (pre.id !== unitId && !closure.has(pre.id) && !isLit(pre.id, index, litLeaves)) {
      closure.add(pre.id)
      queue.push(pre.id)
    }
  }

  let head = 0
  while (head < queue.length) {
    const cur = queue[head++]!
    for (const pre of index.hardPrereqsOf(cur)) {
      if (pre.id !== unitId && !closure.has(pre.id) && !isLit(pre.id, index, litLeaves)) {
        closure.add(pre.id)
        queue.push(pre.id)
      }
    }
  }

  if (closure.size === 0) {
    byUnit.set(unitId, [])
    return []
  }

  // Step 2: Kahn's topological sort on the closure subgraph with deterministic tie-breaking
  const inDegree = new Map<string, number>()
  const adj = new Map<string, string[]>()
  for (const id of closure) {
    inDegree.set(id, 0)
    adj.set(id, [])
  }

  for (const id of closure) {
    for (const pre of index.hardPrereqsOf(id)) {
      if (closure.has(pre.id) && pre.id !== id) {
        adj.get(pre.id)!.push(id)
        inDegree.set(id, (inDegree.get(id) ?? 0) + 1)
      }
    }
  }

  const cmpNodes = (a: string, b: string): number => {
    const da = index.dagDepthOf(a)
    const db = index.dagDepthOf(b)
    return da !== db ? da - db : a.localeCompare(b)
  }

  const ready: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) ready.push(id)
  }
  ready.sort(cmpNodes)

  const order: string[] = []
  const emitted = new Set<string>()
  while (ready.length > 0) {
    const cur = ready.shift()!
    order.push(cur)
    emitted.add(cur)
    let pushed = false
    for (const next of adj.get(cur) ?? []) {
      const rem = (inDegree.get(next) ?? 0) - 1
      inDegree.set(next, rem)
      if (rem === 0) {
        ready.push(next)
        pushed = true
      }
    }
    if (pushed) ready.sort(cmpNodes)
  }

  if (order.length < closure.size) {
    const remaining = [...closure].filter((id) => !emitted.has(id)).sort(cmpNodes)
    order.push(...remaining)
  }

  byUnit.set(unitId, order)
  return [...order]
}

export function pickNextActionable(
  index: GraphIndex,
  progress: PackProgress | null,
  opts?: { activeRouteId?: string | null; activeDomains?: readonly string[] }
): KnowledgeNode | null {
  const litLeaves = getLitLeavesSet(progress, index)
  const domainFilter =
    opts?.activeDomains && opts.activeDomains.length > 0
      ? new Set(opts.activeDomains)
      : null

  const routeRank = new Map<string, number>()
  if (opts?.activeRouteId) {
    const route = index.pack.routes.find((r) => r.id === opts.activeRouteId)
    if (route) {
      route.ids.forEach((uid, i) => {
        if (!routeRank.has(uid)) routeRank.set(uid, i)
      })
    }
  }

  const candidates: KnowledgeNode[] = []
  for (const node of index.pack.nodes) {
    if (node.kind !== 'leaf') continue
    if (litLeaves.has(node.id)) continue
    if (domainFilter && !domainFilter.has(node.domainId)) continue
    if (!leafAvailable(node.id, index, litLeaves)) continue
    candidates.push(node)
  }

  if (candidates.length === 0) return null

  const tierOf = (leaf: KnowledgeNode): number => {
    const entry = progress?.nodes[leaf.id]
    if (entry?.status === 'learning') return 0
    if (entry?.status === 'queued') return 1
    if (entry?.pinned) return 2
    const uid = index.owningUnit(leaf.id)
    if (uid && routeRank.has(uid)) return 3
    if (uid && index.nodesById.get(uid)?.core) return 4
    return 5
  }

  candidates.sort((a, b) => {
    const ta = tierOf(a)
    const tb = tierOf(b)
    if (ta !== tb) return ta - tb

    const ua = index.owningUnit(a.id)
    const ub = index.owningUnit(b.id)
    if (ta === 3 && ua && ub) {
      const ra = routeRank.get(ua) ?? Number.MAX_SAFE_INTEGER
      const rb = routeRank.get(ub) ?? Number.MAX_SAFE_INTEGER
      if (ra !== rb) return ra - rb
    }

    const da = ua ? index.dagDepthOf(ua) : 0
    const db = ub ? index.dagDepthOf(ub) : 0
    if (da !== db) return da - db

    return a.id.localeCompare(b.id)
  })

  return candidates[0] ?? null
}

/**
 * Returns newly unlocked unit IDs and their leaf IDs that transitioned `locked -> available`
 * when `newlyLitLeafId` was lit.
 */
export function computeUnlockCascade(
  newlyLitLeafId: string,
  beforeLitLeaves: ReadonlySet<string>,
  afterLitLeaves: ReadonlySet<string>,
  index: GraphIndex
): string[] {
  const unitId = index.owningUnit(newlyLitLeafId)
  if (!unitId) return []

  const unlocked = new Set<string>()
  for (const dep of index.hardDependentsOf(unitId)) {
    if (
      !unitAvailable(dep.id, index, beforeLitLeaves) &&
      unitAvailable(dep.id, index, afterLitLeaves)
    ) {
      unlocked.add(dep.id)
      for (const leaf of index.leavesOf(dep.id)) {
        if (!afterLitLeaves.has(leaf.id)) {
          unlocked.add(leaf.id)
        }
      }
    }
  }
  return [...unlocked]
}

export function pruneOrphanProgress(
  progress: PackProgress,
  index: GraphIndex
): { progress: PackProgress; removedIds: string[] } {
  const removedIds: string[] = []
  const nextNodes: Record<string, UserNodeProgress> = {}
  for (const [id, entry] of Object.entries(progress.nodes)) {
    if (index.nodesById.has(id)) {
      nextNodes[id] = entry
    } else {
      removedIds.push(id)
    }
  }
  if (removedIds.length === 0) {
    return { progress, removedIds }
  }
  return {
    progress: {
      ...progress,
      nodes: nextNodes
    },
    removedIds
  }
}
