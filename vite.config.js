import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild'
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': 'http://127.0.0.1:8787'
    }
  }
});
