import type {
  DomainDef,
  EdgeType,
  KnowledgeEdge,
  KnowledgeNode,
  LearningRoute,
  NodeKind,
  PackDocument,
  ResourceItem
} from './types'

const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/
const HTTP_URL_RE = /^https?:\/\//i

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNodeKind(value: unknown): value is NodeKind {
  return value === 'branch' || value === 'unit' || value === 'leaf'
}

function isEdgeType(value: unknown, allowRelated: boolean): value is EdgeType {
  if (value === 'hard' || value === 'soft') return true
  return allowRelated && value === 'related'
}

/**
 * Kahn's algorithm on `unit` nodes using ONLY `hard` + `soft` edges.
 * `related` edges are intentionally excluded from DAG cycle detection.
 * Returns an elementary cycle path `[u0, u1, ..., u0]` if a cycle exists, or `null`.
 */
export function detectCycles(
  nodes: readonly KnowledgeNode[],
  edges: readonly KnowledgeEdge[]
): string[] | null {
  const unitIds = new Set<string>()
  for (const n of nodes) {
    if (n.kind === 'unit') unitIds.add(n.id)
  }
  if (unitIds.size === 0) return null

  const inDegree = new Map<string, number>()
  const adj = new Map<string, string[]>()
  for (const id of unitIds) {
    inDegree.set(id, 0)
    adj.set(id, [])
  }

  for (const e of edges) {
    if (e.type !== 'hard' && e.type !== 'soft') continue
    if (!unitIds.has(e.from) || !unitIds.has(e.to)) continue
    if (e.from === e.to) return [e.from, e.to]
    adj.get(e.from)!.push(e.to)
    inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1)
  }

  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  let visited = 0
  let head = 0
  while (head < queue.length) {
    const curr = queue[head++]!
    visited++
    for (const next of adj.get(curr) ?? []) {
      const nextDeg = (inDegree.get(next) ?? 0) - 1
      inDegree.set(next, nextDeg)
      if (nextDeg === 0) queue.push(next)
    }
  }

  if (visited === unitIds.size) return null

  // Reconstruct an elementary cycle among nodes with remaining inDegree > 0
  const remaining = new Set<string>()
  for (const [id, deg] of inDegree) {
    if (deg > 0) remaining.add(id)
  }

  // Iterative 3-color DFS on the remaining subgraph to extract the actual cycle
  const color = new Map<string, 0 | 1 | 2>() // 0=unvisited, 1=visiting, 2=done
  const path: string[] = []
  const pathPos = new Map<string, number>()

  for (const startId of remaining) {
    if ((color.get(startId) ?? 0) !== 0) continue

    color.set(startId, 1)
    pathPos.set(startId, path.length)
    path.push(startId)
    const frames: { node: string; nextIdx: number }[] = [{ node: startId, nextIdx: 0 }]

    while (frames.length > 0) {
      const top = frames[frames.length - 1]!
      const neighbors = adj.get(top.node) ?? []
      if (top.nextIdx < neighbors.length) {
        const v = neighbors[top.nextIdx++]!
        if (!remaining.has(v)) continue
        const c = color.get(v) ?? 0
        if (c === 1) {
          const idx = pathPos.get(v)
          if (idx !== undefined) {
            return [...path.slice(idx), v]
          }
        } else if (c === 0) {
          color.set(v, 1)
          pathPos.set(v, path.length)
          path.push(v)
          frames.push({ node: v, nextIdx: 0 })
        }
      } else {
        frames.pop()
        path.pop()
        pathPos.delete(top.node)
        color.set(top.node, 2)
      }
    }
  }

  // Fallback (should not happen if visited < unitIds.size)
  const first = remaining.values().next().value as string | undefined
  return first ? [first, first] : null
}

/**
 * Checks whether adding `candidate` to `(nodes, edges)` would create a cycle
 * (or self-loop on any edge type). Returns `[candidate.to, ..., candidate.to]`
 * on cycle, or `null` if safe.
 */
