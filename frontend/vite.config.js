import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build trafia do /frontend_dist (w root projektu)
// a assets będą linkowane jako /static/...
export default defineConfig({
  plugins: [react()],
  base: "/static/",
  build: {
    outDir: "../frontend_dist",
    emptyOutDir: true,
    assetsDir: "assets",
  },
});
