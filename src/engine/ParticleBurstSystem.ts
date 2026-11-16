import * as THREE from 'three'
import { createBurstParticleMaterial, createShockwaveMaterial } from './shaders'

const MAX_CAPACITY = 640
const MAX_TARGETS = 16

const COLOR_GOLD = new THREE.Color('#f5c451')
const COLOR_CYAN = new THREE.Color('#3dd6c3')

export class ParticleBurstSystem {
  readonly points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
  readonly shockwaveMesh: THREE.Mesh<THREE.RingGeometry, THREE.ShaderMaterial>

  private readonly geometry: THREE.BufferGeometry
  private readonly positionsAttr: THREE.BufferAttribute
  private readonly colorsAttr: THREE.BufferAttribute
  private readonly sizesAttr: THREE.BufferAttribute
  private readonly alphasAttr: THREE.BufferAttribute

  private readonly startX = new Float32Array(MAX_CAPACITY)
  private readonly startY = new Float32Array(MAX_CAPACITY)
  private readonly startZ = new Float32Array(MAX_CAPACITY)
  private readonly ctrlX = new Float32Array(MAX_CAPACITY)
  private readonly ctrlY = new Float32Array(MAX_CAPACITY)
  private readonly ctrlZ = new Float32Array(MAX_CAPACITY)
  private readonly endX = new Float32Array(MAX_CAPACITY)
  private readonly endY = new Float32Array(MAX_CAPACITY)
  private readonly endZ = new Float32Array(MAX_CAPACITY)
  private readonly colorR = new Float32Array(MAX_CAPACITY)
  private readonly colorG = new Float32Array(MAX_CAPACITY)
  private readonly colorB = new Float32Array(MAX_CAPACITY)
  private readonly age = new Float32Array(MAX_CAPACITY)
  private readonly duration = new Float32Array(MAX_CAPACITY)
  private readonly delay = new Float32Array(MAX_CAPACITY)
  private readonly baseSize = new Float32Array(MAX_CAPACITY)
  private readonly active = new Uint8Array(MAX_CAPACITY)

  private writeCursor = 0
  private maxParticles = MAX_CAPACITY
  private reducedMotion = false
  private _activeParticleCount = 0
  private _lastBurstAt = 0

  private shockwaveAge = 0
  private readonly shockwaveDuration = 0.55
  private shockwaveActive = false

  constructor(spriteTexture: THREE.Texture) {
    this.geometry = new THREE.BufferGeometry()
    const posBuf = new Float32Array(MAX_CAPACITY * 3)
    const colBuf = new Float32Array(MAX_CAPACITY * 3)
    const sizeBuf = new Float32Array(MAX_CAPACITY)
    const alphaBuf = new Float32Array(MAX_CAPACITY)

    this.positionsAttr = new THREE.BufferAttribute(posBuf, 3)
    this.colorsAttr = new THREE.BufferAttribute(colBuf, 3)
    this.sizesAttr = new THREE.BufferAttribute(sizeBuf, 1)
    this.alphasAttr = new THREE.BufferAttribute(alphaBuf, 1)

    this.geometry.setAttribute('position', this.positionsAttr)
    this.geometry.setAttribute('aColor', this.colorsAttr)
    this.geometry.setAttribute('aSize', this.sizesAttr)
    this.geometry.setAttribute('aAlpha', this.alphasAttr)
    this.geometry.setDrawRange(0, 0)

    this.points = new THREE.Points(this.geometry, createBurstParticleMaterial(spriteTexture))
    this.points.frustumCulled = false
    this.points.name = 'lightup-burst-particles'

    const ringGeom = new THREE.RingGeometry(0.8, 1.3, 40)
    this.shockwaveMesh = new THREE.Mesh(ringGeom, createShockwaveMaterial())
    this.shockwaveMesh.visible = false
    this.shockwaveMesh.frustumCulled = false
    this.shockwaveMesh.name = 'lightup-shockwave'
  }

  get activeParticleCount(): number {
    return this._activeParticleCount
  }

  get isShockwaveVisible(): boolean {
    return this.shockwaveMesh.visible
  }

  get lastBurstAt(): number {
    return this._lastBurstAt
  }

