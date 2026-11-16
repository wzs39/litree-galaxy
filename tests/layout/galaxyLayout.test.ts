import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildGraphIndex } from '../../src/core/graph'
import { normalizePackToV2 } from '../../src/core/schema'
import type { KnowledgeNode, PackDocument } from '../../src/core/types'
import { computeGalaxyLayout, project3DTo2DNormalized } from '../../src/layout/galaxyLayout'

function loadPack(file: string): PackDocument {
  const raw = JSON.parse(readFileSync(join(process.cwd(), 'resources/packs', file), 'utf-8'))
  const res = normalizePackToV2(raw)
  if (!res.ok) throw new Error(`Failed to normalize ${file}: ${res.errors.join(', ')}`)
  return res.pack
}

const devMiniPack = loadPack('dev-mini.json')
const devMiniIndex = buildGraphIndex(devMiniPack)

const csMathPack = loadPack('cs-math.json')
const csMathIndex = buildGraphIndex(csMathPack)

function deterministicShuffle<T>(arr: readonly T[], seed: number): T[] {
  const out = [...arr]
  let s = seed >>> 0
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const j = s % (i + 1)
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return out
}

function minPairwiseDistanceSpatial(
  positions: ReadonlyMap<string, [number, number, number]>,
  ids: readonly string[],
  cellSize: number
): number {
  const cells = new Map<string, number[]>()
  for (let i = 0; i < ids.length; i++) {
    const p = positions.get(ids[i]!)!
    const ix = Math.floor(p[0] / cellSize)
    const iy = Math.floor(p[1] / cellSize)
    const iz = Math.floor(p[2] / cellSize)
    const key = `${ix},${iy},${iz}`
    let list = cells.get(key)
    if (!list) {
      list = []
      cells.set(key, list)
    }
    list.push(i)
  }

  let minDist = Infinity
  for (let i = 0; i < ids.length; i++) {
    const pa = positions.get(ids[i]!)!
    const ix = Math.floor(pa[0] / cellSize)
    const iy = Math.floor(pa[1] / cellSize)
    const iz = Math.floor(pa[2] / cellSize)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const list = cells.get(`${ix + dx},${iy + dy},${iz + dz}`)
          if (!list) continue
          for (const j of list) {
            if (j <= i) continue
            const pb = positions.get(ids[j]!)!
            const d = Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2])
            if (d < minDist) minDist = d
          }
        }
      }
    }
  }
  return minDist
}

