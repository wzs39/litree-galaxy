import { buildGraphIndex } from './graph'
import {
  addDaysIso,
  defaultNodeProgress,
  emptyPackProgress,
  isValidDateKey,
  recomputeStreak,
  toDateKey,
  XP_PER_LEAF
} from './progress'
import { findCycleEdgeIds, normalizePackToV2, wouldCreateCycle } from './schema'
import type {
  BackupV2,
  CreateEdgeInput,
  CreateNodeInput,
  CustomResource,
  DailyActivityEntry,
  KnowledgeEdge,
  KnowledgeNode,
  LearningRoute,
  LeitnerBox,
  MasteryLevel,
  MutationResult,
  PackCurationOverlay,
  PackDocument,
  PackMeta,
  PackProgress,
  ProgressHistoryItem,
  ProgressV1,
  ResourceItem,
  StudySession,
  UserNodeProgress,
  UserNodeStatus,
  UserSettings
} from './types'

export const OVERRIDE_KEY = 'litree:pack-override'
export const SETTINGS_KEY = 'litree:settings'
export const CUSTOM_PACKS_KEY = 'litree:custom-packs'
export const progressKey = (packId: string) => `litree:progress:${packId}`
export const corruptProgressKey = (packId: string) => `litree:progress:${packId}:corrupt`
export const curationKey = (packId: string) => `litree:curation:${packId}`
export const customPackKey = (packId: string) => `litree:custom-pack:${packId}`

const IDB_NAME = 'litree-galaxy-db'
const IDB_VERSION = 1
const IDB_STORE = 'kv'
const HTTP_URL_RE = /^https?:\/\//i

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  readonly length?: number
  key?(index: number): string | null
}

export interface StorageDeps {
  indexedDB?: IDBFactory | null
  localStorage?: StorageLike | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function clampLeitnerBox(value: unknown, fallback: LeitnerBox = 0): LeitnerBox {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  const rounded = Math.round(value)
  return Math.max(0, Math.min(5, rounded)) as LeitnerBox
}

function clampMastery(value: unknown, fallback: MasteryLevel = 0): MasteryLevel {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  const rounded = Math.round(value)
  return Math.max(0, Math.min(3, rounded)) as MasteryLevel
}

function sanitizeNonNegNumber(value: unknown, fallback: number = 0): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}

function openIdb(factory: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const req = factory.open(IDB_NAME, IDB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE)
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
      req.onblocked = () => reject(new Error('IndexedDB open blocked'))
    } catch (err) {
      reject(err)
    }
  })
}

async function idbGet(factory: IDBFactory, key: string): Promise<string | null> {
  const db = await openIdb(factory)
  try {
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const store = tx.objectStore(IDB_STORE)
      const req = store.get(key)
      req.onsuccess = () => resolve(typeof req.result === 'string' ? req.result : null)
      req.onerror = () => reject(req.error ?? new Error('IndexedDB get failed'))
    })
  } finally {
    db.close()
  }
}

async function idbSet(factory: IDBFactory, key: string, value: string): Promise<void> {
  const db = await openIdb(factory)
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      const store = tx.objectStore(IDB_STORE)
      const req = store.put(value, key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error ?? new Error('IndexedDB put failed'))
    })
  } finally {
    db.close()
  }
}

async function idbDelete(factory: IDBFactory, key: string): Promise<void> {
  const db = await openIdb(factory)
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      const store = tx.objectStore(IDB_STORE)
      const req = store.delete(key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error ?? new Error('IndexedDB delete failed'))
    })
  } finally {
    db.close()
  }
}

export function isProgressV1Shape(raw: unknown): raw is ProgressV1 {
  if (!isRecord(raw)) return false
  if (raw.schema !== undefined && raw.schema !== 'litree/progress-v1') return false
  if (typeof raw.packId !== 'string' || raw.packId.length === 0) return false
  if (!isRecord(raw.lit)) return false
  if (raw.learning !== undefined && !isRecord(raw.learning)) return false
  if (raw.xp !== undefined && typeof raw.xp !== 'number') return false
  if (raw.history !== undefined && !Array.isArray(raw.history)) return false
  return true
}

function isValidNodeStatus(value: unknown): value is UserNodeStatus {
  return value === 'unstarted' || value === 'queued' || value === 'learning' || value === 'lit'
}

export function isProgressV2Shape(raw: unknown): raw is PackProgress {
  if (!isRecord(raw)) return false
  if (raw.schema !== 'litree/progress-v2') return false
  if (typeof raw.packId !== 'string' || raw.packId.length === 0) return false
  if (!isRecord(raw.nodes)) return false
  for (const entry of Object.values(raw.nodes)) {
    if (!isRecord(entry) || !isValidNodeStatus(entry.status)) return false
    if (
      typeof entry.reviewCount !== 'number' ||
      !Number.isFinite(entry.reviewCount) ||
      entry.reviewCount < 0 ||
      typeof entry.leitnerBox !== 'number' ||
      !Number.isFinite(entry.leitnerBox) ||
      entry.leitnerBox < 0 ||
      typeof entry.mastery !== 'number' ||
      !Number.isFinite(entry.mastery) ||
      entry.mastery < 0
    ) {
      return false
    }
  }
  if (typeof raw.xp !== 'number' || !Number.isFinite(raw.xp) || raw.xp < 0) return false
  if (typeof raw.streakDays !== 'number' || !Number.isFinite(raw.streakDays) || raw.streakDays < 0) return false
  if (
    raw.lastStudyDate !== undefined &&
    (typeof raw.lastStudyDate !== 'string' || !isValidDateKey(raw.lastStudyDate))
  ) {
    return false
  }
  if (!isRecord(raw.dailyActivity)) return false
  for (const [dateKey, day] of Object.entries(raw.dailyActivity)) {
    if (!isValidDateKey(dateKey)) return false
    if (
      !isRecord(day) ||
      typeof day.lit !== 'number' ||
      !Number.isFinite(day.lit) ||
      day.lit < 0 ||
      typeof day.reviewed !== 'number' ||
      !Number.isFinite(day.reviewed) ||
      day.reviewed < 0 ||
      typeof day.focusMinutes !== 'number' ||
      !Number.isFinite(day.focusMinutes) ||
      day.focusMinutes < 0 ||
      typeof day.xp !== 'number' ||
      !Number.isFinite(day.xp) ||
      day.xp < 0
    ) {
      return false
    }
  }
  if (!Array.isArray(raw.sessions)) return false
  for (const s of raw.sessions) {
    if (
      !isRecord(s) ||
      typeof s.id !== 'string' ||
      typeof s.nodeId !== 'string' ||
      typeof s.durationMinutes !== 'number' ||
      !Number.isFinite(s.durationMinutes) ||
      s.durationMinutes < 0
    ) {
      return false
    }
  }
  if (!Array.isArray(raw.history)) return false
  for (const h of raw.history) {
    if (!isRecord(h) || typeof h.id !== 'string' || typeof h.at !== 'string') return false
  }
  return true
}

function sanitizeCustomResourcesList(
  rawResources: unknown,
  context: string,
  warnings: string[]
): CustomResource[] | undefined {
  if (rawResources === undefined) return undefined
  if (!Array.isArray(rawResources)) {
    warnings.push(`Ignored malformed customResources in ${context}`)
    return undefined
  }
  const clean: CustomResource[] = []
  for (const item of rawResources) {
    if (!isRecord(item) || typeof item.title !== 'string' || item.title.trim().length === 0) {
      warnings.push(`Stripped malformed custom resource in ${context}`)
      continue
    }
    if (typeof item.url !== 'string' || !HTTP_URL_RE.test(item.url.trim())) {
      warnings.push(`Stripped unsafe resource URL "${String(item.url)}" in ${context}`)
      continue
    }
    const url = item.url.trim()
    const res: CustomResource = {
      id: typeof item.id === 'string' && item.id.trim().length > 0 ? item.id.trim() : `res-${clean.length}`,
      title: item.title.trim(),
      url,
      addedAt: typeof item.addedAt === 'string' && item.addedAt.trim().length > 0 ? item.addedAt.trim() : new Date().toISOString()
    }
    if (item.lang === 'zh' || item.lang === 'en') res.lang = item.lang
    clean.push(res)
  }
  return clean
}

function sanitizeResourceItemsList(
  rawResources: unknown,
  context: string,
  warnings: string[]
): ResourceItem[] | undefined {
  if (rawResources === undefined) return undefined
  if (!Array.isArray(rawResources)) {
    warnings.push(`Ignored malformed resources in ${context}`)
    return undefined
  }
  const clean: ResourceItem[] = []
  for (const item of rawResources) {
    if (!isRecord(item) || typeof item.title !== 'string' || item.title.trim().length === 0) {
      warnings.push(`Stripped malformed resource in ${context}`)
      continue
    }
    if (typeof item.url !== 'string' || !HTTP_URL_RE.test(item.url.trim())) {
      warnings.push(`Stripped unsafe resource URL "${String(item.url)}" in ${context}`)
      continue
    }
    const res: ResourceItem = {
      title: item.title.trim(),
      url: item.url.trim()
    }
    if (typeof item.id === 'string' && item.id.trim().length > 0) res.id = item.id.trim()
    if (item.lang === 'zh' || item.lang === 'en') res.lang = item.lang
    if (typeof item.addedAt === 'string' && item.addedAt.trim().length > 0) res.addedAt = item.addedAt.trim()
    clean.push(res)
  }
  return clean
}

