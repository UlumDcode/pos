import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",

  plugins: [react(), tailwindcss()],

  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,

    proxy: {
      "/api": {
        target: "http://127.0.0.1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api-kasir"),
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 2000,
    // Tambahkan ini biar folder assets gampang dicari
    outDir: "dist",
    assetsDir: "assets",
  },
});
