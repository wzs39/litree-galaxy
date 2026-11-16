import { expect, test } from '@playwright/test'
import { attachRuntimeDiagnostics, expectCleanRuntime } from './helpers/diagnostics'
import {
  importBackupViaUi,
  makeBackupV2Json,
  makeCorruptJson,
  makeCustomPackV1Json,
  makeProgressV1Json,
  makeProgressV2Json,
  seedLocalStorage,
  STORAGE_KEYS,
  waitForPersistenceFlush
} from './helpers/fixtures'
import {
  dismissOnboardingIfPresent,
  openNodeViaSearch,
  switchToPack
} from './helpers/interactions'
import { byTestId, TEST_IDS } from './helpers/selectors'
import { getTelemetry, waitForAppReady } from './helpers/telemetry'

test.describe('F1 — Repo Setup & Build Pipeline (Runtime Cleanliness)', () => {
  test('[T1-F1.1] serves production app shell at / with clean runtime', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const t = await getTelemetry(page)
    expect(t.ready).toBe(true)
    expect(t.nodeCount).toBeGreaterThan(0)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F1.2] loads static pack index and pack assets with HTTP 200 status', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    const packResponses: number[] = []
    page.on('response', (res) => {
      if (res.url().includes('/packs/')) {
        packResponses.push(res.status())
      }
    })

    await page.goto('/')
    await waitForAppReady(page)

    expect(packResponses.length).toBeGreaterThanOrEqual(2)
    for (const status of packResponses) {
      expect(status).toBe(200)
    }
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F1.3] renders primary UI landmarks on initial load', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await expect(byTestId(page, TEST_IDS.topbar)).toBeVisible()
    await expect(byTestId(page, TEST_IDS.nebulaCanvas)).toBeVisible()
    await expect(byTestId(page, TEST_IDS.todayOrbitHud)).toBeVisible()
    await expect(byTestId(page, TEST_IDS.constellationRadar)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F1.4] initializes ErrorBoundary-protected root without fallback banner on valid WebGL2', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)

    await expect(byTestId(page, TEST_IDS.fallback2dView)).toBeHidden()
    await expect(byTestId(page, TEST_IDS.webglFallbackBanner)).toBeHidden()
    const t = await getTelemetry(page)
    expect(t.rendererMode).toBe('webgl2')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F1.5] preserves clean runtime across repeated full page reloads', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)

    await page.reload()
    await waitForAppReady(page)
    await page.reload()
    await waitForAppReady(page)

    const t = await getTelemetry(page)
    expect(t.ready).toBe(true)
    expect(t.frameCount).toBeGreaterThanOrEqual(2)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F1.1] handles unknown query parameters cleanly without runtime or HTTP errors', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/?unknownParam=123&mode=test')
    await waitForAppReady(page)

    await expect(byTestId(page, TEST_IDS.topbar)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F1.2] handles hash fragments gracefully without crashing', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/#/nonexistent-hash-route')
    await waitForAppReady(page)

    await expect(byTestId(page, TEST_IDS.nebulaCanvas)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F1.3] recovers cleanly when pack-override points to nonexistent pack id', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'nonexistent-pack-xyz'
    })

    await page.goto('/')
    await waitForAppReady(page)

    const t = await getTelemetry(page)
    expect(t.nodeCount).toBeGreaterThanOrEqual(11)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F1.4] survives rapid viewport resize bursts during startup cleanly', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await page.setViewportSize({ width: 1024, height: 700 })
    await page.setViewportSize({ width: 420, height: 820 })
    await page.setViewportSize({ width: 1280, height: 800 })
    await waitForAppReady(page)

    const t = await getTelemetry(page)
    expect(t.ready).toBe(true)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F1.5] stays error-free under rapid shortcut bursts immediately after mount', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)

    await page.keyboard.press('Escape')
    await page.keyboard.press('?')
    await page.keyboard.press('Escape')
    await page.keyboard.press('e')
    await page.keyboard.press('Escape')

    await expect(byTestId(page, TEST_IDS.topbar)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })
})