function sanitizeUserNodeProgressEntry(
  entry: unknown,
  packId: string,
  nodeId: string,
  warnings: string[]
): { entry: UserNodeProgress | null; changed: boolean } {
  if (!isRecord(entry) || !isValidNodeStatus(entry.status)) {
    warnings.push(`Skipped malformed progress node "${nodeId}"`)
    return { entry: null, changed: true }
  }
  const reviewCount = sanitizeNonNegNumber(entry.reviewCount, 0)
  const leitnerBox = clampLeitnerBox(entry.leitnerBox, 0)
  const mastery = clampMastery(entry.mastery, 0)
  let changed = false
  let nextEntry: UserNodeProgress = entry as unknown as UserNodeProgress
  if (
    entry.reviewCount !== reviewCount ||
    entry.leitnerBox !== leitnerBox ||
    entry.mastery !== mastery
  ) {
    nextEntry = { ...nextEntry, reviewCount, leitnerBox, mastery }
    changed = true
    warnings.push(`Normalized numeric fields in progress "${packId}" node "${nodeId}"`)
  }
  if (entry.tags !== undefined) {
    if (!Array.isArray(entry.tags)) {
      const { tags: _omitTags, ...rest } = nextEntry
      nextEntry = rest as UserNodeProgress
      changed = true
    } else {
      const cleanTags = entry.tags.filter((t): t is string => typeof t === 'string')
      if (cleanTags.length !== entry.tags.length) {
        nextEntry = { ...nextEntry, tags: cleanTags }
        changed = true
      }
    }
  }
  if (entry.completedExercises !== undefined) {
    if (!Array.isArray(entry.completedExercises)) {
      const { completedExercises: _omitEx, ...rest } = nextEntry
      nextEntry = rest as UserNodeProgress
      changed = true
    } else {
      const cleanEx = entry.completedExercises.filter(
        (i): i is number => typeof i === 'number' && Number.isInteger(i) && i >= 0
      )
      if (cleanEx.length !== entry.completedExercises.length) {
        nextEntry = { ...nextEntry, completedExercises: cleanEx }
        changed = true
      }
    }
  }
  if (entry.customResources !== undefined) {
    const sanitized = sanitizeCustomResourcesList(
      entry.customResources,
      `progress "${packId}" node "${nodeId}"`,
      warnings
    )
    if (!sanitized || sanitized.length === 0) {
      const { customResources: _omit, ...rest } = nextEntry
      nextEntry = rest as UserNodeProgress
      changed = true
    } else {
      const rawList = Array.isArray(entry.customResources) ? (entry.customResources as unknown[]) : null
      const listChanged =
        !rawList ||
        sanitized.length !== rawList.length ||
        sanitized.some((s, i) => {
          const orig = rawList[i]
          if (!isRecord(orig)) return true
          return (
            orig.id !== s.id ||
            orig.title !== s.title ||
            orig.url !== s.url ||
            orig.addedAt !== s.addedAt ||
            orig.lang !== s.lang
          )
        })
      if (listChanged) {
        nextEntry = { ...nextEntry, customResources: sanitized }
        changed = true
      }
    }
  }
  if (entry.noteMarkdown !== undefined && typeof entry.noteMarkdown !== 'string') {
    const { noteMarkdown: _omitNote, ...rest } = nextEntry
    nextEntry = rest as UserNodeProgress
    changed = true
  }
  return { entry: nextEntry, changed }
}

function sanitizeStudySession(s: unknown): { session: StudySession | null; changed: boolean } {
  if (!isRecord(s) || typeof s.id !== 'string' || typeof s.nodeId !== 'string') {
    return { session: null, changed: true }
  }
  const durationMinutes = sanitizeNonNegNumber(s.durationMinutes, 0)
  const mode: StudySession['mode'] =
    s.mode === 'focus' || s.mode === 'review' || s.mode === 'light' ? s.mode : 'focus'
  const startedAt = typeof s.startedAt === 'string' ? s.startedAt : ''
  if (s.durationMinutes === durationMinutes && s.mode === mode && s.startedAt === startedAt) {
    return { session: s as unknown as StudySession, changed: false }
  }
  return {
    session: {
      id: s.id,
      nodeId: s.nodeId,
      startedAt,
      durationMinutes,
      mode
    },
    changed: true
  }
}

function sanitizePackProgress(progress: PackProgress, warnings: string[]): PackProgress {
  let changed = false
  const packId = typeof progress.packId === 'string' ? progress.packId : ''
  if (progress.schema !== 'litree/progress-v2' || progress.packId !== packId) {
    changed = true
  }

  const nextNodes: Record<string, UserNodeProgress> = {}
  if (isRecord(progress.nodes)) {
    for (const [nodeId, entry] of Object.entries(progress.nodes)) {
      const res = sanitizeUserNodeProgressEntry(entry, packId, nodeId, warnings)
      if (res.changed) changed = true
      if (res.entry) nextNodes[nodeId] = res.entry
    }
  } else {
    changed = true
    warnings.push(`Reset malformed nodes map in progress "${packId}"`)
  }

  const xp = sanitizeNonNegNumber(progress.xp, 0)
  const streakDays = sanitizeNonNegNumber(progress.streakDays, 0)
  if (progress.xp !== xp || progress.streakDays !== streakDays) {
    changed = true
    warnings.push(`Normalized top-level xp/streakDays in progress "${packId}"`)
  }

  const nextDailyActivity: Record<string, DailyActivityEntry> = {}
  if (isRecord(progress.dailyActivity)) {
    for (const [dateKey, day] of Object.entries(progress.dailyActivity)) {
      if (!isValidDateKey(dateKey)) {
        changed = true
        warnings.push(`Skipped invalid dailyActivity date key "${dateKey}" in progress "${packId}"`)
        continue
      }
      if (!isRecord(day)) {
        changed = true
        warnings.push(`Skipped malformed dailyActivity "${dateKey}" in progress "${packId}"`)
        continue
      }
      const cleanDay: DailyActivityEntry = {
        lit: sanitizeNonNegNumber(day.lit, 0),
        reviewed: sanitizeNonNegNumber(day.reviewed, 0),
        focusMinutes: sanitizeNonNegNumber(day.focusMinutes, 0),
        xp: sanitizeNonNegNumber(day.xp, 0)
      }
      if (
        cleanDay.lit !== day.lit ||
        cleanDay.reviewed !== day.reviewed ||
        cleanDay.focusMinutes !== day.focusMinutes ||
        cleanDay.xp !== day.xp
      ) {
        changed = true
        warnings.push(`Normalized dailyActivity "${dateKey}" in progress "${packId}"`)
      }
      nextDailyActivity[dateKey] = cleanDay
    }
  } else {
    changed = true
    warnings.push(`Reset malformed dailyActivity in progress "${packId}"`)
  }

  let nextLastStudyDate = progress.lastStudyDate
  let nextStreakDays = streakDays
  if (
    nextLastStudyDate !== undefined &&
    (typeof nextLastStudyDate !== 'string' || !isValidDateKey(nextLastStudyDate))
  ) {
    changed = true
    warnings.push(`Normalized invalid lastStudyDate "${String(nextLastStudyDate)}" in progress "${packId}"`)
    const validDates = Object.keys(nextDailyActivity).sort()
    nextLastStudyDate = validDates.length > 0 ? validDates[validDates.length - 1] : undefined
    nextStreakDays = nextLastStudyDate
      ? sanitizeNonNegNumber(recomputeStreak(nextDailyActivity, nextLastStudyDate), 0)
      : 0
  }

  const rawSessions = Array.isArray(progress.sessions) ? progress.sessions : []
  if (!Array.isArray(progress.sessions)) changed = true
  const nextSessions: StudySession[] = []
  for (const s of rawSessions) {
    const res = sanitizeStudySession(s)
    if (res.changed) changed = true
    if (res.session) nextSessions.push(res.session)
  }

  const rawHistory = Array.isArray(progress.history) ? progress.history : []
  const nextHistory = rawHistory.filter(
    (h): h is ProgressHistoryItem => isRecord(h) && typeof h.id === 'string' && typeof h.at === 'string'
  )
  if (!Array.isArray(progress.history) || nextHistory.length !== rawHistory.length) {
    changed = true
  }

  if (!changed) return progress
  const result: PackProgress = {
    ...progress,
    schema: 'litree/progress-v2',
    packId,
    nodes: nextNodes,
    xp,
    streakDays: nextStreakDays,
    dailyActivity: nextDailyActivity,
    sessions: nextSessions,
    history: nextHistory
  }
  if (nextLastStudyDate !== undefined) {
    result.lastStudyDate = nextLastStudyDate
  } else {
    delete result.lastStudyDate
  }
  return result
}

