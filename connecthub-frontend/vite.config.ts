import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], server: {
    host: true, // 允許外部訪問
  },
  preview: {
    allowedHosts: ['your-domain.com'],
  },
})
