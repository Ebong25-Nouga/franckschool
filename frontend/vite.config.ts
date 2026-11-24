import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Mode « demo » : tout est intégré dans un seul fichier (polices comprises)
  build:
    mode === 'demo'
      ? { outDir: 'dist-demo', assetsInlineLimit: 100_000_000, cssCodeSplit: false, modulePreload: false }
      : undefined,
}));
