import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [react()],
    esbuild: isProduction ? {
      drop: ['console', 'debugger'],
      legalComments: 'none',
    } : undefined,
    build: {
      target: ['es2020', 'safari14'],
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      minify: 'esbuild',
      sourcemap: false,
      reportCompressedSize: true,
    },
    server: {
      port: 5173,
      proxy: {
        '/api': 'http://localhost:8787',
      },
    },
  }
})
