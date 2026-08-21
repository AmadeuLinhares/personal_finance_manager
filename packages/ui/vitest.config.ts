import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // A DOM is needed to prove the react-hook-form wiring, not just the parsing.
    environment: 'happy-dom',
    include: ['test/**/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
  },
});
