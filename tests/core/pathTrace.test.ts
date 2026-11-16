import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildGraphIndex } from '../../src/core/graph'
import { computePathTrace } from '../../src/core/pathTrace'
import { normalizePackToV2 } from '../../src/core/schema'
import type { PackDocument } from '../../src/core/types'

function makeTracePack(): PackDocument {
  return {
    schema: 'litree/pack-v2',
    id: 'trace-pack',
    version: 1,
    title: { zh: '路径测试包' },
    source: 'builtin',
    domains: [{ id: 'D1', name: '域一', color: '#3DD6C3' }],
    nodes: [
      { id: 'b1', parentId: null, kind: 'branch', title: { zh: '分支' }, domainId: 'D1' },
      { id: 'u1', parentId: 'b1', kind: 'unit', title: { zh: '单元一' }, domainId: 'D1' },
      { id: 'u1.k1', parentId: 'u1', kind: 'leaf', title: { zh: '点1' }, domainId: 'D1' },
      { id: 'u2', parentId: 'b1', kind: 'unit', title: { zh: '单元二' }, domainId: 'D1' },
      { id: 'u2.c0', parentId: 'u2', kind: 'branch', title: { zh: '章0' }, domainId: 'D1' },
      { id: 'u2.k1', parentId: 'u2.c0', kind: 'leaf', title: { zh: '点2' }, domainId: 'D1' },
      { id: 'u2.k2', parentId: 'u2', kind: 'leaf', title: { zh: '点2b' }, domainId: 'D1' },
      { id: 'u3', parentId: 'b1', kind: 'unit', title: { zh: '单元三' }, domainId: 'D1' },
      { id: 'u3.k1', parentId: 'u3', kind: 'leaf', title: { zh: '点3' }, domainId: 'D1' },
      { id: 'uOff', parentId: 'b1', kind: 'unit', title: { zh: '链外单元' }, domainId: 'D1' },
      { id: 'uOff.k1', parentId: 'uOff', kind: 'leaf', title: { zh: '链外点' }, domainId: 'D1' },
      { id: 'uEmpty', parentId: 'b1', kind: 'unit', title: { zh: '空单元' }, domainId: 'D1' }
    ],
    edges: [
      { id: 'e1', from: 'u1', to: 'u2', type: 'hard', reason: 'u1 是 u2 的硬前置' },
      { id: 'e2', from: 'u2', to: 'u3', type: 'hard', reason: 'u2 是 u3 的硬前置' },
      { id: 'e3', from: 'u1', to: 'u3', type: 'soft', reason: 'u1 对 u3 有软推荐' },
      { id: 'e4', from: 'uOff', to: 'u3', type: 'soft', reason: '链外软前置' },
      { id: 'e5', from: 'u1', to: 'uEmpty', type: 'hard', reason: '空单元前置' }
    ],
    routes: []
  }
}

