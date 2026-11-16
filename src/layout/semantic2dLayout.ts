import type { GraphIndex, KnowledgeNode, NodeKind, PackDocument } from '../core/types'

export interface SemanticNode2D {
  id: string
  x: number
  y: number
  nx: number
  ny: number
  radius: number
  kind: NodeKind
  domainId: string
  clusterId: string | undefined
  topoLayer: number
}

export interface SemanticEdge2D {
  id: string
  from: string
  to: string
  type: 'hard' | 'soft' | 'related'
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface SemanticDomainRegion {
  domainId: string
  name: string
  color: string
  cx: number
  cy: number
  nx: number
  ny: number
  rx: number
  ry: number
  nodeCount: number
  unitCount: number
  leafCount: number
}

export interface Semantic2DLayout {
  packId: string
  worldWidth: number
  worldHeight: number
  nodes: Map<string, SemanticNode2D>
  edges: SemanticEdge2D[]
  regions: Map<string, SemanticDomainRegion>
  worldToNormalized: (wx: number, wy: number) => [number, number]
  normalizedToWorld: (nx: number, ny: number) => [number, number]
}

export interface Semantic2DOptions {
  worldWidth?: number
  worldHeight?: number
  focusClusterId?: string | null
}

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

function collectSubtreeIds(rootId: string, index: GraphIndex): Set<string> | null {
  const root = index.nodesById.get(rootId)
  if (!root) return null
  const ids = new Set<string>()
  const stack: KnowledgeNode[] = [root]
  while (stack.length > 0) {
    const cur = stack.pop()!
    if (ids.has(cur.id)) continue
    ids.add(cur.id)
    const children = index.childrenByParent.get(cur.id)
    if (children) {
      for (const child of children) {
        stack.push(child)
      }
    }
  }
  return ids.size > 0 ? ids : null
}

/**
 * Computes topological layer ranks for nodes based on hard/soft prerequisite edges
 * confined within `allowedIds`. Cycles gracefully degrade without infinite loops.
 */
function computeTopologicalRanks(
  allowedIds: ReadonlySet<string>,
  pack: PackDocument
): Map<string, number> {
  const inDegree = new Map<string, number>()
  const outgoing = new Map<string, string[]>()
  for (const id of allowedIds) {
    inDegree.set(id, 0)
    outgoing.set(id, [])
  }

  for (const edge of pack.edges) {
    if (edge.type === 'related') continue
    if (!allowedIds.has(edge.from) || !allowedIds.has(edge.to) || edge.from === edge.to) continue
    outgoing.get(edge.from)!.push(edge.to)
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1)
  }

  const rank = new Map<string, number>()
  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) {
      queue.push(id)
      rank.set(id, 0)
    }
  }
  queue.sort(compareId)

  let head = 0
  while (head < queue.length) {
    const cur = queue[head++]!
    const nextRank = (rank.get(cur) ?? 0) + 1
    for (const target of outgoing.get(cur) ?? []) {
      const prev = rank.get(target) ?? 0
      if (nextRank > prev) rank.set(target, nextRank)
      const remaining = (inDegree.get(target) ?? 1) - 1
      inDegree.set(target, remaining)
      if (remaining === 0) queue.push(target)
    }
  }

  // Fallback rank for any cycle members
  for (const id of allowedIds) {
    if (!rank.has(id)) rank.set(id, 0)
  }
  return rank
}

/**
 * Arranges pack nodes into non-overlapping 2D semantic nebula regions:
 * - Domains claim dedicated cosmic zones sized by content density
 * - Units align left-to-right by prerequisite topological layer inside their domain zone
 * - Leaves orbit cleanly in compact micro-grids around their owning unit (or branch)
 */
