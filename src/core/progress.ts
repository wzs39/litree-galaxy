import { computeNodeVisualState, getNodeVisualState, isNodeReviewDue } from './graph'
import type {
  CustomResource,
  DailyActivityEntry,
  GraphIndex,
  LeitnerBox,
  MasteryLevel,
  PackProgress,
  ProgressHistoryItem,
  StudySession,
  UserNodeProgress,
  UserNodeStatus
} from './types'

export const XP_PER_LEAF = 2
export const XP_PER_REVIEW = 1
export const XP_PER_FOCUS_SESSION = 2
export const LEITNER_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const
export const HISTORY_LIMIT = 2000

const HTTP_URL_RE = /^https?:\/\//i
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}/
const STRICT_DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function isValidDateKey(key: string): boolean {
  const match = STRICT_DATE_KEY_RE.exec(key)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const utcMs = Date.UTC(year, month - 1, day)
  if (!Number.isFinite(utcMs)) return false
  const dt = new Date(utcMs)
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  )
}

export { computeNodeVisualState, getNodeVisualState }

export function emptyPackProgress(packId: string): PackProgress {
  return {
    schema: 'litree/progress-v2',
    packId,
    nodes: {},
    xp: 0,
    streakDays: 0,
    dailyActivity: {},
    sessions: [],
    history: []
  }
}

export function defaultNodeProgress(): UserNodeProgress {
  return {
    status: 'unstarted',
    reviewCount: 0,
    leitnerBox: 0,
    mastery: 0
  }
}

export function toDateKey(isoOrDate: string | Date): string {
  if (isoOrDate instanceof Date) {
    return Number.isFinite(isoOrDate.getTime())
      ? isoOrDate.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  }
  if (DATE_KEY_RE.test(isoOrDate)) {
    const candidate = isoOrDate.slice(0, 10)
    if (isValidDateKey(candidate)) return candidate
  }
  const parsed = Date.parse(isoOrDate)
  if (Number.isFinite(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10)
  }
  return new Date().toISOString().slice(0, 10)
}

function parseDateKeyUtc(dateKey: string): number | null {
  if (!isValidDateKey(dateKey)) return null
  const [y, m, d] = dateKey.split('-').map(Number)
  const utc = Date.UTC(y!, m! - 1, d!)
  return Number.isFinite(utc) ? utc : null
}

export function diffDays(fromDateKey: string, toDateKeyStr: string): number {
  const fromUtc = parseDateKeyUtc(fromDateKey)
  const toUtc = parseDateKeyUtc(toDateKeyStr)
  if (fromUtc === null || toUtc === null) return 0
  return Math.round((toUtc - fromUtc) / 86_400_000)
}

function addDaysToDateKey(dateKey: string, deltaDays: number): string | null {
  if (!Number.isFinite(deltaDays)) return null
  const base = parseDateKeyUtc(dateKey)
  if (base === null) return null
  const shifted = base + deltaDays * 86_400_000
  if (!Number.isFinite(shifted)) return null
  return new Date(shifted).toISOString().slice(0, 10)
}

function isDayActive(entry: DailyActivityEntry | undefined): boolean {
  if (!entry) return false
  return entry.lit + entry.reviewed + entry.focusMinutes > 0
}

export function recomputeStreak(
  dailyActivity: Record<string, DailyActivityEntry>,
  anchorDateKey: string
): number {
  if (!isValidDateKey(anchorDateKey)) return 0
  let streak = 0
  let cur: string | null = anchorDateKey
  while (cur !== null && isDayActive(dailyActivity[cur])) {
    streak++
    cur = addDaysToDateKey(cur, -1)
  }
  return streak
}

