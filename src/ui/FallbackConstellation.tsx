import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { attachGlobalTelemetry } from '../engine/telemetry'
import { computeFallback2DLayout, type Fallback2DLayout } from '../layout/fallbackLayout'
import type { GalaxyLayoutResult } from '../layout/galaxyLayout'
import type {
  ActiveLens,
  GraphIndex,
  NodeVisualState,
  PackDocument,
  ThemeMode,
  ViewLevel
} from '../core/types'

interface FallbackConstellationProps {
  pack: PackDocument
  index: GraphIndex
  galaxyLayout: GalaxyLayoutResult
  nodeStates: ReadonlyMap<string, NodeVisualState>
  viewLevel: ViewLevel
  focusClusterId: string | null
  selectedId: string | null
  hoveredId: string | null
  activeDomains: readonly string[]
  activeLens: ActiveLens
  activeRouteUnitIds?: readonly string[]
  bookmarkedIds?: ReadonlySet<string>
  theme?: ThemeMode
  resetToken: number
  lastBurstAt: number
  panRequest: { nx: number; ny: number; seq: number } | null
  onSelect: (id: string | null) => void
  onDrillDown: (id: string) => void
  onHover: (id: string | null) => void
}

const STATE_COLOR: Record<NodeVisualState, string> = {
  locked: 'rgba(148, 163, 184, 0.4)',
  available: '#38bdf8',
  queued: '#60a5fa',
  learning: '#f59e0b',
  lit: '#fbbf24',
  review_due: '#a78bfa'
}

