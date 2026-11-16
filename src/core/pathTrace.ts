import { isLit, leafAvailable, unitAvailable } from './graph'
import type { GraphIndex, KnowledgeEdge, KnowledgeNode, LocalizedTitle, NodeKind } from './types'

export type PathTraceNodeStatus = 'gold' | 'cyan' | 'crimson'

export interface PathTraceIncomingReason {
  from: string
  fromTitle: string
  type: 'hard' | 'soft'
  reason?: string
}

export interface PathTraceUnitItem {
  unitId: string
  title: LocalizedTitle
  domainId: string
  status: PathTraceNodeStatus
  litLeaves: number
  totalLeaves: number
  dagRank: number
  incomingReasons: PathTraceIncomingReason[]
}

export interface PathTraceStep {
  order: number
  unitId: string
  leafId: string
  leafTitle: LocalizedTitle
  path: string[]
  pathLabels: string[]
}

export interface PathTraceEdgeItem {
  edgeId: string
  from: string
  to: string
  type: 'hard' | 'soft'
  reason?: string
  satisfied: boolean
}

export type TraceBlockerCode =
  | 'missing-pack-node'
  | 'cycle-suspected'
  | 'no-available-leaf'
  | 'already-lit'

export interface TraceBlocker {
  code: TraceBlockerCode
  unitId?: string
  message: string
}

export interface PathTraceResult {
  targetId: string
  targetUnitId: string | null
  targetKind: NodeKind
  targetTitle: LocalizedTitle
  chain: PathTraceUnitItem[]
  edges: PathTraceEdgeItem[]
  steps: PathTraceStep[]
  truncated: boolean
  canLightTargetNow: boolean
  remainingUnits: number
  remainingLeaves: number
  litLeavesInScope: number
  totalLeavesInScope: number
  blockers: TraceBlocker[]
}

function buildAncestorPath(nodeId: string, index: GraphIndex): { path: string[]; pathLabels: string[] } {
  const path: string[] = []
  const pathLabels: string[] = []
  const seen = new Set<string>()
  let cur = index.nodesById.get(nodeId)
  while (cur && !seen.has(cur.id) && seen.size < 64) {
    seen.add(cur.id)
    path.push(cur.id)
    pathLabels.push(cur.title.zh)
    cur = cur.parentId !== null ? index.nodesById.get(cur.parentId) : undefined
  }
  path.reverse()
  pathLabels.reverse()
  return { path, pathLabels }
}

