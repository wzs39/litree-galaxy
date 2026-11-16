import { describe, expect, it } from 'vitest'
import {
  buildGraphIndex,
  computeNodeVisualState,
  computeUnlockCascade,
  getLitLeavesSet,
  getNodeVisualState,
  isLit,
  leafAvailable,
  minimalHardClosure,
  pickNextActionable,
  pruneOrphanProgress,
  unitAvailable
} from '../../src/core/graph'
import { emptyPackProgress } from '../../src/core/progress'
import type { PackDocument, PackProgress } from '../../src/core/types'

function makeChapterPack(): PackDocument {
  return {
    schema: 'litree/pack-v2',
    id: 'chapter-test',
    version: 1,
    title: { zh: '章分组测试' },
    source: 'builtin',
    domains: [
      { id: 'M1', name: '数学一', color: '#3DD6C3' },
      { id: 'S', name: '安全', color: '#F0B429' }
    ],
    nodes: [
      { id: 'M', parentId: null, kind: 'branch', title: { zh: '数学根' }, domainId: 'M1' },
      { id: 'M1', parentId: 'M', kind: 'branch', title: { zh: '分析线' }, domainId: 'M1' },
      { id: 'M.1.1', parentId: 'M1', kind: 'unit', title: { zh: '极限' }, domainId: 'M1', core: true },
      { id: 'M.1.1.c0', parentId: 'M.1.1', kind: 'branch', title: { zh: '第一章' }, domainId: 'M1' },
      { id: 'M.1.1.k0', parentId: 'M.1.1.c0', kind: 'leaf', title: { zh: '数列极限' }, domainId: 'M1' },
      { id: 'M.1.1.k1', parentId: 'M.1.1.c0', kind: 'leaf', title: { zh: '函数极限' }, domainId: 'M1' },
      { id: 'M.1.2', parentId: 'M1', kind: 'unit', title: { zh: '导数' }, domainId: 'M1', core: false },
      { id: 'M.1.2.k0', parentId: 'M.1.2', kind: 'leaf', title: { zh: '求导法则' }, domainId: 'M1' },
      { id: 'S', parentId: null, kind: 'branch', title: { zh: '安全' }, domainId: 'S' },
      { id: 'S.2.1', parentId: 'S', kind: 'unit', title: { zh: '空单元' }, domainId: 'S' },
      { id: 'S.2.2', parentId: 'S', kind: 'unit', title: { zh: '下游单元' }, domainId: 'S' },
      { id: 'S.2.2.k0', parentId: 'S.2.2', kind: 'leaf', title: { zh: '后置点' }, domainId: 'S' }
    ],
    edges: [
      { id: 'h1', from: 'M.1.1', to: 'M.1.2', type: 'hard', reason: '极限是导数基础' },
      { id: 'h2', from: 'M.1.1', to: 'S.2.2', type: 'hard', reason: '数学前置' },
      { id: 's1', from: 'M.1.2', to: 'S.2.2', type: 'soft', reason: '导数建议掌握' },
      { id: 'r1', from: 'M.1.1', to: 'S.2.1', type: 'related', reason: '相关延伸' }
    ],
    routes: [{ id: 'route-1', name: '数学路线', ids: ['M.1.1', 'M.1.2'] }]
  }
}

