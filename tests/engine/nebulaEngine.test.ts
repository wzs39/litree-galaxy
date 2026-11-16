import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'
import { buildGraphIndex } from '../../src/core/graph'
import { normalizePackToV2 } from '../../src/core/schema'
import type { ActiveLens, NodeVisualState, PackDocument } from '../../src/core/types'
import {
  detectWebGL,
  NebulaEngine,
  pickNodeAtRay,
  type NebulaVisualSnapshot
} from '../../src/engine/NebulaEngine'
import { computeGalaxyLayout } from '../../src/layout/galaxyLayout'

function loadPack(file: string): PackDocument {
  const raw = JSON.parse(readFileSync(join(process.cwd(), 'resources/packs', file), 'utf-8'))
  const res = normalizePackToV2(raw)
  if (!res.ok) throw new Error(`Failed to normalize ${file}: ${res.errors.join(', ')}`)
  return res.pack
}

const devMiniPack = loadPack('dev-mini.json')
const devMiniIndex = buildGraphIndex(devMiniPack)

const csMathPack = loadPack('cs-math.json')
const csMathIndex = buildGraphIndex(csMathPack)

function createMockContainer(width = 1280, height = 800): HTMLElement {
  return {
    clientWidth: width,
    clientHeight: height,
    appendChild: () => {},
    removeChild: () => {},
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width,
      height,
      right: width,
      bottom: height,
      x: 0,
      y: 0,
      toJSON: () => ({})
    })
  } as unknown as HTMLElement
}

function makeSnapshot(
  pack: PackDocument,
  overrides?: Partial<NebulaVisualSnapshot>,
  stateOverrides?: Record<string, NodeVisualState>
): NebulaVisualSnapshot {
  const nodeStates = new Map<string, NodeVisualState>()
  for (const n of pack.nodes) {
    nodeStates.set(n.id, stateOverrides?.[n.id] ?? 'available')
  }
  return {
    nodeStates,
    selectedId: null,
    hoveredId: null,
    activeDomains: [],
    activeLens: 'all',
    activeRouteUnitIds: [],
    pathTraceHighlight: null,
    focusTimerNodeId: null,
    cycleConflictEdgeIds: [],
    ...overrides
  }
}

