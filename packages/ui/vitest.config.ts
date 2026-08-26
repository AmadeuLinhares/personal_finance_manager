import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/stories/**', 'src/index.ts'],
      reporter: ['text', 'html'],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
