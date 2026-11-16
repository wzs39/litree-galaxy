import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'src',
  // Relative base so GitHub Pages subpath (/litree-galaxy/) works with zero path rewrites
  base: './',
  publicDir: '../resources',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
})
