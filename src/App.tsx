import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { computeNodeVisualState, getLitLeavesSet, pickNextActionable } from './core/graph'
import { computePathTrace } from './core/pathTrace'
import { getActiveStreak, getDueReviewNodeIds } from './core/progress'
import { appStore, useAppStore } from './core/store'
import type { NebulaVisualSnapshot, NodeVisualState } from './core/types'
import { detectWebGL, NebulaEngine } from './engine/NebulaEngine'
import { computeGalaxyLayout } from './layout/galaxyLayout'
import { computeSemantic2DLayout } from './layout/semantic2dLayout'
import { BackupModal } from './ui/BackupModal'
import { CommandPalette, type PaletteCommand } from './ui/CommandPalette'
import { ConstellationRadar } from './ui/ConstellationRadar'
import { FallbackConstellation } from './ui/FallbackConstellation'
import { GraphEditorPanel } from './ui/GraphEditorPanel'
import { HelpModal } from './ui/HelpModal'
import { NodeActionMenu } from './ui/NodeActionMenu'
import { ReviewRadarPanel } from './ui/ReviewRadarPanel'
import { StudyDrawer } from './ui/StudyDrawer'
import { ToastRegion, type ToastMessage } from './ui/ToastRegion'
import { TodayOrbitHud } from './ui/TodayOrbitHud'
import { TopBar } from './ui/TopBar'
import { isEditableElement } from './ui/utils'

