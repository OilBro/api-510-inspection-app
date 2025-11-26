import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "./client",
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  define: {
    "process.env.VITE_APP_TITLE": JSON.stringify(
      process.env.VITE_APP_TITLE || "API 510 Inspection App"
    ),
    "process.env.VITE_APP_LOGO": JSON.stringify(
      process.env.VITE_APP_LOGO || "/logo.png"
    ),
    "process.env.VITE_ANALYTICS_ENDPOINT": JSON.stringify(
      process.env.VITE_ANALYTICS_ENDPOINT || ""
    ),
    "process.env.VITE_ANALYTICS_WEBSITE_ID": JSON.stringify(
      process.env.VITE_ANALYTICS_WEBSITE_ID || ""
    ),
  },
});
