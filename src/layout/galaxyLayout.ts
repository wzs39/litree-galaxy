import type { GraphIndex, KnowledgeNode, PackDocument } from '../core/types'

export type Vec3 = [number, number, number]
export type Vec2 = [number, number]

export interface GalaxyBounds {
  min: Vec3
  max: Vec3
  center: Vec3
  radius: number
}

export interface ClusterMeta {
  id: string
  kind: 'branch' | 'unit'
  domainId: string
  center: Vec3
  radius: number
  nodeCount: number
}

export interface GalaxyLayoutOptions {
  /** Minimum separation for leaf/general nodes in 3D world units (default: 1.05) */
  minSeparation?: number
  /** Minimum separation between unit anchors (default: 9.5 * packScale) */
  unitMinSeparation?: number
  /** Optional explicit spiral arm count override */
  armCount?: number
  /** Logarithmic spiral twist factor (default: 0.42) */
  spiralTwist?: number
}

export interface GalaxyLayoutResult {
  packId: string
  positions: Map<string, Vec3>
  domainCenters: Map<string, Vec3>
  domainRadii: Map<string, number>
  clusterMetas: Map<string, ClusterMeta>
  nodeRadii: Map<string, number>
  bounds: GalaxyBounds
  projected2D: Map<string, Vec2>
}

const GOLDEN_ANGLE = 2.399963229728653

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createNodeRng(packId: string, nodeId: string, salt = ''): () => number {
  return mulberry32(fnv1a32(`${packId}\0${nodeId}\0${salt}`))
}

export function isFiniteVec3(value: unknown): value is Vec3 {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    typeof value[2] === 'number' &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1]) &&
    Number.isFinite(value[2])
  )
}

function sanitizeVec3(v: Vec3, fallback: Vec3 = [0, 0, 0]): Vec3 {
  return [
    Number.isFinite(v[0]) ? v[0] : fallback[0],
    Number.isFinite(v[1]) ? v[1] : fallback[1],
    Number.isFinite(v[2]) ? v[2] : fallback[2]
  ]
}

export function project3DTo2DNormalized(
  positions: ReadonlyMap<string, Vec3>,
  padding = 0.05
): Map<string, Vec2> {
  const out = new Map<string, Vec2>()
  if (positions.size === 0) return out

  const safePadding = Number.isFinite(padding) ? padding : 0.05
  const pad = clamp(safePadding, 0, 0.45)
  const usable = 1 - 2 * pad

  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity

  for (const pos of positions.values()) {
    const x = pos[0]
    const z = pos[2]
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (z < minZ) minZ = z
    if (z > maxZ) maxZ = z
  }

  const spanX = maxX - minX
  const spanZ = maxZ - minZ
  const span = Math.max(spanX, spanZ)

  if (!Number.isFinite(span) || span < 1e-6) {
    for (const id of positions.keys()) {
      out.set(id, [0.5, 0.5])
    }
    return out
  }

  const offsetX = pad + (usable - (spanX / span) * usable) * 0.5
  const offsetZ = pad + (usable - (spanZ / span) * usable) * 0.5

  for (const [id, pos] of positions) {
    const nx = clamp(offsetX + ((pos[0] - minX) / span) * usable, pad, 1 - pad)
    const ny = clamp(offsetZ + ((pos[2] - minZ) / span) * usable, pad, 1 - pad)
    out.set(id, [nx, ny])
  }

  return out
}

function deterministicUnitVec3(packId: string, keyA: string, keyB: string): Vec3 {
  const pairKey = compareId(keyA, keyB) <= 0 ? `${keyA}\0${keyB}` : `${keyB}\0${keyA}`
  const rng = createNodeRng(packId, pairKey, 'sep')
  const theta = rng() * Math.PI * 2
  const z = rng() * 2 - 1
  const rXY = Math.sqrt(Math.max(0, 1 - z * z))
  return [rXY * Math.cos(theta), z, rXY * Math.sin(theta)]
}

function deterministicPerpVec3(
  packId: string,
  keyA: string,
  keyB: string,
  ux: number,
  uy: number,
  uz: number
): Vec3 {
  const rand = deterministicUnitVec3(packId, `${keyA}:perp`, keyB)
  const dot = rand[0] * ux + rand[1] * uy + rand[2] * uz
  let px = rand[0] - dot * ux
  let py = rand[1] - dot * uy
  let pz = rand[2] - dot * uz
  let pLen = Math.hypot(px, py, pz)
  if (pLen < 1e-4) {
    const ax = Math.abs(ux) < 0.8 ? 1 : 0
    const ay = Math.abs(ux) < 0.8 ? 0 : 1
    px = -uz * ay
    py = uz * ax
    pz = ux * ay - uy * ax
    pLen = Math.hypot(px, py, pz)
    if (pLen < 1e-12) return [0, 1, 0]
  }
  return [px / pLen, py / pLen, pz / pLen]
}