export function recordDailyActivity(
  progress: PackProgress,
  dateKey: string,
  delta: Partial<DailyActivityEntry>
): PackProgress {
  if (!isValidDateKey(dateKey)) return progress
  const prevDay = progress.dailyActivity[dateKey] ?? {
    lit: 0,
    reviewed: 0,
    focusMinutes: 0,
    xp: 0
  }
  const nextDay: DailyActivityEntry = {
    lit: prevDay.lit + (delta.lit ?? 0),
    reviewed: prevDay.reviewed + (delta.reviewed ?? 0),
    focusMinutes: prevDay.focusMinutes + (delta.focusMinutes ?? 0),
    xp: prevDay.xp + (delta.xp ?? 0)
  }

  const nextDailyActivity: Record<string, DailyActivityEntry> = {
    ...progress.dailyActivity,
    [dateKey]: nextDay
  }

  let nextLastStudyDate = progress.lastStudyDate
  let nextStreak = progress.streakDays

  if (isDayActive(nextDay)) {
    if (!nextLastStudyDate || !isValidDateKey(nextLastStudyDate)) {
      nextLastStudyDate = dateKey
      nextStreak = 1
    } else if (dateKey === nextLastStudyDate) {
      nextStreak = Math.max(1, nextStreak)
    } else {
      const gap = diffDays(nextLastStudyDate, dateKey)
      if (gap === 1) {
        nextLastStudyDate = dateKey
        nextStreak = nextStreak + 1
      } else if (gap > 1) {
        nextLastStudyDate = dateKey
        nextStreak = 1
      } else {
        // Backfilled an earlier date: recompute consecutive streak ending at lastStudyDate
        nextStreak = recomputeStreak(nextDailyActivity, nextLastStudyDate)
      }
    }
  }

  return {
    ...progress,
    dailyActivity: nextDailyActivity,
    lastStudyDate: nextLastStudyDate,
    streakDays: nextStreak
  }
}

export function getActiveStreak(
  progress: PackProgress,
  todayKey: string = toDateKey(new Date())
): number {
  if (!progress.lastStudyDate || !isValidDateKey(progress.lastStudyDate) || !isValidDateKey(todayKey)) {
    return 0
  }
  const gap = diffDays(progress.lastStudyDate, todayKey)
  if (gap > 1) return 0
  return progress.streakDays
}

export function addDaysIso(iso: string, days: number): string {
  const baseMs = Date.parse(iso)
  const validMs = Number.isFinite(baseMs) ? baseMs : Date.now()
  return new Date(validMs + days * 86_400_000).toISOString()
}

export function isReviewDue(
  entry: UserNodeProgress | undefined,
  nowMs: number = Date.now()
): boolean {
  return isNodeReviewDue(entry, nowMs)
}

function appendHistory(
  history: readonly ProgressHistoryItem[],
  item: ProgressHistoryItem
): ProgressHistoryItem[] {
  const next = [...history, item]
  if (next.length > HISTORY_LIMIT) {
    return next.slice(next.length - HISTORY_LIMIT)
  }
  return next
}

export function gradeReviewProgress(
  progress: PackProgress,
  nodeId: string,
  remembered: boolean,
  nowIso: string
): PackProgress {
  const prev = progress.nodes[nodeId]
  if (!prev || prev.status !== 'lit') {
    return progress
  }

  let nextBox: LeitnerBox
  let mastery: MasteryLevel
  if (remembered) {
    nextBox = Math.min(5, Math.max(1, prev.leitnerBox + 1)) as LeitnerBox
    mastery = nextBox >= 4 ? 3 : nextBox >= 2 ? 2 : 1
  } else {
    nextBox = 1
    mastery = 0
  }

  const intervalDays = LEITNER_INTERVAL_DAYS[nextBox - 1] ?? 1
  const nextEntry: UserNodeProgress = {
    ...prev,
    leitnerBox: nextBox,
    mastery,
    lastReviewedAt: nowIso,
    nextReviewAt: addDaysIso(nowIso, intervalDays),
    reviewCount: prev.reviewCount + 1
  }

  const base: PackProgress = {
    ...progress,
    xp: progress.xp + XP_PER_REVIEW,
    nodes: {
      ...progress.nodes,
      [nodeId]: nextEntry
    },
    history: appendHistory(progress.history, {
      id: nodeId,
      at: nowIso,
      xp: XP_PER_REVIEW,
      action: 'review'
    })
  }

  return recordDailyActivity(base, toDateKey(nowIso), {
    reviewed: 1,
    xp: XP_PER_REVIEW
  })
}

export function getDueReviewNodeIds(
  progress: PackProgress,
  index: GraphIndex,
  nowMs: number = Date.now()
): string[] {
  const due: { id: string; dueMs: number }[] = []
  for (const [id, entry] of Object.entries(progress.nodes)) {
    if (!index.nodesById.has(id)) continue
    if (isReviewDue(entry, nowMs)) {
      due.push({ id, dueMs: Date.parse(entry.nextReviewAt!) })
    }
  }
  due.sort((a, b) => (a.dueMs !== b.dueMs ? a.dueMs - b.dueMs : a.id.localeCompare(b.id)))
  return due.map((d) => d.id)
}

