import { createConfig } from '@pfm/eslint-config';

export default createConfig({
  tsconfigRootDir: import.meta.dirname,
  react: false,
  reactRefresh: false,
  // Consumed by the Express API as much as by the browser client.
  env: 'node',
});