export function parseCurationOverlay(
  raw: unknown,
  warnings: string[] = []
): PackCurationOverlay | null {
  if (!isRecord(raw)) return null
  if (typeof raw.packId !== 'string' || raw.packId.trim().length === 0) return null
  if (!Array.isArray(raw.addedNodes)) return null
  if (!isRecord(raw.updatedNodes)) return null
  if (!Array.isArray(raw.deletedNodeIds)) return null
  if (!Array.isArray(raw.addedEdges)) return null
  if (!Array.isArray(raw.deletedEdgeIds)) return null

  const addedNodes: KnowledgeNode[] = []
  for (const item of raw.addedNodes) {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      item.id.length === 0 ||
      (item.kind !== 'branch' && item.kind !== 'unit' && item.kind !== 'leaf') ||
      !isRecord(item.title) ||
      typeof item.title.zh !== 'string' ||
      item.title.zh.trim().length === 0 ||
      typeof item.domainId !== 'string'
    ) {
      warnings.push(`Skipped malformed addedNode in curation for "${raw.packId}"`)
      continue
    }
    const cleanTitle: KnowledgeNode['title'] =
      typeof item.title.en === 'string' && item.title.en.trim().length > 0
        ? { zh: item.title.zh, en: item.title.en }
        : { zh: item.title.zh }
    if (item.title.en !== undefined && typeof item.title.en !== 'string') {
      warnings.push(`Stripped malformed title.en in addedNode "${item.id}" for "${raw.packId}"`)
    }
    const clone: KnowledgeNode = {
      ...(item as unknown as KnowledgeNode),
      title: cleanTitle,
      parentId: typeof item.parentId === 'string' ? item.parentId : null
    }
    if (
      item.estimatedMinutes !== undefined &&
      (typeof item.estimatedMinutes !== 'number' ||
        !Number.isFinite(item.estimatedMinutes) ||
        item.estimatedMinutes < 0)
    ) {
      delete clone.estimatedMinutes
      warnings.push(`Stripped invalid estimatedMinutes in addedNode "${item.id}" for "${raw.packId}"`)
    }
    if (item.resources !== undefined) {
      const cleanRes = sanitizeResourceItemsList(
        item.resources,
        `curation addedNode "${item.id}"`,
        warnings
      )
      if (cleanRes && cleanRes.length > 0) {
        clone.resources = cleanRes
      } else {
        delete clone.resources
      }
    }
    addedNodes.push(clone)
  }

  const updatedNodes: Record<string, Partial<Omit<KnowledgeNode, 'id'>>> = {}
  for (const [nodeId, rawPatch] of Object.entries(raw.updatedNodes)) {
    if (!isRecord(rawPatch)) {
      warnings.push(`Skipped malformed updatedNodes["${nodeId}"] in curation for "${raw.packId}"`)
      continue
    }
    const patch = { ...rawPatch } as Partial<Omit<KnowledgeNode, 'id'>>
    if (rawPatch.title !== undefined) {
      if (
        !isRecord(rawPatch.title) ||
        (rawPatch.title.zh !== undefined &&
          (typeof rawPatch.title.zh !== 'string' || rawPatch.title.zh.trim().length === 0))
      ) {
        warnings.push(`Stripped malformed title in updatedNodes["${nodeId}"] for "${raw.packId}"`)
        delete patch.title
      } else if (
        rawPatch.title.en !== undefined &&
        (typeof rawPatch.title.en !== 'string' || rawPatch.title.en.trim().length === 0)
      ) {
        const cleanTitle: Record<string, unknown> = { ...rawPatch.title }
        delete cleanTitle.en
        if (Object.keys(cleanTitle).length === 0) {
          delete patch.title
        } else {
          patch.title = cleanTitle as unknown as KnowledgeNode['title']
        }
        warnings.push(`Stripped malformed title.en in updatedNodes["${nodeId}"] for "${raw.packId}"`)
      }
    }
    if (
      rawPatch.estimatedMinutes !== undefined &&
      (typeof rawPatch.estimatedMinutes !== 'number' ||
        !Number.isFinite(rawPatch.estimatedMinutes) ||
        rawPatch.estimatedMinutes < 0)
    ) {
      delete patch.estimatedMinutes
      warnings.push(`Stripped invalid estimatedMinutes in updatedNodes["${nodeId}"] for "${raw.packId}"`)
    }
    if (rawPatch.resources !== undefined) {
      const cleanRes = sanitizeResourceItemsList(
        rawPatch.resources,
        `curation updatedNodes["${nodeId}"]`,
        warnings
      )
      if (cleanRes !== undefined) {
        patch.resources = cleanRes
      } else {
        delete patch.resources
      }
    }
    updatedNodes[nodeId] = patch
  }

  const addedEdges: KnowledgeEdge[] = []
  for (const item of raw.addedEdges) {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      item.id.trim().length === 0 ||
      typeof item.from !== 'string' ||
      typeof item.to !== 'string' ||
      (item.type !== 'hard' && item.type !== 'soft' && item.type !== 'related')
    ) {
      warnings.push(`Skipped malformed addedEdge in curation for "${raw.packId}"`)
      continue
    }
    addedEdges.push(item as unknown as KnowledgeEdge)
  }

  const deletedNodeIds = raw.deletedNodeIds.filter((id): id is string => typeof id === 'string')
  const deletedEdgeIds = raw.deletedEdgeIds.filter((id): id is string => typeof id === 'string')

  const overlay: PackCurationOverlay = {
    schema: 'litree/overlay-v1',
    packId: raw.packId,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
    addedNodes,
    updatedNodes,
    deletedNodeIds,
    addedEdges,
    deletedEdgeIds
  }

  if (Array.isArray(raw.addedRoutes)) {
    overlay.addedRoutes = raw.addedRoutes.filter(
      (r): r is LearningRoute =>
        isRecord(r) &&
        typeof r.id === 'string' &&
        r.id.trim().length > 0 &&
        typeof r.name === 'string' &&
        r.name.trim().length > 0 &&
        Array.isArray(r.ids) &&
        r.ids.every((uid) => typeof uid === 'string')
    )
  }
  if (isRecord(raw.updatedRoutes)) {
    const cleanUpdatedRoutes: NonNullable<PackCurationOverlay['updatedRoutes']> = {}
    for (const [routeId, rawRoutePatch] of Object.entries(raw.updatedRoutes)) {
      if (!isRecord(rawRoutePatch)) {
        warnings.push(`Skipped malformed updatedRoutes["${routeId}"] in curation for "${raw.packId}"`)
        continue
      }
      if (
        rawRoutePatch.ids !== undefined &&
        (!Array.isArray(rawRoutePatch.ids) || !rawRoutePatch.ids.every((x) => typeof x === 'string'))
      ) {
        warnings.push(`Skipped malformed updatedRoutes["${routeId}"].ids in curation for "${raw.packId}"`)
        continue
      }
      if (
        rawRoutePatch.name !== undefined &&
        (typeof rawRoutePatch.name !== 'string' || rawRoutePatch.name.trim().length === 0)
      ) {
        warnings.push(`Skipped malformed updatedRoutes["${routeId}"].name in curation for "${raw.packId}"`)
        continue
      }
      if (rawRoutePatch.note !== undefined && typeof rawRoutePatch.note !== 'string') {
        warnings.push(`Skipped malformed updatedRoutes["${routeId}"].note in curation for "${raw.packId}"`)
        continue
      }
      cleanUpdatedRoutes[routeId] = rawRoutePatch as Partial<Omit<LearningRoute, 'id'>>
    }
    overlay.updatedRoutes = cleanUpdatedRoutes
  }
  if (Array.isArray(raw.deletedRouteIds)) {
    overlay.deletedRouteIds = raw.deletedRouteIds.filter((id): id is string => typeof id === 'string')
  }

  return overlay
}

export function migrateProgressV1ToV2(
  rawV1: ProgressV1,
  fallbackPackId?: string
): { progress: PackProgress; warnings: string[] } {
  const warnings: string[] = []
  const packId =
    typeof rawV1.packId === 'string' && rawV1.packId.length > 0
      ? rawV1.packId
      : (fallbackPackId ?? 'cs-math')
  const progress = emptyPackProgress(packId)
  const fallbackIso = new Date().toISOString()

  let litCount = 0
  if (isRecord(rawV1.lit)) {
    for (const [nodeId, val] of Object.entries(rawV1.lit)) {
      let litAt = fallbackIso
      let noteMarkdown: string | undefined
      if (isRecord(val)) {
        if (typeof val.at === 'string' && Number.isFinite(Date.parse(val.at))) {
          litAt = val.at
        }
        if (typeof val.note === 'string' && val.note.length > 0) {
          noteMarkdown = val.note
        }
      } else if (typeof val === 'string' && Number.isFinite(Date.parse(val))) {
        litAt = val
      } else if (val !== true) {
        warnings.push(`Normalized legacy lit entry for "${nodeId}"`)
      }

      const entry: UserNodeProgress = {
        status: 'lit',
        litAt,
        litMode: 'gated',
        startedAt: litAt,
        leitnerBox: 1,
        nextReviewAt: addDaysIso(litAt, 1),
        mastery: 1,
        reviewCount: 0
      }
      if (noteMarkdown) entry.noteMarkdown = noteMarkdown
      progress.nodes[nodeId] = entry
      litCount++

      const dateKey = toDateKey(litAt)
      const prevDay = progress.dailyActivity[dateKey] ?? {
        lit: 0,
        reviewed: 0,
        focusMinutes: 0,
        xp: 0
      }
      progress.dailyActivity[dateKey] = {
        ...prevDay,
        lit: prevDay.lit + 1,
        xp: prevDay.xp + XP_PER_LEAF
      }
    }
  }

  if (isRecord(rawV1.learning)) {
    for (const [nodeId, ts] of Object.entries(rawV1.learning)) {
      if (progress.nodes[nodeId]?.status === 'lit') continue
      const startedAt =
        typeof ts === 'string' && Number.isFinite(Date.parse(ts)) ? ts : fallbackIso
      progress.nodes[nodeId] = {
        ...defaultNodeProgress(),
        status: 'learning',
        startedAt
      }
    }
  }

  if (Array.isArray(rawV1.history)) {
    for (const item of rawV1.history) {
      if (!isRecord(item) || typeof item.id !== 'string' || typeof item.at !== 'string') continue
      const xpVal = typeof item.xp === 'number' && Number.isFinite(item.xp) ? item.xp : XP_PER_LEAF
      progress.history.push({
        id: item.id,
        at: item.at,
        xp: xpVal,
        action: xpVal < 0 ? 'unlight' : 'light'
      })
    }
  }

  const rawXp = typeof rawV1.xp === 'number' && Number.isFinite(rawV1.xp) ? rawV1.xp : 0
  progress.xp = Math.max(0, rawXp, litCount * XP_PER_LEAF)

  const dates = Object.keys(progress.dailyActivity).sort()
  if (dates.length > 0) {
    const lastDate = dates[dates.length - 1]!
    progress.lastStudyDate = lastDate
    progress.streakDays = recomputeStreak(progress.dailyActivity, lastDate)
  }

  return { progress, warnings }
}

export function emptyCurationOverlay(
  packId: string,
  updatedAt: string = new Date().toISOString()
): PackCurationOverlay {
  return {
    schema: 'litree/overlay-v1',
    packId,
    updatedAt,
    addedNodes: [],
    updatedNodes: {},
    deletedNodeIds: [],
    addedEdges: [],
    deletedEdgeIds: [],
    addedRoutes: [],
    updatedRoutes: {},
    deletedRouteIds: []
  }
}