export function lightNodeProgress(
  progress: PackProgress,
  nodeId: string,
  index: GraphIndex,
  opts: { at: string; mode: 'gated' | 'free' }
): PackProgress {
  const node = index.nodesById.get(nodeId)
  if (!node || node.kind !== 'leaf') return progress

  const prev = progress.nodes[nodeId]
  if (prev?.status === 'lit') return progress

  const leitnerBox: LeitnerBox =
    prev && prev.leitnerBox > 0 ? prev.leitnerBox : 1
  const mastery: MasteryLevel = Math.max(prev?.mastery ?? 0, 1) as MasteryLevel

  const nextEntry: UserNodeProgress = {
    ...(prev ?? defaultNodeProgress()),
    status: 'lit',
    litAt: opts.at,
    litMode: opts.mode,
    startedAt: prev?.startedAt ?? opts.at,
    leitnerBox,
    nextReviewAt: addDaysIso(opts.at, LEITNER_INTERVAL_DAYS[0]),
    mastery
  }

  const base: PackProgress = {
    ...progress,
    xp: progress.xp + XP_PER_LEAF,
    nodes: {
      ...progress.nodes,
      [nodeId]: nextEntry
    },
    history: appendHistory(progress.history, {
      id: nodeId,
      at: opts.at,
      xp: XP_PER_LEAF,
      action: 'light'
    })
  }

  return recordDailyActivity(base, toDateKey(opts.at), {
    lit: 1,
    xp: XP_PER_LEAF
  })
}

export function unlightNodeProgress(
  progress: PackProgress,
  nodeId: string,
  at: string
): PackProgress {
  const prev = progress.nodes[nodeId]
  if (!prev || prev.status !== 'lit') return progress

  const nextEntry: UserNodeProgress = {
    ...prev,
    status: 'unstarted',
    leitnerBox: 0,
    mastery: 0
  }
  delete nextEntry.litAt
  delete nextEntry.litMode
  delete nextEntry.nextReviewAt

  return {
    ...progress,
    xp: Math.max(0, progress.xp - XP_PER_LEAF),
    nodes: {
      ...progress.nodes,
      [nodeId]: nextEntry
    },
    history: appendHistory(progress.history, {
      id: nodeId,
      at,
      xp: -XP_PER_LEAF,
      action: 'unlight'
    })
  }
}

export function setNodeStatusProgress(
  progress: PackProgress,
  nodeId: string,
  status: UserNodeStatus,
  at: string,
  index?: GraphIndex,
  mode: 'gated' | 'free' = 'gated'
): PackProgress {
  if (status === 'lit') {
    return index ? lightNodeProgress(progress, nodeId, index, { at, mode }) : progress
  }

  let current = progress
  const existing = current.nodes[nodeId]
  if (existing?.status === 'lit') {
    current = unlightNodeProgress(current, nodeId, at)
  }

  const prev = current.nodes[nodeId] ?? defaultNodeProgress()
  if (prev.status === status) return current

  const nextEntry: UserNodeProgress = {
    ...prev,
    status,
    startedAt: status === 'learning' ? (prev.startedAt ?? at) : prev.startedAt
  }

  return {
    ...current,
    nodes: {
      ...current.nodes,
      [nodeId]: nextEntry
    }
  }
}

export function updateNodeNote(
  progress: PackProgress,
  nodeId: string,
  noteMarkdown: string
): PackProgress {
  const prev = progress.nodes[nodeId] ?? defaultNodeProgress()
  const nextEntry: UserNodeProgress = {
    ...prev
  }
  if (noteMarkdown.length > 0) {
    nextEntry.noteMarkdown = noteMarkdown
  } else {
    delete nextEntry.noteMarkdown
  }
  return {
    ...progress,
    nodes: {
      ...progress.nodes,
      [nodeId]: nextEntry
    }
  }
}

