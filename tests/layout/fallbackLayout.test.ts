import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildGraphIndex } from '../../src/core/graph'
import { normalizePackToV2 } from '../../src/core/schema'
import type { KnowledgeNode, PackDocument } from '../../src/core/types'
import { computeFallback2DLayout } from '../../src/layout/fallbackLayout'
import { computeGalaxyLayout } from '../../src/layout/galaxyLayout'

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

describe('fallbackLayout (F6)', () => {
  it('T1: dev-mini and cs-math 2D projections produce finite bounded coords and edges', () => {
    const dev3d = computeGalaxyLayout(devMiniPack, devMiniIndex)
    const dev2d = computeFallback2DLayout(devMiniPack, devMiniIndex, dev3d, {
      width: 1200,
      height: 800
    })
    expect(dev2d.nodes.size).toBe(11)
    expect(dev2d.edges.length).toBe(2)
    expect(dev2d.domainCentroids.size).toBe(2)

    for (const n of dev2d.nodes.values()) {
      expect(n.x).toBeGreaterThanOrEqual(0)
      expect(n.x).toBeLessThanOrEqual(1200)
      expect(n.y).toBeGreaterThanOrEqual(0)
      expect(n.y).toBeLessThanOrEqual(800)
      expect(n.nx).toBeGreaterThanOrEqual(0)
      expect(n.nx).toBeLessThanOrEqual(1)
      expect(n.ny).toBeGreaterThanOrEqual(0)
      expect(n.ny).toBeLessThanOrEqual(1)
    }

    const cs3d = computeGalaxyLayout(csMathPack, csMathIndex)
    const cs2d = computeFallback2DLayout(csMathPack, csMathIndex, cs3d)
    expect(cs2d.nodes.size).toBe(10013)
    expect(cs2d.edges.length).toBe(690)
    expect(cs2d.domainCentroids.size).toBe(13)
  })

  it('T2: omitting galaxyLayout computes identical 2D coordinates', () => {
    const precomputed = computeGalaxyLayout(devMiniPack, devMiniIndex)
    const withPre = computeFallback2DLayout(devMiniPack, devMiniIndex, precomputed)
    const withoutPre = computeFallback2DLayout(devMiniPack, devMiniIndex)

    for (const [id, node] of withPre.nodes) {
      const other = withoutPre.nodes.get(id)
      expect(other).toEqual(node)
    }
  })

  it('T3: affine worldXZToNormalized / normalizedToWorldXZ round-trips within 1e-6', () => {
    const layout3d = computeGalaxyLayout(csMathPack, csMathIndex)
    const layout2d = computeFallback2DLayout(csMathPack, csMathIndex, layout3d, {
      width: 1000,
      height: 700
    })

    for (const id of ['M', 'M.1.1', 'M.1.1.k0', 'S.2.1', 'X']) {
      const pos3d = layout3d.positions.get(id)!
      const [nx, ny] = layout2d.worldXZToNormalized(pos3d[0], pos3d[2])
      const node2d = layout2d.nodes.get(id)!
      expect(Math.abs(nx - node2d.nx)).toBeLessThan(1e-6)
      expect(Math.abs(ny - node2d.ny)).toBeLessThan(1e-6)

      const [rx, rz] = layout2d.normalizedToWorldXZ(nx, ny)
      expect(Math.abs(rx - pos3d[0])).toBeLessThan(1e-6)
      expect(Math.abs(rz - pos3d[2])).toBeLessThan(1e-6)
    }
  })

  it('T4: focusClusterId frames cluster subtree and handles unknown IDs + minSeparation2D', () => {
    const layout3d = computeGalaxyLayout(csMathPack, csMathIndex)
    const focused = computeFallback2DLayout(csMathPack, csMathIndex, layout3d, {
      width: 1000,
      height: 800,
      focusClusterId: 'M.1.1',
      minSeparation2D: 6
    })

    const expectedCount =
      1 + csMathIndex.chaptersOf('M.1.1').length + csMathIndex.leavesOf('M.1.1').length
    expect(focused.nodes.size).toBe(expectedCount)
    expect(focused.nodes.has('M.1.1')).toBe(true)
    expect(focused.nodes.has('M.1.1.k0')).toBe(true)
    expect(focused.nodes.has('X')).toBe(false)

    // Subtree should span nicely within [0, width] x [0, height]
    let minX = Infinity
    let maxX = -Infinity
    for (const n of focused.nodes.values()) {
      if (n.x < minX) minX = n.x
      if (n.x > maxX) maxX = n.x
    }
    expect(maxX - minX).toBeGreaterThan(200)

    // Unknown clusterId falls back to full pack
    const fallbackAll = computeFallback2DLayout(devMiniPack, devMiniIndex, undefined, {
      focusClusterId: 'does-not-exist'
    })
    expect(fallbackAll.nodes.size).toBe(11)
  })

  it('T5: relax2DSpatialHash separates coincident nodes and dense packs cleanly and deterministically', () => {
    const nodes: KnowledgeNode[] = [
      {
        id: 'u0',
        parentId: null,
        kind: 'unit',
        title: { zh: 'U0' },
        domainId: 'D0',
        position3D: [0, 0, 0]
      }
    ]
    for (let i = 0; i < 10; i++) {
      nodes.push({
        id: `lp${i}`,
        parentId: 'u0',
        kind: 'leaf',
        title: { zh: `LP${i}` },
        domainId: 'D0',
        position3D: [0, 0, 0]
      })
    }
    const coinPack: PackDocument = {
      schema: 'litree/pack-v2',
      id: 'coincident-2d',
      version: 1,
      title: { zh: 'Coincident' },
      source: 'custom',
      domains: [{ id: 'D0', name: 'D0', color: '#38bdf8' }],
      nodes,
      edges: [],
      routes: []
    }
    const coinIdx = buildGraphIndex(coinPack)
    const coin2d = computeFallback2DLayout(coinPack, coinIdx, undefined, {
      width: 1000,
      height: 700,
      minSeparation2D: 20
    })

    const pts = [...coin2d.nodes.values()]
    let minCoinDist = Infinity
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[j]!.x - pts[i]!.x, pts[j]!.y - pts[i]!.y)
        if (d < minCoinDist) minCoinDist = d
      }
    }
    expect(minCoinDist).toBeGreaterThanOrEqual(20 - 1e-4)

    // Permutation invariance check on coincident relaxation
    const revPack: PackDocument = { ...coinPack, nodes: [...coinPack.nodes].reverse() }
    const rev2d = computeFallback2DLayout(revPack, buildGraphIndex(revPack), undefined, {
      width: 1000,
      height: 700,
      minSeparation2D: 20
    })
    for (const [id, node] of coin2d.nodes) {
      expect(rev2d.nodes.get(id)).toEqual(node)
    }

    // Small dense pack (dev-mini at minSeparation2D: 80)
    const dev2d = computeFallback2DLayout(devMiniPack, devMiniIndex, undefined, {
      width: 1000,
      height: 700,
      minSeparation2D: 80
    })
    const devPts = [...dev2d.nodes.values()]
    let minDevDist = Infinity
    for (let i = 0; i < devPts.length; i++) {
      for (let j = i + 1; j < devPts.length; j++) {
        const d = Math.hypot(devPts[j]!.x - devPts[i]!.x, devPts[j]!.y - devPts[i]!.y)
        if (d < minDevDist) minDevDist = d
      }
    }
    expect(minDevDist).toBeGreaterThanOrEqual(80 - 1e-4)
  })

  it('T6: NaN options fall back safely without producing NaN 2D coordinates or transforms', () => {
    const layout2d = computeFallback2DLayout(devMiniPack, devMiniIndex, undefined, {
      width: Number.NaN,
      height: Number.NaN,
      padding: Number.NaN,
      minSeparation2D: Number.NaN
    })
    expect(layout2d.width).toBe(1000)
    expect(layout2d.height).toBe(700)
    expect(layout2d.padding).toBe(0.05)

    for (const n of layout2d.nodes.values()) {
      expect(Number.isFinite(n.x) && Number.isFinite(n.y)).toBe(true)
      expect(Number.isFinite(n.nx) && Number.isFinite(n.ny)).toBe(true)
    }
    const [nx, ny] = layout2d.worldXZToNormalized(0, 0)
    expect(Number.isFinite(nx) && Number.isFinite(ny)).toBe(true)
    const [wx, wz] = layout2d.normalizedToWorldXZ(nx, ny)
    expect(Number.isFinite(wx) && Number.isFinite(wz)).toBe(true)
  })
})