export function computeSemantic2DLayout(
  pack: PackDocument,
  index: GraphIndex,
  options?: Semantic2DOptions
): Semantic2DLayout {
  const focusIds =
    options?.focusClusterId !== undefined && options.focusClusterId !== null
      ? collectSubtreeIds(options.focusClusterId, index)
      : null

  const visibleNodes = pack.nodes.filter((n) => !focusIds || focusIds.has(n.id))
  const scaleSourceCount = focusIds ? visibleNodes.length : pack.nodes.length
  const scaleFactor = clamp(
    Math.sqrt(Math.max(1, scaleSourceCount) / (focusIds ? 45 : 80)),
    focusIds ? 0.8 : 1,
    5.2
  )
  const worldWidth = Math.max(800, options?.worldWidth ?? Math.round(1800 * scaleFactor))
  const worldHeight = Math.max(600, options?.worldHeight ?? Math.round(1240 * scaleFactor))
  const visibleIdSet = new Set(visibleNodes.map((n) => n.id))
  const topoRank = computeTopologicalRanks(visibleIdSet, pack)

  const regions = new Map<string, SemanticDomainRegion>()
  const rawPositions = new Map<string, { x: number; y: number; radius: number; kind: NodeKind; domainId: string }>()
  const syntheticEdges: SemanticEdge2D[] = []

  const focusRootNode =
    focusIds && options?.focusClusterId ? index.nodesById.get(options.focusClusterId) : undefined

  if (focusIds && focusRootNode) {
    const def = pack.domains.find((d) => d.id === focusRootNode.domainId)
    regions.set(focusRootNode.domainId, {
      domainId: focusRootNode.domainId,
      name: def?.name ?? focusRootNode.domainId,
      color: def?.color ?? '#38bdf8',
      cx: worldWidth * 0.5,
      cy: worldHeight * 0.5,
      nx: 0.5,
      ny: 0.5,
      rx: worldWidth * 0.44,
      ry: worldHeight * 0.42,
      nodeCount: visibleNodes.length,
      unitCount: visibleNodes.filter((n) => n.kind === 'unit').length,
      leafCount: visibleNodes.filter((n) => n.kind === 'leaf').length
    })

    rawPositions.set(focusRootNode.id, {
      x: worldWidth * 0.5,
      y: 88,
      radius: focusRootNode.kind === 'branch' ? 14 : 11,
      kind: focusRootNode.kind,
      domainId: focusRootNode.domainId
    })

    const subBranches = visibleNodes
      .filter((n) => n.id !== focusRootNode.id && n.kind === 'branch')
      .sort((a, b) => compareId(a.id, b.id))
    const subUnits = visibleNodes
      .filter((n) => n.id !== focusRootNode.id && n.kind === 'unit')
      .sort((a, b) => compareId(a.id, b.id))
    const subLeaves = visibleNodes
      .filter((n) => n.id !== focusRootNode.id && n.kind === 'leaf')
      .sort((a, b) => compareId(a.id, b.id))

    if (subUnits.length > 0) {
      // Branch/Lane focus view: arrange child sub-branches top band & units cleanly across whole viewport
      subBranches.forEach((br, idx) => {
        const ratio = subBranches.length <= 1 ? 0.5 : idx / (subBranches.length - 1)
        rawPositions.set(br.id, {
          x: worldWidth * (0.14 + ratio * 0.72),
          y: 168 + (idx % 2) * 32,
          radius: 11,
          kind: 'branch',
          domainId: br.domainId
        })
      })

      const cols = clamp(Math.ceil(Math.sqrt(subUnits.length * 1.35)), 2, 5)
      const rows = Math.max(1, Math.ceil(subUnits.length / cols))
      const padX = 150
      const startY = subBranches.length > 0 ? 256 : 190
      const availW = Math.max(240, worldWidth - padX * 2)
      const availH = Math.max(240, worldHeight - startY - 90)
      const stepX = cols <= 1 ? 0 : availW / (cols - 1)
      const stepY = rows <= 1 ? 0 : availH / (rows - 1)

      subUnits.forEach((u, uIdx) => {
        const col = uIdx % cols
        const row = Math.floor(uIdx / cols)
        const ux = cols <= 1 ? worldWidth * 0.5 : padX + col * stepX
        const uy = rows <= 1 ? startY + availH * 0.35 : startY + row * stepY
        rawPositions.set(u.id, {
          x: ux,
          y: uy,
          radius: 9.5,
          kind: 'unit',
          domainId: u.domainId
        })
      })

      // Cluster any leaves around their owning unit/branch cleanly
      const leavesByParent = new Map<string, KnowledgeNode[]>()
      for (const lf of subLeaves) {
        const pKey = lf.parentId && rawPositions.has(lf.parentId) ? lf.parentId : focusRootNode.id
        const list = leavesByParent.get(pKey)
        if (list) list.push(lf)
        else leavesByParent.set(pKey, [lf])
      }
      for (const [pKey, group] of leavesByParent) {
        const anchor = rawPositions.get(pKey)!
        const span = Math.min(86, 26 + Math.sqrt(group.length) * 10)
        group.forEach((lf, k) => {
          const ang = (k / Math.max(1, group.length)) * Math.PI * 2
          const dist = 20 + (k % 3) * (span / 3)
          rawPositions.set(lf.id, {
            x: clamp(anchor.x + Math.cos(ang) * dist, 40, worldWidth - 40),
            y: clamp(anchor.y + Math.sin(ang) * dist, 60, worldHeight - 40),
            radius: lf.core ? 5 : 4,
            kind: 'leaf',
            domainId: lf.domainId
          })
        })
      }
    } else if (subBranches.length > 0) {
      // Unit focus view with chapters (c0, c1, ...): crisp readable columns of chapters & leaf rows
      const cols = clamp(subBranches.length, 1, 4)
      const rows = Math.ceil(subBranches.length / cols)
      const padX = 110
      const startY = 175
      const cellW = (worldWidth - padX * 2) / cols
      const cellH = Math.max(180, (worldHeight - startY - 60) / rows)

      subBranches.forEach((ch, idx) => {
        const col = idx % cols
        const row = Math.floor(idx / cols)
        const chX = padX + col * cellW + cellW * 0.22
        const chY = startY + row * cellH
        rawPositions.set(ch.id, {
          x: chX,
          y: chY,
          radius: 10,
          kind: 'branch',
          domainId: ch.domainId
        })

        const chLeaves = subLeaves.filter((lf) => lf.parentId === ch.id)
        const leafCols = chLeaves.length > 7 ? 2 : 1
        const leafStepY = clamp((cellH - 52) / Math.max(1, Math.ceil(chLeaves.length / leafCols)), 28, 46)
        chLeaves.forEach((lf, k) => {
          const lCol = Math.floor(k / Math.ceil(chLeaves.length / leafCols))
          const lRow = k % Math.ceil(chLeaves.length / leafCols)
          rawPositions.set(lf.id, {
            x: chX + lCol * Math.min(230, cellW * 0.46),
            y: chY + 42 + lRow * leafStepY,
            radius: lf.core ? 5.6 : 4.6,
            kind: 'leaf',
            domainId: lf.domainId
          })
        })
      })

      // Any direct orphan leaves under unit
      const placedLeaves = subLeaves.filter((lf) => !rawPositions.has(lf.id))
      placedLeaves.forEach((lf, k) => {
        rawPositions.set(lf.id, {
          x: padX + (k % 3) * 280,
          y: worldHeight - 90 - Math.floor(k / 3) * 38,
          radius: lf.core ? 5.6 : 4.6,
          kind: 'leaf',
          domainId: lf.domainId
        })
      })
    } else if (subLeaves.length > 0) {
      // Chapter or small unit focus view: spacious readable grid of all leaves
      const cols = clamp(Math.ceil(Math.sqrt(subLeaves.length * 1.4)), 1, 4)
      const rows = Math.max(1, Math.ceil(subLeaves.length / cols))
      const padX = Math.max(140, worldWidth * 0.14)
      const startY = 185
      const availW = Math.max(220, worldWidth - padX * 2)
      const availH = Math.max(200, worldHeight - startY - 90)
      const stepX = cols <= 1 ? 0 : availW / (cols - 1)
      const stepY = rows <= 1 ? 0 : clamp(availH / (rows - 1), 46, 96)

      subLeaves.forEach((lf, k) => {
        const col = k % cols
        const row = Math.floor(k / cols)
        rawPositions.set(lf.id, {
          x: cols <= 1 ? worldWidth * 0.42 : padX + col * stepX,
          y: rows <= 1 ? startY + availH * 0.25 : startY + row * stepY,
          radius: lf.core ? 6.2 : 5.2,
          kind: 'leaf',
          domainId: lf.domainId
        })
      })
    }

    // Add lightweight hierarchy guide edges inside focused subtree so parent-child structure reads clearly
    for (const n of visibleNodes) {
      if (n.id === focusRootNode.id) continue
      const pId = n.parentId && rawPositions.has(n.parentId) ? n.parentId : focusRootNode.id
      const fromPos = rawPositions.get(pId)
      const toPos = rawPositions.get(n.id)
      if (fromPos && toPos && pId !== n.id) {
        syntheticEdges.push({
          id: `__tree_${pId}_${n.id}`,
          from: pId,
          to: n.id,
          type: 'related',
          x1: fromPos.x,
          y1: fromPos.y,
          x2: toPos.x,
          y2: toPos.y
        })
      }
    }
  } else {
  // Group visible nodes by domain
  const domainGroups = new Map<string, KnowledgeNode[]>()
  for (const d of pack.domains) {
    domainGroups.set(d.id, [])
  }
  for (const node of visibleNodes) {
    const list = domainGroups.get(node.domainId)
    if (list) {
      list.push(node)
    } else {
      domainGroups.set(node.domainId, [node])
    }
  }

  const activeDomains = [...domainGroups.entries()]
    .filter(([, list]) => list.length > 0)
    .map(([domainId, list]) => {
      const def = pack.domains.find((d) => d.id === domainId)
      return {
        domainId,
        name: def?.name ?? domainId,
        color: def?.color ?? '#38bdf8',
        nodes: list.sort((a, b) => compareId(a.id, b.id))
      }
    })

  const count = Math.max(1, activeDomains.length)
  const cols = count === 1 ? 1 : count <= 2 ? 2 : count <= 6 ? 3 : 4
  const rows = Math.ceil(count / cols)
  const padX = worldWidth * 0.055
  const padY = worldHeight * 0.075
  const cellW = (worldWidth - padX * 2) / cols
  const cellH = (worldHeight - padY * 2) / rows

  activeDomains.forEach((group, idx) => {
    const col = idx % cols
    const row = Math.floor(idx / cols)
    // Gentle organic stagger so rows look like a constellation rather than a rigid spreadsheet
    const staggerX = (row % 2 === 1 ? 0.018 : -0.018) * worldWidth
    const staggerY = (col % 2 === 1 ? 0.015 : -0.015) * worldHeight
    const cx = clamp(padX + (col + 0.5) * cellW + staggerX, padX + cellW * 0.42, worldWidth - padX - cellW * 0.42)
    const cy = clamp(padY + (row + 0.5) * cellH + staggerY, padY + cellH * 0.42, worldHeight - padY - cellH * 0.42)
    const rx = cellW * 0.44
    const ry = cellH * 0.42

    const branches = group.nodes.filter((n) => n.kind === 'branch')
    const units = group.nodes.filter((n) => n.kind === 'unit')
    const leaves = group.nodes.filter((n) => n.kind === 'leaf')

    regions.set(group.domainId, {
      domainId: group.domainId,
      name: group.name,
      color: group.color,
      cx,
      cy,
      nx: cx / worldWidth,
      ny: cy / worldHeight,
      rx,
      ry,
      nodeCount: group.nodes.length,
      unitCount: units.length,
      leafCount: leaves.length
    })

    // Place branches across upper arc of the domain nebula
    const branchCount = branches.length
    branches.forEach((br, bIdx) => {
      const ratio = branchCount <= 1 ? 0.5 : bIdx / (branchCount - 1)
      const bx = cx + (ratio - 0.5) * rx * 1.25
      const by = cy - ry * 0.62 + (bIdx % 2) * Math.min(28, ry * 0.1)
      rawPositions.set(br.id, {
        x: bx,
        y: by,
        radius: 13,
        kind: br.kind,
        domainId: br.domainId
      })
    })

    // Group units by topological layer left->right inside the domain region
    const unitsToPlace = units.length > 0 ? units : branches
    const layerBuckets = new Map<number, KnowledgeNode[]>()
    for (const u of unitsToPlace) {
      const r = topoRank.get(u.id) ?? 0
      const bucket = layerBuckets.get(r)
      if (bucket) bucket.push(u)
      else layerBuckets.set(r, [u])
    }
    const sortedLayers = [...layerBuckets.keys()].sort((a, b) => a - b)
    const numLayers = Math.max(1, sortedLayers.length)

    sortedLayers.forEach((layerVal, lIdx) => {
      const bucket = layerBuckets.get(layerVal)!
      const xFrac = numLayers === 1 ? 0.5 : lIdx / (numLayers - 1)
      const layerX = cx + (xFrac - 0.5) * rx * 1.48
      const bCount = bucket.length
      bucket.forEach((u, uIdx) => {
        if (rawPositions.has(u.id) && u.kind === 'branch') return
        const yFrac = bCount === 1 ? 0.5 : uIdx / (bCount - 1)
        const jitterX = ((uIdx % 2 === 0 ? -1 : 1) * Math.min(22, rx * 0.08))
        const ux = layerX + jitterX
        const uy = cy - ry * 0.25 + (yFrac - 0.5) * ry * 1.32
        rawPositions.set(u.id, {
          x: ux,
          y: uy,
          radius: u.kind === 'unit' ? 8.5 : 13,
          kind: u.kind,
          domainId: u.domainId
        })
      })
    })

    // Cluster leaves around their direct owning unit (or branch/region center) in a neat constellation grid
    const leavesByParent = new Map<string, KnowledgeNode[]>()
    for (const lf of leaves) {
      const parentKey = lf.parentId && rawPositions.has(lf.parentId)
        ? lf.parentId
        : index.owningUnit(lf.id) ?? group.domainId
      const arr = leavesByParent.get(parentKey)
      if (arr) arr.push(lf)
      else leavesByParent.set(parentKey, [lf])
    }

    for (const [parentKey, childLeaves] of leavesByParent) {
      const anchor = rawPositions.get(parentKey) ?? { x: cx, y: cy }
      const total = childLeaves.length
      // Golden-angle / sunflower micro-constellation prevents leaf overlap without crowding neighbors
      const maxSpread = clamp(Math.sqrt(total) * 14, 24, Math.min(rx, ry) * 0.36)
      childLeaves.forEach((lf, k) => {
        const t = (k + 0.5) / Math.max(1, total)
        const dist = 18 + Math.sqrt(t) * maxSpread
        const angle = k * 2.399963229728653 + (k % 3) * 0.08
        const lx = clamp(anchor.x + Math.cos(angle) * dist, cx - rx * 0.94, cx + rx * 0.94)
        const ly = clamp(anchor.y + Math.sin(angle) * dist, cy - ry * 0.92, cy + ry * 0.92)
        rawPositions.set(lf.id, {
          x: lx,
          y: ly,
          radius: lf.core ? 4.8 : 3.6,
          kind: lf.kind,
          domainId: lf.domainId
        })
      })
    }
  })
  }

  // Apply explicit layoutOverride coordinates if user edited/repositioned nodes
  for (const node of visibleNodes) {
    if (
      node.layoutOverride &&
      Number.isFinite(node.layoutOverride.x) &&
      Number.isFinite(node.layoutOverride.y)
    ) {
      const existing = rawPositions.get(node.id)
      const ox = clamp(node.layoutOverride.x * worldWidth, 24, worldWidth - 24)
      const oy = clamp(node.layoutOverride.y * worldHeight, 24, worldHeight - 24)
      rawPositions.set(node.id, {
        x: ox,
        y: oy,
        radius: existing?.radius ?? (node.kind === 'branch' ? 13 : node.kind === 'unit' ? 8.5 : 3.6),
        kind: node.kind,
        domainId: node.domainId
      })
    }
  }

  const nodes = new Map<string, SemanticNode2D>()
  for (const node of visibleNodes) {
    const pos = rawPositions.get(node.id)
    if (!pos) continue
    nodes.set(node.id, {
      id: node.id,
      x: pos.x,
      y: pos.y,
      nx: clamp(pos.x / worldWidth, 0, 1),
      ny: clamp(pos.y / worldHeight, 0, 1),
      radius: pos.radius,
      kind: pos.kind,
      domainId: pos.domainId,
      clusterId: index.owningUnit(node.id) ?? index.owningBranch(node.id),
      topoLayer: topoRank.get(node.id) ?? 0
    })
  }

  const edges: SemanticEdge2D[] = []
  const sortedEdges = [...pack.edges].sort((a, b) => compareId(a.id, b.id))
  for (const edge of sortedEdges) {
    const fromNode = nodes.get(edge.from)
    const toNode = nodes.get(edge.to)
    if (!fromNode || !toNode) continue
    edges.push({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      type: edge.type,
      x1: fromNode.x,
      y1: fromNode.y,
      x2: toNode.x,
      y2: toNode.y
    })
  }
  for (const se of syntheticEdges) {
    const fromNode = nodes.get(se.from)
    const toNode = nodes.get(se.to)
    if (!fromNode || !toNode) continue
    edges.push({
      id: se.id,
      from: se.from,
      to: se.to,
      type: se.type,
      x1: fromNode.x,
      y1: fromNode.y,
      x2: toNode.x,
      y2: toNode.y
    })
  }

  return {
    packId: pack.id,
    worldWidth,
    worldHeight,
    nodes,
    edges,
    regions,
    worldToNormalized: (wx: number, wy: number) => [
      clamp(wx / worldWidth, 0, 1),
      clamp(wy / worldHeight, 0, 1)
    ],
    normalizedToWorld: (nx: number, ny: number) => [
      clamp(nx, 0, 1) * worldWidth,
      clamp(ny, 0, 1) * worldHeight
    ]
  }
}