export function applyCurationOverlay(
  basePack: PackDocument,
  overlay: PackCurationOverlay | null
): { pack: PackDocument; warnings: string[] } {
  if (!overlay) return { pack: basePack, warnings: [] }
  const warnings: string[] = []

  const rawDeletedNodeIds = Array.isArray(overlay.deletedNodeIds) ? overlay.deletedNodeIds : []
  const rawAddedNodes = Array.isArray(overlay.addedNodes) ? overlay.addedNodes : []
  const rawUpdatedNodes = isRecord(overlay.updatedNodes) ? overlay.updatedNodes : {}
  const rawAddedEdges = Array.isArray(overlay.addedEdges) ? overlay.addedEdges : []
  const rawDeletedEdgeIds = Array.isArray(overlay.deletedEdgeIds) ? overlay.deletedEdgeIds : []

  const deletedSet = new Set(rawDeletedNodeIds)
  // Build parent -> children map from basePack + addedNodes to cascade node deletions
  const allCandidateNodes = [...basePack.nodes, ...rawAddedNodes]
  const childrenMap = new Map<string, string[]>()
  for (const n of allCandidateNodes) {
    if (n.parentId !== null) {
      let list = childrenMap.get(n.parentId)
      if (!list) {
        list = []
        childrenMap.set(n.parentId, list)
      }
      list.push(n.id)
    }
  }

  const cascadeQueue = [...deletedSet]
  let head = 0
  while (head < cascadeQueue.length) {
    const cur = cascadeQueue[head++]!
    for (const childId of childrenMap.get(cur) ?? []) {
      if (!deletedSet.has(childId)) {
        deletedSet.add(childId)
        cascadeQueue.push(childId)
      }
    }
  }

  const domainIds = new Set(basePack.domains.map((d) => d.id))
  const addedNodeIds = new Set(
    rawAddedNodes
      .filter((n): n is KnowledgeNode => isRecord(n) && typeof n.id === 'string')
      .map((n) => n.id)
  )
  const nodesMap = new Map<string, KnowledgeNode>()

  for (const baseNode of basePack.nodes) {
    if (deletedSet.has(baseNode.id) || addedNodeIds.has(baseNode.id)) continue
    const patch = rawUpdatedNodes[baseNode.id]
    const patchTitle = isRecord(patch) && isRecord(patch.title) ? patch.title : undefined
    const merged: KnowledgeNode = isRecord(patch)
      ? {
          ...baseNode,
          ...patch,
          id: baseNode.id,
          title: patchTitle
            ? {
                ...baseNode.title,
                ...(typeof patchTitle.zh === 'string' && patchTitle.zh.trim().length > 0
                  ? { zh: patchTitle.zh }
                  : {}),
                ...(typeof patchTitle.en === 'string' && patchTitle.en.trim().length > 0
                  ? { en: patchTitle.en }
                  : {})
              }
            : baseNode.title
        }
      : { ...baseNode }
    if (
      merged.estimatedMinutes !== undefined &&
      (typeof merged.estimatedMinutes !== 'number' ||
        !Number.isFinite(merged.estimatedMinutes) ||
        merged.estimatedMinutes < 0)
    ) {
      delete merged.estimatedMinutes
      warnings.push(`Stripped invalid estimatedMinutes in node "${merged.id}"`)
    }
    if (merged.resources !== undefined) {
      const cleanRes = sanitizeResourceItemsList(merged.resources, `node "${merged.id}"`, warnings)
      if (cleanRes && cleanRes.length > 0) merged.resources = cleanRes
      else delete merged.resources
    }
    if (!domainIds.has(merged.domainId)) {
      warnings.push(`Node "${merged.id}" references unknown domain "${merged.domainId}", reverting domainId`)
      merged.domainId = baseNode.domainId
    }
    nodesMap.set(merged.id, merged)
  }

  for (const added of rawAddedNodes) {
    if (
      !isRecord(added) ||
      typeof added.id !== 'string' ||
      added.id.length === 0 ||
      !isRecord(added.title) ||
      typeof added.title.zh !== 'string' ||
      added.title.zh.trim().length === 0
    ) {
      warnings.push('Skipped malformed overlay addedNode')
      continue
    }
    if (deletedSet.has(added.id)) continue
    if (nodesMap.has(added.id)) {
      warnings.push(`Overlay addedNode "${added.id}" collides with existing node, skipped`)
      continue
    }
    if (!domainIds.has(added.domainId)) {
      warnings.push(`Overlay addedNode "${added.id}" has unknown domainId "${added.domainId}", skipped`)
      continue
    }
    const baseAddedTitle: KnowledgeNode['title'] = {
      zh: added.title.zh,
      ...(typeof added.title.en === 'string' && added.title.en.trim().length > 0
        ? { en: added.title.en }
        : {})
    }
    const patch = rawUpdatedNodes[added.id]
    const patchTitle = isRecord(patch) && isRecord(patch.title) ? patch.title : undefined
    const finalNode: KnowledgeNode = isRecord(patch)
      ? {
          ...added,
          ...patch,
          id: added.id,
          title: patchTitle
            ? {
                ...baseAddedTitle,
                ...(typeof patchTitle.zh === 'string' && patchTitle.zh.trim().length > 0
                  ? { zh: patchTitle.zh }
                  : {}),
                ...(typeof patchTitle.en === 'string' && patchTitle.en.trim().length > 0
                  ? { en: patchTitle.en }
                  : {})
              }
            : baseAddedTitle
        }
      : { ...added, title: baseAddedTitle }
    if (
      finalNode.estimatedMinutes !== undefined &&
      (typeof finalNode.estimatedMinutes !== 'number' ||
        !Number.isFinite(finalNode.estimatedMinutes) ||
        finalNode.estimatedMinutes < 0)
    ) {
      delete finalNode.estimatedMinutes
      warnings.push(`Stripped invalid estimatedMinutes in node "${finalNode.id}"`)
    }
    if (finalNode.resources !== undefined) {
      const cleanRes = sanitizeResourceItemsList(finalNode.resources, `node "${finalNode.id}"`, warnings)
      if (cleanRes && cleanRes.length > 0) finalNode.resources = cleanRes
      else delete finalNode.resources
    }
    nodesMap.set(finalNode.id, finalNode)
  }

  // Ensure every node's parentId still exists (otherwise drop dangling overlay children)
  let changed = true
  while (changed) {
    changed = false
    for (const [id, node] of nodesMap) {
      if (node.parentId !== null && !nodesMap.has(node.parentId)) {
        nodesMap.delete(id)
        warnings.push(`Dropped orphan node "${id}" whose parent "${node.parentId}" was removed`)
        changed = true
      }
    }
  }

  const nodes = [...nodesMap.values()]
  const deletedEdgeSet = new Set(rawDeletedEdgeIds)
  const addedEdgeIds = new Set(
    rawAddedEdges
      .filter((e): e is KnowledgeEdge => isRecord(e) && typeof e.id === 'string' && e.id.trim().length > 0)
      .map((e) => e.id)
  )
  const edges: KnowledgeEdge[] = []
  const edgeIds = new Set<string>()

  const pushValidEdge = (edge: KnowledgeEdge, fromOverlay: boolean) => {
    if (deletedEdgeSet.has(edge.id)) return
    if (edgeIds.has(edge.id)) return
    if (edge.from === edge.to) {
      warnings.push(`Dropped self-loop edge "${edge.id}"`)
      return
    }
    const fromNode = nodesMap.get(edge.from)
    const toNode = nodesMap.get(edge.to)
    if (!fromNode || !toNode) return
    if ((edge.type === 'hard' || edge.type === 'soft') && (fromNode.kind !== 'unit' || toNode.kind !== 'unit')) {
      warnings.push(`Dropped edge "${edge.id}": non-unit endpoint`)
      return
    }
    if (fromOverlay && wouldCreateCycle(edge, nodes, edges)) {
      warnings.push(`Stripped cyclic overlay edge "${edge.id}" (${edge.from} -> ${edge.to})`)
      return
    }
    edgeIds.add(edge.id)
    edges.push(edge)
  }

  for (const e of basePack.edges) {
    if (deletedEdgeSet.has(e.id) || addedEdgeIds.has(e.id)) continue
    pushValidEdge(e, false)
  }
  for (const e of rawAddedEdges) {
    if (
      !isRecord(e) ||
      typeof e.id !== 'string' ||
      e.id.trim().length === 0 ||
      typeof e.from !== 'string' ||
      typeof e.to !== 'string' ||
      (e.type !== 'hard' && e.type !== 'soft' && e.type !== 'related')
    ) {
      warnings.push('Skipped malformed overlay edge')
      continue
    }
    pushValidEdge(e, true)
  }

  const rawDeletedRouteIds = Array.isArray(overlay.deletedRouteIds) ? overlay.deletedRouteIds : []
  const rawAddedRoutes = Array.isArray(overlay.addedRoutes) ? overlay.addedRoutes : []
  const deletedRouteSet = new Set(rawDeletedRouteIds)
  const routes: LearningRoute[] = []
  const routeIds = new Set<string>()
  const allRoutes = [...basePack.routes, ...rawAddedRoutes]

  for (const r of allRoutes) {
    if (!isRecord(r) || typeof r.id !== 'string' || r.id.length === 0) continue
    if (deletedRouteSet.has(r.id) || routeIds.has(r.id)) continue
    const patch = isRecord(overlay.updatedRoutes) ? overlay.updatedRoutes[r.id] : undefined
    const patchName =
      isRecord(patch) && typeof patch.name === 'string' && patch.name.trim().length > 0
        ? patch.name
        : undefined
    const merged: LearningRoute = isRecord(patch)
      ? { ...r, ...patch, id: r.id, name: patchName ?? r.name }
      : { ...r }
    if (typeof merged.name !== 'string' || merged.name.trim().length === 0) {
      warnings.push(`Dropped route "${merged.id}" with empty name`)
      continue
    }
    const rawIds = Array.isArray(merged.ids) ? merged.ids : Array.isArray(r.ids) ? r.ids : []
    const validIds = rawIds.filter((uid) => typeof uid === 'string' && nodesMap.get(uid)?.kind === 'unit')
    if (validIds.length === 0) {
      warnings.push(`Dropped route "${merged.id}" with 0 valid units`)
      continue
    }
    routeIds.add(merged.id)
    routes.push({ ...merged, ids: validIds })
  }

  return {
    pack: {
      ...basePack,
      nodes,
      edges,
      routes
    },
    warnings
  }
}

function hasUnitAncestor(node: KnowledgeNode, map: ReadonlyMap<string, KnowledgeNode>): boolean {
  let cur: KnowledgeNode | undefined = node
  const seen = new Set<string>()
  while (cur && cur.parentId !== null && !seen.has(cur.id) && seen.size < 64) {
    seen.add(cur.id)
    const parent = map.get(cur.parentId)
    if (!parent) return false
    if (parent.kind === 'unit') return true
    cur = parent
  }
  return false
}