test.describe('F2 — pack-v2 & progress-v2 Schema + v1 Adapter', () => {
  test('[T1-F2.1] normalizes default cs-math pack-v1 into 10013 nodes and 690 edges', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)

    const t = await getTelemetry(page)
    expect(t.nodeCount).toBe(10013)
    expect(t.edgeCount).toBe(690)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F2.2] normalizes dev-mini pack-v1 into 11 nodes and 2 edges', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await switchToPack(page, 'dev-mini', 11)

    const t = await getTelemetry(page)
    expect(t.nodeCount).toBe(11)
    expect(t.edgeCount).toBe(2)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F2.3] migrates litree/progress-v1 seed in localStorage into progress-v2 on startup', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    const v1Json = makeProgressV1Json(
      'dev-mini',
      {
        'u1.k1': { at: '2025-05-01T10:00:00.000Z', note: 'Migrated v1 note' }
      },
      { xp: 25 }
    )
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini',
      [STORAGE_KEYS.progress('dev-mini')]: v1Json
    })

    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await waitForPersistenceFlush(page)

    await openNodeViaSearch(page, 'u1.k1', '点一')
    await expect(byTestId(page, TEST_IDS.noteEditor)).toHaveValue(/Migrated v1 note/)

    const migratedRaw = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEYS.progress('dev-mini'))
    expect(migratedRaw).not.toBeNull()
    const parsed = JSON.parse(migratedRaw ?? '{}') as { schema?: string }
    expect(parsed.schema).toBe('litree/progress-v2')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F2.4] imports valid litree/backup-v2 JSON via Backup Modal and updates progress', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const backup = makeBackupV2Json({
      progressByPack: {
        'dev-mini': JSON.parse(
          makeProgressV2Json('dev-mini', {
            nodes: {
              'u1.k1': {
                status: 'lit',
                litAt: '2026-05-10T00:00:00.000Z',
                noteMarkdown: 'Imported v2 note',
                reviewCount: 1,
                leitnerBox: 2,
                mastery: 2,
                nextReviewAt: '2030-01-01T00:00:00.000Z'
              }
            },
            xp: 42,
            streakDays: 3
          })
        )
      }
    })

    await importBackupViaUi(page, backup)
    await waitForPersistenceFlush(page)
    await page.keyboard.press('Escape')

    await expect(byTestId(page, TEST_IDS.xpBadge)).toContainText('42')
    await openNodeViaSearch(page, 'u1.k1', '点一')
    await expect(byTestId(page, TEST_IDS.noteEditor)).toHaveValue(/Imported v2 note/)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F2.5] imports custom litree/pack-v1 inside BackupV2.customPacks and makes it selectable', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const customBackup = makeCustomPackV1Json('custom-mini', '自定义测试星图')
    await importBackupViaUi(page, customBackup, 'custom-pack.json')
    await waitForPersistenceFlush(page)
    await page.keyboard.press('Escape')

    await switchToPack(page, 'custom-mini')
    const t = await getTelemetry(page)
    expect(t.nodeCount).toBe(3)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F2.1] rejects malformed JSON import with visible toast and preserves existing state', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1.k1', '点一')
    await byTestId(page, TEST_IDS.noteEditor).fill('Keep existing note intact')
    await waitForPersistenceFlush(page)
    await byTestId(page, TEST_IDS.drawerClose).click()

    await importBackupViaUi(page, makeCorruptJson(), 'corrupt.json')
    await expect(byTestId(page, TEST_IDS.toastRegion)).not.toBeEmpty()
    await page.keyboard.press('Escape')

    await openNodeViaSearch(page, 'u1.k1', '点一')
    await expect(byTestId(page, TEST_IDS.noteEditor)).toHaveValue(/Keep existing note intact/)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F2.2] rejects unsupported backup schema litree/backup-v1 without corrupting progress', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const unsupportedBackup = JSON.stringify({
      schema: 'litree/backup-v1',
      packId: 'dev-mini',
      lit: { 'u1.k1': true }
    })
    await importBackupViaUi(page, unsupportedBackup, 'unsupported.json')
    await expect(byTestId(page, TEST_IDS.toastRegion)).not.toBeEmpty()

    const t = await getTelemetry(page)
    expect(t.nodeCount).toBe(11)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F2.3] rejects progress-v2 payload with negative XP or invalid status', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const invalidV2 = JSON.stringify({
      schema: 'litree/progress-v2',
      packId: 'dev-mini',
      nodes: {
        'u1.k1': {
          status: 'bogus_status',
          reviewCount: -1,
          leitnerBox: 1,
          mastery: 0
        }
      },
      xp: -50,
      streakDays: 0,
      dailyActivity: {},
      sessions: [],
      history: []
    })

    await importBackupViaUi(page, invalidV2, 'invalid-v2.json')
    await expect(byTestId(page, TEST_IDS.toastRegion)).not.toBeEmpty()
    await expect(byTestId(page, TEST_IDS.xpBadge)).not.toContainText('-50')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F2.4] rejects custom pack with cycle or missing domains/nodes safely', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const cyclicCustomPack = makeBackupV2Json({
      customPacks: [
        {
          schema: 'litree/pack-v1',
          id: 'bad-cyclic-pack',
          title: { zh: '坏包' },
          domains: [{ id: 'D1', name: 'D1', color: '#ffffff' }],
          nodes: [
            { id: 'u1', kind: 'unit', parent: null, domain: 'D1', title: { zh: 'U1' } },
            { id: 'u2', kind: 'unit', parent: null, domain: 'D1', title: { zh: 'U2' } }
          ],
          edges: [
            { from: 'u1', to: 'u2', type: 'hard' },
            { from: 'u2', to: 'u1', type: 'hard' }
          ],
          routes: []
        }
      ]
    })

    await importBackupViaUi(page, cyclicCustomPack, 'cyclic-pack.json')
    await expect(byTestId(page, TEST_IDS.toastRegion)).not.toBeEmpty()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F2.5] strips unsafe javascript: and data: resource URLs from imported backups', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const backupWithUnsafeRes = makeBackupV2Json({
      progressByPack: {
        'dev-mini': JSON.parse(
          makeProgressV2Json('dev-mini', {
            nodes: {
              'u1.k1': {
                status: 'learning',
                reviewCount: 0,
                leitnerBox: 0,
                mastery: 0,
                customResources: [
                  { id: 'bad1', title: 'XSS Link', url: 'javascript:alert(1)' },
                  { id: 'bad2', title: 'Data Link', url: 'data:text/html,<h1>x</h1>' },
                  { id: 'good1', title: 'Safe Docs', url: 'https://example.com/safe-docs' }
                ]
              }
            }
          })
        )
      }
    })

    await importBackupViaUi(page, backupWithUnsafeRes, 'sanitized-backup.json')
    await waitForPersistenceFlush(page)
    await page.keyboard.press('Escape')

    await openNodeViaSearch(page, 'u1.k1', '点一')
    const drawer = byTestId(page, TEST_IDS.studyDrawer)
    await expect(drawer).toContainText('Safe Docs')
    await expect(drawer).not.toContainText('XSS Link')
    await expect(drawer).not.toContainText('Data Link')
    expectCleanRuntime(diag)
    diag.detach()
  })
})
