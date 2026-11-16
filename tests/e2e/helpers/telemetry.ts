import zlib from 'node:zlib'
import { expect, type Page } from '@playwright/test'
import { byTestId, TEST_IDS } from './selectors'

export type RendererMode = 'webgl2' | 'webgl1' | 'fallback-2d'

export interface TelemetryData {
  ready: boolean
  rendererMode: RendererMode
  glRenderer: string
  frameCount: number
  nodeCount: number
  edgeCount: number
  camera: {
    pos: [number, number, number]
    target: [number, number, number]
    distance: number
  }
  activeView: string
  selectedId: string | null
  hoveredId: string | null
  isFlying: boolean
  lastBurstAt: number
}

export interface ScreenProjection {
  x: number
  y: number
  inView: boolean
}

declare global {
  interface Window {
    __LITREE_TELEMETRY__?: TelemetryData & {
      projectNodeToScreen: (id: string) => ScreenProjection | null
    }
  }
}

export async function waitForAppReady(
  page: Page,
  opts?: { allowFallback2d?: boolean; minFrames?: number; timeout?: number }
): Promise<TelemetryData> {
  const allowFallback2d = opts?.allowFallback2d ?? false
  const minFrames = opts?.minFrames ?? 2
  const timeout = opts?.timeout ?? 30_000

  await page.waitForFunction(
    ({ allowFallback, frames }) => {
      const t = window.__LITREE_TELEMETRY__
      if (!t || !t.ready) return false
      if (t.rendererMode === 'fallback-2d') {
        return allowFallback
      }
      return t.frameCount >= frames
    },
    { allowFallback: allowFallback2d, frames: minFrames },
    { timeout }
  )

  return getTelemetry(page)
}

export async function getTelemetry(page: Page): Promise<TelemetryData> {
  const snap = await page.evaluate(() => {
    const t = window.__LITREE_TELEMETRY__
    if (!t) return null
    return {
      ready: t.ready,
      rendererMode: t.rendererMode,
      glRenderer: t.glRenderer,
      frameCount: t.frameCount,
      nodeCount: t.nodeCount,
      edgeCount: t.edgeCount,
      camera: {
        pos: [t.camera.pos[0], t.camera.pos[1], t.camera.pos[2]] as [number, number, number],
        target: [t.camera.target[0], t.camera.target[1], t.camera.target[2]] as [
          number,
          number,
          number
        ],
        distance: t.camera.distance
      },
      activeView: t.activeView,
      selectedId: t.selectedId,
      hoveredId: t.hoveredId,
      isFlying: t.isFlying,
      lastBurstAt: t.lastBurstAt
    }
  })

  if (!snap) {
    throw new Error('window.__LITREE_TELEMETRY__ is undefined')
  }
  return snap
}

export async function waitForCameraSettle(page: Page, timeout = 15_000): Promise<void> {
  await page.waitForFunction(
    () => {
      const t = window.__LITREE_TELEMETRY__
      return Boolean(t && t.ready && !t.isFlying)
    },
    undefined,
    { timeout }
  )
  await page.waitForTimeout(120)
}

export async function projectNodeToScreen(
  page: Page,
  nodeId: string
): Promise<ScreenProjection | null> {
  return page.evaluate((id) => {
    const t = window.__LITREE_TELEMETRY__
    if (!t || typeof t.projectNodeToScreen !== 'function') return null
    return t.projectNodeToScreen(id)
  }, nodeId)
}

export async function projectAndHoverNode(page: Page, nodeId: string): Promise<ScreenProjection> {
  await waitForCameraSettle(page)
  const proj = await projectNodeToScreen(page, nodeId)
  expect(proj, `Expected projection for node "${nodeId}" to be non-null`).not.toBeNull()
  expect(proj?.inView, `Expected node "${nodeId}" to be inView`).toBe(true)
  const target = proj!
  await page.mouse.move(target.x, target.y, { steps: 6 })
  await page.waitForTimeout(120)
  return target
}

export async function projectAndClickNode(page: Page, nodeId: string): Promise<ScreenProjection> {
  await waitForCameraSettle(page)
  const proj = await projectNodeToScreen(page, nodeId)
  expect(proj, `Expected projection for node "${nodeId}" to be non-null`).not.toBeNull()
  expect(proj?.inView, `Expected node "${nodeId}" to be inView`).toBe(true)
  const target = proj!
  await page.mouse.move(target.x, target.y, { steps: 4 })
  await page.mouse.click(target.x, target.y)
  return target
}

interface DecodedPng {
  width: number
  height: number
  pixels: Uint8Array
  channels: number
}

function paethPredictor(a: number, b: number, c: number): number {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b
  return c
}