export function computePathTrace(
  targetId: string,
  index: GraphIndex,
  litLeaves: ReadonlySet<string>,
  opts?: { maxSteps?: number; includeSoft?: boolean; includeSatisfied?: boolean }
): PathTraceResult {
  const maxSteps = opts?.maxSteps ?? 100
  const includeSoft = opts?.includeSoft ?? true
  const includeSatisfied = opts?.includeSatisfied ?? true

  const targetNode = index.nodesById.get(targetId)
  if (!targetNode) {
    return {
      targetId,
      targetUnitId: null,
      targetKind: 'leaf',
      targetTitle: { zh: targetId },
      chain: [],
      edges: [],
      steps: [],
      truncated: false,
      canLightTargetNow: false,
      remainingUnits: 0,
      remainingLeaves: 0,
      litLeavesInScope: 0,
      totalLeavesInScope: 0,
      blockers: [
        {
          code: 'missing-pack-node',
          message: `Node "${targetId}" does not exist in pack`
        }
      ]
    }
  }

  let targetUnitId: string | null = null
  let scopeUnitIds: string[] = []

  if (targetNode.kind === 'unit') {
    targetUnitId = targetNode.id
    scopeUnitIds = [targetNode.id]
  } else if (targetNode.kind === 'leaf') {
    targetUnitId = index.owningUnit(targetNode.id) ?? null
    scopeUnitIds = targetUnitId ? [targetUnitId] : []
  } else {
    // branch (either chapter branch inside a unit or domain branch)
    const owning = index.owningUnit(targetNode.id)
    if (owning) {
      targetUnitId = owning
      scopeUnitIds = [owning]
    } else {
      scopeUnitIds = index.unitsOf(targetNode.id).map((u) => u.id)
    }
  }

  // Collect transitive hard prerequisite closure of scopeUnitIds
  const closureSet = new Set<string>()
  const queue = [...scopeUnitIds]
  for (const uid of scopeUnitIds) closureSet.add(uid)

  let head = 0
  while (head < queue.length) {
    const cur = queue[head++]!
    for (const e of index.hardPrereqsByNode.get(cur) ?? []) {
      if (!closureSet.has(e.from) && index.nodesById.get(e.from)?.kind === 'unit') {
        closureSet.add(e.from)
        queue.push(e.from)
      }
    }
  }

  // Filter out already-lit prerequisites if includeSatisfied === false (keep scopeUnitIds)
  const scopeSet = new Set(scopeUnitIds)
  const activeSet = new Set<string>()
  for (const uid of closureSet) {
    if (includeSatisfied || scopeSet.has(uid) || !isLit(uid, index, litLeaves)) {
      activeSet.add(uid)
    }
  }

  // Topological sort on activeSet using hard edges (+ soft edges within activeSet as tie-breakers)
  const inDegree = new Map<string, number>()
  const adj = new Map<string, string[]>()
  for (const uid of activeSet) {
    inDegree.set(uid, 0)
    adj.set(uid, [])
  }

  for (const uid of activeSet) {
    for (const e of index.hardPrereqsByNode.get(uid) ?? []) {
      if (activeSet.has(e.from) && e.from !== e.to) {
        adj.get(e.from)!.push(e.to)
        inDegree.set(uid, (inDegree.get(uid) ?? 0) + 1)
      }
    }
    if (includeSoft) {
      for (const e of index.softPrereqsByNode.get(uid) ?? []) {
        if (activeSet.has(e.from) && e.from !== e.to) {
          adj.get(e.from)!.push(e.to)
          inDegree.set(uid, (inDegree.get(uid) ?? 0) + 1)
        }
      }
    }
  }

  const ready: string[] = []
  for (const [uid, deg] of inDegree) {
    if (deg === 0) ready.push(uid)
  }
  ready.sort((a, b) => {
    const da = index.dagDepthOf(a)
    const db = index.dagDepthOf(b)
    return da !== db ? da - db : a.localeCompare(b)
  })

  const orderedIds: string[] = []
  const dagRank = new Map<string, number>()
  for (const uid of activeSet) dagRank.set(uid, 0)

  while (ready.length > 0) {
    const cur = ready.shift()!
    orderedIds.push(cur)
    const curRank = dagRank.get(cur) ?? 0
    for (const next of adj.get(cur) ?? []) {
      dagRank.set(next, Math.max(dagRank.get(next) ?? 0, curRank + 1))
      const rem = (inDegree.get(next) ?? 0) - 1
      inDegree.set(next, rem)
      if (rem === 0) {
        ready.push(next)
        ready.sort((a, b) => {
          const da = index.dagDepthOf(a)
          const db = index.dagDepthOf(b)
          return da !== db ? da - db : a.localeCompare(b)
        })
      }
    }
  }

  const blockers: TraceBlocker[] = []
  if (orderedIds.length < activeSet.size) {
    blockers.push({
      code: 'cycle-suspected',
      message: 'Prerequisite cycle suspected in trace subgraph'
    })
    for (const uid of activeSet) {
      if (!orderedIds.includes(uid)) orderedIds.push(uid)
    }
  }

  const chain: PathTraceUnitItem[] = []
  const edgeItems: PathTraceEdgeItem[] = []
  const seenEdgeIds = new Set<string>()

  let remainingUnits = 0
  let remainingLeaves = 0
  let litLeavesInScope = 0
  let totalLeavesInScope = 0

  for (const uid of orderedIds) {
    const uNode = index.nodesById.get(uid)
    if (!uNode) continue

    const leaves = index.leavesOf(uid)
    const total = leaves.length
    let litCount = 0
    for (const l of leaves) {
      if (litLeaves.has(l.id)) litCount++
    }
    totalLeavesInScope += total
    litLeavesInScope += litCount
    remainingLeaves += total - litCount

    const unitIsLit = isLit(uid, index, litLeaves)
    if (!unitIsLit) remainingUnits++

    const avail = unitAvailable(uid, index, litLeaves)
    let status: PathTraceNodeStatus
    if (unitIsLit) {
      status = 'gold'
    } else if (avail && total - litCount > 0) {
      status = 'cyan'
    } else {
      status = 'crimson'
      if (total === 0) {
        blockers.push({
          code: 'no-available-leaf',
          unitId: uid,
          message: `Unit "${uid}" has 0 leaves and cannot be lit`
        })
      }
    }

    const incomingEdges: KnowledgeEdge[] = [
      ...(index.hardPrereqsByNode.get(uid) ?? []),
      ...(includeSoft ? index.softPrereqsByNode.get(uid) ?? [] : [])
    ]

    const incomingReasons: PathTraceIncomingReason[] = incomingEdges.map((e) => {
      const fromNode = index.nodesById.get(e.from)
      const item: PathTraceIncomingReason = {
        from: e.from,
        fromTitle: fromNode?.title.zh ?? e.from,
        type: e.type === 'soft' ? 'soft' : 'hard'
      }
      if (e.reason) item.reason = e.reason
      return item
    })

    for (const e of incomingEdges) {
      if (seenEdgeIds.has(e.id)) continue
      if (!activeSet.has(e.from)) continue
      if (e.type === 'soft' && !includeSoft) continue
      seenEdgeIds.add(e.id)
      const edgeItem: PathTraceEdgeItem = {
        edgeId: e.id,
        from: e.from,
        to: e.to,
        type: e.type === 'soft' ? 'soft' : 'hard',
        satisfied: isLit(e.from, index, litLeaves)
      }
      if (e.reason) edgeItem.reason = e.reason
      edgeItems.push(edgeItem)
    }

    chain.push({
      unitId: uid,
      title: uNode.title,
      domainId: uNode.domainId,
      status,
      litLeaves: litCount,
      totalLeaves: total,
      dagRank: dagRank.get(uid) ?? index.dagDepthOf(uid),
      incomingReasons
    })
  }

  const targetScopeLit =
    targetNode.kind === 'branch'
      ? targetUnitId !== null
        ? isLit(targetUnitId, index, litLeaves)
        : scopeUnitIds.length > 0 &&
          scopeUnitIds.every((uid) => index.leavesOf(uid).length > 0 && isLit(uid, index, litLeaves)) &&
          remainingUnits === 0 &&
          remainingLeaves === 0
      : isLit(targetId, index, litLeaves)
  if (targetScopeLit) {
    blockers.push({
      code: 'already-lit',
      unitId: targetUnitId ?? undefined,
      message: `Target "${targetId}" is already lit`
    })
  }

  // Emit executable steps strictly gated by leafAvailable
  const steps: PathTraceStep[] = []
  let truncated = false
  let order = 0
  const seenLeafIds = new Set<string>()

  const pushLeafStep = (uid: string, leaf: KnowledgeNode) => {
    if (seenLeafIds.has(leaf.id)) return
    if (litLeaves.has(leaf.id)) return
    if (!leafAvailable(leaf.id, index, litLeaves)) return
    seenLeafIds.add(leaf.id)
    if (steps.length >= maxSteps) {
      truncated = true
      return
    }
    const { path, pathLabels } = buildAncestorPath(leaf.id, index)
    steps.push({
      order: ++order,
      unitId: uid,
      leafId: leaf.id,
      leafTitle: leaf.title,
      path,
      pathLabels
    })
  }

  for (const item of chain) {
    if (item.status !== 'cyan') continue
    const leaves = index.leavesOf(item.unitId)
    for (const l of leaves) {
      // If target is a specific leaf in this unit, prioritize it if needed, or preserve natural order
      pushLeafStep(item.unitId, l)
    }
  }

  let canLightTargetNow = false
  if (targetNode.kind === 'leaf') {
    canLightTargetNow = !litLeaves.has(targetNode.id) && leafAvailable(targetNode.id, index, litLeaves)
  } else if (targetUnitId) {
    canLightTargetNow =
      !isLit(targetUnitId, index, litLeaves) &&
      unitAvailable(targetUnitId, index, litLeaves) &&
      index.leavesOf(targetUnitId).some((l) => !litLeaves.has(l.id))
  } else {
    canLightTargetNow = !targetScopeLit && chain.some((item) => item.status === 'cyan')
  }

  return {
    targetId,
    targetUnitId,
    targetKind: targetNode.kind,
    targetTitle: targetNode.title,
    chain,
    edges: edgeItems,
    steps,
    truncated,
    canLightTargetNow,
    remainingUnits,
    remainingLeaves,
    litLeavesInScope,
    totalLeavesInScope,
    blockers
  }
}
