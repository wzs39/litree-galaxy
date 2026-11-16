import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildGraphIndex, computeNodeVisualState, isLit, minimalHardClosure } from '../../src/core/graph'
import { computePathTrace } from '../../src/core/pathTrace'
import { emptyPackProgress } from '../../src/core/progress'
import { detectCycles, normalizePackToV2 } from '../../src/core/schema'

const raw = JSON.parse(readFileSync(join(process.cwd(), 'resources/packs/cs-math.json'), 'utf-8'))
const norm = normalizePackToV2(raw)
if (!norm.ok) throw new Error('cs-math 包校验失败: ' + norm.errors.slice(0, 5).join('; '))

describe('resources/packs/cs-math.json 回归 (pack-v2)', () => {
  const pack = norm.pack
  const index = buildGraphIndex(pack)

  it('无损适配为 litree/pack-v2 并保持基础元数据', () => {
    expect(pack.schema).toBe('litree/pack-v2')
    expect(pack.id).toBe('cs-math')
    expect(pack.title.zh).toBe('计算机 + 数学')
    expect(pack.title.en).toBe('CS & Math')
    expect(detectCycles(pack.nodes, pack.edges)).toBeNull()
  })

  it('对账：10013 节点（1525 branch / 202 unit / 8286 leaf）/ 690 边（279 hard / 411 soft）/ 12 路线', () => {
    const branches = pack.nodes.filter((n) => n.kind === 'branch')
    const units = pack.nodes.filter((n) => n.kind === 'unit')
    const leaves = pack.nodes.filter((n) => n.kind === 'leaf')
    const hard = pack.edges.filter((e) => e.type === 'hard')
    const soft = pack.edges.filter((e) => e.type === 'soft')
    expect(pack.nodes.length).toBe(10013)
    expect(branches.length).toBe(1525)
    expect(units.length).toBe(202)
    expect(leaves.length).toBe(8286)
    expect(pack.edges.length).toBe(690)
    expect(hard.length).toBe(279)
    expect(soft.length).toBe(411)
    expect(pack.edges.every((e) => typeof e.reason === 'string' && e.reason.length > 0)).toBe(true)
    expect(pack.routes.length).toBe(12)
  })

  it('结构：11 个学科根、数学 3 lane 挂 M 下、13 个域', () => {
    const roots = pack.nodes.filter((n) => n.parentId === null)
    const topLevelBranches = pack.nodes.filter(
      (n) => n.kind === 'branch' && (n.parentId === null || n.parentId === 'M')
    )
    const lanesWithParent = topLevelBranches.filter((n) => n.parentId === 'M')
    expect(roots.length).toBe(11)
    expect(topLevelBranches.length).toBe(14)
    expect(lanesWithParent.map((n) => n.id).sort()).toEqual(['M1', 'M2', 'M3'])
    expect(pack.domains.length).toBe(13)
  })

  it('修复章分组叶子的 owningUnit / owningBranch 与多入度边 reason 保留', () => {
    const leaf = index.nodesById.get('M.1.1.k0')
    expect(leaf).toBeDefined()
    expect(leaf?.parentId).toBe('M.1.1.c0')
    expect(index.owningUnit('M.1.1.k0')).toBe('M.1.1')
    expect(index.owningBranch('M.1.1.k0')).toBe('M1')

    expect(index.hardPrereqsOf('M.2.2').length).toBe(3)
    expect(index.softPrereqsOf('M.2.2').length).toBe(2)
    expect(index.edgeReasons.get('M.2.2')?.length).toBe(5)
    expect(index.edgeReasons.get('S.2.1')?.length).toBe(3)
  })

  it('空单元 S.2.1 与全量 10k 节点视觉状态计算安全', () => {
    expect(index.leavesOf('S.2.1').length).toBe(0)
    const emptySet = new Set<string>()
    expect(isLit('S.2.1', index, emptySet)).toBe(false)

    const trace = computePathTrace('S.2.1', index, emptySet)
    expect(trace.targetUnitId).toBe('S.2.1')
    expect(trace.chain.length).toBeGreaterThan(0)
    expect(trace.blockers.some((b) => b.code === 'no-available-leaf' && b.unitId === 'S.2.1')).toBe(true)

    // All 202 units have 0 topological inversions in minimalHardClosure
    const units = pack.nodes.filter((n) => n.kind === 'unit')
    for (const u of units) {
      const closure = minimalHardClosure(u.id, index, emptySet)
      const pos = new Map<string, number>()
      closure.forEach((id, idx) => pos.set(id, idx))
      for (const id of closure) {
        const iPos = pos.get(id)!
        for (const pre of index.hardPrereqsOf(id)) {
          const pPos = pos.get(pre.id)
          if (pPos !== undefined) {
            expect(pPos).toBeLessThan(iPos)
          }
        }
      }
    }

    const progress = emptyPackProgress('cs-math')
    for (const n of pack.nodes) {
      const state = computeNodeVisualState(n.id, index, progress, emptySet)
      expect(['locked', 'available']).toContain(state)
    }
  })
})
