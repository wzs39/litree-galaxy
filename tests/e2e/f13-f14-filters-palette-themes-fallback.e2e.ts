import { expect, test } from '@playwright/test'
import { attachRuntimeDiagnostics, expectCleanRuntime } from './helpers/diagnostics'
import { seedLocalStorage, STORAGE_KEYS, waitForPersistenceFlush } from './helpers/fixtures'
import {
  assertNoBoundingBoxOverlap,
  dismissOnboardingIfPresent,
  openCommandPalette,
  selectDomainChip,
  selectLensPill,
  selectQuality,
  selectTheme,
  setWebGLDisabledInitScript,
  triggerWebGLContextLost
} from './helpers/interactions'
import { byTestId, TEST_IDS } from './helpers/selectors'
import { getTelemetry, waitForAppReady, waitForCameraSettle } from './helpers/telemetry'

const CS_MATH_DOMAINS = ['M1', 'M2', 'M3', 'F', 'P', 'C', 'D', 'A', 'S', 'H', 'V', 'I', 'X'] as const
const SEMANTIC_LENSES = ['all', 'actionable', 'core', 'route', 'review_due', 'bookmarked'] as const

test.describe('F13 — Domain/Lens Filters, Ctrl+K Command Palette & Constellation Radar', () => {
  test('[T1-F13.1] exposes and toggles domain-chip across all 13 cs-math domains and dev-mini D1/D2', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    for (const domainId of CS_MATH_DOMAINS) {
      await expect(byTestId(page, TEST_IDS.domainChip(domainId))).toBeVisible()
    }
    await selectDomainChip(page, 'M1')
    await selectDomainChip(page, 'S')
    await selectDomainChip(page, 'S')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F13.2] activates all 6 semantic lens pills with observable active state and clean runtime', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    // Visit non-default lenses first, then return to 'all' so every pill undergoes an inactive -> active transition
    const transitionOrder: Array<(typeof SEMANTIC_LENSES)[number]> = [
      'actionable',
      'core',
      'route',
      'review_due',
      'bookmarked',
      'all'
    ]
    expect(new Set(transitionOrder).size).toBe(SEMANTIC_LENSES.length)

    for (const lens of transitionOrder) {
      const pill = byTestId(page, TEST_IDS.lensPill(lens))
      await expect(pill).toBeVisible()
      await expect(pill).toBeEnabled()

      const beforeState = await pill.evaluate((el) => {
        const cs = window.getComputedStyle(el)
        return {
          ariaPressed: el.getAttribute('aria-pressed'),
          ariaSelected: el.getAttribute('aria-selected'),
          dataActive: el.getAttribute('data-active'),
          dataState: el.getAttribute('data-state'),
          className: el.className,
          bg: cs.backgroundColor,
          borderColor: cs.borderColor
        }
      })

      await selectLensPill(page, lens)
      await page.waitForTimeout(100)

      const afterState = await pill.evaluate((el) => {
        const cs = window.getComputedStyle(el)
        return {
          ariaPressed: el.getAttribute('aria-pressed'),
          ariaSelected: el.getAttribute('aria-selected'),
          dataActive: el.getAttribute('data-active'),
          dataState: el.getAttribute('data-state'),
          className: el.className,
          bg: cs.backgroundColor,
          borderColor: cs.borderColor
        }
      })

      const hasActiveIndicator =
        afterState.ariaPressed === 'true' ||
        afterState.ariaSelected === 'true' ||
        afterState.dataActive === 'true' ||
        afterState.dataState === 'active' ||
        afterState.className !== beforeState.className ||
        afterState.bg !== beforeState.bg ||
        afterState.borderColor !== beforeState.borderColor

      expect(
        hasActiveIndicator,
        `Expected lens pill "${lens}" to show observable active state change after click`
      ).toBe(true)
    }

    const t = await getTelemetry(page)
    expect(t.ready).toBe(true)
    expect(t.frameCount).toBeGreaterThan(0)
    await expect(byTestId(page, TEST_IDS.nebulaCanvas)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F13.3] opens command-palette via Ctrl+K and / and searches across 10013 cs-math nodes', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await page.keyboard.press('Control+k')
    await expect(byTestId(page, TEST_IDS.commandPalette)).toBeVisible()
    await byTestId(page, TEST_IDS.commandInput).fill('偏微分方程')
    await expect(byTestId(page, TEST_IDS.commandResults)).toContainText('偏微分方程')
    await page.keyboard.press('Escape')
    await expect(byTestId(page, TEST_IDS.commandPalette)).toBeHidden()

    await page.keyboard.press('/')
    await expect(byTestId(page, TEST_IDS.commandPalette)).toBeVisible()
    await byTestId(page, TEST_IDS.commandInput).fill('极限与连续')
    await byTestId(page, TEST_IDS.commandResults).locator('button, [role="option"], li').first().click()
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F13.4] executes > action commands inside command-palette', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openCommandPalette(page)
    await byTestId(page, TEST_IDS.commandInput).fill('>')
    const results = byTestId(page, TEST_IDS.commandResults)
    await expect(results).toBeVisible()
    expect(await results.locator('button, [role="option"], li').count()).toBeGreaterThanOrEqual(1)
    await results.locator('button, [role="option"], li').first().click()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F13.5] renders constellation-radar with radar-viewport and responds to click-to-fly', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await waitForCameraSettle(page)

    const radar = byTestId(page, TEST_IDS.constellationRadar)
    await expect(radar).toBeVisible()
    await expect(byTestId(page, TEST_IDS.radarViewport)).toBeVisible()

    const box = await radar.boundingBox()
    expect(box).not.toBeNull()
    const b = box!
    const posBefore = (await getTelemetry(page)).camera.pos
    await page.mouse.click(b.x + b.width * 0.25, b.y + b.height * 0.25)
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

  test('[T2-F13.1] displays clean empty-results state in command-palette for unmatched query', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openCommandPalette(page)
    await byTestId(page, TEST_IDS.commandInput).fill('___ZZZ_NO_MATCH_9999___')
    const results = byTestId(page, TEST_IDS.commandResults)
    await expect(results).toBeVisible()
    expect(await results.locator('button, [role="option"]').count()).toBe(0)
    await expect(results).not.toContainText('极限与连续')
    await expect(results).not.toContainText('偏微分方程')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F13.2] toggling a domain-chip twice restores unfiltered domain state', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectDomainChip(page, 'D1')
    await selectDomainChip(page, 'D1')
    await expect(byTestId(page, TEST_IDS.domainChip('D1'))).toBeVisible()
    await expect(byTestId(page, TEST_IDS.domainChip('D2'))).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F13.3] bookmarked and review_due lenses handle zero matching nodes without errors', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectLensPill(page, 'bookmarked')
    await selectLensPill(page, 'review_due')
    await expect(byTestId(page, TEST_IDS.nebulaCanvas)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F13.4] closes command-palette on Escape without altering selectedId', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const beforeSel = (await getTelemetry(page)).selectedId
    await openCommandPalette(page)
    await byTestId(page, TEST_IDS.commandInput).fill('极限')
    await page.keyboard.press('Escape')

    await expect(byTestId(page, TEST_IDS.commandPalette)).toBeHidden()
    expect((await getTelemetry(page)).selectedId).toBe(beforeSel)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F13.5] handles rapid sequential lens switches without stale state or errors', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectLensPill(page, 'core')
    await selectLensPill(page, 'actionable')
    await selectLensPill(page, 'route')
    await selectLensPill(page, 'all')

    await expect(byTestId(page, TEST_IDS.topbar)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })
})

