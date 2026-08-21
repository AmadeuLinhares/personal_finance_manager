import { createConfig } from '@pfm/eslint-config';

export default createConfig({
  tsconfigRootDir: import.meta.dirname,
  // `@import 'tailwindcss'` is not resolvable by the CSS language plugin.
  ignores: ['src/index.css'],
});