export function FallbackConstellation({
  pack,
  index,
  galaxyLayout,
  nodeStates,
  viewLevel,
  focusClusterId,
  selectedId,
  hoveredId,
  activeDomains,
  activeLens,
  activeRouteUnitIds = [],
  bookmarkedIds,
  theme = 'nebula',
  resetToken,
  lastBurstAt,
  panRequest,
  onSelect,
  onDrillDown,
  onHover
}: FallbackConstellationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [size, setSize] = useState({ width: 1280, height: 800 })
  const [transform, setTransform] = useState({ panX: 0, panY: 0, zoom: 1 })
  const frameCountRef = useRef(1)
  const lastHoveredRef = useRef<string | null>(null)
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

  useEffect(() => {
    setTransform({ panX: 0, panY: 0, zoom: 1 })
  }, [resetToken, pack.id])

  const layout2D: Fallback2DLayout = useMemo(
    () =>
      computeFallback2DLayout(pack, index, galaxyLayout, {
        width: size.width,
        height: size.height,
        padding: 0.08,
        focusClusterId: viewLevel !== 'galaxy' ? focusClusterId : null
      }),
    [pack, index, galaxyLayout, size.width, size.height, viewLevel, focusClusterId]
  )

  useEffect(() => {
    if (!panRequest) return
    const targetX = panRequest.nx * size.width
    const targetY = panRequest.ny * size.height
    setTransform((prev) => ({
      ...prev,
      panX: size.width / 2 - targetX * prev.zoom,
      panY: size.height / 2 - targetY * prev.zoom
    }))
  }, [panRequest, size.width, size.height])

  const stateRef = useRef({
    layout2D,
    size,
    transform,
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
      const cx = (cur.size.width / 2 - cur.transform.panX) / cur.transform.zoom / Math.max(1, cur.size.width)
      const cy = (cur.size.height / 2 - cur.transform.panY) / cur.transform.zoom / Math.max(1, cur.size.height)
      const [wx, wz] = cur.layout2D.normalizedToWorldXZ(cx, cy)

      return {
        ready: true,
        rendererMode: 'fallback-2d',
        glRenderer: 'fallback-2d',
        frameCount: frameCountRef.current,
        nodeCount: cur.nodeCount,
        edgeCount: cur.edgeCount,
        camera: {
          pos: [wx, 120 / cur.transform.zoom, wz],
          target: [wx, 0, wz],
          distance: 120 / cur.transform.zoom
        },
        activeView: cur.viewLevel,
        selectedId: cur.selectedId,
        hoveredId: cur.hoveredId,
        isFlying: false,
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

  // Render 2D constellation canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    frameCountRef.current += 1
    ctx.clearRect(0, 0, size.width, size.height)
    ctx.save()
    ctx.translate(transform.panX, transform.panY)
    ctx.scale(transform.zoom, transform.zoom)

    const domainFilter = activeDomains.length > 0 ? new Set(activeDomains) : null
    const routeSet = activeRouteUnitIds.length > 0 ? new Set(activeRouteUnitIds) : null
    const isDaylight = theme === 'daylight'

    // Edges
    ctx.lineWidth = 1 / transform.zoom
    for (const edge of layout2D.edges) {
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
      ctx.strokeStyle =
        edge.type === 'hard'
          ? isDaylight
            ? 'rgba(2, 132, 199, 0.36)'
            : 'rgba(56, 189, 248, 0.25)'
          : edge.type === 'soft'
            ? isDaylight
              ? 'rgba(217, 119, 6, 0.32)'
              : 'rgba(251, 191, 36, 0.2)'
            : isDaylight
              ? 'rgba(15, 23, 42, 0.2)'
              : 'rgba(148, 163, 184, 0.14)'
      ctx.beginPath()
      ctx.moveTo(edge.x1, edge.y1)
      ctx.lineTo(edge.x2, edge.y2)
      ctx.stroke()
    }

    // Nodes
    for (const node2d of layout2D.nodes.values()) {
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
      ctx.globalAlpha = isSelected || isHovered ? 1 : visible ? 0.92 : 0.14
      ctx.fillStyle =
        isDaylight && st === 'locked' ? 'rgba(100, 116, 139, 0.55)' : STATE_COLOR[st]
      ctx.beginPath()
      ctx.arc(node2d.x, node2d.y, isSelected ? node2d.radius * 1.45 : node2d.radius, 0, Math.PI * 2)
      ctx.fill()

      if (isSelected || isHovered) {
        ctx.strokeStyle = isDaylight ? '#0284c7' : '#ffffff'
        ctx.lineWidth = (isDaylight ? 2 : 1.5) / transform.zoom
        ctx.stroke()
      }

      if (node2d.kind !== 'leaf' && (transform.zoom >= 0.85 || isSelected || isHovered)) {
        if (kn) {
          ctx.fillStyle = isDaylight ? 'rgba(15, 23, 42, 0.92)' : 'rgba(226, 232, 240, 0.9)'
          ctx.font = `${Math.max(10, 11 / Math.sqrt(transform.zoom))}px sans-serif`
          ctx.fillText(kn.title.zh, node2d.x + node2d.radius + 4, node2d.y + 3)
        }
      }
    }

    ctx.restore()
  }, [
    layout2D,
    size,
    transform,
    nodeStates,
    selectedId,
    hoveredId,
    activeDomains,
    activeLens,
    activeRouteUnitIds,
    bookmarkedIds,
    theme,
    index
  ])

  const pickNodeAtClient = (clientX: number, clientY: number): string | null => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return null
    const worldX = (clientX - rect.left - transform.panX) / transform.zoom
    const worldY = (clientY - rect.top - transform.panY) / transform.zoom

    let bestId: string | null = null
    let bestDistSq = Infinity
    for (const node2d of layout2D.nodes.values()) {
      const hitR = Math.max(10 / transform.zoom, node2d.radius * 2)
      const dx = worldX - node2d.x
      const dy = worldY - node2d.y
      const d2 = dx * dx + dy * dy
      if (d2 <= hitR * hitR && d2 < bestDistSq) {
        bestDistSq = d2
        bestId = node2d.id
      }
    }
    return bestId
  }

  return (
    <div
      ref={containerRef}
      className="fallback-2d-view"
      data-testid="fallback-2d-view"
      onPointerDown={(e) => {
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
          if (Math.hypot(dx, dy) > 4) {
            dragRef.current.moved = true
          }
          setTransform((prev) => ({
            ...prev,
            panX: dragRef.current.origPanX + dx,
            panY: dragRef.current.origPanY + dy
          }))
          return
        }
        const nextHover = pickNodeAtClient(e.clientX, e.clientY)
        if (nextHover !== lastHoveredRef.current) {
          lastHoveredRef.current = nextHover
          onHover(nextHover)
        }
      }}
      onPointerLeave={() => {
        dragRef.current.active = false
        if (lastHoveredRef.current !== null) {
          lastHoveredRef.current = null
          onHover(null)
        }
      }}
      onPointerUp={(e) => {
        const wasMoved = dragRef.current.moved
        dragRef.current.active = false
        if (!wasMoved) {
          onSelect(pickNodeAtClient(e.clientX, e.clientY))
        }
      }}
      onDoubleClick={(e) => {
        const hit = pickNodeAtClient(e.clientX, e.clientY)
        if (hit) onDrillDown(hit)
      }}
      onWheel={(e) => {
        const factor = e.deltaY < 0 ? 1.12 : 0.89
        setTransform((prev) => {
          const nextZoom = Math.max(0.25, Math.min(6, prev.zoom * factor))
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
        width={size.width}
        height={size.height}
      />

      <div className="webgl-fallback-banner" role="status" data-testid="webgl-fallback-banner">
        <AlertCircle size={14} />
        <span>当前环境未启用 WebGL2，已自动切换至 2D 星图兼容视图（全部学习与编辑功能可用）</span>
      </div>
    </div>
  )
}