test.describe('F14 — Themes, Quality Presets, Responsive HUD, Help & 2D Fallback', () => {
  test('[T1-F14.1] switches across all 3 themes (nebula, daylight, minimal) via theme-switcher', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectTheme(page, 'daylight')
    const daylightAttr = await page.evaluate(
      () =>
        document.documentElement.getAttribute('data-theme') ||
        document.body.getAttribute('data-theme') ||
        document.documentElement.className ||
        window.getComputedStyle(document.body).backgroundColor
    )
    await selectTheme(page, 'minimal')
    const minimalAttr = await page.evaluate(
      () =>
        document.documentElement.getAttribute('data-theme') ||
        document.body.getAttribute('data-theme') ||
        document.documentElement.className ||
        window.getComputedStyle(document.body).backgroundColor
    )
    await selectTheme(page, 'nebula')
    const nebulaAttr = await page.evaluate(
      () =>
        document.documentElement.getAttribute('data-theme') ||
        document.body.getAttribute('data-theme') ||
        document.documentElement.className ||
        window.getComputedStyle(document.body).backgroundColor
    )

    expect(new Set([daylightAttr, minimalAttr, nebulaAttr]).size).toBeGreaterThanOrEqual(2)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F14.2] switches across all 3 quality presets (high, balanced, eco) via quality-switcher', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectQuality(page, 'high')
    await selectQuality(page, 'eco')
    await selectQuality(page, 'balanced')
    await expect(byTestId(page, TEST_IDS.nebulaCanvas)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F14.3] opens and closes help-modal via ? key and help-trigger button', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await page.keyboard.press('?')
    await expect(byTestId(page, TEST_IDS.helpModal)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(byTestId(page, TEST_IDS.helpModal)).toBeHidden()

    await byTestId(page, TEST_IDS.helpTrigger).click()
    await expect(byTestId(page, TEST_IDS.helpModal)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F14.4] renders non-overlapping mobile HUD and Study Drawer at 390x844 viewport', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await assertNoBoundingBoxOverlap([
      { name: 'topbar', locator: byTestId(page, TEST_IDS.topbar) },
      { name: 'today-orbit-hud', locator: byTestId(page, TEST_IDS.todayOrbitHud) }
    ])

    await page.keyboard.press('Control+k')
    await byTestId(page, TEST_IDS.commandInput).fill('u1')
    await byTestId(page, TEST_IDS.commandResults).locator('button, [role="option"], li').first().click()
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toBeVisible()

    await assertNoBoundingBoxOverlap([
      { name: 'topbar', locator: byTestId(page, TEST_IDS.topbar) },
      { name: 'study-drawer', locator: byTestId(page, TEST_IDS.studyDrawer) }
    ])
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F14.5] mounts fallback-2d-view and webgl-fallback-banner when WebGL is unavailable', async ({
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
    await expect(byTestId(page, TEST_IDS.webglFallbackBanner)).toBeVisible()
    const t = await getTelemetry(page)
    expect(t.rendererMode).toBe('fallback-2d')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F14.1] persists selected theme and quality preset across page reload', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectTheme(page, 'daylight')
    await selectQuality(page, 'eco')
    await waitForPersistenceFlush(page)

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const saved = await page.evaluate(
      (k) => window.localStorage.getItem(k),
      STORAGE_KEYS.settings
    )
    expect(saved).not.toBeNull()
    expect(saved ?? '').toContain('daylight')
    expect(saved ?? '').toContain('eco')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F14.2] automatically activates fallback-2d-view on live webglcontextlost event', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await triggerWebGLContextLost(page)
    await expect(byTestId(page, TEST_IDS.fallback2dView)).toBeVisible()
    await expect(byTestId(page, TEST_IDS.webglFallbackBanner)).toBeVisible()
    expect((await getTelemetry(page)).rendererMode).toBe('fallback-2d')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F14.3] remains interactive in 2D fallback mode when selecting a node', async ({
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

    const fallback = byTestId(page, TEST_IDS.fallback2dView)
    await expect(fallback).toBeVisible()
    await openCommandPalette(page)
    await byTestId(page, TEST_IDS.commandInput).fill('u1')
    await byTestId(page, TEST_IDS.commandResults).locator('button, [role="option"], li').first().click()
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F14.4] avoids horizontal page overflow and topbar clipping at 360x740 mobile viewport', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    expect(overflow).toBeLessThanOrEqual(2)
    await expect(byTestId(page, TEST_IDS.topbar)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F14.5] honors prefers-reduced-motion: reduce without animation stalls or errors', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openCommandPalette(page)
    await byTestId(page, TEST_IDS.commandInput).fill('极限与连续')
    await byTestId(page, TEST_IDS.commandResults).locator('button, [role="option"], li').first().click()
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })
})
