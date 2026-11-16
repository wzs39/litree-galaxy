import * as THREE from 'three'
import type { QualityPreset, ThemeMode } from '../core/types'

export interface ThemePalette {
  background: number
  backgroundHex: string
  additive: boolean
  starfieldOpacity: number
  cloudOpacity: number
  filamentOpacity: number
  glowStrength: number
  states: {
    locked: THREE.Color
    available: THREE.Color
    queued: THREE.Color
    learning: THREE.Color
    lit: THREE.Color
    review_due: THREE.Color
  }
  edges: {
    dim: THREE.Color
    inPath: THREE.Color
    missingPrereq: THREE.Color
    dependent: THREE.Color
    cycleConflict: THREE.Color
    soft: THREE.Color
  }
}

export interface QualityConfig {
  dprCap: number
  antialias: boolean
  starfieldCount: number
  bezierSegments: number
  maxBurstParticles: number
}

export const QUALITY_CONFIGS: Record<QualityPreset, QualityConfig> = {
  high: {
    dprCap: 2,
    antialias: true,
    starfieldCount: 2200,
    bezierSegments: 16,
    maxBurstParticles: 640
  },
  balanced: {
    dprCap: 1.5,
    antialias: true,
    starfieldCount: 1200,
    bezierSegments: 12,
    maxBurstParticles: 360
  },
  eco: {
    dprCap: 1,
    antialias: false,
    starfieldCount: 500,
    bezierSegments: 8,
    maxBurstParticles: 160
  }
}

export const THEME_PALETTES: Record<ThemeMode, ThemePalette> = {
  nebula: {
    background: 0x060913,
    backgroundHex: '#060913',
    additive: true,
    starfieldOpacity: 0.85,
    cloudOpacity: 0.22,
    filamentOpacity: 0.44,
    glowStrength: 1.0,
    states: {
      locked: new THREE.Color('#475569'),
      available: new THREE.Color('#38bdf8'),
      queued: new THREE.Color('#a78bfa'),
      learning: new THREE.Color('#2dd4bf'),
      lit: new THREE.Color('#f5c451'),
      review_due: new THREE.Color('#c084fc')
    },
    edges: {
      dim: new THREE.Color('#334155'),
      inPath: new THREE.Color('#f5c451'),
      missingPrereq: new THREE.Color('#f43f5e'),
      dependent: new THREE.Color('#22d3ee'),
      cycleConflict: new THREE.Color('#ef4444'),
      soft: new THREE.Color('#64748b')
    }
  },
  daylight: {
    background: 0xeef2f7,
    backgroundHex: '#eef2f7',
    additive: false,
    starfieldOpacity: 0.35,
    cloudOpacity: 0.16,
    filamentOpacity: 0.58,
    glowStrength: 0.55,
    states: {
      locked: new THREE.Color('#94a3b8'),
      available: new THREE.Color('#0284c7'),
      queued: new THREE.Color('#7c3aed'),
      learning: new THREE.Color('#0d9488'),
      lit: new THREE.Color('#d97706'),
      review_due: new THREE.Color('#9333ea')
    },
    edges: {
      dim: new THREE.Color('#94a3b8'),
      inPath: new THREE.Color('#d97706'),
      missingPrereq: new THREE.Color('#e11d48'),
      dependent: new THREE.Color('#0891b2'),
      cycleConflict: new THREE.Color('#dc2626'),
      soft: new THREE.Color('#64748b')
    }
  },
  minimal: {
    background: 0x0b0f17,
    backgroundHex: '#0b0f17',
    additive: true,
    starfieldOpacity: 0.28,
    cloudOpacity: 0.08,
    filamentOpacity: 0.36,
    glowStrength: 0.72,
    states: {
      locked: new THREE.Color('#3f4a5a'),
      available: new THREE.Color('#60a5fa'),
      queued: new THREE.Color('#818cf8'),
      learning: new THREE.Color('#34d399'),
      lit: new THREE.Color('#fbbf24'),
      review_due: new THREE.Color('#c084fc')
    },
    edges: {
      dim: new THREE.Color('#334155'),
      inPath: new THREE.Color('#fbbf24'),
      missingPrereq: new THREE.Color('#fb7185'),
      dependent: new THREE.Color('#38bdf8'),
      cycleConflict: new THREE.Color('#ef4444'),
      soft: new THREE.Color('#475569')
    }
  }
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/**
 * Generates a soft radial glow texture completely procedurally (zero network requests).
 * Falls back to a Gaussian RGBA DataTexture in headless/Node environments.
 */
export function createNebulaSpriteTexture(): THREE.Texture {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
      grad.addColorStop(0.0, 'rgba(255,255,255,1)')
      grad.addColorStop(0.25, 'rgba(255,255,255,0.62)')
      grad.addColorStop(0.55, 'rgba(255,255,255,0.16)')
      grad.addColorStop(1.0, 'rgba(255,255,255,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 128, 128)
      const tex = new THREE.CanvasTexture(canvas)
      tex.needsUpdate = true
      return tex
    }
  }

  const size = 64
  const data = new Uint8Array(size * size * 4)
  const half = (size - 1) * 0.5
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - half) / half
      const ny = (y - half) / half
      const r2 = nx * nx + ny * ny
      const r = Math.sqrt(r2)
      const alpha = r >= 1 ? 0 : Math.round(255 * Math.exp(-r2 * 4.5) * (1 - smoothstep(0.65, 1.0, r)))
      const idx = (y * size + x) * 4
      data[idx] = 255
      data[idx + 1] = 255
      data[idx + 2] = 255
      data[idx + 3] = alpha
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  tex.needsUpdate = true
  return tex
}

