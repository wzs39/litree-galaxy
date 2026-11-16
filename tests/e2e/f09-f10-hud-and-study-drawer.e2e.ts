import { expect, test } from '@playwright/test'
import { attachRuntimeDiagnostics, expectCleanRuntime } from './helpers/diagnostics'
import {
  makeReviewDueBackupJson,
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

test.describe('F9 — Collapsible "Today\'s Orbit" Mission HUD', () => {
  test('[T1-F9.1] renders Today\'s Orbit HUD with streak, XP, and due review badges', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await expect(byTestId(page, TEST_IDS.todayOrbitHud)).toBeVisible()
    await expect(byTestId(page, TEST_IDS.streakBadge)).toBeVisible()
    await expect(byTestId(page, TEST_IDS.xpBadge)).toBeVisible()
    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F9.2] today-orbit-toggle collapses and re-expands HUD content cleanly', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const hud = byTestId(page, TEST_IDS.todayOrbitHud)
    const boxExpanded = await hud.boundingBox()
    expect(boxExpanded).not.toBeNull()

    await byTestId(page, TEST_IDS.todayOrbitToggle).click()
    await expect(byTestId(page, TEST_IDS.continueOrbitBtn)).toBeHidden()
    const boxCollapsed = await hud.boundingBox()
    expect(boxCollapsed).not.toBeNull()
    expect(boxCollapsed!.height).toBeLessThan(boxExpanded!.height)

    await byTestId(page, TEST_IDS.todayOrbitToggle).click()
    await expect(byTestId(page, TEST_IDS.continueOrbitBtn)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F9.3] continue-orbit-btn triggers guided camera orbit/navigation update', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const camBefore = (await getTelemetry(page)).camera.pos
    await byTestId(page, TEST_IDS.continueOrbitBtn).click()
    await page.waitForTimeout(300)

    const tAfter = await getTelemetry(page)
    const moved = Math.hypot(
      tAfter.camera.pos[0] - camBefore[0],
      tAfter.camera.pos[1] - camBefore[1],
      tAfter.camera.pos[2] - camBefore[2]
    )
    expect(moved > 0.1 || tAfter.selectedId !== null || tAfter.isFlying).toBe(true)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F9.4] start-review-btn opens review-radar-panel when due reviews exist', async ({
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

    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('1')
    await byTestId(page, TEST_IDS.startReviewBtn).click()
    await expect(byTestId(page, TEST_IDS.reviewRadarPanel)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F9.5] reflects queued items and incremented XP inside Today\'s Orbit HUD', async ({
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
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F9.1] displays zero due-review-count on fresh unseeded profile', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('0')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F9.2] handles start-review-btn safely when zero reviews are due', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const startBtn = byTestId(page, TEST_IDS.startReviewBtn)
    if (await startBtn.isEnabled()) {
      await startBtn.click()
    }
    await expect(byTestId(page, TEST_IDS.todayOrbitHud)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F9.3] handles continue-orbit-btn gracefully when all dev-mini nodes are already lit', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    for (const [id, title] of [
      ['u1', '单元一'],
      ['u2', '单元二'],
      ['u3', '单元三']
    ] as const) {
      await openNodeViaSearch(page, id, title)
      await byTestId(page, TEST_IDS.btnLight).click()
      await byTestId(page, TEST_IDS.drawerClose).click()
    }

    await byTestId(page, TEST_IDS.continueOrbitBtn).click()
    await expect(byTestId(page, TEST_IDS.todayOrbitHud)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F9.4] remains intact after rapid collapse/expand toggle clicks', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const toggle = byTestId(page, TEST_IDS.todayOrbitToggle)
    await toggle.click()
    await toggle.click()
    await toggle.click()
    await toggle.click()

    await expect(byTestId(page, TEST_IDS.continueOrbitBtn)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F9.5] updates HUD counters immediately when switching packs', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1.k1', '点一')
    await byTestId(page, TEST_IDS.btnLight).click()
    const devXp = await byTestId(page, TEST_IDS.xpBadge).innerText()

    await switchToPack(page, 'cs-math', 10013)
    const csXp = await byTestId(page, TEST_IDS.xpBadge).innerText()
    expect(csXp).not.toBe(devXp)
    expectCleanRuntime(diag)
    diag.detach()
  })
})

