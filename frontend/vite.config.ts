import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  // Mode « demo » : tout est intégré dans un seul fichier (polices comprises)
  build:
    mode === 'demo'
      ? { outDir: 'dist-demo', assetsInlineLimit: 100_000_000, cssCodeSplit: false, modulePreload: false }
      : undefined,
}));
