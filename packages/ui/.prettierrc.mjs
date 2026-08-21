import base from '@pfm/eslint-config/prettier';

// tailwindStylesheet points the sorter at our theme, so custom utilities like
// text-ui and bg-accent-300 sort into the right place instead of trailing.
export default {
  ...base,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './styles.css',
};
