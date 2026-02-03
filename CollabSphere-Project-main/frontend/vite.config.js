import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // Bắt buộc phải có dòng này khi chạy trên Windows/Docker
    },
    host: true, // Cho phép Docker truy cập
    strictPort: true,
    port: 5173, 
  }
})