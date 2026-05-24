import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

// Flat ESLint config (ESLint 9). The app is vanilla ES-module browser code that
// bundles via Vite. Cross-module singletons are attached to `window` (see
// docs/ARCHITECTURE.md) and consumed without imports in a couple of places, so
// they're declared as globals here until that coupling is refactored away.
export default [
  js.configs.recommended,
  prettier,
  {
    ignores: ['dist/**', 'node_modules/**', 'js/src/LoaderOverlay.ts'],
  },
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        // Window-attached singletons (handlers.js / context.js / project.js).
        Handlers: 'readonly',
        Context: 'readonly',
        Project: 'readonly',
        gltf_context: 'writable',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-prototype-builtins': 'warn',
      'no-console': 'off',
      'prefer-const': 'warn',
      eqeqeq: 'warn',
    },
  },
  {
    files: ['*.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
];
