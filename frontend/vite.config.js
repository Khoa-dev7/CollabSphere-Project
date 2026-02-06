import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "admin-ui": "/src/modules/admin-ui",
      "aichat-ui": "/src/modules/aichat-ui",
      "animation": "/src/modules/animation",
      "auth-ui": "/src/modules/auth-ui",
      "component-ui": "/src/modules/component-ui",
      "cosre-ui": "/src/modules/cosre-ui",
      "danhsachlop-ui": "/src/modules/danhsachlop-ui",
      "error-ui": "/src/modules/error-ui",
      "filemanager-ui": "/src/modules/filemanager-ui",
      "gvtaoproject-ui": "/src/modules/gvtaoproject-ui",
      "kanban-ui": "/src/modules/kanban-ui",
      "kanbanboard-ui": "/src/modules/kanbanboard-ui",
      "login-ui": "/src/modules/login-ui",
      "manage-ui": "/src/modules/manage-ui",
      "peerreview-ui": "/src/modules/peerreview-ui",
      "projectsetting-ui": "/src/modules/projectsetting-ui",
      "resource-ui": "/src/modules/resource-ui",
      "resultview-ui": "/src/modules/resultview-ui",
      "rubrictable-ui": "/src/modules/rubrictable-ui",
      "sidebar-ui": "/src/modules/sidebar-ui",
      "taskdetailmodal-ui": "/src/modules/taskdetailmodal-ui",
      "videocall-ui": "/src/modules/videocall-ui",
      "workspace-ui": "/src/modules/workspace-ui",
    },
  },
  server: {
    watch: {
      usePolling: true, // Bắt buộc phải có dòng này khi chạy trên Windows/Docker
    },
    host: true, // Cho phép Docker truy cập
    strictPort: false,
    port: 5173,
  }
})