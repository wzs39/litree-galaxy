import { normalizePackToV2 } from './schema'
import { applyCurationOverlay, type StorageService } from './storage'
import type { PackCurationOverlay, PackDocument, PackMeta } from './types'

export interface PackLoaderDeps {
  fetchFn?: typeof fetch
  storage: StorageService
  basePath?: string
  timeoutMs?: number
}

export interface PackLoader {
  listPacks(): Promise<PackMeta[]>
  loadBasePack(
    packId: string
  ): Promise<{ ok: true; pack: PackDocument } | { ok: false; error: string }>
  loadPack(packId: string): Promise<
    | {
        ok: true
        pack: PackDocument
        basePack: PackDocument
        curation: PackCurationOverlay | null
        warnings: string[]
      }
    | { ok: false; error: string }
  >
  defaultPackId(): Promise<string>
  importCustomPack(
    jsonText: string
  ): Promise<{ ok: true; pack: PackDocument } | { ok: false; error: string }>
  deleteCustomPack(packId: string): Promise<void>
  clearCache(): void
}

interface RawManifestEntry {
  id: string
  title: string | { zh: string; en?: string }
  file: string
  description?: string
  nodeCount?: number
}

export function createPackLoader(deps: PackLoaderDeps): PackLoader {
  const fetchImpl = deps.fetchFn ?? ((...args: Parameters<typeof fetch>) => fetch(...args))
  const basePath = (deps.basePath ?? 'packs').replace(/\/+$/, '')
  const timeoutMs = deps.timeoutMs ?? 10_000

  let manifestCache: PackMeta[] | null = null
  let manifestPromise: Promise<PackMeta[]> | null = null
  const basePackCache = new Map<string, PackDocument>()

  const fetchWithTimeout = async (url: string): Promise<Response> => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetchImpl(url, { signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
  }

  const getManifest = async (): Promise<PackMeta[]> => {
    if (manifestCache) return manifestCache
    if (manifestPromise) return manifestPromise
    manifestPromise = (async () => {
      try {
        const url = `${basePath}/index.json`
        const res = await fetchWithTimeout(url)
        if (!res.ok) {
          throw new Error(`Failed to fetch pack manifest "${url}" (HTTP ${res.status})`)
        }
        const raw = (await res.json()) as unknown
        if (!Array.isArray(raw)) {
          throw new Error(`Invalid pack manifest at "${url}": expected array`)
        }
        const metas: PackMeta[] = []
        for (const item of raw) {
          if (typeof item !== 'object' || item === null) continue
          const entry = item as Partial<RawManifestEntry>
          if (typeof entry.id !== 'string' || typeof entry.file !== 'string') continue
          const title =
            typeof entry.title === 'string'
              ? { zh: entry.title }
              : entry.title && typeof entry.title === 'object' && typeof entry.title.zh === 'string'
                ? entry.title
                : { zh: entry.id }
          metas.push({
            id: entry.id,
            title,
            file: entry.file,
            source: 'builtin',
            ...(typeof entry.description === 'string' ? { description: entry.description } : {}),
            ...(typeof entry.nodeCount === 'number' ? { nodeCount: entry.nodeCount } : {})
          })
        }
        manifestCache = metas
        return metas
      } finally {
        manifestPromise = null
      }
    })()
    return manifestPromise
  }

  return {
    async listPacks() {
      const [builtin, custom] = await Promise.all([
        getManifest(),
        deps.storage.listCustomPacks()
      ])
      const seen = new Set(builtin.map((b) => b.id))
      return [...builtin, ...custom.filter((c) => !seen.has(c.id))]
    },

    async loadBasePack(packId) {
      const cached = basePackCache.get(packId)
      if (cached) return { ok: true, pack: cached }

      const custom = await deps.storage.loadCustomPack(packId)
      if (custom) {
        basePackCache.set(packId, custom)
        return { ok: true, pack: custom }
      }

      let manifest: PackMeta[]
      try {
        manifest = await getManifest()
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : String(err)
        }
      }

      const entry = manifest.find((m) => m.id === packId)
      if (!entry || !entry.file) {
        return { ok: false, error: `Pack "${packId}" not found in manifest` }
      }

      const url = `${basePath}/${entry.file}`
      let raw: unknown
      try {
        const res = await fetchWithTimeout(url)
        if (!res.ok) {
          return {
            ok: false,
            error: `Failed to fetch pack "${packId}" from "${url}" (HTTP ${res.status})`
          }
        }
        raw = await res.json()
      } catch (err) {
        return {
          ok: false,
          error: `Network/parse error loading pack "${packId}": ${err instanceof Error ? err.message : String(err)}`
        }
      }

      const norm = normalizePackToV2(raw, { source: 'builtin' })
      if (!norm.ok) {
        return {
          ok: false,
          error: `Invalid pack "${packId}": ${norm.errors.slice(0, 3).join('; ')}`
        }
      }

      basePackCache.set(packId, norm.pack)
      return { ok: true, pack: norm.pack }
    },

    async loadPack(packId) {
      const baseRes = await this.loadBasePack(packId)
      if (!baseRes.ok) return baseRes

      const curation = await deps.storage.loadCuration(packId)
      const { pack, warnings } = applyCurationOverlay(baseRes.pack, curation)
      return {
        ok: true,
        pack,
        basePack: baseRes.pack,
        curation,
        warnings
      }
    },

    async defaultPackId() {
      const override = await deps.storage.getPackOverride()
      const packs = await this.listPacks()
      if (override && packs.some((p) => p.id === override)) {
        return override
      }
      return packs[0]?.id ?? 'cs-math'
    },

    async importCustomPack(jsonText) {
      let parsed: unknown
      try {
        parsed = JSON.parse(jsonText)
      } catch {
        return { ok: false, error: 'Invalid JSON syntax in custom pack' }
      }

      const norm = normalizePackToV2(parsed, { source: 'custom' })
      if (!norm.ok) {
        return {
          ok: false,
          error: `Invalid custom pack: ${norm.errors.slice(0, 5).join('; ')}`
        }
      }

      await deps.storage.saveCustomPack(norm.pack)
      basePackCache.set(norm.pack.id, norm.pack)
      return { ok: true, pack: norm.pack }
    },

    async deleteCustomPack(packId) {
      basePackCache.delete(packId)
      await deps.storage.deleteCustomPack(packId)
    },

    clearCache() {
      manifestCache = null
      manifestPromise = null
      basePackCache.clear()
    }
  }
}
