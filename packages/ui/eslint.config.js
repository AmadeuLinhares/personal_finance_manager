import { createConfig } from '@pfm/eslint-config';

export default createConfig({
  tsconfigRootDir: import.meta.dirname,
  reactRefresh: false,
  ignores: ['styles.css', '.storybook/preview.css', 'storybook-static'],
  noHexColorsAllow: ['src/stories/**'],
});
