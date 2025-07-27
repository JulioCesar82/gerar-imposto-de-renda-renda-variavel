import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@adapters': path.resolve(__dirname, './src/adapters'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@ports': path.resolve(__dirname, './src/ports'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
})
