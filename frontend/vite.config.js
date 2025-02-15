import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Ensures correct path handling
  build: {
    outDir: "dist", // Ensures files are outputted correctly
    emptyOutDir: true, // Clears old files before building
  },
  server: {
    port: 5173, // Ensures local dev runs on port 5173
    open: true, // Opens browser automatically
  },
  resolve: {
    alias: {
      "@": "/src", // Allows cleaner imports
    },
  },
});
