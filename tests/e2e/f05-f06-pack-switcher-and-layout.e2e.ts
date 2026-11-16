import { expect, test } from '@playwright/test'
import { attachRuntimeDiagnostics, expectCleanRuntime } from './helpers/diagnostics'
import { seedLocalStorage, STORAGE_KEYS, waitForPersistenceFlush } from './helpers/fixtures'
import {
  dismissOnboardingIfPresent,
  openNodeViaSearch,
  selectDomainChip,
  setWebGLDisabledInitScript,
  switchToPack
} from './helpers/interactions'
import { byTestId, TEST_IDS } from './helpers/selectors'
import {
  getTelemetry,
  projectNodeToScreen,
  waitForAppReady,
  waitForCameraSettle
} from './helpers/telemetry'

test.describe('F5 — Zustand Store & Pack Loader', () => {
  test('[T1-F5.1] pack-switcher exposes both cs-math and dev-mini options', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const switcher = byTestId(page, TEST_IDS.packSwitcher)
    await expect(switcher).toBeVisible()
    const tagName = await switcher.evaluate((el) => el.tagName.toLowerCase())
    if (tagName === 'select') {
      await expect(switcher.locator('option[value="cs-math"]')).toHaveCount(1)
      await expect(switcher.locator('option[value="dev-mini"]')).toHaveCount(1)
    } else {
      await switcher.click()
      await expect(byTestId(page, TEST_IDS.packOption('cs-math'))).toBeVisible()
      await expect(byTestId(page, TEST_IDS.packOption('dev-mini'))).toBeVisible()
    }
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F5.2] switching from cs-math to dev-mini updates telemetry nodeCount and edgeCount', async ({
    page
  }) => {
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

  test('[T1-F5.3] switching back from dev-mini to cs-math restores 10013 nodes and 690 edges', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    expect((await getTelemetry(page)).nodeCount).toBe(11)
    await switchToPack(page, 'cs-math', 10013)
    const t = await getTelemetry(page)
    expect(t.nodeCount).toBe(10013)
    expect(t.edgeCount).toBe(690)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F5.4] persists active pack choice across reload via litree:pack-override', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await switchToPack(page, 'dev-mini', 11)
    await waitForPersistenceFlush(page)

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const t = await getTelemetry(page)
    expect(t.nodeCount).toBe(11)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F5.5] updates domain chips to reflect active pack domains on switch', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await expect(byTestId(page, TEST_IDS.domainChip('M1'))).toBeVisible()
    await switchToPack(page, 'dev-mini', 11)
    await expect(byTestId(page, TEST_IDS.domainChip('D1'))).toBeVisible()
    await expect(byTestId(page, TEST_IDS.domainChip('D2'))).toBeVisible()
    await expect(byTestId(page, TEST_IDS.domainChip('M1'))).toBeHidden()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F5.1] settles cleanly on final pack after rapid back-and-forth switching', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await switchToPack(page, 'dev-mini', 11)
    await switchToPack(page, 'cs-math', 10013)
    await switchToPack(page, 'dev-mini', 11)

    const t = await getTelemetry(page)
    expect(t.nodeCount).toBe(11)
    expect(t.edgeCount).toBe(2)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F5.2] clears or updates open Study Drawer selection when switching packs', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'M.1.1', '极限与连续')
    await expect(byTestId(page, TEST_IDS.studyDrawer)).toBeVisible()

    await switchToPack(page, 'dev-mini', 11)
    const t = await getTelemetry(page)
    expect(t.selectedId).toBeNull()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F5.3] selecting the already-active pack is idempotent without errors', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await switchToPack(page, 'dev-mini', 11)
    const t = await getTelemetry(page)
    expect(t.nodeCount).toBe(11)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F5.4] ignores corrupted pack-override in localStorage and loads default cs-math', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: '%%%INVALID_PACK_ID%%%'
    })
    await page.goto('/')
    await waitForAppReady(page)

    const t = await getTelemetry(page)
    expect(t.nodeCount).toBe(10013)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F5.5] resets active domain filter cleanly when switching to a different pack', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await selectDomainChip(page, 'M1')
    await switchToPack(page, 'dev-mini', 11)

    await expect(byTestId(page, TEST_IDS.domainChip('D1'))).toBeVisible()
    await expect(byTestId(page, TEST_IDS.domainChip('D2'))).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })
})

