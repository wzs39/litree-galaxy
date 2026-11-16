import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  detectCycles,
  findCycleEdgeIds,
  normalizePackToV2,
  parsePackDocument,
  validatePackDocument,
  wouldCreateCycle
} from '../../src/core/schema'
import type { KnowledgeEdge, KnowledgeNode, PackDocument } from '../../src/core/types'

function makeMiniV2(): PackDocument {
  return {
    schema: 'litree/pack-v2',
    id: 'mini-v2',
    version: 2,
    title: { zh: '迷你包', en: 'Mini Pack' },
    source: 'builtin',
    domains: [
      { id: 'D1', name: '域一', color: '#3DD6C3' },
      { id: 'D2', name: '域二', color: '#F0B429' }
    ],
    nodes: [
      { id: 'b1', parentId: null, kind: 'branch', title: { zh: '分支一' }, domainId: 'D1' },
      { id: 'u1', parentId: 'b1', kind: 'unit', title: { zh: '单元一' }, domainId: 'D1', core: true },
      { id: 'u1.k1', parentId: 'u1', kind: 'leaf', title: { zh: '点一' }, domainId: 'D1' },
      { id: 'u2', parentId: 'b1', kind: 'unit', title: { zh: '单元二' }, domainId: 'D1' },
      { id: 'u2.k1', parentId: 'u2', kind: 'leaf', title: { zh: '点二' }, domainId: 'D1' },
      { id: 'u3', parentId: 'b1', kind: 'unit', title: { zh: '单元三' }, domainId: 'D2' },
      { id: 'u3.k1', parentId: 'u3', kind: 'leaf', title: { zh: '点三' }, domainId: 'D2' }
    ],
    edges: [
      { id: 'e1', from: 'u1', to: 'u2', type: 'hard', reason: '基础前置' },
      { id: 'e2', from: 'u2', to: 'u3', type: 'soft', reason: '推荐衔接' }
    ],
    routes: [{ id: 'r1', name: '入门', ids: ['u1', 'u2'] }]
  }
}

describe('schema: v1->v2 适配与严格校验', () => {
  it('dev-mini.json (pack-v1) 无损适配为 pack-v2 并保留 routes/edges/title', () => {
    const raw = JSON.parse(readFileSync(join(process.cwd(), 'resources/packs/dev-mini.json'), 'utf-8'))
    const res = normalizePackToV2(raw)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.pack.schema).toBe('litree/pack-v2')
    expect(res.pack.id).toBe('dev-mini')
    expect(res.pack.nodes.length).toBe(11)
    expect(res.pack.edges.length).toBe(2)
    expect(res.pack.edges.every((e) => e.id.length > 0)).toBe(true)
    expect(res.pack.routes.length).toBe(2)
    expect(res.pack.routes[0]?.id).toBe('dev-mini:route-0')
  })

  it('缺少 routes 的 pack-v1 fixture 默认补齐为空数组', () => {
    const raw = {
      schema: 'litree/pack-v1',
      id: 'no-routes',
      title: { zh: '无路线包' },
      domains: [{ id: 'D1', name: '域一', color: '#abc' }],
      nodes: [
        { id: 'b1', parent: null, kind: 'branch', title: { zh: '分支' }, domain: 'D1' },
        { id: 'u1', parent: 'b1', kind: 'unit', title: { zh: '单元' }, domain: 'D1' },
        { id: 'k1', parent: 'u1', kind: 'leaf', title: { zh: '点' }, domain: 'D1' }
      ],
      edges: []
    }
    const pack = parsePackDocument(raw)
    expect(pack.routes).toEqual([])
    expect(pack.nodes[0]?.parentId).toBeNull()
    expect(pack.nodes[1]?.domainId).toBe('D1')
  })

  it('validatePackDocument 严格校验 v2 并拒绝 v1、非法颜色与非法资源 URL', () => {
    const v2 = makeMiniV2()
    expect(validatePackDocument(v2).ok).toBe(true)

    const v1Like = { ...v2, schema: 'litree/pack-v1' }
    expect(validatePackDocument(v1Like).ok).toBe(false)

    const badColor = makeMiniV2()
    badColor.domains[0]!.color = 'javascript:alert(1)'
    const rColor = validatePackDocument(badColor)
    expect(rColor.ok).toBe(false)

    const badUrl = makeMiniV2()
    badUrl.nodes[1]!.resources = [{ title: 'XSS', url: 'javascript:alert(1)' }]
    const rUrl = validatePackDocument(badUrl)
    expect(rUrl.ok).toBe(false)
  })

  it('拒绝孤儿叶子（无 unit 祖先）、parentId 环与自环边', () => {
    const orphanLeaf = makeMiniV2()
    orphanLeaf.nodes.push({
      id: 'badLeaf',
      parentId: 'b1',
      kind: 'leaf',
      title: { zh: '直接挂分支的叶子' },
      domainId: 'D1'
    })
    expect(validatePackDocument(orphanLeaf).ok).toBe(false)

    const parentCycle = makeMiniV2()
    parentCycle.nodes[0]!.parentId = 'u1'
    expect(validatePackDocument(parentCycle).ok).toBe(false)

    const selfLoop = makeMiniV2()
    selfLoop.edges.push({ id: 'self', from: 'u1', to: 'u1', type: 'related' })
    expect(validatePackDocument(selfLoop).ok).toBe(false)
  })

  it('parsePackDocument 对非法输入抛出带具体错误信息的 Error', () => {
    expect(() => parsePackDocument(null)).toThrow(/JSON object/i)
    expect(() => parsePackDocument({ schema: 'unknown' })).toThrow(/Invalid pack document/i)
  })
})

