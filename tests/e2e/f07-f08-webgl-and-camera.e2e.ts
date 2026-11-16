import { expect, test } from '@playwright/test'
import { attachRuntimeDiagnostics, expectCleanRuntime } from './helpers/diagnostics'
import { seedLocalStorage, STORAGE_KEYS } from './helpers/fixtures'
import {
  dismissOnboardingIfPresent,
  openNodeViaSearch,
  selectQuality,
  selectTheme,
  triggerWebGLContextLost
} from './helpers/interactions'
import { byTestId, TEST_IDS } from './helpers/selectors'
import {
  assertCanvasHasVariance,
  getCanvasPixelStats,
  getTelemetry,
  projectAndClickNode,
  projectAndHoverNode,
  projectNodeToScreen,
  waitForAppReady,
  waitForCameraSettle
} from './helpers/telemetry'

test.describe('F7 — 3D WebGL Nebula Engine (NebulaEngine)', () => {
  test('[T1-F7.1] initializes WebGL2 rendererMode with non-empty glRenderer string', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)

    const t = await getTelemetry(page)
    expect(t.rendererMode).toBe('webgl2')
    expect(t.glRenderer.trim().length).toBeGreaterThan(0)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F7.2] advances telemetry frameCount continuously after initial render', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)

    const t1 = await getTelemetry(page)
    await page.waitForTimeout(350)
    const t2 = await getTelemetry(page)

    expect(t2.frameCount).toBeGreaterThan(t1.frameCount)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F7.3] renders visible non-blank pixel variance on nebula-canvas', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await waitForCameraSettle(page)

    await assertCanvasHasVariance(page, 12, 2.0)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F7.4] updates telemetry lastBurstAt timestamp when lighting up a node', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const before = (await getTelemetry(page)).lastBurstAt
    await openNodeViaSearch(page, 'u1', '单元一')
    await byTestId(page, TEST_IDS.btnLight).click()

    await page.waitForFunction(
      (prev) => (window.__LITREE_TELEMETRY__?.lastBurstAt ?? 0) > prev,
      before,
      { timeout: 10_000 }
    )
    const after = (await getTelemetry(page)).lastBurstAt
    expect(after).toBeGreaterThan(before)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F7.5] updates rendered canvas pixel output when switching active theme', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await waitForCameraSettle(page)

    const nebulaStats = await getCanvasPixelStats(page)
    await selectTheme(page, 'daylight')
    await page.waitForTimeout(350)
    const daylightStats = await getCanvasPixelStats(page)

    expect(daylightStats.sampleDigest).not.toBe(nebulaStats.sampleDigest)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F7.1] renders visible nebula-canvas output in Eco quality preset', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectQuality(page, 'eco')
    await page.waitForTimeout(300)
    await assertCanvasHasVariance(page, 8, 1.0)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F7.2] renders visible nebula-canvas output in High quality preset', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectQuality(page, 'high')
    await page.waitForTimeout(300)
    await assertCanvasHasVariance(page, 12, 2.0)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F7.3] handles hidden-to-visible tab lifecycle without permanently freezing frameCount', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)

    await page.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    const before = (await getTelemetry(page)).frameCount
    await page.waitForTimeout(350)
    const after = (await getTelemetry(page)).frameCount

    expect(after).toBeGreaterThan(before)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F7.4] handles rapid consecutive light-up bursts without WebGL errors or frame deadlock', async ({
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
      ['u1.k1', '点一'],
      ['u1.k2', '点二'],
      ['u1.k3', '点三']
    ] as const) {
      await openNodeViaSearch(page, id, title)
      await byTestId(page, TEST_IDS.btnLight).click()
      await byTestId(page, TEST_IDS.drawerClose).click()
    }

    const t1 = await getTelemetry(page)
    await page.waitForTimeout(250)
    const t2 = await getTelemetry(page)
    expect(t2.frameCount).toBeGreaterThan(t1.frameCount)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F7.5] transitions gracefully to fallback-2d on webglcontextlost event', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await triggerWebGLContextLost(page)
    await expect(byTestId(page, TEST_IDS.fallback2dView)).toBeVisible()
    await expect(byTestId(page, TEST_IDS.webglFallbackBanner)).toBeVisible()

    const t = await getTelemetry(page)
    expect(t.rendererMode).toBe('fallback-2d')
    expectCleanRuntime(diag)
    diag.detach()
  })
})

