/**
 * Shared Prettier config, matching ipiercing-front.
 *
 * The Tailwind class-sorting plugin is NOT included here: prettier-plugin-tailwindcss
 * needs a resolvable tailwindcss install, and would throw in packages that have none.
 * Add it per-package once Tailwind is in play:
 *
 *   import base from '@pfm/eslint-config/prettier';
 *   export default { ...base, plugins: ['prettier-plugin-tailwindcss'] };
 *
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: "always",
  endOfLine: "lf",
  bracketSpacing: true,
  bracketSameLine: false,
  jsxSingleQuote: true,
};

export default config;
