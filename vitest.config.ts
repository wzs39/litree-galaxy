import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // Explicitly pin root to repo root so vite.config.ts's `root: 'src'` never hides `tests/`
  root: ROOT_DIR,
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'node'
  }
})
