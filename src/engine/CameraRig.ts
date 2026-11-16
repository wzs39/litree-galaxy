import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface FlyToOptions {
  durationMs?: number
  offsetRightPx?: number
  reducedMotion?: boolean
}

interface ActiveFlight {
  startPos: THREE.Vector3
  startTarget: THREE.Vector3
  goalPos: THREE.Vector3
  goalTarget: THREE.Vector3
  elapsedMs: number
  durationMs: number
}

/**
 * Shifts both camera position and orbit target along camera-right so that `target`
 * appears centered in the visible left pane when a right-side drawer occupies `offsetRightPx`.
 */
export function computeDrawerCompensatedGoal(
  position: THREE.Vector3,
  target: THREE.Vector3,
  cameraFovDeg: number,
  viewportWidth: number,
  viewportHeight: number,
  offsetRightPx: number,
  cameraUp?: THREE.Vector3
): { position: THREE.Vector3; target: THREE.Vector3 } {
  const posOut = position.clone()
  const targetOut = target.clone()

  if (
    !Number.isFinite(viewportWidth) ||
    !Number.isFinite(viewportHeight) ||
    !Number.isFinite(offsetRightPx) ||
    viewportWidth <= 0 ||
    viewportHeight <= 0 ||
    offsetRightPx <= 0
  ) {
    return { position: posOut, target: targetOut }
  }

  const effectiveOffset = Math.max(0, Math.min(offsetRightPx, viewportWidth * 0.65))
  if (effectiveOffset <= 0) {
    return { position: posOut, target: targetOut }
  }

  const forward = targetOut.clone().sub(posOut)
  const distance = forward.length()
  if (distance < 1e-4) {
    return { position: posOut, target: targetOut }
  }
  forward.divideScalar(distance)

  const up = (cameraUp ? cameraUp.clone() : new THREE.Vector3(0, 1, 0)).normalize()
  const right = new THREE.Vector3().crossVectors(forward, up)
  if (right.lengthSq() < 1e-6) {
    right.set(1, 0, 0)
  } else {
    right.normalize()
  }

  const fovRad = THREE.MathUtils.degToRad(cameraFovDeg)
  const deltaWorld = distance * Math.tan(fovRad * 0.5) * (effectiveOffset / viewportHeight)
  const shift = right.multiplyScalar(deltaWorld)

  posOut.add(shift)
  targetOut.add(shift)
  return { position: posOut, target: targetOut }
}

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera
  readonly controls: OrbitControls

  private domElement: HTMLElement | null
  private viewportWidth = 1280
  private viewportHeight = 800
  private activeFlight: ActiveFlight | null = null
  private _isFlying = false
  private focusOrbitEnabled = false
  private focusOrbitSpeed = 0.65
  private orbitPaused = false

  private readonly onPointerDown = () => {
    this.cancelFlyTo()
  }
  private readonly onWheel = () => {
    this.cancelFlyTo()
  }
  private readonly onControlsStart = () => {
    this.cancelFlyTo()
  }

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement | null) {
    this.camera = camera
    this.domElement = domElement
    this.controls = new OrbitControls(camera, domElement)

    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.075
    this.controls.enableRotate = true
    this.controls.enableZoom = true
    this.controls.enablePan = true
    this.controls.screenSpacePanning = true
    this.controls.minDistance = 6
    this.controls.maxDistance = 600
    this.controls.touches.ONE = THREE.TOUCH.ROTATE
    this.controls.touches.TWO = THREE.TOUCH.DOLLY_PAN

    if (domElement !== null) {
      domElement.addEventListener('pointerdown', this.onPointerDown, { passive: true })
      domElement.addEventListener('wheel', this.onWheel, { passive: true })
    }
    this.controls.addEventListener('start', this.onControlsStart)
  }

  get isFlying(): boolean {
    return this._isFlying
  }

  get distance(): number {
    return this.camera.position.distanceTo(this.controls.target)
  }

  setViewportSize(width: number, height: number): void {
    this.viewportWidth = Math.max(1, width)
    this.viewportHeight = Math.max(1, height)
  }

  setBoundsRadius(radius: number): void {
    const safeR = Number.isFinite(radius) && radius > 0 ? radius : 50
    this.controls.maxDistance = Math.max(480, safeR * 3.5)
  }

  setFocusOrbit(enabled: boolean, speed = 0.65): void {
    this.focusOrbitEnabled = enabled
    this.focusOrbitSpeed = speed
    this.syncAutoRotate()
  }

  setOrbitPaused(paused: boolean): void {
    this.orbitPaused = paused
    this.syncAutoRotate()
  }

  private syncAutoRotate(): void {
    this.controls.autoRotate = this.focusOrbitEnabled && !this.orbitPaused && !this._isFlying
    this.controls.autoRotateSpeed = this.focusOrbitSpeed
  }

  flyTo(position: THREE.Vector3, target: THREE.Vector3, opts?: FlyToOptions): void {
    const { position: goalPos, target: goalTarget } = computeDrawerCompensatedGoal(
      position,
      target,
      this.camera.fov,
      this.viewportWidth,
      this.viewportHeight,
      opts?.offsetRightPx ?? 0,
      this.camera.up
    )

    // Flush any residual damping inertia (_sphericalDelta / _panOffset) before snapping or capturing startPos/startTarget
    this.activeFlight = null
    this._isFlying = false
    this.controls.enableDamping = false
    this.controls.autoRotate = false
    this.controls.update()

    const rawDuration = opts?.durationMs ?? 750
    const durationMs = Number.isFinite(rawDuration) ? rawDuration : 750
    if (opts?.reducedMotion || durationMs <= 0) {
      this.camera.position.copy(goalPos)
      this.controls.target.copy(goalTarget)
      this.camera.lookAt(goalTarget)
      this.controls.update()
      this.controls.enableDamping = true
      this.syncAutoRotate()
      return
    }

    this.activeFlight = {
      startPos: this.camera.position.clone(),
      startTarget: this.controls.target.clone(),
      goalPos,
      goalTarget,
      elapsedMs: 0,
      durationMs
    }
    this._isFlying = true
    this.syncAutoRotate()
  }

  cancelFlyTo(): void {
    if (!this._isFlying) return
    this._isFlying = false
    this.activeFlight = null
    this.controls.enableDamping = true
    this.syncAutoRotate()
  }

  update(dtSec: number): void {
    const clampedDt = Math.max(0, Math.min(0.1, Number.isFinite(dtSec) ? dtSec : 0))

    if (this.activeFlight) {
      this.activeFlight.elapsedMs += clampedDt * 1000
      const rawT = Math.min(1, this.activeFlight.elapsedMs / this.activeFlight.durationMs)
      const t =
        rawT < 0.5
          ? 4 * rawT * rawT * rawT
          : 1 - Math.pow(-2 * rawT + 2, 3) / 2

      this.camera.position.lerpVectors(
        this.activeFlight.startPos,
        this.activeFlight.goalPos,
        t
      )
      this.controls.target.lerpVectors(
        this.activeFlight.startTarget,
        this.activeFlight.goalTarget,
        t
      )
      this.controls.update(clampedDt)

      if (rawT >= 1) {
        this._isFlying = false
        this.activeFlight = null
        this.controls.enableDamping = true
        this.syncAutoRotate()
      }
      return
    }

    this.syncAutoRotate()
    this.controls.update(clampedDt)
  }

  dispose(): void {
    if (this.domElement !== null) {
      this.domElement.removeEventListener('pointerdown', this.onPointerDown)
      this.domElement.removeEventListener('wheel', this.onWheel)
      this.domElement = null
    }
    this.controls.removeEventListener('start', this.onControlsStart)
    // OrbitControls.disconnect() in Three 0.187 dereferences domElement without a null guard.
    if (this.controls.domElement !== null) {
      this.controls.dispose()
    }
  }
}
