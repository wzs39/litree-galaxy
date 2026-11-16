import { expect, type Page } from '@playwright/test'
import { byTestId, TEST_IDS } from './selectors'

export const STORAGE_KEYS = {
  packOverride: 'litree:pack-override',
  settings: 'litree:settings',
  customPacks: 'litree:custom-packs',
  progress: (packId: string) => `litree:progress:${packId}`,
  corruptProgress: (packId: string) => `litree:progress:${packId}:corrupt`,
  curation: (packId: string) => `litree:curation:${packId}`,
  customPack: (packId: string) => `litree:custom-pack:${packId}`
} as const

export interface ProgressNodeFixture {
  status: 'unstarted' | 'queued' | 'learning' | 'lit'
  litAt?: string
  noteMarkdown?: string
  tags?: string[]
  pinned?: boolean
  reviewCount: number
  leitnerBox: number
  mastery: number
  nextReviewAt?: string
  completedExercises?: number[]
  customResources?: Array<{ id: string; title: string; url: string }>
}

export interface ProgressV2Fixture {
  schema: 'litree/progress-v2'
  packId: string
  nodes: Record<string, ProgressNodeFixture>
  xp: number
  streakDays: number
  lastStudyDate?: string
  dailyActivity: Record<
    string,
    { lit: number; reviewed: number; focusMinutes: number; xp: number }
  >
  sessions: Array<{ id: string; nodeId: string; startedAt?: string; durationMinutes: number }>
  history: Array<{ id: string; at: string; xp?: number }>
}

export interface ProgressV1Fixture {
  schema?: 'litree/progress-v1'
  packId: string
  lit: Record<string, { at: string; note?: string } | string | boolean>
  learning?: Record<string, string>
  xp?: number
  history?: Array<{ id: string; at: string; xp: number }>
}

export interface BackupV2Fixture {
  schema: 'litree/backup-v2'
  exportedAt: string
  progressByPack: Record<string, unknown>
  curationByPack?: Record<string, unknown>
  customPacks?: unknown[]
  settings?: {
    activePackId?: string
    theme?: 'nebula' | 'daylight' | 'minimal'
    quality?: 'high' | 'balanced' | 'eco'
  }
}

export function makeProgressV2Json(
  packId: string,
  overrides?: Partial<Omit<ProgressV2Fixture, 'schema' | 'packId'>>
): string {
  const payload: ProgressV2Fixture = {
    schema: 'litree/progress-v2',
    packId,
    nodes: overrides?.nodes ?? {},
    xp: overrides?.xp ?? 0,
    streakDays: overrides?.streakDays ?? 0,
    ...(overrides?.lastStudyDate ? { lastStudyDate: overrides.lastStudyDate } : {}),
    dailyActivity: overrides?.dailyActivity ?? {},
    sessions: overrides?.sessions ?? [],
    history: overrides?.history ?? []
  }
  return JSON.stringify(payload)
}

export function makeProgressV1Json(
  packId: string,
  lit: ProgressV1Fixture['lit'],
  extra?: Omit<ProgressV1Fixture, 'packId' | 'lit'>
): string {
  const payload: ProgressV1Fixture = {
    schema: 'litree/progress-v1',
    packId,
    lit,
    ...(extra?.learning ? { learning: extra.learning } : {}),
    ...(typeof extra?.xp === 'number' ? { xp: extra.xp } : {}),
    ...(extra?.history ? { history: extra.history } : {})
  }
  return JSON.stringify(payload)
}

export function makeBackupV2Json(opts?: Partial<Omit<BackupV2Fixture, 'schema'>>): string {
  const payload: BackupV2Fixture = {
    schema: 'litree/backup-v2',
    exportedAt: opts?.exportedAt ?? '2026-06-01T00:00:00.000Z',
    progressByPack: opts?.progressByPack ?? {},
    ...(opts?.curationByPack ? { curationByPack: opts.curationByPack } : {}),
    ...(opts?.customPacks ? { customPacks: opts.customPacks } : {}),
    ...(opts?.settings ? { settings: opts.settings } : {})
  }
  return JSON.stringify(payload)
}

export function makeReviewDueBackupJson(
  packId: string,
  nodeId: string,
  noteMarkdown = 'Review due seed note'
): string {
  const pastDue = '2025-01-01T00:00:00.000Z'
  const pastLit = '2024-12-30T00:00:00.000Z'
  const progress: ProgressV2Fixture = {
    schema: 'litree/progress-v2',
    packId,
    nodes: {
      [nodeId]: {
        status: 'lit',
        litAt: pastLit,
        noteMarkdown,
        reviewCount: 0,
        leitnerBox: 1,
        mastery: 1,
        nextReviewAt: pastDue
      }
    },
    xp: 10,
    streakDays: 1,
    lastStudyDate: '2024-12-30',
    dailyActivity: {
      '2024-12-30': { lit: 1, reviewed: 0, focusMinutes: 0, xp: 10 }
    },
    sessions: [],
    history: [{ id: nodeId, at: pastLit, xp: 10 }]
  }
  return makeBackupV2Json({
    progressByPack: { [packId]: progress }
  })
}

export function makeCustomPackV1Json(packId: string, titleZh = '自定义测试星图'): string {
  const customPack = {
    schema: 'litree/pack-v1',
    id: packId,
    title: { zh: titleZh, en: `Custom ${packId}` },
    domains: [{ id: 'CD1', name: '自定义域', color: '#45d0ff' }],
    nodes: [
      { id: 'cb1', kind: 'branch', parent: null, domain: 'CD1', title: { zh: '自定义分支' } },
      { id: 'cu1', kind: 'unit', parent: 'cb1', domain: 'CD1', core: true, title: { zh: '自定义单元一' } },
      { id: 'cu1.k1', kind: 'leaf', parent: 'cu1', domain: 'CD1', title: { zh: '自定义点一' } }
    ],
    edges: [],
    routes: [{ name: '自定义路线', note: '验证自定义星图', ids: ['cu1'] }]
  }
  return makeBackupV2Json({
    customPacks: [customPack]
  })
}

export function makeCorruptJson(): string {
  return '{ "schema": "litree/backup-v2", "broken": [1, 2, '
}

export async function waitForPersistenceFlush(page: Page, ms = 750): Promise<void> {
  await page.waitForTimeout(ms)
}

export async function seedLocalStorage(
  page: Page,
  entries: Record<string, string>
): Promise<void> {
  await page.addInitScript((kv) => {
    for (const [key, value] of Object.entries(kv)) {
      window.localStorage.setItem(key, value)
    }
  }, entries)
}

export async function importBackupViaUi(
  page: Page,
  jsonText: string,
  filename = 'litree-backup.json'
): Promise<void> {
  const modal = byTestId(page, TEST_IDS.backupModal)
  if (!(await modal.isVisible())) {
    await byTestId(page, TEST_IDS.backupTrigger).click()
    await expect(modal).toBeVisible()
  }

  const input = byTestId(page, TEST_IDS.importJsonInput)
  await expect(input).toBeAttached()

  const inputType = await input.evaluate((el) => {
    if (el instanceof HTMLInputElement) return el.type
    return el.tagName.toLowerCase()
  })

  if (inputType === 'file') {
    await input.setInputFiles({
      name: filename,
      mimeType: 'application/json',
      buffer: Buffer.from(jsonText, 'utf8')
    })
  } else {
    await input.fill(jsonText)
    const submitBtn = modal.locator('button[type="submit"], button:has-text("导入"), button:has-text("Import")').first()
    if ((await submitBtn.count()) > 0) {
      await submitBtn.click()
    }
  }
}
