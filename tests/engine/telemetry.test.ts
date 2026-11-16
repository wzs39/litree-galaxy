import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import type { LitreeTelemetry } from '../../src/core/types'
import { attachGlobalTelemetry, projectWorldToScreen } from '../../src/engine/telemetry'

describe('telemetry (F8)', () => {
  it('projectWorldToScreen handles centered, off-center, behind-camera, rect offset, and degenerate rects', () => {
    const cam = new THREE.PerspectiveCamera(50, 1000 / 500, 0.5, 1000)
    cam.position.set(0, 0, 100)
    cam.lookAt(0, 0, 0)

    const centered = projectWorldToScreen([0, 0, 0], cam, {
      left: 0,
      top: 56,
      width: 1000,
      height: 500
    })
    expect(centered).not.toBeNull()
    expect(centered!.inView).toBe(true)
    expect(centered!.x).toBeCloseTo(500, 3)
    expect(centered!.y).toBeCloseTo(306, 3)

    const behind = projectWorldToScreen([0, 0, 200], cam, { width: 1000, height: 500 })
    expect(behind).not.toBeNull()
    expect(behind!.inView).toBe(false)

    const offscreen = projectWorldToScreen([500, 0, 0], cam, { width: 1000, height: 500 })
    expect(offscreen).not.toBeNull()
    expect(offscreen!.inView).toBe(false)

    expect(projectWorldToScreen([0, 0, 0], cam, { width: 0, height: 500 })).toBeNull()
    expect(projectWorldToScreen([Number.NaN, 0, 0], cam, { width: 1000, height: 500 })).toBeNull()
  })

  it('attachGlobalTelemetry exposes read-only live getters and detaches cleanly', () => {
    const mockWin: Record<string, unknown> = {}
    let frame = 0
    let selected: string | null = null

    const detach = attachGlobalTelemetry(
      (): LitreeTelemetry => ({
        ready: true,
        rendererMode: 'webgl2',
        glRenderer: 'SwiftShader',
        frameCount: frame,
        nodeCount: 11,
        edgeCount: 2,
        camera: { pos: [0, 10, 50], target: [0, 0, 0], distance: 51 },
        activeView: 'galaxy',
        selectedId: selected,
        hoveredId: null,
        isFlying: false,
        lastBurstAt: 0,
        projectNodeToScreen: () => null
      }),
      mockWin
    )

    const t = mockWin['__LITREE_TELEMETRY__'] as LitreeTelemetry
    expect(t.ready).toBe(true)
    expect(t.frameCount).toBe(0)
    expect(t.selectedId).toBeNull()

    frame = 42
    selected = 'u1'
    expect(t.frameCount).toBe(42)
    expect(t.selectedId).toBe('u1')

    // Read-only top-level property
    expect(() => {
      ;(mockWin as { __LITREE_TELEMETRY__: unknown }).__LITREE_TELEMETRY__ = null
    }).toThrow()

    detach()
    expect(mockWin['__LITREE_TELEMETRY__']).toBeUndefined()
  })
})
