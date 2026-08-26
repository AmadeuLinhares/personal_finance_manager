import base from '@pfm/eslint-config/prettier';

export default {
  ...base,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './styles.css',
};
