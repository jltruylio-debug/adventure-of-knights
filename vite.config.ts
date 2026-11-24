
import { defineConfig } from 'vite';

export default defineConfig({
  // Caminho correto para publicação no GitHub Pages.
  // O nome precisa corresponder ao repositório.
  base: '/adventure-of-knights/',

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2022'
  },

  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
