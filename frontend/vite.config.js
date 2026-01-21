import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "admin-ui": path.resolve(__dirname, "modules/admin-ui/src"),
      "cosre-ui": path.resolve(__dirname, "modules/core-ui/src"),
      "error-ui": path.resolve(__dirname, "modules/error-ui/src"),
      "resource-ui": path.resolve(__dirname, "modules/resource-ui/src"),
      "videocall-ui": path.resolve(__dirname, "modules/videocall-ui/src"),
      "resultview-ui": path.resolve(__dirname, "modules/resultview-ui/src"),
    },
  },
});
