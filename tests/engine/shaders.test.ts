import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import {
  createBurstParticleMaterial,
  createFilamentMaterial,
  createNebulaCloudMaterial,
  createNebulaSpriteTexture,
  createOrbitalRingMaterial,
  createShockwaveMaterial,
  createStarfieldMaterial,
  createStarNodeMaterial
} from '../../src/engine/shaders'

const FORBIDDEN_REDECLARATIONS = [
  /\battribute\s+\w+\s+position\b/,
  /\battribute\s+\w+\s+normal\b/,
  /\battribute\s+\w+\s+uv\b/,
  /\battribute\s+\w+\s+instanceMatrix\b/,
  /\battribute\s+\w+\s+instanceColor\b/,
  /\bin\s+\w+\s+instanceMatrix\b/,
  /\bin\s+\w+\s+instanceColor\b/,
  /#version\s+300\s+es/
]

describe('shaders (F7)', () => {
  it('createNebulaSpriteTexture generates procedural DataTexture in Node with zero network calls', () => {
    const tex = createNebulaSpriteTexture()
    expect(tex).toBeInstanceOf(THREE.Texture)
    expect(tex).toBeInstanceOf(THREE.DataTexture)
    const img = tex.image as { width: number; height: number; data: Uint8Array }
    expect(img.width).toBe(64)
    expect(img.height).toBe(64)
    // Center pixel opaque, corner pixel transparent
    const centerAlpha = img.data[(32 * 64 + 32) * 4 + 3]
    const cornerAlpha = img.data[3]
    expect(centerAlpha).toBeGreaterThan(200)
    expect(cornerAlpha).toBe(0)
    tex.dispose()
  })

  it('all 7 ShaderMaterial factories construct cleanly without redeclaring Three.js built-ins', () => {
    const tex = createNebulaSpriteTexture()
    const materials: { name: string; mat: THREE.ShaderMaterial; requiredUniforms: string[] }[] = [
      {
        name: 'starfield',
        mat: createStarfieldMaterial(),
        requiredUniforms: ['uTime', 'uPixelRatio', 'uOpacity', 'uReducedMotion']
      },
      {
        name: 'nebulaCloud',
        mat: createNebulaCloudMaterial(tex),
        requiredUniforms: ['uTime', 'uPixelRatio', 'uMap', 'uOpacity', 'uReducedMotion']
      },
      {
        name: 'starNode',
        mat: createStarNodeMaterial(),
        requiredUniforms: ['uTime', 'uReducedMotion', 'uGlowStrength']
      },
      {
        name: 'orbitalRing',
        mat: createOrbitalRingMaterial(),
        requiredUniforms: ['uTime', 'uReducedMotion', 'uGlowStrength']
      },
      {
        name: 'filament',
        mat: createFilamentMaterial(),
        requiredUniforms: ['uTime', 'uReducedMotion', 'uBaseOpacity']
      },
      {
        name: 'burstParticle',
        mat: createBurstParticleMaterial(tex),
        requiredUniforms: ['uPixelRatio', 'uMap', 'uOpacity']
      },
      {
        name: 'shockwave',
        mat: createShockwaveMaterial(),
        requiredUniforms: ['uProgress', 'uColor', 'uOpacity']
      }
    ]

    for (const { mat, requiredUniforms } of materials) {
      expect(mat).toBeInstanceOf(THREE.ShaderMaterial)
      expect(mat.glslVersion).toBeNull()
      for (const u of requiredUniforms) {
        expect(mat.uniforms[u]).toBeDefined()
      }
      for (const rx of FORBIDDEN_REDECLARATIONS) {
        expect(rx.test(mat.vertexShader)).toBe(false)
        expect(rx.test(mat.fragmentShader)).toBe(false)
      }
      mat.dispose()
    }

    tex.dispose()
  })

  it('all GLSL ES 3.00 smoothstep(edge0, edge1, x) calls satisfy edge0 < edge1', () => {
    const tex = createNebulaSpriteTexture()
    const materials: { name: string; mat: THREE.ShaderMaterial }[] = [
      { name: 'starfield', mat: createStarfieldMaterial() },
      { name: 'nebulaCloud', mat: createNebulaCloudMaterial(tex) },
      { name: 'starNode', mat: createStarNodeMaterial() },
      { name: 'orbitalRing', mat: createOrbitalRingMaterial() },
      { name: 'filament', mat: createFilamentMaterial() },
      { name: 'burstParticle', mat: createBurstParticleMaterial(tex) },
      { name: 'shockwave', mat: createShockwaveMaterial() }
    ]

    const smoothstepRx = /\bsmoothstep\s*\(\s*([^,]+?)\s*,\s*([^,]+?)\s*,/g
    let totalCalls = 0

    for (const { name, mat } of materials) {
      for (const stage of [
        { label: 'vertex', src: mat.vertexShader },
        { label: 'fragment', src: mat.fragmentShader }
      ]) {
        smoothstepRx.lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = smoothstepRx.exec(stage.src)) !== null) {
          totalCalls++
          const rawEdge0 = match[1]!.trim()
          const rawEdge1 = match[2]!.trim()
          const edge0 = Number(rawEdge0)
          const edge1 = Number(rawEdge1)
          expect(
            Number.isFinite(edge0) && Number.isFinite(edge1),
            `${name} (${stage.label}) smoothstep(${rawEdge0}, ${rawEdge1}, ...) must use finite numeric edges`
          ).toBe(true)
          expect(
            edge0,
            `${name} (${stage.label}) smoothstep(${rawEdge0}, ${rawEdge1}, ...) violates edge0 < edge1`
          ).toBeLessThan(edge1)
        }
      }
      mat.dispose()
    }

    expect(totalCalls).toBeGreaterThanOrEqual(3)
    tex.dispose()
  })
})
