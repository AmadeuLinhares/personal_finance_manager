import { createConfig } from '@pfm/eslint-config';

export default createConfig({
  tsconfigRootDir: import.meta.dirname,
  // `@import 'tailwindcss'` is not resolvable by the CSS language plugin.
  ignores: ['src/index.css'],
  // Fixtures echo the API's own `color` field, which is a hex string on the
  // wire. Nothing here reaches a stylesheet.
  noHexColorsAllow: ['test/**'],
});
