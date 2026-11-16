import * as THREE from 'three'
import { buildGraphIndex } from '../core/graph'
import type {
  ActiveLens,
  GraphIndex,
  LitreeTelemetry,
  NebulaVisualSnapshot,
  NodeVisualState,
  PackDocument,
  QualityPreset,
  ThemeMode,
  ViewLevel
} from '../core/types'
import type { GalaxyLayoutResult } from '../layout/galaxyLayout'
import { createNodeRng } from '../layout/galaxyLayout'
import { CameraRig } from './CameraRig'
import { ParticleBurstSystem } from './ParticleBurstSystem'
import {
  createFilamentMaterial,
  createNebulaCloudMaterial,
  createNebulaSpriteTexture,
  createOrbitalRingMaterial,
  createStarNodeMaterial,
  createStarfieldMaterial,
  QUALITY_CONFIGS,
  THEME_PALETTES,
  type ThemePalette
} from './shaders'
import { attachGlobalTelemetry, projectWorldToScreen, type ScreenRect } from './telemetry'

export type {
  LitreeTelemetry,
  NebulaVisualSnapshot,
  NodeVisualState,
  QualityPreset,
  ThemeMode,
  ViewLevel
}
export { QUALITY_CONFIGS, THEME_PALETTES }

export interface NebulaEngineCallbacks {
  onSelect: (id: string | null) => void
  onDrillDown: (id: string) => void
  onHover: (id: string | null) => void
  onContextLost: () => void
}

export interface NebulaRendererLike {
  domElement: HTMLCanvasElement
  setPixelRatio(value: number): void
  setSize(width: number, height: number, updateStyle?: boolean): void
  setClearColor(color: THREE.ColorRepresentation, alpha?: number): void
  render(scene: THREE.Object3D, camera: THREE.Camera): void
  dispose(): void
}

export interface NebulaEngineOptions {
  theme?: ThemeMode
  quality?: QualityPreset
  reducedMotion?: boolean
  telemetryTarget?: Record<string, unknown>
  createRenderer?: (params: THREE.WebGLRendererParameters) => NebulaRendererLike
}

export interface WebGLDetectionResult {
  supported: boolean
  rendererMode: 'webgl2' | 'fallback-2d'
  glRenderer: string
}

const CLICK_DRAG_THRESHOLD_PX = 5
const DEFAULT_BOUNDS_RADIUS = 80

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

function stateToFloat(state: NodeVisualState): number {
  switch (state) {
    case 'locked':
      return 0
    case 'available':
      return 1
    case 'queued':
      return 2
    case 'learning':
      return 3
    case 'lit':
      return 4
    case 'review_due':
      return 5
  }
}

function stateToColor(state: NodeVisualState, palette: ThemePalette): THREE.Color {
  return palette.states[state]
}

/**
 * Probes WebGL2 support cleanly without throwing in headless/Node environments.
 * Three.js 0.187 requires WebGL2 (`contextName = 'webgl2'`).
 */
export function detectWebGL(): WebGLDetectionResult {
  if (typeof document === 'undefined') {
    return { supported: false, rendererMode: 'fallback-2d', glRenderer: 'none' }
  }
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2', {
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    })
    if (!gl) {
      return { supported: false, rendererMode: 'fallback-2d', glRenderer: 'none' }
    }
    let glRenderer = 'webgl2'
    try {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info')
      if (dbg) {
        const raw = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
        if (typeof raw === 'string' && raw.length > 0) {
          glRenderer = raw
        }
      }
    } catch {
      // Ignore debug info errors under privacy-hardened browsers
    }
    try {
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      // Ignore context release errors
    }
    return { supported: true, rendererMode: 'webgl2', glRenderer }
  } catch {
    return { supported: false, rendererMode: 'fallback-2d', glRenderer: 'none' }
  }
}

const _rayToCenter = new THREE.Vector3()

/**
 * Fast CPU ray-sphere picker over flat typed arrays (`< 0.15 ms` for 10k nodes).
 * Nodes with `hitRadii[i] <= 0` are skipped.
 */
export function pickNodeAtRay(
  ray: THREE.Ray,
  positions: Float32Array,
  hitRadii: Float32Array,
  count: number
): number | null {
  let bestIdx: number | null = null
  let bestScore = Infinity
  const ox = ray.origin.x
  const oy = ray.origin.y
  const oz = ray.origin.z
  const dx = ray.direction.x
  const dy = ray.direction.y
  const dz = ray.direction.z

  for (let i = 0; i < count; i++) {
    const r = hitRadii[i] ?? 0
    if (r <= 0) continue

    const px = positions[i * 3] ?? 0
    const py = positions[i * 3 + 1] ?? 0
    const pz = positions[i * 3 + 2] ?? 0

    const vx = px - ox
    const vy = py - oy
    const vz = pz - oz

    const tProj = vx * dx + vy * dy + vz * dz
    if (tProj < 0) continue

    _rayToCenter.set(vx - dx * tProj, vy - dy * tProj, vz - dz * tProj)
    const perpDistSq = _rayToCenter.lengthSq()
    const rSq = r * r
    if (perpDistSq > rSq) continue

    const hitDist = tProj - Math.sqrt(Math.max(0, rSq - perpDistSq))
    if (hitDist < bestScore) {
      bestScore = hitDist
      bestIdx = i
    }
  }

  return bestIdx
}

interface NodeRecord {
  id: string
  kind: 'branch' | 'unit' | 'leaf'
  domainId: string
  parentId: string | null
  core: boolean
  baseScale: number
  hitRadius: number
}

interface EdgeRecord {
  id: string
  from: string
  to: string
  type: 'hard' | 'soft' | 'related'
}

export class NebulaEngine {
  readonly scene: THREE.Scene
  readonly camera: THREE.PerspectiveCamera
  readonly cameraRig: CameraRig
  readonly particleBurst: ParticleBurstSystem

  private readonly container: HTMLElement
  private readonly callbacks: NebulaEngineCallbacks
  private readonly spriteTexture: THREE.Texture
  private readonly starfieldMat: THREE.ShaderMaterial
  private readonly cloudMat: THREE.ShaderMaterial
  private readonly starNodeMat: THREE.ShaderMaterial
  private readonly orbitalRingMat: THREE.ShaderMaterial
  private readonly filamentMat: THREE.ShaderMaterial

  private renderer: NebulaRendererLike | null = null
  private starfieldPoints: THREE.Points
  private nebulaCloudPoints: THREE.Points | null = null
  private starCoresMesh: THREE.InstancedMesh | null = null
  private orbitalRingsMesh: THREE.InstancedMesh | null = null
  private filamentsMesh: THREE.LineSegments | null = null

  private theme: ThemeMode
  private quality: QualityPreset
  private reducedMotion: boolean
  private rendererMode: 'webgl2' | 'webgl1' | 'fallback-2d' = 'fallback-2d'
  private glRenderer = 'none'
  private ready = false
  private disposed = false
  private frameCount = 0
  private activeView: ViewLevel | string = 'galaxy'
  private focusClusterId: string | null = null

  private pack: PackDocument | null = null
  private layout: GalaxyLayoutResult | null = null
  private graphIndex: GraphIndex | null = null
  private lastSnapshot: NebulaVisualSnapshot | null = null

  private nodeRecords: NodeRecord[] = []
  private nodeIndexById = new Map<string, number>()
  private nodePosFlat = new Float32Array(0)
  private nodeHitRadii = new Float32Array(0)
  private nodeBaseScale = new Float32Array(0)
  private nodeStateArr = new Float32Array(0)
  private nodeEmphasisArr = new Float32Array(0)
  private nodePhaseArr = new Float32Array(0)
  private ringModeArr = new Float32Array(0)
  private ringAlphaArr = new Float32Array(0)

