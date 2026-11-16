import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { ParticleBurstSystem } from '../../src/engine/ParticleBurstSystem'
import { createNebulaSpriteTexture } from '../../src/engine/shaders'

describe('ParticleBurstSystem (F7)', () => {
  it('runs 5-beat light-up cascade and reclaims all slots once finished', () => {
    const tex = createNebulaSpriteTexture()
    const burst = new ParticleBurstSystem(tex)

    expect(burst.activeParticleCount).toBe(0)
    expect(burst.isShockwaveVisible).toBe(false)

    burst.triggerBurst([0, 0, 0], [
      [12, 3, -4],
      [-10, 5, 8]
    ])

    expect(burst.lastBurstAt).toBeGreaterThan(0)
    expect(burst.activeParticleCount).toBeGreaterThan(0)
    expect(burst.isShockwaveVisible).toBe(true)

    const camPos = new THREE.Vector3(0, 30, 80)
    // Mid-ceremony
    for (let i = 0; i < 6; i++) burst.update(0.05, camPos)
    expect(burst.activeParticleCount).toBeGreaterThan(0)

    // Advance past total ceremony duration (~1.2s)
    for (let i = 0; i < 15; i++) burst.update(0.08, camPos)
    expect(burst.activeParticleCount).toBe(0)
    expect(burst.isShockwaveVisible).toBe(false)

    burst.dispose()
    tex.dispose()
  })

  it('enforces eco maxParticles budget even with 16 unlocked targets', () => {
    const tex = createNebulaSpriteTexture()
    const burst = new ParticleBurstSystem(tex)
    burst.setMaxParticles(160)

    const targets: [number, number, number][] = []
    for (let i = 0; i < 20; i++) {
      targets.push([i * 3, 2, -i * 2])
    }
    burst.triggerBurst([0, 0, 0], targets)

    expect(burst.activeParticleCount).toBeLessThanOrEqual(160)
    expect(burst.activeParticleCount).toBeGreaterThan(0)

    burst.dispose()
    tex.dispose()
  })

  it('respects prefers-reduced-motion by suppressing shockwave and decaying quickly', () => {
    const tex = createNebulaSpriteTexture()
    const burst = new ParticleBurstSystem(tex)
    burst.setReducedMotion(true)

    burst.triggerBurst([0, 0, 0], [[10, 0, 0], [0, 10, 0]])
    expect(burst.lastBurstAt).toBeGreaterThan(0)
    expect(burst.isShockwaveVisible).toBe(false)
    expect(burst.activeParticleCount).toBeGreaterThan(0)

    for (let i = 0; i < 4; i++) burst.update(0.08)
    expect(burst.activeParticleCount).toBe(0)

    burst.dispose()
    tex.dispose()
  })

  it('skips GPU buffer version increments on idle frames before and after bursts', () => {
    const tex = createNebulaSpriteTexture()
    const burst = new ParticleBurstSystem(tex)

    const getVersions = () => {
      const g = burst.points.geometry
      return [
        (g.getAttribute('position') as THREE.BufferAttribute).version,
        (g.getAttribute('aColor') as THREE.BufferAttribute).version,
        (g.getAttribute('aSize') as THREE.BufferAttribute).version,
        (g.getAttribute('aAlpha') as THREE.BufferAttribute).version
      ]
    }

    // Idle updates prior to any burst should not flag GPU uploads
    const initialVersions = getVersions()
    for (let i = 0; i < 5; i++) burst.update(0.016)
    expect(getVersions()).toEqual(initialVersions)

    // Trigger burst and advance until all particles and shockwave finish
    burst.triggerBurst([0, 0, 0], [[8, 4, -3]])
    expect(burst.activeParticleCount).toBeGreaterThan(0)
    const camPos = new THREE.Vector3(0, 20, 60)
    for (let i = 0; i < 20; i++) burst.update(0.08, camPos)
    expect(burst.activeParticleCount).toBe(0)
    expect(burst.isShockwaveVisible).toBe(false)

    // Final death frame synced drawRange(0, 0); subsequent idle frames must NOT upload
    const settledVersions = getVersions()
    for (let i = 0; i < 10; i++) burst.update(0.016, camPos)
    expect(getVersions()).toEqual(settledVersions)

    burst.dispose()
    tex.dispose()
  })

  it('enforces eco cap immediately on mid-burst quality downgrade from high and guards NaN limit', () => {
    const tex = createNebulaSpriteTexture()
    const burst = new ParticleBurstSystem(tex)

    const targets: [number, number, number][] = []
    for (let i = 0; i < 16; i++) {
      targets.push([i * 2, 1, -i])
    }

    // Start in high (640)
    burst.setMaxParticles(640)
    burst.triggerBurst([0, 0, 0], targets)
    expect(burst.activeParticleCount).toBe(640)

    // Downgrade mid-burst to eco (160): activeParticleCount and drawRange immediately clamp <= 160
    burst.setMaxParticles(160)
    expect(burst.activeParticleCount).toBeLessThanOrEqual(160)
    expect(burst.points.geometry.drawRange.count).toBeLessThanOrEqual(160)

    // Subsequent burst in eco stays <= 160
    burst.triggerBurst([10, 0, 0], targets)
    expect(burst.activeParticleCount).toBeLessThanOrEqual(160)
    expect(burst.activeParticleCount).toBeGreaterThan(0)

    // NaN limit falls back safely without breaking subsequent bursts
    burst.setMaxParticles(Number.NaN)
    burst.triggerBurst([0, 0, 0], targets)
    expect(burst.activeParticleCount).toBeGreaterThan(0)
    expect(burst.activeParticleCount).toBeLessThanOrEqual(640)

    burst.dispose()
    tex.dispose()
  })
})
