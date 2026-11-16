import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPackLoader } from '../../src/core/packLoader'
import { createAppStore } from '../../src/core/store'
import { buildBackupV2, createStorageService, progressKey, type StorageLike } from '../../src/core/storage'

class MemStorage implements StorageLike {
  map = new Map<string, string>()
  getItem(k: string) {
    return this.map.get(k) ?? null
  }
  setItem(k: string, v: string) {
    this.map.set(k, v)
  }
  removeItem(k: string) {
    this.map.delete(k)
  }
}

const PACK_A = {
  schema: 'litree/pack-v1',
  id: 'pack-a',
  title: { zh: '包 A' },
  domains: [{ id: 'D1', name: '域一', color: '#3DD6C3' }],
  nodes: [
    { id: 'b1', parent: null, kind: 'branch', title: { zh: '分支一' }, domain: 'D1' },
    { id: 'u1', parent: 'b1', kind: 'unit', title: { zh: '单元一' }, domain: 'D1' },
    { id: 'u1.k1', parent: 'u1', kind: 'leaf', title: { zh: '点一' }, domain: 'D1' },
    { id: 'u1.k2', parent: 'u1', kind: 'leaf', title: { zh: '点二' }, domain: 'D1' },
    { id: 'u2', parent: 'b1', kind: 'unit', title: { zh: '单元二' }, domain: 'D1' },
    { id: 'u2.k1', parent: 'u2', kind: 'leaf', title: { zh: '点三' }, domain: 'D1' }
  ],
  edges: [{ from: 'u1', to: 'u2', type: 'hard', reason: '前置' }],
  routes: [{ name: '入门', ids: ['u1', 'u2'] }]
}

const PACK_B = {
  schema: 'litree/pack-v1',
  id: 'pack-b',
  title: { zh: '包 B' },
  domains: [{ id: 'D2', name: '域二', color: '#F0B429' }],
  nodes: [
    { id: 'b2', parent: null, kind: 'branch', title: { zh: '分支二' }, domain: 'D2' },
    { id: 'x1', parent: 'b2', kind: 'unit', title: { zh: '单元 X' }, domain: 'D2' },
    { id: 'x1.k1', parent: 'x1', kind: 'leaf', title: { zh: '点 X' }, domain: 'D2' }
  ],
  edges: []
}

function makeTestEnv() {
  const ls = new MemStorage()
  const storage = createStorageService({ indexedDB: null, localStorage: ls })
  const fetchFn = vi.fn(async (url: string | URL | Request) => {
    const s = String(url)
    if (s === 'packs/index.json') {
      return new Response(
        JSON.stringify([
          { id: 'pack-a', title: '包 A', file: 'pack-a.json' },
          { id: 'pack-b', title: '包 B', file: 'pack-b.json' }
        ]),
        { status: 200 }
      )
    }
    if (s === 'packs/pack-a.json') return new Response(JSON.stringify(PACK_A), { status: 200 })
    if (s === 'packs/pack-b.json') return new Response(JSON.stringify(PACK_B), { status: 200 })
    return new Response('Not Found', { status: 404 })
  }) as unknown as typeof fetch
  const loader = createPackLoader({ fetchFn, storage })
  let fakeNow = Date.parse('2026-06-01T10:00:00.000Z')
  const store = createAppStore({
    storage,
    loader,
    now: () => fakeNow,
    saveDebounceMs: 500
  })
  return {
    ls,
    storage,
    loader,
    store,
    fetchFn,
    advanceNow: (ms: number) => {
      fakeNow += ms
    }
  }
}

