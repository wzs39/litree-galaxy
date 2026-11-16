import { expect, test } from '@playwright/test'
import { attachRuntimeDiagnostics, expectCleanRuntime } from './helpers/diagnostics'
import {
  importBackupViaUi,
  makeCustomPackV1Json,
  makeProgressV1Json,
  makeReviewDueBackupJson,
  seedLocalStorage,
  STORAGE_KEYS,
  waitForPersistenceFlush
} from './helpers/fixtures'
import {
  assertNoBoundingBoxOverlap,
  dismissOnboardingIfPresent,
  openCommandPalette,
  openNodeViaSearch,
  selectDomainChip,
  selectLensPill,
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

test.describe('Tier 3 — Pairwise Cross-Feature Interactions (>= 14)', () => {
  test('[T3.01] F5 x F13: Pack Switch (cs-math -> dev-mini) resets active domain & lens filters cleanly', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectDomainChip(page, 'M1')
    await selectLensPill(page, 'core')
    await switchToPack(page, 'dev-mini', 11)

    await expect(byTestId(page, TEST_IDS.domainChip('D1'))).toBeVisible()
    await expect(byTestId(page, TEST_IDS.domainChip('D2'))).toBeVisible()
    expect((await getTelemetry(page)).nodeCount).toBe(11)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T3.02] F9 x F10: Study Drawer Queue/Light actions synchronize Today\'s Orbit HUD XP & Streak', async ({
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
    await byTestId(page, TEST_IDS.btnQueue).click()
    await expect(byTestId(page, TEST_IDS.todayOrbitHud)).toContainText('点一')

    const xpBefore = await byTestId(page, TEST_IDS.xpBadge).innerText()
    await byTestId(page, TEST_IDS.btnLight).click()
    const xpAfter = await byTestId(page, TEST_IDS.xpBadge).innerText()
    expect(xpAfter).not.toBe(xpBefore)
    await expect(byTestId(page, TEST_IDS.streakBadge)).toContainText(/[1-9]/)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T3.03] F3 x F8: PathTrace prerequisite inspection paired with Camera Fly-To and reset', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await waitForCameraSettle(page)

    const overviewDist = (await getTelemetry(page)).camera.distance
    await openNodeViaSearch(page, 'u3', '单元三')
    await waitForCameraSettle(page)
    await expect(byTestId(page, TEST_IDS.pathtracePanel)).toContainText('单元一')
    expect((await getTelemetry(page)).camera.distance).toBeLessThan(overviewDist)

    await byTestId(page, TEST_IDS.resetViewBtn).click()
    await waitForCameraSettle(page)
    expect((await getTelemetry(page)).camera.distance).toBeGreaterThan(overviewDist * 0.7)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T3.04] F4 x F11: Seeded review_due graded in Review Radar persists cleared state across reload', async ({
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

  test('[T3.05] F10 x F11: Running Focus Timer concurrently while writing Markdown notes in Study Drawer', async ({
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
    const rem1 = await byTestId(page, TEST_IDS.focusRemaining).innerText()

    await byTestId(page, TEST_IDS.noteEditor).fill('Focused session notes')
    await page.waitForTimeout(1300)
    const rem2 = await byTestId(page, TEST_IDS.focusRemaining).innerText()
    expect(rem2).not.toBe(rem1)
    await expect(byTestId(page, TEST_IDS.noteEditor)).toHaveValue('Focused session notes')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T3.06] F12 x F3: Live Graph Editor cycle guard preserves valid PathTrace DAG', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await byTestId(page, TEST_IDS.editModeToggle).click()
    const editor = byTestId(page, TEST_IDS.graphEditorPanel)
    const selects = editor.locator('select')
    if ((await selects.count()) >= 2) {
      await selects.nth(0).selectOption('u3')
      await selects.nth(1).selectOption('u1')
    }
    await byTestId(page, TEST_IDS.btnNewEdge).click()
    await expect(byTestId(page, TEST_IDS.cycleWarningToast)).toBeVisible()
    await byTestId(page, TEST_IDS.editModeToggle).click()

    await openNodeViaSearch(page, 'u3', '单元三')
    await expect(byTestId(page, TEST_IDS.pathtracePanel)).toContainText('单元一')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T3.07] F12 x F4: Export Backup JSON -> clear storage -> Import Backup restores exact state', async ({
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
    await byTestId(page, TEST_IDS.noteEditor).fill('Exportable pairwise note')
    await byTestId(page, TEST_IDS.btnLight).click()
    await waitForPersistenceFlush(page)
    await byTestId(page, TEST_IDS.drawerClose).click()

    await byTestId(page, TEST_IDS.backupTrigger).click()
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
    const exportedJson = Buffer.concat(chunks).toString('utf8')

    const cleanCtx = await browser.newContext()
    const cleanPage = await cleanCtx.newPage()
    const cleanDiag = attachRuntimeDiagnostics(cleanPage)
    await seedLocalStorage(cleanPage, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await cleanPage.goto('/')
    await waitForAppReady(cleanPage)
    await dismissOnboardingIfPresent(cleanPage)

    await importBackupViaUi(cleanPage, exportedJson, 'exported.json')
    await waitForPersistenceFlush(cleanPage)
    await cleanPage.keyboard.press('Escape')

    await openNodeViaSearch(cleanPage, 'u1.k1', '点一')
    await expect(byTestId(cleanPage, TEST_IDS.noteEditor)).toHaveValue('Exportable pairwise note')
    await expect(byTestId(cleanPage, TEST_IDS.btnUnlight)).toBeVisible()

    expectCleanRuntime(cleanDiag)
    cleanDiag.detach()
    await cleanCtx.close()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T3.08] F13 x F14: Command Palette > command paired with Theme switching & persistence', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectTheme(page, 'minimal')
    await waitForPersistenceFlush(page)

    await openCommandPalette(page)
    await byTestId(page, TEST_IDS.commandInput).fill('>')
    await expect(byTestId(page, TEST_IDS.commandResults)).toBeVisible()
    await page.keyboard.press('Escape')

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    const saved = await page.evaluate(
      (k) => window.localStorage.getItem(k),
      STORAGE_KEYS.settings
    )
    expect(saved ?? '').toContain('minimal')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T3.09] F10 x F14: Mobile 390x844 bottom-sheet Study Drawer paired with >20-leaf Checklist grid', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, '极限与连续', '极限与连续')
    await expect(byTestId(page, TEST_IDS.checklistTab)).toBeVisible()
    await byTestId(page, TEST_IDS.checklistTab).click()
    await expect(byTestId(page, TEST_IDS.checklistGrid)).toBeVisible()

    await assertNoBoundingBoxOverlap([
      { name: 'topbar', locator: byTestId(page, TEST_IDS.topbar) },
      { name: 'study-drawer', locator: byTestId(page, TEST_IDS.studyDrawer) }
    ])
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T3.10] F14 x F10: WebGL-disabled 2D fallback paired with Study Drawer light-up & note edit', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await setWebGLDisabledInitScript(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page, { allowFallback2d: true })
    await dismissOnboardingIfPresent(page)

    await expect(byTestId(page, TEST_IDS.fallback2dView)).toBeVisible()
    await openNodeViaSearch(page, 'u1.k1', '点一')
    await byTestId(page, TEST_IDS.noteEditor).fill('2D fallback note')
    await byTestId(page, TEST_IDS.btnLight).click()
    await expect(byTestId(page, TEST_IDS.btnUnlight)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T3.11] F7 x F14: Quality preset switch (High -> Eco) preserves WebGL2 pixel variance', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectQuality(page, 'high')
    await page.waitForTimeout(200)
    await assertCanvasHasVariance(page, 10, 1.5)

    await selectQuality(page, 'eco')
    await page.waitForTimeout(200)
    await assertCanvasHasVariance(page, 8, 1.0)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T3.12] F8 x F13: Constellation Radar click-to-fly paired with Domain Chip isolation', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await waitForCameraSettle(page)

    await selectDomainChip(page, 'M1')
    const radar = byTestId(page, TEST_IDS.constellationRadar)
    const box = await radar.boundingBox()
    expect(box).not.toBeNull()
    const b = box!
    const posBefore = (await getTelemetry(page)).camera.pos
    await page.mouse.click(b.x + b.width * 0.3, b.y + b.height * 0.3)
    await page.waitForTimeout(350)
    const posAfter = (await getTelemetry(page)).camera.pos

    const moved = Math.hypot(
      posAfter[0] - posBefore[0],
      posAfter[1] - posBefore[1],
      posAfter[2] - posBefore[2]
    )
    expect(moved).toBeGreaterThan(0.1)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T3.13] F2 x F10: ProgressV1 localStorage migration paired with Study Drawer verification', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    const v1Json = makeProgressV1Json('dev-mini', {
      u1: { at: '2026-01-15T00:00:00.000Z', note: 'V1 unit note' }
    })
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini',
      [STORAGE_KEYS.progress('dev-mini')]: v1Json
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1', '单元一')
    await expect(byTestId(page, TEST_IDS.btnUnlight)).toBeVisible()
    await expect(byTestId(page, TEST_IDS.noteEditor)).toHaveValue('V1 unit note')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T3.14] F12 x F5: Custom PackV1 Backup import paired with Pack Switcher activation & telemetry', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await importBackupViaUi(page, makeCustomPackV1Json('custom-t3', 'Pairwise Custom Pack'))
    await waitForPersistenceFlush(page)
    await page.keyboard.press('Escape')

    await switchToPack(page, 'custom-t3')
    const t = await getTelemetry(page)
    expect(t.nodeCount).toBe(3)
    expect(t.edgeCount).toBe(0)
    expectCleanRuntime(diag)
    diag.detach()
  })
})
