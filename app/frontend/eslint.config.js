import { createConfig } from '@pfm/eslint-config';

export default createConfig({
  tsconfigRootDir: import.meta.dirname,
  ignores: ['src/index.css'],
  noHexColorsAllow: ['test/**'],
});
