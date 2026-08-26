import base from '@pfm/eslint-config/prettier';

export default {
  ...base,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/index.css',
};
