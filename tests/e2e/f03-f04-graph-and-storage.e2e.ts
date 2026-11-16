import { expect, test } from '@playwright/test'
import { attachRuntimeDiagnostics, expectCleanRuntime } from './helpers/diagnostics'
import {
  makeBackupV2Json,
  makeProgressV2Json,
  seedLocalStorage,
  STORAGE_KEYS,
  waitForPersistenceFlush
} from './helpers/fixtures'
import { dismissOnboardingIfPresent, openNodeViaSearch } from './helpers/interactions'
import { byTestId, TEST_IDS } from './helpers/selectors'
import { waitForAppReady } from './helpers/telemetry'

test.describe('F3 — Core Graph, PathTrace & owningUnit Fix', () => {
  test('[T1-F3.1] enforces hard prerequisite gate on dev-mini u2 until u1 is lit', async ({
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
    const drawer = byTestId(page, TEST_IDS.studyDrawer)
    await expect(drawer).toContainText('单元一先学')
    await expect(byTestId(page, TEST_IDS.btnLight)).toBeDisabled()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F3.2] unlocks dev-mini u2 and u3 sequentially as prerequisites are lit', async ({
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
    await byTestId(page, TEST_IDS.btnLight).click()
    await byTestId(page, TEST_IDS.drawerClose).click()

    await openNodeViaSearch(page, 'u2', '单元二')
    await expect(byTestId(page, TEST_IDS.btnLight)).toBeEnabled()
    await byTestId(page, TEST_IDS.btnLight).click()
    await byTestId(page, TEST_IDS.drawerClose).click()

    await openNodeViaSearch(page, 'u3', '单元三')
    await expect(byTestId(page, TEST_IDS.btnLight)).toBeEnabled()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F3.3] resolves chapter-grouped leaf M.1.1.k0 owningUnit to M.1.1 in Study Drawer', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, '极限的直观定义', '极限的直观定义')
    const drawer = byTestId(page, TEST_IDS.studyDrawer)
    await expect(drawer).toContainText('极限与连续')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F3.4] displays all hard and soft prerequisite edge reasons on cs-math M.2.2', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, '偏微分方程', '偏微分方程')
    const drawer = byTestId(page, TEST_IDS.studyDrawer)
    await expect(drawer).toContainText('分离变量后得到的是常微分方程')
    await expect(drawer).toContainText('PDE 里全是偏导数')
    await expect(drawer).toContainText('本征值问题与叠加原理是主线')
    await expect(drawer).toContainText('分离变量的解用傅里叶级数表示')
    await expect(drawer).toContainText('推导守恒律时用散度定理')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F3.5] displays topological prerequisite PathTrace chain for gated unit u3', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u3', '单元三')
    const pathTrace = byTestId(page, TEST_IDS.pathtracePanel)
    await expect(pathTrace).toBeVisible()
    await expect(pathTrace).toContainText('单元一')
    await expect(pathTrace).toContainText('单元二')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F3.1] allows lighting root unit dev-mini u1 with zero prerequisites directly', async ({
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
    await expect(byTestId(page, TEST_IDS.btnLight)).toBeEnabled()
    await byTestId(page, TEST_IDS.btnLight).click()
    await expect(byTestId(page, TEST_IDS.btnUnlight)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F3.2] renders empty unit cs-math S.2.1 (0 leaves) with all 3 prerequisite reasons', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, '计算机系统安全', '计算机系统安全')
    const drawer = byTestId(page, TEST_IDS.studyDrawer)
    await expect(drawer).toContainText('内存安全、权限、隔离都建立在操作系统机制上')
    await expect(drawer).toContainText('系统安全会涉及网络服务')
    await expect(drawer).toContainText('两门课都在课内讲安全原则')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F3.3] unlighting prerequisite u1 re-gates dependent u2 cleanly', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1', '单元一')
    await byTestId(page, TEST_IDS.btnLight).click()
    await expect(byTestId(page, TEST_IDS.btnUnlight)).toBeVisible()
    await byTestId(page, TEST_IDS.btnUnlight).click()
    await byTestId(page, TEST_IDS.drawerClose).click()

    await openNodeViaSearch(page, 'u2', '单元二')
    await expect(byTestId(page, TEST_IDS.btnLight)).toBeDisabled()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F3.4] force-lighting gated node u3 succeeds via btn-force-light', async ({ page }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u3', '单元三')
    await expect(byTestId(page, TEST_IDS.btnLight)).toBeDisabled()
    await byTestId(page, TEST_IDS.btnForceLight).click()
    await expect(byTestId(page, TEST_IDS.btnUnlight)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F3.5] displays clean empty/satisfied state in pathtrace-panel for root unit u1', async ({
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
    const pathTrace = byTestId(page, TEST_IDS.pathtracePanel)
    await expect(pathTrace).toBeVisible()
    await expect(pathTrace).not.toContainText('单元二')
    expectCleanRuntime(diag)
    diag.detach()
  })
})