describe('graph: owningUnit / 多边 reason / 空单元 / 复习不反锁 / 级联解锁', () => {
  const pack = makeChapterPack()
  const index = buildGraphIndex(pack)

  it('owningUnit 与 owningBranch 正确穿透章分组层 (unit -> chapter -> leaf)', () => {
    expect(index.owningUnit('M.1.1.k0')).toBe('M.1.1')
    expect(index.owningUnit('M.1.1.c0')).toBe('M.1.1')
    expect(index.owningUnit('M.1.1')).toBe('M.1.1')
    expect(index.owningUnit('M1')).toBeUndefined()

    expect(index.owningBranch('M.1.1.k0')).toBe('M1')
    expect(index.owningBranch('M.1.1')).toBe('M1')
    expect(index.owningBranch('M1')).toBe('M1')
    expect(index.owningBranch('M')).toBe('M')
  })

  it('edgeReasons 完整保留同目标节点的多条 hard + soft reason（不覆盖、不丢 soft）', () => {
    const reasons = index.edgeReasons.get('S.2.2') ?? []
    expect(reasons.length).toBe(2)
    expect(reasons.map((e) => e.reason)).toEqual(['数学前置', '导数建议掌握'])
    expect(index.edgesBetween('M.1.1', 'S.2.1').length).toBe(1)
    expect(index.edgesBetween('S.2.1', 'M.1.1').length).toBe(1) // related symmetric
  })

  it('0 叶子空单元 S.2.1 永不误判为 lit，dagDepthOf 计算最长先修深度', () => {
    expect(index.leavesOf('S.2.1')).toEqual([])
    expect(isLit('S.2.1', index, new Set(['M.1.1.k0']))).toBe(false)
    expect(index.dagDepthOf('M.1.1')).toBe(0)
    expect(index.dagDepthOf('M.1.2')).toBe(1)
    expect(index.dagDepthOf('S.2.2')).toBe(2) // M.1.1 -> M.1.2 (soft) -> S.2.2
  })

  it('review_due 与前置门控解耦：到期复习节点渲染 review_due 但下游保持解锁', () => {
    const progress: PackProgress = emptyPackProgress(pack.id)
    progress.nodes['M.1.1.k0'] = {
      status: 'lit',
      litAt: '2026-01-01T00:00:00.000Z',
      nextReviewAt: '2026-01-02T00:00:00.000Z',
      reviewCount: 0,
      leitnerBox: 1,
      mastery: 1
    }
    progress.nodes['M.1.1.k1'] = {
      status: 'lit',
      litAt: '2026-01-01T00:00:00.000Z',
      nextReviewAt: '2099-01-01T00:00:00.000Z',
      reviewCount: 0,
      leitnerBox: 1,
      mastery: 1
    }

    const nowMs = Date.parse('2026-06-01T00:00:00.000Z')
    const litLeaves = getLitLeavesSet(progress, index)
    expect(isLit('M.1.1', index, litLeaves)).toBe(true)
    expect(computeNodeVisualState('M.1.1.k0', index, progress, litLeaves, nowMs)).toBe('review_due')
    expect(computeNodeVisualState('M.1.1', index, progress, litLeaves, nowMs)).toBe('review_due')
    expect(unitAvailable('M.1.2', index, litLeaves)).toBe(true)
    expect(leafAvailable('M.1.2.k0', index, litLeaves)).toBe(true)
    expect(computeNodeVisualState('M.1.2.k0', index, progress, litLeaves, nowMs)).toBe('available')
  })

  it('minimalHardClosure / computeUnlockCascade / pickNextActionable / pruneOrphanProgress 正确执行', () => {
    const emptyLit = new Set<string>()
    expect(minimalHardClosure('M.1.2', index, emptyLit)).toEqual(['M.1.1'])

    const beforeLit = new Set(['M.1.1.k0'])
    const afterLit = new Set(['M.1.1.k0', 'M.1.1.k1'])
    const unlocked = computeUnlockCascade('M.1.1.k1', beforeLit, afterLit, index)
    expect(unlocked).toContain('M.1.2')
    expect(unlocked).toContain('M.1.2.k0')
    expect(unlocked).toContain('S.2.2')
    expect(unlocked).toContain('S.2.2.k0')

    const progress = emptyPackProgress(pack.id)
    progress.nodes['M.1.1.k1'] = {
      status: 'learning',
      reviewCount: 0,
      leitnerBox: 0,
      mastery: 0
    }
    progress.nodes['ghost.node'] = {
      status: 'lit',
      reviewCount: 0,
      leitnerBox: 1,
      mastery: 1
    }
    expect(pickNextActionable(index, progress)?.id).toBe('M.1.1.k1')

    const pruned = pruneOrphanProgress(progress, index)
    expect(pruned.removedIds).toEqual(['ghost.node'])
    expect(pruned.progress.nodes['ghost.node']).toBeUndefined()
  })

  it('minimalHardClosure 在菱形快捷边 DAG (A->U, B->U, A->B) 下严格保持拓扑先修顺序', () => {
    const diamondPack: PackDocument = {
      schema: 'litree/pack-v2',
      id: 'diamond',
      version: 1,
      title: { zh: '菱形图' },
      source: 'builtin',
      domains: [{ id: 'D1', name: 'D1', color: '#3DD6C3' }],
      nodes: [
        { id: 'b', parentId: null, kind: 'branch', title: { zh: 'B' }, domainId: 'D1' },
        { id: 'A', parentId: 'b', kind: 'unit', title: { zh: 'A' }, domainId: 'D1' },
        { id: 'A.k1', parentId: 'A', kind: 'leaf', title: { zh: 'A1' }, domainId: 'D1' },
        { id: 'B', parentId: 'b', kind: 'unit', title: { zh: 'B' }, domainId: 'D1' },
        { id: 'B.k1', parentId: 'B', kind: 'leaf', title: { zh: 'B1' }, domainId: 'D1' },
        { id: 'U', parentId: 'b', kind: 'unit', title: { zh: 'U' }, domainId: 'D1' },
        { id: 'U.k1', parentId: 'U', kind: 'leaf', title: { zh: 'U1' }, domainId: 'D1' }
      ],
      edges: [
        { id: 'e1', from: 'A', to: 'U', type: 'hard' },
        { id: 'e2', from: 'B', to: 'U', type: 'hard' },
        { id: 'e3', from: 'A', to: 'B', type: 'hard' }
      ],
      routes: []
    }
    const dIndex = buildGraphIndex(diamondPack)
    expect(minimalHardClosure('U', dIndex, new Set())).toEqual(['A', 'B'])
  })

  it('getNodeVisualState 过滤非 leaf 的错误 lit 记录，与 store 保持一致', () => {
    const progress = emptyPackProgress(pack.id)
    progress.nodes['M.1.1'] = {
      status: 'lit',
      reviewCount: 0,
      leitnerBox: 1,
      mastery: 1
    }
    expect(getNodeVisualState('M.1.1', index, progress)).toBe('available')
  })
})
