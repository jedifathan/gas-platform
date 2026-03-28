import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path  from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    open: true,

    // Used during `npm run dev` only.
    // In production, nginx handles the /api proxy (see nginx.conf).
    proxy: {
      '/api': {
        target:       'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
