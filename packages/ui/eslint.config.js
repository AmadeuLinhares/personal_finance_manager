import { createConfig } from '@pfm/eslint-config';

export default createConfig({
  tsconfigRootDir: import.meta.dirname,
  // This is a library, not a Vite app — HMR boundary rules do not apply.
  reactRefresh: false,
  // Tailwind directives (@import of a package, @source) are not parseable CSS.
  ignores: ['styles.css', '.storybook/preview.css', 'storybook-static'],
  // Stories exist to demonstrate the palette, so they may name ramp steps.
  noHexColorsAllow: ['src/stories/**'],
});