  setMaxParticles(limit: number): void {
    const safeLimit = Number.isFinite(limit) ? limit : MAX_CAPACITY
    const nextMax = Math.max(16, Math.min(MAX_CAPACITY, Math.floor(safeLimit)))
    if (nextMax === this.maxParticles) return
    this.maxParticles = nextMax
    this.writeCursor = this.writeCursor % this.maxParticles

    let hadActiveAboveCap = false
    for (let i = this.maxParticles; i < MAX_CAPACITY; i++) {
      if (this.active[i] === 1) {
        this.active[i] = 0
        hadActiveAboveCap = true
      }
    }
    if (hadActiveAboveCap && this._activeParticleCount > 0) {
      this.syncBuffers(undefined)
    }
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced
    if (reduced && this.shockwaveActive) {
      this.shockwaveActive = false
      this.shockwaveMesh.visible = false
    }
  }

  setPixelRatio(dpr: number): void {
    const u = this.points.material.uniforms['uPixelRatio']
    if (u) u.value = dpr
  }

  setAdditiveBlending(additive: boolean): void {
    const blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending
    if (this.points.material.blending !== blending) {
      this.points.material.blending = blending
      this.points.material.needsUpdate = true
    }
    if (this.shockwaveMesh.material.blending !== blending) {
      this.shockwaveMesh.material.blending = blending
      this.shockwaveMesh.material.needsUpdate = true
    }
  }

  private allocSlot(
    sx: number,
    sy: number,
    sz: number,
    cx: number,
    cy: number,
    cz: number,
    ex: number,
    ey: number,
    ez: number,
    r: number,
    g: number,
    b: number,
    dur: number,
    del: number,
    size: number
  ): void {
    const slot = this.writeCursor % this.maxParticles
    this.writeCursor = (this.writeCursor + 1) % this.maxParticles

    this.startX[slot] = sx
    this.startY[slot] = sy
    this.startZ[slot] = sz
    this.ctrlX[slot] = cx
    this.ctrlY[slot] = cy
    this.ctrlZ[slot] = cz
    this.endX[slot] = ex
    this.endY[slot] = ey
    this.endZ[slot] = ez
    this.colorR[slot] = r
    this.colorG[slot] = g
    this.colorB[slot] = b
    this.age[slot] = 0
    this.duration[slot] = dur
    this.delay[slot] = del
    this.baseSize[slot] = size
    this.active[slot] = 1
  }

