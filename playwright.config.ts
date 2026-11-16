import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { chromium, defineConfig } from '@playwright/test'

const PORT = 5177
const BASE_URL = `http://127.0.0.1:${PORT}`

function resolveChromiumExecutablePath(): string | undefined {
  const envPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?.trim()
  if (envPath && fs.existsSync(envPath)) {
    return envPath
  }

  try {
    const defaultExecutable = chromium.executablePath()
    if (defaultExecutable && fs.existsSync(defaultExecutable)) {
      return undefined
    }
  } catch {
    // Fall through to cached binary lookup
  }

  const cacheRoots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH?.trim(),
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'ms-playwright') : undefined,
    path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright'),
    path.join(os.homedir(), '.cache', 'ms-playwright'),
    path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright')
  ].filter((value): value is string => Boolean(value))

  const relativeCandidates = [
    path.join('chromium_headless_shell-1254', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
    path.join('chromium-1254', 'chrome-win64', 'chrome.exe'),
    path.join('chromium_headless_shell-1254', 'chrome-headless-shell-linux', 'chrome-headless-shell'),
    path.join('chromium-1254', 'chrome-linux', 'chrome'),
    path.join('chromium_headless_shell-1254', 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell'),
    path.join('chromium-1254', 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing')
  ]

  for (const root of cacheRoots) {
    for (const rel of relativeCandidates) {
      const candidate = path.join(root, rel)
      if (fs.existsSync(candidate)) {
        return candidate
      }
    }
  }

  return undefined
}

const executablePath = resolveChromiumExecutablePath()

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 60_000,
  expect: {
    timeout: 15_000
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    launchOptions: {
      ...(executablePath ? { executablePath } : {}),
      args: [
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-webgl',
        '--enable-unsafe-swiftshader',
        '--ignore-gpu-blocklist'
      ]
    }
  },
  webServer: {
    command: `npm run build && npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
})
