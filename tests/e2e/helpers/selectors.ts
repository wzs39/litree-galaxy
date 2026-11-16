import type { Locator, Page } from '@playwright/test'

export const TEST_IDS = {
  // Canvas / Fallback
  nebulaCanvas: 'nebula-canvas',
  fallback2dView: 'fallback-2d-view',
  webglFallbackBanner: 'webgl-fallback-banner',

  // Top Bar
  topbar: 'topbar',
  packSwitcher: 'pack-switcher',
  packOption: (id: string) => `pack-option-${id}`,
  searchTrigger: 'search-trigger',
  editModeToggle: 'edit-mode-toggle',
  themeSwitcher: 'theme-switcher',
  qualitySwitcher: 'quality-switcher',
  backupTrigger: 'backup-trigger',
  helpTrigger: 'help-trigger',
  resetViewBtn: 'reset-view-btn',
  domainChip: (id: string) => `domain-chip-${id}`,
  lensPill: (lens: 'all' | 'actionable' | 'core' | 'route' | 'review_due' | 'bookmarked') =>
    `lens-pill-${lens}`,

  // Today's Orbit HUD
  todayOrbitHud: 'today-orbit-hud',
  todayOrbitToggle: 'today-orbit-toggle',
  continueOrbitBtn: 'continue-orbit-btn',
  dueReviewCount: 'due-review-count',
  startReviewBtn: 'start-review-btn',
  streakBadge: 'streak-badge',
  xpBadge: 'xp-badge',

  // Study Drawer / Bottom Sheet
  studyDrawer: 'study-drawer',
  drawerTitle: 'drawer-title',
  drawerClose: 'drawer-close',
  btnLight: 'btn-light',
  btnUnlight: 'btn-unlight',
  btnForceLight: 'btn-force-light',
  btnQueue: 'btn-queue',
  btnLearning: 'btn-learning',
  btnPin: 'btn-pin',
  noteEditor: 'note-editor',
  customResourceForm: 'custom-resource-form',
  pathtracePanel: 'pathtrace-panel',
  checklistTab: 'checklist-tab',
  checklistGrid: 'checklist-grid',

  // Focus Timer
  focusTimerWidget: 'focus-timer-widget',
  btnStartFocus: 'btn-start-focus',
  btnPauseFocus: 'btn-pause-focus',
  focusRemaining: 'focus-remaining',

  // Review Radar
  reviewRadarPanel: 'review-radar-panel',
  btnReviewRemembered: 'btn-review-remembered',
  btnReviewForgot: 'btn-review-forgot',

  // Live Graph Editor (E)
  graphEditorPanel: 'graph-editor-panel',
  btnNewNode: 'btn-new-node',
  btnNewEdge: 'btn-new-edge',
  cycleWarningToast: 'cycle-warning-toast',

  // Command Palette
  commandPalette: 'command-palette',
  commandInput: 'command-input',
  commandResults: 'command-results',

  // Constellation Radar (Minimap)
  constellationRadar: 'constellation-radar',
  radarViewport: 'radar-viewport',

  // Backup & Help Modals
  backupModal: 'backup-modal',
  btnExportJson: 'btn-export-json',
  btnExportMd: 'btn-export-md',
  importJsonInput: 'import-json-input',
  helpModal: 'help-modal',
  toastRegion: 'toast-region'
} as const

export function tid(id: string): string {
  return `[data-testid="${id}"]`
}

export function byTestId(page: Page, id: string): Locator {
  return page.getByTestId(id)
}
