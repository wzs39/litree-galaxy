import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { NebulaEngine } from '../engine/NebulaEngine'
import { computeFallback2DLayout } from '../layout/fallbackLayout'
import type { GalaxyLayoutResult } from '../layout/galaxyLayout'
import type { GraphIndex, LitreeTelemetry, NodeVisualState, PackDocument } from '../core/types'

interface ConstellationRadarProps {
  pack: PackDocument
  index: GraphIndex
  galaxyLayout: GalaxyLayoutResult
  nodeStates: ReadonlyMap<string, NodeVisualState>
  selectedId: string | null
  engine: NebulaEngine | null
  drawerOpen: boolean
  offsetRightPx: number
  onRadarClickNormalized?: (nx: number, ny: number) => void
}

const RADAR_W = 196
const RADAR_H = 138

const STATE_HEX: Record<NodeVisualState, string> = {
  locked: 'rgba(148, 163, 184, 0.35)',
  available: '#38bdf8',
  queued: '#60a5fa',
  learning: '#f59e0b',
  lit: '#fbbf24',
  review_due: '#a78bfa'
}

interface ViewportBox {
  leftPct: number
  topPct: number
  widthPct: number
  heightPct: number
}

export function ConstellationRadar({
  pack,
  index,
  galaxyLayout,
  nodeStates,
  selectedId,
  engine,
  drawerOpen,
  offsetRightPx,
  onRadarClickNormalized
}: ConstellationRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [viewportBox, setViewportBox] = useState<ViewportBox>({
    leftPct: 28,
    topPct: 28,
    widthPct: 44,
    heightPct: 44
  })

  const layout2D = useMemo(
    () =>
      computeFallback2DLayout(pack, index, galaxyLayout, {
        width: RADAR_W,
        height: RADAR_H,
        padding: 0.05
      }),
    [pack, index, galaxyLayout]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, RADAR_W, RADAR_H)

    // Draw domain centroids softly
    for (const domain of pack.domains) {
      const centroid = layout2D.domainCentroids.get(domain.id)
      if (!centroid) continue
      ctx.beginPath()
      ctx.arc(centroid.x, centroid.y, 12, 0, Math.PI * 2)
      ctx.fillStyle = `${domain.color}22`
      ctx.fill()
    }

    // Draw nodes (unit/branch prominent, leaves sampled cleanly)
    for (const node2d of layout2D.nodes.values()) {
      const st = nodeStates.get(node2d.id) ?? 'available'
      const isSelected = selectedId === node2d.id
      const r = isSelected ? 3.5 : node2d.kind === 'leaf' ? 1.1 : node2d.kind === 'unit' ? 2.1 : 2.8
      ctx.fillStyle = isSelected ? '#ffffff' : STATE_HEX[st]
      ctx.beginPath()
      ctx.arc(node2d.x, node2d.y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [layout2D, pack.domains, nodeStates, selectedId])

  useEffect(() => {
    const updateViewport = () => {
      const tel = (window as unknown as { __LITREE_TELEMETRY__?: LitreeTelemetry })
        .__LITREE_TELEMETRY__
      const cam = tel?.camera
      if (!cam) return
      const [tx, , tz] = cam.target
      const dist = Math.max(12, cam.distance)
      const halfH = dist * Math.tan((25 * Math.PI) / 180)
      const aspect =
        typeof window !== 'undefined' && window.innerHeight > 0
          ? window.innerWidth / window.innerHeight
          : 1.6
      const halfW = halfH * aspect

      const [nx1, ny1] = layout2D.worldXZToNormalized(tx - halfW, tz - halfH)
      const [nx2, ny2] = layout2D.worldXZToNormalized(tx + halfW, tz + halfH)
      const minX = Math.max(0, Math.min(0.88, Math.min(nx1, nx2)))
      const minY = Math.max(0, Math.min(0.88, Math.min(ny1, ny2)))
      const maxX = Math.min(1, Math.max(minX + 0.12, Math.max(nx1, nx2)))
      const maxY = Math.min(1, Math.max(minY + 0.12, Math.max(ny1, ny2)))

      const nextLeft = minX * 100
      const nextTop = minY * 100
      const nextWidth = Math.max(12, (maxX - minX) * 100)
      const nextHeight = Math.max(12, (maxY - minY) * 100)

      setViewportBox((prev) => {
        if (
          Math.abs(prev.leftPct - nextLeft) <= 0.05 &&
          Math.abs(prev.topPct - nextTop) <= 0.05 &&
          Math.abs(prev.widthPct - nextWidth) <= 0.05 &&
          Math.abs(prev.heightPct - nextHeight) <= 0.05
        ) {
          return prev
        }
        return {
          leftPct: nextLeft,
          topPct: nextTop,
          widthPct: nextWidth,
          heightPct: nextHeight
        }
      })
    }

    updateViewport()
    const controls = engine?.cameraRig.controls
    controls?.addEventListener('change', updateViewport)

    let rafId = 0
    let active = true
    const tick = () => {
      if (!active) return
      updateViewport()
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      active = false
      cancelAnimationFrame(rafId)
      controls?.removeEventListener('change', updateViewport)
    }
  }, [engine, layout2D])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))

    if (engine) {
      const [wx, wz] = layout2D.normalizedToWorldXZ(nx, ny)
      const currentTarget = engine.cameraRig.controls.target.clone()
      const offset = engine.camera.position.clone().sub(currentTarget)
      if (offset.lengthSq() < 1) {
        offset.set(0, 50, 120)
      }
      const nextTarget = new THREE.Vector3(wx, currentTarget.y, wz)
      const nextPos = nextTarget.clone().add(offset)
      engine.cameraRig.flyTo(nextPos, nextTarget, { offsetRightPx })
    } else if (onRadarClickNormalized) {
      onRadarClickNormalized(nx, ny)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`constellation-radar hud-panel ${drawerOpen ? 'with-drawer' : ''}`}
      data-testid="constellation-radar"
      onClick={handleClick}
      role="region"
      aria-label="星图缩略雷达（点击飞跃视角）"
    >
      <canvas
        ref={canvasRef}
        className="radar-canvas"
        width={RADAR_W}
        height={RADAR_H}
      />
      <div
        className="radar-viewport"
        data-testid="radar-viewport"
        style={{
          left: `${viewportBox.leftPct}%`,
          top: `${viewportBox.topPct}%`,
          width: `${viewportBox.widthPct}%`,
          height: `${viewportBox.heightPct}%`
        }}
      />
      <span className="radar-label">星图雷达</span>
    </div>
  )
}
