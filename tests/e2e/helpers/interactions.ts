import { expect, type Locator, type Page } from '@playwright/test'
import { byTestId, TEST_IDS } from './selectors'
import { getTelemetry, projectAndClickNode, projectNodeToScreen, waitForAppReady } from './telemetry'

export async function dismissOnboardingIfPresent(page: Page): Promise<void> {
  const helpModal = byTestId(page, TEST_IDS.helpModal)
  if (await helpModal.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape')
    await expect(helpModal).toBeHidden()
  }
}

export async function switchToPack(
  page: Page,
  packId: string,
  expectedMinNodes?: number
): Promise<void> {
  const switcher = byTestId(page, TEST_IDS.packSwitcher)
  await expect(switcher).toBeVisible()

  const tagName = await switcher.evaluate((el) => el.tagName.toLowerCase())
  if (tagName === 'select') {
    await switcher.selectOption(packId)
  } else {
    await switcher.click()
    const option = byTestId(page, TEST_IDS.packOption(packId))
    await expect(option).toBeVisible()
    await option.click()
  }

  await waitForAppReady(page, { allowFallback2d: true })
  if (typeof expectedMinNodes === 'number') {
    await page.waitForFunction(
      (minCount) => {
        const t = window.__LITREE_TELEMETRY__
        return Boolean(t && t.ready && t.nodeCount >= minCount)
      },
      expectedMinNodes,
      { timeout: 20_000 }
    )
  } else {
    await page.waitForTimeout(250)
  }
}

export async function openCommandPalette(page: Page): Promise<void> {
  const palette = byTestId(page, TEST_IDS.commandPalette)
  if (await palette.isVisible().catch(() => false)) {
    return
  }
  const trigger = byTestId(page, TEST_IDS.searchTrigger)
  if (await trigger.isVisible().catch(() => false)) {
    await trigger.click()
  } else {
    await page.keyboard.press('Control+k')
  }
  await expect(palette).toBeVisible()
}

export async function openNodeViaSearch(
  page: Page,
  query: string,
  matchText?: string
): Promise<void> {
  await openCommandPalette(page)
  const input = byTestId(page, TEST_IDS.commandInput)
  await expect(input).toBeVisible()
  await input.fill(query)

  const results = byTestId(page, TEST_IDS.commandResults)
  await expect(results).toBeVisible()

  const targetItem = matchText
    ? results.locator('button, [role="option"], li').filter({ hasText: matchText }).first()
    : results.locator('button, [role="option"], li').first()

  await expect(targetItem).toBeVisible()
  await targetItem.click()
  await expect(byTestId(page, TEST_IDS.studyDrawer)).toBeVisible()
}

export async function openUnitNode(
  page: Page,
  nodeId: string,
  searchQuery?: string
): Promise<void> {
  const proj = await projectNodeToScreen(page, nodeId)
  if (proj && proj.inView) {
    await projectAndClickNode(page, nodeId)
    const drawer = byTestId(page, TEST_IDS.studyDrawer)
    if (await drawer.isVisible().catch(() => false)) {
      const t = await getTelemetry(page)
      if (t.selectedId === nodeId) return
    }
  }
  await openNodeViaSearch(page, searchQuery ?? nodeId, searchQuery)
}

export async function selectDomainChip(page: Page, domainId: string): Promise<void> {
  const chip = byTestId(page, TEST_IDS.domainChip(domainId))
  await expect(chip).toBeVisible()
  await chip.click()
}

export async function selectLensPill(
  page: Page,
  lens: 'all' | 'actionable' | 'core' | 'route' | 'review_due' | 'bookmarked'
): Promise<void> {
  const pill = byTestId(page, TEST_IDS.lensPill(lens))
  await expect(pill).toBeVisible()
  await pill.click()
}

const THEME_LABEL_PATTERNS: Record<string, RegExp> = {
  nebula: /nebula|星云|深空/i,
  daylight: /daylight|日光|实验室|白昼/i,
  minimal: /minimal|极简|专注/i
}

const QUALITY_LABEL_PATTERNS: Record<string, RegExp> = {
  high: /high|高/i,
  balanced: /balanced|均衡|平衡/i,
  eco: /eco|节能|省电/i
}