  triggerBurst(
    fromPos: readonly [number, number, number],
    targetPositions: readonly (readonly [number, number, number])[],
    palette?: { flare?: THREE.Color; cascade?: THREE.Color }
  ): void {
    this._lastBurstAt = Date.now()
    const flareColor = palette?.flare ?? COLOR_GOLD
    const cascadeColor = palette?.cascade ?? COLOR_CYAN
    const fx = fromPos[0]
    const fy = fromPos[1]
    const fz = fromPos[2]

    if (this.reducedMotion) {
      this.shockwaveActive = false
      this.shockwaveMesh.visible = false

      // Subtle static glow pulses without expanding shockwave or high-motion streams
      const staticCount = Math.min(8, this.maxParticles)
      for (let i = 0; i < staticCount; i++) {
        this.allocSlot(
          fx,
          fy,
          fz,
          fx,
          fy,
          fz,
          fx,
          fy,
          fz,
          flareColor.r,
          flareColor.g,
          flareColor.b,
          0.22,
          0,
          9.5
        )
      }
      const targetCap = Math.min(12, targetPositions.length)
      for (let i = 0; i < targetCap; i++) {
        const tp = targetPositions[i]!
        this.allocSlot(
          tp[0],
          tp[1],
          tp[2],
          tp[0],
          tp[1],
          tp[2],
          tp[0],
          tp[1],
          tp[2],
          cascadeColor.r,
          cascadeColor.g,
          cascadeColor.b,
          0.22,
          0.02,
          8.0
        )
      }
      this.syncBuffers(undefined)
      return
    }

    // Beat 1: Shockwave ring + radial flare sparks at fromPos
    this.shockwaveMesh.position.set(fx, fy, fz)
    this.shockwaveMesh.scale.setScalar(1)
    this.shockwaveMesh.visible = true
    this.shockwaveAge = 0
    this.shockwaveActive = true
    const shockColor = this.shockwaveMesh.material.uniforms['uColor']
    if (shockColor && shockColor.value instanceof THREE.Color) {
      shockColor.value.copy(flareColor)
    }

    const flareCount = Math.min(48, Math.floor(this.maxParticles * 0.25))
    for (let i = 0; i < flareCount; i++) {
      const phi = i * 2.3999632
      const z = 1 - (2 * (i + 0.5)) / Math.max(1, flareCount)
      const rXY = Math.sqrt(Math.max(0, 1 - z * z))
      const radius = 3.2 + (i % 5) * 0.75
      const ex = fx + rXY * Math.cos(phi) * radius
      const ey = fy + z * radius
      const ez = fz + rXY * Math.sin(phi) * radius
      this.allocSlot(
        fx,
        fy,
        fz,
        (fx + ex) * 0.5,
        (fy + ey) * 0.5 + 0.6,
        (fz + ez) * 0.5,
        ex,
        ey,
        ez,
        flareColor.r,
        flareColor.g,
        flareColor.b,
        0.34,
        0,
        7.5
      )
    }

    // Beat 2 & 3: 3D quadratic Bezier stream + arrival cascade sparks per unlocked target
    const cappedTargets = Math.min(MAX_TARGETS, targetPositions.length)
    if (cappedTargets > 0) {
      const budgetLeft = Math.max(cappedTargets * 2, this.maxParticles - flareCount)
      const perTarget = Math.max(2, Math.floor(budgetLeft / cappedTargets))
      const streamPerTarget = Math.max(1, Math.floor(perTarget * 0.65))
      const arrivalPerTarget = Math.max(1, perTarget - streamPerTarget)

      for (let tIdx = 0; tIdx < cappedTargets; tIdx++) {
        const tp = targetPositions[tIdx]!
        const tx = tp[0]
        const ty = tp[1]
        const tz = tp[2]
        const dist = Math.hypot(tx - fx, ty - fy, tz - fz)
        const archLift = 0.28 * dist + 4.0

        for (let s = 0; s < streamPerTarget; s++) {
          const latAngle = tIdx * 1.7 + s * 2.1
          const latMag = 1.6 + (s % 3) * 0.9
          const cx = (fx + tx) * 0.5 + Math.cos(latAngle) * latMag
          const cy = (fy + ty) * 0.5 + archLift
          const cz = (fz + tz) * 0.5 + Math.sin(latAngle) * latMag
          const delay = 0.06 + (s / Math.max(1, streamPerTarget)) * 0.18
          const dur = 0.45 + (s % 4) * 0.06
          this.allocSlot(
            fx,
            fy,
            fz,
            cx,
            cy,
            cz,
            tx,
            ty,
            tz,
            flareColor.r * 0.55 + cascadeColor.r * 0.45,
            flareColor.g * 0.55 + cascadeColor.g * 0.45,
            flareColor.b * 0.55 + cascadeColor.b * 0.45,
            dur,
            delay,
            6.5
          )
        }

        for (let a = 0; a < arrivalPerTarget; a++) {
          const phi = a * 2.3999632 + tIdx
          const z = 1 - (2 * (a + 0.5)) / Math.max(1, arrivalPerTarget)
          const rXY = Math.sqrt(Math.max(0, 1 - z * z))
          const burstR = 2.2 + (a % 3) * 0.65
          const ex = tx + rXY * Math.cos(phi) * burstR
          const ey = ty + z * burstR
          const ez = tz + rXY * Math.sin(phi) * burstR
          this.allocSlot(
            tx,
            ty,
            tz,
            (tx + ex) * 0.5,
            (ty + ey) * 0.5 + 0.4,
            (tz + ez) * 0.5,
            ex,
            ey,
            ez,
            cascadeColor.r,
            cascadeColor.g,
            cascadeColor.b,
            0.4,
            0.55 + (a % 3) * 0.05,
            5.8
          )
        }
      }
    }

    this.syncBuffers(undefined)
  }