export function wouldCreateCycle(
  candidate: Pick<KnowledgeEdge, 'from' | 'to' | 'type'>,
  nodes: readonly KnowledgeNode[],
  edges: readonly KnowledgeEdge[]
): string[] | null {
  if (candidate.from === candidate.to) {
    return [candidate.from, candidate.to]
  }
  if (candidate.type === 'related') {
    return null
  }

  const unitIds = new Set<string>()
  for (const n of nodes) {
    if (n.kind === 'unit') unitIds.add(n.id)
  }
  if (!unitIds.has(candidate.from) || !unitIds.has(candidate.to)) {
    return null
  }

  // Check if `candidate.from` is reachable from `candidate.to` along existing hard+soft edges
  const adj = new Map<string, string[]>()
  for (const e of edges) {
    if (e.type !== 'hard' && e.type !== 'soft') continue
    let list = adj.get(e.from)
    if (!list) {
      list = []
      adj.set(e.from, list)
    }
    list.push(e.to)
  }

  const parent = new Map<string, string | null>()
  const queue: string[] = [candidate.to]
  parent.set(candidate.to, null)
  let head = 0
  let reached = false

  while (head < queue.length) {
    const curr = queue[head++]!
    if (curr === candidate.from) {
      reached = true
      break
    }
    for (const next of adj.get(curr) ?? []) {
      if (!parent.has(next)) {
        parent.set(next, curr)
        queue.push(next)
      }
    }
  }

  if (reached) {
    const path: string[] = []
    let cur: string | null = candidate.from
    while (cur !== null) {
      path.push(cur)
      cur = parent.get(cur) ?? null
    }
    path.reverse()
    path.push(candidate.to)
    return path
  }

  // Also check if existing edges already contained a cycle
  return detectCycles(nodes, [
    ...edges,
    { id: '__candidate__', from: candidate.from, to: candidate.to, type: candidate.type }
  ])
}

/**
 * Resolves all `hard`/`soft` edge IDs participating in a cycle path `[u0, u1, ..., u0]`.
 */
export function findCycleEdgeIds(
  cyclePath: readonly string[],
  edges: readonly KnowledgeEdge[]
): string[] {
  if (cyclePath.length < 2) return []
  const ids = new Set<string>()
  for (let i = 0; i < cyclePath.length - 1; i++) {
    const from = cyclePath[i]!
    const to = cyclePath[i + 1]!
    for (const e of edges) {
      if ((e.type === 'hard' || e.type === 'soft') && e.from === from && e.to === to) {
        ids.add(e.id)
      }
    }
  }
  return [...ids]
}

function parseResources(
  rawResources: unknown,
  nodeId: string,
  errors: string[]
): ResourceItem[] | undefined {
  if (rawResources === undefined) return undefined
  if (!Array.isArray(rawResources)) {
    errors.push(`Node "${nodeId}": resources must be an array`)
    return undefined
  }
  const result: ResourceItem[] = []
  for (let i = 0; i < rawResources.length; i++) {
    const item = rawResources[i]
    if (!isRecord(item)) {
      errors.push(`Node "${nodeId}": resources[${i}] must be an object`)
      continue
    }
    if (!isNonEmptyString(item.title)) {
      errors.push(`Node "${nodeId}": resources[${i}].title must be a non-empty string`)
      continue
    }
    if (!isNonEmptyString(item.url) || !HTTP_URL_RE.test(item.url)) {
      errors.push(`Node "${nodeId}": resources[${i}].url must start with http:// or https://`)
      continue
    }
    const res: ResourceItem = {
      title: item.title,
      url: item.url
    }
    if (isNonEmptyString(item.id)) res.id = item.id
    if (item.lang === 'zh' || item.lang === 'en') res.lang = item.lang
    if (isNonEmptyString(item.addedAt)) res.addedAt = item.addedAt
    result.push(res)
  }
  return result
}