function decodePngRgba(buffer: Buffer): DecodedPng {
  const pngSig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(pngSig)) {
    throw new Error('Invalid PNG signature in canvas screenshot')
  }

  let offset = 8
  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = 0
  const idatChunks: Buffer[] = []

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii')
    const dataStart = offset + 8
    const dataEnd = dataStart + length
    if (dataEnd + 4 > buffer.length) break

    if (type === 'IHDR') {
      width = buffer.readUInt32BE(dataStart)
      height = buffer.readUInt32BE(dataStart + 4)
      bitDepth = buffer.readUInt8(dataStart + 8)
      colorType = buffer.readUInt8(dataStart + 9)
    } else if (type === 'IDAT') {
      idatChunks.push(buffer.subarray(dataStart, dataEnd))
    } else if (type === 'IEND') {
      break
    }
    offset = dataEnd + 4
  }

  if (width === 0 || height === 0 || bitDepth !== 8) {
    throw new Error(`Unsupported PNG dimensions or bit depth: ${width}x${height} bpp=${bitDepth}`)
  }

  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0
  if (channels === 0) {
    throw new Error(`Unsupported PNG colorType: ${colorType}`)
  }

  const raw = zlib.inflateSync(Buffer.concat(idatChunks))
  const stride = width * channels
  const pixels = new Uint8Array(height * stride)

  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1)
    const filterType = raw[rowStart] ?? 0
    const dstOffset = y * stride

    for (let x = 0; x < stride; x++) {
      const val = raw[rowStart + 1 + x] ?? 0
      const a = x >= channels ? (pixels[dstOffset + x - channels] ?? 0) : 0
      const b = y > 0 ? (pixels[(y - 1) * stride + x] ?? 0) : 0
      const c = y > 0 && x >= channels ? (pixels[(y - 1) * stride + x - channels] ?? 0) : 0

      let recon = val
      if (filterType === 1) recon = (val + a) & 0xff
      else if (filterType === 2) recon = (val + b) & 0xff
      else if (filterType === 3) recon = (val + Math.floor((a + b) / 2)) & 0xff
      else if (filterType === 4) recon = (val + paethPredictor(a, b, c)) & 0xff

      pixels[dstOffset + x] = recon
    }
  }

  return { width, height, pixels, channels }
}

export async function getCanvasPixelStats(page: Page): Promise<{
  width: number
  height: number
  uniqueColors: number
  lumaVariance: number
  sampleDigest: string
}> {
  const canvas = byTestId(page, TEST_IDS.nebulaCanvas)
  await expect(canvas).toBeVisible()
  const pngBuffer = await canvas.screenshot({ type: 'png' })
  const decoded = decodePngRgba(pngBuffer)

  const unique = new Set<number>()
  const lumas: number[] = []
  const digestParts: number[] = []
  const stepX = Math.max(1, Math.floor(decoded.width / 80))
  const stepY = Math.max(1, Math.floor(decoded.height / 50))

  for (let y = 0; y < decoded.height; y += stepY) {
    for (let x = 0; x < decoded.width; x += stepX) {
      const idx = (y * decoded.width + x) * decoded.channels
      const r = decoded.pixels[idx] ?? 0
      const g = decoded.pixels[idx + 1] ?? 0
      const b = decoded.pixels[idx + 2] ?? 0
      unique.add((r << 16) | (g << 8) | b)
      lumas.push(0.2126 * r + 0.7152 * g + 0.0722 * b)
      if (digestParts.length < 120) {
        digestParts.push(r, g, b)
      }
    }
  }

  const count = lumas.length || 1
  const mean = lumas.reduce((acc, v) => acc + v, 0) / count
  const variance = lumas.reduce((acc, v) => acc + (v - mean) ** 2, 0) / count

  return {
    width: decoded.width,
    height: decoded.height,
    uniqueColors: unique.size,
    lumaVariance: variance,
    sampleDigest: digestParts.join(',')
  }
}

export async function assertCanvasHasVariance(
  page: Page,
  minUniqueColors = 8,
  minLumaVariance = 1.0
): Promise<void> {
  const stats = await getCanvasPixelStats(page)
  expect(stats.width).toBeGreaterThan(0)
  expect(stats.height).toBeGreaterThan(0)
  expect(
    stats.uniqueColors,
    `Expected nebula-canvas to render >= ${minUniqueColors} unique colors, got ${stats.uniqueColors}`
  ).toBeGreaterThanOrEqual(minUniqueColors)
  expect(
    stats.lumaVariance,
    `Expected nebula-canvas luminance variance >= ${minLumaVariance}, got ${stats.lumaVariance}`
  ).toBeGreaterThanOrEqual(minLumaVariance)
}
