import { defineConfig } from 'vite';

// VirtuaBooth deploys to the GitHub Pages user-site root (https://ophiocus.github.io),
// so the base path is '/'. JSDoc output is written into dist/docs after the Vite build
// (see the "build" script in package.json) and ships at /docs.
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
  },
});