function parseAndValidateCore(
  raw: unknown,
  mode: 'normalize' | 'strict-v2',
  opts?: { source?: 'builtin' | 'custom' }
): { ok: true; pack: PackDocument; warnings: string[] } | { ok: false; errors: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (!isRecord(raw)) {
    return { ok: false, errors: ['Pack document must be a JSON object'] }
  }

  const schema = raw.schema
  const isV1 = schema === 'litree/pack-v1'
  const isV2 = schema === 'litree/pack-v2'
  if (mode === 'strict-v2') {
    if (!isV2) {
      errors.push(`Invalid schema: expected "litree/pack-v2", got ${String(schema)}`)
    }
  } else if (!isV1 && !isV2) {
    errors.push(`Invalid schema: expected "litree/pack-v1" or "litree/pack-v2", got ${String(schema)}`)
  }

  if (!isNonEmptyString(raw.id)) {
    errors.push('Pack id must be a non-empty string')
  }
  const packId = isNonEmptyString(raw.id) ? raw.id : ''

  let version = 1
  if (mode === 'strict-v2') {
    if (!isFiniteNumber(raw.version) || raw.version < 1) {
      errors.push('Pack version must be a positive finite number')
    } else {
      version = raw.version
    }
  } else if (raw.version !== undefined) {
    if (!isFiniteNumber(raw.version) || raw.version < 1) {
      errors.push('Pack version must be a positive finite number when provided')
    } else {
      version = raw.version
    }
  }

  let title: { zh: string; en?: string } = { zh: '' }
  if (!isRecord(raw.title) || !isNonEmptyString(raw.title.zh)) {
    errors.push('Pack title.zh must be a non-empty string')
  } else {
    title = isNonEmptyString(raw.title.en)
      ? { zh: raw.title.zh, en: raw.title.en }
      : { zh: raw.title.zh }
  }

  const source: 'builtin' | 'custom' =
    opts?.source ?? (raw.source === 'custom' ? 'custom' : 'builtin')

  // Domains
  const domains: DomainDef[] = []
  const domainIds = new Set<string>()
  if (!Array.isArray(raw.domains) || raw.domains.length === 0) {
    errors.push('Pack domains must be a non-empty array')
  } else {
    for (let i = 0; i < raw.domains.length; i++) {
      const d = raw.domains[i]
      if (!isRecord(d)) {
        errors.push(`domains[${i}] must be an object`)
        continue
      }
      if (!isNonEmptyString(d.id)) {
        errors.push(`domains[${i}].id must be a non-empty string`)
        continue
      }
      if (domainIds.has(d.id)) {
        errors.push(`Duplicate domain id "${d.id}"`)
        continue
      }
      if (!isNonEmptyString(d.name)) {
        errors.push(`domains[${i}].name must be a non-empty string`)
        continue
      }
      if (!isNonEmptyString(d.color) || !HEX_COLOR_RE.test(d.color)) {
        errors.push(`domains[${i}].color must be a valid hex color (#RGB..#RRGGBBAA)`)
        continue
      }
      domainIds.add(d.id)
      domains.push({ id: d.id, name: d.name, color: d.color })
    }
  }

  // Nodes
  const nodes: KnowledgeNode[] = []
  const nodeById = new Map<string, KnowledgeNode>()
  if (!Array.isArray(raw.nodes) || raw.nodes.length === 0) {
    errors.push('Pack nodes must be a non-empty array')
  } else {
    for (let i = 0; i < raw.nodes.length; i++) {
      const n = raw.nodes[i]
      if (!isRecord(n)) {
        errors.push(`nodes[${i}] must be an object`)
        continue
      }
      if (!isNonEmptyString(n.id)) {
        errors.push(`nodes[${i}].id must be a non-empty string`)
        continue
      }
      if (nodeById.has(n.id)) {
        errors.push(`Duplicate node id "${n.id}"`)
        continue
      }
      if (!isNodeKind(n.kind)) {
        errors.push(`Node "${n.id}": invalid kind "${String(n.kind)}"`)
        continue
      }

      const rawParent = isV1 && mode === 'normalize' ? n.parent : n.parentId
      if (rawParent !== null && !isNonEmptyString(rawParent)) {
        errors.push(`Node "${n.id}": ${isV1 ? 'parent' : 'parentId'} must be a non-empty string or null`)
        continue
      }
      const parentId: string | null = rawParent

      const rawDomain = isV1 && mode === 'normalize' ? n.domain : n.domainId
      if (!isNonEmptyString(rawDomain) || !domainIds.has(rawDomain)) {
        errors.push(`Node "${n.id}": unknown domain "${String(rawDomain)}"`)
        continue
      }

      if (!isRecord(n.title) || !isNonEmptyString(n.title.zh)) {
        errors.push(`Node "${n.id}": title.zh must be a non-empty string`)
        continue
      }

      const nodeTitle: { zh: string; en?: string } = isNonEmptyString(n.title.en)
        ? { zh: n.title.zh, en: n.title.en }
        : { zh: n.title.zh }

      const node: KnowledgeNode = {
        id: n.id,
        parentId,
        kind: n.kind,
        title: nodeTitle,
        domainId: rawDomain
      }

      if (typeof n.core === 'boolean') node.core = n.core
      if (typeof n.summary === 'string') node.summary = n.summary
      if (typeof n.outcome === 'string') node.outcome = n.outcome
      if (typeof n.caution === 'string') node.caution = n.caution
      if (typeof n.evidence === 'string') node.evidence = n.evidence

      const parsedResources = parseResources(n.resources, n.id, errors)
      if (parsedResources !== undefined) node.resources = parsedResources

      if (n.exercises !== undefined) {
        if (!Array.isArray(n.exercises) || !n.exercises.every((ex) => typeof ex === 'string')) {
          errors.push(`Node "${n.id}": exercises must be an array of strings`)
        } else {
          node.exercises = [...n.exercises]
        }
      }

      if (n.tags !== undefined) {
        if (!Array.isArray(n.tags) || !n.tags.every((t) => typeof t === 'string')) {
          errors.push(`Node "${n.id}": tags must be an array of strings`)
        } else {
          node.tags = [...n.tags]
        }
      }

      if (n.estimatedMinutes !== undefined) {
        if (!isFiniteNumber(n.estimatedMinutes) || n.estimatedMinutes < 0) {
          errors.push(`Node "${n.id}": estimatedMinutes must be a non-negative finite number`)
        } else {
          node.estimatedMinutes = n.estimatedMinutes
        }
      }

      if (n.position3D !== undefined) {
        if (
          !Array.isArray(n.position3D) ||
          n.position3D.length !== 3 ||
          !n.position3D.every(isFiniteNumber)
        ) {
          errors.push(`Node "${n.id}": position3D must be [number, number, number]`)
        } else {
          node.position3D = [n.position3D[0]!, n.position3D[1]!, n.position3D[2]!]
        }
      }

      if (n.layoutOverride !== undefined) {
        if (
          !isRecord(n.layoutOverride) ||
          !isFiniteNumber(n.layoutOverride.x) ||
          !isFiniteNumber(n.layoutOverride.y)
        ) {
          errors.push(`Node "${n.id}": layoutOverride must be { x: number, y: number }`)
        } else {
          node.layoutOverride = { x: n.layoutOverride.x, y: n.layoutOverride.y }
        }
      }

      nodeById.set(node.id, node)
      nodes.push(node)
    }
  }

  // Validate tree parentage, parent cycles, and leaf -> unit ancestor invariant
  for (const node of nodes) {
    if (node.parentId !== null) {
      const parent = nodeById.get(node.parentId)
      if (!parent) {
        errors.push(`Node "${node.id}": missing parent "${node.parentId}"`)
        continue
      }
      if (parent.kind === 'leaf') {
        errors.push(`Node "${node.id}": parent "${parent.id}" cannot be a leaf`)
      }
    }

    const seen = new Set<string>([node.id])
    let cur: KnowledgeNode | undefined = node
    let hasUnitAncestor = false
    let depth = 0
    while (cur && cur.parentId !== null) {
      if (depth > 64) {
        errors.push(`Node "${node.id}": parent chain exceeds max depth (64)`)
        break
      }
      const next = nodeById.get(cur.parentId)
      if (!next) break
      if (seen.has(next.id)) {
        errors.push(`Node "${node.id}": cycle detected in parentId chain at "${next.id}"`)
        break
      }
      seen.add(next.id)
      if (next.kind === 'unit') hasUnitAncestor = true
      cur = next
      depth++
    }

    if (node.kind === 'leaf' && !hasUnitAncestor) {
      errors.push(`Leaf "${node.id}": must have a unit ancestor`)
    }
  }

  // Edges
  const edges: KnowledgeEdge[] = []
  const edgeIds = new Set<string>()
  if (!Array.isArray(raw.edges)) {
    errors.push('Pack edges must be an array')
  } else {
    for (let i = 0; i < raw.edges.length; i++) {
      const e = raw.edges[i]
      if (!isRecord(e)) {
        errors.push(`edges[${i}] must be an object`)
        continue
      }
      if (!isNonEmptyString(e.from) || !isNonEmptyString(e.to)) {
        errors.push(`edges[${i}]: from and to must be non-empty strings`)
        continue
      }
      if (!isEdgeType(e.type, !isV1 || mode === 'strict-v2')) {
        errors.push(`edges[${i}]: invalid type "${String(e.type)}"`)
        continue
      }
      if (e.from === e.to) {
        errors.push(`edges[${i}]: self-loop on "${e.from}" is forbidden`)
        continue
      }

      const fromNode = nodeById.get(e.from)
      const toNode = nodeById.get(e.to)
      if (!fromNode) {
        errors.push(`edges[${i}]: missing "from" node "${e.from}"`)
        continue
      }
      if (!toNode) {
        errors.push(`edges[${i}]: missing "to" node "${e.to}"`)
        continue
      }

      if ((e.type === 'hard' || e.type === 'soft') && (fromNode.kind !== 'unit' || toNode.kind !== 'unit')) {
        errors.push(`edges[${i}]: ${e.type} edge endpoints must both be kind "unit"`)
        continue
      }

      let edgeId: string
      if (mode === 'strict-v2') {
        if (!isNonEmptyString(e.id)) {
          errors.push(`edges[${i}]: id must be a non-empty string in litree/pack-v2`)
          continue
        }
        if (edgeIds.has(e.id)) {
          errors.push(`Duplicate edge id "${e.id}"`)
          continue
        }
        edgeId = e.id
      } else if (isNonEmptyString(e.id)) {
        if (edgeIds.has(e.id)) {
          edgeId = `${e.id}#${i}`
          warnings.push(`Disambiguated duplicate edge id "${e.id}" -> "${edgeId}"`)
        } else {
          edgeId = e.id
        }
      } else {
        const baseId = `${e.type}:${e.from}->${e.to}`
        edgeId = edgeIds.has(baseId) ? `${baseId}#${i}` : baseId
      }
      edgeIds.add(edgeId)

      const edge: KnowledgeEdge = {
        id: edgeId,
        from: e.from,
        to: e.to,
        type: e.type
      }
      if (typeof e.reason === 'string' && e.reason.length > 0) {
        edge.reason = e.reason
      }
      edges.push(edge)
    }
  }

  // Kahn cycle check on unit nodes (hard + soft)
  if (errors.length === 0) {
    const cycle = detectCycles(nodes, edges)
    if (cycle) {
      errors.push(`Prerequisite cycle detected: ${cycle.join(' -> ')}`)
    }
  }

  // Routes
  const routes: LearningRoute[] = []
  const routeIds = new Set<string>()
  if (raw.routes === undefined) {
    if (mode === 'strict-v2') {
      errors.push('Pack routes must be an array in litree/pack-v2')
    }
  } else if (!Array.isArray(raw.routes)) {
    errors.push('Pack routes must be an array')
  } else {
    for (let i = 0; i < raw.routes.length; i++) {
      const r = raw.routes[i]
      if (!isRecord(r)) {
        errors.push(`routes[${i}] must be an object`)
        continue
      }
      if (!isNonEmptyString(r.name)) {
        errors.push(`routes[${i}].name must be a non-empty string`)
        continue
      }
      if (!Array.isArray(r.ids) || r.ids.length === 0) {
        errors.push(`routes[${i}].ids must be a non-empty array`)
        continue
      }
      const ids: string[] = []
      for (const uid of r.ids) {
        if (!isNonEmptyString(uid)) {
          errors.push(`routes[${i}].ids contains non-string or empty id`)
          continue
        }
        const uNode = nodeById.get(uid)
        if (!uNode || uNode.kind !== 'unit') {
          errors.push(`routes[${i}]: "${uid}" is not an existing unit node`)
          continue
        }
        ids.push(uid)
      }

      let routeId: string
      if (mode === 'strict-v2') {
        if (!isNonEmptyString(r.id)) {
          errors.push(`routes[${i}].id must be a non-empty string in litree/pack-v2`)
          continue
        }
        if (routeIds.has(r.id)) {
          errors.push(`Duplicate route id "${r.id}"`)
          continue
        }
        routeId = r.id
      } else if (isNonEmptyString(r.id)) {
        routeId = routeIds.has(r.id) ? `${r.id}#${i}` : r.id
      } else {
        routeId = `${packId || 'pack'}:route-${i}`
      }
      routeIds.add(routeId)

      const route: LearningRoute = {
        id: routeId,
        name: r.name,
        ids
      }
      if (typeof r.note === 'string' && r.note.length > 0) {
        route.note = r.note
      }
      routes.push(route)
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  const pack: PackDocument = {
    schema: 'litree/pack-v2',
    id: packId,
    version,
    title,
    source,
    domains,
    nodes,
    edges,
    routes
  }
  if (typeof raw.description === 'string' && raw.description.length > 0) {
    pack.description = raw.description
  }

  return { ok: true, pack, warnings }
}

/**
 * Lossless normalization + validation accepting both `litree/pack-v1` and `litree/pack-v2`.
 */
export function normalizePackToV2(
  raw: unknown,
  opts?: { source?: 'builtin' | 'custom' }
): { ok: true; pack: PackDocument; warnings: string[] } | { ok: false; errors: string[] } {
  return parseAndValidateCore(raw, 'normalize', opts)
}

/**
 * Strict validation of a `litree/pack-v2` document (no implicit v1 field remapping).
 */
export function validatePackDocument(
  raw: unknown
): { ok: true; pack: PackDocument } | { ok: false; errors: string[] } {
  const result = parseAndValidateCore(raw, 'strict-v2')
  if (!result.ok) return result
  return { ok: true, pack: result.pack }
}

/**
 * Parses and validates either `litree/pack-v1` or `litree/pack-v2`, throwing a descriptive Error on failure.
 */
export function parsePackDocument(
  raw: unknown,
  opts?: { source?: 'builtin' | 'custom' }
): PackDocument {
  const res = normalizePackToV2(raw, opts)
  if (!res.ok) {
    throw new Error(`Invalid pack document: ${res.errors.join('; ')}`)
  }
  return res.pack
}
