import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // served from the domain root; all asset paths in src/data are absolute
  base: '/',
  build: { outDir: 'dist', assetsInlineLimit: 0 }
});
