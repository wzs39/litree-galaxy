import { describe, expect, it, vi } from 'vitest'
import { buildGraphIndex } from '../../src/core/graph'
import { validatePackDocument } from '../../src/core/schema'
import {
  emptyPackProgress,
  lightNodeProgress,
  toggleNodePin,
  updateNodeNote
} from '../../src/core/progress'
import {
  applyCurationOverlay,
  buildBackupV2,
  corruptProgressKey,
  createStorageService,
  curationKey,
  exportMarkdownJournal,
  isProgressV2Shape,
  mergePackProgress,
  migrateProgressV1ToV2,
  overlayAddEdge,
  overlayAddNode,
  overlayDeleteEdge,
  overlayDeleteNode,
  overlayUpdateNode,
  parseBackupImport,
  parseCurationOverlay,
  progressKey,
  type StorageLike
} from '../../src/core/storage'
import type { PackDocument, PackProgress, ProgressV1 } from '../../src/core/types'

class MemStorage implements StorageLike {
  map = new Map<string, string>()
  throwOnSet = false
  get length() {
    return this.map.size
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null
  }
  getItem(key: string) {
    return this.map.get(key) ?? null
  }
  setItem(key: string, value: string) {
    if (this.throwOnSet) throw new Error('QuotaExceededError')
    this.map.set(key, value)
  }
  removeItem(key: string) {
    this.map.delete(key)
  }
}

function makePack(): PackDocument {
  return {
    schema: 'litree/pack-v2',
    id: 'stor-pack',
    version: 1,
    title: { zh: '存储包', en: 'Storage Pack' },
    source: 'builtin',
    domains: [{ id: 'D1', name: '域一', color: '#3DD6C3' }],
    nodes: [
      { id: 'b1', parentId: null, kind: 'branch', title: { zh: '分支' }, domainId: 'D1' },
      { id: 'u1', parentId: 'b1', kind: 'unit', title: { zh: '单元一' }, domainId: 'D1' },
      { id: 'u1.k1', parentId: 'u1', kind: 'leaf', title: { zh: '点一' }, domainId: 'D1' },
      { id: 'u2', parentId: 'b1', kind: 'unit', title: { zh: '单元二' }, domainId: 'D1' },
      { id: 'u2.k1', parentId: 'u2', kind: 'leaf', title: { zh: '点二' }, domainId: 'D1' }
    ],
    edges: [{ id: 'e1', from: 'u1', to: 'u2', type: 'hard', reason: '基础前置' }],
    routes: [{ id: 'r1', name: '路线', ids: ['u1', 'u2'] }]
  }
}