export function overlayAddNode(
  basePack: PackDocument,
  currentOverlay: PackCurationOverlay | null,
  input: CreateNodeInput,
  nowIso: string = new Date().toISOString()
): MutationResult<{ overlay: PackCurationOverlay; node: KnowledgeNode }> {
  const overlay = currentOverlay
    ? { ...currentOverlay, addedNodes: [...currentOverlay.addedNodes], deletedNodeIds: [...currentOverlay.deletedNodeIds] }
    : emptyCurationOverlay(basePack.id, nowIso)

  const { pack } = applyCurationOverlay(basePack, overlay)
  const nodesMap = new Map(pack.nodes.map((n) => [n.id, n]))

  if (!isRecord(input.title) || typeof input.title.zh !== 'string' || input.title.zh.trim().length === 0) {
    return { ok: false, error: 'Node title.zh must be non-empty' }
  }
  if (!pack.domains.some((d) => d.id === input.domainId)) {
    return { ok: false, error: `Unknown domainId "${input.domainId}"` }
  }
  if (input.parentId !== null) {
    const parent = nodesMap.get(input.parentId)
    if (!parent) {
      return { ok: false, error: `Parent node "${input.parentId}" does not exist` }
    }
    if (parent.kind === 'leaf') {
      return { ok: false, error: `Parent "${input.parentId}" cannot be a leaf` }
    }
  }
  if (input.resources) {
    for (const r of input.resources) {
      if (!HTTP_URL_RE.test(r.url)) {
        return { ok: false, error: `Invalid resource URL "${r.url}": must start with http:// or https://` }
      }
    }
  }
  if (
    input.estimatedMinutes !== undefined &&
    (typeof input.estimatedMinutes !== 'number' ||
      !Number.isFinite(input.estimatedMinutes) ||
      input.estimatedMinutes < 0)
  ) {
    return { ok: false, error: 'estimatedMinutes must be a non-negative finite number' }
  }

  let nodeId = input.id?.trim()
  if (nodeId) {
    if (nodesMap.has(nodeId)) {
      return { ok: false, error: `Node id "${nodeId}" already exists` }
    }
  } else {
    const ts = Date.now()
    let counter = overlay.addedNodes.length
    nodeId = `custom.node.${ts}.${counter}`
    while (nodesMap.has(nodeId) || overlay.addedNodes.some((n) => n.id === nodeId)) {
      counter++
      nodeId = `custom.node.${ts}.${counter}`
    }
  }

  const node: KnowledgeNode = {
    id: nodeId,
    parentId: input.parentId,
    kind: input.kind,
    title: {
      zh: input.title.zh.trim(),
      ...(typeof input.title.en === 'string' && input.title.en.trim().length > 0
        ? { en: input.title.en.trim() }
        : {})
    },
    domainId: input.domainId,
    ...(input.core !== undefined ? { core: input.core } : {}),
    ...(input.summary !== undefined ? { summary: input.summary } : {}),
    ...(input.outcome !== undefined ? { outcome: input.outcome } : {}),
    ...(input.caution !== undefined ? { caution: input.caution } : {}),
    ...(input.resources !== undefined ? { resources: input.resources } : {}),
    ...(input.exercises !== undefined ? { exercises: input.exercises } : {}),
    ...(input.evidence !== undefined ? { evidence: input.evidence } : {}),
    ...(input.tags !== undefined ? { tags: input.tags } : {}),
    ...(input.estimatedMinutes !== undefined ? { estimatedMinutes: input.estimatedMinutes } : {})
  }

  nodesMap.set(node.id, node)
  if (node.kind === 'leaf' && !hasUnitAncestor(node, nodesMap)) {
    return { ok: false, error: `Leaf "${node.id}" must have a unit ancestor` }
  }

  overlay.deletedNodeIds = overlay.deletedNodeIds.filter((d) => d !== node.id)
  overlay.addedNodes.push(node)
  overlay.updatedAt = nowIso

  return { ok: true, data: { overlay, node } }
}

export function overlayUpdateNode(
  basePack: PackDocument,
  currentOverlay: PackCurationOverlay | null,
  nodeId: string,
  patch: Partial<Omit<KnowledgeNode, 'id'>>,
  nowIso: string = new Date().toISOString()
): MutationResult<{ overlay: PackCurationOverlay; node: KnowledgeNode }> {
  const overlay = currentOverlay
    ? {
        ...currentOverlay,
        addedNodes: [...currentOverlay.addedNodes],
        updatedNodes: { ...currentOverlay.updatedNodes }
      }
    : emptyCurationOverlay(basePack.id, nowIso)

  const { pack } = applyCurationOverlay(basePack, overlay)
  const nodesMap = new Map(pack.nodes.map((n) => [n.id, n]))
  const existing = nodesMap.get(nodeId)
  if (!existing) {
    return { ok: false, error: `Node "${nodeId}" not found` }
  }

  if (patch.title !== undefined) {
    if (!isRecord(patch.title) || typeof patch.title.zh !== 'string' || patch.title.zh.trim().length === 0) {
      return { ok: false, error: 'Node title.zh must be a non-empty string' }
    }
    if (patch.title.en !== undefined && typeof patch.title.en !== 'string') {
      return { ok: false, error: 'Node title.en must be a string' }
    }
  }
  if (patch.domainId !== undefined && !pack.domains.some((d) => d.id === patch.domainId)) {
    return { ok: false, error: `Unknown domainId "${patch.domainId}"` }
  }
  if (patch.resources) {
    for (const r of patch.resources) {
      if (!HTTP_URL_RE.test(r.url)) {
        return { ok: false, error: `Invalid resource URL "${r.url}"` }
      }
    }
  }
  if (
    patch.estimatedMinutes !== undefined &&
    (typeof patch.estimatedMinutes !== 'number' ||
      !Number.isFinite(patch.estimatedMinutes) ||
      patch.estimatedMinutes < 0)
  ) {
    return { ok: false, error: 'estimatedMinutes must be a non-negative finite number' }
  }

  const nextTitle: KnowledgeNode['title'] | undefined = patch.title
    ? {
        zh: patch.title.zh.trim(),
        ...(typeof patch.title.en === 'string' && patch.title.en.trim().length > 0
          ? { en: patch.title.en.trim() }
          : {})
      }
    : undefined

  const nextNode: KnowledgeNode = {
    ...existing,
    ...patch,
    id: nodeId,
    title: nextTitle ? { ...existing.title, ...nextTitle } : existing.title
  }

  if (nextNode.parentId !== null) {
    const parent = nodesMap.get(nextNode.parentId)
    if (!parent) {
      return { ok: false, error: `Parent node "${nextNode.parentId}" not found` }
    }
    if (parent.kind === 'leaf') {
      return { ok: false, error: `Parent "${nextNode.parentId}" cannot be a leaf` }
    }
    // Check parentId cycle
    let cur: KnowledgeNode | undefined = parent
    const seen = new Set<string>([nodeId])
    while (cur) {
      if (seen.has(cur.id)) {
        return { ok: false, error: `Parent cycle detected involving "${cur.id}"` }
      }
      seen.add(cur.id)
      cur = cur.parentId !== null ? nodesMap.get(cur.parentId) : undefined
    }
  }

  if (nextNode.kind !== existing.kind) {
    if (nextNode.kind === 'leaf' && pack.nodes.some((n) => n.parentId === nodeId)) {
      return {
        ok: false,
        error: `Cannot change node "${nodeId}" to kind "leaf" while it has children`
      }
    }
    if (
      nextNode.kind !== 'unit' &&
      pack.edges.some((e) => (e.type === 'hard' || e.type === 'soft') && (e.from === nodeId || e.to === nodeId))
    ) {
      return {
        ok: false,
        error: `Cannot change unit "${nodeId}" to kind "${nextNode.kind}" while it has hard/soft edges`
      }
    }
  }

  nodesMap.set(nodeId, nextNode)
  if (nextNode.kind === 'leaf' && !hasUnitAncestor(nextNode, nodesMap)) {
    return { ok: false, error: `Leaf "${nodeId}" must have a unit ancestor` }
  }

  if (nextNode.kind !== existing.kind || nextNode.parentId !== existing.parentId) {
    const childrenMap = new Map<string, KnowledgeNode[]>()
    for (const n of nodesMap.values()) {
      if (n.parentId !== null) {
        let list = childrenMap.get(n.parentId)
        if (!list) {
          list = []
          childrenMap.set(n.parentId, list)
        }
        list.push(n)
      }
    }
    const descQueue: KnowledgeNode[] = [...(childrenMap.get(nodeId) ?? [])]
    const seenDesc = new Set<string>()
    while (descQueue.length > 0) {
      const desc = descQueue.shift()!
      if (seenDesc.has(desc.id)) continue
      seenDesc.add(desc.id)
      if (desc.kind === 'leaf' && !hasUnitAncestor(desc, nodesMap)) {
        const reason =
          nextNode.kind !== existing.kind
            ? `Cannot change "${nodeId}" to kind "${nextNode.kind}"`
            : `Cannot reparent "${nodeId}" to "${nextNode.parentId ?? 'root'}"`
        return {
          ok: false,
          error: `${reason}: descendant leaf "${desc.id}" would lose its unit ancestor`
        }
      }
      for (const ch of childrenMap.get(desc.id) ?? []) {
        descQueue.push(ch)
      }
    }
  }

  const addedIdx = overlay.addedNodes.findIndex((n) => n.id === nodeId)
  if (addedIdx >= 0) {
    overlay.addedNodes[addedIdx] = nextNode
  } else {
    const prevPatch = overlay.updatedNodes[nodeId] ?? {}
    const mergedPatch: Partial<Omit<KnowledgeNode, 'id'>> = {
      ...prevPatch,
      ...patch
    }
    if (prevPatch.title || nextTitle) {
      mergedPatch.title = {
        ...(prevPatch.title ?? { zh: existing.title.zh }),
        ...(nextTitle ?? {})
      }
    }
    overlay.updatedNodes[nodeId] = mergedPatch
  }
  overlay.updatedAt = nowIso

  return { ok: true, data: { overlay, node: nextNode } }
}

