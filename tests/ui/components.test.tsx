// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { AnimatePresence } from 'framer-motion'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildGraphIndex, getLitLeavesSet } from '../../src/core/graph'
import { normalizePackToV2 } from '../../src/core/schema'
import { emptyPackProgress } from '../../src/core/progress'
import type { LitreeTelemetry, NodeVisualState, PackDocument } from '../../src/core/types'
import { computeGalaxyLayout } from '../../src/layout/galaxyLayout'
import { ErrorBoundary } from '../../src/main'
import { BackupModal } from '../../src/ui/BackupModal'
import { CommandPalette } from '../../src/ui/CommandPalette'
import { ConstellationRadar } from '../../src/ui/ConstellationRadar'
import { FallbackConstellation } from '../../src/ui/FallbackConstellation'
import { FocusTimerWidget } from '../../src/ui/FocusTimerWidget'
import { GraphEditorPanel } from '../../src/ui/GraphEditorPanel'
import { HelpModal } from '../../src/ui/HelpModal'
import { ReviewRadarPanel } from '../../src/ui/ReviewRadarPanel'
import { StudyDrawer } from '../../src/ui/StudyDrawer'
import { ToastRegion } from '../../src/ui/ToastRegion'
import { TodayOrbitHud } from '../../src/ui/TodayOrbitHud'
import { TopBar } from '../../src/ui/TopBar'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function makeRichTestPack(): PackDocument {
  const leafNodes = Array.from({ length: 22 }, (_, i) => ({
    id: `u1.k${i}`,
    parent: i === 0 ? 'u1.ch1' : 'u1',
    kind: 'leaf' as const,
    title: { zh: `知识点 ${i}` },
    domain: 'D1',
    exercises: i === 0 ? ['练习1', '练习2'] : undefined
  }))

  const res = normalizePackToV2({
    schema: 'litree/pack-v1',
    id: 'test-pack',
    title: { zh: '测试星云', en: 'Test Galaxy' },
    domains: [
      { id: 'D1', name: '基础数学', color: '#38bdf8' },
      { id: 'D2', name: '系统工程', color: '#fbbf24' }
    ],
    nodes: [
      { id: 'b1', parent: null, kind: 'branch', title: { zh: '分支一' }, domain: 'D1' },
      {
        id: 'u1',
        parent: 'b1',
        kind: 'unit',
        title: { zh: '极限与连续' },
        domain: 'D1',
        core: true,
        exercises: ['习题A', '习题B', '习题C', '习题D', '习题E']
      },
      { id: 'u1.ch1', parent: 'u1', kind: 'branch', title: { zh: '第一章' }, domain: 'D1' },
      ...leafNodes,
      { id: 'u2', parent: 'b1', kind: 'unit', title: { zh: '微积分进阶' }, domain: 'D1' },
      { id: 'u2.k0', parent: 'u2', kind: 'leaf', title: { zh: '积分定义' }, domain: 'D1' },
      { id: 'u3', parent: 'b1', kind: 'unit', title: { zh: '空单元' }, domain: 'D2' }
    ],
    edges: [
      { from: 'u1', to: 'u2', type: 'hard', reason: '硬先修理由一' },
      { from: 'u1', to: 'u2', type: 'soft', reason: '软推荐理由二' }
    ],
    routes: [{ name: '核心路线', ids: ['u1', 'u2'] }]
  })
  if (!res.ok) throw new Error(res.errors.join('; '))
  return res.pack
}

