import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildGraphIndex } from '../../src/core/graph'
import { normalizePackToV2 } from '../../src/core/schema'
import { computeSemantic2DLayout } from '../../src/layout/semantic2dLayout'
import type { PackDocument } from '../../src/core/types'

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

describe('semantic2dLayout', () => {
  it('partitions domains cleanly and lays out dev-mini and 10k cs-math with finite coords', () => {
    const dev2d = computeSemantic2DLayout(devMiniPack, devMiniIndex)
    expect(dev2d.nodes.size).toBe(11)
    expect(dev2d.edges.length).toBe(2)
    expect(dev2d.regions.size).toBe(2)

    for (const n of dev2d.nodes.values()) {
      expect(Number.isFinite(n.x)).toBe(true)
      expect(Number.isFinite(n.y)).toBe(true)
      expect(n.nx).toBeGreaterThanOrEqual(0)
      expect(n.nx).toBeLessThanOrEqual(1)
      expect(n.ny).toBeGreaterThanOrEqual(0)
      expect(n.ny).toBeLessThanOrEqual(1)
    }

    const cs2d = computeSemantic2DLayout(csMathPack, csMathIndex)
    expect(cs2d.nodes.size).toBe(10013)
    expect(cs2d.edges.length).toBe(690)
    expect(cs2d.regions.size).toBe(13)

    const m = cs2d.nodes.get('M.1.1')!
    const [nx, ny] = cs2d.worldToNormalized(m.x, m.y)
    const [wx, wy] = cs2d.normalizedToWorld(nx, ny)
    expect(Math.abs(wx - m.x)).toBeLessThan(1e-4)
    expect(Math.abs(wy - m.y)).toBeLessThan(1e-4)
  })

  it('orders hard prerequisites from left to right within a domain and frames focusClusterId', () => {
    const customPack: PackDocument = {
      ...devMiniPack,
      nodes: devMiniPack.nodes.map((n) =>
        n.id === 'u2' ? { ...n, layoutOverride: undefined } : n
      )
    }
    const idx = buildGraphIndex(customPack)
    const layout = computeSemantic2DLayout(customPack, idx)
    const u1 = layout.nodes.get('u1')!
    const u2 = layout.nodes.get('u2')!
    expect(u2.topoLayer).toBeGreaterThan(u1.topoLayer)
    expect(u2.x).toBeGreaterThanOrEqual(u1.x)

    const focused = computeSemantic2DLayout(csMathPack, csMathIndex, {
      focusClusterId: 'M.1.1'
    })
    expect(focused.nodes.has('M.1.1')).toBe(true)
    expect(focused.nodes.has('M.1.1.k0')).toBe(true)
    expect(focused.nodes.has('X')).toBe(false)
    expect(focused.worldWidth).toBeLessThan(3000)
    expect(focused.edges.some((e) => e.id.startsWith('__tree_'))).toBe(true)
  })
})