export function addCustomResource(
  progress: PackProgress,
  nodeId: string,
  res: { title: string; url: string; lang?: 'zh' | 'en'; id?: string },
  nowIso: string = new Date().toISOString()
):
  | { ok: true; progress: PackProgress; resource: CustomResource }
  | { ok: false; error: string } {
  const title = res.title.trim()
  const url = res.url.trim()
  if (title.length === 0) {
    return { ok: false, error: 'Resource title must be non-empty' }
  }
  if (!HTTP_URL_RE.test(url)) {
    return { ok: false, error: 'Resource URL must start with http:// or https://' }
  }

  const prev = progress.nodes[nodeId] ?? defaultNodeProgress()
  const existing = prev.customResources ?? []
  const dup = existing.find((r) => (res.id && r.id === res.id) || r.url === url)
  if (dup) {
    return { ok: true, progress, resource: dup }
  }

  const resource: CustomResource = {
    id: res.id ?? `res-${Date.now()}-${existing.length}`,
    title,
    url,
    addedAt: nowIso
  }
  if (res.lang === 'zh' || res.lang === 'en') {
    resource.lang = res.lang
  }

  const nextEntry: UserNodeProgress = {
    ...prev,
    customResources: [...existing, resource]
  }

  return {
    ok: true,
    progress: {
      ...progress,
      nodes: {
        ...progress.nodes,
        [nodeId]: nextEntry
      }
    },
    resource
  }
}

export function removeCustomResource(
  progress: PackProgress,
  nodeId: string,
  resId: string
): PackProgress {
  const prev = progress.nodes[nodeId]
  if (!prev || !prev.customResources) return progress
  const filtered = prev.customResources.filter((r) => r.id !== resId)
  if (filtered.length === prev.customResources.length) return progress
  return {
    ...progress,
    nodes: {
      ...progress.nodes,
      [nodeId]: {
        ...prev,
        customResources: filtered
      }
    }
  }
}

export function toggleNodeTag(
  progress: PackProgress,
  nodeId: string,
  tag: string
): PackProgress {
  const trimmed = tag.trim()
  if (trimmed.length === 0) return progress
  const prev = progress.nodes[nodeId] ?? defaultNodeProgress()
  const current = prev.tags ?? []
  const has = current.includes(trimmed)
  const nextTags = has ? current.filter((t) => t !== trimmed) : [...current, trimmed]
  return {
    ...progress,
    nodes: {
      ...progress.nodes,
      [nodeId]: {
        ...prev,
        tags: nextTags
      }
    }
  }
}

export function toggleNodePin(progress: PackProgress, nodeId: string): PackProgress {
  const prev = progress.nodes[nodeId] ?? defaultNodeProgress()
  return {
    ...progress,
    nodes: {
      ...progress.nodes,
      [nodeId]: {
        ...prev,
        pinned: !prev.pinned
      }
    }
  }
}

export function toggleNodeExercise(
  progress: PackProgress,
  nodeId: string,
  idx: number
): PackProgress {
  if (!Number.isInteger(idx) || idx < 0) return progress
  const prev = progress.nodes[nodeId] ?? defaultNodeProgress()
  const current = prev.completedExercises ?? []
  const next = current.includes(idx)
    ? current.filter((x) => x !== idx)
    : [...current, idx].sort((a, b) => a - b)
  return {
    ...progress,
    nodes: {
      ...progress.nodes,
      [nodeId]: {
        ...prev,
        completedExercises: next
      }
    }
  }
}

export function logStudySession(
  progress: PackProgress,
  session: StudySession,
  xpEarned: number = XP_PER_FOCUS_SESSION
): PackProgress {
  const duration = Math.max(0, Math.round(session.durationMinutes))
  const xpDelta = Math.max(0, xpEarned)
  const normalizedSession: StudySession = {
    ...session,
    durationMinutes: duration
  }

  const base: PackProgress = {
    ...progress,
    xp: progress.xp + xpDelta,
    lastFocusedNodeId: session.nodeId,
    sessions: [...progress.sessions, normalizedSession],
    history: appendHistory(progress.history, {
      id: session.nodeId,
      at: session.startedAt,
      xp: xpDelta,
      action: session.mode === 'review' ? 'review' : session.mode === 'light' ? 'light' : 'focus'
    })
  }

  return recordDailyActivity(base, toDateKey(session.startedAt), {
    focusMinutes: session.mode === 'focus' ? duration : 0,
    xp: xpDelta
  })
}

export function orphanedNodeIds(progress: PackProgress, index: GraphIndex): string[] {
  return Object.keys(progress.nodes).filter((id) => !index.nodesById.has(id))
}
