import { useStore } from 'zustand'
import { createStore, type StoreApi } from 'zustand/vanilla'
import {
  buildGraphIndex,
  computeNodeVisualState,
  computeUnlockCascade,
  getLitLeavesSet,
  leafAvailable,
  pruneOrphanProgress,
  unitAvailable
} from './graph'
import { createPackLoader, type PackLoader } from './packLoader'
import {
  addCustomResource as addCustomResourcePure,
  emptyPackProgress,
  gradeReviewProgress,
  lightNodeProgress,
  logStudySession,
  removeCustomResource as removeCustomResourcePure,
  setNodeStatusProgress,
  toggleNodeExercise,
  toggleNodePin,
  toggleNodeTag,
  unlightNodeProgress,
  updateNodeNote,
  XP_PER_FOCUS_SESSION
} from './progress'
import {
  applyCurationOverlay,
  buildBackupV2,
  createStorageService,
  exportMarkdownJournal as exportMarkdownJournalPure,
  mergePackProgress,
  overlayAddEdge,
  overlayAddNode,
  overlayDeleteEdge,
  overlayDeleteNode,
  overlayUpdateNode,
  parseBackupImport,
  type StorageService
} from './storage'
import type {
  ActiveLens,
  AppState,
  CustomResource,
  KnowledgeEdge,
  KnowledgeNode,
  MutationResult,
  NodeVisualState,
  PackCurationOverlay,
  PackDocument,
  PackProgress,
  QualityPreset,
  ThemeMode
} from './types'

export interface AppStoreDeps {
  storage?: StorageService
  loader?: PackLoader
  now?: () => number
  saveDebounceMs?: number
}

const DEFAULT_FOCUS_MINUTES = 25

