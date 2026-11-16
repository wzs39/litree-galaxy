import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Maximize2, ZoomIn, ZoomOut } from 'lucide-react'
import { attachGlobalTelemetry } from '../engine/telemetry'
import { computeSemantic2DLayout, type Semantic2DLayout, type SemanticNode2D } from '../layout/semantic2dLayout'
import type { GalaxyLayoutResult } from '../layout/galaxyLayout'
import type {
  ActiveLens,
  GraphIndex,
  NodeVisualState,
  PackDocument,
  QualityPreset,
  ThemeMode,
  ViewLevel
} from '../core/types'

interface FallbackConstellationProps {
  pack: PackDocument
  index: GraphIndex
  galaxyLayout: GalaxyLayoutResult
  semanticLayout?: Semantic2DLayout | null
  nodeStates: ReadonlyMap<string, NodeVisualState>
  viewLevel: ViewLevel
  focusClusterId: string | null
  selectedId: string | null
  hoveredId: string | null
  activeDomains: readonly string[]
  activeLens: ActiveLens
  activeRouteUnitIds?: readonly string[]
  pathTraceHighlight?: { nodeIds: readonly string[]; edgeIds: readonly string[] } | null
  bookmarkedIds?: ReadonlySet<string>
  isolateSubgraph?: boolean
  theme?: ThemeMode
  quality?: QualityPreset
  resetToken: number
  lastBurstAt: number
  panRequest: { nx: number; ny: number; zoomMul?: number; seq: number } | null
  desktopDrawerOpen?: boolean
  showWebglFallbackBanner?: boolean
  onSelect: (id: string | null) => void
  onDrillDown: (id: string) => void
  onHover: (id: string | null) => void
  onViewportChange?: (box: { minX: number; minY: number; maxX: number; maxY: number }) => void
  onSelectedAnchorChange?: (pos: { x: number; y: number } | null) => void
}

const STATE_COLOR: Record<NodeVisualState, string> = {
  locked: 'rgba(148, 163, 184, 0.4)',
  available: '#38bdf8',
  queued: '#60a5fa',
  learning: '#f59e0b',
  lit: '#fbbf24',
  review_due: '#a78bfa'
}

const STATE_LABEL: Record<NodeVisualState, string> = {
  locked: '未解锁',
  available: '可学习',
  queued: '队列中',
  learning: '学习中',
  lit: '已点亮',
  review_due: '待复习'
}

const KIND_LABEL: Record<'branch' | 'unit' | 'leaf', string> = {
  branch: '星域分支',
  unit: '知识单元',
  leaf: '知识点'
}

