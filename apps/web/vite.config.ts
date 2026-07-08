import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: [
      "cluegrid.games",
      ".cluegrid.games",
      "blot-enjoyment-serve.ngrok-free.dev",
      ".ngrok-free.dev",
      "localhost",
      "127.0.0.1"
    ],
    proxy: {
      "/health": "http://localhost:3001",
      "/api": "http://localhost:3001",
      "/socket.io": {
        target: "http://localhost:3001",
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Group heavy node modules separately
            if (id.includes("firebase")) {
              return "firebase-vendor";
            }
            if (id.includes("socket.io")) {
              return "socket-vendor";
            }
            if (id.includes("react")) {
              return "react-vendor";
            }
            return "vendor";
          }
        }
      }
    }
  }
});