  update(dtSec: number, cameraPos?: THREE.Vector3): void {
    if (!this.shockwaveActive && this._activeParticleCount === 0) return

    const dt = Math.max(0, Math.min(0.1, Number.isFinite(dtSec) ? dtSec : 0))

    if (this.shockwaveActive) {
      this.shockwaveAge += dt
      const progress = Math.min(1, this.shockwaveAge / this.shockwaveDuration)
      if (progress >= 1) {
        this.shockwaveActive = false
        this.shockwaveMesh.visible = false
      } else {
        const scale = 1 + 13 * (1 - Math.pow(1 - progress, 2))
        this.shockwaveMesh.scale.setScalar(scale)
        const uProg = this.shockwaveMesh.material.uniforms['uProgress']
        if (uProg) uProg.value = progress
        if (cameraPos) {
          this.shockwaveMesh.lookAt(cameraPos)
        }
      }
    }

    if (this._activeParticleCount === 0) return

    for (let i = 0; i < MAX_CAPACITY; i++) {
      if (this.active[i] !== 1) continue
      const nextAge = (this.age[i] ?? 0) + dt
      this.age[i] = nextAge
      const total = (this.delay[i] ?? 0) + (this.duration[i] ?? 0.25)
      if (nextAge >= total) {
        this.active[i] = 0
      }
    }

    this.syncBuffers(cameraPos)
  }

  private syncBuffers(_cameraPos: THREE.Vector3 | undefined): void {
    const posArr = this.positionsAttr.array as Float32Array
    const colArr = this.colorsAttr.array as Float32Array
    const sizeArr = this.sizesAttr.array as Float32Array
    const alphaArr = this.alphasAttr.array as Float32Array

    let writeIdx = 0
    for (let i = 0; i < MAX_CAPACITY; i++) {
      if (this.active[i] !== 1) continue
      if (i >= this.maxParticles || writeIdx >= this.maxParticles) {
        this.active[i] = 0
        continue
      }

      const a = this.age[i] ?? 0
      const del = this.delay[i] ?? 0
      const dur = Math.max(0.01, this.duration[i] ?? 0.25)

      if (a < del) {
        // Pending particle — keep slot alive in write range with alpha 0
        posArr[writeIdx * 3] = this.startX[i] ?? 0
        posArr[writeIdx * 3 + 1] = this.startY[i] ?? 0
        posArr[writeIdx * 3 + 2] = this.startZ[i] ?? 0
        colArr[writeIdx * 3] = this.colorR[i] ?? 1
        colArr[writeIdx * 3 + 1] = this.colorG[i] ?? 1
        colArr[writeIdx * 3 + 2] = this.colorB[i] ?? 1
        sizeArr[writeIdx] = this.baseSize[i] ?? 5
        alphaArr[writeIdx] = 0
        writeIdx++
        continue
      }

      const u = Math.min(1, (a - del) / dur)
      const inv = 1 - u
      const b0 = inv * inv
      const b1 = 2 * inv * u
      const b2 = u * u

      posArr[writeIdx * 3] =
        b0 * (this.startX[i] ?? 0) + b1 * (this.ctrlX[i] ?? 0) + b2 * (this.endX[i] ?? 0)
      posArr[writeIdx * 3 + 1] =
        b0 * (this.startY[i] ?? 0) + b1 * (this.ctrlY[i] ?? 0) + b2 * (this.endY[i] ?? 0)
      posArr[writeIdx * 3 + 2] =
        b0 * (this.startZ[i] ?? 0) + b1 * (this.ctrlZ[i] ?? 0) + b2 * (this.endZ[i] ?? 0)

      colArr[writeIdx * 3] = this.colorR[i] ?? 1
      colArr[writeIdx * 3 + 1] = this.colorG[i] ?? 1
      colArr[writeIdx * 3 + 2] = this.colorB[i] ?? 1

      const fade = u < 0.2 ? u / 0.2 : Math.max(0, 1 - (u - 0.2) / 0.8)
      sizeArr[writeIdx] = (this.baseSize[i] ?? 5) * (0.75 + 0.4 * fade)
      alphaArr[writeIdx] = fade
      writeIdx++
    }

    this._activeParticleCount = writeIdx
    this.geometry.setDrawRange(0, writeIdx)
    this.positionsAttr.needsUpdate = true
    this.colorsAttr.needsUpdate = true
    this.sizesAttr.needsUpdate = true
    this.alphasAttr.needsUpdate = true
  }

  dispose(): void {
    this.geometry.dispose()
    this.points.material.dispose()
    this.shockwaveMesh.geometry.dispose()
    this.shockwaveMesh.material.dispose()
  }
}