describe('NebulaEngine (F7–F8)', () => {
  it('detectWebGL returns fallback-2d in Node without throwing', () => {
    const res = detectWebGL()
    expect(res).toEqual({
      supported: false,
      rendererMode: 'fallback-2d',
      glRenderer: 'none'
    })
  })

  it('pickNodeAtRay selects closest visible sphere, skips culled nodes, and misses empty space', () => {
    const positions = new Float32Array([
      0, 0, -20, // node 0 (closer)
      0, 0, -50, // node 1 (further)
      0, 0, -10  // node 2 (culled: radius 0)
    ])
    const hitRadii = new Float32Array([1.5, 2.0, 0])

    const hitRay = new THREE.Ray(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1))
    expect(pickNodeAtRay(hitRay, positions, hitRadii, 3)).toBe(0)

    const missRay = new THREE.Ray(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0))
    expect(pickNodeAtRay(missRay, positions, hitRadii, 3)).toBeNull()

    const behindRay = new THREE.Ray(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1))
    expect(pickNodeAtRay(behindRay, positions, hitRadii, 3)).toBeNull()
  })

  it('initializes in fallback-2d in Node, maintains <= 8 scene objects for 10k nodes, and supports full API', () => {
    const onContextLost = vi.fn()
    const telemetryHost: Record<string, unknown> = {}
    const engine = new NebulaEngine(
      createMockContainer(),
      {
        onSelect: () => {},
        onDrillDown: () => {},
        onHover: () => {},
        onContextLost
      },
      { telemetryTarget: telemetryHost, reducedMotion: false }
    )

    expect(onContextLost).toHaveBeenCalledTimes(1)
    const telemetry = telemetryHost['__LITREE_TELEMETRY__'] as ReturnType<
      NebulaEngine['getTelemetrySnapshot']
    >
    expect(telemetry.rendererMode).toBe('fallback-2d')
    expect(telemetry.ready).toBe(false)

    // Load dev-mini first
    const devLayout = computeGalaxyLayout(devMiniPack, devMiniIndex)
    engine.setGraph(devMiniPack, devLayout, devMiniIndex)
    expect(engine.scene.children.length).toBeLessThanOrEqual(8)
    expect(telemetry.nodeCount).toBe(11)
    expect(telemetry.edgeCount).toBe(2)

    // Hot-swap to 10,013-node cs-math graph without leaking scene children
    const csLayout = computeGalaxyLayout(csMathPack, csMathIndex)
    engine.setGraph(csMathPack, csLayout, csMathIndex)
    expect(engine.scene.children.length).toBeLessThanOrEqual(8)
    expect(telemetry.nodeCount).toBe(10013)
    expect(telemetry.edgeCount).toBe(690)

    // Exercise all 6 lenses + pathTraceHighlight + cycleConflictEdgeIds + focusTimerNodeId
    const lenses: ActiveLens[] = ['all', 'actionable', 'core', 'route', 'review_due', 'bookmarked']
    for (const lens of lenses) {
      const snap = makeSnapshot(
        csMathPack,
        {
          activeLens: lens,
          selectedId: 'M.1.1',
          hoveredId: 'M.1.2',
          activeDomains: lens === 'all' ? [] : ['M1'],
          activeRouteUnitIds: ['M.1.1', 'M.1.2'],
          pathTraceHighlight: {
            nodeIds: ['M.1.1', 'M.1.2'],
            edgeIds: csMathPack.edges.slice(0, 2).map((e) => e.id)
          },
          focusTimerNodeId: 'M.1.1',
          cycleConflictEdgeIds: csMathPack.edges.slice(0, 1).map((e) => e.id),
          bookmarkedIds: new Set(['M.1.1'])
        },
        { 'M.1.1': 'lit', 'M.1.2': 'review_due' }
      )
      engine.updateVisualState(snap)
    }

    // Camera flyTo, burst, theme, quality, view context, stepFrame
    engine.flyToNode('M.1.1', { offsetRightPx: 380, distance: 40 })
    expect(telemetry.isFlying).toBe(true)
    engine.stepFrame(0.016)
    expect(telemetry.frameCount).toBe(1)

    const proj = telemetry.projectNodeToScreen('M.1.1')
    expect(proj).not.toBeNull()

    engine.triggerLightUpBurst('M.1.1', ['M.1.2'])
    expect(telemetry.lastBurstAt).toBeGreaterThan(0)
    engine.stepFrame(0.1)
    expect(engine.particleBurst.activeParticleCount).toBeGreaterThan(0)

    engine.setTheme('daylight')
    engine.setTheme('minimal')
    engine.setQuality('eco')
    engine.setQuality('balanced')
    engine.setOrbitPaused(true)
    engine.setViewContext('unit', 'M.1.1')
    expect(telemetry.activeView).toBe('unit')

    engine.resetView()
    engine.dispose()
    expect(telemetryHost['__LITREE_TELEMETRY__']).toBeUndefined()
  })

  it('applies Semantic LOD to distant leaves while keeping selected/focus leaves full alpha', () => {
    const engine = new NebulaEngine(
      createMockContainer(),
      {
        onSelect: () => {},
        onDrillDown: () => {},
        onHover: () => {},
        onContextLost: () => {}
      },
      { reducedMotion: true }
    )

    const devLayout = computeGalaxyLayout(devMiniPack, devMiniIndex)
    engine.setGraph(devMiniPack, devLayout, devMiniIndex)

    const starCores = engine.scene.getObjectByName('nebula-star-cores') as THREE.InstancedMesh
    expect(starCores).toBeDefined()
    const emphAttr = starCores.geometry.getAttribute('aEmphasis') as THREE.InstancedBufferAttribute
    const u1k1Idx = devMiniPack.nodes.findIndex((n) => n.id === 'u1.k1')
    const u1k2Idx = devMiniPack.nodes.findIndex((n) => n.id === 'u1.k2')

    // Move camera far away in galaxy view -> unselected leaves dim, selected leaf stays 1.0
    engine.camera.position.set(0, 120, 300)
    engine.cameraRig.controls.target.set(0, 0, 0)
    engine.setViewContext('galaxy', null)
    engine.updateVisualState(
      makeSnapshot(devMiniPack, {
        selectedId: 'u1.k1'
      })
    )
    const selectedAlpha = emphAttr.array[u1k1Idx * 2 + 1]!
    const unselectedAlpha = emphAttr.array[u1k2Idx * 2 + 1]!
    expect(selectedAlpha).toBeCloseTo(1.0, 3)
    expect(unselectedAlpha).toBeLessThan(0.6)

    // Switch to unit view -> all visible leaves return to full alpha 1.0
    engine.setViewContext('unit', 'u1')
    expect(emphAttr.array[u1k2Idx * 2 + 1]).toBeCloseTo(1.0, 3)

    engine.dispose()
  })

  it('supports 2-arg setGraph(pack, layout), focusTimer auto-orbit, daylight burst blending, and idempotent dispose', () => {
    const engine = new NebulaEngine(
      createMockContainer(),
      {
        onSelect: () => {},
        onDrillDown: () => {},
        onHover: () => {},
        onContextLost: () => {}
      },
      { reducedMotion: true }
    )

    const csLayout = computeGalaxyLayout(csMathPack, csMathIndex)
    // Call setGraph with 2 args matching PROJECT.md § Interface Contracts § 3
    engine.setGraph(csMathPack, csLayout)
    engine.setViewContext('branch', 'M1')
    engine.updateVisualState(
      makeSnapshot(csMathPack, {
        focusTimerNodeId: 'M.1.1'
      })
    )
    expect(engine.cameraRig.controls.autoRotate).toBe(true)

    engine.setOrbitPaused(true)
    expect(engine.cameraRig.controls.autoRotate).toBe(false)
    engine.setOrbitPaused(false)
    expect(engine.cameraRig.controls.autoRotate).toBe(true)

    engine.setTheme('daylight')
    expect(engine.particleBurst.points.material.blending).toBe(THREE.NormalBlending)
    expect(engine.particleBurst.shockwaveMesh.material.blending).toBe(THREE.NormalBlending)

    engine.dispose()
    expect(() => engine.dispose()).not.toThrow()
  })

  it('hides starCores, orbitalRings, clouds, and filaments when pack has N === 0 nodes', () => {
    const engine = new NebulaEngine(
      createMockContainer(),
      {
        onSelect: () => {},
        onDrillDown: () => {},
        onHover: () => {},
        onContextLost: () => {}
      },
      { reducedMotion: true }
    )

    const emptyPack: PackDocument = {
      schema: 'litree/pack-v2',
      id: 'empty-pack',
      version: 1,
      title: { zh: 'Empty', en: 'Empty' },
      source: 'custom',
      domains: [],
      nodes: [],
      edges: [],
      routes: []
    }
    const emptyIndex = buildGraphIndex(emptyPack)
    const emptyLayout = computeGalaxyLayout(emptyPack, emptyIndex)

    engine.setGraph(emptyPack, emptyLayout, emptyIndex)

    const starCores = engine.scene.getObjectByName('nebula-star-cores') as THREE.InstancedMesh
    const orbitalRings = engine.scene.getObjectByName('nebula-orbital-rings') as THREE.InstancedMesh
    const clouds = engine.scene.getObjectByName('nebula-domain-clouds') as THREE.Points
    const filaments = engine.scene.getObjectByName('nebula-filaments') as THREE.LineSegments

    expect(starCores.visible).toBe(false)
    expect(starCores.count).toBe(0)
    expect(orbitalRings.visible).toBe(false)
    expect(orbitalRings.count).toBe(0)
    expect(clouds.visible).toBe(false)
    expect(filaments.visible).toBe(false)

    expect(() => engine.updateVisualState(makeSnapshot(emptyPack))).not.toThrow()
    engine.dispose()
  })

  it('handles pointer click/button/drag/hover-dedup/dblclick and webglcontextlost/restored via canvas listeners', () => {
    const rafQueue = new Map<number, FrameRequestCallback>()
    let nextRafId = 1
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const id = nextRafId++
      rafQueue.set(id, cb)
      return id
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      rafQueue.delete(id)
    })

    try {
      const canvasListeners = new Map<string, Set<EventListener>>()
      const docListeners = new Map<string, Set<EventListener>>()
      const attrs = new Map<string, string>()
      const emitCanvas = (type: string, evt: unknown) => {
        for (const fn of canvasListeners.get(type) ?? []) {
          fn(evt as Event)
        }
      }
      const noopDoc = {
        addEventListener: (type: string, fn: EventListener) => {
          let set = docListeners.get(type)
          if (!set) {
            set = new Set()
            docListeners.set(type, set)
          }
          set.add(fn)
        },
        removeEventListener: (type: string, fn: EventListener) => {
          docListeners.get(type)?.delete(fn)
        }
      }
      const mockCanvas = {
        style: {} as Record<string, string>,
        clientWidth: 1280,
        clientHeight: 800,
        parentNode: null as unknown,
        ownerDocument: noopDoc,
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
        getRootNode: () => noopDoc,
        setAttribute: (k: string, v: string) => attrs.set(k, v),
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 1280,
          height: 800,
          right: 1280,
          bottom: 800,
          x: 0,
          y: 0,
          toJSON: () => ({})
        }),
        addEventListener: (type: string, fn: EventListener) => {
          let set = canvasListeners.get(type)
          if (!set) {
            set = new Set()
            canvasListeners.set(type, set)
          }
          set.add(fn)
        },
        removeEventListener: (type: string, fn: EventListener) => {
          canvasListeners.get(type)?.delete(fn)
        }
      } as unknown as HTMLCanvasElement

      const container = {
        ...createMockContainer(1280, 800),
        appendChild: (el: { parentNode?: unknown }) => {
          el.parentNode = container
        },
        removeChild: (el: { parentNode?: unknown }) => {
          el.parentNode = null
        }
      } as unknown as HTMLElement

      const onSelect = vi.fn()
      const onDrillDown = vi.fn()
      const onHover = vi.fn()
      const onContextLost = vi.fn()
      const telemetryHost: Record<string, unknown> = {}

      const engine = new NebulaEngine(
        container,
        { onSelect, onDrillDown, onHover, onContextLost },
        {
          reducedMotion: true,
          telemetryTarget: telemetryHost,
          createRenderer: () => ({
            domElement: mockCanvas,
            setPixelRatio: () => {},
            setSize: () => {},
            setClearColor: () => {},
            render: () => {},
            dispose: () => {}
          })
        }
      )

      const telemetry = telemetryHost['__LITREE_TELEMETRY__'] as ReturnType<
        NebulaEngine['getTelemetrySnapshot']
      >
      expect(attrs.get('data-testid')).toBe('nebula-canvas')
      expect(telemetry.ready).toBe(true)
      expect(telemetry.rendererMode).toBe('webgl2')
      expect(onContextLost).not.toHaveBeenCalled()

      // Single pinned branch node at world origin (0, 0, 0)
      const singlePack: PackDocument = {
        schema: 'litree/pack-v2',
        id: 'single-hit-pack',
        version: 1,
        title: { zh: 'Single', en: 'Single' },
        source: 'custom',
        domains: [{ id: 'D1', name: 'D1', color: '#38bdf8' }],
        nodes: [
          {
            id: 'b1',
            parentId: null,
            kind: 'branch',
            title: { zh: 'Root Branch' },
            domainId: 'D1',
            position3D: [0, 0, 0]
          }
        ],
        edges: [],
        routes: []
      }
      const singleIndex = buildGraphIndex(singlePack)
      const singleLayout = computeGalaxyLayout(singlePack, singleIndex)
      engine.setGraph(singlePack, singleLayout, singleIndex)
      engine.camera.position.set(0, 0, 30)
      engine.cameraRig.controls.target.set(0, 0, 0)
      engine.cameraRig.controls.update()

      // Seed a snapshot with stale hoveredId: null to verify hover deduplication uses lastEmittedHoverId
      engine.updateVisualState(makeSnapshot(singlePack, { hoveredId: null }))

      // 1. Primary mouse click on node center (640, 400) -> selects 'b1'
      emitCanvas('pointerdown', { pointerType: 'mouse', button: 0, clientX: 640, clientY: 400 })
      emitCanvas('pointerup', { pointerType: 'mouse', button: 0, clientX: 642, clientY: 401 })
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect).toHaveBeenLastCalledWith('b1')

      // 2. Right-click & middle-click on node center -> ignored
      emitCanvas('pointerdown', { pointerType: 'mouse', button: 2, clientX: 640, clientY: 400 })
      emitCanvas('pointerup', { pointerType: 'mouse', button: 2, clientX: 640, clientY: 400 })
      emitCanvas('pointerdown', { pointerType: 'mouse', button: 1, clientX: 640, clientY: 400 })
      emitCanvas('pointerup', { pointerType: 'mouse', button: 1, clientX: 640, clientY: 400 })
      expect(onSelect).toHaveBeenCalledTimes(1)

      // 3. Drag > 5px -> ignored
      emitCanvas('pointerdown', { pointerType: 'mouse', button: 0, clientX: 640, clientY: 400 })
      emitCanvas('pointerup', { pointerType: 'mouse', button: 0, clientX: 652, clientY: 400 })
      expect(onSelect).toHaveBeenCalledTimes(1)

      // 4. Touch tap on empty space -> selects null
      emitCanvas('pointerdown', { pointerType: 'touch', button: 0, clientX: 20, clientY: 20 })
      emitCanvas('pointerup', { pointerType: 'touch', button: 0, clientX: 20, clientY: 20 })
      expect(onSelect).toHaveBeenCalledTimes(2)
      expect(onSelect).toHaveBeenLastCalledWith(null)

      // 5. Hover over node deduplicates without waiting for snapshot.hoveredId update
      const flushLatestHoverRaf = () => {
        const entries = [...rafQueue.entries()]
        const last = entries[entries.length - 1]
        if (last) {
          rafQueue.delete(last[0])
          last[1](16)
        }
      }
      emitCanvas('pointermove', { clientX: 640, clientY: 400 })
      flushLatestHoverRaf()
      expect(onHover).toHaveBeenCalledTimes(1)
      expect(onHover).toHaveBeenLastCalledWith('b1')

      // Second pointermove over same node while lastSnapshot.hoveredId is still null -> NO duplicate emission
      emitCanvas('pointermove', { clientX: 641, clientY: 400 })
      flushLatestHoverRaf()
      expect(onHover).toHaveBeenCalledTimes(1)

      // Zoom camera >2% triggering stepFrame -> updateSemanticLod -> updateVisualState(lastSnapshot)
      // plus setTheme / setQuality / setViewContext must NOT reset lastEmittedHoverId
      engine.camera.position.set(0, 0, 45)
      engine.cameraRig.controls.update()
      engine.stepFrame(0.016)
      engine.setTheme('daylight')
      engine.setQuality('eco')
      engine.setViewContext('branch', null)

      emitCanvas('pointermove', { clientX: 640, clientY: 400 })
      flushLatestHoverRaf()
      expect(onHover).toHaveBeenCalledTimes(1)

      // pointerleave emits null once, and repeating pointerleave is a no-op
      emitCanvas('pointerleave', {})
      expect(onHover).toHaveBeenCalledTimes(2)
      expect(onHover).toHaveBeenLastCalledWith(null)
      emitCanvas('pointerleave', {})
      expect(onHover).toHaveBeenCalledTimes(2)

      // Hovering again after setGraph resets lastEmittedHoverId cleanly
      emitCanvas('pointermove', { clientX: 640, clientY: 400 })
      flushLatestHoverRaf()
      expect(onHover).toHaveBeenCalledTimes(3)
      expect(onHover).toHaveBeenLastCalledWith('b1')
      engine.setGraph(singlePack, singleLayout, singleIndex)
      engine.camera.position.set(0, 0, 30)
      engine.cameraRig.controls.update()
      emitCanvas('pointermove', { clientX: 640, clientY: 400 })
      flushLatestHoverRaf()
      expect(onHover).toHaveBeenCalledTimes(4)
      expect(onHover).toHaveBeenLastCalledWith('b1')

      // 6. Double-click drills down only when hitting a node
      emitCanvas('dblclick', { clientX: 640, clientY: 400 })
      expect(onDrillDown).toHaveBeenCalledTimes(1)
      expect(onDrillDown).toHaveBeenLastCalledWith('b1')
      emitCanvas('dblclick', { clientX: 20, clientY: 20 })
      expect(onDrillDown).toHaveBeenCalledTimes(1)

      // 7. WebGL context lost & restored
      const preventDefault = vi.fn()
      emitCanvas('webglcontextlost', { preventDefault })
      expect(preventDefault).toHaveBeenCalledTimes(1)
      expect(onContextLost).toHaveBeenCalledTimes(1)
      expect(telemetry.rendererMode).toBe('fallback-2d')
      expect(telemetry.ready).toBe(false)

      const starCores = engine.scene.getObjectByName('nebula-star-cores') as THREE.InstancedMesh
      const prevStarVersion = starCores.instanceMatrix.version
      emitCanvas('webglcontextrestored', {})
      expect(telemetry.rendererMode).toBe('webgl2')
      expect(telemetry.ready).toBe(true)
      expect(starCores.instanceMatrix.version).toBeGreaterThan(prevStarVersion)

      // 8. dispose detaches all canvas listeners
      engine.dispose()
      for (const [, set] of canvasListeners) {
        expect(set.size).toBe(0)
      }
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('fires InstancedMesh dispose events on starCoresMesh and orbitalRingsMesh across setGraph() hot-swap and engine.dispose()', () => {
    const engine = new NebulaEngine(
      createMockContainer(),
      {
        onSelect: () => {},
        onDrillDown: () => {},
        onHover: () => {},
        onContextLost: () => {}
      },
      { reducedMotion: true }
    )

    const devLayout = computeGalaxyLayout(devMiniPack, devMiniIndex)
    engine.setGraph(devMiniPack, devLayout, devMiniIndex)

    const star1 = engine.scene.getObjectByName('nebula-star-cores') as THREE.InstancedMesh
    const ring1 = engine.scene.getObjectByName('nebula-orbital-rings') as THREE.InstancedMesh
    expect(star1).toBeInstanceOf(THREE.InstancedMesh)
    expect(ring1).toBeInstanceOf(THREE.InstancedMesh)

    const star1Dispose = vi.fn()
    const ring1Dispose = vi.fn()
    star1.addEventListener('dispose', star1Dispose)
    ring1.addEventListener('dispose', ring1Dispose)

    // Hot-swap graph -> previous InstancedMesh instances must dispatch 'dispose'
    const csLayout = computeGalaxyLayout(csMathPack, csMathIndex)
    engine.setGraph(csMathPack, csLayout, csMathIndex)
    expect(star1Dispose).toHaveBeenCalledTimes(1)
    expect(ring1Dispose).toHaveBeenCalledTimes(1)

    const star2 = engine.scene.getObjectByName('nebula-star-cores') as THREE.InstancedMesh
    const ring2 = engine.scene.getObjectByName('nebula-orbital-rings') as THREE.InstancedMesh
    expect(star2).not.toBe(star1)
    expect(ring2).not.toBe(ring1)

    const star2Dispose = vi.fn()
    const ring2Dispose = vi.fn()
    star2.addEventListener('dispose', star2Dispose)
    ring2.addEventListener('dispose', ring2Dispose)

    // Engine disposal -> active InstancedMesh instances must dispatch 'dispose'
    engine.dispose()
    expect(star2Dispose).toHaveBeenCalledTimes(1)
    expect(ring2Dispose).toHaveBeenCalledTimes(1)
  })

  it('treats post-dispose() mutating calls and ResizeObserver callbacks as no-ops and clears cached telemetry state', () => {
    const resizeCallbacks: Array<() => void> = []
    const MockResizeObserver = class {
      constructor(cb: () => void) {
        resizeCallbacks.push(cb)
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver)

    try {
      let boxW = 1000
      let boxH = 600
      const setSize = vi.fn()
      const noopDoc = {
        addEventListener: () => {},
        removeEventListener: () => {}
      }
      const mockCanvas = {
        style: {} as Record<string, string>,
        clientWidth: 1000,
        clientHeight: 600,
        parentNode: null as unknown,
        ownerDocument: noopDoc,
        getRootNode: () => noopDoc,
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
        setAttribute: () => {},
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: boxW,
          height: boxH,
          right: boxW,
          bottom: boxH,
          x: 0,
          y: 0,
          toJSON: () => ({})
        }),
        addEventListener: () => {},
        removeEventListener: () => {}
      } as unknown as HTMLCanvasElement

      const container = {
        get clientWidth() {
          return boxW
        },
        get clientHeight() {
          return boxH
        },
        appendChild: (el: { parentNode?: unknown }) => {
          el.parentNode = container
        },
        removeChild: (el: { parentNode?: unknown }) => {
          el.parentNode = null
        },
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: boxW,
          height: boxH,
          right: boxW,
          bottom: boxH,
          x: 0,
          y: 0,
          toJSON: () => ({})
        })
      } as unknown as HTMLElement

      const telemetryHost: Record<string, unknown> = {}
      const engine = new NebulaEngine(
        container,
        {
          onSelect: () => {},
          onDrillDown: () => {},
          onHover: () => {},
          onContextLost: () => {}
        },
        {
          reducedMotion: true,
          telemetryTarget: telemetryHost,
          createRenderer: () => ({
            domElement: mockCanvas,
            setPixelRatio: () => {},
            setSize,
            setClearColor: () => {},
            render: () => {},
            dispose: () => {}
          })
        }
      )

      const cachedTelemetry = telemetryHost['__LITREE_TELEMETRY__'] as ReturnType<
        NebulaEngine['getTelemetrySnapshot']
      >
      const devLayout = computeGalaxyLayout(devMiniPack, devMiniIndex)
      engine.setGraph(devMiniPack, devLayout, devMiniIndex)
      engine.updateVisualState(
        makeSnapshot(devMiniPack, { selectedId: 'u1', hoveredId: 'u1.k1' })
      )

      expect(cachedTelemetry.ready).toBe(true)
      expect(cachedTelemetry.nodeCount).toBe(11)
      expect(cachedTelemetry.edgeCount).toBe(2)
      expect(cachedTelemetry.selectedId).toBe('u1')
      expect(cachedTelemetry.hoveredId).toBe('u1.k1')
      expect(cachedTelemetry.projectNodeToScreen('u1')).not.toBeNull()

      const setSizeCallsBeforeDispose = setSize.mock.calls.length
      engine.dispose()

      // Cached telemetry immediately reflects disposed/cleared state
      expect(telemetryHost['__LITREE_TELEMETRY__']).toBeUndefined()
      expect(cachedTelemetry.ready).toBe(false)
      expect(cachedTelemetry.nodeCount).toBe(0)
      expect(cachedTelemetry.edgeCount).toBe(0)
      expect(cachedTelemetry.selectedId).toBeNull()
      expect(cachedTelemetry.hoveredId).toBeNull()
      expect(cachedTelemetry.projectNodeToScreen('u1')).toBeNull()

      const childrenAfterDispose = engine.scene.children.length

      // Post-dispose mutators & resize callback must be strict no-ops
      boxW = 800
      boxH = 500
      for (const cb of resizeCallbacks) cb()
      engine.setGraph(devMiniPack, devLayout, devMiniIndex)
      engine.updateVisualState(makeSnapshot(devMiniPack, { selectedId: 'u1' }))
      engine.flyToNode('u1')
      engine.resetView()
      engine.triggerLightUpBurst('u1', ['u1.k1'])
      engine.setTheme('daylight')
      engine.setQuality('eco')
      engine.setOrbitPaused(true)
      engine.setViewContext('unit', 'u1')

      expect(engine.scene.children.length).toBe(childrenAfterDispose)
      expect(setSize).toHaveBeenCalledTimes(setSizeCallsBeforeDispose)
      expect(cachedTelemetry.nodeCount).toBe(0)
      expect(cachedTelemetry.edgeCount).toBe(0)
      expect(cachedTelemetry.selectedId).toBeNull()
      expect(cachedTelemetry.projectNodeToScreen('u1')).toBeNull()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('setTheme() before first updateVisualState() updates starCoresMesh, orbitalRingsMesh, and filamentsMesh colors', () => {
    const engine = new NebulaEngine(
      createMockContainer(),
      {
        onSelect: () => {},
        onDrillDown: () => {},
        onHover: () => {},
        onContextLost: () => {}
      },
      { reducedMotion: true, theme: 'nebula' }
    )

    const devLayout = computeGalaxyLayout(devMiniPack, devMiniIndex)
    engine.setGraph(devMiniPack, devLayout, devMiniIndex)

    const starCores = engine.scene.getObjectByName('nebula-star-cores') as THREE.InstancedMesh
    const orbitalRings = engine.scene.getObjectByName('nebula-orbital-rings') as THREE.InstancedMesh
    const filaments = engine.scene.getObjectByName('nebula-filaments') as THREE.LineSegments

    const readColor = (mesh: THREE.InstancedMesh, idx: number) => {
      const c = new THREE.Color()
      mesh.getColorAt(idx, c)
      return c
    }

    // Initially nebula available (#38bdf8) & nebula lit (#f5c451)
    const nebulaAvail = new THREE.Color('#38bdf8')
    const initialStarColor = readColor(starCores, 0)
    expect(initialStarColor.r).toBeCloseTo(nebulaAvail.r, 4)
    expect(initialStarColor.g).toBeCloseTo(nebulaAvail.g, 4)
    expect(initialStarColor.b).toBeCloseTo(nebulaAvail.b, 4)

    const prevStarColVer = starCores.instanceColor?.version ?? 0
    const prevRingColVer = orbitalRings.instanceColor?.version ?? 0
    const filamentColAttr = filaments.geometry.getAttribute('aColor') as THREE.BufferAttribute
    const prevFilColVer = filamentColAttr.version

    // Switch to daylight before any updateVisualState() call
    engine.setTheme('daylight')

    const daylightAvail = new THREE.Color('#0284c7')
    const daylightLit = new THREE.Color('#d97706')
    const daylightEdgeDim = new THREE.Color('#94a3b8')

    const updatedStarColor = readColor(starCores, 0)
    expect(updatedStarColor.r).toBeCloseTo(daylightAvail.r, 4)
    expect(updatedStarColor.g).toBeCloseTo(daylightAvail.g, 4)
    expect(updatedStarColor.b).toBeCloseTo(daylightAvail.b, 4)
    expect(starCores.instanceColor!.version).toBeGreaterThan(prevStarColVer)

    const updatedRingColor = readColor(orbitalRings, 0)
    expect(updatedRingColor.r).toBeCloseTo(daylightLit.r, 4)
    expect(updatedRingColor.g).toBeCloseTo(daylightLit.g, 4)
    expect(updatedRingColor.b).toBeCloseTo(daylightLit.b, 4)
    expect(orbitalRings.instanceColor!.version).toBeGreaterThan(prevRingColVer)

    // dev-mini edges are both 'hard' -> should match daylight.edges.dim
    expect(filamentColAttr.array[0]).toBeCloseTo(daylightEdgeDim.r, 4)
    expect(filamentColAttr.array[1]).toBeCloseTo(daylightEdgeDim.g, 4)
    expect(filamentColAttr.array[2]).toBeCloseTo(daylightEdgeDim.b, 4)
    expect(filamentColAttr.version).toBeGreaterThan(prevFilColVer)

    engine.dispose()
  })

  it('handleResize() skips 0x0 collapsed containers while preserving constructor 1280x800 fallback and resizing positive dimensions', () => {
    const resizeCallbacks: Array<() => void> = []
    const MockResizeObserver = class {
      constructor(cb: () => void) {
        resizeCallbacks.push(cb)
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver)

    try {
      let boxW = 0
      let boxH = 0
      const setSize = vi.fn()
      const noopDoc = {
        addEventListener: () => {},
        removeEventListener: () => {}
      }
      const mockCanvas = {
        style: {} as Record<string, string>,
        clientWidth: 0,
        clientHeight: 0,
        parentNode: null as unknown,
        ownerDocument: noopDoc,
        getRootNode: () => noopDoc,
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
        setAttribute: () => {},
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: boxW,
          height: boxH,
          right: boxW,
          bottom: boxH,
          x: 0,
          y: 0,
          toJSON: () => ({})
        }),
        addEventListener: () => {},
        removeEventListener: () => {}
      } as unknown as HTMLCanvasElement

      const container = {
        get clientWidth() {
          return boxW
        },
        get clientHeight() {
          return boxH
        },
        appendChild: (el: { parentNode?: unknown }) => {
          el.parentNode = container
        },
        removeChild: (el: { parentNode?: unknown }) => {
          el.parentNode = null
        },
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: boxW,
          height: boxH,
          right: boxW,
          bottom: boxH,
          x: 0,
          y: 0,
          toJSON: () => ({})
        })
      } as unknown as HTMLElement

      const engine = new NebulaEngine(
        container,
        {
          onSelect: () => {},
          onDrillDown: () => {},
          onHover: () => {},
          onContextLost: () => {}
        },
        {
          reducedMotion: true,
          createRenderer: () => ({
            domElement: mockCanvas,
            setPixelRatio: () => {},
            setSize,
            setClearColor: () => {},
            render: () => {},
            dispose: () => {}
          })
        }
      )

      // Constructor preserves 1280x800 fallback for initial 0x0 container
      expect(setSize).toHaveBeenCalledTimes(1)
      expect(setSize).toHaveBeenLastCalledWith(1280, 800, false)

      // ResizeObserver firing while collapsed 0x0 must NOT trigger renderer.setSize(1280, 800, false)
      expect(resizeCallbacks.length).toBe(1)
      for (const cb of resizeCallbacks) cb()
      expect(setSize).toHaveBeenCalledTimes(1)

      // Expanding to 960x540 triggers resize cleanly
      boxW = 960
      boxH = 540
      for (const cb of resizeCallbacks) cb()
      expect(setSize).toHaveBeenCalledTimes(2)
      expect(setSize).toHaveBeenLastCalledWith(960, 540, false)
      expect(engine.camera.aspect).toBeCloseTo(960 / 540, 4)

      // Collapsing back to 0x0 skips resize
      boxW = 0
      boxH = 0
      for (const cb of resizeCallbacks) cb()
      expect(setSize).toHaveBeenCalledTimes(2)

      engine.dispose()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('detectWebGL() releases its temporary probe WebGL2 context via WEBGL_lose_context', () => {
    const loseContext = vi.fn()
    const getExtension = vi.fn((name: string) => {
      if (name === 'WEBGL_debug_renderer_info') {
        return { UNMASKED_RENDERER_WEBGL: 0x9246 }
      }
      if (name === 'WEBGL_lose_context') {
        return { loseContext }
      }
      return null
    })
    const getParameter = vi.fn(() => 'Mock SwiftShader WebGL2')
    const mockGl = { getExtension, getParameter }
    vi.stubGlobal('document', {
      createElement: (tag: string) => {
        if (tag !== 'canvas') return {}
        return {
          getContext: (kind: string) => (kind === 'webgl2' ? mockGl : null)
        }
      }
    })

    try {
      const res = detectWebGL()
      expect(res).toEqual({
        supported: true,
        rendererMode: 'webgl2',
        glRenderer: 'Mock SwiftShader WebGL2'
      })
      expect(getExtension).toHaveBeenCalledWith('WEBGL_lose_context')
      expect(loseContext).toHaveBeenCalledTimes(1)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