  private edgeRecords: EdgeRecord[] = []
  private filamentSegsPerEdge = QUALITY_CONFIGS.high.bezierSegments
  private filamentColorArr = new Float32Array(0)
  private filamentStateArr = new Float32Array(0)
  private filamentAlphaArr = new Float32Array(0)

  private boundsRadius = DEFAULT_BOUNDS_RADIUS
  private lastLodDistance = -1
  private hasInitialCameraReset = false

  private rafId: number | null = null
  private hoverRafId: number | null = null
  private pendingPointerEvent: { clientX: number; clientY: number } | null = null
  private pointerDownPos: { x: number; y: number } | null = null
  private lastEmittedHoverId: string | null = null
  private lastClockMs = 0
  private resizeObserver: ResizeObserver | null = null
  private detachTelemetry: () => void = () => {}

  private readonly raycaster = new THREE.Raycaster()
  private readonly pointerNdc = new THREE.Vector2()
  private readonly tmpMatrix = new THREE.Matrix4()
  private readonly tmpPos = new THREE.Vector3()
  private readonly tmpQuat = new THREE.Quaternion()
  private readonly tmpScale = new THREE.Vector3()
  private readonly tmpColor = new THREE.Color()

  private readonly boundOnPointerDown = (e: PointerEvent) => this.handlePointerDown(e)
  private readonly boundOnPointerMove = (e: PointerEvent) => this.handlePointerMove(e)
  private readonly boundOnPointerUp = (e: PointerEvent) => this.handlePointerUp(e)
  private readonly boundOnPointerLeave = () => this.handlePointerLeave()
  private readonly boundOnDblClick = (e: MouseEvent) => this.handleDblClick(e)
  private readonly boundOnContextLost = (e: Event) => this.handleContextLost(e)
  private readonly boundOnContextRestored = () => this.handleContextRestored()
  private readonly boundOnWindowResize = () => this.handleResize()

  constructor(
    container: HTMLElement,
    callbacks: NebulaEngineCallbacks,
    options?: NebulaEngineOptions
  ) {
    this.container = container
    this.callbacks = callbacks
    this.theme = options?.theme ?? 'nebula'
    this.quality = options?.quality ?? 'high'

    const prefersReduced =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false
    this.reducedMotion = options?.reducedMotion ?? prefersReduced

    this.scene = new THREE.Scene()
    const rect = this.getContainerRect()
    const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 16 / 10

    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.5, 6000)
    this.camera.position.set(0, 60, 180)
    this.camera.lookAt(0, 0, 0)

    this.spriteTexture = createNebulaSpriteTexture()
    this.starfieldMat = createStarfieldMaterial()
    this.cloudMat = createNebulaCloudMaterial(this.spriteTexture)
    this.starNodeMat = createStarNodeMaterial()
    this.orbitalRingMat = createOrbitalRingMaterial()
    this.filamentMat = createFilamentMaterial()

    this.starfieldPoints = this.createBackgroundStarfield()
    this.scene.add(this.starfieldPoints)

    this.particleBurst = new ParticleBurstSystem(this.spriteTexture)
    this.particleBurst.setReducedMotion(this.reducedMotion)
    this.particleBurst.setMaxParticles(QUALITY_CONFIGS[this.quality].maxBurstParticles)
    this.scene.add(this.particleBurst.points)
    this.scene.add(this.particleBurst.shockwaveMesh)

    const detection = options?.createRenderer
      ? { supported: true, rendererMode: 'webgl2' as const, glRenderer: 'mock-webgl2' }
      : detectWebGL()
    let domElement: HTMLElement | null = null

