// lint-staged runs every task from the git root and matches globs against
// root-relative paths, even for configs nested in a workspace. So the globs are
// prefixed here, and each command is routed to the package that owns the binary.
const frontend = 'pnpm --filter @pfm/frontend exec';

export default {
  'app/frontend/**/*.{ts,tsx,js,jsx}': [`${frontend} eslint --fix`, `${frontend} prettier --write`],
  'app/frontend/**/*.{css,json,md}': [`${frontend} prettier --write`],
  'packages/eslint/**/*.{js,mjs,json,md}': [`${frontend} prettier --write`],
};
