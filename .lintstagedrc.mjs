// lint-staged runs every task from the git root and matches globs against
// root-relative paths, even for configs nested in a workspace. So the globs are
// prefixed here, and each command is routed to the package that owns the binary.
const frontend = 'pnpm --filter @pfm/frontend exec';
const ui = 'pnpm --filter @pfm/ui exec';
const tokens = 'pnpm --filter @pfm/tokens exec';
const contracts = 'pnpm --filter @pfm/contracts exec';

export default {
  'app/frontend/**/*.{ts,tsx,js,jsx}': [`${frontend} eslint --fix`, `${frontend} prettier --write`],
  'app/frontend/**/*.{css,json,md}': [`${frontend} prettier --write`],
  'packages/ui/**/*.{ts,tsx,js}': [`${ui} eslint --fix`, `${ui} prettier --write`],
  'packages/ui/**/*.{css,json,md}': [`${ui} prettier --write`],
  'packages/tokens/**/*.{ts,js}': [`${tokens} eslint --fix`, `${tokens} prettier --write`],
  'packages/tokens/**/*.{css,json,md}': [`${tokens} prettier --write`],
  'packages/contracts/**/*.{ts,js}': [`${contracts} eslint --fix`, `${contracts} prettier --write`],
  'packages/contracts/**/*.{json,md}': [`${contracts} prettier --write`],
  'packages/eslint/**/*.{js,mjs,json,md}': [`${frontend} prettier --write`],
};
