import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // This makes sure it looks in the root
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html', // Tell Vite to use root-level index.html
    },
  },
});