function buildOrbitalBasis(packId: string, ownerId: string): {
  u: Vec3
  v: Vec3
  w: Vec3
  phase: number
} {
  const rng = createNodeRng(packId, ownerId, 'orbit')
  const yaw = rng() * Math.PI * 2
  const tiltDeg = 15 + rng() * 30 // [15 deg, 45 deg] so XZ projection stays clear
  const tilt = (tiltDeg * Math.PI) / 180
  const phase = rng() * Math.PI * 2

  const cosY = Math.cos(yaw)
  const sinY = Math.sin(yaw)
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)

  // Start with horizontal basis (1,0,0), (0,0,1), up (0,1,0), rotate around Z/X tilt then Y yaw
  const u: Vec3 = [cosY, 0, -sinY]
  const v: Vec3 = [sinY * cosT, sinT, cosY * cosT]
  const w: Vec3 = [-sinY * sinT, cosT, -cosY * sinT]
  return { u, v, w, phase }
}

/**
 * Computes a deterministic, order-independent 3D semantic galaxy layout for a PackDocument.
 *
 * - Domain order follows `pack.domains` (any orphan `node.domainId` appended lexicographically).
 * - Node/edge array order in `pack.nodes` and `pack.edges` does NOT affect coordinates.
 * - Structural `branch` nodes (`index.owningUnit(id) === undefined`) sit in domain halos;
 *   chapter `branch` nodes (`index.owningUnit(id) !== undefined`) stay inside their owning `unit` shell.
 * - Valid finite `node.position3D` coordinates are pinned and preserved verbatim.
 */
