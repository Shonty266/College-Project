import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'src', // Output directory for the build files
  },
  base: '/', // Adjust if needed (e.g., for subdirectory hosting)
});