export function createStarfieldMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0.85 },
      uReducedMotion: { value: 0 }
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uReducedMotion;
      varying vec3 vColor;
      varying float vTwinkle;

      void main() {
        vColor = aColor;
        vTwinkle = uReducedMotion > 0.5
          ? 0.85
          : (0.55 + 0.45 * sin(uTime * (0.8 + mod(aPhase, 1.9)) + aPhase * 6.28318));
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(aSize * uPixelRatio * (280.0 / max(1.0, -mvPosition.z)), 1.0, 18.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vTwinkle;

      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float alpha = exp(-d * d * 14.0) * vTwinkle * uOpacity;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
}

export function createNebulaCloudMaterial(spriteTexture: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uMap: { value: spriteTexture },
      uOpacity: { value: 0.22 },
      uReducedMotion: { value: 0 }
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      attribute float aAlpha;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uReducedMotion;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = aColor;
        vAlpha = aAlpha;
        vec3 pos = position;
        pos.y += (1.0 - uReducedMotion) * sin(uTime * 0.25 + aPhase * 6.28318) * 1.2;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = clamp(aSize * uPixelRatio * (520.0 / max(15.0, -mvPosition.z)), 8.0, 280.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        float a = tex.a * vAlpha * uOpacity;
        if (a < 0.005) discard;
        gl_FragColor = vec4(vColor, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
}

export function createStarNodeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uReducedMotion: { value: 0 },
      uGlowStrength: { value: 1.0 }
    },
    vertexShader: /* glsl */ `
      attribute float aState;
      attribute vec2 aEmphasis;
      attribute float aPhase;
      uniform float uTime;
      uniform float uReducedMotion;
      varying vec3 vColor;
      varying vec3 vViewNormal;
      varying vec3 vViewDir;
      varying float vState;
      varying float vEmphasis;
      varying float vAlpha;

      void main() {
        vState = aState;
        vEmphasis = aEmphasis.x;
        vAlpha = aEmphasis.y;

        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #else
          vColor = vec3(1.0);
        #endif

        float pulseAmp = 0.0;
        float pulseSpeed = 1.6;
        if (aState > 4.5) {
          pulseAmp = 0.15;
          pulseSpeed = 2.6;
        } else if (aState > 2.5 && aState < 3.5) {
          pulseAmp = 0.12;
          pulseSpeed = 2.1;
        } else if (aState > 0.5 && aState < 1.5) {
          pulseAmp = 0.06;
          pulseSpeed = 1.4;
        } else if (aState > 3.5 && aState < 4.5) {
          pulseAmp = 0.03;
          pulseSpeed = 1.1;
        }

        float motionScale = 1.0 - uReducedMotion;
        float pulse = 1.0 + motionScale * pulseAmp * sin(uTime * pulseSpeed + aPhase * 6.28318);
        float emphasisBoost = aEmphasis.x > 0.5 ? (aEmphasis.x > 1.5 ? 1.24 : 1.14) : 1.0;
        vec3 localPos = position * (pulse * emphasisBoost);

        #ifdef USE_INSTANCING
          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(localPos, 1.0);
          vViewNormal = normalize(normalMatrix * (mat3(instanceMatrix) * normal));
        #else
          vec4 mvPosition = modelViewMatrix * vec4(localPos, 1.0);
          vViewNormal = normalize(normalMatrix * normal);
        #endif

        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uGlowStrength;
      varying vec3 vColor;
      varying vec3 vViewNormal;
      varying vec3 vViewDir;
      varying float vState;
      varying float vEmphasis;
      varying float vAlpha;

      void main() {
        if (vAlpha < 0.02) discard;
        float ndotv = clamp(dot(normalize(vViewNormal), normalize(vViewDir)), 0.0, 1.0);
        float fresnel = pow(max(1.0 - ndotv, 1e-4), 2.1);
        float coreWhiteMix = vState >= 3.5 ? 0.45 : 0.22;
        vec3 hotCore = mix(vColor, vec3(1.0), coreWhiteMix * ndotv);
        vec3 col = hotCore + vColor * fresnel * uGlowStrength * (0.45 + 0.35 * vEmphasis);
        gl_FragColor = vec4(col, vAlpha);
      }
    `,
    transparent: true,
    depthWrite: true
  })
}