test.describe('F10 — Refactored Study Drawer & Unit Checklist Sub-view', () => {
  test('[T1-F10.1] supports Queue, Learning, Pin, Light, and Unlight actions in Study Drawer', async ({
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
    await byTestId(page, TEST_IDS.btnLearning).click()
    await byTestId(page, TEST_IDS.btnPin).click()
    await byTestId(page, TEST_IDS.btnLight).click()
    await expect(byTestId(page, TEST_IDS.btnUnlight)).toBeVisible()

    await byTestId(page, TEST_IDS.btnUnlight).click()
    await expect(byTestId(page, TEST_IDS.btnLight)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F10.2] allows writing and persisting Markdown notes in note-editor', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1.k2', '点二')
    await byTestId(page, TEST_IDS.noteEditor).fill('- Key intuition for point 2')
    await waitForPersistenceFlush(page)

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await openNodeViaSearch(page, 'u1.k2', '点二')
    await expect(byTestId(page, TEST_IDS.noteEditor)).toHaveValue('- Key intuition for point 2')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F10.3] allows adding a valid https:// custom resource via custom-resource-form', async ({
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
    const form = byTestId(page, TEST_IDS.customResourceForm)
    const inputs = form.locator('input')
    await inputs.nth(0).fill('MIT OCW Lecture')
    await inputs.nth(1).fill('https://ocw.mit.edu/courses/18-01sc/')
    await form.locator('button[type="submit"], button').first().click()

    await expect(byTestId(page, TEST_IDS.studyDrawer)).toContainText('MIT OCW Lecture')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F10.4] renders unit resources and checkable exercises on cs-math M.1.1', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, '极限与连续', '极限与连续')
    const drawer = byTestId(page, TEST_IDS.studyDrawer)
    const checkboxes = drawer.locator('input[type="checkbox"]')
    expect(await checkboxes.count()).toBeGreaterThanOrEqual(5)

    const firstEx = checkboxes.first()
    const wasChecked = await firstEx.isChecked()
    await firstEx.click()
    expect(await firstEx.isChecked()).toBe(!wasChecked)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F10.5] activates checklist-tab and renders checklist-grid on >20-leaf units M.1.1 and M.1.4.4', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, '极限与连续', '极限与连续')
    await expect(byTestId(page, TEST_IDS.checklistTab)).toBeVisible()
    await byTestId(page, TEST_IDS.checklistTab).click()
    const grid = byTestId(page, TEST_IDS.checklistGrid)
    await expect(grid).toBeVisible()
    expect(await grid.locator('button, input[type="checkbox"], [role="checkbox"]').count()).toBeGreaterThanOrEqual(
      20
    )

    await byTestId(page, TEST_IDS.drawerClose).click()
    await openNodeViaSearch(page, '多元积分与向量分析', '多元积分与向量分析')
    await expect(byTestId(page, TEST_IDS.checklistTab)).toBeVisible()
    await byTestId(page, TEST_IDS.checklistTab).click()
    await expect(byTestId(page, TEST_IDS.checklistGrid)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F10.1] rejects unsafe javascript: and data: URLs in custom-resource-form', async ({
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
    const form = byTestId(page, TEST_IDS.customResourceForm)
    const inputs = form.locator('input')
    const submitBtn = form.locator('button[type="submit"], button').first()

    await inputs.nth(0).fill('Evil JS')
    await inputs.nth(1).fill('javascript:alert(1)')
    await submitBtn.click()
    await expect(byTestId(page, TEST_IDS.studyDrawer)).not.toContainText('Evil JS')

    await inputs.nth(0).fill('Evil Data')
    await inputs.nth(1).fill('data:text/html,<script>alert(1)</script>')
    await submitBtn.click()
    await expect(byTestId(page, TEST_IDS.studyDrawer)).not.toContainText('Evil Data')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F10.2] rejects empty URL or empty title in custom-resource-form', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1.k1', '点一')
    const form = byTestId(page, TEST_IDS.customResourceForm)
    const inputs = form.locator('input')
    const submitBtn = form.locator('button[type="submit"], button').first()

    await inputs.nth(0).fill('   ')
    await inputs.nth(1).fill('https://example.com/valid')
    await submitBtn.click()
    await expect(byTestId(page, TEST_IDS.studyDrawer)).not.toContainText('example.com/valid')

    await inputs.nth(0).fill('Missing URL')
    await inputs.nth(1).fill('   ')
    await submitBtn.click()
    await expect(byTestId(page, TEST_IDS.studyDrawer)).not.toContainText('Missing URL')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F10.3] disables btn-light on hard-gated u2 while btn-force-light overrides gate', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u2', '单元二')
    await expect(byTestId(page, TEST_IDS.btnLight)).toBeDisabled()
    await byTestId(page, TEST_IDS.btnForceLight).click()
    await expect(byTestId(page, TEST_IDS.btnUnlight)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F10.4] closes Study Drawer via drawer-close button and Escape key', async ({
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
    await byTestId(page, TEST_IDS.drawerClose).click()
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toBeHidden()

    await openNodeViaSearch(page, 'u1', '单元一')
    await page.keyboard.press('Escape')
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toBeHidden()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F10.5] renders empty unit S.2.1 cleanly without crashing Checklist or Details view', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, '计算机系统安全', '计算机系统安全')
    await expect(byTestId(page, TEST_IDS.drawerTitle)).toContainText('计算机系统安全')
    await expect(byTestId(page, TEST_IDS.checklistTab)).toBeHidden()
    expectCleanRuntime(diag)
    diag.detach()
  })
})