export function createAppStore(deps?: AppStoreDeps): StoreApi<AppState> {
  const storage = deps?.storage ?? createStorageService()
  const loader = deps?.loader ?? createPackLoader({ storage })
  const now = deps?.now ?? (() => Date.now())
  const saveDebounceMs = deps?.saveDebounceMs ?? 500

  let saveTimer: ReturnType<typeof setTimeout> | null = null
  let pendingSavePromise: Promise<void> | null = null

  const nowIso = () => new Date(now()).toISOString()

  const persistProgressNow = async (progress: PackProgress | null): Promise<void> => {
    if (!progress) return
    const res = await storage.saveProgress(progress)
    if (res.warning) {
      store.setState({ lastNotice: res.warning })
    }
  }

  const scheduleSave = (progress: PackProgress | null) => {
    if (!progress) return
    if (saveTimer !== null) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveTimer = null
      pendingSavePromise = persistProgressNow(store.getState().progress)
    }, saveDebounceMs)
  }

  const persistSettings = (
    activePackId: string,
    theme: ThemeMode,
    quality: QualityPreset
  ) => {
    void storage.saveSettings({ activePackId, theme, quality })
  }

  const store = createStore<AppState>()((set, get) => ({
    // Data
    packs: [],
    activePackId: 'cs-math',
    pack: null,
    basePack: null,
    curation: null,
    progress: null,
    index: null,
    loading: false,
    error: null,
    lastNotice: null,

    // View / Selection
    viewLevel: 'galaxy',
    focusClusterId: null,
    clusterStack: [],
    selectedId: null,
    hoveredId: null,
    activeDomains: [],
    activeLens: 'all',
    activeRouteId: null,
    editMode: false,
    cycleConflictEdgeIds: [],
    theme: 'nebula',
    quality: 'balanced',
    focusTimer: {
      nodeId: null,
      remainingSec: DEFAULT_FOCUS_MINUTES * 60,
      totalSec: DEFAULT_FOCUS_MINUTES * 60,
      running: false
    },

    async init() {
      set({ loading: true, error: null })
      try {
        const settings = await storage.loadSettings()
        const theme: ThemeMode =
          settings?.theme === 'daylight' || settings?.theme === 'minimal'
            ? settings.theme
            : 'nebula'
        const quality: QualityPreset =
          settings?.quality === 'high' || settings?.quality === 'eco'
            ? settings.quality
            : 'balanced'

        const [packs, targetPackId] = await Promise.all([
          loader.listPacks(),
          loader.defaultPackId()
        ])

        const loaded = await loader.loadPack(targetPackId)
        if (!loaded.ok) {
          set({
            packs,
            theme,
            quality,
            loading: false,
            error: loaded.error
          })
          return
        }

        const progRes = await storage.loadProgress(targetPackId)
        let progress: PackProgress
        let lastNotice: string | null =
          loaded.warnings.length > 0 ? loaded.warnings.join('; ') : null

        if (!progRes.ok) {
          lastNotice = progRes.error
          progress = emptyPackProgress(targetPackId)
        } else {
          progress = progRes.progress ?? emptyPackProgress(targetPackId)
          if (progRes.warnings.length > 0) {
            lastNotice = progRes.warnings.join('; ')
          }
        }

        const index = buildGraphIndex(loaded.pack)
        set({
          packs,
          activePackId: targetPackId,
          pack: loaded.pack,
          basePack: loaded.basePack,
          curation: loaded.curation,
          progress,
          index,
          activeRouteId: progress.activeRouteId ?? null,
          theme,
          quality,
          loading: false,
          error: null,
          lastNotice
        })
      } catch (err) {
        set({
          loading: false,
          error: err instanceof Error ? err.message : String(err)
        })
      }
    },

    async switchPack(packId) {
      await get().flushSave()
      set({ loading: true, error: null })

      const loaded = await loader.loadPack(packId)
      if (!loaded.ok) {
        set({ loading: false, error: loaded.error })
        return false
      }

      const progRes = await storage.loadProgress(packId)
      let progress: PackProgress
      let lastNotice: string | null =
        loaded.warnings.length > 0 ? loaded.warnings.join('; ') : null

      if (!progRes.ok) {
        lastNotice = progRes.error
        progress = emptyPackProgress(packId)
      } else {
        progress = progRes.progress ?? emptyPackProgress(packId)
      }

      await storage.setPackOverride(packId)
      const { theme, quality } = get()
      persistSettings(packId, theme, quality)

      const packs = await loader.listPacks()
      const index = buildGraphIndex(loaded.pack)

      set({
        packs,
        activePackId: packId,
        pack: loaded.pack,
        basePack: loaded.basePack,
        curation: loaded.curation,
        progress,
        index,
        loading: false,
        error: null,
        lastNotice,
        viewLevel: 'galaxy',
        focusClusterId: null,
        clusterStack: [],
        selectedId: null,
        hoveredId: null,
        activeDomains: [],
        activeLens: 'all',
        activeRouteId: progress.activeRouteId ?? null,
        cycleConflictEdgeIds: [],
        focusTimer: {
          nodeId: null,
          remainingSec: DEFAULT_FOCUS_MINUTES * 60,
          totalSec: DEFAULT_FOCUS_MINUTES * 60,
          running: false
        }
      })
      return true
    },

    selectNode(id) {
      if (id === null) {
        set({ selectedId: null })
        return
      }
      const { index } = get()
      if (index && !index.nodesById.has(id)) return
      set({ selectedId: id })
    },

    hoverNode(id) {
      set({ hoveredId: id })
    },

    enterCluster(id) {
      const { index, clusterStack } = get()
      const node = index?.nodesById.get(id)
      if (!node || node.kind === 'leaf') return
      const nextStack =
        clusterStack[clusterStack.length - 1] === id
          ? clusterStack
          : [...clusterStack, id]
      set({
        viewLevel: node.kind === 'unit' ? 'unit' : 'branch',
        focusClusterId: id,
        clusterStack: nextStack
      })
    },

    stepBack() {
      const { clusterStack, index } = get()
      if (clusterStack.length <= 1) {
        set({
          viewLevel: 'galaxy',
          focusClusterId: null,
          clusterStack: []
        })
        return
      }
      const nextStack = clusterStack.slice(0, -1)
      const topId = nextStack[nextStack.length - 1] ?? null
      const topNode = topId ? index?.nodesById.get(topId) : undefined
      set({
        viewLevel: topNode?.kind === 'unit' ? 'unit' : topNode ? 'branch' : 'galaxy',
        focusClusterId: topId,
        clusterStack: nextStack
      })
    },

    async lightNode(id, opts) {
      const { index, progress } = get()
      if (!index || !progress) return { unlockedIds: [] }

      const node = index.nodesById.get(id)
      if (!node) {
        throw new Error(`Unknown node "${id}"`)
      }
      if (node.kind === 'unit') {
        const res = await get().batchLightUnit(id, opts?.force)
        return { unlockedIds: res.unlockedIds }
      }
      if (node.kind !== 'leaf') {
        throw new Error(`Cannot directly light branch node "${id}"`)
      }

      const beforeLit = getLitLeavesSet(progress, index)
      if (!opts?.force && !leafAvailable(id, index, beforeLit)) {
        throw new Error(`Prerequisite locked for "${id}"`)
      }

      const nextProgress = lightNodeProgress(progress, id, index, {
        at: nowIso(),
        mode: opts?.force ? 'free' : 'gated'
      })
      const afterLit = getLitLeavesSet(nextProgress, index)
      const unlockedIds = computeUnlockCascade(id, beforeLit, afterLit, index)

      set({ progress: nextProgress })
      scheduleSave(nextProgress)
      return { unlockedIds }
    },

    async unlightNode(id) {
      const { index, progress } = get()
      if (!index || !progress) return
      const node = index.nodesById.get(id)
      if (!node) return
      if (node.kind === 'unit') {
        await get().batchUnlightUnit(id)
        return
      }
      const nextProgress = unlightNodeProgress(progress, id, nowIso())
      set({ progress: nextProgress })
      scheduleSave(nextProgress)
    },

    async setNodeStatus(id, status) {
      const { index, progress } = get()
      if (!index || !progress) return
      const node = index.nodesById.get(id)
      if (!node) return

      if (status === 'lit') {
        await get().lightNode(id)
        return
      }

      if (node.kind === 'unit' && status === 'unstarted') {
        await get().batchUnlightUnit(id)
        const updatedProgress = get().progress
        if (updatedProgress?.nodes[id] && updatedProgress.nodes[id].status !== 'unstarted') {
          const nextProgress = setNodeStatusProgress(updatedProgress, id, 'unstarted', nowIso(), index)
          set({ progress: nextProgress })
          scheduleSave(nextProgress)
        }
        return
      }

      const nextProgress = setNodeStatusProgress(progress, id, status, nowIso(), index)
      set({ progress: nextProgress })
      scheduleSave(nextProgress)
    },

    async batchLightUnit(unitId, force = false) {
      const { index, progress } = get()
      if (!index || !progress) return { unlockedIds: [], litCount: 0 }
      const unit = index.nodesById.get(unitId)
      if (!unit || unit.kind !== 'unit') {
        throw new Error(`"${unitId}" is not a unit node`)
      }

      const beforeLit = getLitLeavesSet(progress, index)
      if (!force && !unitAvailable(unitId, index, beforeLit)) {
        throw new Error(`Prerequisite locked for unit "${unitId}"`)
      }

      const leaves = index.leavesOf(unitId)
      if (leaves.length === 0) {
        return { unlockedIds: [], litCount: 0 }
      }

      let curProgress = progress
      let litCount = 0
      const at = nowIso()
      const mode = force ? 'free' : 'gated'
      for (const leaf of leaves) {
        if (curProgress.nodes[leaf.id]?.status !== 'lit') {
          curProgress = lightNodeProgress(curProgress, leaf.id, index, { at, mode })
          litCount++
        }
      }

      const afterLit = getLitLeavesSet(curProgress, index)
      const unlocked = new Set<string>()
      for (const leaf of leaves) {
        for (const uid of computeUnlockCascade(leaf.id, beforeLit, afterLit, index)) {
          unlocked.add(uid)
        }
      }

      set({ progress: curProgress })
      scheduleSave(curProgress)
      return { unlockedIds: [...unlocked], litCount }
    },

    async batchUnlightUnit(unitId) {
      const { index, progress } = get()
      if (!index || !progress) return
      const leaves = index.leavesOf(unitId)
      if (leaves.length === 0) return

      const at = nowIso()
      let curProgress = progress
      for (const leaf of leaves) {
        curProgress = unlightNodeProgress(curProgress, leaf.id, at)
      }
      set({ progress: curProgress })
      scheduleSave(curProgress)
    },

    updateNote(id, md) {
      const { progress } = get()
      if (!progress) return
      const nextProgress = updateNodeNote(progress, id, md)
      set({ progress: nextProgress })
      scheduleSave(nextProgress)
    },

    addCustomResource(id, res): MutationResult<CustomResource> {
      const { progress } = get()
      if (!progress) {
        return { ok: false, error: 'No active pack progress loaded' }
      }
      const result = addCustomResourcePure(progress, id, res, nowIso())
      if (!result.ok) {
        return { ok: false, error: result.error }
      }
      set({ progress: result.progress })
      scheduleSave(result.progress)
      return { ok: true, data: result.resource }
    },

    removeCustomResource(id, resId) {
      const { progress } = get()
      if (!progress) return
      const nextProgress = removeCustomResourcePure(progress, id, resId)
      set({ progress: nextProgress })
      scheduleSave(nextProgress)
    },

    toggleTag(id, tag) {
      const { progress } = get()
      if (!progress) return
      const nextProgress = toggleNodeTag(progress, id, tag)
      set({ progress: nextProgress })
      scheduleSave(nextProgress)
    },

    togglePin(id) {
      const { progress } = get()
      if (!progress) return
      const nextProgress = toggleNodePin(progress, id)
      set({ progress: nextProgress })
      scheduleSave(nextProgress)
    },

    toggleExercise(id, idx) {
      const { progress } = get()
      if (!progress) return
      const nextProgress = toggleNodeExercise(progress, id, idx)
      set({ progress: nextProgress })
      scheduleSave(nextProgress)
    },

    gradeReview(id, remembered) {
      const { progress } = get()
      if (!progress) return
      const nextProgress = gradeReviewProgress(progress, id, remembered, nowIso())
      set({ progress: nextProgress })
      scheduleSave(nextProgress)
    },

    startFocus(id, minutes = DEFAULT_FOCUS_MINUTES) {
      const totalSec = Math.max(60, Math.round(minutes * 60))
      set({
        focusTimer: {
          nodeId: id,
          remainingSec: totalSec,
          totalSec,
          running: true
        }
      })
    },

    pauseFocus() {
      const { focusTimer } = get()
      set({
        focusTimer: {
          ...focusTimer,
          running: false
        }
      })
    },

    async completeFocusSession() {
      const { focusTimer, progress } = get()
      if (!progress || !focusTimer.nodeId) return
      const elapsedSec = focusTimer.totalSec - focusTimer.remainingSec
      const durationMinutes =
        elapsedSec > 0
          ? Math.max(1, Math.round(elapsedSec / 60))
          : Math.max(1, Math.round(focusTimer.totalSec / 60))

      const nextProgress = logStudySession(
        progress,
        {
          id: `sess-${now()}-${progress.sessions.length}`,
          nodeId: focusTimer.nodeId,
          startedAt: nowIso(),
          durationMinutes,
          mode: 'focus'
        },
        XP_PER_FOCUS_SESSION
      )

      set({
        progress: nextProgress,
        focusTimer: {
          nodeId: null,
          remainingSec: focusTimer.totalSec,
          totalSec: focusTimer.totalSec,
          running: false
        }
      })
      scheduleSave(nextProgress)
    },

    async createNode(input): Promise<MutationResult<KnowledgeNode>> {
      const { basePack, curation } = get()
      if (!basePack) return { ok: false, error: 'No active pack loaded' }

      const res = overlayAddNode(basePack, curation, input, nowIso())
      if (!res.ok) return res

      const { pack, warnings } = applyCurationOverlay(basePack, res.data.overlay)
      const index = buildGraphIndex(pack)
      await storage.saveCuration(res.data.overlay)

      set({
        curation: res.data.overlay,
        pack,
        index,
        cycleConflictEdgeIds: [],
        lastNotice: warnings.length > 0 ? warnings.join('; ') : get().lastNotice
      })
      return { ok: true, data: res.data.node, warnings }
    },

    async updateNode(id, patch): Promise<MutationResult<KnowledgeNode>> {
      const { basePack, curation } = get()
      if (!basePack) return { ok: false, error: 'No active pack loaded' }

      const res = overlayUpdateNode(basePack, curation, id, patch, nowIso())
      if (!res.ok) return res

      const { pack, warnings } = applyCurationOverlay(basePack, res.data.overlay)
      const index = buildGraphIndex(pack)
      await storage.saveCuration(res.data.overlay)

      set({
        curation: res.data.overlay,
        pack,
        index,
        cycleConflictEdgeIds: [],
        lastNotice: warnings.length > 0 ? warnings.join('; ') : get().lastNotice
      })
      return { ok: true, data: res.data.node, warnings }
    },

    async deleteNode(id): Promise<MutationResult<string[]>> {
      const { basePack, curation, selectedId, hoveredId, focusClusterId, clusterStack, focusTimer } = get()
      if (!basePack) return { ok: false, error: 'No active pack loaded' }

      const res = overlayDeleteNode(basePack, curation, id, nowIso())
      if (!res.ok) return res

      const deletedSet = new Set(res.data.deletedIds)
      const { pack, warnings } = applyCurationOverlay(basePack, res.data.overlay)
      const index = buildGraphIndex(pack)
      await storage.saveCuration(res.data.overlay)

      const nextStack = clusterStack.filter((cid) => !deletedSet.has(cid))
      const clusterAffected =
        (focusClusterId !== null && deletedSet.has(focusClusterId)) ||
        nextStack.length !== clusterStack.length
      let nextFocusClusterId = focusClusterId
      let nextViewLevel = get().viewLevel
      if (clusterAffected) {
        nextFocusClusterId = nextStack.length > 0 ? nextStack[nextStack.length - 1]! : null
        const topNode = nextFocusClusterId ? index.nodesById.get(nextFocusClusterId) : undefined
        nextViewLevel = topNode?.kind === 'unit' ? 'unit' : topNode ? 'branch' : 'galaxy'
      }

      const nextFocusTimer =
        focusTimer.nodeId && deletedSet.has(focusTimer.nodeId)
          ? {
              nodeId: null,
              remainingSec: DEFAULT_FOCUS_MINUTES * 60,
              totalSec: DEFAULT_FOCUS_MINUTES * 60,
              running: false
            }
          : focusTimer

      set({
        curation: res.data.overlay,
        pack,
        index,
        selectedId: selectedId && deletedSet.has(selectedId) ? null : selectedId,
        hoveredId: hoveredId && deletedSet.has(hoveredId) ? null : hoveredId,
        clusterStack: nextStack,
        focusClusterId: nextFocusClusterId,
        viewLevel: nextViewLevel,
        focusTimer: nextFocusTimer,
        cycleConflictEdgeIds: [],
        lastNotice: warnings.length > 0 ? warnings.join('; ') : get().lastNotice
      })
      return { ok: true, data: res.data.deletedIds, warnings }
    },

    async createEdge(input): Promise<MutationResult<KnowledgeEdge>> {
      const { basePack, curation } = get()
      if (!basePack) return { ok: false, error: 'No active pack loaded' }

      const res = overlayAddEdge(basePack, curation, input, nowIso())
      if (!res.ok) {
        set({
          cycleConflictEdgeIds: res.cycleEdgeIds ?? [],
          lastNotice: res.error
        })
        return res
      }

      const { pack, warnings } = applyCurationOverlay(basePack, res.data.overlay)
      const index = buildGraphIndex(pack)
      await storage.saveCuration(res.data.overlay)

      set({
        curation: res.data.overlay,
        pack,
        index,
        cycleConflictEdgeIds: [],
        lastNotice: warnings.length > 0 ? warnings.join('; ') : get().lastNotice
      })
      return { ok: true, data: res.data.edge, warnings }
    },

    async deleteEdge(id): Promise<MutationResult<void>> {
      const { basePack, curation } = get()
      if (!basePack) return { ok: false, error: 'No active pack loaded' }

      const res = overlayDeleteEdge(basePack, curation, id, nowIso())
      if (!res.ok) return res

      const { pack, warnings } = applyCurationOverlay(basePack, res.data)
      const index = buildGraphIndex(pack)
      await storage.saveCuration(res.data)

      set({
        curation: res.data,
        pack,
        index,
        cycleConflictEdgeIds: [],
        lastNotice: warnings.length > 0 ? warnings.join('; ') : get().lastNotice
      })
      return { ok: true, data: undefined, warnings }
    },

    async exportBackup() {
      await get().flushSave()
      const { activePackId, theme, quality, progress, curation } = get()
      const packIds = new Set(await storage.listAllKnownProgressPackIds())
      for (const m of get().packs) packIds.add(m.id)
      packIds.add(activePackId)

      const progressByPack: Record<string, PackProgress> = {}
      const curationByPack: Record<string, PackCurationOverlay> = {}

      for (const pid of packIds) {
        if (pid === activePackId && progress) {
          progressByPack[pid] = progress
        } else {
          const loaded = await storage.loadProgress(pid)
          if (loaded.ok && loaded.progress) {
            progressByPack[pid] = loaded.progress
          }
        }
        if (pid === activePackId && curation) {
          curationByPack[pid] = curation
        } else {
          const cur = await storage.loadCuration(pid)
          if (cur) curationByPack[pid] = cur
        }
      }

      const customPacks: PackDocument[] = []
      for (const meta of await storage.listCustomPacks()) {
        const cp = await storage.loadCustomPack(meta.id)
        if (cp) customPacks.push(cp)
      }

      const backup = buildBackupV2(
        {
          progressByPack,
          curationByPack,
          customPacks,
          settings: { activePackId, theme, quality }
        },
        nowIso()
      )
      return JSON.stringify(backup, null, 2)
    },

    async importBackup(json, mode = 'merge'): Promise<MutationResult<{ packsImported: number }>> {
      await get().flushSave()
      const parsed = parseBackupImport(json)
      if (!parsed.ok) {
        set({ lastNotice: parsed.error })
        return { ok: false, error: parsed.error }
      }

      const { backup, warnings } = parsed
      for (const cp of backup.customPacks) {
        await storage.saveCustomPack(cp)
      }
      if (backup.customPacks.length > 0) {
        loader.clearCache()
      }

      let packsImported = 0
      const { activePackId, basePack } = get()
      let nextActiveProgress: PackProgress | null = null
      let nextActiveCuration: PackCurationOverlay | null = null

      for (const [pid, incomingProg] of Object.entries(backup.progressByPack)) {
        const existingRes =
          pid === activePackId && get().progress
            ? { ok: true as const, progress: get().progress }
            : await storage.loadProgress(pid)
        const existingProg = existingRes.ok ? existingRes.progress : null
        const merged = mergePackProgress(existingProg, incomingProg, mode)
        await storage.saveProgress(merged)
        if (pid === activePackId) nextActiveProgress = merged
        packsImported++
      }

      for (const [pid, ov] of Object.entries(backup.curationByPack)) {
        await storage.saveCuration(ov)
        if (pid === activePackId) nextActiveCuration = ov
      }

      if (backup.settings) {
        const nextTheme = backup.settings.theme ?? get().theme
        const nextQuality = backup.settings.quality ?? get().quality
        set({ theme: nextTheme, quality: nextQuality })
        persistSettings(activePackId, nextTheme, nextQuality)
      }

      const importedActiveCustomPack = backup.customPacks.find((cp) => cp.id === activePackId)
      const effectiveBasePack = importedActiveCustomPack ?? basePack

      const patches: Partial<AppState> = {
        lastNotice: warnings.length > 0 ? warnings.join('; ') : null
      }
      if (nextActiveProgress) {
        patches.progress = nextActiveProgress
        patches.activeRouteId = nextActiveProgress.activeRouteId ?? get().activeRouteId
      }
      if (importedActiveCustomPack) {
        patches.basePack = importedActiveCustomPack
      }
      if ((nextActiveCuration || importedActiveCustomPack) && effectiveBasePack) {
        const curationToApply = nextActiveCuration ?? get().curation
        const applied = applyCurationOverlay(effectiveBasePack, curationToApply)
        if (nextActiveCuration) patches.curation = nextActiveCuration
        patches.pack = applied.pack
        patches.index = buildGraphIndex(applied.pack)
      }
      if (backup.customPacks.length > 0) {
        patches.packs = await loader.listPacks()
      }

      set(patches)
      return { ok: true, data: { packsImported }, warnings }
    },

    exportMarkdownJournal() {
      const { pack, progress } = get()
      if (!pack || !progress) return ''
      return exportMarkdownJournalPure(pack, progress, new Date(now()))
    },

    async resetCuration() {
      const { activePackId, basePack } = get()
      await storage.resetCuration(activePackId)
      if (!basePack) return
      const index = buildGraphIndex(basePack)
      set({
        curation: null,
        pack: basePack,
        index,
        cycleConflictEdgeIds: []
      })
    },

    setActiveDomains(domains) {
      set({ activeDomains: [...domains] })
    },

    setActiveLens(lens: ActiveLens) {
      set({ activeLens: lens })
    },

    setActiveRouteId(routeId) {
      const { progress } = get()
      if (progress) {
        const nextProgress: PackProgress = {
          ...progress,
          activeRouteId: routeId ?? undefined
        }
        set({ activeRouteId: routeId, progress: nextProgress })
        scheduleSave(nextProgress)
      } else {
        set({ activeRouteId: routeId })
      }
    },

    setEditMode(enabled) {
      set({
        editMode: enabled,
        ...(enabled ? {} : { cycleConflictEdgeIds: [] })
      })
    },

    setTheme(theme) {
      set({ theme })
      persistSettings(get().activePackId, theme, get().quality)
    },

    setQuality(quality) {
      set({ quality })
      persistSettings(get().activePackId, get().theme, quality)
    },

    tickFocus(seconds = 1) {
      const { focusTimer } = get()
      if (!focusTimer.running) return
      const nextRemaining = Math.max(0, focusTimer.remainingSec - seconds)
      set({
        focusTimer: {
          ...focusTimer,
          remainingSec: nextRemaining,
          running: nextRemaining > 0
        }
      })
    },

    async flushSave() {
      if (saveTimer !== null) {
        clearTimeout(saveTimer)
        saveTimer = null
        await persistProgressNow(get().progress)
      } else if (pendingSavePromise) {
        await pendingSavePromise
      }
    },

    cleanOrphans() {
      const { progress, index } = get()
      if (!progress || !index) return 0
      const { progress: cleaned, removedIds } = pruneOrphanProgress(progress, index)
      if (removedIds.length > 0) {
        set({ progress: cleaned })
        scheduleSave(cleaned)
      }
      return removedIds.length
    },

    getNodeVisualState(id, nowMs): NodeVisualState {
      const { index, progress } = get()
      if (!index) return 'locked'
      const litLeaves = getLitLeavesSet(progress, index)
      return computeNodeVisualState(id, index, progress, litLeaves, nowMs ?? now())
    },

    getLitLeavesSet() {
      const { progress, index } = get()
      return getLitLeavesSet(progress, index ?? undefined)
    }
  }))

  return store
}

export const appStore = createAppStore()

export function useAppStore(): AppState
export function useAppStore<T>(selector: (state: AppState) => T): T
export function useAppStore<T>(selector?: (state: AppState) => T) {
  return useStore(appStore, selector as (state: AppState) => T)
}