test.describe('F8 — 3D Camera Rig, Raycasting & Telemetry', () => {
  test('[T1-F8.1] mouse drag orbit on nebula-canvas moves camera.pos and changes rendered pixels', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await waitForCameraSettle(page)

    const canvasBox = await byTestId(page, TEST_IDS.nebulaCanvas).boundingBox()
    expect(canvasBox).not.toBeNull()
    const box = canvasBox!

    const beforeCam = (await getTelemetry(page)).camera.pos
    const beforePixels = await getCanvasPixelStats(page)

    const cx = box.x + box.width * 0.5
    const cy = box.y + box.height * 0.5
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + 180, cy - 90, { steps: 12 })
    await page.mouse.up()
    await page.waitForTimeout(300)

    const afterCam = (await getTelemetry(page)).camera.pos
    const afterPixels = await getCanvasPixelStats(page)

    const moved = Math.hypot(
      afterCam[0] - beforeCam[0],
      afterCam[1] - beforeCam[1],
      afterCam[2] - beforeCam[2]
    )
    expect(moved).toBeGreaterThan(0.5)
    expect(afterPixels.sampleDigest).not.toBe(beforePixels.sampleDigest)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F8.2] mouse wheel zoom on nebula-canvas changes camera.distance', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await waitForCameraSettle(page)

    const canvasBox = await byTestId(page, TEST_IDS.nebulaCanvas).boundingBox()
    expect(canvasBox).not.toBeNull()
    const box = canvasBox!

    const distBefore = (await getTelemetry(page)).camera.distance
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5)
    await page.mouse.wheel(0, -500)
    await page.waitForTimeout(350)

    const distAfter = (await getTelemetry(page)).camera.distance
    expect(Math.abs(distAfter - distBefore)).toBeGreaterThan(0.5)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F8.3] hovering projected node coordinates via mouse.move updates telemetry hoveredId', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await projectAndHoverNode(page, 'u1')
    await page.waitForFunction(
      () => window.__LITREE_TELEMETRY__?.hoveredId === 'u1',
      undefined,
      { timeout: 10_000 }
    )
    const t = await getTelemetry(page)
    expect(t.hoveredId).toBe('u1')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F8.4] clicking projected node coordinates selects node, flies camera, and opens Study Drawer', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await projectAndClickNode(page, 'u1')
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toBeVisible()
    await expect(byTestId(page, TEST_IDS.drawerTitle)).toContainText('单元一')

    const t = await getTelemetry(page)
    expect(t.selectedId).toBe('u1')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F8.5] reset-view-btn restores overview camera distance after flying close to a node', async ({
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

    const overviewDistance = (await getTelemetry(page)).camera.distance
    await projectAndClickNode(page, 'u1')
    await waitForCameraSettle(page)
    const zoomedDistance = (await getTelemetry(page)).camera.distance
    expect(zoomedDistance).toBeLessThan(overviewDistance)

    await byTestId(page, TEST_IDS.resetViewBtn).click()
    await waitForCameraSettle(page)
    const resetDistance = (await getTelemetry(page)).camera.distance
    expect(Math.abs(resetDistance - overviewDistance)).toBeLessThan(overviewDistance * 0.25)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F8.1] drag orbit across a projected node does NOT trigger false node selection', async ({
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

    const proj = await projectNodeToScreen(page, 'u1')
    expect(proj).not.toBeNull()
    const target = proj!

    await page.mouse.move(target.x, target.y)
    await page.mouse.down()
    await page.mouse.move(target.x + 140, target.y + 60, { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(200)

    const t = await getTelemetry(page)
    expect(t.selectedId).toBeNull()
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toBeHidden()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F8.2] clicking empty canvas corner clears existing selection', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await projectAndClickNode(page, 'u1')
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toBeVisible()

    await page.mouse.click(20, 200)
    await page.waitForTimeout(200)
    const t = await getTelemetry(page)
    expect(t.selectedId).toBeNull()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F8.3] user drag during automated flyTo cancels flight immediately', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u3', '单元三')
    const box = await byTestId(page, TEST_IDS.nebulaCanvas).boundingBox()
    expect(box).not.toBeNull()
    const b = box!

    await page.mouse.move(b.x + b.width * 0.35, b.y + b.height * 0.5)
    await page.mouse.down()
    await page.mouse.move(b.x + b.width * 0.55, b.y + b.height * 0.4, { steps: 6 })
    await page.mouse.up()

    await page.waitForTimeout(100)
    const t = await getTelemetry(page)
    expect(t.isFlying).toBe(false)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F8.4] extreme repeated wheel zoom clamps camera.distance within finite bounds', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await waitForCameraSettle(page)

    const box = await byTestId(page, TEST_IDS.nebulaCanvas).boundingBox()
    expect(box).not.toBeNull()
    const b = box!
    await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.5)

    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, -1200)
    }
    await page.waitForTimeout(200)
    const minDist = (await getTelemetry(page)).camera.distance
    expect(Number.isFinite(minDist)).toBe(true)
    expect(minDist).toBeGreaterThan(0.5)

    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 1200)
    }
    await page.waitForTimeout(200)
    const maxDist = (await getTelemetry(page)).camera.distance
    expect(Number.isFinite(maxDist)).toBe(true)
    expect(maxDist).toBeLessThan(10_000)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F8.5] repeated flyTo transitions between distant nodes settle with isFlying=false', async ({
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
    await waitForCameraSettle(page)
    await openNodeViaSearch(page, 'u3', '单元三')
    await waitForCameraSettle(page)

    const t = await getTelemetry(page)
    expect(t.isFlying).toBe(false)
    expect(t.selectedId).toBe('u3')
    expectCleanRuntime(diag)
    diag.detach()
  })
})