describe('M3 UI Components & DOM Contracts', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    if (typeof Element !== 'undefined') {
      Object.defineProperty(Element.prototype, 'animate', {
        configurable: true,
        value: undefined
      })
    }
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    delete (window as unknown as { __LITREE_TELEMETRY__?: unknown }).__LITREE_TELEMETRY__
  })

  it('TopBar renders pack switcher, domain chips, all 6 lens pills, and triggers callbacks', () => {
    const pack = makeRichTestPack()
    const index = buildGraphIndex(pack)
    const onSetLens = vi.fn()
    const onToggleDomain = vi.fn()
    const onSwitchPack = vi.fn()
    const onSetTheme = vi.fn()
    const onSetQuality = vi.fn()

    act(() => {
      root.render(
        <TopBar
          packs={[
            { id: 'test-pack', title: { zh: '测试星云' }, source: 'builtin' },
            { id: 'dev-mini', title: { zh: '开发迷你树' }, source: 'builtin' }
          ]}
          activePackId="test-pack"
          pack={pack}
          index={index}
          viewLevel="branch"
          clusterStack={['b1']}
          activeDomains={['D1']}
          activeLens="core"
          editMode={false}
          theme="nebula"
          quality="balanced"
          onSwitchPack={onSwitchPack}
          onStepBack={vi.fn()}
          onSelectCluster={vi.fn()}
          onResetToGalaxy={vi.fn()}
          onToggleDomain={onToggleDomain}
          onClearDomains={vi.fn()}
          onSetLens={onSetLens}
          onOpenSearch={vi.fn()}
          onToggleEditMode={vi.fn()}
          onSetTheme={onSetTheme}
          onSetQuality={onSetQuality}
          onOpenBackup={vi.fn()}
          onOpenHelp={vi.fn()}
          onResetView={vi.fn()}
        />
      )
    })

    expect(container.querySelector('[data-testid="topbar"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="pack-switcher"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="domain-chip-D1"]')?.getAttribute('aria-pressed')).toBe('true')
    expect(container.querySelector('[data-testid="domain-chip-D2"]')?.getAttribute('aria-pressed')).toBe('false')

    const lenses = ['all', 'actionable', 'core', 'route', 'review_due', 'bookmarked'] as const
    for (const lens of lenses) {
      const btn = container.querySelector(`[data-testid="lens-pill-${lens}"]`)
      expect(btn).not.toBeNull()
      expect(btn?.getAttribute('data-active')).toBe(lens === 'core' ? 'true' : 'false')
    }

    act(() => {
      ;(container.querySelector('[data-testid="lens-pill-actionable"]') as HTMLButtonElement).click()
      ;(container.querySelector('[data-testid="domain-chip-D2"]') as HTMLButtonElement).click()
    })
    expect(onSetLens).toHaveBeenCalledWith('actionable')
    expect(onToggleDomain).toHaveBeenCalledWith('D2')
  })

  it('TodayOrbitHud collapses/expands hiding continue-orbit-btn and lists queued nodes', () => {
    const pack = makeRichTestPack()
    const index = buildGraphIndex(pack)
    const progress = emptyPackProgress('test-pack')
    progress.xp = 42
    progress.streakDays = 5
    progress.nodes['u1.k0'] = {
      status: 'queued',
      reviewCount: 0,
      leitnerBox: 0,
      mastery: 0
    }
    const litLeaves = getLitLeavesSet(progress, index)

    act(() => {
      root.render(
        <TodayOrbitHud
          pack={pack}
          index={index}
          progress={progress}
          litLeaves={litLeaves}
          dueReviewIds={['u1.k1']}
          activeStreak={5}
          activeRouteId={pack.routes[0]?.id ?? null}
          onSetActiveRoute={vi.fn()}
          onContinueOrbit={vi.fn()}
          onStartReview={vi.fn()}
          onSelectAndFly={vi.fn()}
        />
      )
    })

    expect(container.querySelector('[data-testid="streak-badge"]')?.textContent).toBe('5')
    expect(container.querySelector('[data-testid="xp-badge"]')?.textContent).toBe('42')
    expect(container.querySelector('[data-testid="due-review-count"]')?.textContent).toBe('1')
    expect(container.querySelector('[data-testid="continue-orbit-btn"]')).not.toBeNull()
    expect(container.textContent).toContain('知识点 0')

    act(() => {
      ;(container.querySelector('[data-testid="today-orbit-toggle"]') as HTMLButtonElement).click()
    })
    expect(container.querySelector('[data-testid="continue-orbit-btn"]')).toBeNull()
    expect(container.querySelector('[data-testid="today-orbit-toggle"]')?.getAttribute('aria-expanded')).toBe('false')
  })

  it('StudyDrawer enforces owningUnit, edge reasons, checklist >20/0-leaf visibility, note-editor, and custom-resource-form order', () => {
    const pack = makeRichTestPack()
    const index = buildGraphIndex(pack)
    const progress = emptyPackProgress('test-pack')
    const litLeaves = getLitLeavesSet(progress, index)
    const onAddCustomResource = vi.fn(() => ({ ok: false as const, error: '无效 URL' }))
    const onToast = vi.fn()

    // 1. Chapter-grouped leaf u1.k0 -> displays owningUnit '极限与连续'
    const leafNode = index.nodesById.get('u1.k0')!
    act(() => {
      root.render(
        <StudyDrawer
          node={leafNode}
          index={index}
          progress={progress}
          litLeaves={litLeaves}
          focusTimer={{ nodeId: null, remainingSec: 1500, totalSec: 1500, running: false }}
          onClose={vi.fn()}
          onSelectAndFly={vi.fn()}
          onEnterCluster={vi.fn()}
          onLight={vi.fn(async () => {})}
          onUnlight={vi.fn(async () => {})}
          onBatchLightUnit={vi.fn(async () => {})}
          onBatchUnlightUnit={vi.fn(async () => {})}
          onSetStatus={vi.fn(async () => {})}
          onTogglePin={vi.fn()}
          onToggleTag={vi.fn()}
          onToggleExercise={vi.fn()}
          onUpdateNote={vi.fn()}
          onAddCustomResource={onAddCustomResource}
          onRemoveCustomResource={vi.fn()}
          onStartFocus={vi.fn()}
          onPauseFocus={vi.fn()}
          onCompleteFocus={vi.fn()}
          onToast={onToast}
        />
      )
    })

    const drawer = container.querySelector('[data-testid="study-drawer"]')!
    expect(drawer.textContent).toContain('极限与连续')
    expect(drawer.querySelector('[data-testid="note-editor"]')?.tagName).toBe('TEXTAREA')
    expect(drawer.querySelector('[data-testid="checklist-tab"]')).toBeNull()

    const form = drawer.querySelector('[data-testid="custom-resource-form"]') as HTMLFormElement
    const formInputs = form.querySelectorAll('input')
    expect(formInputs.length).toBe(2)
    expect(formInputs[0]?.type).toBe('text')
    expect(formInputs[1]?.type).toBe('url')

    // 2. Hard-gated unit u2 -> displays both hard & soft reasons, btn-light disabled, btn-force-light enabled
    const gatedUnit = index.nodesById.get('u2')!
    act(() => {
      root.render(
        <StudyDrawer
          node={gatedUnit}
          index={index}
          progress={progress}
          litLeaves={litLeaves}
          focusTimer={{ nodeId: null, remainingSec: 1500, totalSec: 1500, running: false }}
          onClose={vi.fn()}
          onSelectAndFly={vi.fn()}
          onEnterCluster={vi.fn()}
          onLight={vi.fn(async () => {})}
          onUnlight={vi.fn(async () => {})}
          onBatchLightUnit={vi.fn(async () => {})}
          onBatchUnlightUnit={vi.fn(async () => {})}
          onSetStatus={vi.fn(async () => {})}
          onTogglePin={vi.fn()}
          onToggleTag={vi.fn()}
          onToggleExercise={vi.fn()}
          onUpdateNote={vi.fn()}
          onAddCustomResource={onAddCustomResource}
          onRemoveCustomResource={vi.fn()}
          onStartFocus={vi.fn()}
          onPauseFocus={vi.fn()}
          onCompleteFocus={vi.fn()}
          onToast={onToast}
        />
      )
    })
    expect(drawer.textContent).toContain('硬先修理由一')
    expect(drawer.textContent).toContain('软推荐理由二')
    expect((drawer.querySelector('[data-testid="btn-light"]') as HTMLButtonElement).disabled).toBe(true)
    expect((drawer.querySelector('[data-testid="btn-force-light"]') as HTMLButtonElement).disabled).toBe(false)

    // 3. >20-leaf unit u1 -> checklist-tab visible, clicking shows >= 20 items; exercises >= 5
    const richUnit = index.nodesById.get('u1')!
    act(() => {
      root.render(
        <StudyDrawer
          node={richUnit}
          index={index}
          progress={progress}
          litLeaves={litLeaves}
          focusTimer={{ nodeId: null, remainingSec: 1500, totalSec: 1500, running: false }}
          onClose={vi.fn()}
          onSelectAndFly={vi.fn()}
          onEnterCluster={vi.fn()}
          onLight={vi.fn(async () => {})}
          onUnlight={vi.fn(async () => {})}
          onBatchLightUnit={vi.fn(async () => {})}
          onBatchUnlightUnit={vi.fn(async () => {})}
          onSetStatus={vi.fn(async () => {})}
          onTogglePin={vi.fn()}
          onToggleTag={vi.fn()}
          onToggleExercise={vi.fn()}
          onUpdateNote={vi.fn()}
          onAddCustomResource={onAddCustomResource}
          onRemoveCustomResource={vi.fn()}
          onStartFocus={vi.fn()}
          onPauseFocus={vi.fn()}
          onCompleteFocus={vi.fn()}
          onToast={onToast}
        />
      )
    })
    expect(drawer.querySelectorAll('input[type="checkbox"]').length).toBeGreaterThanOrEqual(5)
    const checklistTab = drawer.querySelector('[data-testid="checklist-tab"]') as HTMLButtonElement
    expect(checklistTab).not.toBeNull()
    act(() => {
      checklistTab.click()
    })
    const grid = drawer.querySelector('[data-testid="checklist-grid"]')!
    expect(grid.querySelectorAll('[role="checkbox"]').length).toBe(22)

    // 4. 0-leaf unit u3 -> checklist-tab hidden
    const emptyUnit = index.nodesById.get('u3')!
    act(() => {
      root.render(
        <StudyDrawer
          node={emptyUnit}
          index={index}
          progress={progress}
          litLeaves={litLeaves}
          focusTimer={{ nodeId: null, remainingSec: 1500, totalSec: 1500, running: false }}
          onClose={vi.fn()}
          onSelectAndFly={vi.fn()}
          onEnterCluster={vi.fn()}
          onLight={vi.fn(async () => {})}
          onUnlight={vi.fn(async () => {})}
          onBatchLightUnit={vi.fn(async () => {})}
          onBatchUnlightUnit={vi.fn(async () => {})}
          onSetStatus={vi.fn(async () => {})}
          onTogglePin={vi.fn()}
          onToggleTag={vi.fn()}
          onToggleExercise={vi.fn()}
          onUpdateNote={vi.fn()}
          onAddCustomResource={onAddCustomResource}
          onRemoveCustomResource={vi.fn()}
          onStartFocus={vi.fn()}
          onPauseFocus={vi.fn()}
          onCompleteFocus={vi.fn()}
          onToast={onToast}
        />
      )
    })
    expect(drawer.querySelector('[data-testid="checklist-tab"]')).toBeNull()
  })

  it('FocusTimerWidget resumes from paused remainingSec without resetting to 25:00', () => {
    const onStartFocus = vi.fn()
    act(() => {
      root.render(
        <FocusTimerWidget
          focusTimer={{ nodeId: 'u1', remainingSec: 1498, totalSec: 1500, running: false }}
          targetNodeId="u1"
          targetNodeTitle="极限与连续"
          onStartFocus={onStartFocus}
          onPauseFocus={vi.fn()}
          onCompleteFocus={vi.fn()}
        />
      )
    })

    expect(container.querySelector('[data-testid="focus-remaining"]')?.textContent).toBe('24:58')
    act(() => {
      ;(container.querySelector('[data-testid="btn-start-focus"]') as HTMLButtonElement).click()
    })
    expect(onStartFocus).toHaveBeenCalledWith('u1', 1498 / 60)
  })

  it('ReviewRadarPanel hides grading buttons when dueIds is empty and grades when present', () => {
    const pack = makeRichTestPack()
    const index = buildGraphIndex(pack)
    const progress = emptyPackProgress('test-pack')
    const onGradeReview = vi.fn()

    act(() => {
      root.render(
        <ReviewRadarPanel
          dueIds={[]}
          index={index}
          progress={progress}
          onGradeReview={onGradeReview}
          onSelectAndFly={vi.fn()}
          onClose={vi.fn()}
        />
      )
    })
    expect(container.querySelector('[data-testid="btn-review-remembered"]')).toBeNull()
    expect(container.querySelector('[data-testid="btn-review-forgot"]')).toBeNull()

    act(() => {
      root.render(
        <ReviewRadarPanel
          dueIds={['u1.k0']}
          index={index}
          progress={progress}
          onGradeReview={onGradeReview}
          onSelectAndFly={vi.fn()}
          onClose={vi.fn()}
        />
      )
    })
    act(() => {
      ;(container.querySelector('[data-testid="btn-review-remembered"]') as HTMLButtonElement).click()
    })
    expect(onGradeReview).toHaveBeenCalledWith('u1.k0', true)
  })

  it('GraphEditorPanel preserves positional DOM order and renders cycle-warning-toast on cycle failure', async () => {
    const pack = makeRichTestPack()
    const index = buildGraphIndex(pack)
    const onCreateNode = vi.fn(async () => ({
      ok: true as const,
      data: index.nodesById.get('u1')!
    }))
    const onCreateEdge = vi.fn(async () => ({
      ok: false as const,
      error: '检测到有向环路：u2 -> u1 -> u2'
    }))

    act(() => {
      root.render(
        <GraphEditorPanel
          pack={pack}
          index={index}
          selectedNode={null}
          onCreateNode={onCreateNode}
          onUpdateNode={vi.fn()}
          onDeleteNode={vi.fn()}
          onCreateEdge={onCreateEdge}
          onDeleteEdge={vi.fn()}
          onClose={vi.fn()}
          onToast={vi.fn()}
        />
      )
    })

    const editor = container.querySelector('[data-testid="graph-editor-panel"]')!
    const firstInput = editor.querySelector('input') as HTMLInputElement
    const selects = editor.querySelectorAll('select')
    expect(firstInput).not.toBeNull()
    expect(selects.length).toBeGreaterThanOrEqual(2)
    expect(selects[0]?.querySelector('option[value="u1"]')).not.toBeNull()
    expect(selects[1]?.querySelector('option[value="u2"]')).not.toBeNull()

    // Blank title should not call onCreateNode
    await act(async () => {
      ;(editor.querySelector('[data-testid="btn-new-node"]') as HTMLButtonElement).click()
    })
    expect(onCreateNode).not.toHaveBeenCalled()

    // Clicking btn-new-edge when cycle fails renders cycle-warning-toast
    await act(async () => {
      ;(editor.querySelector('[data-testid="btn-new-edge"]') as HTMLButtonElement).click()
    })
    const warn = editor.querySelector('[data-testid="cycle-warning-toast"]')
    expect(warn?.getAttribute('role')).toBe('alert')
    expect(warn?.textContent).toContain('检测到有向环路')
  })

  it('CommandPalette renders > commands and 0 interactive options on empty search match', () => {
    const pack = makeRichTestPack()
    const onSelectNode = vi.fn()
    const cmdRun = vi.fn()

    act(() => {
      root.render(
        <CommandPalette
          open={true}
          pack={pack}
          progress={null}
          commands={[{ id: 'c1', label: '重置视角', run: cmdRun }]}
          onSelectNode={onSelectNode}
          onClose={vi.fn()}
        />
      )
    })

    const input = container.querySelector('[data-testid="command-input"]') as HTMLInputElement
    const results = container.querySelector('[data-testid="command-results"]')!

    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!

    // Type ">"
    act(() => {
      nativeInputSetter.call(input, '>')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(results.querySelectorAll('button, [role="option"]').length).toBe(1)

    // Type non-matching query
    act(() => {
      nativeInputSetter.call(input, 'zzzz_no_such_node_12345')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(results.querySelectorAll('button, [role="option"]').length).toBe(0)
    expect(results.textContent).toContain('未找到')
  })

  it('FallbackConstellation mounts banner + view and exposes full fallback-2d telemetry', () => {
    const pack = makeRichTestPack()
    const index = buildGraphIndex(pack)
    const galaxyLayout = computeGalaxyLayout(pack, index)
    const nodeStates = new Map<string, NodeVisualState>()
    for (const n of pack.nodes) nodeStates.set(n.id, 'available')

    act(() => {
      root.render(
        <FallbackConstellation
          pack={pack}
          index={index}
          galaxyLayout={galaxyLayout}
          nodeStates={nodeStates}
          viewLevel="galaxy"
          focusClusterId={null}
          selectedId="u1"
          hoveredId={null}
          activeDomains={[]}
          activeLens="all"
          resetToken={0}
          lastBurstAt={0}
          panRequest={null}
          onSelect={vi.fn()}
          onDrillDown={vi.fn()}
          onHover={vi.fn()}
        />
      )
    })

    expect(container.querySelector('[data-testid="fallback-2d-view"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="webgl-fallback-banner"]')).not.toBeNull()

    const tel = (window as unknown as { __LITREE_TELEMETRY__?: LitreeTelemetry })
      .__LITREE_TELEMETRY__
    expect(tel).toBeDefined()
    expect(tel?.ready).toBe(true)
    expect(tel?.rendererMode).toBe('fallback-2d')
    expect(tel?.nodeCount).toBe(pack.nodes.length)
    expect(tel?.selectedId).toBe('u1')
    const projected = tel?.projectNodeToScreen('u1')
    expect(projected).not.toBeNull()
    expect(Number.isFinite(projected?.x)).toBe(true)
    expect(Number.isFinite(projected?.y)).toBe(true)
    expect(tel?.projectNodeToScreen('does-not-exist')).toBeNull()
  })

  it('ConstellationRadar, BackupModal, HelpModal, ToastRegion, and ErrorBoundary render expected controls', () => {
    const pack = makeRichTestPack()
    const index = buildGraphIndex(pack)
    const galaxyLayout = computeGalaxyLayout(pack, index)
    const onRadarClick = vi.fn()

    function ExplodingChild(): null {
      throw new Error('boom')
    }

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    act(() => {
      root.render(
        <ErrorBoundary>
          <ExplodingChild />
        </ErrorBoundary>
      )
    })
    expect(container.querySelector('[data-testid="error-boundary-fallback"]')).not.toBeNull()
    consoleSpy.mockRestore()

    act(() => {
      root.render(
        <>
          <ConstellationRadar
            pack={pack}
            index={index}
            galaxyLayout={galaxyLayout}
            nodeStates={new Map()}
            selectedId={null}
            engine={null}
            drawerOpen={false}
            offsetRightPx={0}
            onRadarClickNormalized={onRadarClick}
          />
          <BackupModal
            open={true}
            activePackId="test-pack"
            onExportBackup={async () => '{}'}
            onExportMarkdown={() => '# log'}
            onImportBackup={async () => ({ ok: false, error: 'bad json' })}
            onResetCuration={async () => {}}
            onClose={vi.fn()}
            onToast={vi.fn()}
          />
          <HelpModal open={true} onClose={vi.fn()} />
          <ToastRegion toasts={[{ id: 't1', text: '提示信息', kind: 'info' }]} onDismiss={vi.fn()} />
        </>
      )
    })

    expect(container.querySelector('[data-testid="constellation-radar"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="radar-viewport"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="backup-modal"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="btn-export-json"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="btn-export-md"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="import-json-input"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="help-modal"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="toast-region"]')?.textContent).toContain('提示信息')
  })

  it('custom-resource-form sets noValidate and submits "not-a-url" and "javascript:alert(1)" via requestSubmit to JS validation + toast', () => {
    const pack = makeRichTestPack()
    const index = buildGraphIndex(pack)
    const progress = emptyPackProgress('test-pack')
    const litLeaves = getLitLeavesSet(progress, index)
    const onAddCustomResource = vi.fn(() => ({
      ok: false as const,
      error: 'Resource URL must start with http:// or https://'
    }))
    const onToast = vi.fn()

    act(() => {
      root.render(
        <StudyDrawer
          node={index.nodesById.get('u1')!}
          index={index}
          progress={progress}
          litLeaves={litLeaves}
          focusTimer={{ nodeId: null, remainingSec: 1500, totalSec: 1500, running: false }}
          onClose={vi.fn()}
          onSelectAndFly={vi.fn()}
          onEnterCluster={vi.fn()}
          onLight={vi.fn(async () => {})}
          onUnlight={vi.fn(async () => {})}
          onBatchLightUnit={vi.fn(async () => {})}
          onBatchUnlightUnit={vi.fn(async () => {})}
          onSetStatus={vi.fn(async () => {})}
          onTogglePin={vi.fn()}
          onToggleTag={vi.fn()}
          onToggleExercise={vi.fn()}
          onUpdateNote={vi.fn()}
          onAddCustomResource={onAddCustomResource}
          onRemoveCustomResource={vi.fn()}
          onStartFocus={vi.fn()}
          onPauseFocus={vi.fn()}
          onCompleteFocus={vi.fn()}
          onToast={onToast}
        />
      )
    })

    const form = container.querySelector('[data-testid="custom-resource-form"]') as HTMLFormElement
    expect(form.noValidate).toBe(true)
    const inputs = form.querySelectorAll('input')
    const titleInput = inputs[0]!
    const urlInput = inputs[1]!
    const nativeSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!

    for (const badUrl of ['not-a-url', 'javascript:alert(1)']) {
      act(() => {
        nativeSetter.call(titleInput, 'Bad Link')
        titleInput.dispatchEvent(new Event('input', { bubbles: true }))
        nativeSetter.call(urlInput, badUrl)
        urlInput.dispatchEvent(new Event('input', { bubbles: true }))
      })
      act(() => {
        form.requestSubmit()
      })
      expect(onAddCustomResource).toHaveBeenLastCalledWith('u1', {
        title: 'Bad Link',
        url: badUrl
      })
      expect(onToast).toHaveBeenLastCalledWith(
        'Resource URL must start with http:// or https://',
        'error'
      )
    }
    expect(onAddCustomResource).toHaveBeenCalledTimes(2)
  })

  it('StudyDrawer inside AnimatePresence keeps a single drawer DOM tree when switching nodes and resets transient state', () => {
    const pack = makeRichTestPack()
    const index = buildGraphIndex(pack)
    const progress = emptyPackProgress('test-pack')
    const litLeaves = getLitLeavesSet(progress, index)

    const renderDrawer = (nodeId: string) => (
      <AnimatePresence>
        <StudyDrawer
          key="study-drawer"
          node={index.nodesById.get(nodeId)!}
          index={index}
          progress={progress}
          litLeaves={litLeaves}
          focusTimer={{ nodeId: null, remainingSec: 1500, totalSec: 1500, running: false }}
          onClose={vi.fn()}
          onSelectAndFly={vi.fn()}
          onEnterCluster={vi.fn()}
          onLight={vi.fn(async () => {})}
          onUnlight={vi.fn(async () => {})}
          onBatchLightUnit={vi.fn(async () => {})}
          onBatchUnlightUnit={vi.fn(async () => {})}
          onSetStatus={vi.fn(async () => {})}
          onTogglePin={vi.fn()}
          onToggleTag={vi.fn()}
          onToggleExercise={vi.fn()}
          onUpdateNote={vi.fn()}
          onAddCustomResource={vi.fn(() => ({ ok: false as const, error: 'err' }))}
          onRemoveCustomResource={vi.fn()}
          onStartFocus={vi.fn()}
          onPauseFocus={vi.fn()}
          onCompleteFocus={vi.fn()}
          onToast={vi.fn()}
        />
      </AnimatePresence>
    )

    act(() => {
      root.render(renderDrawer('u1'))
    })
    // Open checklist tab & type into custom resource inputs
    act(() => {
      ;(container.querySelector('[data-testid="checklist-tab"]') as HTMLButtonElement).click()
    })
    expect(container.querySelector('[data-testid="checklist-grid"]')).not.toBeNull()

    // Switch node u1 -> u2 (in-place update, strictly 1 study-drawer & 1 drawer-title)
    act(() => {
      root.render(renderDrawer('u2'))
    })
    expect(container.querySelectorAll('[data-testid="study-drawer"]').length).toBe(1)
    expect(container.querySelectorAll('[data-testid="drawer-title"]').length).toBe(1)
    expect(container.querySelector('[data-testid="drawer-title"]')?.textContent).toBe('微积分进阶')
    expect(container.querySelector('[data-testid="checklist-grid"]')).toBeNull()
  })

  it('FocusTimerWidget allows resuming in the final minute (< 60s)', () => {
    const onStartFocus = vi.fn()
    act(() => {
      root.render(
        <FocusTimerWidget
          focusTimer={{ nodeId: 'u1', remainingSec: 45, totalSec: 1500, running: false }}
          targetNodeId="u1"
          targetNodeTitle="极限与连续"
          onStartFocus={onStartFocus}
          onPauseFocus={vi.fn()}
          onCompleteFocus={vi.fn()}
        />
      )
    })

    const btn = container.querySelector('[data-testid="btn-start-focus"]') as HTMLButtonElement
    expect(btn.textContent).toContain('继续')
    expect(container.querySelector('[data-testid="focus-remaining"]')?.textContent).toBe('00:45')
    act(() => {
      btn.click()
    })
    expect(onStartFocus).toHaveBeenCalledWith('u1', 45 / 60)
  })

  it('FallbackConstellation applies route/bookmarked lenses, daylight colors, and deduplicates onHover', () => {
    const pack = makeRichTestPack()
    const index = buildGraphIndex(pack)
    const galaxyLayout = computeGalaxyLayout(pack, index)
    const nodeStates = new Map<string, NodeVisualState>()
    for (const n of pack.nodes) nodeStates.set(n.id, 'available')

    const fillTextCalls: Array<{ text: string; fillStyle: unknown }> = []
    const strokeCalls: Array<{ strokeStyle: unknown }> = []
    const alphaByArc: number[] = []
    const origGetContext = HTMLCanvasElement.prototype.getContext
    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(() => {
        alphaByArc.push(mockCtx.globalAlpha)
      }),
      fill: vi.fn(),
      stroke: vi.fn(() => {
        strokeCalls.push({ strokeStyle: mockCtx.strokeStyle })
      }),
      fillText: vi.fn((text: string) => {
        fillTextCalls.push({ text, fillStyle: mockCtx.fillStyle })
      }),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: ''
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () => mockCtx as unknown as ReturnType<typeof origGetContext>
    )

    const onHover = vi.fn()
    act(() => {
      root.render(
        <FallbackConstellation
          pack={pack}
          index={index}
          galaxyLayout={galaxyLayout}
          nodeStates={nodeStates}
          viewLevel="galaxy"
          focusClusterId={null}
          selectedId="u2"
          hoveredId={null}
          activeDomains={[]}
          activeLens="route"
          activeRouteUnitIds={['u1']}
          bookmarkedIds={new Set(['u2'])}
          theme="daylight"
          resetToken={0}
          lastBurstAt={0}
          panRequest={null}
          onSelect={vi.fn()}
          onDrillDown={vi.fn()}
          onHover={onHover}
        />
      )
    })

    // Daylight theme uses dark text and #0284c7 selection ring
    expect(fillTextCalls.some((c) => c.fillStyle === 'rgba(15, 23, 42, 0.92)')).toBe(true)
    expect(strokeCalls.some((c) => c.strokeStyle === '#0284c7')).toBe(true)
    // Route lens renders u1/leaves at 0.92 and non-route non-selected nodes at 0.14
    expect(alphaByArc).toContain(0.92)
    expect(alphaByArc).toContain(0.14)

    // Bookmarked lens highlights bookmarked node u2
    alphaByArc.length = 0
    act(() => {
      root.render(
        <FallbackConstellation
          pack={pack}
          index={index}
          galaxyLayout={galaxyLayout}
          nodeStates={nodeStates}
          viewLevel="galaxy"
          focusClusterId={null}
          selectedId={null}
          hoveredId={null}
          activeDomains={[]}
          activeLens="bookmarked"
          activeRouteUnitIds={['u1']}
          bookmarkedIds={new Set(['u2'])}
          theme="daylight"
          resetToken={0}
          lastBurstAt={0}
          panRequest={null}
          onSelect={vi.fn()}
          onDrillDown={vi.fn()}
          onHover={onHover}
        />
      )
    })
    expect(alphaByArc.filter((a) => a === 0.92).length).toBe(1)
    expect(alphaByArc).toContain(0.14)

    // Deduplicate onHover across repeated pointermove over the same node
    const tel = (window as unknown as { __LITREE_TELEMETRY__?: LitreeTelemetry })
      .__LITREE_TELEMETRY__
    const pU1 = tel?.projectNodeToScreen('u1')
    expect(pU1).not.toBeNull()
    const viewEl = container.querySelector('[data-testid="fallback-2d-view"]')!
    vi.spyOn(viewEl, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 1280,
      bottom: 800,
      width: 1280,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({})
    })
    act(() => {
      viewEl.dispatchEvent(
        new PointerEvent('pointermove', { clientX: pU1!.x, clientY: pU1!.y, bubbles: true })
      )
      viewEl.dispatchEvent(
        new PointerEvent('pointermove', { clientX: pU1!.x, clientY: pU1!.y, bubbles: true })
      )
    })
    expect(onHover).toHaveBeenCalledTimes(1)
    expect(onHover).toHaveBeenCalledWith('u1')

    // Re-render with hoveredId='u1' renders the 2D Hover Quick Info Card and label-pill click selects node
    const onSelect = vi.fn()
    act(() => {
      root.render(
        <FallbackConstellation
          pack={pack}
          index={index}
          galaxyLayout={galaxyLayout}
          nodeStates={nodeStates}
          viewLevel="galaxy"
          focusClusterId={null}
          selectedId={null}
          hoveredId="u1"
          activeDomains={[]}
          activeLens="all"
          activeRouteUnitIds={['u1']}
          bookmarkedIds={new Set(['u2'])}
          theme="daylight"
          showWebglFallbackBanner={false}
          resetToken={0}
          lastBurstAt={0}
          panRequest={null}
          onSelect={onSelect}
          onDrillDown={vi.fn()}
          onHover={onHover}
        />
      )
    })
    act(() => {
      viewEl.dispatchEvent(
        new PointerEvent('pointermove', { clientX: pU1!.x, clientY: pU1!.y, bubbles: true })
      )
    })
    const hoverCard = container.querySelector('[data-testid="node-hover-card"]')
    expect(hoverCard).not.toBeNull()
    expect(hoverCard?.textContent).toContain('极限与连续')
    expect(container.querySelector('[data-testid="webgl-fallback-banner"]')).toBeNull()

    // Clicking inside rendered label pill box right of circle center still hits u1
    act(() => {
      viewEl.dispatchEvent(
        new PointerEvent('pointerdown', { clientX: pU1!.x + 28, clientY: pU1!.y, bubbles: true })
      )
      viewEl.dispatchEvent(
        new PointerEvent('pointerup', { clientX: pU1!.x + 28, clientY: pU1!.y, bubbles: true })
      )
    })
    expect(onSelect).toHaveBeenCalledWith('u1')

    vi.restoreAllMocks()
  })
})