export function overlayDeleteNode(
  basePack: PackDocument,
  currentOverlay: PackCurationOverlay | null,
  nodeId: string,
  nowIso: string = new Date().toISOString()
): MutationResult<{ overlay: PackCurationOverlay; deletedIds: string[] }> {
  const overlay = currentOverlay
    ? {
        ...currentOverlay,
        addedNodes: [...currentOverlay.addedNodes],
        updatedNodes: { ...currentOverlay.updatedNodes },
        deletedNodeIds: [...currentOverlay.deletedNodeIds],
        addedEdges: [...currentOverlay.addedEdges],
        deletedEdgeIds: [...currentOverlay.deletedEdgeIds]
      }
    : emptyCurationOverlay(basePack.id, nowIso)

  const { pack } = applyCurationOverlay(basePack, overlay)
  if (!pack.nodes.some((n) => n.id === nodeId)) {
    return { ok: false, error: `Node "${nodeId}" not found` }
  }

  const childrenMap = new Map<string, string[]>()
  for (const n of pack.nodes) {
    if (n.parentId !== null) {
      let list = childrenMap.get(n.parentId)
      if (!list) {
        list = []
        childrenMap.set(n.parentId, list)
      }
      list.push(n.id)
    }
  }

  const toDelete = new Set<string>([nodeId])
  const queue = [nodeId]
  while (queue.length > 0) {
    const cur = queue.shift()!
    for (const c of childrenMap.get(cur) ?? []) {
      if (!toDelete.has(c)) {
        toDelete.add(c)
        queue.push(c)
      }
    }
  }

  const baseIds = new Set(basePack.nodes.map((n) => n.id))
  overlay.addedNodes = overlay.addedNodes.filter((n) => !toDelete.has(n.id))
  for (const id of toDelete) {
    delete overlay.updatedNodes[id]
    if (baseIds.has(id) && !overlay.deletedNodeIds.includes(id)) {
      overlay.deletedNodeIds.push(id)
    }
  }

  const baseEdgeIds = new Set(basePack.edges.map((e) => e.id))
  const keptAddedEdges: KnowledgeEdge[] = []
  const removedBaseOverlayEdgeIds: string[] = []
  for (const e of overlay.addedEdges) {
    if (toDelete.has(e.from) || toDelete.has(e.to)) {
      if (baseEdgeIds.has(e.id)) {
        removedBaseOverlayEdgeIds.push(e.id)
      }
    } else {
      keptAddedEdges.push(e)
    }
  }
  overlay.addedEdges = keptAddedEdges
  const activeAddedEdgeIds = new Set(overlay.addedEdges.map((e) => e.id))
  for (const id of removedBaseOverlayEdgeIds) {
    if (!activeAddedEdgeIds.has(id) && !overlay.deletedEdgeIds.includes(id)) {
      overlay.deletedEdgeIds.push(id)
    }
  }
  for (const e of basePack.edges) {
    if (
      (toDelete.has(e.from) || toDelete.has(e.to)) &&
      !activeAddedEdgeIds.has(e.id) &&
      !overlay.deletedEdgeIds.includes(e.id)
    ) {
      overlay.deletedEdgeIds.push(e.id)
    }
  }
  overlay.updatedAt = nowIso

  return { ok: true, data: { overlay, deletedIds: [...toDelete] } }
}

export function overlayAddEdge(
  basePack: PackDocument,
  currentOverlay: PackCurationOverlay | null,
  input: CreateEdgeInput,
  nowIso: string = new Date().toISOString()
): MutationResult<{ overlay: PackCurationOverlay; edge: KnowledgeEdge }> {
  const overlay = currentOverlay
    ? {
        ...currentOverlay,
        addedEdges: [...currentOverlay.addedEdges],
        deletedEdgeIds: [...currentOverlay.deletedEdgeIds]
      }
    : emptyCurationOverlay(basePack.id, nowIso)

  const { pack } = applyCurationOverlay(basePack, overlay)
  const nodesMap = new Map(pack.nodes.map((n) => [n.id, n]))

  if (input.from === input.to) {
    return {
      ok: false,
      error: `Self-loop on "${input.from}" is forbidden`,
      cyclePath: [input.from, input.to],
      cycleEdgeIds: []
    }
  }

  const fromNode = nodesMap.get(input.from)
  const toNode = nodesMap.get(input.to)
  if (!fromNode || !toNode) {
    return { ok: false, error: `Edge endpoints "${input.from}" -> "${input.to}" must exist` }
  }
  if ((input.type === 'hard' || input.type === 'soft') && (fromNode.kind !== 'unit' || toNode.kind !== 'unit')) {
    return { ok: false, error: `${input.type} edges must connect unit nodes` }
  }

  const cyclePath = wouldCreateCycle(input, pack.nodes, pack.edges)
  if (cyclePath) {
    const cycleEdgeIds = findCycleEdgeIds(cyclePath, pack.edges)
    return {
      ok: false,
      error: `Adding edge "${input.from}" -> "${input.to}" creates a prerequisite cycle: ${cyclePath.join(' -> ')}`,
      cyclePath,
      cycleEdgeIds
    }
  }

  const edgeId = input.id?.trim() || `${input.type}:${input.from}->${input.to}#${Date.now()}`
  if (pack.edges.some((e) => e.id === edgeId)) {
    return { ok: false, error: `Edge id "${edgeId}" already exists` }
  }

  const edge: KnowledgeEdge = {
    id: edgeId,
    from: input.from,
    to: input.to,
    type: input.type,
    ...(input.reason?.trim() ? { reason: input.reason.trim() } : {})
  }

  overlay.deletedEdgeIds = overlay.deletedEdgeIds.filter((d) => d !== edge.id)
  overlay.addedEdges.push(edge)
  overlay.updatedAt = nowIso

  return { ok: true, data: { overlay, edge } }
}

export function overlayDeleteEdge(
  basePack: PackDocument,
  currentOverlay: PackCurationOverlay | null,
  edgeId: string,
  nowIso: string = new Date().toISOString()
): MutationResult<PackCurationOverlay> {
  const overlay = currentOverlay
    ? {
        ...currentOverlay,
        addedEdges: [...currentOverlay.addedEdges],
        deletedEdgeIds: [...currentOverlay.deletedEdgeIds]
      }
    : emptyCurationOverlay(basePack.id, nowIso)

  const { pack } = applyCurationOverlay(basePack, overlay)
  if (!pack.edges.some((e) => e.id === edgeId)) {
    return { ok: false, error: `Edge "${edgeId}" not found` }
  }

  const addedIdx = overlay.addedEdges.findIndex((e) => e.id === edgeId)
  if (addedIdx >= 0) {
    overlay.addedEdges.splice(addedIdx, 1)
  }
  if (basePack.edges.some((e) => e.id === edgeId) && !overlay.deletedEdgeIds.includes(edgeId)) {
    overlay.deletedEdgeIds.push(edgeId)
  }
  overlay.updatedAt = nowIso

  return { ok: true, data: overlay }
}

const STATUS_RANK: Record<UserNodeStatus, number> = {
  unstarted: 0,
  queued: 1,
  learning: 2,
  lit: 3
}