    if (detection.supported) {
      try {
        const qCfg = QUALITY_CONFIGS[this.quality]
        const rendererParams: THREE.WebGLRendererParameters = {
          antialias: qCfg.antialias,
          alpha: false,
          powerPreference: 'high-performance'
        }
        const renderer = options?.createRenderer
          ? options.createRenderer(rendererParams)
          : new THREE.WebGLRenderer(rendererParams)
        const dpr =
          typeof window !== 'undefined'
            ? Math.min(window.devicePixelRatio || 1, qCfg.dprCap)
            : 1
        renderer.setPixelRatio(dpr)
        renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false)
        renderer.domElement.setAttribute('data-testid', 'nebula-canvas')
        renderer.domElement.style.width = '100%'
        renderer.domElement.style.height = '100%'
        renderer.domElement.style.display = 'block'

        this.container.appendChild(renderer.domElement)
        this.renderer = renderer
        domElement = renderer.domElement
        this.rendererMode = detection.rendererMode
        this.glRenderer = detection.glRenderer
        this.ready = true
      } catch {
        this.renderer = null
        this.rendererMode = 'fallback-2d'
        this.glRenderer = 'none'
        this.ready = false
      }
    }

    this.cameraRig = new CameraRig(this.camera, domElement)
    this.cameraRig.setViewportSize(rect.width, rect.height)

    this.applyThemeUniforms()
    this.applyQualityUniforms()
    this.applyReducedMotionUniforms()

    if (domElement) {
      domElement.addEventListener('pointerdown', this.boundOnPointerDown)
      domElement.addEventListener('pointermove', this.boundOnPointerMove)
      domElement.addEventListener('pointerup', this.boundOnPointerUp)
      domElement.addEventListener('pointerleave', this.boundOnPointerLeave)
      domElement.addEventListener('dblclick', this.boundOnDblClick)
      domElement.addEventListener('webglcontextlost', this.boundOnContextLost)
      domElement.addEventListener('webglcontextrestored', this.boundOnContextRestored)

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.handleResize())
        this.resizeObserver.observe(this.container)
      } else if (typeof window !== 'undefined') {
        window.addEventListener('resize', this.boundOnWindowResize)
      }
    } else {
      // Pre-flight WebGL unavailable: notify caller so 2D fallback can mount cleanly
      this.callbacks.onContextLost()
    }

    this.detachTelemetry = attachGlobalTelemetry(
      () => this.getTelemetrySnapshot(),
      options?.telemetryTarget
    )

    if (this.renderer && typeof requestAnimationFrame !== 'undefined') {
      this.startLoop()
    }
  }

  getTelemetrySnapshot(): LitreeTelemetry {
    const camPos = this.camera.position
    const camTgt = this.cameraRig.controls.target
    return {
      ready: this.ready,
      rendererMode: this.rendererMode,
      glRenderer: this.glRenderer,
      frameCount: this.frameCount,
      nodeCount: this.nodeRecords.length,
      edgeCount: this.edgeRecords.length,
      camera: {
        pos: [camPos.x, camPos.y, camPos.z],
        target: [camTgt.x, camTgt.y, camTgt.z],
        distance: this.cameraRig.distance
      },
      activeView: this.activeView,
      selectedId: this.lastSnapshot?.selectedId ?? null,
      hoveredId: this.lastSnapshot?.hoveredId ?? null,
      isFlying: this.cameraRig.isFlying,
      lastBurstAt: this.particleBurst.lastBurstAt,
      projectNodeToScreen: (id: string) => this.projectNodeToScreen(id)
    }
  }

  projectNodeToScreen(id: string): { x: number; y: number; inView: boolean } | null {
    if (this.disposed) return null
    const idx = this.nodeIndexById.get(id)
    if (idx === undefined) return null
    const wx = this.nodePosFlat[idx * 3]
    const wy = this.nodePosFlat[idx * 3 + 1]
    const wz = this.nodePosFlat[idx * 3 + 2]
    if (wx === undefined || wy === undefined || wz === undefined) return null
    const rect = this.getRenderRect()
    return projectWorldToScreen([wx, wy, wz], this.camera, rect)
  }

  setGraph(pack: PackDocument, layout: GalaxyLayoutResult, index?: GraphIndex): void {
    if (this.disposed) return
    this.pack = pack
    this.layout = layout
    this.graphIndex = index ?? buildGraphIndex(pack)
    this.lastEmittedHoverId = null
    this.boundsRadius = Math.max(20, layout.bounds.radius || DEFAULT_BOUNDS_RADIUS)
    this.cameraRig.setBoundsRadius(this.boundsRadius)

    this.disposeGraphMeshes()

    const N = pack.nodes.length
    this.nodeRecords = new Array(N)
    this.nodeIndexById.clear()
    this.nodePosFlat = new Float32Array(N * 3)
    this.nodeHitRadii = new Float32Array(N)
    this.nodeBaseScale = new Float32Array(N)
    this.nodeStateArr = new Float32Array(N)
    this.nodeEmphasisArr = new Float32Array(N * 2)
    this.nodePhaseArr = new Float32Array(N)
    this.ringModeArr = new Float32Array(N)
    this.ringAlphaArr = new Float32Array(N)

    const palette = THEME_PALETTES[this.theme]

    // 1. Domain volumetric nebula clouds (1 draw call)
    this.nebulaCloudPoints = this.createDomainClouds(pack, layout)
    this.scene.add(this.nebulaCloudPoints)

    // 2. Star cores & orbital rings InstancedMeshes (2 draw calls)
    const starGeom = new THREE.IcosahedronGeometry(1, 1)
    const ringGeom = new THREE.RingGeometry(1.42, 1.72, 24)
    const count = Math.max(1, N)

    const starCores = new THREE.InstancedMesh(starGeom, this.starNodeMat, count)
    starCores.name = 'nebula-star-cores'
    starCores.frustumCulled = false
    starCores.visible = N > 0

    const orbitalRings = new THREE.InstancedMesh(ringGeom, this.orbitalRingMat, count)
    orbitalRings.name = 'nebula-orbital-rings'
    orbitalRings.frustumCulled = false
    orbitalRings.visible = N > 0

    for (let i = 0; i < N; i++) {
      const node = pack.nodes[i]!
      const pos = layout.positions.get(node.id) ?? [0, 0, 0]
      const isStructuralBranch =
        node.kind === 'branch' &&
        (this.graphIndex ? this.graphIndex.owningUnit(node.id) === undefined : node.parentId === null)
      const baseScale =
        node.kind === 'branch'
          ? isStructuralBranch
            ? 2.2
            : 0.72
          : node.kind === 'unit'
            ? 1.4
            : 0.48
      const hitRadius = baseScale * 1.45

      this.nodeRecords[i] = {
        id: node.id,
        kind: node.kind,
        domainId: node.domainId,
        parentId: node.parentId,
        core: Boolean(node.core),
        baseScale,
        hitRadius
      }
      this.nodeIndexById.set(node.id, i)
      this.nodePosFlat[i * 3] = pos[0]
      this.nodePosFlat[i * 3 + 1] = pos[1]
      this.nodePosFlat[i * 3 + 2] = pos[2]
      this.nodeBaseScale[i] = baseScale
      this.nodeHitRadii[i] = hitRadius
      this.nodeStateArr[i] = 1
      this.nodeEmphasisArr[i * 2] = 0
      this.nodeEmphasisArr[i * 2 + 1] = 1
      this.nodePhaseArr[i] = createNodeRng(pack.id, node.id, 'phase')()
      this.ringModeArr[i] = 0
      this.ringAlphaArr[i] = 0

      this.tmpPos.set(pos[0], pos[1], pos[2])
      this.tmpQuat.identity()
      this.tmpScale.setScalar(baseScale)
      this.tmpMatrix.compose(this.tmpPos, this.tmpQuat, this.tmpScale)
      starCores.setMatrixAt(i, this.tmpMatrix)
      starCores.setColorAt(i, palette.states.available)

      this.tmpScale.setScalar(0.0001)
      this.tmpMatrix.compose(this.tmpPos, this.tmpQuat, this.tmpScale)
      orbitalRings.setMatrixAt(i, this.tmpMatrix)
      orbitalRings.setColorAt(i, palette.states.lit)
    }

    if (N === 0) {
      this.tmpMatrix.makeScale(0, 0, 0)
      starCores.setMatrixAt(0, this.tmpMatrix)
      starCores.setColorAt(0, palette.states.locked)
      orbitalRings.setMatrixAt(0, this.tmpMatrix)
      orbitalRings.setColorAt(0, palette.states.locked)
      starCores.count = 0
      orbitalRings.count = 0
    } else {
      starCores.count = N
      orbitalRings.count = N
    }

    starGeom.setAttribute('aState', new THREE.InstancedBufferAttribute(this.nodeStateArr, 1))
    starGeom.setAttribute('aEmphasis', new THREE.InstancedBufferAttribute(this.nodeEmphasisArr, 2))
    starGeom.setAttribute('aPhase', new THREE.InstancedBufferAttribute(this.nodePhaseArr, 1))

    ringGeom.setAttribute('aRingMode', new THREE.InstancedBufferAttribute(this.ringModeArr, 1))
    ringGeom.setAttribute('aAlpha', new THREE.InstancedBufferAttribute(this.ringAlphaArr, 1))

    starCores.instanceMatrix.needsUpdate = true
    if (starCores.instanceColor) starCores.instanceColor.needsUpdate = true
    orbitalRings.instanceMatrix.needsUpdate = true
    if (orbitalRings.instanceColor) orbitalRings.instanceColor.needsUpdate = true

    this.starCoresMesh = starCores
    this.orbitalRingsMesh = orbitalRings
    this.scene.add(starCores)
    this.scene.add(orbitalRings)

    // 3. Bezier dependency filaments LineSegments (1 draw call)
    this.edgeRecords = pack.edges.map((e) => ({
      id: e.id,
      from: e.from,
      to: e.to,
      type: e.type
    }))
    this.rebuildFilamentsMesh()

    if (!this.hasInitialCameraReset) {
      this.hasInitialCameraReset = true
      this.resetView(true)
    }

    if (this.lastSnapshot) {
      this.updateVisualState(this.lastSnapshot)
    } else {
      this.updateSemanticLod(true)
    }
  }

  updateVisualState(snapshot: NebulaVisualSnapshot): void {
    if (this.disposed) return
    this.lastSnapshot = snapshot
    const N = this.nodeRecords.length
    const palette = THEME_PALETTES[this.theme]

    // Auto-enable focus orbit during active Pomodoro session
    this.cameraRig.setFocusOrbit(snapshot.focusTimerNodeId !== null, 0.55)

    const domainFilterActive = snapshot.activeDomains.length > 0
    const activeDomainSet = domainFilterActive ? new Set(snapshot.activeDomains) : null
    const routeSet = snapshot.activeRouteUnitIds
      ? new Set(snapshot.activeRouteUnitIds)
      : null
    const pathNodeSet = snapshot.pathTraceHighlight
      ? new Set(snapshot.pathTraceHighlight.nodeIds)
      : null
    const pathEdgeSet = snapshot.pathTraceHighlight
      ? new Set(snapshot.pathTraceHighlight.edgeIds)
      : null
    const conflictEdgeSet =
      snapshot.cycleConflictEdgeIds.length > 0
        ? new Set(snapshot.cycleConflictEdgeIds)
        : null

    const focusSubtree =
      this.focusClusterId !== null && this.graphIndex
        ? this.collectFocusSubtree(this.focusClusterId)
        : null

    const starCores = this.starCoresMesh
    const orbitalRings = this.orbitalRingsMesh

    const distance = this.cameraRig.distance
    const galaxyFactor =
      this.activeView === 'unit'
        ? 0
        : clamp(
            (distance - this.boundsRadius * 0.45) / (Math.max(1, this.boundsRadius) * 0.75),
            0,
            1
          )
    this.lastLodDistance = distance
    const leafLodScale = 1.0 - 0.72 * galaxyFactor
    const leafLodAlpha = 1.0 - 0.68 * galaxyFactor

    for (let i = 0; i < N; i++) {
      const rec = this.nodeRecords[i]!
      const state: NodeVisualState = snapshot.nodeStates.get(rec.id) ?? 'available'
      this.nodeStateArr[i] = stateToFloat(state)

      const isSelected = snapshot.selectedId === rec.id
      const isHovered = snapshot.hoveredId === rec.id
      const isFocusTimer = snapshot.focusTimerNodeId === rec.id
      const isInPath = pathNodeSet ? pathNodeSet.has(rec.id) : false

      const domainMatch = !activeDomainSet || activeDomainSet.has(rec.domainId)
      const lensMatch = this.matchesLens(
        rec,
        state,
        snapshot.activeLens,
        routeSet,
        snapshot.bookmarkedIds
      )
      const clusterMatch = !focusSubtree || focusSubtree.has(rec.id)
      const alwaysShow = isSelected || isHovered || isFocusTimer || isInPath
      const visible = alwaysShow || (domainMatch && lensMatch && clusterMatch)

      let emphasis = 0
      if (isSelected || isFocusTimer) emphasis = 2
      else if (isHovered || isInPath) emphasis = 1
      this.nodeEmphasisArr[i * 2] = emphasis

      const isProminentLeaf =
        alwaysShow ||
        state === 'learning' ||
        state === 'queued' ||
        state === 'review_due'
      const lodScale = rec.kind === 'leaf' && !isProminentLeaf ? leafLodScale : 1.0
      const lodAlpha = rec.kind === 'leaf' && !isProminentLeaf ? leafLodAlpha : 1.0

      const alpha = visible ? lodAlpha : 0.015
      this.nodeEmphasisArr[i * 2 + 1] = alpha
      this.nodeHitRadii[i] = visible ? rec.baseScale * 1.45 * Math.max(0.6, lodScale) : 0

      if (starCores) {
        const px = this.nodePosFlat[i * 3] ?? 0
        const py = this.nodePosFlat[i * 3 + 1] ?? 0
        const pz = this.nodePosFlat[i * 3 + 2] ?? 0
        const scaleMult = isSelected || isFocusTimer ? 1.25 : isHovered ? 1.12 : 1.0
        this.tmpPos.set(px, py, pz)
        this.tmpQuat.identity()
        this.tmpScale.setScalar(visible ? rec.baseScale * lodScale * scaleMult : 0.0001)
        this.tmpMatrix.compose(this.tmpPos, this.tmpQuat, this.tmpScale)
        starCores.setMatrixAt(i, this.tmpMatrix)

        const baseColor = stateToColor(state, palette)
        if (isFocusTimer) {
          this.tmpColor.copy(palette.states.lit).lerp(baseColor, 0.3)
        } else {
          this.tmpColor.copy(baseColor)
        }
        starCores.setColorAt(i, this.tmpColor)
      }

      // Orbital rings for selected / focusTimer / review_due / learning / hovered
      let ringMode = 0
      if (isFocusTimer) ringMode = 2
      else if (isSelected) ringMode = 1
      else if (state === 'review_due' && visible) ringMode = 3
      else if (isHovered) ringMode = 5
      else if (state === 'learning' && visible) ringMode = 4

      this.ringModeArr[i] = ringMode
      this.ringAlphaArr[i] = ringMode > 0 ? (isSelected || isFocusTimer ? 0.95 : 0.65) : 0

      if (orbitalRings) {
        const px = this.nodePosFlat[i * 3] ?? 0
        const py = this.nodePosFlat[i * 3 + 1] ?? 0
        const pz = this.nodePosFlat[i * 3 + 2] ?? 0
        this.tmpPos.set(px, py, pz)
        this.tmpQuat.setFromEuler(
          new THREE.Euler(0.55 + (i % 5) * 0.12, (i % 7) * 0.4, 0.25)
        )
        const rScale = ringMode > 0 ? rec.baseScale * (isFocusTimer ? 1.35 : 1.15) : 0.0001
        this.tmpScale.setScalar(rScale)
        this.tmpMatrix.compose(this.tmpPos, this.tmpQuat, this.tmpScale)
        orbitalRings.setMatrixAt(i, this.tmpMatrix)

        if (ringMode === 2 || ringMode === 1) this.tmpColor.copy(palette.states.lit)
        else if (ringMode === 3) this.tmpColor.copy(palette.states.review_due)
        else if (ringMode === 4) this.tmpColor.copy(palette.states.learning)
        else this.tmpColor.copy(palette.states.available)
        orbitalRings.setColorAt(i, this.tmpColor)
      }
    }

    if (starCores) {
      const g = starCores.geometry
      const stateAttr = g.getAttribute('aState')
      const emphAttr = g.getAttribute('aEmphasis')
      if (stateAttr) stateAttr.needsUpdate = true
      if (emphAttr) emphAttr.needsUpdate = true
      starCores.instanceMatrix.needsUpdate = true
      if (starCores.instanceColor) starCores.instanceColor.needsUpdate = true
    }

    if (orbitalRings) {
      const g = orbitalRings.geometry
      const modeAttr = g.getAttribute('aRingMode')
      const alphaAttr = g.getAttribute('aAlpha')
      if (modeAttr) modeAttr.needsUpdate = true
      if (alphaAttr) alphaAttr.needsUpdate = true
      orbitalRings.instanceMatrix.needsUpdate = true
      if (orbitalRings.instanceColor) orbitalRings.instanceColor.needsUpdate = true
    }

    // Update filament edge colors/states/alphas
    this.updateFilamentsVisualState(
      snapshot,
      activeDomainSet,
      pathEdgeSet,
      conflictEdgeSet,
      palette
    )
  }

  flyToNode(id: string, opts?: { offsetRightPx?: number; distance?: number }): void {
    if (this.disposed) return
    const idx = this.nodeIndexById.get(id)
    if (idx === undefined) return

    const tx = this.nodePosFlat[idx * 3] ?? 0
    const ty = this.nodePosFlat[idx * 3 + 1] ?? 0
    const tz = this.nodePosFlat[idx * 3 + 2] ?? 0
    const target = new THREE.Vector3(tx, ty, tz)

    const rec = this.nodeRecords[idx]
    const defaultDist =
      rec?.kind === 'branch' ? 95 : rec?.kind === 'unit' ? 48 : 22
    const dist = Math.max(8, opts?.distance ?? defaultDist)

    const viewDir = this.camera.position.clone().sub(this.cameraRig.controls.target)
    if (viewDir.lengthSq() < 1e-4) {
      viewDir.set(0.45, 0.35, 0.82)
    }
    viewDir.normalize()

    const goalPos = target.clone().addScaledVector(viewDir, dist)
    this.cameraRig.flyTo(goalPos, target, {
      offsetRightPx: opts?.offsetRightPx ?? 0,
      reducedMotion: this.reducedMotion
    })
  }

  resetView(instant = false): void {
    if (this.disposed) return
    const r = Math.max(20, this.boundsRadius)
    const center = this.layout?.bounds.center ?? [0, 0, 0]
    const target = new THREE.Vector3(center[0], center[1], center[2])
    const goalPos = new THREE.Vector3(
      center[0],
      center[1] + r * 0.55,
      center[2] + r * 1.65
    )
    this.cameraRig.flyTo(goalPos, target, {
      durationMs: instant ? 0 : 750,
      reducedMotion: instant || this.reducedMotion
    })
  }

  triggerLightUpBurst(fromId: string, unlockedIds: string[]): void {
    if (this.disposed) return
    const fromPos = this.layout?.positions.get(fromId) ?? this.getNodePosTuple(fromId)
    if (!fromPos) return

    const targets: [number, number, number][] = []
    for (const uid of unlockedIds) {
      const p = this.layout?.positions.get(uid) ?? this.getNodePosTuple(uid)
      if (p) targets.push([p[0], p[1], p[2]])
    }

    const palette = THEME_PALETTES[this.theme]
    this.particleBurst.triggerBurst(fromPos, targets, {
      flare: palette.states.lit,
      cascade: palette.states.learning
    })
  }

  setTheme(theme: ThemeMode): void {
    if (this.disposed) return
    this.theme = theme
    this.applyThemeUniforms()
    if (this.lastSnapshot) {
      this.updateVisualState(this.lastSnapshot)
    } else {
      this.applyDefaultColorsForTheme()
    }
  }

  setQuality(quality: QualityPreset): void {
    if (this.disposed) return
    if (this.quality === quality) return
    this.quality = quality
    this.applyQualityUniforms()
    if (this.pack && this.layout) {
      this.rebuildFilamentsMesh()
      if (this.lastSnapshot) {
        this.updateVisualState(this.lastSnapshot)
      }
    }
  }

  setOrbitPaused(paused: boolean): void {
    if (this.disposed) return
    this.cameraRig.setOrbitPaused(paused)
  }

  setViewContext(viewLevel: ViewLevel, focusClusterId: string | null): void {
    if (this.disposed) return
    this.activeView = viewLevel
    this.focusClusterId = focusClusterId
    if (this.lastSnapshot) {
      this.updateVisualState(this.lastSnapshot)
    } else {
      this.updateSemanticLod(true)
    }
  }

  /**
   * Advances simulation one frame (camera damping, shader time, burst particles, LOD).
   * Public so headless unit tests can deterministically step frames.
   */
  stepFrame(dtSec: number): void {
    if (this.disposed) return
    this.frameCount++
    const uTime = this.frameCount * 0.016
    const setTime = (mat: THREE.ShaderMaterial) => {
      const u = mat.uniforms['uTime']
      if (u) u.value = uTime
    }
    setTime(this.starfieldMat)
    setTime(this.cloudMat)
    setTime(this.starNodeMat)
    setTime(this.orbitalRingMat)
    setTime(this.filamentMat)

    this.cameraRig.update(dtSec)
    this.particleBurst.update(dtSec, this.camera.position)
    this.updateSemanticLod(false)

    if (this.renderer && this.ready) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.ready = false

    if (this.rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    if (this.hoverRafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.hoverRafId)
      this.hoverRafId = null
    }

    this.resizeObserver?.disconnect()
    this.resizeObserver = null
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.boundOnWindowResize)
    }

    const dom = this.renderer?.domElement
    if (dom) {
      dom.removeEventListener('pointerdown', this.boundOnPointerDown)
      dom.removeEventListener('pointermove', this.boundOnPointerMove)
      dom.removeEventListener('pointerup', this.boundOnPointerUp)
      dom.removeEventListener('pointerleave', this.boundOnPointerLeave)
      dom.removeEventListener('dblclick', this.boundOnDblClick)
      dom.removeEventListener('webglcontextlost', this.boundOnContextLost)
      dom.removeEventListener('webglcontextrestored', this.boundOnContextRestored)
      if (dom.parentNode === this.container) {
        this.container.removeChild(dom)
      }
    }

    this.cameraRig.dispose()
    this.particleBurst.dispose()
    this.disposeGraphMeshes()

    this.nodeRecords = []
    this.edgeRecords = []
    this.nodeIndexById.clear()
    this.nodePosFlat = new Float32Array(0)
    this.nodeHitRadii = new Float32Array(0)
    this.lastSnapshot = null
    this.pack = null
    this.layout = null
    this.graphIndex = null
    this.lastEmittedHoverId = null
    this.pendingPointerEvent = null
    this.pointerDownPos = null

    this.starfieldPoints.geometry.dispose()
    this.starfieldMat.dispose()
    this.cloudMat.dispose()
    this.starNodeMat.dispose()
    this.orbitalRingMat.dispose()
    this.filamentMat.dispose()
    this.spriteTexture.dispose()

    this.renderer?.dispose()
    this.renderer = null

    this.detachTelemetry()
  }

  private getNodePosTuple(id: string): [number, number, number] | null {
    const idx = this.nodeIndexById.get(id)
    if (idx === undefined) return null
    return [
      this.nodePosFlat[idx * 3] ?? 0,
      this.nodePosFlat[idx * 3 + 1] ?? 0,
      this.nodePosFlat[idx * 3 + 2] ?? 0
    ]
  }

  private collectFocusSubtree(clusterId: string): Set<string> | null {
    if (!this.graphIndex) return null
    const root = this.graphIndex.nodesById.get(clusterId)
    if (!root) return null
    const set = new Set<string>()
    const stack = [root]
    while (stack.length > 0) {
      const cur = stack.pop()!
      if (set.has(cur.id)) continue
      set.add(cur.id)
      const children = this.graphIndex.childrenByParent.get(cur.id)
      if (children) {
        for (const ch of children) stack.push(ch)
      }
    }
    return set
  }

  private matchesLens(
    rec: NodeRecord,
    state: NodeVisualState,
    lens: ActiveLens,
    routeSet: ReadonlySet<string> | null,
    bookmarkedIds?: ReadonlySet<string>
  ): boolean {
    switch (lens) {
      case 'all':
        return true
      case 'actionable':
        return state === 'available' || state === 'queued' || state === 'learning'
      case 'core':
        return rec.core
      case 'route': {
        if (!routeSet || routeSet.size === 0) return false
        if (routeSet.has(rec.id)) return true
        if (this.graphIndex) {
          const u = this.graphIndex.owningUnit(rec.id)
          if (u !== undefined && routeSet.has(u)) return true
        }
        return rec.parentId !== null && routeSet.has(rec.parentId)
      }
      case 'review_due':
        return state === 'review_due'
      case 'bookmarked':
        return Boolean(bookmarkedIds?.has(rec.id))
    }
  }

  private updateSemanticLod(force: boolean): void {
    const N = this.nodeRecords.length
    if (N === 0 || !this.starCoresMesh) return
    const distance = this.cameraRig.distance
    if (
      !force &&
      this.lastLodDistance > 0 &&
      Math.abs(distance - this.lastLodDistance) / this.lastLodDistance <= 0.02
    ) {
      return
    }
    this.lastLodDistance = distance

    if (this.lastSnapshot) {
      this.updateVisualState(this.lastSnapshot)
      return
    }

    const galaxyFactor =
      this.activeView === 'unit'
        ? 0
        : clamp(
            (distance - this.boundsRadius * 0.45) / (Math.max(1, this.boundsRadius) * 0.75),
            0,
            1
          )
    const leafScale = 1.0 - 0.72 * galaxyFactor
    const leafAlpha = 1.0 - 0.68 * galaxyFactor

    for (let i = 0; i < N; i++) {
      const rec = this.nodeRecords[i]!
      const s = rec.kind === 'leaf' ? leafScale : 1.0
      const a = rec.kind === 'leaf' ? leafAlpha : 1.0
      this.nodeEmphasisArr[i * 2 + 1] = a
      this.tmpPos.set(
        this.nodePosFlat[i * 3] ?? 0,
        this.nodePosFlat[i * 3 + 1] ?? 0,
        this.nodePosFlat[i * 3 + 2] ?? 0
      )
      this.tmpQuat.identity()
      this.tmpScale.setScalar(rec.baseScale * s)
      this.tmpMatrix.compose(this.tmpPos, this.tmpQuat, this.tmpScale)
      this.starCoresMesh.setMatrixAt(i, this.tmpMatrix)
    }

    const emphAttr = this.starCoresMesh.geometry.getAttribute('aEmphasis')
    if (emphAttr) emphAttr.needsUpdate = true
    this.starCoresMesh.instanceMatrix.needsUpdate = true
  }

  private createBackgroundStarfield(): THREE.Points {
    const maxStars = QUALITY_CONFIGS.high.starfieldCount
    const positions = new Float32Array(maxStars * 3)
    const colors = new Float32Array(maxStars * 3)
    const sizes = new Float32Array(maxStars)
    const phases = new Float32Array(maxStars)
    const rng = createNodeRng('litree-bg', 'starfield', 'v2')

    for (let i = 0; i < maxStars; i++) {
      const u = rng() * 2 - 1
      const theta = rng() * Math.PI * 2
      const r = 900 + rng() * 1400
      const rXY = Math.sqrt(Math.max(0, 1 - u * u))
      positions[i * 3] = r * rXY * Math.cos(theta)
      positions[i * 3 + 1] = r * u
      positions[i * 3 + 2] = r * rXY * Math.sin(theta)

      const tint = rng()
      colors[i * 3] = tint < 0.3 ? 0.72 : 0.92
      colors[i * 3 + 1] = 0.85 + rng() * 0.15
      colors[i * 3 + 2] = tint > 0.7 ? 1.0 : 0.92
      sizes[i] = 1.2 + rng() * 2.6
      phases[i] = rng()
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geom.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    geom.setDrawRange(0, QUALITY_CONFIGS[this.quality].starfieldCount)

    const pts = new THREE.Points(geom, this.starfieldMat)
    pts.name = 'nebula-starfield'
    pts.frustumCulled = false
    return pts
  }

  private createDomainClouds(pack: PackDocument, layout: GalaxyLayoutResult): THREE.Points {
    const puffsPerDomain = 6
    const domainList = [...layout.domainCenters.entries()]
    const total = domainList.length * puffsPerDomain
    const positions = new Float32Array(total * 3)
    const colors = new Float32Array(total * 3)
    const sizes = new Float32Array(total)
    const phases = new Float32Array(total)
    const alphas = new Float32Array(total)

    const domainColorMap = new Map<string, THREE.Color>()
    for (const d of pack.domains) {
      domainColorMap.set(d.id, new THREE.Color(d.color))
    }

    let cursor = 0
    for (const [domainId, center] of domainList) {
      const col = domainColorMap.get(domainId) ?? new THREE.Color('#38bdf8')
      const domRadius = layout.domainRadii.get(domainId) ?? 20
      const rng = createNodeRng(pack.id, domainId, 'cloud')

      for (let p = 0; p < puffsPerDomain; p++) {
        const ang = (p / puffsPerDomain) * Math.PI * 2 + rng() * 0.5
        const dist = (p === 0 ? 0 : 0.25 + rng() * 0.45) * domRadius
        positions[cursor * 3] = center[0] + Math.cos(ang) * dist
        positions[cursor * 3 + 1] = center[1] + (rng() - 0.5) * 8
        positions[cursor * 3 + 2] = center[2] + Math.sin(ang) * dist

        colors[cursor * 3] = col.r
        colors[cursor * 3 + 1] = col.g
        colors[cursor * 3 + 2] = col.b

        sizes[cursor] = Math.max(18, domRadius * (p === 0 ? 1.35 : 0.95))
        phases[cursor] = rng()
        alphas[cursor] = p === 0 ? 0.9 : 0.65
        cursor++
      }
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geom.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    geom.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))

    const pts = new THREE.Points(geom, this.cloudMat)
    pts.name = 'nebula-domain-clouds'
    pts.frustumCulled = false
    pts.visible = total > 0
    return pts
  }

  private rebuildFilamentsMesh(): void {
    if (this.filamentsMesh) {
      this.scene.remove(this.filamentsMesh)
      this.filamentsMesh.geometry.dispose()
      this.filamentsMesh = null
    }
    if (!this.layout) return

    const segs = QUALITY_CONFIGS[this.quality].bezierSegments
    this.filamentSegsPerEdge = segs
    const E = this.edgeRecords.length
    const vertsPerEdge = segs * 2
    const totalVerts = E * vertsPerEdge

    const positions = new Float32Array(totalVerts * 3)
    const colors = new Float32Array(totalVerts * 3)
    const progress = new Float32Array(totalVerts)
    const edgeState = new Float32Array(totalVerts)
    const alpha = new Float32Array(totalVerts)

    const palette = THEME_PALETTES[this.theme]

    for (let eIdx = 0; eIdx < E; eIdx++) {
      const edge = this.edgeRecords[eIdx]!
      const fromPos = this.layout.positions.get(edge.from) ?? [0, 0, 0]
      const toPos = this.layout.positions.get(edge.to) ?? [0, 0, 0]

      const fx = fromPos[0]
      const fy = fromPos[1]
      const fz = fromPos[2]
      const tx = toPos[0]
      const ty = toPos[1]
      const tz = toPos[2]

      const mx = (fx + tx) * 0.5
      const my = (fy + ty) * 0.5
      const mz = (fz + tz) * 0.5
      const dist = Math.hypot(tx - fx, ty - fy, tz - fz)
      const radLen = Math.hypot(mx, mz)
      const outwardX = radLen > 1e-4 ? (mx / radLen) * (dist * 0.08) : 0
      const outwardZ = radLen > 1e-4 ? (mz / radLen) * (dist * 0.08) : 0
      const cx = mx + outwardX
      const cy = my + Math.min(18, dist * 0.16 + 2.5)
      const cz = mz + outwardZ

      const defaultCol = edge.type === 'hard' ? palette.edges.dim : palette.edges.soft
      const baseV = eIdx * vertsPerEdge

      for (let s = 0; s < segs; s++) {
        const t0 = s / segs
        const t1 = (s + 1) / segs

        const inv0 = 1 - t0
        const x0 = inv0 * inv0 * fx + 2 * inv0 * t0 * cx + t0 * t0 * tx
        const y0 = inv0 * inv0 * fy + 2 * inv0 * t0 * cy + t0 * t0 * ty
        const z0 = inv0 * inv0 * fz + 2 * inv0 * t0 * cz + t0 * t0 * tz

        const inv1 = 1 - t1
        const x1 = inv1 * inv1 * fx + 2 * inv1 * t1 * cx + t1 * t1 * tx
        const y1 = inv1 * inv1 * fy + 2 * inv1 * t1 * cy + t1 * t1 * ty
        const z1 = inv1 * inv1 * fz + 2 * inv1 * t1 * cz + t1 * t1 * tz

        const v0 = baseV + s * 2
        const v1 = v0 + 1

        positions[v0 * 3] = x0
        positions[v0 * 3 + 1] = y0
        positions[v0 * 3 + 2] = z0
        positions[v1 * 3] = x1
        positions[v1 * 3 + 1] = y1
        positions[v1 * 3 + 2] = z1

        progress[v0] = t0
        progress[v1] = t1

        colors[v0 * 3] = defaultCol.r
        colors[v0 * 3 + 1] = defaultCol.g
        colors[v0 * 3 + 2] = defaultCol.b
        colors[v1 * 3] = defaultCol.r
        colors[v1 * 3 + 1] = defaultCol.g
        colors[v1 * 3 + 2] = defaultCol.b

        edgeState[v0] = edge.type === 'hard' ? 0 : 5
        edgeState[v1] = edge.type === 'hard' ? 0 : 5
        alpha[v0] = edge.type === 'hard' ? 0.35 : 0.2
        alpha[v1] = edge.type === 'hard' ? 0.35 : 0.2
      }
    }

    this.filamentColorArr = colors
    this.filamentStateArr = edgeState
    this.filamentAlphaArr = alpha

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geom.setAttribute('aProgress', new THREE.BufferAttribute(progress, 1))
    geom.setAttribute('aEdgeState', new THREE.BufferAttribute(edgeState, 1))
    geom.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1))

    const mesh = new THREE.LineSegments(geom, this.filamentMat)
    mesh.name = 'nebula-filaments'
    mesh.frustumCulled = false
    mesh.visible = totalVerts > 0
    this.filamentsMesh = mesh
    this.scene.add(mesh)
  }

  private updateFilamentsVisualState(
    snapshot: NebulaVisualSnapshot,
    activeDomainSet: ReadonlySet<string> | null,
    pathEdgeSet: ReadonlySet<string> | null,
    conflictEdgeSet: ReadonlySet<string> | null,
    palette: ThemePalette
  ): void {
    if (!this.filamentsMesh) return
    const segs = this.filamentSegsPerEdge
    const vertsPerEdge = segs * 2
    const activeNodeId = snapshot.selectedId ?? snapshot.hoveredId
    const hasFocus = Boolean(activeNodeId || pathEdgeSet || conflictEdgeSet)

    for (let eIdx = 0; eIdx < this.edgeRecords.length; eIdx++) {
      const edge = this.edgeRecords[eIdx]!
      let stateVal = edge.type === 'hard' ? 0 : 5
      let col = edge.type === 'hard' ? palette.edges.dim : palette.edges.soft
      let alphaVal = hasFocus ? 0.14 : edge.type === 'hard' ? 0.38 : 0.2

      if (activeDomainSet) {
        const fromIdx = this.nodeIndexById.get(edge.from)
        const toIdx = this.nodeIndexById.get(edge.to)
        const fromDom = fromIdx !== undefined ? this.nodeRecords[fromIdx]?.domainId : undefined
        const toDom = toIdx !== undefined ? this.nodeRecords[toIdx]?.domainId : undefined
        if (
          (!fromDom || !activeDomainSet.has(fromDom)) &&
          (!toDom || !activeDomainSet.has(toDom))
        ) {
          alphaVal = 0.02
        }
      }

      if (conflictEdgeSet?.has(edge.id)) {
        stateVal = 4
        col = palette.edges.cycleConflict
        alphaVal = 1.0
      } else if (pathEdgeSet?.has(edge.id)) {
        const fromState = snapshot.nodeStates.get(edge.from)
        if (fromState === 'lit') {
          stateVal = 1
          col = palette.edges.inPath
        } else {
          stateVal = 2
          col = palette.edges.missingPrereq
        }
        alphaVal = 0.95
      } else if (activeNodeId && (edge.from === activeNodeId || edge.to === activeNodeId)) {
        if (edge.to === activeNodeId) {
          const fromState = snapshot.nodeStates.get(edge.from)
          if (fromState === 'lit') {
            stateVal = 1
            col = palette.edges.inPath
          } else {
            stateVal = 2
            col = palette.edges.missingPrereq
          }
        } else {
          stateVal = 3
          col = palette.edges.dependent
        }
        alphaVal = 0.92
      }

      const baseV = eIdx * vertsPerEdge
      for (let v = 0; v < vertsPerEdge; v++) {
        const vi = baseV + v
        this.filamentColorArr[vi * 3] = col.r
        this.filamentColorArr[vi * 3 + 1] = col.g
        this.filamentColorArr[vi * 3 + 2] = col.b
        this.filamentStateArr[vi] = stateVal
        this.filamentAlphaArr[vi] = alphaVal
      }
    }

    const g = this.filamentsMesh.geometry
    const colAttr = g.getAttribute('aColor')
    const stAttr = g.getAttribute('aEdgeState')
    const alAttr = g.getAttribute('aAlpha')
    if (colAttr) colAttr.needsUpdate = true
    if (stAttr) stAttr.needsUpdate = true
    if (alAttr) alAttr.needsUpdate = true
  }

  private disposeGraphMeshes(): void {
    if (this.nebulaCloudPoints) {
      this.scene.remove(this.nebulaCloudPoints)
      this.nebulaCloudPoints.geometry.dispose()
      this.nebulaCloudPoints = null
    }
    if (this.starCoresMesh) {
      this.scene.remove(this.starCoresMesh)
      this.starCoresMesh.geometry.dispose()
      this.starCoresMesh.dispose()
      this.starCoresMesh = null
    }
    if (this.orbitalRingsMesh) {
      this.scene.remove(this.orbitalRingsMesh)
      this.orbitalRingsMesh.geometry.dispose()
      this.orbitalRingsMesh.dispose()
      this.orbitalRingsMesh = null
    }
    if (this.filamentsMesh) {
      this.scene.remove(this.filamentsMesh)
      this.filamentsMesh.geometry.dispose()
      this.filamentsMesh = null
    }
  }

  private applyDefaultColorsForTheme(): void {
    const palette = THEME_PALETTES[this.theme]
    const N = this.nodeRecords.length

    if (this.starCoresMesh) {
      if (N === 0) {
        this.starCoresMesh.setColorAt(0, palette.states.locked)
      } else {
        for (let i = 0; i < N; i++) {
          this.starCoresMesh.setColorAt(i, palette.states.available)
        }
      }
      if (this.starCoresMesh.instanceColor) {
        this.starCoresMesh.instanceColor.needsUpdate = true
      }
    }

    if (this.orbitalRingsMesh) {
      if (N === 0) {
        this.orbitalRingsMesh.setColorAt(0, palette.states.locked)
      } else {
        for (let i = 0; i < N; i++) {
          this.orbitalRingsMesh.setColorAt(i, palette.states.lit)
        }
      }
      if (this.orbitalRingsMesh.instanceColor) {
        this.orbitalRingsMesh.instanceColor.needsUpdate = true
      }
    }

    if (this.filamentsMesh) {
      const vertsPerEdge = this.filamentSegsPerEdge * 2
      for (let eIdx = 0; eIdx < this.edgeRecords.length; eIdx++) {
        const edge = this.edgeRecords[eIdx]!
        const defaultCol = edge.type === 'hard' ? palette.edges.dim : palette.edges.soft
        const baseV = eIdx * vertsPerEdge
        for (let v = 0; v < vertsPerEdge; v++) {
          const vi = baseV + v
          this.filamentColorArr[vi * 3] = defaultCol.r
          this.filamentColorArr[vi * 3 + 1] = defaultCol.g
          this.filamentColorArr[vi * 3 + 2] = defaultCol.b
        }
      }
      const colAttr = this.filamentsMesh.geometry.getAttribute('aColor')
      if (colAttr) colAttr.needsUpdate = true
    }
  }

  private applyThemeUniforms(): void {
    const palette = THEME_PALETTES[this.theme]
    this.scene.background = new THREE.Color(palette.background)
    if (this.renderer) {
      this.renderer.setClearColor(palette.background, 1)
    }

    const blending = palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending
    this.starfieldMat.blending = blending
    this.starfieldMat.needsUpdate = true
    this.cloudMat.blending = blending
    this.cloudMat.needsUpdate = true
    this.filamentMat.blending = blending
    this.filamentMat.needsUpdate = true
    this.particleBurst.setAdditiveBlending(palette.additive)

    const setUniform = (mat: THREE.ShaderMaterial, name: string, val: number) => {
      const u = mat.uniforms[name]
      if (u) u.value = val
    }
    setUniform(this.starfieldMat, 'uOpacity', palette.starfieldOpacity)
    setUniform(this.cloudMat, 'uOpacity', palette.cloudOpacity)
    setUniform(this.filamentMat, 'uBaseOpacity', palette.filamentOpacity)
    setUniform(this.starNodeMat, 'uGlowStrength', palette.glowStrength)
    setUniform(this.orbitalRingMat, 'uGlowStrength', palette.glowStrength)
  }

  private applyQualityUniforms(): void {
    const cfg = QUALITY_CONFIGS[this.quality]
    const dpr =
      typeof window !== 'undefined'
        ? Math.min(window.devicePixelRatio || 1, cfg.dprCap)
        : 1

    if (this.renderer) {
      this.renderer.setPixelRatio(dpr)
    }
    const setDpr = (mat: THREE.ShaderMaterial) => {
      const u = mat.uniforms['uPixelRatio']
      if (u) u.value = dpr
    }
    setDpr(this.starfieldMat)
    setDpr(this.cloudMat)
    this.particleBurst.setPixelRatio(dpr)
    this.particleBurst.setMaxParticles(cfg.maxBurstParticles)
    this.starfieldPoints.geometry.setDrawRange(0, cfg.starfieldCount)
  }

  private applyReducedMotionUniforms(): void {
    const val = this.reducedMotion ? 1 : 0
    const setRM = (mat: THREE.ShaderMaterial) => {
      const u = mat.uniforms['uReducedMotion']
      if (u) u.value = val
    }
    setRM(this.starfieldMat)
    setRM(this.cloudMat)
    setRM(this.starNodeMat)
    setRM(this.orbitalRingMat)
    setRM(this.filamentMat)
    this.particleBurst.setReducedMotion(this.reducedMotion)
  }

  private getRawContainerRect(): { left: number; top: number; width: number; height: number } {
    if (typeof this.container.getBoundingClientRect === 'function') {
      const r = this.container.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) {
        return { left: r.left, top: r.top, width: r.width, height: r.height }
      }
    }
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    return { left: 0, top: 0, width: w, height: h }
  }

  private getContainerRect(): { left: number; top: number; width: number; height: number } {
    const raw = this.getRawContainerRect()
    return {
      left: raw.left,
      top: raw.top,
      width: raw.width > 0 ? raw.width : 1280,
      height: raw.height > 0 ? raw.height : 800
    }
  }

  private getRenderRect(): ScreenRect {
    const dom = this.renderer?.domElement
    if (dom && typeof dom.getBoundingClientRect === 'function') {
      const r = dom.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) {
        return { left: r.left, top: r.top, width: r.width, height: r.height }
      }
    }
    return this.getContainerRect()
  }

  private pickAtClientCoords(clientX: number, clientY: number): string | null {
    const rect = this.getRenderRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    const localX = clientX - (rect.left ?? 0)
    const localY = clientY - (rect.top ?? 0)
    this.pointerNdc.set((localX / rect.width) * 2 - 1, -(localY / rect.height) * 2 + 1)
    this.camera.updateMatrixWorld()
    this.raycaster.setFromCamera(this.pointerNdc, this.camera)
    const idx = pickNodeAtRay(
      this.raycaster.ray,
      this.nodePosFlat,
      this.nodeHitRadii,
      this.nodeRecords.length
    )
    return idx !== null ? (this.nodeRecords[idx]?.id ?? null) : null
  }

  private handlePointerDown(e: PointerEvent): void {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    this.pointerDownPos = { x: e.clientX, y: e.clientY }
  }

  private handlePointerMove(e: PointerEvent): void {
    this.pendingPointerEvent = { clientX: e.clientX, clientY: e.clientY }
    if (this.hoverRafId !== null || typeof requestAnimationFrame === 'undefined') return
    this.hoverRafId = requestAnimationFrame(() => {
      this.hoverRafId = null
      if (!this.pendingPointerEvent || this.disposed) return
      const { clientX, clientY } = this.pendingPointerEvent
      this.pendingPointerEvent = null
      const hitId = this.pickAtClientCoords(clientX, clientY)
      if (hitId !== this.lastEmittedHoverId) {
        this.lastEmittedHoverId = hitId
        this.callbacks.onHover(hitId)
      }
    })
  }

  private handlePointerLeave(): void {
    this.pendingPointerEvent = null
    if (this.hoverRafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.hoverRafId)
      this.hoverRafId = null
    }
    if (null !== this.lastEmittedHoverId) {
      this.lastEmittedHoverId = null
      this.callbacks.onHover(null)
    }
  }

  private handlePointerUp(e: PointerEvent): void {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (!this.pointerDownPos) return
    const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y)
    this.pointerDownPos = null
    if (dist <= CLICK_DRAG_THRESHOLD_PX) {
      const hitId = this.pickAtClientCoords(e.clientX, e.clientY)
      this.callbacks.onSelect(hitId)
    }
  }

  private handleDblClick(e: MouseEvent): void {
    const hitId = this.pickAtClientCoords(e.clientX, e.clientY)
    if (hitId !== null) {
      this.callbacks.onDrillDown(hitId)
    }
  }

  private handleContextLost(e: Event): void {
    e.preventDefault()
    if (this.rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.rendererMode = 'fallback-2d'
    this.ready = false
    this.callbacks.onContextLost()
  }

  private handleContextRestored(): void {
    if (this.disposed) return
    this.rendererMode = 'webgl2'
    this.ready = true
    if (this.starCoresMesh) {
      this.starCoresMesh.instanceMatrix.needsUpdate = true
      if (this.starCoresMesh.instanceColor) this.starCoresMesh.instanceColor.needsUpdate = true
    }
    if (this.orbitalRingsMesh) {
      this.orbitalRingsMesh.instanceMatrix.needsUpdate = true
      if (this.orbitalRingsMesh.instanceColor) {
        this.orbitalRingsMesh.instanceColor.needsUpdate = true
      }
    }
    if (typeof requestAnimationFrame !== 'undefined' && this.rafId === null) {
      this.startLoop()
    }
  }

  private handleResize(): void {
    if (this.disposed) return
    const rect = this.getRawContainerRect()
    if (
      !Number.isFinite(rect.width) ||
      !Number.isFinite(rect.height) ||
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return
    }
    this.camera.aspect = rect.width / rect.height
    this.camera.updateProjectionMatrix()
    this.cameraRig.setViewportSize(rect.width, rect.height)
    this.renderer?.setSize(rect.width, rect.height, false)
  }

  private startLoop(): void {
    this.lastClockMs = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const tick = (nowMs: number) => {
      if (this.disposed || !this.ready) return
      const dtSec = Math.max(0, Math.min(0.1, (nowMs - this.lastClockMs) / 1000))
      this.lastClockMs = nowMs
      this.stepFrame(dtSec)
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }
}
