import { defineConfig } from 'vite';

// VirtuaBooth deploys to the GitHub Pages user-site root (https://ophiocus.github.io),
// so the base path is '/'. JSDoc output is written into dist/docs after the Vite build
// (see the "build" script in package.json) and ships at /docs.
export default defineConfig(({ command }) => ({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    // three.js core is inherently ~600KB; splitting it into a stable vendor chunk
    // (below) is the right move, so lift the warning ceiling to match reality.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Isolate node_modules (three, tween) into a single vendor chunk. It only
        // changes when those deps change, so returning visitors keep it cached
        // across deploys while the app chunk is re-fetched.
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
  // Keep console/debugger output while developing; strip it from production bundles.
  esbuild: {
    drop: command === 'build' ? ['console', 'debugger'] : [],
  },
}));
