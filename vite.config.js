import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunking for faster loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Firebase into its own chunk
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Separate framer-motion (it's large)
          'framer-motion': ['framer-motion'],
          // Separate React core
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    // Enable source maps for debugging, disable in production
    sourcemap: false,
    // Reduce chunk size warning threshold
    chunkSizeWarningLimit: 600,
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/firestore', 'firebase/auth']
  }
})
