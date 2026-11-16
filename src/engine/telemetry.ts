import * as THREE from 'three'
import type { LitreeTelemetry } from '../core/types'

export interface ScreenRect {
  left?: number
  top?: number
  width: number
  height: number
}

const _projVec = new THREE.Vector3()

/**
 * Projects a 3D world position to CSS pixel coordinates relative to the viewport,
 * accounting for `rect.left` and `rect.top`. Returns `null` for degenerate rects or non-finite inputs.
 */
export function projectWorldToScreen(
  worldPos: readonly [number, number, number],
  camera: THREE.Camera,
  rect: ScreenRect
): { x: number; y: number; inView: boolean } | null {
  if (
    rect.width <= 0 ||
    rect.height <= 0 ||
    !Number.isFinite(rect.width) ||
    !Number.isFinite(rect.height)
  ) {
    return null
  }
  const wx = worldPos[0]
  const wy = worldPos[1]
  const wz = worldPos[2]
  if (!Number.isFinite(wx) || !Number.isFinite(wy) || !Number.isFinite(wz)) {
    return null
  }

  camera.updateMatrixWorld()
  _projVec.set(wx, wy, wz).project(camera)

  if (!Number.isFinite(_projVec.x) || !Number.isFinite(_projVec.y) || !Number.isFinite(_projVec.z)) {
    return null
  }

  const inView =
    _projVec.z >= -1 &&
    _projVec.z <= 1 &&
    _projVec.x >= -1 &&
    _projVec.x <= 1 &&
    _projVec.y >= -1 &&
    _projVec.y <= 1

  const left = rect.left ?? 0
  const top = rect.top ?? 0
  const x = left + (_projVec.x * 0.5 + 0.5) * rect.width
  const y = top + (-_projVec.y * 0.5 + 0.5) * rect.height

  return { x, y, inView }
}

const TELEMETRY_KEY = '__LITREE_TELEMETRY__'

/**
 * Attaches a live, read-only `window.__LITREE_TELEMETRY__` object backed by getters.
 * Returns a detach callback that removes the property only if it still belongs to this attachment.
 */
export function attachGlobalTelemetry(
  source: () => LitreeTelemetry,
  targetGlobal?: Record<string, unknown>
): () => void {
  const host: Record<string, unknown> | undefined =
    targetGlobal ??
    (typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : undefined)

  if (!host) {
    return () => {}
  }

  const telemetryObj: Record<string, unknown> = {}
  const defineGetter = <K extends keyof LitreeTelemetry>(key: K) => {
    Object.defineProperty(telemetryObj, key, {
      enumerable: true,
      configurable: false,
      get: () => source()[key]
    })
  }

  defineGetter('ready')
  defineGetter('rendererMode')
  defineGetter('glRenderer')
  defineGetter('frameCount')
  defineGetter('nodeCount')
  defineGetter('edgeCount')
  defineGetter('camera')
  defineGetter('activeView')
  defineGetter('selectedId')
  defineGetter('hoveredId')
  defineGetter('isFlying')
  defineGetter('lastBurstAt')
  defineGetter('projectNodeToScreen')

  Object.freeze(telemetryObj)

  Object.defineProperty(host, TELEMETRY_KEY, {
    configurable: true,
    enumerable: true,
    get: () => telemetryObj
  })

  return () => {
    const desc = Object.getOwnPropertyDescriptor(host, TELEMETRY_KEY)
    if (desc && desc.get && desc.get() === telemetryObj) {
      delete host[TELEMETRY_KEY]
    }
  }
}