export function createOrbitalRingMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uReducedMotion: { value: 0 },
      uGlowStrength: { value: 1.0 }
    },
    vertexShader: /* glsl */ `
      attribute float aRingMode;
      attribute float aAlpha;
      uniform float uTime;
      uniform float uReducedMotion;
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vRingMode;
      varying float vAlpha;

      void main() {
        vUv = uv;
        vRingMode = aRingMode;
        vAlpha = aAlpha;

        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #else
          vColor = vec3(1.0);
        #endif

        float speed = aRingMode > 1.5 && aRingMode < 2.5 ? 1.4 : 0.7;
        float angle = (1.0 - uReducedMotion) * uTime * speed;
        float c = cos(angle);
        float s = sin(angle);
        vec3 rotated = vec3(
          position.x * c - position.y * s,
          position.x * s + position.y * c,
          position.z
        );

        #ifdef USE_INSTANCING
          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(rotated, 1.0);
        #else
          vec4 mvPosition = modelViewMatrix * vec4(rotated, 1.0);
        #endif
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uGlowStrength;
      varying vec3 vColor;
      varying vec2 vUv;
      varying float vRingMode;
      varying float vAlpha;

      void main() {
        if (vAlpha < 0.02 || vRingMode < 0.5) discard;
        vec2 centered = vUv - vec2(0.5);
        float ang = atan(centered.y, centered.x);
        float arcMask = 1.0;
        if (vRingMode > 1.5 && vRingMode < 3.5) {
          arcMask = 0.45 + 0.55 * smoothstep(-0.2, 0.4, sin(ang * 3.0));
        }
        float alpha = vAlpha * arcMask;
        gl_FragColor = vec4(vColor * (1.0 + 0.35 * uGlowStrength), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  })
}

export function createFilamentMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uReducedMotion: { value: 0 },
      uBaseOpacity: { value: 0.44 }
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aProgress;
      attribute float aEdgeState;
      attribute float aAlpha;
      varying vec3 vColor;
      varying float vProgress;
      varying float vEdgeState;
      varying float vAlpha;

      void main() {
        vColor = aColor;
        vProgress = aProgress;
        vEdgeState = aEdgeState;
        vAlpha = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uReducedMotion;
      uniform float uBaseOpacity;
      varying vec3 vColor;
      varying float vProgress;
      varying float vEdgeState;
      varying float vAlpha;

      void main() {
        if (vAlpha < 0.01) discard;
        float isConflict = (vEdgeState > 3.5 && vEdgeState < 4.5) ? 1.0 : 0.0;
        float speed = isConflict > 0.5 ? 1.4 : 0.55;
        float flow = fract(vProgress - uTime * speed);
        float pulse = (uReducedMotion > 0.5 || vEdgeState < 0.5)
          ? 0.0
          : smoothstep(0.0, 0.12, flow) * (1.0 - smoothstep(0.12, 0.36, flow));
        float strobe = isConflict > 0.5 && uReducedMotion < 0.5
          ? (0.75 + 0.25 * sin(uTime * 10.0))
          : 1.0;
        vec3 col = vColor * (1.0 + pulse * 1.15) * strobe;
        float outAlpha = clamp(vAlpha * uBaseOpacity + pulse * 0.48 * vAlpha, 0.0, 1.0);
        gl_FragColor = vec4(col, outAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
}

export function createBurstParticleMaterial(spriteTexture: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: 1 },
      uMap: { value: spriteTexture },
      uOpacity: { value: 1.0 }
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aAlpha;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = aColor;
        vAlpha = aAlpha;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(aSize * uPixelRatio * (340.0 / max(1.0, -mvPosition.z)), 2.0, 64.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        if (vAlpha < 0.01) discard;
        vec4 tex = texture2D(uMap, gl_PointCoord);
        float a = tex.a * vAlpha * uOpacity;
        if (a < 0.01) discard;
        gl_FragColor = vec4(vColor, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
}

export function createShockwaveMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uColor: { value: new THREE.Color('#f5c451') },
      uOpacity: { value: 1.0 }
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;

      void main() {
        float fade = (1.0 - uProgress) * (1.0 - uProgress);
        float edgeGlow = 1.0 - abs(length(vUv - vec2(0.5)) * 2.0 - 0.85) * 4.0;
        float a = clamp(fade * max(0.25, edgeGlow) * uOpacity, 0.0, 1.0);
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor * (1.2 - 0.3 * uProgress), a);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  })
}
