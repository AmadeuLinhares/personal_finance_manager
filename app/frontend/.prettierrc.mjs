import base from '@pfm/eslint-config/prettier';

// Tailwind class sorting only makes sense where Tailwind is installed, which is
// why the plugin is added here instead of in the shared config.
export default {
  ...base,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/index.css',
};