describe('schema: Kahn DAG 环检测 (hard+soft 严格成环校验, related 豁免)', () => {
  it('detectCycles 检测 hard+soft 跨边环并返回环路，允许 related 反向关联', () => {
    const nodes: KnowledgeNode[] = [
      { id: 'u1', parentId: null, kind: 'unit', title: { zh: 'u1' }, domainId: 'D1' },
      { id: 'u2', parentId: null, kind: 'unit', title: { zh: 'u2' }, domainId: 'D1' },
      { id: 'u3', parentId: null, kind: 'unit', title: { zh: 'u3' }, domainId: 'D1' }
    ]
    const acyclicEdges: KnowledgeEdge[] = [
      { id: 'e1', from: 'u1', to: 'u2', type: 'hard' },
      { id: 'e2', from: 'u2', to: 'u3', type: 'soft' },
      { id: 'r1', from: 'u3', to: 'u1', type: 'related' }
    ]
    expect(detectCycles(nodes, acyclicEdges)).toBeNull()
    expect(
      wouldCreateCycle({ from: 'u3', to: 'u1', type: 'related' }, nodes, acyclicEdges)
    ).toBeNull()

    const cyclePath = wouldCreateCycle({ from: 'u3', to: 'u1', type: 'hard' }, nodes, acyclicEdges)
    expect(cyclePath).not.toBeNull()
    expect(cyclePath![0]).toBe('u1')
    expect(cyclePath![cyclePath!.length - 1]).toBe('u1')

    const conflictEdgeIds = findCycleEdgeIds(cyclePath!, acyclicEdges)
    expect(conflictEdgeIds).toContain('e1')
    expect(conflictEdgeIds).toContain('e2')

    const cyclicEdges: KnowledgeEdge[] = [
      ...acyclicEdges,
      { id: 'e3', from: 'u3', to: 'u1', type: 'soft' }
    ]
    const detected = detectCycles(nodes, cyclicEdges)
    expect(detected).not.toBeNull()
    expect(detected![0]).toBe(detected![detected!.length - 1])
  })

  it('wouldCreateCycle 对任意类型的自环都返回冲突', () => {
    const v2 = makeMiniV2()
    expect(wouldCreateCycle({ from: 'u1', to: 'u1', type: 'related' }, v2.nodes, v2.edges)).toEqual([
      'u1',
      'u1'
    ])
  })

  it('detectCycles 使用迭代栈处理 10,000 节点超长环不触发栈溢出', () => {
    const n = 10_000
    const nodes: KnowledgeNode[] = []
    const edges: KnowledgeEdge[] = []
    for (let i = 0; i < n; i++) {
      nodes.push({ id: `u${i}`, parentId: null, kind: 'unit', title: { zh: `U${i}` }, domainId: 'D1' })
      edges.push({ id: `e${i}`, from: `u${i}`, to: `u${(i + 1) % n}`, type: 'hard' })
    }
    const cycle = detectCycles(nodes, edges)
    expect(cycle).not.toBeNull()
    expect(cycle!.length).toBe(n + 1)
    expect(cycle![0]).toBe(cycle![cycle!.length - 1])
  })
})
