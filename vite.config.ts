import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
      '/temporal-api': {
        target: process.env.VITE_TEMPORAL_UI_URL || 'http://localhost:8233',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/temporal-api/, '/api'),
      },
      '/ws': {
        target: (process.env.VITE_BACKEND_URL || 'http://localhost:8000').replace('http', 'ws'),
        ws: true,
      },
    },
  },
});
