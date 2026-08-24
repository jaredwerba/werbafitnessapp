import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = process.env.API_TARGET || 'http://127.0.0.1:3000'
const media = process.env.MEDIA_TARGET || 'http://127.0.0.1:8888'
const viteBase = process.env.VITE_MOBILE === '1'
  ? './'
  : (process.env.VITE_BASE || '/')

export default defineConfig({
  plugins: [react()],
  // VITE_MOBILE uses a relative base for Capacitor. VITE_BASE mounts the web
  // app under a path prefix (e.g. /train/ on a trainer marketing site).
  base: viteBase,
  server: {
    proxy: {
      '/api': { target: backend, changeOrigin: true },
      '/train/api': {
        target: backend,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/train/, '')
      },
      '/img': { target: media, changeOrigin: true },
      '/gif': { target: media, changeOrigin: true }
    }
  },
  build: { chunkSizeWarningLimit: 1500 }
})
