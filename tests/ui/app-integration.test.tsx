// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../src/App'
import { appStore } from '../../src/core/store'
import type { LitreeTelemetry } from '../../src/core/types'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const DEV_MINI_MOCK = {
  schema: 'litree/pack-v1',
  id: 'dev-mini',
  title: { zh: '开发迷你树' },
  domains: [{ id: 'D1', name: '核心', color: '#38bdf8' }],
  nodes: [
    { id: 'b1', parent: null, kind: 'branch', title: { zh: '分支一' }, domain: 'D1' },
    { id: 'u1', parent: 'b1', kind: 'unit', title: { zh: '单元一' }, domain: 'D1', core: true },
    { id: 'u1.k1', parent: 'u1', kind: 'leaf', title: { zh: '点一' }, domain: 'D1' },
    { id: 'u2', parent: 'b1', kind: 'unit', title: { zh: '单元二' }, domain: 'D1' },
    { id: 'u2.k1', parent: 'u2', kind: 'leaf', title: { zh: '点二' }, domain: 'D1' }
  ],
  edges: [{ from: 'u1', to: 'u2', type: 'hard', reason: '单元一先学' }],
  routes: [{ name: '入门路线', ids: ['u1', 'u2'] }]
}

describe('App Integration in happy-dom (2D Fallback + Shortcuts + Focus Timer)', () => {
  let container: HTMLDivElement
  let root: Root
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    // happy-dom's Web Animations API rejects finished promises with AbortError on unmount
    if (typeof Element !== 'undefined') {
      Object.defineProperty(Element.prototype, 'animate', {
        configurable: true,
        value: undefined
      })
    }
    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes('packs/index.json')) {
        return new Response(
          JSON.stringify([{ id: 'dev-mini', title: '开发迷你树', file: 'dev-mini.json' }]),
          { status: 200 }
        )
      }
      if (url.includes('dev-mini.json') || url.includes('cs-math.json')) {
        return new Response(JSON.stringify(DEV_MINI_MOCK), { status: 200 })
      }
      return new Response('Not Found', { status: 404 })
    }) as unknown as typeof fetch

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    globalThis.fetch = originalFetch
    vi.useRealTimers()
    delete (window as unknown as { __LITREE_TELEMETRY__?: unknown }).__LITREE_TELEMETRY__
  })

  it('initializes pack, attaches fallback-2d telemetry, and handles keyboard shortcuts + focus countdown', async () => {
    await act(async () => {
      root.render(<App />)
      await Promise.resolve()
      await Promise.resolve()
    })

    // Trigger init completion explicitly if async fetch settled
    await act(async () => {
      await appStore.getState().switchPack('dev-mini')
    })

    const tel = (window as unknown as { __LITREE_TELEMETRY__?: LitreeTelemetry })
      .__LITREE_TELEMETRY__
    expect(tel?.ready).toBe(true)
    expect(tel?.rendererMode).toBe('fallback-2d')
    expect(container.querySelector('[data-testid="fallback-2d-view"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="help-modal"]')).toBeNull()

    // '?' opens help-modal, Escape closes it
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }))
    })
    expect(container.querySelector('[data-testid="help-modal"]')).not.toBeNull()
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
    expect(container.querySelector('[data-testid="help-modal"]')).toBeNull()

    // 'e' toggles graph-editor-panel
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true }))
    })
    expect(container.querySelector('[data-testid="graph-editor-panel"]')).not.toBeNull()
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'E', bubbles: true }))
    })
    expect(container.querySelector('[data-testid="graph-editor-panel"]')).toBeNull()

    // Select node u1 -> NodeActionMenu opens without blocking canvas with StudyDrawer
    act(() => {
      appStore.getState().selectNode('u1')
    })
    expect(container.querySelector('[data-testid="node-action-menu"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="study-drawer"]')).toBeNull()

    // Toggle subgraph isolation inside secondary menu
    const isolateBtn = container.querySelector('[data-testid="menu-isolate-graph"]') as HTMLButtonElement
    act(() => {
      isolateBtn.click()
    })
    expect(isolateBtn.getAttribute('aria-pressed')).toBe('true')
    act(() => {
      isolateBtn.click()
    })
    expect(isolateBtn.getAttribute('aria-pressed')).toBe('false')

    // Clicking "学习详情" in NodeActionMenu opens StudyDrawer
    act(() => {
      ;(container.querySelector('[data-testid="menu-open-drawer"]') as HTMLButtonElement).click()
    })
    expect(container.querySelector('[data-testid="study-drawer"]')).not.toBeNull()

    // Ctrl+K opens palette, Escape closes palette without clearing StudyDrawer or selectedId
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
    })
    expect(container.querySelector('[data-testid="command-palette"]')).not.toBeNull()
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
    expect(container.querySelector('[data-testid="command-palette"]')).toBeNull()
    expect(container.querySelector('[data-testid="study-drawer"]')).not.toBeNull()

    // Typing 'e' inside note-editor must NOT open graph-editor-panel
    const noteEl = container.querySelector('[data-testid="note-editor"]') as HTMLTextAreaElement
    act(() => {
      noteEl.focus()
      noteEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true }))
    })
    expect(container.querySelector('[data-testid="graph-editor-panel"]')).toBeNull()

    // Focus Timer start -> 2s tick -> pause -> resume preserves remaining seconds
    act(() => {
      ;(container.querySelector('[data-testid="btn-start-focus"]') as HTMLButtonElement).click()
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(container.querySelector('[data-testid="focus-remaining"]')?.textContent).toBe('24:58')

    act(() => {
      ;(container.querySelector('[data-testid="btn-pause-focus"]') as HTMLButtonElement).click()
    })
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(container.querySelector('[data-testid="focus-remaining"]')?.textContent).toBe('24:58')

    act(() => {
      ;(container.querySelector('[data-testid="btn-start-focus"]') as HTMLButtonElement).click()
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(container.querySelector('[data-testid="focus-remaining"]')?.textContent).toBe('24:57')

    // Theme switching updates <html data-theme>
    act(() => {
      appStore.getState().setTheme('daylight')
    })
    expect(document.documentElement.getAttribute('data-theme')).toBe('daylight')

    // Default 2D view mounts zoom controls and experimental 3D toggle button
    expect(container.querySelector('[data-testid="zoom-controls-2d"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="toggle-3d-view"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="webgl-fallback-banner"]')).toBeNull()
  })

  it('preserves FocusTimer totalSec and exact remainingSec < 60s across pause/resume/re-pause and completes with full duration', async () => {
    await act(async () => {
      root.render(<App />)
      await Promise.resolve()
      await Promise.resolve()
    })
    await act(async () => {
      await appStore.getState().switchPack('dev-mini')
    })
    act(() => {
      appStore.getState().selectNode('u1')
    })

    act(() => {
      ;(container.querySelector('[data-testid="menu-start-focus"]') as HTMLButtonElement).click()
    })
    // Advance 1455s so remainingSec = 45 (< 60s)
    act(() => {
      vi.advanceTimersByTime(1455 * 1000)
    })
    expect(container.querySelector('[data-testid="focus-remaining"]')?.textContent).toBe('00:45')

    // Pause at 45s
    act(() => {
      ;(container.querySelector('[data-testid="btn-pause-focus"]') as HTMLButtonElement).click()
    })
    expect(container.querySelector('[data-testid="btn-start-focus"]')?.textContent).toContain('继续')

    // Resume at 45s -> preserves totalSec=1500 and remainingSec=45
    act(() => {
      ;(container.querySelector('[data-testid="btn-start-focus"]') as HTMLButtonElement).click()
    })
    expect(appStore.getState().focusTimer).toEqual({
      nodeId: 'u1',
      remainingSec: 45,
      totalSec: 1500,
      running: true
    })

    // Immediate re-pause without a tick still shows '继续' and preserves remainingSec=45, totalSec=1500
    act(() => {
      ;(container.querySelector('[data-testid="btn-pause-focus"]') as HTMLButtonElement).click()
    })
    expect(container.querySelector('[data-testid="btn-start-focus"]')?.textContent).toContain('继续')
    act(() => {
      ;(container.querySelector('[data-testid="btn-start-focus"]') as HTMLButtonElement).click()
    })
    expect(appStore.getState().focusTimer).toEqual({
      nodeId: 'u1',
      remainingSec: 45,
      totalSec: 1500,
      running: true
    })

    // Advance 15s (to 30s left) and complete -> records full 25m session
    act(() => {
      vi.advanceTimersByTime(15 * 1000)
    })
    await act(async () => {
      await appStore.getState().completeFocusSession()
    })
    const sessions = appStore.getState().progress?.sessions ?? []
    expect(sessions.length).toBe(1)
    expect(sessions[0]?.durationMinutes).toBe(25)
  })

  it('suppresses StudyDrawer on mobile (<= 768px) while ReviewRadarPanel is open and restores it on close', async () => {
    const origWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })

    await act(async () => {
      root.render(<App />)
      await Promise.resolve()
      await Promise.resolve()
    })
    await act(async () => {
      await appStore.getState().switchPack('dev-mini')
    })

    // Light u1.k1 and backdate nextReviewAt so it is due
    await act(async () => {
      await appStore.getState().lightNode('u1.k1', { force: true })
    })
    act(() => {
      const p = appStore.getState().progress!
      appStore.setState({
        progress: {
          ...p,
          nodes: {
            ...p.nodes,
            'u1.k1': {
              ...p.nodes['u1.k1']!,
              nextReviewAt: new Date(Date.now() - 86_400_000).toISOString()
            }
          }
        }
      })
    })

    // Open ReviewRadarPanel -> StudyDrawer is suppressed on mobile while ReviewRadarPanel is open
    act(() => {
      ;(container.querySelector('[data-testid="start-review-btn"]') as HTMLButtonElement).click()
    })
    expect(container.querySelector('[data-testid="review-radar-panel"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="btn-review-remembered"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="study-drawer"]')).toBeNull()
    expect(appStore.getState().selectedId).toBe('u1.k1')

    // Closing ReviewRadarPanel restores StudyDrawer for the selected node
    act(() => {
      ;(
        container.querySelector(
          '[data-testid="review-radar-panel"] button[aria-label="关闭复习雷达"]'
        ) as HTMLButtonElement
      ).click()
    })
    expect(container.querySelector('[data-testid="review-radar-panel"]')).toBeNull()
    expect(container.querySelector('[data-testid="study-drawer"]')).not.toBeNull()

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: origWidth })
  })

  it('keeps single study-drawer DOM tree when switching selected nodes in App', async () => {
    await act(async () => {
      root.render(<App />)
      await Promise.resolve()
      await Promise.resolve()
    })
    await act(async () => {
      await appStore.getState().switchPack('dev-mini')
    })

    act(() => {
      appStore.getState().selectNode('u1')
    })
    act(() => {
      ;(container.querySelector('[data-testid="menu-open-drawer"]') as HTMLButtonElement).click()
    })
    expect(container.querySelectorAll('[data-testid="study-drawer"]').length).toBe(1)
    expect(container.querySelector('[data-testid="drawer-title"]')?.textContent).toBe('单元一')

    act(() => {
      appStore.getState().selectNode('u2')
    })
    expect(container.querySelectorAll('[data-testid="study-drawer"]').length).toBe(1)
    expect(container.querySelectorAll('[data-testid="drawer-title"]').length).toBe(1)
    expect(container.querySelector('[data-testid="drawer-title"]')?.textContent).toBe('单元二')
  })
})
