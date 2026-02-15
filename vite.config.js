import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-v1-sync': {
        target: 'https://procolis.com/api_v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-v1-sync/, ''),
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'framer-motion': ['framer-motion'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