export function App() {
  const packs = useAppStore((s) => s.packs)
  const activePackId = useAppStore((s) => s.activePackId)
  const pack = useAppStore((s) => s.pack)
  const progress = useAppStore((s) => s.progress)
  const index = useAppStore((s) => s.index)
  const loading = useAppStore((s) => s.loading)
  const error = useAppStore((s) => s.error)
  const lastNotice = useAppStore((s) => s.lastNotice)

  const viewLevel = useAppStore((s) => s.viewLevel)
  const focusClusterId = useAppStore((s) => s.focusClusterId)
  const clusterStack = useAppStore((s) => s.clusterStack)
  const selectedId = useAppStore((s) => s.selectedId)
  const hoveredId = useAppStore((s) => s.hoveredId)
  const activeDomains = useAppStore((s) => s.activeDomains)
  const activeLens = useAppStore((s) => s.activeLens)
  const activeRouteId = useAppStore((s) => s.activeRouteId)
  const editMode = useAppStore((s) => s.editMode)
  const cycleConflictEdgeIds = useAppStore((s) => s.cycleConflictEdgeIds)
  const theme = useAppStore((s) => s.theme)
  const quality = useAppStore((s) => s.quality)
  const focusTimer = useAppStore((s) => s.focusTimer)

  const init = useAppStore((s) => s.init)
  const switchPack = useAppStore((s) => s.switchPack)
  const selectNode = useAppStore((s) => s.selectNode)
  const hoverNode = useAppStore((s) => s.hoverNode)
  const enterCluster = useAppStore((s) => s.enterCluster)
  const stepBack = useAppStore((s) => s.stepBack)
  const lightNode = useAppStore((s) => s.lightNode)
  const unlightNode = useAppStore((s) => s.unlightNode)
  const setNodeStatus = useAppStore((s) => s.setNodeStatus)
  const batchLightUnit = useAppStore((s) => s.batchLightUnit)
  const batchUnlightUnit = useAppStore((s) => s.batchUnlightUnit)
  const updateNote = useAppStore((s) => s.updateNote)
  const addCustomResource = useAppStore((s) => s.addCustomResource)
  const removeCustomResource = useAppStore((s) => s.removeCustomResource)
  const toggleTag = useAppStore((s) => s.toggleTag)
  const togglePin = useAppStore((s) => s.togglePin)
  const toggleExercise = useAppStore((s) => s.toggleExercise)
  const gradeReview = useAppStore((s) => s.gradeReview)
  const startFocus = useAppStore((s) => s.startFocus)
  const pauseFocus = useAppStore((s) => s.pauseFocus)
  const completeFocusSession = useAppStore((s) => s.completeFocusSession)
  const createNode = useAppStore((s) => s.createNode)
  const updateNode = useAppStore((s) => s.updateNode)
  const deleteNode = useAppStore((s) => s.deleteNode)
  const createEdge = useAppStore((s) => s.createEdge)
  const deleteEdge = useAppStore((s) => s.deleteEdge)
  const exportBackup = useAppStore((s) => s.exportBackup)
  const importBackup = useAppStore((s) => s.importBackup)
  const exportMarkdownJournal = useAppStore((s) => s.exportMarkdownJournal)
  const resetCuration = useAppStore((s) => s.resetCuration)
  const setActiveDomains = useAppStore((s) => s.setActiveDomains)
  const setActiveLens = useAppStore((s) => s.setActiveLens)
  const setActiveRouteId = useAppStore((s) => s.setActiveRouteId)
  const setEditMode = useAppStore((s) => s.setEditMode)
  const setTheme = useAppStore((s) => s.setTheme)
  const setQuality = useAppStore((s) => s.setQuality)

  const [paletteOpen, setPaletteOpen] = useState(false)
  const [backupOpen, setBackupOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isolateSubgraph, setIsolateSubgraph] = useState(false)
  const [selectedAnchor, setSelectedAnchor] = useState<{ x: number; y: number } | null>(null)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  )
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [renderMode, setRenderMode] = useState<'2d' | '3d'>('2d')
  const [webglUnavailableBanner, setWebglUnavailableBanner] = useState(false)
  const [engineInstance, setEngineInstance] = useState<NebulaEngine | null>(null)
  const [fallbackResetToken, setFallbackResetToken] = useState(0)
  const [fallbackPanReq, setFallbackPanReq] = useState<{
    nx: number
    ny: number
    zoomMul?: number
    seq: number
  } | null>(null)
  const [viewportNorm, setViewportNorm] = useState<{
    minX: number
    minY: number
    maxX: number
    maxY: number
  } | null>(null)
  const [lastBurstAt, setLastBurstAt] = useState(0)

  const canvasHostRef = useRef<HTMLDivElement | null>(null)
  const topbarRef = useRef<HTMLElement | null>(null)
  const engineRef = useRef<NebulaEngine | null>(null)
  const prevPackIdRef = useRef<string | null>(null)
  const toastCounterRef = useRef(0)
  const toastTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const pushToast = useCallback((text: string, kind: 'info' | 'error' = 'info') => {
    if (!text) return
    const id = `toast-${Date.now()}-${++toastCounterRef.current}`
    setToasts((prev) => {
      const next = prev.filter((t) => t.text !== text).slice(-3)
      return [...next, { id, text, kind }]
    })
    const timer = setTimeout(() => {
      toastTimersRef.current.delete(id)
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
    toastTimersRef.current.set(id, timer)
  }, [])

  const dismissToast = useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      toastTimersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    const timers = toastTimersRef.current
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer)
      }
      timers.clear()
    }
  }, [])

  // Track mobile viewport (<= 768px) so StudyDrawer yields to ReviewRadarPanel on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return
    const updateMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    updateMobile()
    window.addEventListener('resize', updateMobile)
    const mq =
      typeof window.matchMedia === 'function' ? window.matchMedia('(max-width: 768px)') : null
    mq?.addEventListener('change', updateMobile)
    return () => {
      window.removeEventListener('resize', updateMobile)
      mq?.removeEventListener('change', updateMobile)
    }
  }, [])

  // Init store & flush debounced saves on page unload
  useEffect(() => {
    void init()
    const handleFlush = () => {
      void appStore.getState().flushSave()
    }
    window.addEventListener('beforeunload', handleFlush)
    window.addEventListener('pagehide', handleFlush)
    return () => {
      window.removeEventListener('beforeunload', handleFlush)
      window.removeEventListener('pagehide', handleFlush)
    }
  }, [init])

  // Sync theme attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Dynamically expose topbar height so responsive bottom-sheets never overlap topbar
  useEffect(() => {
    const el = topbarRef.current
    if (!el) return
    const updateTopbarVar = () => {
      const rect = el.getBoundingClientRect()
      if (rect.height > 0) {
        document.documentElement.style.setProperty(
          '--topbar-h',
          `${Math.ceil(rect.bottom)}px`
        )
      }
    }
    updateTopbarVar()
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateTopbarVar)
      ro.observe(el)
      return () => ro.disconnect()
    }
    window.addEventListener('resize', updateTopbarVar)
    return () => window.removeEventListener('resize', updateTopbarVar)
  }, [pack?.id, activeDomains.length])

  // Surface store error / lastNotice into toast-region
  useEffect(() => {
    if (error) pushToast(error, 'error')
  }, [error, pushToast])

  useEffect(() => {
    if (lastNotice) pushToast(lastNotice, 'info')
  }, [lastNotice, pushToast])

  // Memoized layout & derived study state
  const galaxyLayout = useMemo(
    () => (pack && index ? computeGalaxyLayout(pack, index) : null),
    [pack, index]
  )

  const semanticLayout = useMemo(
    () =>
      pack && index
        ? computeSemantic2DLayout(pack, index, {
            focusClusterId: viewLevel !== 'galaxy' ? focusClusterId : null
          })
        : null,
    [pack, index, viewLevel, focusClusterId]
  )

  const litLeaves = useMemo(
    () => (progress && index ? getLitLeavesSet(progress, index) : new Set<string>()),
    [progress, index]
  )

  const dueReviewIds = useMemo(
    () => (progress && index ? getDueReviewNodeIds(progress, index) : []),
    [progress, index]
  )

  const activeStreak = useMemo(
    () => (progress ? getActiveStreak(progress) : 0),
    [progress]
  )

  const nodeStates = useMemo(() => {
    const map = new Map<string, NodeVisualState>()
    if (!pack || !index) return map
    const nowMs = Date.now()
    for (const node of pack.nodes) {
      map.set(node.id, computeNodeVisualState(node.id, index, progress, litLeaves, nowMs))
    }
    return map
  }, [pack, index, progress, litLeaves])

  const bookmarkedIds = useMemo(() => {
    const set = new Set<string>()
    if (!progress) return set
    for (const [id, entry] of Object.entries(progress.nodes)) {
      if (
        entry.pinned ||
        (entry.tags && entry.tags.length > 0) ||
        (entry.noteMarkdown && entry.noteMarkdown.length > 0) ||
        (entry.customResources && entry.customResources.length > 0)
      ) {
        set.add(id)
      }
    }
    return set
  }, [progress])

  const activeRouteUnitIds = useMemo(() => {
    if (!pack || pack.routes.length === 0) return [] as string[]
    const route =
      (activeRouteId ? pack.routes.find((r) => r.id === activeRouteId) : undefined) ??
      pack.routes[0]
    return route?.ids ?? []
  }, [pack, activeRouteId])

  const pathTraceHighlight = useMemo(() => {
    if (!selectedId || !index) return null
    const trace = computePathTrace(selectedId, index, litLeaves, {
      maxSteps: 24,
      includeSoft: true
    })
    return {
      nodeIds: trace.chain.map((c) => c.unitId),
      edgeIds: trace.edges.map((e) => e.edgeId)
    }
  }, [selectedId, index, litLeaves])

  const visualSnapshot: NebulaVisualSnapshot = useMemo(
    () => ({
      nodeStates,
      selectedId,
      hoveredId,
      activeDomains,
      activeLens,
      activeRouteUnitIds,
      pathTraceHighlight,
      focusTimerNodeId: focusTimer.nodeId,
      cycleConflictEdgeIds,
      bookmarkedIds
    }),
    [
      nodeStates,
      selectedId,
      hoveredId,
      activeDomains,
      activeLens,
      activeRouteUnitIds,
      pathTraceHighlight,
      focusTimer.nodeId,
      cycleConflictEdgeIds,
      bookmarkedIds
    ]
  )

  const getDesktopDrawerOffset = useCallback(() => {
    if (typeof window === 'undefined') return 0
    return window.innerWidth > 768 ? 420 : 0
  }, [])

  const selectAndFly = useCallback(
    (nodeId: string) => {
      selectNode(nodeId)
      setDrawerOpen(true)
      const offset = window.innerWidth > 768 ? 420 : 0
      if (engineRef.current) {
        engineRef.current.flyToNode(nodeId, { offsetRightPx: offset })
      } else if (semanticLayout) {
        const n2d = semanticLayout.nodes.get(nodeId)
        if (n2d) {
          setFallbackPanReq((prev) => ({
            nx: n2d.nx,
            ny: n2d.ny,
            zoomMul: n2d.kind === 'leaf' ? 2.6 : 1.75,
            seq: (prev?.seq ?? 0) + 1
          }))
        }
      } else if (galaxyLayout) {
        const n2d = galaxyLayout.projected2D.get(nodeId)
        if (n2d) {
          setFallbackPanReq((prev) => ({ nx: n2d[0], ny: n2d[1], seq: (prev?.seq ?? 0) + 1 }))
        }
      }
    },
    [selectNode, semanticLayout, galaxyLayout]
  )

  // Mount & dispose WebGL NebulaEngine only when user switches to 3D experimental mode
  useEffect(() => {
    if (renderMode !== '3d') return
    const host = canvasHostRef.current
    if (!host) return

    const webgl = detectWebGL()
    if (!webgl.supported) {
      setWebglUnavailableBanner(true)
      setRenderMode('2d')
      return
    }

    let lostSynchronously = false
    const engine = new NebulaEngine(
      host,
      {
        onSelect: (id) => {
          appStore.getState().selectNode(id)
          if (id) {
            engineRef.current?.flyToNode(id, {
              offsetRightPx: window.innerWidth > 768 ? 420 : 0
            })
          }
        },
        onDrillDown: (id) => {
          const st = appStore.getState()
          const node = st.index?.nodesById.get(id)
          if (node && node.kind !== 'leaf') {
            st.enterCluster(id)
          }
          engineRef.current?.flyToNode(id, {
            offsetRightPx: st.selectedId && window.innerWidth > 768 ? 420 : 0
          })
        },
        onHover: (id) => {
          appStore.getState().hoverNode(id)
        },
        onContextLost: () => {
          lostSynchronously = true
          setWebglUnavailableBanner(true)
          setRenderMode('2d')
        }
      },
      { theme: appStore.getState().theme, quality: appStore.getState().quality }
    )

    if (lostSynchronously) {
      engine.dispose()
      engineRef.current = null
      setEngineInstance(null)
      setWebglUnavailableBanner(true)
      setRenderMode('2d')
      return
    }

    engineRef.current = engine
    setEngineInstance(engine)

    return () => {
      engine.dispose()
      if (engineRef.current === engine) {
        engineRef.current = null
      }
      setEngineInstance(null)
    }
  }, [renderMode])

  // Sync pack & layout to NebulaEngine
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !pack || !index || !galaxyLayout) return
    engine.setGraph(pack, galaxyLayout, index)
    if (prevPackIdRef.current !== null && prevPackIdRef.current !== pack.id) {
      engine.resetView(true)
    }
    prevPackIdRef.current = pack.id
  }, [pack, index, galaxyLayout, engineInstance])

  // Sync viewLevel & focusClusterId
  useEffect(() => {
    engineRef.current?.setViewContext(viewLevel, focusClusterId)
  }, [viewLevel, focusClusterId, engineInstance])

  // Sync theme & quality
  useEffect(() => {
    engineRef.current?.setTheme(theme)
  }, [theme, engineInstance])

  useEffect(() => {
    engineRef.current?.setQuality(quality)
  }, [quality, engineInstance])

  // Sync visual snapshot
  useEffect(() => {
    engineRef.current?.updateVisualState(visualSnapshot)
  }, [visualSnapshot, engineInstance])

  // Sync focus timer orbit pause/resume
  useEffect(() => {
    if (focusTimer.nodeId !== null) {
      engineRef.current?.setOrbitPaused(!focusTimer.running)
    }
  }, [focusTimer.nodeId, focusTimer.running, engineInstance])

  // Drive focus countdown
  useEffect(() => {
    if (!focusTimer.running) return
    const timer = window.setInterval(() => {
      appStore.getState().tickFocus(1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [focusTimer.running])

  // Auto-complete focus session when countdown reaches 0
  useEffect(() => {
    if (focusTimer.nodeId && focusTimer.remainingSec === 0) {
      void completeFocusSession().then(() => {
        pushToast('伴星专注完成！已记录学习时长 (+2 XP)', 'info')
      })
    }
  }, [focusTimer.nodeId, focusTimer.remainingSec, completeFocusSession, pushToast])

  // Clear secondary menu / drawer states when selection clears
  useEffect(() => {
    if (selectedId === null) {
      setDrawerOpen(false)
      setIsolateSubgraph(false)
      setSelectedAnchor(null)
    }
  }, [selectedId])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((open) => !open)
        return
      }

      if (e.key === 'Escape') {
        if (helpOpen) {
          setHelpOpen(false)
        } else if (backupOpen) {
          setBackupOpen(false)
        } else if (paletteOpen) {
          setPaletteOpen(false)
        } else if (reviewOpen) {
          setReviewOpen(false)
        } else if (drawerOpen) {
          setDrawerOpen(false)
        } else if (selectedId !== null) {
          selectNode(null)
        }
        return
      }

      if (isEditableElement(e.target)) return

      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setPaletteOpen(true)
        return
      }

      if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setEditMode(!appStore.getState().editMode)
        return
      }

      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setHelpOpen((open) => !open)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [helpOpen, backupOpen, paletteOpen, reviewOpen, drawerOpen, selectedId, selectNode, setEditMode])

  const handleResetView = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resetView(false)
    } else {
      setFallbackResetToken((n) => n + 1)
    }
  }, [])

  const handleContinueOrbit = useCallback(() => {
    if (!index || !pack) return
    const next = pickNextActionable(index, progress, {
      activeRouteId,
      activeDomains
    })
    if (next) {
      selectAndFly(next.id)
      return
    }
    // All nodes lit: smoothly fly to first unit or overview
    const firstUnit = pack.nodes.find((n) => n.kind === 'unit') ?? pack.nodes[0]
    if (firstUnit && engineRef.current) {
      engineRef.current.flyToNode(firstUnit.id, {
        offsetRightPx: selectedId ? getDesktopDrawerOffset() : 0
      })
      engineRef.current.cameraRig.setFocusOrbit(true, 0.55)
    } else if (firstUnit && semanticLayout) {
      const p2d = semanticLayout.nodes.get(firstUnit.id)
      if (p2d) {
        setFallbackPanReq((prev) => ({
          nx: p2d.nx,
          ny: p2d.ny,
          zoomMul: 1.75,
          seq: (prev?.seq ?? 0) + 1
        }))
      }
    } else if (firstUnit && galaxyLayout) {
      const p2d = galaxyLayout.projected2D.get(firstUnit.id)
      if (p2d) {
        setFallbackPanReq((prev) => ({ nx: p2d[0], ny: p2d[1], seq: (prev?.seq ?? 0) + 1 }))
      }
    } else {
      handleResetView()
    }
    pushToast('当前范围知识已全部点亮，正在全景轨道巡航', 'info')
  }, [
    index,
    pack,
    progress,
    activeRouteId,
    activeDomains,
    selectedId,
    semanticLayout,
    galaxyLayout,
    selectAndFly,
    getDesktopDrawerOffset,
    handleResetView,
    pushToast
  ])

  const handleLight = useCallback(
    async (nodeId: string, force = false) => {
      try {
        const res = await lightNode(nodeId, { force })
        if (engineRef.current) {
          engineRef.current.triggerLightUpBurst(nodeId, res.unlockedIds)
        }
        setLastBurstAt(Date.now())
      } catch (err) {
        pushToast(err instanceof Error ? err.message : '无法点亮该节点', 'error')
      }
    },
    [lightNode, pushToast]
  )

  const handleBatchLightUnit = useCallback(
    async (unitId: string, force = false) => {
      try {
        const res = await batchLightUnit(unitId, force)
        if (engineRef.current) {
          engineRef.current.triggerLightUpBurst(unitId, res.unlockedIds)
        }
        setLastBurstAt(Date.now())
      } catch (err) {
        pushToast(err instanceof Error ? err.message : '批量点亮失败', 'error')
      }
    },
    [batchLightUnit, pushToast]
  )

  const handleSetStatus = useCallback(
    async (nodeId: string, status: Parameters<typeof setNodeStatus>[1]) => {
      try {
        await setNodeStatus(nodeId, status)
      } catch (err) {
        pushToast(err instanceof Error ? err.message : '状态切换失败', 'error')
      }
    },
    [setNodeStatus, pushToast]
  )

  const handleStartFocus = useCallback(
    (nodeId: string, minutes: number) => {
      const ft = appStore.getState().focusTimer
      if (
        !ft.running &&
        ft.nodeId === nodeId &&
        ft.remainingSec > 0 &&
        ft.remainingSec < ft.totalSec
      ) {
        appStore.setState((s) => ({
          focusTimer: {
            ...s.focusTimer,
            running: true
          }
        }))
        return
      }
      startFocus(nodeId, minutes)
    },
    [startFocus]
  )

  const handleToggleDomain = useCallback(
    (domainId: string) => {
      if (activeDomains.includes(domainId)) {
        setActiveDomains(activeDomains.filter((d) => d !== domainId))
      } else {
        setActiveDomains([...activeDomains, domainId])
      }
    },
    [activeDomains, setActiveDomains]
  )

  const handleResetToGalaxy = useCallback(() => {
    while (appStore.getState().viewLevel !== 'galaxy') {
      appStore.getState().stepBack()
    }
    handleResetView()
  }, [handleResetView])

  const handleToggleRenderMode = useCallback(() => {
    if (renderMode === '2d') {
      const webgl = detectWebGL()
      if (!webgl.supported) {
        setWebglUnavailableBanner(true)
        pushToast('当前浏览器未开启 WebGL2，保持在 2D 平面星图视图', 'info')
        return
      }
      setWebglUnavailableBanner(false)
      setRenderMode('3d')
    } else {
      setRenderMode('2d')
    }
  }, [renderMode, pushToast])

  const paletteCommands: PaletteCommand[] = useMemo(
    () => [
      { id: 'cmd-reset', label: '重置星云视角', hint: 'View', run: handleResetView },
      {
        id: 'cmd-toggle-3d',
        label: renderMode === '3d' ? '切换回 2D 平面星图视图' : '切换到 3D 实验星云视图',
        hint: '2D/3D',
        run: handleToggleRenderMode
      },
      {
        id: 'cmd-orbit',
        label: '继续今日轨道巡航',
        hint: 'Orbit',
        run: handleContinueOrbit
      },
      {
        id: 'cmd-edit',
        label: editMode ? '关闭图谱编辑器' : '打开图谱编辑器',
        hint: 'E',
        run: () => setEditMode(!editMode)
      },
      {
        id: 'cmd-review',
        label: '打开间隔复习雷达',
        hint: 'Review',
        run: () => setReviewOpen(true)
      },
      {
        id: 'cmd-backup',
        label: '打开备份与导出弹窗',
        hint: 'Backup',
        run: () => setBackupOpen(true)
      },
      {
        id: 'cmd-theme-nebula',
        label: '切换主题：深空星云 Nebula',
        hint: 'Theme',
        run: () => setTheme('nebula')
      },
      {
        id: 'cmd-theme-daylight',
        label: '切换主题：日光实验室 Daylight',
        hint: 'Theme',
        run: () => setTheme('daylight')
      },
      {
        id: 'cmd-theme-minimal',
        label: '切换主题：极简专注 Minimal',
        hint: 'Theme',
        run: () => setTheme('minimal')
      },
      { id: 'cmd-help', label: '查看快捷键与帮助', hint: '?', run: () => setHelpOpen(true) }
    ],
    [handleResetView, handleToggleRenderMode, renderMode, handleContinueOrbit, editMode, setEditMode, setTheme]
  )

  const selectedNode = useMemo(
    () => (selectedId && index ? index.nodesById.get(selectedId) ?? null : null),
    [selectedId, index]
  )

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-viewport" data-testid="app-shell">
        {renderMode === '3d' ? (
          <div ref={canvasHostRef} className="canvas-stage" />
        ) : pack && index && galaxyLayout ? (
          <FallbackConstellation
            pack={pack}
            index={index}
            galaxyLayout={galaxyLayout}
            semanticLayout={semanticLayout}
            nodeStates={nodeStates}
            viewLevel={viewLevel}
            focusClusterId={focusClusterId}
            selectedId={selectedId}
            hoveredId={hoveredId}
            activeDomains={activeDomains}
            activeLens={activeLens}
            activeRouteUnitIds={activeRouteUnitIds}
            pathTraceHighlight={pathTraceHighlight}
            bookmarkedIds={bookmarkedIds}
            theme={theme}
            quality={quality}
            resetToken={fallbackResetToken}
            lastBurstAt={lastBurstAt}
            panRequest={fallbackPanReq}
            desktopDrawerOpen={drawerOpen && selectedNode !== null}
            isolateSubgraph={isolateSubgraph}
            showWebglFallbackBanner={webglUnavailableBanner}
            onSelect={(id) => {
              selectNode(id)
              if (id && semanticLayout) {
                const n2d = semanticLayout.nodes.get(id)
                if (n2d) {
                  setFallbackPanReq((prev) => ({
                    nx: n2d.nx,
                    ny: n2d.ny,
                    zoomMul: n2d.kind === 'leaf' ? 2.4 : 1.5,
                    seq: (prev?.seq ?? 0) + 1
                  }))
                }
              }
            }}
            onDrillDown={(id) => {
              const node = index.nodesById.get(id)
              if (!node) return
              if (node.kind !== 'leaf') {
                enterCluster(id)
              } else {
                selectNode(id)
                setDrawerOpen(true)
              }
            }}
            onHover={hoverNode}
            onViewportChange={setViewportNorm}
            onSelectedAnchorChange={setSelectedAnchor}
          />
        ) : (
          <div className="fallback-2d-view" data-testid="fallback-2d-view">
            {webglUnavailableBanner && (
              <div className="webgl-fallback-banner" role="status" data-testid="webgl-fallback-banner">
                正在加载 2D 平面星图视图...
              </div>
            )}
          </div>
        )}

        <div className="hud-root">
          <TopBar
            topbarRef={topbarRef}
            packs={packs}
            activePackId={activePackId}
            pack={pack}
            index={index}
            viewLevel={viewLevel}
            clusterStack={clusterStack}
            activeDomains={activeDomains}
            activeLens={activeLens}
            editMode={editMode}
            renderMode={renderMode}
            theme={theme}
            quality={quality}
            onSwitchPack={(id) => void switchPack(id)}
            onStepBack={stepBack}
            onSelectCluster={selectAndFly}
            onResetToGalaxy={handleResetToGalaxy}
            onToggleDomain={handleToggleDomain}
            onClearDomains={() => setActiveDomains([])}
            onSetLens={setActiveLens}
            onOpenSearch={() => setPaletteOpen(true)}
            onToggleEditMode={() => setEditMode(!editMode)}
            onToggleRenderMode={handleToggleRenderMode}
            onSetTheme={setTheme}
            onSetQuality={setQuality}
            onOpenBackup={() => setBackupOpen(true)}
            onOpenHelp={() => setHelpOpen(true)}
            onResetView={handleResetView}
          />

          <TodayOrbitHud
            pack={pack}
            index={index}
            progress={progress}
            litLeaves={litLeaves}
            dueReviewIds={dueReviewIds}
            activeStreak={activeStreak}
            activeRouteId={activeRouteId}
            onSetActiveRoute={setActiveRouteId}
            onContinueOrbit={handleContinueOrbit}
            onStartReview={() => setReviewOpen((v) => !v)}
            onSelectAndFly={selectAndFly}
          />

          {pack && index && galaxyLayout && (
            <ConstellationRadar
              pack={pack}
              index={index}
              galaxyLayout={galaxyLayout}
              semanticLayout={semanticLayout}
              viewportNorm={viewportNorm}
              nodeStates={nodeStates}
              selectedId={selectedId}
              engine={engineInstance}
              drawerOpen={drawerOpen && selectedNode !== null}
              offsetRightPx={drawerOpen && selectedNode ? getDesktopDrawerOffset() : 0}
              onRadarClickNormalized={(nx, ny) =>
                setFallbackPanReq((prev) => ({ nx, ny, zoomMul: 1, seq: (prev?.seq ?? 0) + 1 }))
              }
            />
          )}

          {reviewOpen && (
            <ReviewRadarPanel
              dueIds={dueReviewIds}
              index={index}
              progress={progress}
              drawerOpen={!isMobile && drawerOpen && selectedNode !== null}
              onGradeReview={gradeReview}
              onSelectAndFly={selectAndFly}
              onClose={() => setReviewOpen(false)}
            />
          )}

          {editMode && pack && index && (
            <GraphEditorPanel
              pack={pack}
              index={index}
              selectedNode={selectedNode}
              onCreateNode={createNode}
              onUpdateNode={updateNode}
              onDeleteNode={deleteNode}
              onCreateEdge={createEdge}
              onDeleteEdge={deleteEdge}
              onClose={() => setEditMode(false)}
              onToast={pushToast}
            />
          )}

          <AnimatePresence>
            {selectedNode &&
              index &&
              !paletteOpen &&
              !backupOpen &&
              !helpOpen &&
              !(isMobile && reviewOpen) && (
                <NodeActionMenu
                  key="node-action-menu"
                  node={selectedNode}
                  index={index}
                  visualState={nodeStates.get(selectedNode.id) ?? 'available'}
                  anchor={
                    selectedAnchor ?? {
                      x: isMobile
                        ? Math.round((typeof window !== 'undefined' ? window.innerWidth : 390) * 0.5) - 140
                        : 260,
                      y: 200
                    }
                  }
                  isolateSubgraph={isolateSubgraph}
                  drawerOpen={drawerOpen}
                  onOpenDrawer={() => setDrawerOpen((v) => !v)}
                  onDrillDown={(id) => {
                    const target = index.nodesById.get(id)
                    if (target && target.kind !== 'leaf') {
                      enterCluster(id)
                    } else {
                      setDrawerOpen(true)
                    }
                  }}
                  onToggleIsolate={() => setIsolateSubgraph((v) => !v)}
                  onLight={(id) => void handleLight(id)}
                  onUnlight={(id) => void unlightNode(id)}
                  onStartFocus={(id) => {
                    handleStartFocus(id, 25)
                    setDrawerOpen(true)
                  }}
                  onClose={() => selectNode(null)}
                />
              )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedNode && drawerOpen && index && !(isMobile && reviewOpen) && (
              <StudyDrawer
                key="study-drawer"
                node={selectedNode}
                index={index}
                progress={progress}
                litLeaves={litLeaves}
                focusTimer={focusTimer}
                isMobile={isMobile}
                onClose={() => setDrawerOpen(false)}
                onSelectAndFly={selectAndFly}
                onEnterCluster={enterCluster}
                onLight={handleLight}
                onUnlight={unlightNode}
                onBatchLightUnit={handleBatchLightUnit}
                onBatchUnlightUnit={batchUnlightUnit}
                onSetStatus={handleSetStatus}
                onTogglePin={togglePin}
                onToggleTag={toggleTag}
                onToggleExercise={toggleExercise}
                onUpdateNote={updateNote}
                onAddCustomResource={addCustomResource}
                onRemoveCustomResource={removeCustomResource}
                onStartFocus={handleStartFocus}
                onPauseFocus={pauseFocus}
                onCompleteFocus={() => void completeFocusSession()}
                onToast={pushToast}
              />
            )}
          </AnimatePresence>

          <CommandPalette
            open={paletteOpen}
            pack={pack}
            progress={progress}
            commands={paletteCommands}
            onSelectNode={selectAndFly}
            onClose={() => setPaletteOpen(false)}
          />

          <BackupModal
            open={backupOpen}
            activePackId={activePackId}
            onExportBackup={exportBackup}
            onExportMarkdown={exportMarkdownJournal}
            onImportBackup={importBackup}
            onResetCuration={resetCuration}
            onClose={() => setBackupOpen(false)}
            onToast={pushToast}
          />

          <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

          <ToastRegion toasts={toasts} onDismiss={dismissToast} />

          {loading && (
            <div
              className="toast-item"
              style={{ position: 'fixed', top: 128, left: '50%', transform: 'translateX(-50%)' }}
            >
              正在加载知识星云...
            </div>
          )}
        </div>
      </div>
    </MotionConfig>
  )
}