export function computeGalaxyLayout(
  pack: PackDocument,
  index: GraphIndex,
  options?: GalaxyLayoutOptions
): GalaxyLayoutResult {
  const positions = new Map<string, Vec3>()
  const domainCenters = new Map<string, Vec3>()
  const domainRadii = new Map<string, number>()
  const clusterMetas = new Map<string, ClusterMeta>()
  const nodeRadii = new Map<string, number>()

  if (pack.nodes.length === 0) {
    return {
      packId: pack.id,
      positions,
      domainCenters,
      domainRadii,
      clusterMetas,
      nodeRadii,
      bounds: {
        min: [0, 0, 0],
        max: [0, 0, 0],
        center: [0, 0, 0],
        radius: 1
      },
      projected2D: new Map<string, Vec2>()
    }
  }

  const packScale = clamp(
    0.45 + 0.55 * (Math.log10(Math.max(10, pack.nodes.length)) / 4),
    0.45,
    1.0
  )
  const rawMinSep = options?.minSeparation
  const minSep = Math.max(
    0.25,
    rawMinSep !== undefined && Number.isFinite(rawMinSep) ? rawMinSep : 1.05
  )
  const rawUnitMinSep = options?.unitMinSeparation
  const unitMinSep = Math.max(
    minSep * 2,
    rawUnitMinSep !== undefined && Number.isFinite(rawUnitMinSep)
      ? rawUnitMinSep
      : 9.5 * packScale
  )
  const anchorBranchSep = Math.max(minSep * 2, 4.0 * packScale)

  // 1. Ordered domains (pack.domains order + sorted defensive orphan domainIds)
  const orderedDomains: string[] = []
  const seenDomains = new Set<string>()
  for (const d of pack.domains) {
    if (!seenDomains.has(d.id)) {
      seenDomains.add(d.id)
      orderedDomains.push(d.id)
    }
  }
  const extraDomains: string[] = []
  for (const n of pack.nodes) {
    if (!seenDomains.has(n.domainId)) {
      seenDomains.add(n.domainId)
      extraDomains.push(n.domainId)
    }
  }
  extraDomains.sort(compareId)
  orderedDomains.push(...extraDomains)

  // 2. Domain 3D logarithmic spiral arm centers
  const D = orderedDomains.length
  if (D === 1) {
    const d0 = orderedDomains[0]
    if (d0 !== undefined) domainCenters.set(d0, [0, 0, 0])
  } else if (D >= 2) {
    const defaultArms = D <= 3 ? D : Math.min(4, Math.max(3, Math.round(Math.sqrt(D))))
    const rawArmCount = options?.armCount
    const arms = Math.max(
      1,
      Math.floor(
        rawArmCount !== undefined && Number.isFinite(rawArmCount) ? rawArmCount : defaultArms
      )
    )
    const R0 = 66 * packScale
    const Rstep = 66 * packScale
    const rawTwist = options?.spiralTwist
    const twist = rawTwist !== undefined && Number.isFinite(rawTwist) ? rawTwist : 0.42
    const yAmp = 14 * packScale
    const packPhase = (fnv1a32(pack.id) % 628) / 100

    for (let i = 0; i < D; i++) {
      const domainId = orderedDomains[i]!
      const arm = i % arms
      const ring = Math.floor(i / arms)
      const rng = createNodeRng(pack.id, domainId, 'domain')
      const r = R0 + Rstep * (ring + 0.18 * (arm / arms)) + (rng() - 0.5) * 6 * packScale
      const theta =
        (2 * Math.PI * arm) / arms + twist * Math.log(1 + r / R0) + (rng() - 0.5) * 0.12
      const x = r * Math.cos(theta)
      const z = r * Math.sin(theta)
      const y =
        yAmp * Math.sin(2 * theta + packPhase) * (0.6 + 0.4 * rng()) + (rng() - 0.5) * 4 * packScale
      domainCenters.set(domainId, sanitizeVec3([x, y, z]))
    }
  }

  // 3. Partition nodes by semantic role and pin finite position3D overrides
  const structuralBranches: KnowledgeNode[] = []
  const chapterBranches: KnowledgeNode[] = []
  const units: KnowledgeNode[] = []
  const leaves: KnowledgeNode[] = []
  const pinnedIds = new Set<string>()

  const allNodesSorted = [...pack.nodes].sort((a, b) => compareId(a.id, b.id))
  for (const node of allNodesSorted) {
    if (isFiniteVec3(node.position3D)) {
      pinnedIds.add(node.id)
      positions.set(node.id, [node.position3D[0], node.position3D[1], node.position3D[2]])
    }
    if (node.kind === 'branch') {
      if (index.owningUnit(node.id) === undefined) {
        structuralBranches.push(node)
        nodeRadii.set(node.id, 2.2 * packScale)
      } else {
        chapterBranches.push(node)
        nodeRadii.set(node.id, 0.85)
      }
    } else if (node.kind === 'unit') {
      units.push(node)
      nodeRadii.set(node.id, 1.45 * packScale)
    } else {
      leaves.push(node)
      nodeRadii.set(node.id, 0.45)
    }
  }

  // 4. Place structural branches in domain halos
  const structByDomain = new Map<string, KnowledgeNode[]>()
  for (const b of structuralBranches) {
    let arr = structByDomain.get(b.domainId)
    if (!arr) {
      arr = []
      structByDomain.set(b.domainId, arr)
    }
    arr.push(b)
  }

  for (const [domainId, list] of structByDomain) {
    const center = domainCenters.get(domainId) ?? [0, 0, 0]
    const M = list.length
    for (let k = 0; k < M; k++) {
      const b = list[k]!
      if (pinnedIds.has(b.id)) continue
      if (M === 1) {
        positions.set(b.id, [center[0], center[1] + 5.5 * packScale, center[2]])
      } else {
        const rng = createNodeRng(pack.id, b.id, 'branch')
        const ringR = 4.5 * packScale
        const angle = (2 * Math.PI * k) / M + rng() * 0.25
        const yOff = (4.5 + (k % 2) * 2.0) * packScale
        positions.set(b.id, [
          center[0] + ringR * Math.cos(angle),
          center[1] + yOff,
          center[2] + ringR * Math.sin(angle)
        ])
      }
    }
  }

  // 5. Place unit nodes via topological DAG depth + owningBranch clustering
  const unitsByDomain = new Map<string, KnowledgeNode[]>()
  for (const u of units) {
    let arr = unitsByDomain.get(u.domainId)
    if (!arr) {
      arr = []
      unitsByDomain.set(u.domainId, arr)
    }
    arr.push(u)
  }

  for (const [domainId, domUnits] of unitsByDomain) {
    const center = domainCenters.get(domainId) ?? [0, 0, 0]
    const baseAngle = Math.atan2(center[2], center[0])
    const Rdom = Math.max(12 * packScale, Math.sqrt(domUnits.length) * 6.8 * packScale)

    let minDepth = Infinity
    let maxDepth = -Infinity
    const byDepth = new Map<number, KnowledgeNode[]>()

    for (const u of domUnits) {
      const dRaw = index.dagDepthOf(u.id)
      const d = Number.isFinite(dRaw) ? dRaw : 0
      if (d < minDepth) minDepth = d
      if (d > maxDepth) maxDepth = d
      let bucket = byDepth.get(d)
      if (!bucket) {
        bucket = []
        byDepth.set(d, bucket)
      }
      bucket.push(u)
    }

    const sortedDepths = [...byDepth.keys()].sort((a, b) => a - b)
    for (const d of sortedDepths) {
      const bucket = byDepth.get(d)!
      bucket.sort((a, b) => {
        const ba = index.owningBranch(a.id) ?? ''
        const bb = index.owningBranch(b.id) ?? ''
        const cmp = compareId(ba, bb)
        return cmp !== 0 ? cmp : compareId(a.id, b.id)
      })
      const K = bucket.length
      const depthNorm = maxDepth > minDepth ? (d - minDepth) / (maxDepth - minDepth) : 0.5

      for (let k = 0; k < K; k++) {
        const u = bucket[k]!
        if (pinnedIds.has(u.id)) continue
        const rng = createNodeRng(pack.id, u.id, 'unit')
        const localR = (0.18 + 0.82 * depthNorm) * Rdom + (rng() - 0.5) * 2.2 * packScale
        const localAngle =
          baseAngle +
          ((k + 0.5) / K - 0.5) * (Math.PI * 1.35) +
          d * GOLDEN_ANGLE +
          (rng() - 0.5) * 0.25
        const localY = (depthNorm - 0.5) * 8.0 * packScale + (rng() - 0.5) * 4.5 * packScale

        positions.set(
          u.id,
          sanitizeVec3([
            center[0] + localR * Math.cos(localAngle),
            center[1] + localY,
            center[2] + localR * Math.sin(localAngle)
          ])
        )
      }
    }
  }

  // 6. Pass A: Anchor separation relaxation (structural branches + units, respecting pinned non-anchors)
  const anchors = [...structuralBranches, ...units].sort((a, b) => compareId(a.id, b.id))
  const pinnedNonAnchors = [...chapterBranches, ...leaves]
    .filter((n) => pinnedIds.has(n.id))
    .sort((a, b) => compareId(a.id, b.id))
  const anchorNonAnchorReq = Math.max(minSep, 1.25)

  const relaxAnchors = (passes: number): boolean => {
    let anyMoved = false
    for (let pass = 0; pass < passes; pass++) {
      let moved = false
      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i]!
        const posA = positions.get(a.id)!
        const pinA = pinnedIds.has(a.id)
        for (let j = i + 1; j < anchors.length; j++) {
          const b = anchors[j]!
          const pinB = pinnedIds.has(b.id)
          if (pinA && pinB) continue

          const posB = positions.get(b.id)!
          const req = a.kind === 'unit' && b.kind === 'unit' ? unitMinSep : anchorBranchSep
          let dx = posB[0] - posA[0]
          let dy = posB[1] - posA[1]
          let dz = posB[2] - posA[2]
          let distSq = dx * dx + dy * dy + dz * dz
          if (distSq >= req * req) continue

          moved = true
          anyMoved = true
          if (distSq < 1e-12) {
            const dir = deterministicUnitVec3(pack.id, a.id, b.id)
            dx = dir[0]
            dy = dir[1]
            dz = dir[2]
            distSq = 1
          }
          const dist = Math.sqrt(distSq)
          const push = req + 1e-3 - dist
          const ux = dx / dist
          const uy = dy / dist
          const uz = dz / dist

          if (!pinA && !pinB) {
            const half = push * 0.5
            posA[0] -= ux * half
            posA[1] -= uy * half
            posA[2] -= uz * half
            posB[0] += ux * half
            posB[1] += uy * half
            posB[2] += uz * half
          } else if (pinA) {
            posB[0] += ux * push
            posB[1] += uy * push
            posB[2] += uz * push
          } else {
            posA[0] -= ux * push
            posA[1] -= uy * push
            posA[2] -= uz * push
          }
        }
      }

      if (pinnedNonAnchors.length > 0) {
        const reqSq = anchorNonAnchorReq * anchorNonAnchorReq
        for (let i = 0; i < anchors.length; i++) {
          const a = anchors[i]!
          if (pinnedIds.has(a.id)) continue
          const posA = positions.get(a.id)!
          for (let k = 0; k < pinnedNonAnchors.length; k++) {
            const pNode = pinnedNonAnchors[k]!
            const posP = positions.get(pNode.id)!
            let dx = posA[0] - posP[0]
            let dy = posA[1] - posP[1]
            let dz = posA[2] - posP[2]
            let distSq = dx * dx + dy * dy + dz * dz
            if (distSq >= reqSq) continue

            moved = true
            anyMoved = true
            if (distSq < 1e-12) {
              const dir = deterministicUnitVec3(pack.id, a.id, pNode.id)
              dx = dir[0]
              dy = dir[1]
              dz = dir[2]
              distSq = 1
            }
            const dist = Math.sqrt(distSq)
            const push = anchorNonAnchorReq + 2e-3 - dist
            const ux = dx / dist
            const uy = dy / dist
            const uz = dz / dist

            posA[0] += ux * push
            posA[1] += uy * push
            posA[2] += uz * push

            if (pass >= 1) {
              const perp = deterministicPerpVec3(pack.id, a.id, pNode.id, ux, uy, uz)
              const lateral = push * 0.45
              posA[0] += perp[0] * lateral
              posA[1] += perp[1] * lateral
              posA[2] += perp[2] * lateral
            }
          }
        }
      }

      if (!moved) break
    }
    return anyMoved
  }
  relaxAnchors(16)

  // 7. Pass B: Leaf satellites orbiting owningUnit (or owningBranch / domain center)
  const leavesByOwner = new Map<string, KnowledgeNode[]>()
  for (const leaf of leaves) {
    const owner =
      index.owningUnit(leaf.id) ??
      index.owningBranch(leaf.id) ??
      `__domain__\0${leaf.domainId}`
    let list = leavesByOwner.get(owner)
    if (!list) {
      list = []
      leavesByOwner.set(owner, list)
    }
    list.push(leaf)
  }

  const ownerKeys = [...leavesByOwner.keys()].sort(compareId)
  const scaleMul = Math.max(1, minSep / 1.05)

  for (const ownerKey of ownerKeys) {
    const group = leavesByOwner.get(ownerKey)!
    group.sort((a, b) => {
      const cmpParent = compareId(a.parentId ?? '', b.parentId ?? '')
      return cmpParent !== 0 ? cmpParent : compareId(a.id, b.id)
    })

    let anchorPos: Vec3 | undefined
    if (ownerKey.startsWith('__domain__\0')) {
      const domId = ownerKey.slice('__domain__\0'.length)
      anchorPos = domainCenters.get(domId)
    } else {
      anchorPos = positions.get(ownerKey)
    }
    const basePos: Vec3 = anchorPos ?? [0, 0, 0]
    const basis = buildOrbitalBasis(pack.id, ownerKey)
    const L = group.length

    if (L <= 12) {
      const ringR = Math.max(minSep * 2.1, (2.4 + 0.16 * L) * scaleMul)
      for (let idx = 0; idx < L; idx++) {
        const leaf = group[idx]!
        if (pinnedIds.has(leaf.id)) continue
        const rng = createNodeRng(pack.id, leaf.id, 'leaf')
        const angle = (2 * Math.PI * idx) / L + basis.phase
        const cosA = Math.cos(angle)
        const sinA = Math.sin(angle)
        const bob = (rng() - 0.5) * 0.45 * scaleMul
        const ox = ringR * (cosA * basis.u[0] + sinA * basis.v[0]) + bob * basis.w[0]
        const oy = ringR * (cosA * basis.u[1] + sinA * basis.v[1]) + bob * basis.w[1]
        const oz = ringR * (cosA * basis.u[2] + sinA * basis.v[2]) + bob * basis.w[2]
        positions.set(leaf.id, sanitizeVec3([basePos[0] + ox, basePos[1] + oy, basePos[2] + oz]))
      }
    } else {
      let placed = 0
      let shell = 0
      while (placed < L) {
        const cap = 12 + 12 * shell
        const countInShell = Math.min(cap, L - placed)
        const shellR = Math.max(minSep * 2.2, (2.75 + 1.5 * shell) * scaleMul)

        for (let j = 0; j < countInShell; j++) {
          const leaf = group[placed + j]!
          if (pinnedIds.has(leaf.id)) continue
          const zLocal = countInShell === 1 ? 0 : (1 - (2 * (j + 0.5)) / countInShell) * 0.68
          const rXY = Math.sqrt(Math.max(0, 1 - zLocal * zLocal))
          const phi = GOLDEN_ANGLE * j + shell * 1.1 + basis.phase
          const lx = rXY * Math.cos(phi) * shellR
          const ly = zLocal * shellR
          const lz = rXY * Math.sin(phi) * shellR

          const ox = lx * basis.u[0] + lz * basis.v[0] + ly * basis.w[0]
          const oy = lx * basis.u[1] + lz * basis.v[1] + ly * basis.w[1]
          const oz = lx * basis.u[2] + lz * basis.v[2] + ly * basis.w[2]
          positions.set(leaf.id, sanitizeVec3([basePos[0] + ox, basePos[1] + oy, basePos[2] + oz]))
        }

        placed += countInShell
        shell++
      }
    }
  }

  // 8. Place chapter branches inside their owningUnit shell near their child leaves
  const leavesByDirectParent = new Map<string, KnowledgeNode[]>()
  for (const leaf of leaves) {
    if (leaf.parentId === null) continue
    let list = leavesByDirectParent.get(leaf.parentId)
    if (!list) {
      list = []
      leavesByDirectParent.set(leaf.parentId, list)
    }
    list.push(leaf)
  }

  const chapterIndexPerUnit = new Map<string, number>()
  for (const ch of chapterBranches) {
    if (pinnedIds.has(ch.id)) continue
    const uid = index.owningUnit(ch.id)
    const unitPos: Vec3 = (uid !== undefined ? positions.get(uid) : undefined) ?? [0, 0, 0]
    const childLeaves = leavesByDirectParent.get(ch.id)
    const minChapterR = Math.max(minSep * 1.35, 1.5)

    let placedPos: Vec3 | null = null
    if (childLeaves && childLeaves.length > 0) {
      let sx = 0
      let sy = 0
      let sz = 0
      let count = 0
      for (const cl of childLeaves) {
        const lp = positions.get(cl.id)
        if (lp) {
          sx += lp[0]
          sy += lp[1]
          sz += lp[2]
          count++
        }
      }
      if (count > 0) {
        const dx = sx / count - unitPos[0]
        const dy = sy / count - unitPos[1]
        const dz = sz / count - unitPos[2]
        const len = Math.hypot(dx, dy, dz)
        if (len > 1e-4) {
          const r = Math.max(minChapterR, Math.min(len * 0.55, Math.max(minChapterR, 2.2)))
          placedPos = [
            unitPos[0] + (dx / len) * r,
            unitPos[1] + (dy / len) * r,
            unitPos[2] + (dz / len) * r
          ]
        }
      }
    }

    if (!placedPos) {
      const key = uid ?? '__root__'
      const idx = chapterIndexPerUnit.get(key) ?? 0
      chapterIndexPerUnit.set(key, idx + 1)
      const angle = idx * GOLDEN_ANGLE
      const r =
        idx < 8
          ? minChapterR
          : minChapterR + Math.sqrt(idx - 7) * Math.max(minSep, 1.05) * 0.9
      const yLayers = idx < 8 ? 3 : 5
      const yStep = idx < 8 ? Math.max(0.35, minSep * 0.33) : Math.max(0.5, minSep * 0.55)
      placedPos = [
        unitPos[0] + r * Math.cos(angle),
        unitPos[1] + ((idx % yLayers) - (yLayers - 1) * 0.5) * yStep,
        unitPos[2] + r * Math.sin(angle)
      ]
    }
    positions.set(ch.id, sanitizeVec3(placedPos))
  }

  // 9. Pass C: O(N) amortized sparse 3D spatial-hash min-separation relaxation
  const orderedNodes = allNodesSorted
  const N = orderedNodes.length
  const px = new Float64Array(N)
  const py = new Float64Array(N)
  const pz = new Float64Array(N)
  const isPinned = new Uint8Array(N)
  const isAnchor = new Uint8Array(N) // structural branch or unit
  const isUnit = new Uint8Array(N)

  for (let i = 0; i < N; i++) {
    const n = orderedNodes[i]!
    const p = positions.get(n.id) ?? [0, 0, 0]
    px[i] = p[0]
    py[i] = p[1]
    pz[i] = p[2]
    isPinned[i] = pinnedIds.has(n.id) ? 1 : 0
    if (n.kind === 'unit') {
      isUnit[i] = 1
      isAnchor[i] = 1
    } else if (n.kind === 'branch' && index.owningUnit(n.id) === undefined) {
      isAnchor[i] = 1
    }
  }

  const cellSize = Math.max(minSep, 1.25)
  const HASH_SIZE = 32768
  const HASH_MASK = HASH_SIZE - 1
  const bucketHead = new Int32Array(HASH_SIZE)
  const nextNode = new Int32Array(N)
  const cellX = new Int32Array(N)
  const cellY = new Int32Array(N)
  const cellZ = new Int32Array(N)

  const runPassC = (passes: number, lockAnchors: boolean): void => {
    for (let i = 0; i < N; i++) {
      const n = orderedNodes[i]!
      const p = positions.get(n.id) ?? [0, 0, 0]
      px[i] = p[0]
      py[i] = p[1]
      pz[i] = p[2]
    }

    for (let pass = 0; pass < passes; pass++) {
      bucketHead.fill(-1)

      for (let i = 0; i < N; i++) {
        const ix = Math.floor(px[i]! / cellSize)
        const iy = Math.floor(py[i]! / cellSize)
        const iz = Math.floor(pz[i]! / cellSize)
        cellX[i] = ix
        cellY[i] = iy
        cellZ[i] = iz
        const h =
          (Math.imul(ix, 73856093) ^ Math.imul(iy, 19349663) ^ Math.imul(iz, 83492791)) & HASH_MASK
        nextNode[i] = bucketHead[h]!
        bucketHead[h] = i
      }

      let moved = false
      for (let i = 0; i < N; i++) {
        const ix = cellX[i]!
        const iy = cellY[i]!
        const iz = cellZ[i]!
        const anchorI = isAnchor[i] === 1
        const pinI = isPinned[i] === 1 || (lockAnchors && anchorI)

        for (let dxCell = -1; dxCell <= 1; dxCell++) {
          const nx = ix + dxCell
          for (let dyCell = -1; dyCell <= 1; dyCell++) {
            const ny = iy + dyCell
            for (let dzCell = -1; dzCell <= 1; dzCell++) {
              const nz = iz + dzCell
              const h =
                (Math.imul(nx, 73856093) ^ Math.imul(ny, 19349663) ^ Math.imul(nz, 83492791)) &
                HASH_MASK
              let j = bucketHead[h]!
              while (j !== -1) {
                if (j > i && cellX[j] === nx && cellY[j] === ny && cellZ[j] === nz) {
                  const anchorJ = isAnchor[j] === 1
                  const pinJ = isPinned[j] === 1 || (lockAnchors && anchorJ)
                  if (!(pinI && pinJ)) {
                    const req =
                      isUnit[i] === 1 && isUnit[j] === 1
                        ? unitMinSep
                        : !anchorI && !anchorJ
                          ? minSep
                          : Math.max(minSep, 1.25)

                    let dx = px[j]! - px[i]!
                    let dy = py[j]! - py[i]!
                    let dz = pz[j]! - pz[i]!
                    let distSq = dx * dx + dy * dy + dz * dz
                    if (distSq < req * req) {
                      moved = true
                      if (distSq < 1e-12) {
                        const dir = deterministicUnitVec3(
                          pack.id,
                          orderedNodes[i]!.id,
                          orderedNodes[j]!.id
                        )
                        dx = dir[0]
                        dy = dir[1]
                        dz = dir[2]
                        distSq = 1
                      }
                      const dist = Math.sqrt(distSq)
                      const push = req + 2e-3 - dist
                      const ux = dx / dist
                      const uy = dy / dist
                      const uz = dz / dist

                      // Keep anchor nodes (units / structural branches) steady when separating against leaves/chapters
                      if (!pinI && !pinJ) {
                        if (anchorI && !anchorJ) {
                          px[j]! += ux * push
                          py[j]! += uy * push
                          pz[j]! += uz * push
                        } else if (!anchorI && anchorJ) {
                          px[i]! -= ux * push
                          py[i]! -= uy * push
                          pz[i]! -= uz * push
                        } else {
                          const half = push * 0.5
                          px[i]! -= ux * half
                          py[i]! -= uy * half
                          pz[i]! -= uz * half
                          px[j]! += ux * half
                          py[j]! += uy * half
                          pz[j]! += uz * half
                        }
                      } else if (pinI) {
                        px[j]! += ux * push
                        py[j]! += uy * push
                        pz[j]! += uz * push
                      } else {
                        px[i]! -= ux * push
                        py[i]! -= uy * push
                        pz[i]! -= uz * push
                      }
                    }
                  }
                }
                j = nextNode[j]!
              }
            }
          }
        }
      }

      if (!moved) break
    }

    // Write back relaxed coordinates and run zero-NaN final sweep
    for (let i = 0; i < N; i++) {
      const id = orderedNodes[i]!.id
      positions.set(id, sanitizeVec3([px[i]!, py[i]!, pz[i]!]))
    }
  }

  runPassC(24, false)

  // Final anchor separation check in case any non-pinned anchors were nudged by pinned neighbors
  const postMoved = relaxAnchors(6)
  for (const a of anchors) {
    const p = positions.get(a.id)
    if (p) positions.set(a.id, sanitizeVec3(p))
  }
  if (postMoved) {
    runPassC(8, true)
  }

  // 10. Compute bounds, domainRadii, clusterMetas, projected2D
  let minX = Infinity
  let minY = Infinity
  let minZ = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity

  for (const pos of positions.values()) {
    if (pos[0] < minX) minX = pos[0]
    if (pos[1] < minY) minY = pos[1]
    if (pos[2] < minZ) minZ = pos[2]
    if (pos[0] > maxX) maxX = pos[0]
    if (pos[1] > maxY) maxY = pos[1]
    if (pos[2] > maxZ) maxZ = pos[2]
  }

  const center: Vec3 = [
    (minX + maxX) * 0.5,
    (minY + maxY) * 0.5,
    (minZ + maxZ) * 0.5
  ]
  let maxR = 1
  for (const pos of positions.values()) {
    const d = Math.hypot(pos[0] - center[0], pos[1] - center[1], pos[2] - center[2])
    if (d > maxR) maxR = d
  }

  const bounds: GalaxyBounds = {
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ],
    center,
    radius: maxR
  }

  for (const domainId of orderedDomains) {
    domainRadii.set(domainId, 12 * packScale)
  }
  for (const n of orderedNodes) {
    const p = positions.get(n.id)!
    const dc = domainCenters.get(n.domainId)
    if (!dc) continue
    const dist = Math.hypot(p[0] - dc[0], p[1] - dc[1], p[2] - dc[2])
    const prev = domainRadii.get(n.domainId) ?? 12 * packScale
    if (dist + 1.5 > prev) domainRadii.set(n.domainId, dist + 1.5)
  }

  for (const u of units) {
    const uPos = positions.get(u.id)!
    const unitLeaves = index.leavesOf(u.id)
    const unitChapters = index.chaptersOf(u.id)
    let r = 3.0
    for (const l of unitLeaves) {
      const lp = positions.get(l.id)
      if (!lp) continue
      const d = Math.hypot(lp[0] - uPos[0], lp[1] - uPos[1], lp[2] - uPos[2]) + 0.6
      if (d > r) r = d
    }
    for (const ch of unitChapters) {
      const cp = positions.get(ch.id)
      if (!cp) continue
      const d = Math.hypot(cp[0] - uPos[0], cp[1] - uPos[1], cp[2] - uPos[2]) + 0.8
      if (d > r) r = d
    }
    clusterMetas.set(u.id, {
      id: u.id,
      kind: 'unit',
      domainId: u.domainId,
      center: [uPos[0], uPos[1], uPos[2]],
      radius: r,
      nodeCount: 1 + unitLeaves.length + unitChapters.length
    })
  }

  for (const b of structuralBranches) {
    const bPos = positions.get(b.id)!
    const descUnits = index.unitsOf(b.id)
    const descLeaves = index.leavesOf(b.id)
    let r = 5.0 * packScale
    for (const u of descUnits) {
      const up = positions.get(u.id)
      if (!up) continue
      const uMeta = clusterMetas.get(u.id)
      const d = Math.hypot(up[0] - bPos[0], up[1] - bPos[1], up[2] - bPos[2]) + (uMeta?.radius ?? 3.0)
      if (d > r) r = d
    }
    for (const l of descLeaves) {
      const lp = positions.get(l.id)
      if (!lp) continue
      const d = Math.hypot(lp[0] - bPos[0], lp[1] - bPos[1], lp[2] - bPos[2]) + 0.6
      if (d > r) r = d
    }
    clusterMetas.set(b.id, {
      id: b.id,
      kind: 'branch',
      domainId: b.domainId,
      center: [bPos[0], bPos[1], bPos[2]],
      radius: r,
      nodeCount: 1 + descUnits.length + descLeaves.length
    })
  }

  const projected2D = project3DTo2DNormalized(positions, 0.05)

  return {
    packId: pack.id,
    positions,
    domainCenters,
    domainRadii,
    clusterMetas,
    nodeRadii,
    bounds,
    projected2D
  }
}
