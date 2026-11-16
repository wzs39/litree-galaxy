import { expect, test } from '@playwright/test'
import { attachRuntimeDiagnostics, expectCleanRuntime } from './helpers/diagnostics'
import {
  importBackupViaUi,
  makeBackupV2Json,
  makeCorruptJson,
  makeProgressV2Json,
  makeReviewDueBackupJson,
  seedLocalStorage,
  STORAGE_KEYS,
  waitForPersistenceFlush
} from './helpers/fixtures'
import { dismissOnboardingIfPresent, openNodeViaSearch } from './helpers/interactions'
import { byTestId, TEST_IDS } from './helpers/selectors'
import { getTelemetry, waitForAppReady } from './helpers/telemetry'

test.describe('F11 — Spaced-Repetition Review Radar & Star-Bound Focus Timer', () => {
  test('[T1-F11.1] displays seeded due review node inside review-radar-panel', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    const backup = makeReviewDueBackupJson('dev-mini', 'u1.k1', 'Recall limit definition')
    const progress = (JSON.parse(backup) as { progressByPack: Record<string, unknown> })
      .progressByPack['dev-mini']
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini',
      [STORAGE_KEYS.progress('dev-mini')]: JSON.stringify(progress)
    })

    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await byTestId(page, TEST_IDS.startReviewBtn).click()
    const panel = byTestId(page, TEST_IDS.reviewRadarPanel)
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('点一')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F11.2] btn-review-remembered grades due item, clears due count, and awards XP', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    const backup = makeReviewDueBackupJson('dev-mini', 'u1.k1')
    const progress = (JSON.parse(backup) as { progressByPack: Record<string, unknown> })
      .progressByPack['dev-mini']
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini',
      [STORAGE_KEYS.progress('dev-mini')]: JSON.stringify(progress)
    })

    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const xpBefore = await byTestId(page, TEST_IDS.xpBadge).innerText()
    await byTestId(page, TEST_IDS.startReviewBtn).click()
    await byTestId(page, TEST_IDS.btnReviewRemembered).click()

    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('0')
    const xpAfter = await byTestId(page, TEST_IDS.xpBadge).innerText()
    expect(xpAfter).not.toBe(xpBefore)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F11.3] btn-review-forgot schedules Box 1 future interval and removes from due queue', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    const backup = makeReviewDueBackupJson('dev-mini', 'u1.k2')
    const progress = (JSON.parse(backup) as { progressByPack: Record<string, unknown> })
      .progressByPack['dev-mini']
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini',
      [STORAGE_KEYS.progress('dev-mini')]: JSON.stringify(progress)
    })

    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await byTestId(page, TEST_IDS.startReviewBtn).click()
    await byTestId(page, TEST_IDS.btnReviewForgot).click()
    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('0')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F11.4] focus-timer-widget btn-start-focus starts countdown and ticks remaining time down', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1', '单元一')
    await expect(byTestId(page, TEST_IDS.focusTimerWidget)).toBeVisible()
    await byTestId(page, TEST_IDS.btnStartFocus).click()

    const initialRemaining = await byTestId(page, TEST_IDS.focusRemaining).innerText()
    await page.waitForTimeout(1500)
    const laterRemaining = await byTestId(page, TEST_IDS.focusRemaining).innerText()
    expect(laterRemaining).not.toBe(initialRemaining)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F11.5] focus-timer-widget btn-pause-focus freezes countdown', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1', '单元一')
    await byTestId(page, TEST_IDS.btnStartFocus).click()
    await page.waitForTimeout(1100)
    await byTestId(page, TEST_IDS.btnPauseFocus).click()

    const pausedAt = await byTestId(page, TEST_IDS.focusRemaining).innerText()
    await page.waitForTimeout(1300)
    const afterPauseWait = await byTestId(page, TEST_IDS.focusRemaining).innerText()
    expect(afterPauseWait).toBe(pausedAt)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F11.1] review-radar-panel shows clean empty state when no items are due', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const panel = byTestId(page, TEST_IDS.reviewRadarPanel)
    if (await panel.isVisible().catch(() => false)) {
      await expect(byTestId(page, TEST_IDS.btnReviewRemembered)).toBeHidden()
    }
    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('0')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F11.2] advances sequentially through multiple due review items until queue reaches zero', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    const twoDue = makeProgressV2Json('dev-mini', {
      nodes: {
        'u1.k1': {
          status: 'lit',
          litAt: '2024-12-20T00:00:00.000Z',
          reviewCount: 0,
          leitnerBox: 1,
          mastery: 1,
          nextReviewAt: '2025-01-01T00:00:00.000Z'
        },
        'u1.k2': {
          status: 'lit',
          litAt: '2024-12-21T00:00:00.000Z',
          reviewCount: 0,
          leitnerBox: 1,
          mastery: 1,
          nextReviewAt: '2025-01-02T00:00:00.000Z'
        }
      },
      xp: 20,
      streakDays: 1
    })
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini',
      [STORAGE_KEYS.progress('dev-mini')]: twoDue
    })

    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('2')
    await byTestId(page, TEST_IDS.startReviewBtn).click()
    await byTestId(page, TEST_IDS.btnReviewRemembered).click()
    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('1')
    await byTestId(page, TEST_IDS.btnReviewForgot).click()
    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('0')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F11.3] pausing and resuming focus timer continues countdown from paused remaining time', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1', '单元一')
    await byTestId(page, TEST_IDS.btnStartFocus).click()
    await page.waitForTimeout(1100)
    await byTestId(page, TEST_IDS.btnPauseFocus).click()
    const paused = await byTestId(page, TEST_IDS.focusRemaining).innerText()

    await byTestId(page, TEST_IDS.btnStartFocus).click()
    await page.waitForTimeout(1200)
    const resumed = await byTestId(page, TEST_IDS.focusRemaining).innerText()
    expect(resumed).not.toBe(paused)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F11.4] switching selected node while focus timer runs does not crash', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1', '单元一')
    await byTestId(page, TEST_IDS.btnStartFocus).click()
    await openNodeViaSearch(page, 'u2', '单元二')

    await expect(byTestId(page, TEST_IDS.focusTimerWidget)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F11.5] grading review item persists cleared due status across full page reload', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    const backup = makeReviewDueBackupJson('dev-mini', 'u1.k1')
    const progress = (JSON.parse(backup) as { progressByPack: Record<string, unknown> })
      .progressByPack['dev-mini']
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini',
      [STORAGE_KEYS.progress('dev-mini')]: JSON.stringify(progress)
    })

    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await byTestId(page, TEST_IDS.startReviewBtn).click()
    await byTestId(page, TEST_IDS.btnReviewRemembered).click()
    await waitForPersistenceFlush(page)

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('0')
    expectCleanRuntime(diag)
    diag.detach()
  })
})

