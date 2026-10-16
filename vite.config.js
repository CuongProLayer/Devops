import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5086',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5086',
        changeOrigin: true,
        secure: false,
      },
      '/swagger': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5086',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
