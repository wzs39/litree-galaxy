import { describe, expect, it, vi } from 'vitest'
import { createPackLoader } from '../../src/core/packLoader'
import { createStorageService, type StorageLike } from '../../src/core/storage'

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

const MINI_V1_PACK = {
  schema: 'litree/pack-v1',
  id: 'dev-mini',
  title: { zh: '开发迷你树' },
  domains: [{ id: 'D1', name: '域一', color: '#3DD6C3' }],
  nodes: [
    { id: 'b1', parent: null, kind: 'branch', title: { zh: '分支一' }, domain: 'D1' },
    { id: 'u1', parent: 'b1', kind: 'unit', title: { zh: '单元一' }, domain: 'D1' },
    { id: 'u1.k1', parent: 'u1', kind: 'leaf', title: { zh: '点一' }, domain: 'D1' }
  ],
  edges: []
}

describe('packLoader: 清单缓存、懒加载、pack-override 与自定义包导入', () => {
  it('listPacks 读取并缓存 packs/index.json，合并自定义包', async () => {
    const storage = createStorageService({ indexedDB: null, localStorage: new MemStorage() })
    const fetchFn = vi.fn(async (url: string | URL | Request) => {
      const s = String(url)
      if (s === 'packs/index.json') {
        return new Response(
          JSON.stringify([{ id: 'dev-mini', title: '开发迷你树', file: 'dev-mini.json' }]),
          { status: 200 }
        )
      }
      if (s === 'packs/dev-mini.json') {
        return new Response(JSON.stringify(MINI_V1_PACK), { status: 200 })
      }
      return new Response('Not Found', { status: 404 })
    }) as unknown as typeof fetch

    const loader = createPackLoader({ fetchFn, storage })
    const list1 = await loader.listPacks()
    const list2 = await loader.listPacks()
    expect(list1.length).toBe(1)
    expect(list2[0]?.title.zh).toBe('开发迷你树')
    expect(fetchFn).toHaveBeenCalledTimes(1) // manifest cached

    const p1 = await loader.loadPack('dev-mini')
    const p2 = await loader.loadPack('dev-mini')
    expect(p1.ok).toBe(true)
    expect(p2.ok).toBe(true)
    expect(fetchFn).toHaveBeenCalledTimes(2) // pack cached
  })

  it('defaultPackId 遵循合法 litree:pack-override 并忽略未知 override', async () => {
    const storage = createStorageService({ indexedDB: null, localStorage: new MemStorage() })
    const fetchFn = vi.fn(async () =>
      new Response(
        JSON.stringify([
          { id: 'cs-math', title: '数学计算机', file: 'cs-math.json' },
          { id: 'dev-mini', title: '开发迷你树', file: 'dev-mini.json' }
        ]),
        { status: 200 }
      )
    ) as unknown as typeof fetch

    const loader = createPackLoader({ fetchFn, storage })
    expect(await loader.defaultPackId()).toBe('cs-math')

    await storage.setPackOverride('dev-mini')
    expect(await loader.defaultPackId()).toBe('dev-mini')

    await storage.setPackOverride('nonexistent-pack')
    expect(await loader.defaultPackId()).toBe('cs-math')
  })

  it('处理 404 / 损坏 JSON / 非法自定义包并支持合法自定义包持久化', async () => {
    const storage = createStorageService({ indexedDB: null, localStorage: new MemStorage() })
    const fetchFn = vi.fn(async (url: string | URL | Request) => {
      const s = String(url)
      if (s === 'packs/index.json') {
        return new Response(
          JSON.stringify([{ id: 'broken', title: '坏包', file: 'broken.json' }]),
          { status: 200 }
        )
      }
      return new Response('Not Found', { status: 404 })
    }) as unknown as typeof fetch

    const loader = createPackLoader({ fetchFn, storage })
    const missingRes = await loader.loadPack('broken')
    expect(missingRes.ok).toBe(false)

    const badCustom = await loader.importCustomPack('{not-json')
    expect(badCustom.ok).toBe(false)

    const goodCustom = await loader.importCustomPack(
      JSON.stringify({ ...MINI_V1_PACK, id: 'my-custom', title: { zh: '我的树' } })
    )
    expect(goodCustom.ok).toBe(true)
    const packs = await loader.listPacks()
    expect(packs.some((p) => p.id === 'my-custom' && p.source === 'custom')).toBe(true)

    await loader.deleteCustomPack('my-custom')
    const afterDelete = await loader.listPacks()
    expect(afterDelete.some((p) => p.id === 'my-custom')).toBe(false)
  })
})