describe('pathTrace: 纯拓扑先修链与 gold/cyan/crimson 状态', () => {
  const pack = makeTracePack()
  const index = buildGraphIndex(pack)

  it('从章分组叶子 u2.k1 追踪时正确解析所属 unit u2 并给出 gold/cyan/crimson 与 edge reason', () => {
    const trace = computePathTrace('u3.k1', index, new Set(['u1.k1']))
    expect(trace.targetUnitId).toBe('u3')
    expect(trace.chain.map((c) => [c.unitId, c.status])).toEqual([
      ['u1', 'gold'],
      ['u2', 'cyan'],
      ['u3', 'crimson']
    ])
    expect(trace.edges.length).toBe(3)
    expect(trace.edges.some((e) => e.from === 'uOff')).toBe(false)
    const u3Item = trace.chain.find((c) => c.unitId === 'u3')
    expect(u3Item?.incomingReasons.map((r) => r.reason)).toEqual([
      'u2 是 u3 的硬前置',
      'u1 对 u3 有软推荐',
      '链外软前置'
    ])
    expect(trace.canLightTargetNow).toBe(false)
    expect(trace.steps.map((s) => s.leafId)).toEqual(['u2.k1', 'u2.k2'])
    expect(trace.steps[0]?.path).toEqual(['b1', 'u2', 'u2.c0', 'u2.k1'])
  })

  it('处理空单元 uEmpty（即使前置未点亮）与缺失节点不抛异常并输出 blockers', () => {
    const emptyTrace = computePathTrace('uEmpty', index, new Set())
    const emptyItem = emptyTrace.chain.find((c) => c.unitId === 'uEmpty')
    expect(emptyItem?.status).toBe('crimson')
    expect(emptyTrace.blockers.some((b) => b.code === 'no-available-leaf' && b.unitId === 'uEmpty')).toBe(true)

    const missingTrace = computePathTrace('does-not-exist', index, new Set())
    expect(missingTrace.blockers[0]?.code).toBe('missing-pack-node')
    expect(missingTrace.chain).toEqual([])
  })

  it('支持 maxSteps 截断、already-lit 提示及章分支在部分点亮单元下不误报 already-lit', () => {
    const litTrace = computePathTrace('u1.k1', index, new Set(['u1.k1']))
    expect(litTrace.blockers.some((b) => b.code === 'already-lit')).toBe(true)

    // Chapter u2.c0 is lit (u2.k1 lit), but owning unit u2 still has u2.k2 unlit
    const partialChapterTrace = computePathTrace('u2.c0', index, new Set(['u1.k1', 'u2.k1']))
    expect(partialChapterTrace.canLightTargetNow).toBe(true)
    expect(partialChapterTrace.remainingLeaves).toBe(1)
    expect(partialChapterTrace.blockers.some((b) => b.code === 'already-lit')).toBe(false)

    // Once entire unit u2 is lit, tracing u2.c0 reports already-lit
    const fullChapterTrace = computePathTrace('u2.c0', index, new Set(['u1.k1', 'u2.k1', 'u2.k2']))
    expect(fullChapterTrace.canLightTargetNow).toBe(false)
    expect(fullChapterTrace.remainingLeaves).toBe(0)
    expect(fullChapterTrace.blockers.some((b) => b.code === 'already-lit')).toBe(true)

    const truncTrace = computePathTrace('u2.k1', index, new Set(), { maxSteps: 0 })
    expect(truncTrace.truncated).toBe(true)
    expect(truncTrace.steps).toEqual([])
  })

  it('领域分支含 0-leaf 子单元或未点亮外部前置时绝不同时误报 already-lit 与 remainingUnits > 0', () => {
    const mixedPack: PackDocument = {
      schema: 'litree/pack-v2',
      id: 'mixed-branch-pack',
      version: 1,
      title: { zh: '混合分支包' },
      source: 'builtin',
      domains: [{ id: 'D1', name: '域一', color: '#3DD6C3' }],
      nodes: [
        { id: 'bPre', parentId: null, kind: 'branch', title: { zh: '前置分支' }, domainId: 'D1' },
        { id: 'uPre', parentId: 'bPre', kind: 'unit', title: { zh: '前置单元' }, domainId: 'D1' },
        { id: 'uPre.k1', parentId: 'uPre', kind: 'leaf', title: { zh: '前置点' }, domainId: 'D1' },
        { id: 'bMixed', parentId: null, kind: 'branch', title: { zh: '混合分支' }, domainId: 'D1' },
        { id: 'M1', parentId: 'bMixed', kind: 'unit', title: { zh: '有叶单元' }, domainId: 'D1' },
        { id: 'M1.k1', parentId: 'M1', kind: 'leaf', title: { zh: '叶1' }, domainId: 'D1' },
        { id: 'M_empty', parentId: 'bMixed', kind: 'unit', title: { zh: '空单元' }, domainId: 'D1' },
        { id: 'bClean', parentId: null, kind: 'branch', title: { zh: '纯分支' }, domainId: 'D1' },
        { id: 'C1', parentId: 'bClean', kind: 'unit', title: { zh: '纯单元' }, domainId: 'D1' },
        { id: 'C1.k1', parentId: 'C1', kind: 'leaf', title: { zh: '纯叶1' }, domainId: 'D1' }
      ],
      edges: [{ id: 'e-pre', from: 'uPre', to: 'C1', type: 'hard' }],
      routes: []
    }
    const mixedIndex = buildGraphIndex(mixedPack)

    // bMixed has M1 lit and M_empty with 0 leaves: must NOT emit already-lit
    const mixedTrace = computePathTrace('bMixed', mixedIndex, new Set(['M1.k1']))
    expect(mixedTrace.remainingUnits).toBe(1)
    expect(mixedTrace.blockers.some((b) => b.code === 'already-lit')).toBe(false)
    expect(mixedTrace.blockers.some((b) => b.code === 'no-available-leaf' && b.unitId === 'M_empty')).toBe(true)
    expect(mixedTrace.canLightTargetNow).toBe(false)

    // bClean has C1.k1 force-lit, but external prereq uPre is unlit: must NOT emit already-lit
    const cleanPartialTrace = computePathTrace('bClean', mixedIndex, new Set(['C1.k1']))
    expect(cleanPartialTrace.remainingUnits).toBe(1)
    expect(cleanPartialTrace.blockers.some((b) => b.code === 'already-lit')).toBe(false)
    expect(cleanPartialTrace.canLightTargetNow).toBe(true)

    // With maxSteps: 0 on domain branch bClean, canLightTargetNow remains true while steps is truncated
    const cleanTruncTrace = computePathTrace('bClean', mixedIndex, new Set(['C1.k1']), { maxSteps: 0 })
    expect(cleanTruncTrace.steps).toEqual([])
    expect(cleanTruncTrace.truncated).toBe(true)
    expect(cleanTruncTrace.canLightTargetNow).toBe(true)

    // Once uPre and C1 are both lit, bClean reports already-lit and canLightTargetNow: false
    const cleanFullTrace = computePathTrace('bClean', mixedIndex, new Set(['uPre.k1', 'C1.k1']))
    expect(cleanFullTrace.remainingUnits).toBe(0)
    expect(cleanFullTrace.remainingLeaves).toBe(0)
    expect(cleanFullTrace.blockers.some((b) => b.code === 'already-lit')).toBe(true)
    expect(cleanFullTrace.canLightTargetNow).toBe(false)

    // Real cs-math.json branch S (contains 0-leaf unit S.2.1 and external prereqs)
    const raw = JSON.parse(readFileSync(join(process.cwd(), 'resources/packs/cs-math.json'), 'utf-8'))
    const norm = normalizePackToV2(raw)
    expect(norm.ok).toBe(true)
    if (!norm.ok) return
    const csIndex = buildGraphIndex(norm.pack)
    const sLitSet = new Set(csIndex.leavesOf('S').map((l) => l.id))
    const sTrace = computePathTrace('S', csIndex, sLitSet)
    expect(sTrace.remainingUnits).toBeGreaterThan(0)
    expect(sTrace.blockers.some((b) => b.code === 'already-lit')).toBe(false)
    expect(sTrace.blockers.some((b) => b.code === 'no-available-leaf' && b.unitId === 'S.2.1')).toBe(true)
  })
})
