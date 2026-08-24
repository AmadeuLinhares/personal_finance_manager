import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * The app's own config, minus the parts a test has no use for: no Tailwind (the
 * assertions are on roles and text, never on classes) and no React Compiler (it
 * is a build-time optimisation, and running it here would test the compiler).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    // The screens are tested through the DOM they actually render.
    environment: 'happy-dom',
    include: ['test/**/*.test.tsx'],
    setupFiles: ['./test/setup.ts'],
  },
});