describe('galaxyLayout (F6)', () => {
  it('T1: dev-mini.json invariants, bounds, and normalized projected2D', () => {
    const layout = computeGalaxyLayout(devMiniPack, devMiniIndex)
    expect(layout.positions.size).toBe(11)
    expect(layout.domainCenters.size).toBe(2)
    expect(layout.projected2D.size).toBe(11)
    expect(layout.bounds.radius).toBeGreaterThan(0)

    for (const [id, pos] of layout.positions) {
      expect(Number.isFinite(pos[0])).toBe(true)
      expect(Number.isFinite(pos[1])).toBe(true)
      expect(Number.isFinite(pos[2])).toBe(true)
      expect(pos[0]).toBeGreaterThanOrEqual(layout.bounds.min[0] - 1e-9)
      expect(pos[1]).toBeGreaterThanOrEqual(layout.bounds.min[1] - 1e-9)
      expect(pos[2]).toBeGreaterThanOrEqual(layout.bounds.min[2] - 1e-9)
      expect(pos[0]).toBeLessThanOrEqual(layout.bounds.max[0] + 1e-9)
      expect(pos[1]).toBeLessThanOrEqual(layout.bounds.max[1] + 1e-9)
      expect(pos[2]).toBeLessThanOrEqual(layout.bounds.max[2] + 1e-9)

      const p2 = layout.projected2D.get(id)
      expect(p2).toBeDefined()
      expect(p2![0]).toBeGreaterThanOrEqual(0)
      expect(p2![0]).toBeLessThanOrEqual(1)
      expect(p2![1]).toBeGreaterThanOrEqual(0)
      expect(p2![1]).toBeLessThanOrEqual(1)
    }
  })

  it('T2: determinism and order-independence under node/edge permutations', () => {
    const a = computeGalaxyLayout(devMiniPack, devMiniIndex)
    const b = computeGalaxyLayout(devMiniPack, devMiniIndex)
    expect([...a.positions.entries()]).toEqual([...b.positions.entries()])
    expect([...a.domainCenters.entries()]).toEqual([...b.domainCenters.entries()])
    expect(a.bounds).toEqual(b.bounds)

    const shuffledPack: PackDocument = {
      ...devMiniPack,
      nodes: deterministicShuffle(devMiniPack.nodes, 1337),
      edges: deterministicShuffle(devMiniPack.edges, 7331)
    }
    const shuffledIndex = buildGraphIndex(shuffledPack)
    const c = computeGalaxyLayout(shuffledPack, shuffledIndex)

    for (const [id, pos] of a.positions) {
      expect(c.positions.get(id)).toEqual(pos)
    }
    for (const [id, p2] of a.projected2D) {
      expect(c.projected2D.get(id)).toEqual(p2)
    }
    expect(c.bounds).toEqual(a.bounds)

    const rekeyedPack: PackDocument = { ...devMiniPack, id: 'dev-mini-alt' }
    const d = computeGalaxyLayout(rekeyedPack, buildGraphIndex(rekeyedPack))
    expect(d.positions.get('u1')).not.toEqual(a.positions.get('u1'))
  })

  it('T3: hierarchical semantics, chapter-grouped leaves, empty unit S.2.1, and 120-leaf shells', () => {
    const devLayout = computeGalaxyLayout(devMiniPack, devMiniIndex)
    const u1 = devLayout.positions.get('u1')!
    const u3 = devLayout.positions.get('u3')!
    const u1k1 = devLayout.positions.get('u1.k1')!
    expect(Math.hypot(u1k1[0] - u1[0], u1k1[1] - u1[1], u1k1[2] - u1[2])).toBeLessThan(
      Math.hypot(u1k1[0] - u3[0], u1k1[1] - u3[1], u1k1[2] - u3[2])
    )

    const csLayout = computeGalaxyLayout(csMathPack, csMathIndex)
    const m11 = csLayout.positions.get('M.1.1')!
    const m11c0 = csLayout.positions.get('M.1.1.c0')!
    const m11k0 = csLayout.positions.get('M.1.1.k0')!
    const xPos = csLayout.positions.get('X')!

    const distLeafToUnit = Math.hypot(m11k0[0] - m11[0], m11k0[1] - m11[1], m11k0[2] - m11[2])
    const distLeafToFar = Math.hypot(m11k0[0] - xPos[0], m11k0[1] - xPos[1], m11k0[2] - xPos[2])
    expect(distLeafToUnit).toBeLessThan(20)
    expect(distLeafToUnit).toBeLessThan(distLeafToFar)

    const distChapToUnit = Math.hypot(m11c0[0] - m11[0], m11c0[1] - m11[1], m11c0[2] - m11[2])
    expect(distChapToUnit).toBeGreaterThanOrEqual(1.35 * 1.05 - 1e-4)
    expect(distChapToUnit).toBeLessThan(15)

    // Empty unit S.2.1
    const s21 = csLayout.positions.get('S.2.1')
    expect(s21).toBeDefined()
    expect(Number.isFinite(s21![0]) && Number.isFinite(s21![1]) && Number.isFinite(s21![2])).toBe(
      true
    )
    expect(csLayout.clusterMetas.get('S.2.1')).toBeDefined()

    // Synthetic 120-leaf unit + orphan leaf
    const bigNodes: KnowledgeNode[] = [
      { id: 'b0', parentId: null, kind: 'branch', title: { zh: 'Root' }, domainId: 'D0' },
      { id: 'u0', parentId: 'b0', kind: 'unit', title: { zh: 'Big' }, domainId: 'D0' },
      { id: 'orphan', parentId: 'missing-parent', kind: 'leaf', title: { zh: 'Orphan' }, domainId: 'D0' }
    ]
    for (let i = 0; i < 120; i++) {
      bigNodes.push({
        id: `u0.k${String(i).padStart(3, '0')}`,
        parentId: 'u0',
        kind: 'leaf',
        title: { zh: `L${i}` },
        domainId: 'D0'
      })
    }
    const bigPack: PackDocument = {
      schema: 'litree/pack-v2',
      id: 'big-unit',
      version: 1,
      title: { zh: 'Big' },
      source: 'custom',
      domains: [{ id: 'D0', name: 'D0', color: '#38bdf8' }],
      nodes: bigNodes,
      edges: [],
      routes: []
    }
    const bigLayout = computeGalaxyLayout(bigPack, buildGraphIndex(bigPack))
    const ids = bigNodes.map((n) => n.id)
    expect(minPairwiseDistanceSpatial(bigLayout.positions, ids, 1.5)).toBeGreaterThanOrEqual(
      1.05 - 1e-4
    )
  })

  it('T4: guaranteed minimum node & unit separation on dev-mini and cs-math', () => {
    const devLayout = computeGalaxyLayout(devMiniPack, devMiniIndex)
    const devIds = devMiniPack.nodes.map((n) => n.id)
    expect(minPairwiseDistanceSpatial(devLayout.positions, devIds, 1.5)).toBeGreaterThanOrEqual(
      1.05 - 1e-4
    )

    const csLayout = computeGalaxyLayout(csMathPack, csMathIndex)
    const csIds = csMathPack.nodes.map((n) => n.id)
    expect(minPairwiseDistanceSpatial(csLayout.positions, csIds, 1.3)).toBeGreaterThanOrEqual(
      1.05 - 1e-4
    )

    const unitIds = csMathPack.nodes.filter((n) => n.kind === 'unit').map((n) => n.id)
    let minUnitDist = Infinity
    for (let i = 0; i < unitIds.length; i++) {
      const pa = csLayout.positions.get(unitIds[i]!)!
      for (let j = i + 1; j < unitIds.length; j++) {
        const pb = csLayout.positions.get(unitIds[j]!)!
        const d = Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2])
        if (d < minUnitDist) minUnitDist = d
      }
    }
    expect(minUnitDist).toBeGreaterThanOrEqual(9.5 - 1e-4)
  })

  it('T5: position3D overrides, extreme coordinates, invalid NaN overrides, coincident pins, empty pack', () => {
    const emptyPack: PackDocument = {
      schema: 'litree/pack-v2',
      id: 'empty',
      version: 1,
      title: { zh: 'Empty' },
      source: 'custom',
      domains: [],
      nodes: [],
      edges: [],
      routes: []
    }
    const emptyLayout = computeGalaxyLayout(emptyPack, buildGraphIndex(emptyPack))
    expect(emptyLayout.positions.size).toBe(0)
    expect(emptyLayout.bounds.radius).toBe(1)

    const overridePack: PackDocument = {
      ...devMiniPack,
      id: 'override-pack',
      nodes: devMiniPack.nodes.map((n) => {
        if (n.id === 'u1') return { ...n, position3D: [42, -7, 13] }
        if (n.id === 'u2') return { ...n, position3D: [50000, 0, -50000] }
        if (n.id === 'u3') return { ...n, position3D: [Number.NaN, Infinity, 0] }
        if (n.id === 'u1.k1' || n.id === 'u1.k2') return { ...n, position3D: [0, 0, 0] }
        return n
      })
    }

    const t0 = performance.now()
    const layout = computeGalaxyLayout(overridePack, buildGraphIndex(overridePack))
    const elapsed = performance.now() - t0

    expect(elapsed).toBeLessThan(50)
    expect(layout.positions.get('u1')).toEqual([42, -7, 13])
    expect(layout.positions.get('u2')).toEqual([50000, 0, -50000])
    expect(layout.positions.get('u1.k1')).toEqual([0, 0, 0])
    expect(layout.positions.get('u1.k2')).toEqual([0, 0, 0])
    for (const pos of layout.positions.values()) {
      expect(Number.isFinite(pos[0]) && Number.isFinite(pos[1]) && Number.isFinite(pos[2])).toBe(
        true
      )
    }
  })

  it('T6: cycle resilience for cyclic prerequisite graphs', () => {
    const cyclicPack: PackDocument = {
      schema: 'litree/pack-v2',
      id: 'cyclic',
      version: 1,
      title: { zh: 'Cycle' },
      source: 'custom',
      domains: [{ id: 'D1', name: 'D1', color: '#38bdf8' }],
      nodes: [
        { id: 'b1', parentId: null, kind: 'branch', title: { zh: 'B1' }, domainId: 'D1' },
        { id: 'u1', parentId: 'b1', kind: 'unit', title: { zh: 'U1' }, domainId: 'D1' },
        { id: 'u2', parentId: 'b1', kind: 'unit', title: { zh: 'U2' }, domainId: 'D1' }
      ],
      edges: [
        { id: 'e1', from: 'u1', to: 'u2', type: 'hard' },
        { id: 'e2', from: 'u2', to: 'u1', type: 'hard' }
      ],
      routes: []
    }
    const layout = computeGalaxyLayout(cyclicPack, buildGraphIndex(cyclicPack))
    expect(layout.positions.size).toBe(3)
    for (const pos of layout.positions.values()) {
      expect(Number.isFinite(pos[0]) && Number.isFinite(pos[1]) && Number.isFinite(pos[2])).toBe(
        true
      )
    }
  })

  it('T7: cs-math.json (10,013 nodes) stress & performance check', () => {
    // Warm up once
    computeGalaxyLayout(csMathPack, csMathIndex)
    const t0 = performance.now()
    const layout = computeGalaxyLayout(csMathPack, csMathIndex)
    const elapsed = performance.now() - t0

    expect(layout.positions.size).toBe(10013)
    expect(layout.domainCenters.size).toBe(13)
    expect(layout.projected2D.size).toBe(10013)
    expect(layout.bounds.radius).toBeGreaterThan(50)
    expect(elapsed).toBeLessThan(250)

    for (const pos of layout.positions.values()) {
      expect(Number.isFinite(pos[0]) && Number.isFinite(pos[1]) && Number.isFinite(pos[2])).toBe(
        true
      )
    }
  })

  it('T8: respects layout options (minSeparation, armCount, spiralTwist) and populates metadata maps', () => {
    const layout = computeGalaxyLayout(devMiniPack, devMiniIndex, {
      minSeparation: 2.0,
      armCount: 2,
      spiralTwist: 0.8
    })
    const ids = devMiniPack.nodes.map((n) => n.id)
    expect(minPairwiseDistanceSpatial(layout.positions, ids, 2.2)).toBeGreaterThanOrEqual(
      2.0 - 1e-4
    )
    expect(layout.domainRadii.size).toBe(2)
    expect(layout.nodeRadii.size).toBe(11)
    expect(layout.clusterMetas.has('b1')).toBe(true)
    expect(layout.clusterMetas.has('u1')).toBe(true)
    expect(layout.clusterMetas.get('u1')!.nodeCount).toBe(4) // u1 + 3 leaves
  })

  it('T9: relaxAnchors respects pinned leaves near unpinned units under default and custom minSeparation', () => {
    const makePack = (extraLeafPos?: [number, number, number]): PackDocument => ({
      schema: 'litree/pack-v2',
      id: 'anchor-pin-collision',
      version: 1,
      title: { zh: 'AnchorPin' },
      source: 'custom',
      domains: [{ id: 'D0', name: 'D0', color: '#38bdf8' }],
      nodes: [
        {
          id: 'b0',
          parentId: null,
          kind: 'branch',
          title: { zh: 'B0' },
          domainId: 'D0',
          position3D: [0, 50, 0]
        },
        {
          id: 'u0',
          parentId: 'b0',
          kind: 'unit',
          title: { zh: 'U0' },
          domainId: 'D0',
          position3D: [0, 0, 0]
        },
        {
          id: 'u1',
          parentId: 'b0',
          kind: 'unit',
          title: { zh: 'U1' },
          domainId: 'D0'
        },
        ...(extraLeafPos
          ? [
              {
                id: 'l_pin',
                parentId: 'u1',
                kind: 'leaf' as const,
                title: { zh: 'PinnedLeaf' },
                domainId: 'D0',
                position3D: extraLeafPos
              }
            ]
          : [])
      ],
      edges: [],
      routes: []
    })

    for (const sep of [undefined, 2.0]) {
      const opts = sep === undefined ? undefined : { minSeparation: sep }
      const expectedMin = sep ?? 1.05

      // First compute relaxed u1 position without l_pin, then place l_pin 0.3 outward along u0 -> u1
      const basePack = makePack()
      const baseLayout = computeGalaxyLayout(basePack, buildGraphIndex(basePack), opts)
      const u0 = baseLayout.positions.get('u0')!
      const u1Base = baseLayout.positions.get('u1')!
      const dirX = u1Base[0] - u0[0]
      const dirY = u1Base[1] - u0[1]
      const dirZ = u1Base[2] - u0[2]
      const len = Math.hypot(dirX, dirY, dirZ)
      const lPinPos: [number, number, number] = [
        u1Base[0] + (dirX / len) * 0.3,
        u1Base[1] + (dirY / len) * 0.3,
        u1Base[2] + (dirZ / len) * 0.3
      ]

      const collidePack = makePack(lPinPos)
      const layout = computeGalaxyLayout(collidePack, buildGraphIndex(collidePack), opts)
      const u1Pos = layout.positions.get('u1')!
      const lpPos = layout.positions.get('l_pin')!
      expect(lpPos).toEqual(lPinPos)

      const dU1Pin = Math.hypot(u1Pos[0] - lpPos[0], u1Pos[1] - lpPos[1], u1Pos[2] - lpPos[2])
      const dU0U1 = Math.hypot(u1Pos[0] - u0[0], u1Pos[1] - u0[1], u1Pos[2] - u0[2])
      expect(dU1Pin).toBeGreaterThanOrEqual(expectedMin - 1e-4)
      expect(dU0U1).toBeGreaterThanOrEqual(Math.max(expectedMin * 2, 9.5 * 0.45) - 1e-4)

      // Permutation invariance with reversed nodes
      const revPack: PackDocument = {
        ...collidePack,
        nodes: [...collidePack.nodes].reverse()
      }
      const revLayout = computeGalaxyLayout(revPack, buildGraphIndex(revPack), opts)
      expect(revLayout.positions.get('u1')).toEqual(u1Pos)
    }
  })

  it('T10: structural branch clusterMetas.radius encloses direct leaves under the branch', () => {
    const nodes: KnowledgeNode[] = [
      { id: 'b0', parentId: null, kind: 'branch', title: { zh: 'B0' }, domainId: 'D0' }
    ]
    for (let i = 0; i < 40; i++) {
      nodes.push({
        id: `l${String(i).padStart(2, '0')}`,
        parentId: 'b0',
        kind: 'leaf',
        title: { zh: `L${i}` },
        domainId: 'D0'
      })
    }
    const pack: PackDocument = {
      schema: 'litree/pack-v2',
      id: 'branch-direct-leaves',
      version: 1,
      title: { zh: 'BranchLeaves' },
      source: 'custom',
      domains: [{ id: 'D0', name: 'D0', color: '#38bdf8' }],
      nodes,
      edges: [],
      routes: []
    }
    const layout = computeGalaxyLayout(pack, buildGraphIndex(pack))
    const bMeta = layout.clusterMetas.get('b0')!
    expect(bMeta).toBeDefined()
    expect(bMeta.nodeCount).toBe(41)

    const bPos = layout.positions.get('b0')!
    for (let i = 0; i < 40; i++) {
      const lp = layout.positions.get(`l${String(i).padStart(2, '0')}`)!
      const d = Math.hypot(lp[0] - bPos[0], lp[1] - bPos[1], lp[2] - bPos[2])
      expect(d).toBeLessThanOrEqual(bMeta.radius + 1e-9)
    }
  })

  it('T11: 100 empty chapters in a single unit settle cleanly >= minSeparation', () => {
    const nodes: KnowledgeNode[] = [
      { id: 'b0', parentId: null, kind: 'branch', title: { zh: 'B0' }, domainId: 'D0' },
      { id: 'u0', parentId: 'b0', kind: 'unit', title: { zh: 'U0' }, domainId: 'D0' }
    ]
    for (let i = 0; i < 100; i++) {
      nodes.push({
        id: `ch${String(i).padStart(2, '0')}`,
        parentId: 'u0',
        kind: 'branch',
        title: { zh: `Ch${i}` },
        domainId: 'D0'
      })
    }
    const pack: PackDocument = {
      schema: 'litree/pack-v2',
      id: 'hundred-chapters',
      version: 1,
      title: { zh: 'Chapters' },
      source: 'custom',
      domains: [{ id: 'D0', name: 'D0', color: '#38bdf8' }],
      nodes,
      edges: [],
      routes: []
    }
    const layout = computeGalaxyLayout(pack, buildGraphIndex(pack))
    const ids = nodes.map((n) => n.id)
    expect(minPairwiseDistanceSpatial(layout.positions, ids, 1.5)).toBeGreaterThanOrEqual(
      1.05 - 1e-4
    )
  })

  it('T12: NaN layout options fall back safely without producing NaN coordinates', () => {
    const layout = computeGalaxyLayout(devMiniPack, devMiniIndex, {
      minSeparation: Number.NaN,
      unitMinSeparation: Number.NaN,
      armCount: Number.NaN,
      spiralTwist: Number.NaN
    })
    const ids = devMiniPack.nodes.map((n) => n.id)
    expect(minPairwiseDistanceSpatial(layout.positions, ids, 1.5)).toBeGreaterThanOrEqual(
      1.05 - 1e-4
    )
    for (const pos of layout.positions.values()) {
      expect(Number.isFinite(pos[0]) && Number.isFinite(pos[1]) && Number.isFinite(pos[2])).toBe(
        true
      )
    }

    const projNaN = project3DTo2DNormalized(layout.positions, Number.NaN)
    for (const p2 of projNaN.values()) {
      expect(Number.isFinite(p2[0]) && Number.isFinite(p2[1])).toBe(true)
      expect(p2[0]).toBeGreaterThanOrEqual(0.05 - 1e-9)
      expect(p2[0]).toBeLessThanOrEqual(0.95 + 1e-9)
    }
  })
})