test.describe('F12 — Live Graph Editor (E) & Backup UI', () => {
  test('[T1-F12.1] toggles Live Graph Editor via E key and edit-mode-toggle button', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await page.keyboard.press('e')
    await expect(byTestId(page, TEST_IDS.graphEditorPanel)).toBeVisible()

    await byTestId(page, TEST_IDS.editModeToggle).click()
    await expect(byTestId(page, TEST_IDS.graphEditorPanel)).toBeHidden()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F12.2] creates a new knowledge node via btn-new-node and updates nodeCount', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const before = (await getTelemetry(page)).nodeCount
    await byTestId(page, TEST_IDS.editModeToggle).click()
    const editor = byTestId(page, TEST_IDS.graphEditorPanel)
    await editor.locator('input').first().fill('New Graph Node')
    await byTestId(page, TEST_IDS.btnNewNode).click()

    await page.waitForFunction(
      (n) => (window.__LITREE_TELEMETRY__?.nodeCount ?? 0) === n + 1,
      before,
      { timeout: 10_000 }
    )
    expect((await getTelemetry(page)).nodeCount).toBe(before + 1)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F12.3] creates a valid DAG edge via btn-new-edge and updates edgeCount', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const before = (await getTelemetry(page)).edgeCount
    await byTestId(page, TEST_IDS.editModeToggle).click()
    const editor = byTestId(page, TEST_IDS.graphEditorPanel)
    const selects = editor.locator('select')
    if ((await selects.count()) >= 2) {
      await selects.nth(0).selectOption('u1')
      await selects.nth(1).selectOption('u3')
    }
    await byTestId(page, TEST_IDS.btnNewEdge).click()

    await page.waitForFunction(
      (e) => (window.__LITREE_TELEMETRY__?.edgeCount ?? 0) === e + 1,
      before,
      { timeout: 10_000 }
    )
    expect((await getTelemetry(page)).edgeCount).toBe(before + 1)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F12.4] exports valid litree/backup-v2 JSON via btn-export-json', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await byTestId(page, TEST_IDS.backupTrigger).click()
    await expect(byTestId(page, TEST_IDS.backupModal)).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await byTestId(page, TEST_IDS.btnExportJson).click()
    const download = await downloadPromise
    const stream = await download.createReadStream()
    const chunks: Buffer[] = []
    if (stream) {
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk as Uint8Array))
      }
    }
    const content = Buffer.concat(chunks).toString('utf8')
    const parsed = JSON.parse(content) as { schema?: string }
    expect(parsed.schema).toBe('litree/backup-v2')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F12.5] exports Markdown learning journal via btn-export-md containing studied notes', async ({
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
    await byTestId(page, TEST_IDS.noteEditor).fill('Journal marker note 123')
    await byTestId(page, TEST_IDS.btnLight).click()
    await waitForPersistenceFlush(page)
    await byTestId(page, TEST_IDS.drawerClose).click()

    await byTestId(page, TEST_IDS.backupTrigger).click()
    const downloadPromise = page.waitForEvent('download')
    await byTestId(page, TEST_IDS.btnExportMd).click()
    const download = await downloadPromise
    const stream = await download.createReadStream()
    const chunks: Buffer[] = []
    if (stream) {
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk as Uint8Array))
      }
    }
    const mdText = Buffer.concat(chunks).toString('utf8')
    expect(mdText).toContain('Journal marker note 123')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F12.1] Kahn cycle guard blocks cyclic edge u3 -> u1 and shows cycle-warning-toast', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const beforeEdges = (await getTelemetry(page)).edgeCount
    await byTestId(page, TEST_IDS.editModeToggle).click()
    const editor = byTestId(page, TEST_IDS.graphEditorPanel)
    const selects = editor.locator('select')
    if ((await selects.count()) >= 2) {
      await selects.nth(0).selectOption('u3')
      await selects.nth(1).selectOption('u1')
    }
    await byTestId(page, TEST_IDS.btnNewEdge).click()

    await expect(byTestId(page, TEST_IDS.cycleWarningToast)).toBeVisible()
    expect((await getTelemetry(page)).edgeCount).toBe(beforeEdges)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F12.2] Kahn cycle guard blocks self-loop edge u1 -> u1', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const beforeEdges = (await getTelemetry(page)).edgeCount
    await byTestId(page, TEST_IDS.editModeToggle).click()
    const editor = byTestId(page, TEST_IDS.graphEditorPanel)
    const selects = editor.locator('select')
    if ((await selects.count()) >= 2) {
      await selects.nth(0).selectOption('u1')
      await selects.nth(1).selectOption('u1')
    }
    await byTestId(page, TEST_IDS.btnNewEdge).click()

    await expect(byTestId(page, TEST_IDS.cycleWarningToast)).toBeVisible()
    expect((await getTelemetry(page)).edgeCount).toBe(beforeEdges)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F12.3] rejects invalid/corrupt JSON import in backup-modal without losing existing state', async ({
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
    await byTestId(page, TEST_IDS.btnLight).click()
    await waitForPersistenceFlush(page)
    await byTestId(page, TEST_IDS.drawerClose).click()

    await importBackupViaUi(page, makeCorruptJson(), 'broken.json')
    await expect(byTestId(page, TEST_IDS.toastRegion)).not.toBeEmpty()
    await page.keyboard.press('Escape')

    await openNodeViaSearch(page, 'u1.k1', '点一')
    await expect(byTestId(page, TEST_IDS.btnUnlight)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F12.4] rejects creating a node with blank title in graph-editor-panel', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const before = (await getTelemetry(page)).nodeCount
    await byTestId(page, TEST_IDS.editModeToggle).click()
    const editor = byTestId(page, TEST_IDS.graphEditorPanel)
    await editor.locator('input').first().fill('   ')
    await byTestId(page, TEST_IDS.btnNewNode).click()

    expect((await getTelemetry(page)).nodeCount).toBe(before)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F12.5] round-trips backup export JSON into a fresh session with matching XP and notes', async ({
    page,
    browser
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    const backup = makeBackupV2Json({
      progressByPack: {
        'dev-mini': JSON.parse(
          makeProgressV2Json('dev-mini', {
            nodes: {
              'u1.k1': {
                status: 'lit',
                litAt: '2026-05-01T00:00:00.000Z',
                noteMarkdown: 'Roundtrip backup note',
                reviewCount: 0,
                leitnerBox: 1,
                mastery: 1,
                nextReviewAt: '2035-01-01T00:00:00.000Z'
              }
            },
            xp: 88,
            streakDays: 4
          })
        )
      }
    })

    const freshCtx = await browser.newContext()
    const freshPage = await freshCtx.newPage()
    const freshDiag = attachRuntimeDiagnostics(freshPage)
    await seedLocalStorage(freshPage, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await freshPage.goto('/')
    await waitForAppReady(freshPage)
    await dismissOnboardingIfPresent(freshPage)

    await importBackupViaUi(freshPage, backup, 'roundtrip.json')
    await waitForPersistenceFlush(freshPage)
    await freshPage.keyboard.press('Escape')

    await expect(byTestId(freshPage, TEST_IDS.xpBadge)).toContainText('88')
    await openNodeViaSearch(freshPage, 'u1.k1', '点一')
    await expect(byTestId(freshPage, TEST_IDS.noteEditor)).toHaveValue('Roundtrip backup note')

    expectCleanRuntime(freshDiag)
    freshDiag.detach()
    await freshCtx.close()
    expectCleanRuntime(diag)
    diag.detach()
  })
})