export function mergePackProgress(
  existing: PackProgress | null,
  incoming: PackProgress,
  mode: 'merge' | 'replace'
): PackProgress {
  if (mode === 'replace' || !existing || !isRecord(existing)) {
    return isRecord(incoming)
      ? sanitizePackProgress(incoming, [])
      : emptyPackProgress('')
  }
  if (!isRecord(incoming)) {
    return sanitizePackProgress(existing, [])
  }

  const existingPackId = typeof existing.packId === 'string' ? existing.packId : ''
  const incomingPackId =
    typeof incoming.packId === 'string' && incoming.packId.length > 0
      ? incoming.packId
      : existingPackId

  const mergedNodes: Record<string, UserNodeProgress> = {}
  if (isRecord(existing.nodes)) {
    for (const [id, cur] of Object.entries(existing.nodes)) {
      const sanitizedCur = sanitizeUserNodeProgressEntry(cur, existingPackId, id, [])
      if (sanitizedCur.entry) {
        mergedNodes[id] = sanitizedCur.entry
      }
    }
  }

  const incomingNodesObj = isRecord(incoming.nodes) ? incoming.nodes : {}
  for (const [id, rawInc] of Object.entries(incomingNodesObj)) {
    const sanitizedInc = sanitizeUserNodeProgressEntry(rawInc, incomingPackId, id, [])
    const inc = sanitizedInc.entry
    if (!inc) continue

    const cur = mergedNodes[id]
    if (!cur) {
      mergedNodes[id] = inc
      continue
    }
    const status =
      STATUS_RANK[inc.status] >= STATUS_RANK[cur.status] ? inc.status : cur.status
    const curTags = Array.isArray(cur.tags) ? cur.tags : []
    const incTags = Array.isArray(inc.tags) ? inc.tags : []
    const tags = Array.from(new Set([...curTags, ...incTags]))
    const curEx = Array.isArray(cur.completedExercises) ? cur.completedExercises : []
    const incEx = Array.isArray(inc.completedExercises) ? inc.completedExercises : []
    const completedExercises = Array.from(new Set([...curEx, ...incEx])).sort((a, b) => a - b)

    const resMap = new Map<string, NonNullable<UserNodeProgress['customResources']>[number]>()
    if (Array.isArray(cur.customResources)) {
      for (const r of cur.customResources) {
        if (isRecord(r) && typeof r.url === 'string' && HTTP_URL_RE.test(r.url.trim())) {
          resMap.set(r.url, r)
        }
      }
    }
    if (Array.isArray(inc.customResources)) {
      for (const r of inc.customResources) {
        if (isRecord(r) && typeof r.url === 'string' && HTTP_URL_RE.test(r.url.trim())) {
          resMap.set(r.url, r)
        }
      }
    }

    const curBox = clampLeitnerBox(cur.leitnerBox, 0)
    const incBox = clampLeitnerBox(inc.leitnerBox, 0)
    const curMastery = clampMastery(cur.mastery, 0)
    const incMastery = clampMastery(inc.mastery, 0)
    const curReviewCount = sanitizeNonNegNumber(cur.reviewCount, 0)
    const incReviewCount = sanitizeNonNegNumber(inc.reviewCount, 0)

    const leitnerBox = Math.max(curBox, incBox) as LeitnerBox
    const mastery = Math.max(curMastery, incMastery) as MasteryLevel

    const merged: UserNodeProgress = {
      status,
      reviewCount: Math.max(curReviewCount, incReviewCount),
      leitnerBox,
      mastery
    }
    if (status === 'lit') {
      merged.litAt = cur.litAt && inc.litAt ? (cur.litAt > inc.litAt ? cur.litAt : inc.litAt) : (inc.litAt ?? cur.litAt)
      if (incBox !== curBox) {
        const incHigher = incBox > curBox
        merged.litMode = incHigher ? (inc.litMode ?? cur.litMode) : (cur.litMode ?? inc.litMode)
        merged.nextReviewAt = incHigher ? (inc.nextReviewAt ?? cur.nextReviewAt) : (cur.nextReviewAt ?? inc.nextReviewAt)
      } else if ((inc.lastReviewedAt ?? '') !== (cur.lastReviewedAt ?? '')) {
        const incNewer = (inc.lastReviewedAt ?? '') > (cur.lastReviewedAt ?? '')
        merged.litMode = incNewer ? (inc.litMode ?? cur.litMode) : (cur.litMode ?? inc.litMode)
        merged.nextReviewAt = incNewer ? (inc.nextReviewAt ?? cur.nextReviewAt) : (cur.nextReviewAt ?? inc.nextReviewAt)
      } else {
        merged.litMode = inc.litMode ?? cur.litMode
        merged.nextReviewAt =
          cur.nextReviewAt && inc.nextReviewAt
            ? (cur.nextReviewAt > inc.nextReviewAt ? cur.nextReviewAt : inc.nextReviewAt)
            : (inc.nextReviewAt ?? cur.nextReviewAt)
      }
    }
    if (cur.startedAt || inc.startedAt) {
      merged.startedAt = cur.startedAt && inc.startedAt ? (cur.startedAt < inc.startedAt ? cur.startedAt : inc.startedAt) : (cur.startedAt ?? inc.startedAt)
    }
    if (cur.lastReviewedAt || inc.lastReviewedAt) {
      merged.lastReviewedAt =
        cur.lastReviewedAt && inc.lastReviewedAt
          ? (cur.lastReviewedAt > inc.lastReviewedAt ? cur.lastReviewedAt : inc.lastReviewedAt)
          : (cur.lastReviewedAt ?? inc.lastReviewedAt)
    }
    const note = inc.noteMarkdown ?? cur.noteMarkdown
    if (note && note.length > 0) merged.noteMarkdown = note
    if (resMap.size > 0) merged.customResources = [...resMap.values()]
    if (tags.length > 0) merged.tags = tags
    if (cur.pinned || inc.pinned) merged.pinned = true
    if (completedExercises.length > 0) merged.completedExercises = completedExercises

    mergedNodes[id] = merged
  }

  const dailyActivity: Record<string, DailyActivityEntry> = {}
  if (isRecord(existing.dailyActivity)) {
    for (const [dateKey, curDay] of Object.entries(existing.dailyActivity)) {
      if (!isValidDateKey(dateKey) || !isRecord(curDay)) continue
      dailyActivity[dateKey] = {
        lit: sanitizeNonNegNumber(curDay.lit, 0),
        reviewed: sanitizeNonNegNumber(curDay.reviewed, 0),
        focusMinutes: sanitizeNonNegNumber(curDay.focusMinutes, 0),
        xp: sanitizeNonNegNumber(curDay.xp, 0)
      }
    }
  }
  if (isRecord(incoming.dailyActivity)) {
    for (const [dateKey, incDay] of Object.entries(incoming.dailyActivity)) {
      if (!isValidDateKey(dateKey) || !isRecord(incDay)) continue
      const incClean: DailyActivityEntry = {
        lit: sanitizeNonNegNumber(incDay.lit, 0),
        reviewed: sanitizeNonNegNumber(incDay.reviewed, 0),
        focusMinutes: sanitizeNonNegNumber(incDay.focusMinutes, 0),
        xp: sanitizeNonNegNumber(incDay.xp, 0)
      }
      const curDay = dailyActivity[dateKey]
      if (!curDay) {
        dailyActivity[dateKey] = incClean
      } else {
        dailyActivity[dateKey] = {
          lit: Math.max(curDay.lit, incClean.lit),
          reviewed: Math.max(curDay.reviewed, incClean.reviewed),
          focusMinutes: Math.max(curDay.focusMinutes, incClean.focusMinutes),
          xp: Math.max(curDay.xp, incClean.xp)
        }
      }
    }
  }

  const sessionMap = new Map<string, StudySession>()
  const existingSessions = Array.isArray(existing.sessions) ? existing.sessions : []
  const incomingSessions = Array.isArray(incoming.sessions) ? incoming.sessions : []
  for (const s of [...existingSessions, ...incomingSessions]) {
    const res = sanitizeStudySession(s)
    if (res.session) sessionMap.set(res.session.id, res.session)
  }

  const histMap = new Map<string, ProgressHistoryItem>()
  const existingHistory = Array.isArray(existing.history) ? existing.history : []
  const incomingHistory = Array.isArray(incoming.history) ? incoming.history : []
  for (const h of [...existingHistory, ...incomingHistory]) {
    if (isRecord(h) && typeof h.id === 'string' && typeof h.at === 'string') {
      histMap.set(`${h.id}|${h.at}|${String(h.action ?? '')}`, h as ProgressHistoryItem)
    }
  }

  const litCount = Object.values(mergedNodes).filter((n) => n.status === 'lit').length
  const dates = Object.keys(dailyActivity).sort()
  const lastStudyDate = dates.length > 0 ? dates[dates.length - 1] : undefined
  const streakDays = lastStudyDate ? sanitizeNonNegNumber(recomputeStreak(dailyActivity, lastStudyDate), 0) : 0

  return {
    schema: 'litree/progress-v2',
    packId: incomingPackId,
    nodes: mergedNodes,
    xp: Math.max(
      sanitizeNonNegNumber(existing.xp, 0),
      sanitizeNonNegNumber(incoming.xp, 0),
      litCount * XP_PER_LEAF
    ),
    streakDays,
    lastStudyDate,
    dailyActivity,
    sessions: [...sessionMap.values()],
    history: [...histMap.values()],
    activeRouteId: incoming.activeRouteId ?? existing.activeRouteId,
    lastFocusedNodeId: incoming.lastFocusedNodeId ?? existing.lastFocusedNodeId
  }
}

export function buildBackupV2(
  payload: {
    progressByPack: Record<string, PackProgress>
    curationByPack?: Record<string, PackCurationOverlay>
    customPacks?: PackDocument[]
    settings?: Partial<UserSettings>
  },
  exportedAt: string = new Date().toISOString()
): BackupV2 {
  return {
    schema: 'litree/backup-v2',
    exportedAt,
    progressByPack: payload.progressByPack,
    curationByPack: payload.curationByPack ?? {},
    customPacks: payload.customPacks ?? [],
    ...(payload.settings ? { settings: payload.settings } : {})
  }
}

export function parseBackupImport(jsonText: string):
  | { ok: true; backup: BackupV2; warnings: string[] }
  | { ok: false; error: string; warnings: string[] } {
  const warnings: string[] = []
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    return { ok: false, error: 'Invalid JSON syntax in backup file', warnings }
  }

  if (!isRecord(parsed)) {
    return { ok: false, error: 'Backup payload must be a JSON object', warnings }
  }

  if (parsed.schema === 'litree/backup-v2') {
    if (!isRecord(parsed.progressByPack)) {
      return { ok: false, error: 'Backup v2 missing progressByPack object', warnings }
    }
    const progressByPack: Record<string, PackProgress> = {}
    for (const [packId, p] of Object.entries(parsed.progressByPack)) {
      if (isProgressV2Shape(p)) {
        progressByPack[packId] = sanitizePackProgress(p, warnings)
      } else if (isProgressV1Shape(p)) {
        const mig = migrateProgressV1ToV2(p, packId)
        progressByPack[packId] = mig.progress
        warnings.push(...mig.warnings)
      } else {
        return { ok: false, error: `Invalid progress entry for pack "${packId}"`, warnings }
      }
    }

    const curationByPack: Record<string, PackCurationOverlay> = {}
    if (isRecord(parsed.curationByPack)) {
      for (const [packId, ov] of Object.entries(parsed.curationByPack)) {
        const validOv = parseCurationOverlay(ov, warnings)
        if (validOv) {
          curationByPack[packId] = validOv
        } else {
          warnings.push(`Skipped malformed curation overlay for pack "${packId}"`)
        }
      }
    }

    const customPacks: PackDocument[] = []
    if (Array.isArray(parsed.customPacks)) {
      for (const cp of parsed.customPacks) {
        const res = normalizePackToV2(cp, { source: 'custom' })
        if (res.ok) {
          customPacks.push(res.pack)
        } else {
          warnings.push(`Skipped invalid custom pack: ${res.errors[0] ?? 'unknown error'}`)
        }
      }
    }

    const settings = isRecord(parsed.settings) ? (parsed.settings as Partial<UserSettings>) : undefined

    return {
      ok: true,
      backup: buildBackupV2(
        { progressByPack, curationByPack, customPacks, settings },
        typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString()
      ),
      warnings
    }
  }

  if (isProgressV2Shape(parsed)) {
    const cleanProgress = sanitizePackProgress(parsed, warnings)
    return {
      ok: true,
      backup: buildBackupV2({ progressByPack: { [cleanProgress.packId]: cleanProgress } }),
      warnings
    }
  }

  if (isProgressV1Shape(parsed)) {
    const mig = migrateProgressV1ToV2(parsed)
    warnings.push(...mig.warnings)
    return {
      ok: true,
      backup: buildBackupV2({ progressByPack: { [mig.progress.packId]: mig.progress } }),
      warnings
    }
  }

  return {
    ok: false,
    error: `Unsupported backup schema "${String(parsed.schema ?? 'unknown')}"`,
    warnings
  }
}

