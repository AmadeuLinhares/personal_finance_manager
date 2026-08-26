import { createConfig } from '@pfm/eslint-config';

export default createConfig({
  tsconfigRootDir: import.meta.dirname,
  react: false,
  reactRefresh: false,
  env: 'node',
  ignores: ['theme.css'],
  noHexColorsAllow: ['index.ts'],
});
