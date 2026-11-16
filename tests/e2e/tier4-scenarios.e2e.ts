import { expect, test } from '@playwright/test'
import { attachRuntimeDiagnostics, expectCleanRuntime } from './helpers/diagnostics'
import {
  importBackupViaUi,
  makeCorruptJson,
  makeProgressV2Json,
  seedLocalStorage,
  STORAGE_KEYS,
  waitForPersistenceFlush
} from './helpers/fixtures'
import {
  assertNoBoundingBoxOverlap,
  dismissOnboardingIfPresent,
  openNodeViaSearch,
  selectQuality,
  selectTheme,
  setWebGLDisabledInitScript,
  switchToPack
} from './helpers/interactions'
import { byTestId, TEST_IDS } from './helpers/selectors'
import {
  assertCanvasHasVariance,
  getTelemetry,
  waitForAppReady,
  waitForCameraSettle
} from './helpers/telemetry'

test.describe('Tier 4 — Real-World Application Scenarios (>= 7)', () => {
  test('[T4.01] First-Run Discovery & 3D Exploration across 10k cs-math galaxy', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    // Verify 3D WebGL2 scene is live and non-blank
    const t = await getTelemetry(page)
    expect(t.rendererMode).toBe('webgl2')
    expect(t.nodeCount).toBe(10013)
    await assertCanvasHasVariance(page, 12, 2.0)

    // Orbit & zoom the 3D nebula
    const box = await byTestId(page, TEST_IDS.nebulaCanvas).boundingBox()
    expect(box).not.toBeNull()
    const b = box!
    await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.5)
    await page.mouse.down()
    await page.mouse.move(b.x + b.width * 0.65, b.y + b.height * 0.42, { steps: 10 })
    await page.mouse.up()
    await page.mouse.wheel(0, -350)
    await waitForCameraSettle(page)

    // Search chapter-grouped leaf M.1.1.k0 and verify owningUnit -> M.1.1
    await openNodeViaSearch(page, '极限的直观定义', '极限的直观定义')
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toContainText('极限与连续')
    await byTestId(page, TEST_IDS.resetViewBtn).click()
    await waitForCameraSettle(page)

    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T4.02] Daily Learning Session Loop: Queue -> Focus Timer -> Note & Resource -> Light -> Reload', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await switchToPack(page, 'dev-mini', 11)
    await openNodeViaSearch(page, 'u1.k1', '点一')
    await byTestId(page, TEST_IDS.btnQueue).click()
    await expect(byTestId(page, TEST_IDS.todayOrbitHud)).toContainText('点一')

    await byTestId(page, TEST_IDS.btnStartFocus).click()
    const remBefore = await byTestId(page, TEST_IDS.focusRemaining).innerText()
    await page.waitForTimeout(1200)
    const remAfter = await byTestId(page, TEST_IDS.focusRemaining).innerText()
    expect(remAfter).not.toBe(remBefore)
    await byTestId(page, TEST_IDS.btnPauseFocus).click()

    await byTestId(page, TEST_IDS.noteEditor).fill('## Daily Study Summary\nMastered u1.k1.')
    const form = byTestId(page, TEST_IDS.customResourceForm)
    await form.locator('input').nth(0).fill('Personal Reference')
    await form.locator('input').nth(1).fill('https://example.com/ref-u1k1')
    await form.locator('button[type="submit"], button').first().click()

    await byTestId(page, TEST_IDS.btnLight).click()
    await expect(byTestId(page, TEST_IDS.xpBadge)).toContainText(/[1-9]/)
    await waitForPersistenceFlush(page)

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await openNodeViaSearch(page, 'u1.k1', '点一')
    await expect(byTestId(page, TEST_IDS.btnUnlight)).toBeVisible()
    await expect(byTestId(page, TEST_IDS.noteEditor)).toHaveValue(/Mastered u1\.k1/)
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toContainText('Personal Reference')

    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T4.03] Prerequisite-Gated Progression, Checklist (>20 leaves) & Force Override', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    // Inspect multi-edge PathTrace on M.2.2 and >20-leaf Checklist on M.1.1
    await openNodeViaSearch(page, '偏微分方程', '偏微分方程')
    await expect(byTestId(page, TEST_IDS.pathtracePanel)).toBeVisible()
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toContainText('分离变量后得到的是常微分方程')
    await byTestId(page, TEST_IDS.drawerClose).click()

    await openNodeViaSearch(page, '极限与连续', '极限与连续')
    await byTestId(page, TEST_IDS.checklistTab).click()
    await expect(byTestId(page, TEST_IDS.checklistGrid)).toBeVisible()
    await byTestId(page, TEST_IDS.drawerClose).click()

    // Switch to dev-mini for full gated progression & force override
    await switchToPack(page, 'dev-mini', 11)
    await openNodeViaSearch(page, 'u2', '单元二')
    await expect(byTestId(page, TEST_IDS.btnLight)).toBeDisabled()
    await byTestId(page, TEST_IDS.drawerClose).click()

    await openNodeViaSearch(page, 'u1', '单元一')
    await byTestId(page, TEST_IDS.btnLight).click()
    await byTestId(page, TEST_IDS.drawerClose).click()

    await openNodeViaSearch(page, 'u2', '单元二')
    await expect(byTestId(page, TEST_IDS.btnLight)).toBeEnabled()
    await byTestId(page, TEST_IDS.drawerClose).click()

    await openNodeViaSearch(page, 'u3', '单元三')
    await expect(byTestId(page, TEST_IDS.btnLight)).toBeDisabled()
    await byTestId(page, TEST_IDS.btnForceLight).click()
    await expect(byTestId(page, TEST_IDS.btnUnlight)).toBeVisible()

    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T4.04] Morning Spaced-Repetition Review Routine in Review Radar', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    const seeded = makeProgressV2Json('dev-mini', {
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
          reviewCount: 1,
          leitnerBox: 2,
          mastery: 2,
          nextReviewAt: '2025-01-02T00:00:00.000Z'
        }
      },
      xp: 20,
      streakDays: 2
    })
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini',
      [STORAGE_KEYS.progress('dev-mini')]: seeded
    })

    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('2')
    await byTestId(page, TEST_IDS.startReviewBtn).click()
    await expect(byTestId(page, TEST_IDS.reviewRadarPanel)).toBeVisible()

    await byTestId(page, TEST_IDS.btnReviewRemembered).click()
    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('1')
    await byTestId(page, TEST_IDS.btnReviewForgot).click()
    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('0')
    await waitForPersistenceFlush(page)

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('0')

    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T4.05] Personal Curriculum Curation, Cycle Protection & JSON/MD Export', async ({
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
    const editor = byTestId(page, TEST_IDS.graphEditorPanel)
    await expect(editor).toBeVisible()

    // Create new node
    await editor.locator('input').first().fill('Custom Topic X')
    await byTestId(page, TEST_IDS.btnNewNode).click()
    await expect.poll(async () => (await getTelemetry(page)).nodeCount).toBe(12)

    // Attempt cyclic edge u3 -> u1 and verify Kahn cycle guard blocks it
    const selects = editor.locator('select')
    if ((await selects.count()) >= 2) {
      await selects.nth(0).selectOption('u3')
      await selects.nth(1).selectOption('u1')
    }
    await byTestId(page, TEST_IDS.btnNewEdge).click()
    await expect(byTestId(page, TEST_IDS.cycleWarningToast)).toBeVisible()
    expect((await getTelemetry(page)).edgeCount).toBe(2)
    await page.keyboard.press('e')

    // Export JSON and Markdown
    await byTestId(page, TEST_IDS.backupTrigger).click()
    const jsonDlPromise = page.waitForEvent('download')
    await byTestId(page, TEST_IDS.btnExportJson).click()
    const jsonDl = await jsonDlPromise
    expect(jsonDl.suggestedFilename()).toMatch(/\.json$/i)

    const mdDlPromise = page.waitForEvent('download')
    await byTestId(page, TEST_IDS.btnExportMd).click()
    const mdDl = await mdDlPromise
    expect(mdDl.suggestedFilename()).toMatch(/\.md$/i)

    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T4.06] Cross-Device Backup Migration & Corrupt Import Fault Isolation', async ({
    page,
    browser
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1.k1', '点一')
    await byTestId(page, TEST_IDS.noteEditor).fill('Cross-device migrated note')
    await byTestId(page, TEST_IDS.btnLight).click()
    await waitForPersistenceFlush(page)
    await byTestId(page, TEST_IDS.drawerClose).click()

    await byTestId(page, TEST_IDS.backupTrigger).click()
    const dlPromise = page.waitForEvent('download')
    await byTestId(page, TEST_IDS.btnExportJson).click()
    const dl = await dlPromise
    const stream = await dl.createReadStream()
    const chunks: Buffer[] = []
    if (stream) {
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk as Uint8Array))
      }
    }
    const backupJson = Buffer.concat(chunks).toString('utf8')

    // Restore into a completely fresh browser context
    const secondCtx = await browser.newContext()
    const secondPage = await secondCtx.newPage()
    const secondDiag = attachRuntimeDiagnostics(secondPage)
    await seedLocalStorage(secondPage, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await secondPage.goto('/')
    await waitForAppReady(secondPage)
    await dismissOnboardingIfPresent(secondPage)

    await importBackupViaUi(secondPage, backupJson, 'device-transfer.json')
    await waitForPersistenceFlush(secondPage)

    // Attempt corrupt import afterwards and verify valid restored state survives
    await importBackupViaUi(secondPage, makeCorruptJson(), 'corrupt-import.json')
    await expect(byTestId(secondPage, TEST_IDS.toastRegion)).not.toBeEmpty()
    await secondPage.keyboard.press('Escape')

    await openNodeViaSearch(secondPage, 'u1.k1', '点一')
    await expect(byTestId(secondPage, TEST_IDS.noteEditor)).toHaveValue('Cross-device migrated note')
    await expect(byTestId(secondPage, TEST_IDS.btnUnlight)).toBeVisible()

    expectCleanRuntime(secondDiag)
    secondDiag.detach()
    await secondCtx.close()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T4.07] Low-Power, Mobile 390x844 & WebGL-Disabled 2D Fallback Study Continuity', async ({
    page,
    browser
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectTheme(page, 'daylight')
    await selectQuality(page, 'eco')
    await assertNoBoundingBoxOverlap([
      { name: 'topbar', locator: byTestId(page, TEST_IDS.topbar) },
      { name: 'today-orbit-hud', locator: byTestId(page, TEST_IDS.todayOrbitHud) }
    ])

    // Verify full study workflow in WebGL-disabled 2D fallback context
    const fallbackCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const fallbackPage = await fallbackCtx.newPage()
    const fallbackDiag = attachRuntimeDiagnostics(fallbackPage)
    await setWebGLDisabledInitScript(fallbackPage)
    await seedLocalStorage(fallbackPage, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await fallbackPage.goto('/')
    await waitForAppReady(fallbackPage, { allowFallback2d: true })
    await dismissOnboardingIfPresent(fallbackPage)

    await expect(byTestId(fallbackPage, TEST_IDS.fallback2dView)).toBeVisible()
    await expect(byTestId(fallbackPage, TEST_IDS.webglFallbackBanner)).toBeVisible()
    expect((await getTelemetry(fallbackPage)).rendererMode).toBe('fallback-2d')

    await openNodeViaSearch(fallbackPage, 'u1.k1', '点一')
    await byTestId(fallbackPage, TEST_IDS.noteEditor).fill('Studied on fallback 2D')
    await byTestId(fallbackPage, TEST_IDS.btnLight).click()
    await expect(byTestId(fallbackPage, TEST_IDS.btnUnlight)).toBeVisible()

    expectCleanRuntime(fallbackDiag)
    fallbackDiag.detach()
    await fallbackCtx.close()
    expectCleanRuntime(diag)
    diag.detach()
  })
})
