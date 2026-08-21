import { createConfig } from '@pfm/eslint-config';

export default createConfig({
  tsconfigRootDir: import.meta.dirname,
  react: false,
  reactRefresh: false,
  env: 'node',
  // @eslint/css cannot parse Tailwind v4's @theme block or its `--color-*`
  // wildcard, and there is no hand-written CSS here to check anyway.
  ignores: ['theme.css'],
  // This package IS the place hex colors are allowed to exist.
  noHexColorsAllow: ['index.ts'],
});