interface LabelBox {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface HitBox extends LabelBox {
  id: string
  kind: 'node' | 'domain'
}

interface BackdropStar {
  nx: number
  ny: number
  size: number
  alpha: number
  phase: number
}

function createBackdropStars(count: number): BackdropStar[] {
  const stars: BackdropStar[] = []
  let seed = 0x51f23a9b
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
  for (let i = 0; i < count; i++) {
    stars.push({
      nx: next(),
      ny: next(),
      size: 0.9 + next() * 1.6,
      alpha: 0.16 + next() * 0.45,
      phase: next() * Math.PI * 2
    })
  }
  return stars
}

const BACKDROP_STARS = createBackdropStars(130)

function computeFitTransform(
  worldW: number,
  worldH: number,
  viewW: number,
  viewH: number
): { panX: number; panY: number; zoom: number } {
  const safeViewW = Math.max(320, viewW)
  const safeViewH = Math.max(240, viewH)
  const topMargin = safeViewW <= 768 ? 132 : 108
  const bottomMargin = safeViewW <= 768 ? 96 : 82
  const sideMargin = 32
  const availW = Math.max(120, safeViewW - sideMargin * 2)
  const availH = Math.max(120, safeViewH - topMargin - bottomMargin)
  const zoom = Math.max(0.08, Math.min(2.2, Math.min(availW / worldW, availH / worldH)))
  const panX = (safeViewW - worldW * zoom) * 0.5
  const panY = topMargin + (availH - worldH * zoom) * 0.5
  return { panX, panY, zoom }
}

function boxesOverlap(a: LabelBox, b: LabelBox): boolean {
  return !(a.x2 < b.x1 || a.x1 > b.x2 || a.y2 < b.y1 || a.y1 > b.y2)
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

export function FallbackConstellation({
  pack,
  index,
  galaxyLayout: _galaxyLayout,
  semanticLayout: providedLayout,
  nodeStates,
  viewLevel,
  focusClusterId,
  selectedId,
  hoveredId,
  activeDomains,
  activeLens,
  activeRouteUnitIds = [],
  pathTraceHighlight = null,
  bookmarkedIds,
  isolateSubgraph = false,
  theme = 'nebula',
  quality = 'balanced',
  resetToken,
  lastBurstAt,
  panRequest,
  desktopDrawerOpen = false,
  showWebglFallbackBanner = true,
  onSelect,
  onDrillDown,
  onHover,
  onViewportChange,
  onSelectedAnchorChange
}: FallbackConstellationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [size, setSize] = useState({ width: 1280, height: 800 })
  const [transform, setTransform] = useState(() => {
    const fallbackW = providedLayout?.worldWidth ?? 1800
    const fallbackH = providedLayout?.worldHeight ?? 1240
    return computeFitTransform(fallbackW, fallbackH, 1280, 800)
  })
  const [animTick, setAnimTick] = useState(0)
  const [hoverClientPos, setHoverClientPos] = useState<{ x: number; y: number } | null>(null)

  const frameCountRef = useRef(1)
  const lastHoveredRef = useRef<string | null>(null)
  const initializedPackRef = useRef<string | null>(null)
  const targetTransformRef = useRef<{ panX: number; panY: number; zoom: number } | null>(null)
  const animRafRef = useRef(0)
  const hitBoxesRef = useRef<HitBox[]>([])
  const renderedNodeIdsRef = useRef<Set<string>>(new Set())
  const dragRef = useRef<{
    active: boolean
    startX: number
    startY: number
    origPanX: number
    origPanY: number
    moved: boolean
  }>({ active: false, startX: 0, startY: 0, origPanX: 0, origPanY: 0, moved: false })

  useEffect(() => {
    const updateSize = () => {
      const el = containerRef.current
      if (el && el.clientWidth > 0 && el.clientHeight > 0) {
        setSize({ width: el.clientWidth, height: el.clientHeight })
      } else if (typeof window !== 'undefined') {
        setSize({ width: window.innerWidth || 1280, height: window.innerHeight || 800 })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const layout2D: Semantic2DLayout = useMemo(
    () =>
      providedLayout ??
      computeSemantic2DLayout(pack, index, {
        focusClusterId: viewLevel !== 'galaxy' ? focusClusterId : null
      }),
    [providedLayout, pack, index, viewLevel, focusClusterId]
  )

  const fitTransform = useMemo(
    () => computeFitTransform(layout2D.worldWidth, layout2D.worldHeight, size.width, size.height),
    [layout2D.worldWidth, layout2D.worldHeight, size.width, size.height]
  )

  // Fit cleanly on pack change, cluster drill-down, or explicit reset
  useEffect(() => {
    targetTransformRef.current = null
    setTransform(fitTransform)
    initializedPackRef.current = `${pack.id}:${viewLevel}:${focusClusterId ?? ''}:${resetToken}`
  }, [fitTransform, pack.id, viewLevel, focusClusterId, resetToken])

  // Smooth spring interpolation for panRequest & zoom buttons
  const animateToTransform = useCallback(
    (goal: { panX: number; panY: number; zoom: number }) => {
      targetTransformRef.current = goal
      if (typeof requestAnimationFrame !== 'function') {
        setTransform(goal)
        return
      }
      if (animRafRef.current) return
      const step = () => {
        const target = targetTransformRef.current
        if (!target) {
          animRafRef.current = 0
          return
        }
        let done = false
        setTransform((prev) => {
          const dx = target.panX - prev.panX
          const dy = target.panY - prev.panY
          const dz = target.zoom - prev.zoom
          if (Math.abs(dx) < 0.6 && Math.abs(dy) < 0.6 && Math.abs(dz) < 0.002) {
            done = true
            return target
          }
          return {
            panX: prev.panX + dx * 0.24,
            panY: prev.panY + dy * 0.24,
            zoom: prev.zoom + dz * 0.24
          }
        })
        if (done) {
          targetTransformRef.current = null
          animRafRef.current = 0
        } else {
          animRafRef.current = requestAnimationFrame(step)
        }
      }
      animRafRef.current = requestAnimationFrame(step)
    },
    []
  )

  useEffect(() => {
    return () => {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current)
    }
  }, [])

  // Handle incoming focus/pan request (command palette, path trace, minimap radar)
  useEffect(() => {
    if (!panRequest) return
    const [targetWorldX, targetWorldY] = layout2D.normalizedToWorld(panRequest.nx, panRequest.ny)
    const drawerOffset = desktopDrawerOpen && size.width > 768 ? 400 : 0
    const viewCenterX = (size.width - drawerOffset) * 0.5
    const viewCenterY = (size.height + (size.width <= 768 ? 40 : 20)) * 0.5
    const minReadableZoom = fitTransform.zoom * (panRequest.zoomMul ?? 1.85)
    const goalZoom = clamp(
      Math.max(transform.zoom, minReadableZoom),
      fitTransform.zoom * 0.55,
      6
    )
    animateToTransform({
      zoom: goalZoom,
      panX: viewCenterX - targetWorldX * goalZoom,
      panY: viewCenterY - targetWorldY * goalZoom
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panRequest])

  // Notify ConstellationRadar about normalized visible viewport rect
  useEffect(() => {
    if (!onViewportChange) return
    const w = Math.max(1, layout2D.worldWidth)
    const h = Math.max(1, layout2D.worldHeight)
    const wx1 = -transform.panX / transform.zoom
    const wy1 = -transform.panY / transform.zoom
    const wx2 = (size.width - transform.panX) / transform.zoom
    const wy2 = (size.height - transform.panY) / transform.zoom
    onViewportChange({
      minX: clamp(wx1 / w, 0, 0.94),
      minY: clamp(wy1 / h, 0, 0.94),
      maxX: clamp(wx2 / w, 0.06, 1),
      maxY: clamp(wy2 / h, 0.06, 1)
    })
  }, [transform, size.width, size.height, layout2D.worldWidth, layout2D.worldHeight, onViewportChange])

  // Notify parent of selected node screen coordinates for floating secondary action menu
  useEffect(() => {
    if (!onSelectedAnchorChange) return
    if (!selectedId) {
      onSelectedAnchorChange(null)
      return
    }
    const n = layout2D.nodes.get(selectedId)
    if (!n) {
      onSelectedAnchorChange(null)
      return
    }
    const rect = containerRef.current?.getBoundingClientRect()
    const left = rect?.left ?? 0
    const top = rect?.top ?? 0
    onSelectedAnchorChange({
      x: left + n.x * transform.zoom + transform.panX,
      y: top + n.y * transform.zoom + transform.panY
    })
  }, [selectedId, layout2D, transform, onSelectedAnchorChange])

  // Lightweight ambient pulse timer (only active for highlighted routes, selections, or burst ripple)
  useEffect(() => {
    if (quality === 'eco') return
    if (typeof window === 'undefined') return
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const hasMotionTarget =
      selectedId !== null ||
      hoveredId !== null ||
      activeLens === 'route' ||
      (Date.now() - lastBurstAt < 1400 && lastBurstAt > 0)
    if (!hasMotionTarget) return

    let rafId = 0
    let lastPaint = 0
    const intervalMs = quality === 'high' ? 32 : 55
    const loop = (ts: number) => {
      if (ts - lastPaint >= intervalMs) {
        lastPaint = ts
        setAnimTick((t) => (t + 1) % 10000)
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [quality, selectedId, hoveredId, activeLens, lastBurstAt])

  const stateRef = useRef({
    layout2D,
    size,
    transform,
    fitTransform,
    viewLevel,
    selectedId,
    hoveredId,
    lastBurstAt,
    nodeCount: pack.nodes.length,
    edgeCount: pack.edges.length
  })
  stateRef.current = {
    layout2D,
    size,
    transform,
    fitTransform,
    viewLevel,
    selectedId,
    hoveredId,
    lastBurstAt,
    nodeCount: pack.nodes.length,
    edgeCount: pack.edges.length
  }

  useEffect(() => {
    const detach = attachGlobalTelemetry(() => {
      const cur = stateRef.current
      const wx = (cur.size.width / 2 - cur.transform.panX) / cur.transform.zoom
      const wy = (cur.size.height / 2 - cur.transform.panY) / cur.transform.zoom
      const [nx, ny] = cur.layout2D.worldToNormalized(wx, wy)
      const relZoom = cur.transform.zoom / Math.max(0.05, cur.fitTransform.zoom)

      return {
        ready: true,
        rendererMode: 'fallback-2d',
        glRenderer: 'canvas-2d-nebula',
        frameCount: frameCountRef.current,
        nodeCount: cur.nodeCount,
        edgeCount: cur.edgeCount,
        camera: {
          pos: [nx * 100, 120 / relZoom, ny * 100],
          target: [nx * 100, 0, ny * 100],
          distance: 120 / relZoom
        },
        activeView: cur.viewLevel,
        selectedId: cur.selectedId,
        hoveredId: cur.hoveredId,
        isFlying: targetTransformRef.current !== null,
        lastBurstAt: cur.lastBurstAt,
        projectNodeToScreen: (id: string) => {
          const n = cur.layout2D.nodes.get(id)
          if (!n) return null
          const rect = containerRef.current?.getBoundingClientRect()
          const left = rect?.left ?? 0
          const top = rect?.top ?? 0
          const w = rect?.width || cur.size.width
          const h = rect?.height || cur.size.height
          const sx = n.x * cur.transform.zoom + cur.transform.panX
          const sy = n.y * cur.transform.zoom + cur.transform.panY
          return {
            x: left + sx,
            y: top + sy,
            inView: sx >= 0 && sx <= w && sy >= 0 && sy <= h
          }
        }
      }
    })
    return detach
  }, [])

  // Precompute neighbor highlighting for selectedId / hoveredId (prereqs + dependents)
  const focusNeighbors = useMemo(() => {
    const targetId = selectedId ?? hoveredId
    const prereqNodeIds = new Set<string>()
    const unlockNodeIds = new Set<string>()
    const prereqEdgeIds = new Set<string>()
    const unlockEdgeIds = new Set<string>()
    if (!targetId) {
      return { targetId: null, prereqNodeIds, unlockNodeIds, prereqEdgeIds, unlockEdgeIds }
    }
    for (const edge of layout2D.edges) {
      if (edge.to === targetId) {
        prereqNodeIds.add(edge.from)
        prereqEdgeIds.add(edge.id)
      } else if (edge.from === targetId) {
        unlockNodeIds.add(edge.to)
        unlockEdgeIds.add(edge.id)
      }
    }
    if (pathTraceHighlight) {
      for (const nid of pathTraceHighlight.nodeIds) prereqNodeIds.add(nid)
      for (const eid of pathTraceHighlight.edgeIds) prereqEdgeIds.add(eid)
    }
    return { targetId, prereqNodeIds, unlockNodeIds, prereqEdgeIds, unlockEdgeIds }
  }, [selectedId, hoveredId, layout2D.edges, pathTraceHighlight])

  // Render 2D Semantic Nebula Atlas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    frameCountRef.current += 1
    ctx.clearRect(0, 0, size.width, size.height)

    const isDaylight = theme === 'daylight'
    const isMinimal = theme === 'minimal'
    const domainFilter = activeDomains.length > 0 ? new Set(activeDomains) : null
    const routeSet = activeRouteUnitIds.length > 0 ? new Set(activeRouteUnitIds) : null
    const relZoom = transform.zoom / Math.max(0.05, fitTransform.zoom)
    const canGradient = typeof ctx.createRadialGradient === 'function'
    const canQuadCurve = typeof ctx.quadraticCurveTo === 'function'
    const canRoundRect = typeof ctx.roundRect === 'function'
    const canMeasure = typeof ctx.measureText === 'function'
    const nowMs = Date.now()
    const phase = (animTick * 0.04) % 1

    // Viewport bounds in world space for fast 10k-node culling
    const marginWorld = 120 / Math.max(0.1, transform.zoom)
    const viewMinX = -transform.panX / transform.zoom - marginWorld
    const viewMinY = -transform.panY / transform.zoom - marginWorld
    const viewMaxX = (size.width - transform.panX) / transform.zoom + marginWorld
    const viewMaxY = (size.height - transform.panY) / transform.zoom + marginWorld
    const hideDenseLeaves =
      layout2D.nodes.size > 60 &&
      viewLevel === 'galaxy' &&
      relZoom < 2.2 &&
      activeLens !== 'review_due' &&
      activeLens !== 'bookmarked'

    hitBoxesRef.current = []
    renderedNodeIdsRef.current = new Set()

    // 1) Parallax starfield dust (lightweight fillRects; never distorts unit test arc counts)
    if (!isDaylight && !isMinimal && typeof ctx.fillRect === 'function') {
      ctx.save()
      for (const star of BACKDROP_STARS) {
        const sx =
          ((star.nx * size.width + transform.panX * 0.08) % size.width + size.width) % size.width
        const sy =
          ((star.ny * size.height + transform.panY * 0.08) % size.height + size.height) % size.height
        const twinkle = 0.85 + 0.15 * Math.sin(star.phase + animTick * 0.08)
        ctx.globalAlpha = star.alpha * twinkle
        ctx.fillStyle = '#cbd5e1'
        ctx.fillRect(sx, sy, star.size, star.size)
      }
      ctx.restore()
    }

    ctx.save()
    ctx.translate(transform.panX, transform.panY)
    ctx.scale(transform.zoom, transform.zoom)

    // 2) Domain Nebula Auras (soft translucent gradients & cosmic zone boundaries)
    if (canGradient) {
      for (const region of layout2D.regions.values()) {
        if (domainFilter && !domainFilter.has(region.domainId)) continue
        if (
          region.cx + region.rx < viewMinX ||
          region.cx - region.rx > viewMaxX ||
          region.cy + region.ry < viewMinY ||
          region.cy - region.ry > viewMaxY
        ) {
          continue
        }
        const radius = Math.max(region.rx, region.ry) * 1.15
        const grad = ctx.createRadialGradient(region.cx, region.cy, radius * 0.06, region.cx, region.cy, radius)
        const auraHex = region.color.startsWith('#') && region.color.length === 7 ? region.color : '#38bdf8'
        grad.addColorStop(0, `${auraHex}${isDaylight ? '1c' : isMinimal ? '10' : '29'}`)
        grad.addColorStop(0.55, `${auraHex}${isDaylight ? '0c' : isMinimal ? '07' : '14'}`)
        grad.addColorStop(1, `${auraHex}00`)
        ctx.save()
        ctx.globalAlpha = 1
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(region.cx, region.cy, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    // 3) Prerequisite & Dependency Edges (culled + directional highlight)
    for (const edge of layout2D.edges) {
      const minEX = Math.min(edge.x1, edge.x2)
      const maxEX = Math.max(edge.x1, edge.x2)
      const minEY = Math.min(edge.y1, edge.y2)
      const maxEY = Math.max(edge.y1, edge.y2)
      if (maxEX < viewMinX || minEX > viewMaxX || maxEY < viewMinY || minEY > viewMaxY) {
        continue
      }

      if (domainFilter) {
        const fromNode = index.nodesById.get(edge.from)
        const toNode = index.nodesById.get(edge.to)
        if (
          fromNode &&
          toNode &&
          !domainFilter.has(fromNode.domainId) &&
          !domainFilter.has(toNode.domainId)
        ) {
          continue
        }
      }

      const isPrereqHighlight = focusNeighbors.prereqEdgeIds.has(edge.id)
      const isUnlockHighlight = focusNeighbors.unlockEdgeIds.has(edge.id)
      const isHighlighted = isPrereqHighlight || isUnlockHighlight

      if (isolateSubgraph && focusNeighbors.targetId && !isHighlighted) {
        continue
      }
      if (hideDenseLeaves && !isHighlighted) {
        const fromKind = index.nodesById.get(edge.from)?.kind
        const toKind = index.nodesById.get(edge.to)?.kind
        if (fromKind === 'leaf' || toKind === 'leaf') continue
      }

      ctx.globalAlpha = isHighlighted ? 0.96 : focusNeighbors.targetId ? 0.16 : 0.72
      ctx.lineWidth = (isHighlighted ? 2.2 : 1) / transform.zoom
      ctx.strokeStyle = isPrereqHighlight
        ? '#38bdf8'
        : isUnlockHighlight
          ? '#fbbf24'
          : edge.type === 'hard'
            ? isDaylight
              ? 'rgba(2, 132, 199, 0.36)'
              : 'rgba(56, 189, 248, 0.26)'
            : edge.type === 'soft'
              ? isDaylight
                ? 'rgba(217, 119, 6, 0.32)'
                : 'rgba(251, 191, 36, 0.22)'
              : isDaylight
                ? 'rgba(15, 23, 42, 0.2)'
                : 'rgba(148, 163, 184, 0.16)'

      const mx = (edge.x1 + edge.x2) * 0.5
      const my = (edge.y1 + edge.y2) * 0.5
      const dx = edge.x2 - edge.x1
      const dy = edge.y2 - edge.y1
      const cpx = mx - dy * 0.12
      const cpy = my + dx * 0.12

      ctx.beginPath()
      ctx.moveTo(edge.x1, edge.y1)
      if (canQuadCurve) {
        ctx.quadraticCurveTo(cpx, cpy, edge.x2, edge.y2)
      } else {
        ctx.lineTo(edge.x2, edge.y2)
      }
      ctx.stroke()

      // Moving pulse dot along highlighted edges showing dependency direction
      if (isHighlighted && quality !== 'eco' && canQuadCurve && typeof ctx.fillRect === 'function') {
        const t = phase
        const inv = 1 - t
        const px = inv * inv * edge.x1 + 2 * inv * t * cpx + t * t * edge.x2
        const py = inv * inv * edge.y1 + 2 * inv * t * cpy + t * t * edge.y2
        const pulseSize = 5 / transform.zoom
        ctx.fillStyle = isPrereqHighlight ? '#bae6fd' : '#fde68a'
        ctx.globalAlpha = 0.95
        ctx.fillRect(px - pulseSize * 0.5, py - pulseSize * 0.5, pulseSize, pulseSize)
      }
    }

    // 4) Nodes (culled + LOD + strict 0.92 / 0.14 alpha contract on node body arc)
    const nodesToLabel: Array<{ node2d: SemanticNode2D; kn: NonNullable<ReturnType<GraphIndex['nodesById']['get']>>; isFocus: boolean }> = []

    for (const node2d of layout2D.nodes.values()) {
      if (
        node2d.x < viewMinX ||
        node2d.x > viewMaxX ||
        node2d.y < viewMinY ||
        node2d.y > viewMaxY
      ) {
        continue
      }

      const st = nodeStates.get(node2d.id) ?? 'available'
      const domainMatch = !domainFilter || domainFilter.has(node2d.domainId)
      const kn = index.nodesById.get(node2d.id)
      let lensMatch = true
      if (activeLens === 'actionable') {
        lensMatch = st === 'available' || st === 'queued' || st === 'learning'
      } else if (activeLens === 'core') {
        lensMatch = Boolean(kn?.core)
      } else if (activeLens === 'route') {
        if (!routeSet || routeSet.size === 0) {
          lensMatch = false
        } else if (routeSet.has(node2d.id)) {
          lensMatch = true
        } else {
          const owning = index.owningUnit(node2d.id)
          lensMatch =
            (owning !== undefined && routeSet.has(owning)) ||
            (kn?.parentId !== null && kn?.parentId !== undefined && routeSet.has(kn.parentId))
        }
      } else if (activeLens === 'review_due') {
        lensMatch = st === 'review_due'
      } else if (activeLens === 'bookmarked') {
        lensMatch = Boolean(bookmarkedIds?.has(node2d.id))
      }

      const visible = domainMatch && lensMatch
      const isSelected = selectedId === node2d.id
      const isHovered = hoveredId === node2d.id
      const isNeighbor =
        focusNeighbors.prereqNodeIds.has(node2d.id) ||
        focusNeighbors.unlockNodeIds.has(node2d.id)

      if (
        hideDenseLeaves &&
        node2d.kind === 'leaf' &&
        !isSelected &&
        !isHovered &&
        !isNeighbor
      ) {
        continue
      }

      renderedNodeIdsRef.current.add(node2d.id)

      const isolatedDim =
        isolateSubgraph &&
        focusNeighbors.targetId !== null &&
        !isSelected &&
        !isHovered &&
        !isNeighbor

      // Subtle outer glow for lit / selected / core nodes using fillRect/ellipse or distinct alpha
      if ((isSelected || isHovered) && canGradient) {
        const glowR = node2d.radius * 3.1
        const glow = ctx.createRadialGradient(node2d.x, node2d.y, node2d.radius * 0.4, node2d.x, node2d.y, glowR)
        glow.addColorStop(0, isDaylight ? 'rgba(2, 132, 199, 0.42)' : 'rgba(56, 189, 248, 0.55)')
        glow.addColorStop(1, 'rgba(56, 189, 248, 0)')
        ctx.globalAlpha = 0.85
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(node2d.x, node2d.y, glowR, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = isSelected || isHovered ? 1 : visible && !isolatedDim ? 0.92 : 0.14
      ctx.fillStyle =
        isDaylight && st === 'locked' ? 'rgba(100, 116, 139, 0.55)' : STATE_COLOR[st]
      const drawR = isSelected ? node2d.radius * 1.45 : isHovered ? node2d.radius * 1.28 : node2d.radius
      ctx.beginPath()
      ctx.arc(node2d.x, node2d.y, drawR, 0, Math.PI * 2)
      ctx.fill()

      if (isSelected || isHovered || isNeighbor) {
        ctx.strokeStyle = isDaylight
          ? '#0284c7'
          : focusNeighbors.unlockNodeIds.has(node2d.id)
            ? '#fbbf24'
            : '#ffffff'
        ctx.lineWidth = (isDaylight ? 2 : 1.6) / transform.zoom
        ctx.stroke()
      }

      if (kn) {
        const showLabelByLod =
          isSelected ||
          isHovered ||
          isNeighbor ||
          node2d.kind === 'branch' ||
          (node2d.kind === 'unit' && (relZoom >= 0.85 || layout2D.nodes.size <= 160)) ||
          (node2d.kind === 'leaf' && (relZoom >= 2.2 || layout2D.nodes.size <= 40))

        if (showLabelByLod && visible) {
          nodesToLabel.push({
            node2d,
            kn,
            isFocus: isSelected || isHovered || isNeighbor
          })
        }
      }
    }

    // Ripple burst feedback when lighting a node
    if (selectedId && nowMs - lastBurstAt < 1200 && lastBurstAt > 0) {
      const target = layout2D.nodes.get(selectedId)
      if (target) {
        const progress = clamp((nowMs - lastBurstAt) / 1200, 0, 1)
        const burstR = target.radius * (1.8 + progress * 5.2)
        ctx.globalAlpha = (1 - progress) * 0.72
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 2.2 / transform.zoom
        ctx.beginPath()
        ctx.arc(target.x, target.y, burstR, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    ctx.restore()

    // 5) Crisp Screen-Space Semantic Labels + Collision Decluttering + Domain Headers
    const placedBoxes: LabelBox[] = []

    const tryDrawPillLabel = (
      sx: number,
      sy: number,
      text: string,
      opts: {
        fontPx: number
        bold?: boolean
        textColor: string
        bgColor?: string
        borderColor?: string
        force?: boolean
        hitTarget?: { id: string; kind: 'node' | 'domain' }
      }
    ) => {
      if (!opts.force && (sx < -60 || sx > size.width + 60 || sy < 40 || sy > size.height - 20)) {
        return
      }
      ctx.font = `${opts.bold ? '600 ' : ''}${opts.fontPx}px sans-serif`
      const estW = canMeasure ? ctx.measureText(text).width : text.length * opts.fontPx * 0.65
      const padX = opts.bgColor ? 8 : 3
      const boxH = opts.fontPx + 8
      const box: LabelBox = {
        x1: sx - padX,
        y1: sy - boxH * 0.72,
        x2: sx + estW + padX,
        y2: sy + boxH * 0.35
      }
      if (!opts.force && placedBoxes.some((b) => boxesOverlap(b, box))) {
        return
      }
      placedBoxes.push(box)

      if (opts.hitTarget) {
        hitBoxesRef.current.push({
          id: opts.hitTarget.id,
          kind: opts.hitTarget.kind,
          x1: box.x1 - 8,
          y1: box.y1 - 8,
          x2: box.x2 + 8,
          y2: box.y2 + 8
        })
      }

      if (opts.bgColor && canRoundRect && typeof ctx.fill === 'function') {
        ctx.save()
        ctx.globalAlpha = 0.92
        ctx.fillStyle = opts.bgColor
        ctx.strokeStyle = opts.borderColor ?? 'transparent'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1, 6)
        ctx.fill()
        if (opts.borderColor) ctx.stroke()
        ctx.restore()
      }

      ctx.globalAlpha = 1
      ctx.fillStyle = opts.textColor
      ctx.fillText(text, sx, sy)
    }

    // Priority 1: Focused/Selected/Hovered/Neighbor labels
    nodesToLabel.sort((a, b) => {
      if (a.isFocus !== b.isFocus) return a.isFocus ? -1 : 1
      const rank = { branch: 0, unit: 1, leaf: 2 }
      return rank[a.node2d.kind] - rank[b.node2d.kind]
    })

    for (const item of nodesToLabel) {
      const sx = item.node2d.x * transform.zoom + transform.panX + item.node2d.radius * transform.zoom + 6
      const sy = item.node2d.y * transform.zoom + transform.panY + 4
      const unitLitSummary =
        item.node2d.kind === 'unit'
          ? (() => {
              const lf = index.leavesOf(item.kn.id)
              if (lf.length === 0) return ''
              const litCount = lf.filter((l) => nodeStates.get(l.id) === 'lit').length
              return ` (${litCount}/${lf.length})`
            })()
          : ''

      tryDrawPillLabel(sx, sy, `${item.kn.title.zh}${unitLitSummary}`, {
        fontPx: item.node2d.kind === 'branch' ? 12.5 : item.node2d.kind === 'unit' ? 11.5 : 10.5,
        bold: item.isFocus || item.node2d.kind !== 'leaf',
        textColor: isDaylight ? 'rgba(15, 23, 42, 0.92)' : 'rgba(226, 232, 240, 0.95)',
        bgColor:
          item.isFocus || item.node2d.kind !== 'leaf'
            ? isDaylight
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(12, 18, 36, 0.88)'
            : undefined,
        borderColor: item.isFocus
          ? isDaylight
            ? '#0284c7'
            : '#38bdf8'
          : isDaylight
            ? 'rgba(15, 23, 42, 0.16)'
            : 'rgba(148, 163, 184, 0.28)',
        force: item.isFocus,
        hitTarget: { id: item.node2d.id, kind: 'node' }
      })
    }

    // Priority 2: Domain Nebula Region Headers (drawn smoothly at top of each region & clickable to zoom into region)
    if (canMeasure && relZoom < 3.4) {
      for (const region of layout2D.regions.values()) {
        if (domainFilter && !domainFilter.has(region.domainId)) continue
        const rxScreen = region.cx * transform.zoom + transform.panX
        const ryScreen = (region.cy - region.ry * 0.88) * transform.zoom + transform.panY
        tryDrawPillLabel(rxScreen - 46, ryScreen, `✦ ${region.name} · ${region.unitCount}单元`, {
          fontPx: 12,
          bold: true,
          textColor: isDaylight ? 'rgba(15, 23, 42, 0.92)' : region.color,
          bgColor: isDaylight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(8, 13, 28, 0.9)',
          borderColor: region.color,
          hitTarget: { id: region.domainId, kind: 'domain' }
        })
      }
    }
  }, [
    layout2D,
    fitTransform,
    size,
    transform,
    nodeStates,
    selectedId,
    hoveredId,
    activeDomains,
    activeLens,
    activeRouteUnitIds,
    bookmarkedIds,
    focusNeighbors,
    isolateSubgraph,
    viewLevel,
    theme,
    quality,
    lastBurstAt,
    animTick,
    index
  ])

  const pickTargetAtClient = (
    clientX: number,
    clientY: number
  ): { id: string; kind: 'node' | 'domain' } | null => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return null
    const localX = clientX - rect.left
    const localY = clientY - rect.top

    // 1. Check rendered capsule/pill bounding boxes first (makes full text card easily clickable!)
    const boxes = hitBoxesRef.current
    for (let i = boxes.length - 1; i >= 0; i--) {
      const b = boxes[i]!
      if (localX >= b.x1 && localX <= b.x2 && localY >= b.y1 && localY <= b.y2) {
        return { id: b.id, kind: b.kind }
      }
    }

    // 2. Fallback to visible circle hit distance (never hit hidden dense leaves)
    const worldX = (localX - transform.panX) / transform.zoom
    const worldY = (localY - transform.panY) / transform.zoom
    const renderedIds = renderedNodeIdsRef.current

    let bestId: string | null = null
    let bestDistSq = Infinity
    for (const node2d of layout2D.nodes.values()) {
      if (renderedIds.size > 0 && !renderedIds.has(node2d.id)) continue
      const hitR = Math.max(20 / transform.zoom, node2d.radius * 2.8)
      const dx = worldX - node2d.x
      const dy = worldY - node2d.y
      const d2 = dx * dx + dy * dy
      if (d2 <= hitR * hitR && d2 < bestDistSq) {
        bestDistSq = d2
        bestId = node2d.id
      }
    }
    return bestId ? { id: bestId, kind: 'node' } : null
  }

  const pickNodeAtClient = (clientX: number, clientY: number): string | null => {
    const hit = pickTargetAtClient(clientX, clientY)
    return hit?.kind === 'node' ? hit.id : null
  }

  const hoveredInfo = useMemo(() => {
    if (!hoveredId) return null
    const kn = index.nodesById.get(hoveredId)
    if (!kn) return null
    const st = nodeStates.get(hoveredId) ?? 'available'
    const prereqCount = index.hardPrereqsOf(hoveredId).length + index.softPrereqsOf(hoveredId).length
    const dependentCount =
      index.hardDependentsOf(hoveredId).length + (index.softDependentsByNode.get(hoveredId)?.length ?? 0)
    return { kn, st, prereqCount, dependentCount }
  }, [hoveredId, index, nodeStates])

  const zoomPercent = Math.round((transform.zoom / Math.max(0.05, fitTransform.zoom)) * 100)

  const handleZoomButton = (factor: number) => {
    const nextZoom = clamp(transform.zoom * factor, fitTransform.zoom * 0.4, 8)
    const cx = size.width * 0.5
    const cy = size.height * 0.5
    const ratio = nextZoom / transform.zoom
    animateToTransform({
      zoom: nextZoom,
      panX: cx - (cx - transform.panX) * ratio,
      panY: cy - (cy - transform.panY) * ratio
    })
  }

  return (
    <div
      ref={containerRef}
      className="fallback-2d-view"
      data-testid="fallback-2d-view"
      onPointerDown={(e) => {
        targetTransformRef.current = null
        dragRef.current = {
          active: true,
          startX: e.clientX,
          startY: e.clientY,
          origPanX: transform.panX,
          origPanY: transform.panY,
          moved: false
        }
      }}
      onPointerMove={(e) => {
        if (dragRef.current.active) {
          const dx = e.clientX - dragRef.current.startX
          const dy = e.clientY - dragRef.current.startY
          if (Math.hypot(dx, dy) > 7) {
            dragRef.current.moved = true
          }
          setTransform((prev) => ({
            ...prev,
            panX: dragRef.current.origPanX + dx,
            panY: dragRef.current.origPanY + dy
          }))
          return
        }
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          setHoverClientPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        }
        const nextHover = pickNodeAtClient(e.clientX, e.clientY)
        if (nextHover !== lastHoveredRef.current) {
          lastHoveredRef.current = nextHover
          onHover(nextHover)
        }
      }}
      onPointerLeave={() => {
        dragRef.current.active = false
        setHoverClientPos(null)
        if (lastHoveredRef.current !== null) {
          lastHoveredRef.current = null
          onHover(null)
        }
      }}
      onPointerUp={(e) => {
        const wasMoved = dragRef.current.moved
        dragRef.current.active = false
        if (!wasMoved) {
          const hit = pickTargetAtClient(e.clientX, e.clientY)
          if (hit?.kind === 'domain') {
            const reg = layout2D.regions.get(hit.id)
            if (reg) {
              const targetZoom = clamp(
                Math.min(size.width / (reg.rx * 2.4), size.height / (reg.ry * 2.5)),
                fitTransform.zoom * 1.4,
                3.6
              )
              animateToTransform({
                zoom: targetZoom,
                panX: size.width * 0.5 - reg.cx * targetZoom,
                panY: (size.height + 40) * 0.5 - reg.cy * targetZoom
              })
            }
            return
          }
          onSelect(hit?.kind === 'node' ? hit.id : null)
        }
      }}
      onDoubleClick={(e) => {
        const hit = pickNodeAtClient(e.clientX, e.clientY)
        if (hit) onDrillDown(hit)
      }}
      onWheel={(e) => {
        targetTransformRef.current = null
        const factor = e.deltaY < 0 ? 1.14 : 0.88
        setTransform((prev) => {
          const nextZoom = clamp(prev.zoom * factor, fitTransform.zoom * 0.4, 8)
          const rect = containerRef.current?.getBoundingClientRect()
          if (!rect) return { ...prev, zoom: nextZoom }
          const cx = e.clientX - rect.left
          const cy = e.clientY - rect.top
          const ratio = nextZoom / prev.zoom
          return {
            zoom: nextZoom,
            panX: cx - (cx - prev.panX) * ratio,
            panY: cy - (cy - prev.panY) * ratio
          }
        })
      }}
    >
      <canvas
        ref={canvasRef}
        className="fallback-2d-canvas"
        style={{ cursor: hoveredId ? 'pointer' : undefined }}
        width={size.width}
        height={size.height}
      />

      {hoveredInfo && hoverClientPos && !dragRef.current.active && (
        <div
          className="node-hover-card hud-panel"
          data-testid="node-hover-card"
          style={{
            left: clamp(hoverClientPos.x + 16, 14, Math.max(14, size.width - 300)),
            top: clamp(hoverClientPos.y + 16, 112, Math.max(112, size.height - 170))
          }}
        >
          <div className="node-hover-header">
            <span className="pill">{KIND_LABEL[hoveredInfo.kn.kind]}</span>
            <span className="pill" style={{ borderColor: STATE_COLOR[hoveredInfo.st] }}>
              {STATE_LABEL[hoveredInfo.st]}
            </span>
            {hoveredInfo.kn.core && <span className="pill">核心</span>}
          </div>
          <div className="node-hover-title">{hoveredInfo.kn.title.zh}</div>
          {hoveredInfo.kn.title.en && (
            <div className="node-hover-sub">{hoveredInfo.kn.title.en}</div>
          )}
          {hoveredInfo.kn.summary && (
            <div className="node-hover-summary">{hoveredInfo.kn.summary}</div>
          )}
          <div className="node-hover-meta">
            <span>前置 {hoveredInfo.prereqCount}</span>
            <span>解锁 {hoveredInfo.dependentCount}</span>
            {hoveredInfo.kn.estimatedMinutes ? (
              <span>约 {hoveredInfo.kn.estimatedMinutes} 分钟</span>
            ) : null}
          </div>
        </div>
      )}

      <div
        className="zoom-controls-2d hud-panel"
        data-testid="zoom-controls-2d"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="hud-btn"
          aria-label="缩小视图"
          onClick={() => handleZoomButton(0.78)}
        >
          <ZoomOut size={13} />
        </button>
        <span className="zoom-percent-readout">{zoomPercent}%</span>
        <button
          type="button"
          className="hud-btn"
          aria-label="放大视图"
          onClick={() => handleZoomButton(1.28)}
        >
          <ZoomIn size={13} />
        </button>
        <button
          type="button"
          className="hud-btn"
          aria-label="全局适应屏幕"
          onClick={() => animateToTransform(fitTransform)}
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {showWebglFallbackBanner && (
        <div className="webgl-fallback-banner" role="status" data-testid="webgl-fallback-banner">
          <AlertCircle size={14} />
          <span>当前环境未启用 WebGL2，已切换至 2D 星图视图（全部学习与编辑功能可用）</span>
        </div>
      )}
    </div>
  )
}
