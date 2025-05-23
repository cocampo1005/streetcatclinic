import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@react-pdf/renderer"], // Ensure Vite pre-bundles this dependency
  },
  resolve: {
    alias: {
      "@": "/src", // Alias for the src folder
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: "", // Optional: For global SCSS variables or mixins
      },
    },
    postcss: "./postcss.config.js",
  },
});