describe('storage: 适配器降级、损坏隔离、v1 迁移、Curation CRUD 与备份导入导出', () => {
  it('Node 无浏览器存储降级、localStorage QuotaExceededError 优雅警告与损坏 JSON 隔离', async () => {
    const ls = new MemStorage()
    const storage = createStorageService({ indexedDB: null, localStorage: ls })

    await storage.setPackOverride('dev-mini')
    expect(await storage.getPackOverride()).toBe('dev-mini')

    // Corrupt JSON quarantine
    ls.setItem(progressKey('stor-pack'), '{{{corrupt')
    const corruptRes = await storage.loadProgress('stor-pack')
    expect(corruptRes.ok).toBe(false)
    expect(ls.getItem(corruptProgressKey('stor-pack'))).toBe('{{{corrupt')

    // Wrong shape (e.g. {}) also quarantined
    ls.setItem(progressKey('bad-shape'), '{}')
    const shapeRes = await storage.loadProgress('bad-shape')
    expect(shapeRes.ok).toBe(false)
    expect(ls.getItem(corruptProgressKey('bad-shape'))).toBe('{}')

    // QuotaExceededError handled gracefully
    ls.throwOnSet = true
    const writeRes = await storage.saveProgress(emptyPackProgress('stor-pack'))
    expect(writeRes.warning).toContain('QuotaExceededError')
  })

  it('progress-v1 (含 legacy 字符串/true 值) 无损迁移至 progress-v2 并回填 dailyActivity', async () => {
    const ls = new MemStorage()
    const storage = createStorageService({ indexedDB: null, localStorage: ls })

    const v1: ProgressV1 = {
      schema: 'litree/progress-v1',
      packId: 'stor-pack',
      lit: {
        'u1.k1': { at: '2026-05-01T10:00:00.000Z', note: 'v1 笔记' },
        'u2.k1': '2026-05-02T10:00:00.000Z'
      },
      learning: { 'u1.k2': '2026-05-03T10:00:00.000Z' },
      xp: 4,
      history: [{ id: 'u1.k1', at: '2026-05-01T10:00:00.000Z', xp: 2 }]
    }
    ls.setItem(progressKey('stor-pack'), JSON.stringify(v1))

    const loaded = await storage.loadProgress('stor-pack')
    expect(loaded.ok).toBe(true)
    if (!loaded.ok || !loaded.progress) return
    expect(loaded.migratedFromV1).toBe(true)
    expect(loaded.progress.schema).toBe('litree/progress-v2')
    expect(loaded.progress.nodes['u1.k1']?.noteMarkdown).toBe('v1 笔记')
    expect(loaded.progress.nodes['u2.k1']?.status).toBe('lit')
    expect(loaded.progress.nodes['u1.k2']?.status).toBe('learning')
    expect(loaded.progress.streakDays).toBe(2)
    expect(loaded.progress.dailyActivity['2026-05-01']?.lit).toBe(1)
    expect(loaded.progress.dailyActivity['2026-05-02']?.lit).toBe(1)

    // Direct migrateProgressV1ToV2 helper check with boolean true
    const mig2 = migrateProgressV1ToV2({
      packId: 'p',
      lit: { k1: true },
      learning: {},
      xp: 0,
      history: []
    })
    expect(mig2.progress.nodes.k1?.status).toBe('lit')
  })

  it('PackCurationOverlay CRUD、Kahn 环拦截、级联删节点与 resetCuration', async () => {
    const base = makePack()

    // Add unit + leaf
    const addUnit = overlayAddNode(base, null, {
      id: 'u3',
      parentId: 'b1',
      kind: 'unit',
      title: { zh: '单元三' },
      domainId: 'D1'
    })
    expect(addUnit.ok).toBe(true)
    if (!addUnit.ok) return

    const addLeaf = overlayAddNode(base, addUnit.data.overlay, {
      id: 'u3.k1',
      parentId: 'u3',
      kind: 'leaf',
      title: { zh: '点三' },
      domainId: 'D1'
    })
    expect(addLeaf.ok).toBe(true)
    if (!addLeaf.ok) return

    // Update node
    const upd = overlayUpdateNode(base, addLeaf.data.overlay, 'u3', { summary: '新增总结' })
    expect(upd.ok).toBe(true)
    if (!upd.ok) return

    // Add valid edge u2 -> u3
    const addEdgeOk = overlayAddEdge(base, upd.data.overlay, {
      id: 'e2',
      from: 'u2',
      to: 'u3',
      type: 'hard'
    })
    expect(addEdgeOk.ok).toBe(true)
    if (!addEdgeOk.ok) return

    // Cycle check: adding u3 -> u1 creates u1 -> u2 -> u3 -> u1
    const addEdgeCycle = overlayAddEdge(base, addEdgeOk.data.overlay, {
      from: 'u3',
      to: 'u1',
      type: 'hard'
    })
    expect(addEdgeCycle.ok).toBe(false)
    if (!addEdgeCycle.ok) {
      expect(addEdgeCycle.cyclePath).toBeDefined()
      expect(addEdgeCycle.cycleEdgeIds).toContain('e1')
    }

    // Related edge u3 -> u1 is allowed
    const addRelated = overlayAddEdge(base, addEdgeOk.data.overlay, {
      id: 'rel1',
      from: 'u3',
      to: 'u1',
      type: 'related'
    })
    expect(addRelated.ok).toBe(true)
    if (!addRelated.ok) return

    const applied = applyCurationOverlay(base, addRelated.data.overlay)
    expect(applied.pack.nodes.some((n) => n.id === 'u3.k1')).toBe(true)
    expect(applied.pack.nodes.find((n) => n.id === 'u3')?.summary).toBe('新增总结')

    // Delete edge & cascade delete u3
    const delEdge = overlayDeleteEdge(base, addRelated.data.overlay, 'rel1')
    expect(delEdge.ok).toBe(true)
    if (!delEdge.ok) return

    const delNode = overlayDeleteNode(base, delEdge.data, 'u3')
    expect(delNode.ok).toBe(true)
    if (!delNode.ok) return
    expect(delNode.data.deletedIds).toContain('u3')
    expect(delNode.data.deletedIds).toContain('u3.k1')

    const afterDel = applyCurationOverlay(base, delNode.data.overlay)
    expect(afterDel.pack.nodes.some((n) => n.id === 'u3' || n.id === 'u3.k1')).toBe(false)
  })

  it('litree/backup-v2 导出/导入、v1 单包导入、损坏 JSON 防护与 Markdown 学习日志导出', () => {
    const pack = makePack()
    const index = buildGraphIndex(pack)
    let prog = emptyPackProgress(pack.id)
    prog = lightNodeProgress(prog, 'u1.k1', index, { at: '2026-06-01T10:00:00.000Z', mode: 'gated' })
    prog = updateNodeNote(prog, 'u2.k1', '锁定节点预习笔记')

    const backup = buildBackupV2({
      progressByPack: { [pack.id]: prog },
      customPacks: [pack],
      settings: { theme: 'daylight', quality: 'high' }
    })
    const json = JSON.stringify(backup)
    const parsed = parseBackupImport(json)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.backup.progressByPack[pack.id]?.nodes['u2.k1']?.noteMarkdown).toBe('锁定节点预习笔记')
    expect(parsed.backup.customPacks.length).toBe(1)

    // Merge idempotency
    const merged = mergePackProgress(prog, prog, 'merge')
    expect(merged.xp).toBe(prog.xp)
    expect(merged.dailyActivity['2026-06-01']?.lit).toBe(1)

    // Bad JSON / array / wrong schema
    expect(parseBackupImport('{bad').ok).toBe(false)
    expect(parseBackupImport('[]').ok).toBe(false)
    expect(parseBackupImport(JSON.stringify({ schema: 'wrong' })).ok).toBe(false)

    // Markdown journal includes locked node note!
    const md = exportMarkdownJournal(pack, prog, new Date('2026-06-01T12:00:00.000Z'))
    expect(md).toContain('# 存储包 (Storage Pack) — Study Journal')
    expect(md).toContain('锁定节点预习笔记')
  })

  it('严格校验 PackCurationOverlay、isProgressV2Shape 与所有入口的危险 URL 过滤', async () => {
    const ls = new MemStorage()
    const storage = createStorageService({ indexedDB: null, localStorage: ls })

    // Malformed PackCurationOverlay in localStorage returns null instead of crashing applyCurationOverlay
    ls.setItem(
      curationKey('stor-pack'),
      JSON.stringify({ schema: 'litree/overlay-v1', packId: 'stor-pack', addedNodes: [] })
    )
    expect(await storage.loadCuration('stor-pack')).toBeNull()

    // Malformed overlay inside backup-v2 is skipped with warning
    const prog = emptyPackProgress('stor-pack')
    const badOvBackup = {
      schema: 'litree/backup-v2',
      exportedAt: '2026-06-01T00:00:00.000Z',
      progressByPack: { 'stor-pack': prog },
      curationByPack: {
        'stor-pack': { addedNodes: [], deletedNodeIds: [] } // missing packId, updatedNodes, addedEdges, deletedEdgeIds
      },
      customPacks: []
    }
    const parsedBadOv = parseBackupImport(JSON.stringify(badOvBackup))
    expect(parsedBadOv.ok).toBe(true)
    if (parsedBadOv.ok) {
      expect(parsedBadOv.backup.curationByPack['stor-pack']).toBeUndefined()
      expect(parsedBadOv.warnings.some((w) => w.includes('malformed curation'))).toBe(true)
    }

    // applyCurationOverlay guards missing optional/malformed fields without throwing TypeError
    const safeApplied = applyCurationOverlay(makePack(), {
      packId: 'stor-pack',
      updatedAt: '2026-06-01T00:00:00.000Z',
      addedNodes: [],
      updatedNodes: undefined as unknown as Record<string, never>,
      deletedNodeIds: [],
      addedEdges: undefined as unknown as [],
      deletedEdgeIds: []
    })
    expect(safeApplied.pack.nodes.length).toBe(5)

    // isProgressV2Shape rejects null/primitive node entries
    expect(
      isProgressV2Shape({
        ...prog,
        nodes: { 'u1.k1': null }
      })
    ).toBe(false)

    // javascript:/data:/vbscript: URLs stripped in parseBackupImport (customResources + curation addedNodes/updatedNodes)
    const xssBackup = {
      schema: 'litree/backup-v2',
      exportedAt: '2026-06-01T00:00:00.000Z',
      progressByPack: {
        'stor-pack': {
          ...prog,
          nodes: {
            'u1.k1': {
              status: 'lit',
              reviewCount: 0,
              leitnerBox: 1,
              mastery: 1,
              customResources: [
                { id: 'r1', title: 'Evil', url: 'javascript:alert(1)', addedAt: '2026-06-01T00:00:00.000Z' },
                { id: 'r2', title: 'Data', url: 'data:text/html,<script>1</script>', addedAt: '2026-06-01T00:00:00.000Z' },
                { id: 'r3', title: 'Safe', url: 'https://example.com', addedAt: '2026-06-01T00:00:00.000Z' }
              ]
            }
          }
        }
      },
      curationByPack: {
        'stor-pack': {
          schema: 'litree/overlay-v1',
          packId: 'stor-pack',
          updatedAt: '2026-06-01T00:00:00.000Z',
          addedNodes: [
            {
              id: 'u3',
              parentId: 'b1',
              kind: 'unit',
              title: { zh: '新单元' },
              domainId: 'D1',
              resources: [
                { title: 'Bad', url: 'vbscript:msgbox(1)' },
                { title: 'Good', url: 'http://example.org/docs' }
              ]
            }
          ],
          updatedNodes: {
            u1: {
              resources: [{ title: 'JS', url: '  JAVASCRIPT:alert(2) ' }]
            }
          },
          deletedNodeIds: [],
          addedEdges: [],
          deletedEdgeIds: []
        }
      },
      customPacks: []
    }
    const sanitized = parseBackupImport(JSON.stringify(xssBackup))
    expect(sanitized.ok).toBe(true)
    if (sanitized.ok) {
      const resList = sanitized.backup.progressByPack['stor-pack']?.nodes['u1.k1']?.customResources ?? []
      expect(resList.map((r) => r.url)).toEqual(['https://example.com'])

      const ov = sanitized.backup.curationByPack['stor-pack']!
      expect(ov.addedNodes[0]?.resources?.map((r) => r.url)).toEqual(['http://example.org/docs'])
      expect(ov.updatedNodes.u1?.resources).toEqual([])
    }

    // loadProgress and loadCuration also strip unsafe URLs
    ls.setItem(progressKey('stor-pack'), JSON.stringify(xssBackup.progressByPack['stor-pack']))
    const loadedProg = await storage.loadProgress('stor-pack')
    expect(loadedProg.ok).toBe(true)
    if (loadedProg.ok) {
      expect(loadedProg.progress?.nodes['u1.k1']?.customResources?.map((r) => r.url)).toEqual([
        'https://example.com'
      ])
    }
    ls.setItem(curationKey('stor-pack'), JSON.stringify(xssBackup.curationByPack['stor-pack']))
    const loadedCur = await storage.loadCuration('stor-pack')
    expect(loadedCur?.addedNodes[0]?.resources?.map((r) => r.url)).toEqual(['http://example.org/docs'])
  })

  it('overlayUpdateNode 拒绝破坏树/边不变量的 kind 变更，并在多次更新中保留 title.en', () => {
    const base = makePack()

    // Cannot downgrade unit u1 to branch (descendant leaf u1.k1 loses unit ancestor AND u1 has hard edge)
    const badUnitToBranch = overlayUpdateNode(base, null, 'u1', { kind: 'branch' })
    expect(badUnitToBranch.ok).toBe(false)

    // Cannot change branch b1 to leaf while it has children
    const badBranchToLeaf = overlayUpdateNode(base, null, 'b1', { kind: 'leaf' })
    expect(badBranchToLeaf.ok).toBe(false)

    // Sequential title patches preserve title.en in overlay.updatedNodes on reload
    const p1 = overlayUpdateNode(base, null, 'u1', { title: { zh: '改名一', en: 'CustomEN' } })
    expect(p1.ok).toBe(true)
    if (!p1.ok) return
    const p2 = overlayUpdateNode(base, p1.data.overlay, 'u1', { title: { zh: '改名二' } })
    expect(p2.ok).toBe(true)
    if (!p2.ok) return

    const replayed = applyCurationOverlay(base, p2.data.overlay)
    const u1 = replayed.pack.nodes.find((n) => n.id === 'u1')
    expect(u1?.title).toEqual({ zh: '改名二', en: 'CustomEN' })
  })

  it('overlayAddNode 同毫秒 create->delete->create 不冲突，且删除后重建同 base ID 不复活旧节点', () => {
    const base = makePack()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T12:00:00.000Z'))
    try {
      const c1 = overlayAddNode(base, null, { parentId: 'b1', kind: 'unit', title: { zh: 'A' }, domainId: 'D1' })
      expect(c1.ok).toBe(true)
      if (!c1.ok) return
      const c2 = overlayAddNode(base, c1.data.overlay, { parentId: 'b1', kind: 'unit', title: { zh: 'B' }, domainId: 'D1' })
      expect(c2.ok).toBe(true)
      if (!c2.ok) return
      const del = overlayDeleteNode(base, c2.data.overlay, c1.data.node.id)
      expect(del.ok).toBe(true)
      if (!del.ok) return
      const c3 = overlayAddNode(base, del.data.overlay, { parentId: 'b1', kind: 'unit', title: { zh: 'C' }, domainId: 'D1' })
      expect(c3.ok).toBe(true)
      if (c3.ok) {
        expect(c3.data.node.id).not.toBe(c2.data.node.id)
      }
    } finally {
      vi.useRealTimers()
    }

    // Delete base node u1 then recreate with same id 'u1'
    const delBase = overlayDeleteNode(base, null, 'u1')
    expect(delBase.ok).toBe(true)
    if (!delBase.ok) return
    const readd = overlayAddNode(base, delBase.data.overlay, {
      id: 'u1',
      parentId: 'b1',
      kind: 'unit',
      title: { zh: '全新单元一' },
      domainId: 'D1'
    })
    expect(readd.ok).toBe(true)
    if (!readd.ok) return

    const applied = applyCurationOverlay(base, readd.data.overlay)
    expect(applied.warnings).toEqual([])
    expect(applied.pack.nodes.find((n) => n.id === 'u1')?.title.zh).toBe('全新单元一')
    // Deleted child u1.k1 stays deleted
    expect(applied.pack.nodes.some((n) => n.id === 'u1.k1')).toBe(false)
  })

  it('mergePackProgress 保留高 Box 的 nextReviewAt、日志输出 unit 置顶、列举 localStorage 中的进度包', async () => {
    const cur: PackProgress = {
      ...emptyPackProgress('stor-pack'),
      nodes: {
        'u1.k1': {
          status: 'lit',
          litAt: '2026-05-01T00:00:00.000Z',
          lastReviewedAt: '2026-05-20T00:00:00.000Z',
          nextReviewAt: '2026-06-03T00:00:00.000Z',
          reviewCount: 3,
          leitnerBox: 4,
          mastery: 3
        }
      }
    }
    const inc: PackProgress = {
      ...emptyPackProgress('stor-pack'),
      nodes: {
        'u1.k1': {
          status: 'lit',
          litAt: '2026-05-01T00:00:00.000Z',
          lastReviewedAt: '2026-05-02T00:00:00.000Z',
          nextReviewAt: '2026-05-03T00:00:00.000Z',
          reviewCount: 1,
          leitnerBox: 1,
          mastery: 1
        }
      }
    }
    const merged = mergePackProgress(cur, inc, 'merge')
    expect(merged.nodes['u1.k1']?.leitnerBox).toBe(4)
    expect(merged.nodes['u1.k1']?.nextReviewAt).toBe('2026-06-03T00:00:00.000Z')

    // exportMarkdownJournal emits Pinned: true on pinned unit
    const pack = makePack()
    const unitPinnedProg = toggleNodePin(emptyPackProgress(pack.id), 'u1')
    const md = exportMarkdownJournal(pack, unitPinnedProg, new Date('2026-06-01T12:00:00.000Z'))
    expect(md).toContain('### 单元一 (u1)\n- Pinned: true')

    // listAllKnownProgressPackIds scans localStorage keys (excluding :corrupt)
    const ls = new MemStorage()
    ls.setItem(progressKey('extra-pack'), '{}')
    ls.setItem(corruptProgressKey('broken-pack'), '{{{')
    const storage = createStorageService({ indexedDB: null, localStorage: ls })
    const ids = await storage.listAllKnownProgressPackIds()
    expect(ids).toContain('extra-pack')
    expect(ids).not.toContain('broken-pack')
  })

  it('overlayUpdateNode 拒绝将 unit 内章节分支 reparent 出 unit 导致后代 leaf 失孤，但允许保留 unit 祖先的合法 reparent', () => {
    const base = makePack()

    // u1 -> subB (branch) -> subL (leaf)
    const r1 = overlayAddNode(base, null, {
      id: 'subB',
      parentId: 'u1',
      kind: 'branch',
      title: { zh: '子章节' },
      domainId: 'D1'
    })
    expect(r1.ok).toBe(true)
    if (!r1.ok) return

    const r2 = overlayAddNode(base, r1.data.overlay, {
      id: 'subL',
      parentId: 'subB',
      kind: 'leaf',
      title: { zh: '子知识点' },
      domainId: 'D1'
    })
    expect(r2.ok).toBe(true)
    if (!r2.ok) return

    // Reparenting subB out to root branch b1 would leave subL without a unit ancestor
    const badReparent = overlayUpdateNode(base, r2.data.overlay, 'subB', { parentId: 'b1' })
    expect(badReparent.ok).toBe(false)
    if (!badReparent.ok) {
      expect(badReparent.error).toContain('subL')
      expect(badReparent.error).toContain('unit ancestor')
    }

    // Reparenting subB to root null is also rejected
    const badReparentRoot = overlayUpdateNode(base, r2.data.overlay, 'subB', { parentId: null })
    expect(badReparentRoot.ok).toBe(false)

    // Nested u1 -> subB1 -> subB2 -> subL2: reparenting subB2 under u1 or u2 preserves unit ancestor
    const r3 = overlayAddNode(base, r2.data.overlay, {
      id: 'subB2',
      parentId: 'subB',
      kind: 'branch',
      title: { zh: '二级章节' },
      domainId: 'D1'
    })
    expect(r3.ok).toBe(true)
    if (!r3.ok) return

    const r4 = overlayAddNode(base, r3.data.overlay, {
      id: 'subL2',
      parentId: 'subB2',
      kind: 'leaf',
      title: { zh: '二级知识点' },
      domainId: 'D1'
    })
    expect(r4.ok).toBe(true)
    if (!r4.ok) return

    const okUnderU1 = overlayUpdateNode(base, r4.data.overlay, 'subB2', { parentId: 'u1' })
    expect(okUnderU1.ok).toBe(true)
    if (!okUnderU1.ok) return

    const okUnderU2 = overlayUpdateNode(base, okUnderU1.data.overlay, 'subB2', { parentId: 'u2' })
    expect(okUnderU2.ok).toBe(true)
    if (!okUnderU2.ok) return

    const applied = applyCurationOverlay(base, okUnderU2.data.overlay)
    expect(validatePackDocument(applied.pack).ok).toBe(true)
    const idx = buildGraphIndex(applied.pack)
    expect(idx.owningUnit('subL2')).toBe('u2')
    expect(idx.owningUnit('subL')).toBe('u1')

    // Cycle reparenting b1 under its descendant subB is also rejected
    const cycleReparent = overlayUpdateNode(base, okUnderU2.data.overlay, 'b1', { parentId: 'subB' })
    expect(cycleReparent.ok).toBe(false)
  })

  it('parseCurationOverlay 与 applyCurationOverlay 安全处理畸形 updatedRoutes[id].ids 与 updatedNodes[id].title', () => {
    const base = makePack()
    const warnings: string[] = []
    const parsed = parseCurationOverlay(
      {
        schema: 'litree/overlay-v1',
        packId: 'stor-pack',
        updatedAt: '2026-06-01T00:00:00.000Z',
        addedNodes: [],
        updatedNodes: {
          u1: { title: 'bad', summary: '保留的摘要' },
          u2: { title: { zh: 123 } }
        },
        deletedNodeIds: [],
        addedEdges: [],
        deletedEdgeIds: [],
        updatedRoutes: {
          r1: { ids: null },
          r_ok: { name: '有效名', ids: ['u1'] }
        }
      },
      warnings
    )
    expect(parsed).not.toBeNull()
    if (!parsed) return

    expect(parsed.updatedNodes.u1?.title).toBeUndefined()
    expect(parsed.updatedNodes.u1?.summary).toBe('保留的摘要')
    expect(parsed.updatedNodes.u2?.title).toBeUndefined()
    expect(parsed.updatedRoutes?.r1).toBeUndefined()
    expect(parsed.updatedRoutes?.r_ok).toEqual({ name: '有效名', ids: ['u1'] })
    expect(warnings.length).toBeGreaterThanOrEqual(3)

    // Direct applyCurationOverlay with unparsed malformed fields does not throw TypeError or corrupt title/routes
    const directApplied = applyCurationOverlay(base, {
      schema: 'litree/overlay-v1',
      packId: 'stor-pack',
      updatedAt: '2026-06-01T00:00:00.000Z',
      addedNodes: [],
      updatedNodes: {
        u1: { title: 'bad' as unknown as { zh: string }, summary: '直接摘要' }
      },
      deletedNodeIds: [],
      addedEdges: [],
      deletedEdgeIds: [],
      updatedRoutes: {
        r1: { ids: null as unknown as string[] }
      }
    })
    const u1 = directApplied.pack.nodes.find((n) => n.id === 'u1')
    expect(u1?.title).toEqual({ zh: '单元一' })
    expect(u1?.summary).toBe('直接摘要')
    expect(directApplied.pack.routes.find((r) => r.id === 'r1')?.ids).toEqual(['u1', 'u2'])
  })

  it('isProgressV2Shape、parseBackupImport 与 mergePackProgress 安全处理 null dailyActivity 与非数值 leitnerBox', () => {
    const baseProg = emptyPackProgress('stor-pack')

    // Malformed dailyActivity entry (null) rejected by isProgressV2Shape and parseBackupImport
    const badActivityProg = {
      ...baseProg,
      dailyActivity: { '2026-06-01': null }
    }
    expect(isProgressV2Shape(badActivityProg)).toBe(false)

    const badActivityBackup = parseBackupImport(
      JSON.stringify({
        schema: 'litree/backup-v2',
        exportedAt: '2026-06-01T00:00:00.000Z',
        progressByPack: { 'stor-pack': badActivityProg },
        curationByPack: {},
        customPacks: []
      })
    )
    expect(badActivityBackup.ok).toBe(false)

    // Non-numeric leitnerBox rejected by isProgressV2Shape and parseBackupImport
    const badBoxProg = {
      ...baseProg,
      nodes: {
        'u1.k1': {
          status: 'lit',
          reviewCount: 0,
          leitnerBox: 'bad',
          mastery: 1
        }
      }
    }
    expect(isProgressV2Shape(badBoxProg)).toBe(false)

    const badBoxBackup = parseBackupImport(JSON.stringify(badBoxProg))
    expect(badBoxBackup.ok).toBe(false)

    // Direct mergePackProgress with malformed dailyActivity / non-numeric leitnerBox produces zero NaN or TypeError
    const validCur: PackProgress = {
      ...baseProg,
      nodes: {
        'u1.k1': {
          status: 'lit',
          litAt: '2026-06-01T00:00:00.000Z',
          reviewCount: 1,
          leitnerBox: 2,
          mastery: 2
        }
      },
      dailyActivity: {
        '2026-06-01': { lit: 1, reviewed: 0, focusMinutes: 0, xp: 2 }
      }
    }
    const merged = mergePackProgress(
      validCur,
      {
        ...badActivityProg,
        nodes: {
          'u1.k1': {
            status: 'lit',
            reviewCount: 'bad' as unknown as number,
            leitnerBox: 'bad' as unknown as number,
            mastery: NaN as unknown as number
          }
        }
      } as unknown as PackProgress,
      'merge'
    )
    expect(Number.isFinite(merged.nodes['u1.k1']?.leitnerBox)).toBe(true)
    expect(merged.nodes['u1.k1']?.leitnerBox).toBe(2)
    expect(merged.nodes['u1.k1']?.mastery).toBe(2)
    expect(merged.nodes['u1.k1']?.reviewCount).toBe(1)
    expect(merged.dailyActivity['2026-06-01']).toEqual({ lit: 1, reviewed: 0, focusMinutes: 0, xp: 2 })
  })

  it('overlayDeleteEdge + overlayAddEdge 复用已删除 base 边 ID 不复活旧边且正确处理成环与再删除', () => {
    const base = makePack() // has e1: u1 -> u2 (hard)

    // Delete base e1, add e2: u2 -> u1 (hard), then add new e1: u2 -> u1 (soft)
    const d1 = overlayDeleteEdge(base, null, 'e1')
    expect(d1.ok).toBe(true)
    if (!d1.ok) return

    const a2 = overlayAddEdge(base, d1.data, { id: 'e2', from: 'u2', to: 'u1', type: 'hard' })
    expect(a2.ok).toBe(true)
    if (!a2.ok) return

    const a1 = overlayAddEdge(base, a2.data.overlay, {
      id: 'e1',
      from: 'u2',
      to: 'u1',
      type: 'soft',
      reason: '反向软前置'
    })
    expect(a1.ok).toBe(true)
    if (!a1.ok) return

    const applied = applyCurationOverlay(base, a1.data.overlay)
    expect(applied.warnings).toEqual([])
    expect(validatePackDocument(applied.pack).ok).toBe(true)
    const e1 = applied.pack.edges.find((e) => e.id === 'e1')
    expect(e1).toEqual({ id: 'e1', from: 'u2', to: 'u1', type: 'soft', reason: '反向软前置' })
    expect(applied.pack.edges.some((e) => e.id === 'e2' && e.from === 'u2' && e.to === 'u1')).toBe(true)

    // Deleting the recreated base-ID edge e1 keeps base e1 deleted (no resurrection)
    const d2 = overlayDeleteEdge(base, a1.data.overlay, 'e1')
    expect(d2.ok).toBe(true)
    if (!d2.ok) return
    const afterReDelete = applyCurationOverlay(base, d2.data)
    expect(afterReDelete.pack.edges.some((e) => e.id === 'e1')).toBe(false)
    expect(afterReDelete.pack.edges.map((e) => e.id)).toEqual(['e2'])
  })

  it('mergePackProgress 直接调用全量防御：null existing、replace 模式、xp NaN、未覆盖旧节点、畸形数组与 null customResources', () => {
    const malformedIncoming = {
      schema: 'litree/progress-v2',
      packId: 'stor-pack',
      nodes: {
        'u1.k1': {
          status: 'lit',
          reviewCount: NaN,
          leitnerBox: 'bad',
          mastery: Infinity,
          customResources: [null, { id: 'r1', title: 'Bad', url: 'javascript:alert(1)' }],
          tags: ['ok', 123]
        }
      },
      xp: NaN,
      streakDays: -3,
      dailyActivity: { '2026-06-01': null },
      sessions: undefined,
      history: null
    } as unknown as PackProgress

    // null existing
    const mergedFromNull = mergePackProgress(null, malformedIncoming, 'merge')
    expect(mergedFromNull.xp).toBe(0)
    expect(mergedFromNull.streakDays).toBe(0)
    expect(mergedFromNull.nodes['u1.k1']?.reviewCount).toBe(0)
    expect(mergedFromNull.nodes['u1.k1']?.leitnerBox).toBe(0)
    expect(mergedFromNull.nodes['u1.k1']?.mastery).toBe(0)
    expect(mergedFromNull.nodes['u1.k1']?.customResources).toBeUndefined()
    expect(mergedFromNull.nodes['u1.k1']?.tags).toEqual(['ok'])
    expect(mergedFromNull.dailyActivity).toEqual({})
    expect(mergedFromNull.sessions).toEqual([])
    expect(mergedFromNull.history).toEqual([])

    // replace mode with malformed incoming
    const validExisting = emptyPackProgress('stor-pack')
    const replaced = mergePackProgress(validExisting, malformedIncoming, 'replace')
    expect(replaced.xp).toBe(0)
    expect(replaced.streakDays).toBe(0)
    expect(replaced.nodes['u1.k1']?.leitnerBox).toBe(0)
    expect(replaced.dailyActivity).toEqual({})
    expect(replaced.sessions).toEqual([])
    expect(replaced.history).toEqual([])

    // merge mode with malformed untouched existing node, NaN xp, null customResources, undefined sessions/history
    const badExisting = {
      ...emptyPackProgress('stor-pack'),
      xp: NaN,
      nodes: {
        'u1.k1': {
          status: 'lit',
          reviewCount: NaN,
          leitnerBox: 'bad',
          mastery: Infinity,
          customResources: [null]
        },
        'u2.k1': {
          status: 'lit',
          reviewCount: 1,
          leitnerBox: 2,
          mastery: 1,
          customResources: [null]
        }
      },
      sessions: undefined,
      history: null
    } as unknown as PackProgress

    const incOnlyU2 = {
      ...emptyPackProgress('stor-pack'),
      xp: NaN,
      nodes: {
        'u2.k1': {
          status: 'lit',
          reviewCount: 2,
          leitnerBox: 1,
          mastery: 2,
          customResources: [null, { id: 'ok', title: 'Ok', url: 'https://example.com', addedAt: '2026-06-01T00:00:00Z' }]
        }
      },
      sessions: null,
      history: undefined
    } as unknown as PackProgress

    const mergedExisting = mergePackProgress(badExisting, incOnlyU2, 'merge')
    expect(Number.isFinite(mergedExisting.xp)).toBe(true)
    expect(mergedExisting.xp).toBe(4) // 2 lit nodes * XP_PER_LEAF
    // Untouched u1.k1 from existing is sanitized
    expect(mergedExisting.nodes['u1.k1']?.reviewCount).toBe(0)
    expect(mergedExisting.nodes['u1.k1']?.leitnerBox).toBe(0)
    expect(mergedExisting.nodes['u1.k1']?.mastery).toBe(0)
    expect(mergedExisting.nodes['u1.k1']?.customResources).toBeUndefined()
    // Merged u2.k1 filters null customResources
    expect(mergedExisting.nodes['u2.k1']?.customResources?.map((r) => r.url)).toEqual([
      'https://example.com'
    ])
    expect(mergedExisting.sessions).toEqual([])
    expect(mergedExisting.history).toEqual([])
  })

  it('纵深校验：isProgressV2Shape 拒绝负 xp/streakDays 与畸形 durationMinutes，parseCurationOverlay 剥离空 title.zh / 空 route.name，overlayUpdateNode 拒绝负 estimatedMinutes', () => {
    const base = makePack()
    const baseProg = emptyPackProgress(base.id)

    expect(isProgressV2Shape({ ...baseProg, xp: -50 })).toBe(false)
    expect(isProgressV2Shape({ ...baseProg, streakDays: -3 })).toBe(false)
    expect(
      isProgressV2Shape({
        ...baseProg,
        sessions: [{ id: 's1', nodeId: 'u1.k1', startedAt: '2026-06-01T00:00:00Z', durationMinutes: 'bad', mode: 'focus' }]
      })
    ).toBe(false)
    expect(
      isProgressV2Shape({
        ...baseProg,
        sessions: [{ id: 's1', nodeId: 'u1.k1', startedAt: '2026-06-01T00:00:00Z', durationMinutes: -10, mode: 'focus' }]
      })
    ).toBe(false)

    // exportMarkdownJournal clamps malformed numeric fields even on direct unvalidated call
    const md = exportMarkdownJournal(
      base,
      {
        ...baseProg,
        xp: -50,
        streakDays: -3,
        sessions: [{ id: 's1', nodeId: 'u1.k1', startedAt: '', durationMinutes: 'bad' as unknown as number, mode: 'focus' }]
      },
      new Date('2026-06-01T00:00:00.000Z')
    )
    expect(md).toContain('- XP: 0\n')
    expect(md).toContain('- Streak: 0 days\n')
    expect(md).toContain('- Total Focus: 0 min\n')

    // parseCurationOverlay strips empty title.zh, non-string addedNodes title.en, empty route names
    const warnings: string[] = []
    const parsedOv = parseCurationOverlay(
      {
        schema: 'litree/overlay-v1',
        packId: base.id,
        updatedAt: '2026-06-01T00:00:00.000Z',
        addedNodes: [
          { id: 'u3', parentId: 'b1', kind: 'unit', title: { zh: '   ' }, domainId: 'D1' },
          { id: 'u4', parentId: 'b1', kind: 'unit', title: { zh: '有效新单元', en: 123 }, domainId: 'D1' }
        ],
        updatedNodes: {
          u1: { title: { zh: '  ' }, summary: '保留摘要' }
        },
        deletedNodeIds: [],
        addedEdges: [],
        deletedEdgeIds: [],
        addedRoutes: [
          { id: 'r_empty', name: '  ', ids: ['u1'] },
          { id: 'r_ok', name: '有效新路线', ids: ['u1', 'u4'] }
        ],
        updatedRoutes: {
          r1: { name: '' }
        }
      },
      warnings
    )
    expect(parsedOv).not.toBeNull()
    if (!parsedOv) return
    expect(parsedOv.addedNodes.map((n) => n.id)).toEqual(['u4'])
    expect(parsedOv.addedNodes[0]?.title).toEqual({ zh: '有效新单元' })
    expect(parsedOv.updatedNodes.u1?.title).toBeUndefined()
    expect(parsedOv.updatedNodes.u1?.summary).toBe('保留摘要')
    expect(parsedOv.addedRoutes?.map((r) => r.id)).toEqual(['r_ok'])
    expect(parsedOv.updatedRoutes?.r1).toBeUndefined()

    const appliedOv = applyCurationOverlay(base, parsedOv)
    expect(validatePackDocument(appliedOv.pack).ok).toBe(true)

    // overlayAddNode & overlayUpdateNode reject negative/NaN estimatedMinutes
    const negAdd = overlayAddNode(base, null, {
      id: 'u_neg',
      parentId: 'b1',
      kind: 'unit',
      title: { zh: '负时长' },
      domainId: 'D1',
      estimatedMinutes: -5
    })
    expect(negAdd.ok).toBe(false)

    const negUpd = overlayUpdateNode(base, null, 'u1', { estimatedMinutes: -10 })
    expect(negUpd.ok).toBe(false)
    const nanUpd = overlayUpdateNode(base, null, 'u1', { estimatedMinutes: NaN })
    expect(nanUpd.ok).toBe(false)
  })

  it('overlayDeleteNode 复用已删除 base 边 ID 时既不复活旧边成环也不误删无关活跃 overlay 边', () => {
    const base = makePack() // u1, u2 with e1: u1 -> u2 (hard)
    const addU3 = overlayAddNode(base, null, {
      id: 'u3',
      parentId: 'b1',
      kind: 'unit',
      title: { zh: '单元三' },
      domainId: 'D1'
    })
    expect(addU3.ok).toBe(true)
    if (!addU3.ok) return

    // Delete base e1, add e2: u2 -> u1 (hard), then reuse id 'e1' for u2 -> u3 (soft)
    const delE1 = overlayDeleteEdge(base, addU3.data.overlay, 'e1')
    expect(delE1.ok).toBe(true)
    if (!delE1.ok) return

    const addE2 = overlayAddEdge(base, delE1.data, {
      id: 'e2',
      from: 'u2',
      to: 'u1',
      type: 'hard'
    })
    expect(addE2.ok).toBe(true)
    if (!addE2.ok) return

    const reuseE1 = overlayAddEdge(base, addE2.data.overlay, {
      id: 'e1',
      from: 'u2',
      to: 'u3',
      type: 'soft'
    })
    expect(reuseE1.ok).toBe(true)
    if (!reuseE1.ok) return

    // Counter-example A: deleting u3 removes overlay e1 (u2->u3); base e1 (u1->u2) must stay deleted (no cycle!)
    const delU3 = overlayDeleteNode(base, reuseE1.data.overlay, 'u3')
    expect(delU3.ok).toBe(true)
    if (!delU3.ok) return
    const appliedA = applyCurationOverlay(base, delU3.data.overlay)
    expect(appliedA.pack.edges.some((e) => e.id === 'e1')).toBe(false)
    expect(appliedA.pack.edges.map((e) => e.id)).toEqual(['e2'])
    expect(validatePackDocument(appliedA.pack).ok).toBe(true)

    // Counter-example B: deleting u1 (old base e1 endpoint) must NOT drop active overlay e1 (u2->u3)
    const delU1 = overlayDeleteNode(base, reuseE1.data.overlay, 'u1')
    expect(delU1.ok).toBe(true)
    if (!delU1.ok) return
    const appliedB = applyCurationOverlay(base, delU1.data.overlay)
    const activeE1 = appliedB.pack.edges.find((e) => e.id === 'e1')
    expect(activeE1).toEqual({ id: 'e1', from: 'u2', to: 'u3', type: 'soft' })
    expect(validatePackDocument(appliedB.pack).ok).toBe(true)
  })

  it('非日历日期 dailyActivity 键、等长 customResources 规范化、overlay 边缘卫生与 null incoming/nodes 防御', () => {
    const base = makePack()
    const baseProg = emptyPackProgress(base.id)

    // Non-date and invalid calendar keys rejected by isProgressV2Shape & parseBackupImport
    for (const badKey of ['bad-key', '2026-02-30', '2026-13-01', '2026-02-29']) {
      const badProg = {
        ...baseProg,
        dailyActivity: { [badKey]: { lit: 1, reviewed: 0, focusMinutes: 0, xp: 2 } }
      }
      expect(isProgressV2Shape(badProg)).toBe(false)
      expect(parseBackupImport(JSON.stringify(badProg)).ok).toBe(false)
    }
    // Leap day 2024-02-29 is valid
    expect(
      isProgressV2Shape({
        ...baseProg,
        lastStudyDate: '2024-02-29',
        dailyActivity: { '2024-02-29': { lit: 1, reviewed: 0, focusMinutes: 0, xp: 2 } }
      })
    ).toBe(true)

    // Direct mergePackProgress with non-date dailyActivity keys throws zero RangeError and skips invalid keys
    const mergedBadDates = mergePackProgress(
      baseProg,
      {
        ...baseProg,
        dailyActivity: {
          'bad-key': { lit: 2, reviewed: 0, focusMinutes: 0, xp: 4 },
          '2026-02-30': { lit: 1, reviewed: 0, focusMinutes: 0, xp: 2 },
          '2026-06-01': { lit: 1, reviewed: 0, focusMinutes: 0, xp: 2 }
        }
      },
      'merge'
    )
    expect(Object.keys(mergedBadDates.dailyActivity)).toEqual(['2026-06-01'])
    expect(mergedBadDates.lastStudyDate).toBe('2026-06-01')
    expect(mergedBadDates.streakDays).toBe(1)

    // Equal-length customResources item-level normalization (trim & id/addedAt coercion) is preserved
    const mergedRes = mergePackProgress(
      null,
      {
        ...baseProg,
        nodes: {
          'u1.k1': {
            status: 'lit',
            reviewCount: 0,
            leitnerBox: 1,
            mastery: 1,
            customResources: [
              {
                id: 123 as unknown as string,
                title: '  Ok  ',
                url: '  https://example.com  ',
                addedAt: null as unknown as string
              }
            ]
          }
        }
      },
      'merge'
    )
    const normalizedRes = mergedRes.nodes['u1.k1']?.customResources?.[0]
    expect(normalizedRes?.id).toBe('res-0')
    expect(normalizedRes?.title).toBe('Ok')
    expect(normalizedRes?.url).toBe('https://example.com')
    expect(typeof normalizedRes?.addedAt).toBe('string')

    // parseCurationOverlay strips empty addedEdges[i].id, negative estimatedMinutes, and empty title.en
    const warnings: string[] = []
    const parsedOv = parseCurationOverlay(
      {
        schema: 'litree/overlay-v1',
        packId: base.id,
        updatedAt: '2026-06-01T00:00:00.000Z',
        addedNodes: [
          {
            id: 'u3',
            parentId: 'b1',
            kind: 'unit',
            title: { zh: '新单元', en: '' },
            domainId: 'D1',
            estimatedMinutes: -15
          }
        ],
        updatedNodes: {
          u1: { title: { zh: '改一', en: '' }, estimatedMinutes: -5 }
        },
        deletedNodeIds: [],
        addedEdges: [
          { id: '   ', from: 'u1', to: 'u3', type: 'hard' },
          { id: 'e_ok', from: 'u2', to: 'u3', type: 'soft' }
        ],
        deletedEdgeIds: []
      },
      warnings
    )
    expect(parsedOv).not.toBeNull()
    if (!parsedOv) return
    expect(parsedOv.addedNodes[0]?.estimatedMinutes).toBeUndefined()
    expect(parsedOv.addedNodes[0]?.title).toEqual({ zh: '新单元' })
    expect(parsedOv.updatedNodes.u1?.estimatedMinutes).toBeUndefined()
    expect(parsedOv.updatedNodes.u1?.title).toEqual({ zh: '改一' })
    expect(parsedOv.addedEdges.map((e) => e.id)).toEqual(['e_ok'])

    const appliedOv = applyCurationOverlay(base, {
      ...parsedOv,
      updatedNodes: {
        u1: { title: { zh: '改一', en: '' } }
      }
    })
    const u1After = appliedOv.pack.nodes.find((n) => n.id === 'u1')
    expect(u1After?.title).toEqual({ zh: '改一' })
    expect('en' in (u1After?.title ?? {})).toBe(false)

    // overlayUpdateNode guards runtime non-string title.zh cleanly
    const badZhUpd = overlayUpdateNode(base, null, 'u1', {
      title: { zh: 123 as unknown as string }
    })
    expect(badZhUpd.ok).toBe(false)

    // mergePackProgress with non-record incoming & exportMarkdownJournal with null node entry do not throw
    const safeMergedNull = mergePackProgress(mergedBadDates, null as unknown as PackProgress, 'merge')
    expect(safeMergedNull.xp).toBe(mergedBadDates.xp)
    const mdNullNode = exportMarkdownJournal(
      base,
      {
        ...baseProg,
        nodes: { 'u1.k1': null as unknown as PackProgress['nodes'][string] }
      },
      new Date('2026-06-01T00:00:00.000Z')
    )
    expect(mdNullNode).toContain('- Progress: 0 / 2 leaves lit')
  })
})