export function exportMarkdownJournal(
  pack: PackDocument,
  progress: PackProgress,
  now: Date = new Date()
): string {
  const index = buildGraphIndex(pack)
  const totalLeaves = pack.nodes.filter((n) => n.kind === 'leaf').length
  const nodesMap = isRecord(progress.nodes) ? progress.nodes : {}
  const litCount = Object.entries(nodesMap).filter(
    ([id, e]) => isRecord(e) && e.status === 'lit' && index.nodesById.get(id)?.kind === 'leaf'
  ).length
  const totalFocusMinutes = (Array.isArray(progress.sessions) ? progress.sessions : []).reduce(
    (sum, s) =>
      sum + (isRecord(s) && s.mode === 'focus' ? sanitizeNonNegNumber(s.durationMinutes, 0) : 0),
    0
  )

  const lines: string[] = [
    `# ${pack.title.zh}${pack.title.en ? ` (${pack.title.en})` : ''} — Study Journal`,
    '',
    `- Exported: ${now.toISOString()}`,
    `- Progress: ${litCount} / ${totalLeaves} leaves lit`,
    `- XP: ${sanitizeNonNegNumber(progress.xp, 0)}`,
    `- Streak: ${sanitizeNonNegNumber(progress.streakDays, 0)} days`,
    `- Total Focus: ${totalFocusMinutes} min`,
    ''
  ]

  const hasJournalContent = (id: string): boolean => {
    const e = nodesMap[id]
    if (!isRecord(e)) return false
    return (
      e.status !== 'unstarted' ||
      Boolean(e.pinned) ||
      Boolean(e.noteMarkdown && e.noteMarkdown.length > 0) ||
      Boolean(e.customResources && e.customResources.length > 0) ||
      Boolean(e.tags && e.tags.length > 0) ||
      Boolean(e.completedExercises && e.completedExercises.length > 0)
    )
  }

  const domainMap = new Map(pack.domains.map((d) => [d.id, d]))
  const units = pack.nodes.filter((n) => n.kind === 'unit')
  const unitsByDomain = new Map<string, KnowledgeNode[]>()
  for (const u of units) {
    let list = unitsByDomain.get(u.domainId)
    if (!list) {
      list = []
      unitsByDomain.set(u.domainId, list)
    }
    list.push(u)
  }

  // Also include branch notes/pins if any
  for (const b of pack.nodes.filter((n) => n.kind === 'branch' && hasJournalContent(n.id))) {
    const e = progress.nodes[b.id]!
    lines.push(`## Branch: ${b.title.zh} (${b.id})`)
    if (e.pinned) lines.push('- Pinned: true')
    if (e.tags?.length) lines.push(`- Tags: ${e.tags.join(', ')}`)
    if (e.noteMarkdown) lines.push('', e.noteMarkdown, '')
  }

  for (const [domainId, domainUnits] of unitsByDomain) {
    const domain = domainMap.get(domainId)
    const domainSections: string[] = []
    for (const u of domainUnits) {
      const leaves = index.leavesOf(u.id).filter((l) => hasJournalContent(l.id))
      const unitHasContent = hasJournalContent(u.id)
      if (!unitHasContent && leaves.length === 0) continue

      domainSections.push(`### ${u.title.zh} (${u.id})`)
      if (unitHasContent) {
        const ue = progress.nodes[u.id]!
        if (ue.pinned) domainSections.push('- Pinned: true')
        if (ue.tags?.length) domainSections.push(`- Tags: ${ue.tags.join(', ')}`)
        if (ue.completedExercises?.length) {
          domainSections.push(`- Completed Exercises: ${ue.completedExercises.map((i) => `#${i + 1}`).join(', ')}`)
        }
        if (ue.customResources?.length) {
          for (const r of ue.customResources) {
            domainSections.push(`- Resource: [${r.title}](${r.url})`)
          }
        }
        if (ue.noteMarkdown) {
          domainSections.push('', ue.noteMarkdown, '')
        }
      }

      for (const l of leaves) {
        const le = progress.nodes[l.id]!
        domainSections.push(`#### ${l.title.zh} (${l.id}) — \`${le.status}\``)
        if (le.pinned) domainSections.push('- Pinned: true')
        if (le.tags?.length) domainSections.push(`- Tags: ${le.tags.join(', ')}`)
        if (le.customResources?.length) {
          for (const r of le.customResources) {
            domainSections.push(`- Resource: [${r.title}](${r.url})`)
          }
        }
        if (le.noteMarkdown) {
          domainSections.push('', le.noteMarkdown, '')
        }
      }
    }

    if (domainSections.length > 0) {
      lines.push(`## ${domain?.name ?? domainId} (${domainId})`, '', ...domainSections, '')
    }
  }

  return lines.join('\n').trimEnd() + '\n'
}

export interface StorageService {
  getRaw(key: string): Promise<string | null>
  setRaw(key: string, value: string): Promise<{ warning?: string }>
  removeRaw(key: string): Promise<void>
  getPackOverride(): Promise<string | null>
  setPackOverride(packId: string | null): Promise<void>
  loadSettings(): Promise<Partial<UserSettings> | null>
  saveSettings(settings: UserSettings): Promise<void>
  loadProgress(packId: string): Promise<
    | { ok: true; progress: PackProgress | null; migratedFromV1: boolean; warnings: string[] }
    | { ok: false; error: string; warnings: string[] }
  >
  saveProgress(progress: PackProgress): Promise<{ warning?: string }>
  loadCuration(packId: string): Promise<PackCurationOverlay | null>
  saveCuration(overlay: PackCurationOverlay): Promise<{ warning?: string }>
  resetCuration(packId: string): Promise<void>
  listCustomPacks(): Promise<PackMeta[]>
  loadCustomPack(packId: string): Promise<PackDocument | null>
  saveCustomPack(pack: PackDocument): Promise<{ warning?: string }>
  deleteCustomPack(packId: string): Promise<void>
  listAllKnownProgressPackIds(): Promise<string[]>
}

export function createStorageService(deps?: StorageDeps): StorageService {
  const idb: IDBFactory | null =
    deps?.indexedDB !== undefined
      ? deps.indexedDB
      : typeof indexedDB !== 'undefined'
        ? indexedDB
        : null

  const ls: StorageLike | null =
    deps?.localStorage !== undefined
      ? deps.localStorage
      : typeof localStorage !== 'undefined'
        ? localStorage
        : null

  const memory = new Map<string, string>()

  const getRaw = async (key: string): Promise<string | null> => {
    if (idb) {
      try {
        const val = await idbGet(idb, key)
        if (val !== null) return val
      } catch {
        // Fallback to localStorage/memory
      }
    }
    if (ls) {
      try {
        const val = ls.getItem(key)
        if (val !== null) {
          if (idb) void idbSet(idb, key, val).catch(() => {})
          return val
        }
      } catch {
        // Fallback to memory
      }
    }
    return memory.get(key) ?? null
  }

  const setRaw = async (key: string, value: string): Promise<{ warning?: string }> => {
    let warning: string | undefined
    memory.set(key, value)

    if (idb) {
      try {
        await idbSet(idb, key, value)
      } catch (err) {
        warning = `IndexedDB write warning: ${err instanceof Error ? err.message : String(err)}`
      }
    }

    if (ls) {
      try {
        ls.setItem(key, value)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        warning = warning ? `${warning}; localStorage: ${msg}` : `localStorage write warning: ${msg}`
      }
    }

    return warning ? { warning } : {}
  }

  const removeRaw = async (key: string): Promise<void> => {
    memory.delete(key)
    if (idb) {
      try {
        await idbDelete(idb, key)
      } catch {
        // Ignore
      }
    }
    if (ls) {
      try {
        ls.removeItem(key)
      } catch {
        // Ignore
      }
    }
  }

  return {
    getRaw,
    setRaw,
    removeRaw,

    async getPackOverride() {
      return getRaw(OVERRIDE_KEY)
    },

    async setPackOverride(packId) {
      if (packId === null) {
        await removeRaw(OVERRIDE_KEY)
      } else {
        await setRaw(OVERRIDE_KEY, packId)
      }
    },

    async loadSettings() {
      const raw = await getRaw(SETTINGS_KEY)
      if (!raw) return null
      try {
        const parsed = JSON.parse(raw)
        return isRecord(parsed) ? (parsed as Partial<UserSettings>) : null
      } catch {
        return null
      }
    },

    async saveSettings(settings) {
      await setRaw(SETTINGS_KEY, JSON.stringify(settings))
    },

    async loadProgress(packId) {
      const key = progressKey(packId)
      const raw = await getRaw(key)
      if (raw === null) {
        return { ok: true, progress: null, migratedFromV1: false, warnings: [] }
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch {
        await setRaw(corruptProgressKey(packId), raw)
        return {
          ok: false,
          error: `Corrupt JSON in progress for "${packId}" (quarantined to ${corruptProgressKey(packId)})`,
          warnings: []
        }
      }

      if (isProgressV2Shape(parsed)) {
        const warnings: string[] = []
        const sanitized = sanitizePackProgress(parsed, warnings)
        return { ok: true, progress: sanitized, migratedFromV1: false, warnings }
      }

      if (isProgressV1Shape(parsed)) {
        const mig = migrateProgressV1ToV2(parsed, packId)
        await setRaw(key, JSON.stringify(mig.progress))
        return {
          ok: true,
          progress: mig.progress,
          migratedFromV1: true,
          warnings: mig.warnings
        }
      }

      await setRaw(corruptProgressKey(packId), raw)
      return {
        ok: false,
        error: `Unrecognized progress shape for "${packId}" (quarantined)`,
        warnings: []
      }
    },

    async saveProgress(progress) {
      return setRaw(progressKey(progress.packId), JSON.stringify(progress))
    },

    async loadCuration(packId) {
      const raw = await getRaw(curationKey(packId))
      if (!raw) return null
      try {
        const parsed = JSON.parse(raw)
        return parseCurationOverlay(parsed)
      } catch {
        return null
      }
    },

    async saveCuration(overlay) {
      return setRaw(curationKey(overlay.packId), JSON.stringify(overlay))
    },

    async resetCuration(packId) {
      await removeRaw(curationKey(packId))
    },

    async listCustomPacks() {
      const raw = await getRaw(CUSTOM_PACKS_KEY)
      if (!raw) return []
      try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? (parsed as PackMeta[]) : []
      } catch {
        return []
      }
    },

    async loadCustomPack(packId) {
      const raw = await getRaw(customPackKey(packId))
      if (!raw) return null
      try {
        const res = normalizePackToV2(JSON.parse(raw), { source: 'custom' })
        return res.ok ? res.pack : null
      } catch {
        return null
      }
    },

    async saveCustomPack(pack) {
      const existing = await this.listCustomPacks()
      const meta: PackMeta = {
        id: pack.id,
        title: pack.title,
        source: 'custom',
        nodeCount: pack.nodes.length,
        ...(pack.description ? { description: pack.description } : {})
      }
      const nextList = [...existing.filter((m) => m.id !== pack.id), meta]
      await setRaw(CUSTOM_PACKS_KEY, JSON.stringify(nextList))
      return setRaw(customPackKey(pack.id), JSON.stringify(pack))
    },

    async deleteCustomPack(packId) {
      const existing = await this.listCustomPacks()
      const nextList = existing.filter((m) => m.id !== packId)
      await setRaw(CUSTOM_PACKS_KEY, JSON.stringify(nextList))
      await removeRaw(customPackKey(packId))
    },

    async listAllKnownProgressPackIds() {
      const ids = new Set<string>(['cs-math', 'dev-mini'])
      for (const m of await this.listCustomPacks()) ids.add(m.id)
      for (const k of memory.keys()) {
        if (k.startsWith('litree:progress:') && !k.endsWith(':corrupt')) {
          ids.add(k.slice('litree:progress:'.length))
        }
      }
      if (ls && typeof ls.length === 'number' && typeof ls.key === 'function') {
        try {
          for (let i = 0; i < ls.length; i++) {
            const k = ls.key(i)
            if (k && k.startsWith('litree:progress:') && !k.endsWith(':corrupt')) {
              ids.add(k.slice('litree:progress:'.length))
            }
          }
        } catch {
          // Ignore storage enumeration errors
        }
      }
      return [...ids]
    }
  }
}