test.describe('F4 — Local-First Storage, Spaced Repetition & Sessions', () => {
  test('[T1-F4.1] persists lit node status across full page reload after debounce flush', async ({
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

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1.k1', '点一')
    await expect(byTestId(page, TEST_IDS.btnUnlight)).toBeVisible()
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F4.2] persists Markdown notes at unstarted, learning, and lit statuses', async ({
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
    const noteEditor = byTestId(page, TEST_IDS.noteEditor)
    await noteEditor.fill('## Unstarted Note')
    await waitForPersistenceFlush(page)

    await byTestId(page, TEST_IDS.btnLearning).click()
    await noteEditor.fill('## Learning Note')
    await waitForPersistenceFlush(page)

    await byTestId(page, TEST_IDS.btnLight).click()
    await noteEditor.fill('## Lit Note')
    await waitForPersistenceFlush(page)

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1.k1', '点一')
    await expect(byTestId(page, TEST_IDS.noteEditor)).toHaveValue('## Lit Note')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F4.3] creates Leitner schedule on light-up and surfaces due item when nextReviewAt expires', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    const pastDue = makeBackupV2Json({
      progressByPack: {
        'dev-mini': JSON.parse(
          makeProgressV2Json('dev-mini', {
            nodes: {
              'u1.k1': {
                status: 'lit',
                litAt: '2025-01-01T00:00:00.000Z',
                reviewCount: 0,
                leitnerBox: 1,
                mastery: 1,
                nextReviewAt: '2025-01-02T00:00:00.000Z'
              }
            },
            xp: 10,
            streakDays: 1
          })
        )
      }
    })
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini',
      [STORAGE_KEYS.progress('dev-mini')]: JSON.stringify(
        (JSON.parse(pastDue) as { progressByPack: Record<string, unknown> }).progressByPack[
          'dev-mini'
        ]
      )
    })

    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('1')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F4.4] increments XP badge and streak badge on lighting a node and persists reload', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const xpBefore = await byTestId(page, TEST_IDS.xpBadge).innerText()
    await openNodeViaSearch(page, 'u1.k1', '点一')
    await byTestId(page, TEST_IDS.btnLight).click()
    await waitForPersistenceFlush(page)

    const xpAfter = await byTestId(page, TEST_IDS.xpBadge).innerText()
    expect(xpAfter).not.toBe(xpBefore)
    await expect(byTestId(page, TEST_IDS.streakBadge)).toContainText(/[1-9]/)

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await expect(byTestId(page, TEST_IDS.xpBadge)).toHaveText(xpAfter)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T1-F4.5] persists custom node curation overlay across page reload', async ({ page }) => {
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

    const titleInput = editor.locator('input').first()
    await titleInput.fill('Persisted Custom Node')
    await byTestId(page, TEST_IDS.btnNewNode).click()
    await waitForPersistenceFlush(page)

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'Persisted Custom Node', 'Persisted Custom Node')
    await expect(byTestId(page, TEST_IDS.drawerTitle)).toContainText('Persisted Custom Node')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F4.1] quarantines corrupt localStorage progress JSON to :corrupt key and boots cleanly', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini',
      [STORAGE_KEYS.progress('dev-mini')]: '{corrupt-progress-json'
    })

    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await expect(byTestId(page, TEST_IDS.topbar)).toBeVisible()
    const quarantined = await page.evaluate(
      (k) => window.localStorage.getItem(k),
      STORAGE_KEYS.corruptProgress('dev-mini')
    )
    expect(quarantined).toBe('{corrupt-progress-json')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F4.2] handles clearing a Markdown note to empty string across reload', async ({
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
    const editor = byTestId(page, TEST_IDS.noteEditor)
    await editor.fill('Temporary note')
    await waitForPersistenceFlush(page)
    await editor.fill('')
    await waitForPersistenceFlush(page)

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1.k1', '点一')
    await expect(byTestId(page, TEST_IDS.noteEditor)).toHaveValue('')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F4.3] persists special Unicode and Markdown syntax in note-editor cleanly', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini'
    })
    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    const specialMd = '# 笔记 🚀\n```ts\nconst x = 1 < 2 && "ok";\n```\n| 列1 | 列2 |\n|---|---|'
    await openNodeViaSearch(page, 'u1.k1', '点一')
    await byTestId(page, TEST_IDS.noteEditor).fill(specialMd)
    await waitForPersistenceFlush(page)

    await page.reload()
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await openNodeViaSearch(page, 'u1.k1', '点一')
    await expect(byTestId(page, TEST_IDS.noteEditor)).toHaveValue(specialMd)
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F4.4] keeps pre-seeded ProgressV2 with future nextReviewAt out of due reviews', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    const futureProgress = makeProgressV2Json('dev-mini', {
      nodes: {
        'u1.k1': {
          status: 'lit',
          litAt: '2026-05-01T00:00:00.000Z',
          reviewCount: 2,
          leitnerBox: 3,
          mastery: 2,
          nextReviewAt: '2035-01-01T00:00:00.000Z'
        }
      },
      xp: 30,
      streakDays: 2
    })
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini',
      [STORAGE_KEYS.progress('dev-mini')]: futureProgress
    })

    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)

    await expect(byTestId(page, TEST_IDS.dueReviewCount)).toContainText('0')
    expectCleanRuntime(diag)
    diag.detach()
  })

  test('[T2-F4.5] isolates progress storage independently between dev-mini and cs-math', async ({
    page
  }) => {
    const diag = attachRuntimeDiagnostics(page)
    await seedLocalStorage(page, {
      [STORAGE_KEYS.packOverride]: 'dev-mini',
      [STORAGE_KEYS.progress('dev-mini')]: makeProgressV2Json('dev-mini', {
        nodes: {
          'u1.k1': {
            status: 'lit',
            litAt: '2026-05-01T00:00:00.000Z',
            reviewCount: 0,
            leitnerBox: 1,
            mastery: 1,
            nextReviewAt: '2035-01-01T00:00:00.000Z'
          }
        },
        xp: 77,
        streakDays: 1
      })
    })

    await page.goto('/')
    await waitForAppReady(page)
    await dismissOnboardingIfPresent(page)
    await expect(byTestId(page, TEST_IDS.xpBadge)).toContainText('77')

    const csMathProgress = await page.evaluate(
      (k) => window.localStorage.getItem(k),
      STORAGE_KEYS.progress('cs-math')
    )
    expect(csMathProgress === null || !csMathProgress.includes('"xp":77')).toBe(true)
    expectCleanRuntime(diag)
    diag.detach()
  })
})
