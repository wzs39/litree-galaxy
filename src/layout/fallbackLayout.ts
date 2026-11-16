import type { EdgeType, GraphIndex, KnowledgeNode, NodeKind, PackDocument } from '../core/types'
import { computeGalaxyLayout, fnv1a32, type GalaxyLayoutResult, type Vec2 } from './galaxyLayout'

export interface FallbackNode2D {
  id: string
  x: number
  y: number
  nx: number
  ny: number
  radius: number
  kind: NodeKind
  domainId: string
  clusterId: string | undefined
}

export interface FallbackEdge2D {
  id: string
  from: string
  to: string
  type: EdgeType
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface FallbackDomainCentroid2D {
  domainId: string
  nx: number
  ny: number
  x: number
  y: number
  radius: number
}

export interface FallbackLayoutOptions {
  width?: number
  height?: number
  padding?: number
  focusClusterId?: string | null
  minSeparation2D?: number
}

export interface Fallback2DLayout {
  width: number
  height: number
  padding: number
  nodes: Map<string, FallbackNode2D>
  edges: FallbackEdge2D[]
  domainCentroids: Map<string, FallbackDomainCentroid2D>
  worldXZToNormalized: (wx: number, wz: number) => Vec2
  normalizedToWorldXZ: (nx: number, ny: number) => [number, number]
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function collectClusterSubtreeIds(
  focusClusterId: string,
  index: GraphIndex
): Set<string> | null {
  const root = index.nodesById.get(focusClusterId)
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

function relax2DSpatialHash(
  nodeList: FallbackNode2D[],
  minSepPx: number,
  width: number,
  height: number,
  padPx: number
): void {
  const N = nodeList.length
  if (N <= 1 || !Number.isFinite(minSepPx) || minSepPx <= 0) return

  const cellSize = minSepPx
  const HASH_SIZE = 32768
  const HASH_MASK = HASH_SIZE - 1
  const bucketHead = new Int32Array(HASH_SIZE)
  const nextNode = new Int32Array(N)
  const cellX = new Int32Array(N)
  const cellY = new Int32Array(N)
  const px = new Float64Array(N)
  const py = new Float64Array(N)

  for (let i = 0; i < N; i++) {
    px[i] = nodeList[i]!.x
    py[i] = nodeList[i]!.y
  }

  const maxX = Math.max(padPx, width - padPx)
  const maxY = Math.max(padPx, height - padPx)
  const minSepSq = minSepPx * minSepPx

  const maxPasses = N <= 512 ? 64 : 24
  for (let pass = 0; pass < maxPasses; pass++) {
    bucketHead.fill(-1)
    for (let i = 0; i < N; i++) {
      const cx = Math.floor(px[i]! / cellSize)
      const cy = Math.floor(py[i]! / cellSize)
      cellX[i] = cx
      cellY[i] = cy
      const h = (Math.imul(cx, 73856093) ^ Math.imul(cy, 19349663)) & HASH_MASK
      nextNode[i] = bucketHead[h]!
      bucketHead[h] = i
    }

    let moved = false
    for (let i = 0; i < N; i++) {
      const cx = cellX[i]!
      const cy = cellY[i]!
      const a = nodeList[i]!

      for (let dxCell = -1; dxCell <= 1; dxCell++) {
        const nx = cx + dxCell
        for (let dyCell = -1; dyCell <= 1; dyCell++) {
          const ny = cy + dyCell
          const h = (Math.imul(nx, 73856093) ^ Math.imul(ny, 19349663)) & HASH_MASK
          let j = bucketHead[h]!
          while (j !== -1) {
            if (j > i && cellX[j] === nx && cellY[j] === ny) {
              let dx = px[j]! - px[i]!
              let dy = py[j]! - py[i]!
              let distSq = dx * dx + dy * dy
              if (distSq < minSepSq) {
                moved = true
                if (distSq < 1e-9) {
                  const b = nodeList[j]!
                  const pairKey =
                    compareId(a.id, b.id) <= 0 ? `${a.id}\0${b.id}` : `${b.id}\0${a.id}`
                  const angle = (fnv1a32(pairKey) % 6283) / 1000
                  dx = Math.cos(angle)
                  dy = Math.sin(angle)
                  distSq = 1
                }
                const dist = Math.sqrt(distSq)
                const push = (minSepPx + 1e-2 - dist) * 0.5
                const ux = dx / dist
                const uy = dy / dist

                px[i] = clamp(px[i]! - ux * push, padPx, maxX)
                py[i] = clamp(py[i]! - uy * push, padPx, maxY)
                px[j] = clamp(px[j]! + ux * push, padPx, maxX)
                py[j] = clamp(py[j]! + uy * push, padPx, maxY)
              }
            }
            j = nextNode[j]!
          }
        }
      }
    }
    if (!moved) break
  }

  const safeW = Math.max(1, width)
  const safeH = Math.max(1, height)
  for (let i = 0; i < N; i++) {
    const n = nodeList[i]!
    n.x = px[i]!
    n.y = py[i]!
    n.nx = clamp(n.x / safeW, 0, 1)
    n.ny = clamp(n.y / safeH, 0, 1)
  }
}

export function computeFallback2DLayout(
  pack: PackDocument,
  index: GraphIndex,
  galaxyLayout?: GalaxyLayoutResult,
  options?: FallbackLayoutOptions
): Fallback2DLayout {
  const layout = galaxyLayout ?? computeGalaxyLayout(pack, index)
  const rawWidth = options?.width
  const width = Math.max(
    1,
    rawWidth !== undefined && Number.isFinite(rawWidth) ? rawWidth : 1000
  )
  const rawHeight = options?.height
  const height = Math.max(
    1,
    rawHeight !== undefined && Number.isFinite(rawHeight) ? rawHeight : 700
  )
  const rawPadding = options?.padding
  const padding = clamp(
    rawPadding !== undefined && Number.isFinite(rawPadding) ? rawPadding : 0.05,
    0,
    0.45
  )

  const focusIds =
    options?.focusClusterId !== undefined && options.focusClusterId !== null
      ? collectClusterSubtreeIds(options.focusClusterId, index)
      : null

  const visibleIds: string[] = []
  for (const n of pack.nodes) {
    if (!focusIds || focusIds.has(n.id)) {
      visibleIds.push(n.id)
    }
  }
  visibleIds.sort(compareId)

  // Compute XZ bounding box over visible nodes for affine projection
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity

  for (const id of visibleIds) {
    const pos = layout.positions.get(id)
    if (!pos) continue
    if (pos[0] < minX) minX = pos[0]
    if (pos[0] > maxX) maxX = pos[0]
    if (pos[2] < minZ) minZ = pos[2]
    if (pos[2] > maxZ) maxZ = pos[2]
  }

  const usable = 1 - 2 * padding
  const spanX = maxX - minX
  const spanZ = maxZ - minZ
  const span = Math.max(spanX, spanZ)
  const hasValidSpan = visibleIds.length > 0 && Number.isFinite(span) && span >= 1e-6

  const offsetX = hasValidSpan ? padding + (usable - (spanX / span) * usable) * 0.5 : 0.5
  const offsetZ = hasValidSpan ? padding + (usable - (spanZ / span) * usable) * 0.5 : 0.5

  const worldXZToNormalized = (wx: number, wz: number): Vec2 => {
    if (!hasValidSpan) return [0.5, 0.5]
    const nx = offsetX + ((wx - minX) / span) * usable
    const ny = offsetZ + ((wz - minZ) / span) * usable
    return [nx, ny]
  }

  const normalizedToWorldXZ = (nx: number, ny: number): [number, number] => {
    if (!hasValidSpan) {
      const cx = Number.isFinite(minX) ? minX : 0
      const cz = Number.isFinite(minZ) ? minZ : 0
      return [cx, cz]
    }
    const wx = minX + ((nx - offsetX) / usable) * span
    const wz = minZ + ((ny - offsetZ) / usable) * span
    return [wx, wz]
  }

  const nodes = new Map<string, FallbackNode2D>()
  const nodeList: FallbackNode2D[] = []

  for (const id of visibleIds) {
    const kn = index.nodesById.get(id)
    const pos = layout.positions.get(id)
    if (!kn || !pos) continue

    // When un-focused, match layout.projected2D identically if padding === 0.05
    const norm = !focusIds && Math.abs(padding - 0.05) < 1e-9
      ? (layout.projected2D.get(id) ?? worldXZToNormalized(pos[0], pos[2]))
      : worldXZToNormalized(pos[0], pos[2])

    const nx = norm[0]
    const ny = norm[1]
    const radius =
      kn.kind === 'branch'
        ? index.owningUnit(id) === undefined
          ? 12
          : 5
        : kn.kind === 'unit'
          ? 8
          : 3.5

    const clusterId = index.owningUnit(id) ?? index.owningBranch(id)
    const entry: FallbackNode2D = {
      id,
      x: nx * width,
      y: ny * height,
      nx,
      ny,
      radius,
      kind: kn.kind,
      domainId: kn.domainId,
      clusterId
    }
    nodes.set(id, entry)
    nodeList.push(entry)
  }

  const rawMinSep2D = options?.minSeparation2D
  if (rawMinSep2D !== undefined && Number.isFinite(rawMinSep2D) && rawMinSep2D > 0) {
    const padPx = padding * Math.min(width, height)
    relax2DSpatialHash(nodeList, rawMinSep2D, width, height, padPx)
  }

  const domainCentroids = new Map<string, FallbackDomainCentroid2D>()
  const scaleFactor = hasValidSpan ? (Math.min(width, height) * usable) / span : 1
  for (const [domainId, center] of layout.domainCenters) {
    const [nx, ny] = worldXZToNormalized(center[0], center[2])
    const worldR = layout.domainRadii.get(domainId) ?? 12
    domainCentroids.set(domainId, {
      domainId,
      nx,
      ny,
      x: nx * width,
      y: ny * height,
      radius: Math.max(12, worldR * scaleFactor)
    })
  }

  const edges: FallbackEdge2D[] = []
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

  return {
    width,
    height,
    padding,
    nodes,
    edges,
    domainCentroids,
    worldXZToNormalized,
    normalizedToWorldXZ
  }
}