async function selectSwitcherOption(
  page: Page,
  switcherTestId: string,
  valueOrIndex: string | number,
  labelPatterns: Record<string, RegExp>
): Promise<void> {
  const switcher = byTestId(page, switcherTestId)
  await expect(switcher).toBeVisible()

  const tagName = await switcher.evaluate((el) => el.tagName.toLowerCase())
  if (tagName === 'select') {
    if (typeof valueOrIndex === 'string') {
      await switcher.selectOption(valueOrIndex)
    } else {
      await switcher.selectOption({ index: valueOrIndex })
    }
    return
  }

  const nestedSelect = switcher.locator('select').first()
  if ((await nestedSelect.count()) > 0) {
    if (typeof valueOrIndex === 'string') {
      await nestedSelect.selectOption(valueOrIndex)
    } else {
      await nestedSelect.selectOption({ index: valueOrIndex })
    }
    return
  }

  const matcher =
    typeof valueOrIndex === 'string'
      ? (labelPatterns[valueOrIndex] ?? new RegExp(valueOrIndex, 'i'))
      : null

  const inlineOptions = switcher.locator('button, [role="option"], [role="radio"], [role="menuitem"]')
  if ((await inlineOptions.count()) > 0) {
    const candidate =
      typeof valueOrIndex === 'number'
        ? inlineOptions.nth(valueOrIndex)
        : inlineOptions.filter({ hasText: matcher! }).first()
    if (await candidate.isVisible().catch(() => false)) {
      await candidate.click()
      return
    }
  }

  await switcher.click()
  const menuItems = page.locator(
    '[role="menu"] button, [role="menu"] [role="menuitem"], [role="listbox"] [role="option"], [role="radiogroup"] [role="radio"]'
  )
  const scopedItems =
    (await menuItems.count()) > 0
      ? menuItems
      : page.locator('[role="menuitem"], [role="option"], button')

  const candidate =
    typeof valueOrIndex === 'number'
      ? scopedItems.nth(valueOrIndex)
      : scopedItems.filter({ hasText: matcher! }).first()

  if (await candidate.isVisible().catch(() => false)) {
    await candidate.click()
  }
}

export async function selectTheme(
  page: Page,
  themeIdOrIndex: string | number
): Promise<void> {
  await selectSwitcherOption(page, TEST_IDS.themeSwitcher, themeIdOrIndex, THEME_LABEL_PATTERNS)
}

export async function selectQuality(
  page: Page,
  qualityIdOrIndex: string | number
): Promise<void> {
  await selectSwitcherOption(
    page,
    TEST_IDS.qualitySwitcher,
    qualityIdOrIndex,
    QUALITY_LABEL_PATTERNS
  )
}

export async function assertNoBoundingBoxOverlap(
  locators: Array<{ name: string; locator: Locator }>
): Promise<void> {
  const boxes: Array<{
    name: string
    x: number
    y: number
    width: number
    height: number
  }> = []

  for (const item of locators) {
    if (!(await item.locator.isVisible().catch(() => false))) continue
    const box = await item.locator.boundingBox()
    if (box && box.width > 0 && box.height > 0) {
      boxes.push({ name: item.name, ...box })
    }
  }

  for (let i = 0; i < boxes.length; i++) {
    const a = boxes[i]
    if (!a) continue
    for (let j = i + 1; j < boxes.length; j++) {
      const b = boxes[j]
      if (!b) continue
      const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
      const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
      const area = overlapX * overlapY
      expect(
        area,
        `Bounding boxes of "${a.name}" and "${b.name}" overlap by ${area}px²`
      ).toBeLessThanOrEqual(2)
    }
  }
}

export async function setWebGLDisabledInitScript(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const origGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextId: string,
      options?: unknown
    ): RenderingContext | null {
      if (
        contextId === 'webgl2' ||
        contextId === 'webgl' ||
        contextId === 'experimental-webgl'
      ) {
        return null
      }
      return origGetContext.call(this, contextId as '2d', options as CanvasRenderingContext2DSettings)
    } as typeof HTMLCanvasElement.prototype.getContext
  })
}

export async function triggerWebGLContextLost(page: Page): Promise<void> {
  await page.evaluate(() => {
    const canvas = document.querySelector('[data-testid="nebula-canvas"]')
    if (!canvas) {
      throw new Error('nebula-canvas not found')
    }
    const event = new Event('webglcontextlost', { bubbles: true, cancelable: true })
    canvas.dispatchEvent(event)
  })
}
