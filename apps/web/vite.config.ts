import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: ["blot-enjoyment-serve.ngrok-free.dev", ".ngrok-free.dev", "localhost", "127.0.0.1"],
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
});