describe('store: Zustand 全量 30 项动作、门控、防抖持久化、编辑与备份恢复', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('init / switchPack / 持久化 override / switchPack 失败不破坏当前状态', async () => {
    const { ls, store } = makeTestEnv()
    await store.getState().init()

    expect(store.getState().activePackId).toBe('pack-a')
    expect(store.getState().packs.length).toBe(2)
    expect(store.getState().pack?.nodes.length).toBe(6)

    // Switch to pack-b
    const ok = await store.getState().switchPack('pack-b')
    expect(ok).toBe(true)
    expect(store.getState().activePackId).toBe('pack-b')
    expect(await store.getState().pack?.id).toBe('pack-b')
    expect(ls.getItem('litree:pack-override')).toBe('pack-b')

    // Failed switch keeps pack-b intact
    const fail = await store.getState().switchPack('missing-pack')
    expect(fail).toBe(false)
    expect(store.getState().activePackId).toBe('pack-b')
    expect(store.getState().pack?.id).toBe('pack-b')
    expect(store.getState().error).toContain('missing-pack')
  })

  it('硬前置门控、force、batchLightUnit 级联解锁、always-on 笔记与 500ms 防抖保存', async () => {
    const { ls, store } = makeTestEnv()
    await store.getState().init()

    // Locked leaf throws without force
    await expect(store.getState().lightNode('u2.k1')).rejects.toThrow(/locked/i)

    // Always-on notes, resources, tags, pins, exercises work on locked nodes
    store.getState().updateNote('u2.k1', '锁定状态下记的笔记')
    const badRes = store.getState().addCustomResource('u2.k1', { title: 'x', url: 'ftp://bad' })
    expect(badRes.ok).toBe(false)
    const okRes = store.getState().addCustomResource('u2.k1', { title: 'Docs', url: 'https://example.com' })
    expect(okRes.ok).toBe(true)
    store.getState().toggleTag('u2.k1', '重要')
    store.getState().togglePin('u2.k1')
    store.getState().toggleExercise('u2.k1', 0)

    // Batch light u1 unlocks u2 and u2.k1
    const res = await store.getState().batchLightUnit('u1')
    expect(res.litCount).toBe(2)
    expect(res.unlockedIds).toContain('u2')
    expect(res.unlockedIds).toContain('u2.k1')
    expect(store.getState().getNodeVisualState('u2.k1')).toBe('available')

    // Unlight preserves notes/resources/tags
    await store.getState().lightNode('u2.k1')
    await store.getState().unlightNode('u2.k1')
    const entry = store.getState().progress?.nodes['u2.k1']
    expect(entry?.status).toBe('unstarted')
    expect(entry?.noteMarkdown).toBe('锁定状态下记的笔记')
    expect(entry?.customResources?.length).toBe(1)

    // Debounced save fires at 500ms
    expect(ls.getItem(progressKey('pack-a'))).toBeNull()
    await vi.advanceTimersByTimeAsync(500)
    expect(ls.getItem(progressKey('pack-a'))).not.toBeNull()
  })

  it('视图钻取、状态流转、间隔重复评分与专注计时器会话日志', async () => {
    const { store, advanceNow } = makeTestEnv()
    await store.getState().init()

    store.getState().selectNode('u1.k1')
    store.getState().hoverNode('u1')
    store.getState().enterCluster('b1')
    expect(store.getState().viewLevel).toBe('branch')
    store.getState().enterCluster('u1')
    expect(store.getState().viewLevel).toBe('unit')
    store.getState().stepBack()
    expect(store.getState().focusClusterId).toBe('b1')
    store.getState().stepBack()
    expect(store.getState().viewLevel).toBe('galaxy')

    await store.getState().setNodeStatus('u1.k1', 'queued')
    expect(store.getState().getNodeVisualState('u1.k1')).toBe('queued')
    await store.getState().setNodeStatus('u1.k1', 'learning')
    expect(store.getState().getNodeVisualState('u1.k1')).toBe('learning')
    await store.getState().setNodeStatus('u1.k1', 'lit')
    expect(store.getState().getNodeVisualState('u1.k1')).toBe('lit')

    // Advance 2 days -> review_due, then grade remembered
    advanceNow(2 * 86_400_000)
    expect(store.getState().getNodeVisualState('u1.k1')).toBe('review_due')
    store.getState().gradeReview('u1.k1', true)
    expect(store.getState().progress?.nodes['u1.k1']?.leitnerBox).toBe(2)
    expect(store.getState().getNodeVisualState('u1.k1')).toBe('lit')

    // Focus timer
    store.getState().startFocus('u1.k1', 25)
    expect(store.getState().focusTimer.running).toBe(true)
    store.getState().tickFocus(600)
    expect(store.getState().focusTimer.remainingSec).toBe(900)
    store.getState().pauseFocus()
    expect(store.getState().focusTimer.running).toBe(false)
    await store.getState().completeFocusSession()
    expect(store.getState().progress?.sessions.length).toBe(1)
    expect(store.getState().progress?.sessions[0]?.durationMinutes).toBe(10)
  })

  it('编辑模式 (createNode/updateNode/deleteNode/createEdge Kahn 环高亮/deleteEdge/resetCuration) 与备份恢复', async () => {
    const { store } = makeTestEnv()
    await store.getState().init()

    store.getState().setEditMode(true)
    const cNode = await store.getState().createNode({
      id: 'u3',
      parentId: 'b1',
      kind: 'unit',
      title: { zh: '单元三' },
      domainId: 'D1'
    })
    expect(cNode.ok).toBe(true)

    const uNode = await store.getState().updateNode('u3', { summary: '补充' })
    expect(uNode.ok).toBe(true)

    // Cycle creation sets cycleConflictEdgeIds without mutating graph
    const cycleRes = await store.getState().createEdge({
      from: 'u2',
      to: 'u1',
      type: 'hard'
    })
    expect(cycleRes.ok).toBe(false)
    expect(store.getState().cycleConflictEdgeIds.length).toBeGreaterThan(0)

    const okEdge = await store.getState().createEdge({
      id: 'e-u2-u3',
      from: 'u2',
      to: 'u3',
      type: 'hard'
    })
    expect(okEdge.ok).toBe(true)
    expect(store.getState().cycleConflictEdgeIds).toEqual([])

    // Backup export + corrupt import safety + valid import + journal
    await store.getState().lightNode('u1.k1')
    const exported = await store.getState().exportBackup()
    const badImport = await store.getState().importBackup('{{{bad')
    expect(badImport.ok).toBe(false)
    expect(store.getState().progress?.nodes['u1.k1']?.status).toBe('lit')

    await store.getState().unlightNode('u1.k1')
    const goodImport = await store.getState().importBackup(exported, 'replace')
    expect(goodImport.ok).toBe(true)
    expect(store.getState().progress?.nodes['u1.k1']?.status).toBe('lit')

    const md = store.getState().exportMarkdownJournal()
    expect(md).toContain('包 A')

    // Delete edge & node, then resetCuration
    await store.getState().deleteEdge('e-u2-u3')
    await store.getState().deleteNode('u3')
    expect(store.getState().index?.nodesById.has('u3')).toBe(false)

    await store.getState().resetCuration()
    expect(store.getState().pack?.nodes.length).toBe(6)

    // Clean orphans
    store.getState().updateNote('ghost.id', 'orphan')
    expect(store.getState().cleanOrphans()).toBe(1)
  })

  it('回归修复：init 只拉取一次 manifest、setNodeStatus(unit, unstarted) 熄灭单元、deleteNode 清理焦点与计时器、importBackup 刷新缓存、focusTimer 精确分钟数', async () => {
    const { store, fetchFn, storage } = makeTestEnv()
    await store.getState().init()

    // init() only fetches packs/index.json once (in-flight manifest deduplication)
    const indexCalls = (fetchFn as unknown as ReturnType<typeof vi.fn>).mock.calls.filter(
      (c) => String(c[0]) === 'packs/index.json'
    )
    expect(indexCalls.length).toBe(1)

    // setNodeStatus(unit, 'unstarted') unlights all unit leaves
    await store.getState().batchLightUnit('u1')
    expect(store.getState().getNodeVisualState('u1')).toBe('lit')
    await store.getState().setNodeStatus('u1', 'unstarted')
    expect(store.getState().getNodeVisualState('u1')).toBe('available')
    expect(store.getState().progress?.nodes['u1.k1']?.status).toBe('unstarted')
    expect(store.getState().progress?.nodes['u1.k2']?.status).toBe('unstarted')

    // completeFocusSession with <60s elapsed logs 1 minute, not 25 minutes
    store.getState().startFocus('u1.k1', 25)
    store.getState().tickFocus(20)
    await store.getState().completeFocusSession()
    expect(store.getState().progress?.sessions[0]?.durationMinutes).toBe(1)

    // deleteNode clears focusClusterId, clusterStack, and focusTimer pointing to deleted subtree
    const created = await store.getState().createNode({
      id: 'u3',
      parentId: 'b1',
      kind: 'unit',
      title: { zh: '临时单元' },
      domainId: 'D1'
    })
    expect(created.ok).toBe(true)
    const createdLeaf = await store.getState().createNode({
      id: 'u3.k1',
      parentId: 'u3',
      kind: 'leaf',
      title: { zh: '临时点' },
      domainId: 'D1'
    })
    expect(createdLeaf.ok).toBe(true)
    store.getState().enterCluster('b1')
    store.getState().enterCluster('u3')
    store.getState().startFocus('u3.k1', 15)
    expect(store.getState().focusClusterId).toBe('u3')

    await store.getState().deleteNode('u3')
    expect(store.getState().focusClusterId).toBe('b1')
    expect(store.getState().clusterStack).toEqual(['b1'])
    expect(store.getState().focusTimer.nodeId).toBeNull()
    expect(store.getState().focusTimer.running).toBe(false)

    // importBackup flushes pending saves and invalidates packLoader cache for customPacks
    const customV1 = {
      schema: 'litree/pack-v2' as const,
      id: 'custom-one',
      version: 1,
      title: { zh: '自定义旧版' },
      source: 'custom' as const,
      domains: [{ id: 'D1', name: 'D1', color: '#3DD6C3' }],
      nodes: [
        { id: 'cb1', parentId: null, kind: 'branch' as const, title: { zh: 'B' }, domainId: 'D1' },
        { id: 'cu1', parentId: 'cb1', kind: 'unit' as const, title: { zh: 'U' }, domainId: 'D1' },
        { id: 'cu1.k1', parentId: 'cu1', kind: 'leaf' as const, title: { zh: 'K' }, domainId: 'D1' }
      ],
      edges: [],
      routes: []
    }
    await storage.saveCustomPack(customV1)
    await store.getState().switchPack('custom-one')
    expect(store.getState().pack?.title.zh).toBe('自定义旧版')

    await store.getState().switchPack('pack-a')
    const updatedCustom = { ...customV1, version: 2, title: { zh: '自定义新版' } }
    const backupJson = JSON.stringify(
      buildBackupV2({
        progressByPack: {},
        customPacks: [updatedCustom]
      })
    )
    const imp = await store.getState().importBackup(backupJson, 'merge')
    expect(imp.ok).toBe(true)
    await store.getState().switchPack('custom-one')
    expect(store.getState().pack?.title.zh).toBe('自定义新版')
  })
})