test.describe('F6 — Deterministic 3D Semantic Galaxy Layout', () => {
  test('[T1-F6.1] produces deterministic screen projections across identical reloads on dev-mini', async ({
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

    const p1 = await projectNodeToScreen(page, 'u1')
    const p2 = await projectNodeToScreen(page, 'u2')
    expect(p1).not.toBeNull()
    expect(p2).not.toBeNull()

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await waitForCameraSettle(page)

    const r1 = await projectNodeToScreen(page, 'u1')
    const r2 = await projectNodeToScreen(page, 'u2')
    expect(r1).not.toBeNull()
    expect(r2).not.toBeNull()

    expect(Math.abs((p1?.x ?? 0) - (r1?.x ?? 0))).toBeLessThan(2)
    expect(Math.abs((p1?.y ?? 0) - (r1?.y ?? 0))).toBeLessThan(2)
    expect(Math.abs((p2?.x ?? 0) - (r2?.x ?? 0))).toBeLessThan(2)
    expect(Math.abs((p2?.y ?? 0) - (r2?.y ?? 0))).toBeLessThan(2)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F6.2] places all dev-mini branches and units with finite non-NaN projections', async ({
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

    for (const id of ['b1', 'b2', 'u1', 'u2', 'u3']) {
      const proj = await projectNodeToScreen(page, id)
      expect(proj, `Missing projection for ${id}`).not.toBeNull()
      expect(Number.isFinite(proj?.x)).toBe(true)
      expect(Number.isFinite(proj?.y)).toBe(true)
    }
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F6.3] maintains distinct non-collapsed separation between u1, u2, and u3', async ({
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

    const p1 = await projectNodeToScreen(page, 'u1')
    const p2 = await projectNodeToScreen(page, 'u2')
    const p3 = await projectNodeToScreen(page, 'u3')
    expect(p1 && p2 && p3).toBeTruthy()

    const d12 = Math.hypot((p1?.x ?? 0) - (p2?.x ?? 0), (p1?.y ?? 0) - (p2?.y ?? 0))
    const d23 = Math.hypot((p2?.x ?? 0) - (p3?.x ?? 0), (p2?.y ?? 0) - (p3?.y ?? 0))
    expect(d12).toBeGreaterThan(5)
    expect(d23).toBeGreaterThan(5)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F6.4] separates domain D1 (b1) and domain D2 (b2) spatially in galaxy view', async ({
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

    const b1 = await projectNodeToScreen(page, 'b1')
    const b2 = await projectNodeToScreen(page, 'b2')
    expect(b1 && b2).toBeTruthy()
    const dist = Math.hypot((b1?.x ?? 0) - (b2?.x ?? 0), (b1?.y ?? 0) - (b2?.y ?? 0))
    expect(dist).toBeGreaterThan(10)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F6.5] completes 10013-node cs-math layout with finite camera and in-view nodes', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await waitForCameraSettle(page)

    const t = await getTelemetry(page)
    expect(Number.isFinite(t.camera.distance)).toBe(true)
    expect(t.camera.distance).toBeGreaterThan(0)

    const m11 = await projectNodeToScreen(page, 'M.1.1')
    expect(m11).not.toBeNull()
    expect(Number.isFinite(m11?.x)).toBe(true)
    expect(Number.isFinite(m11?.y)).toBe(true)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F6.1] returns null for unknown node IDs in projectNodeToScreen', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)

    const missing = await projectNodeToScreen(page, '__NONEXISTENT_NODE_ID__')
    expect(missing).toBeNull()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F6.2] computes valid finite layout coordinates for newly created isolated node', async ({
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
    await editor.locator('input').first().fill('Isolated Layout Node')
    await byTestId(page, TEST_IDS.btnNewNode).click()
    await waitForCameraSettle(page)

    const t = await getTelemetry(page)
    expect(t.nodeCount).toBe(12)
    expect(Number.isFinite(t.camera.pos[0])).toBe(true)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F6.3] computes valid non-overlapping 2D fallback layout when WebGL is disabled', async ({
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
    const u1 = await projectNodeToScreen(page, 'u1')
    const u2 = await projectNodeToScreen(page, 'u2')
    expect(u1).not.toBeNull()
    expect(u2).not.toBeNull()
    const dist = Math.hypot((u1?.x ?? 0) - (u2?.x ?? 0), (u1?.y ?? 0) - (u2?.y ?? 0))
    expect(dist).toBeGreaterThan(2)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F6.4] places empty-leaf unit S.2.1 in cs-math with finite coordinates', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await waitForCameraSettle(page)

    const s21 = await projectNodeToScreen(page, 'S.2.1')
    expect(s21).not.toBeNull()
    expect(Number.isFinite(s21?.x)).toBe(true)
    expect(Number.isFinite(s21?.y)).toBe(true)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F6.5] maintains finite camera and node projections across extreme viewport resizes', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await page.setViewportSize({ width: 360, height: 640 })
    await page.waitForTimeout(200)
    const mobileProj = await projectNodeToScreen(page, 'u1')
    expect(mobileProj).not.toBeNull()
    expect(Number.isFinite(mobileProj?.x)).toBe(true)

    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(200)
    const wideProj = await projectNodeToScreen(page, 'u1')
    expect(wideProj).not.toBeNull()
    expect(Number.isFinite(wideProj?.x)).toBe(true)
    expectCleanRuntime(diag)
    diag.detach()
  })
})
