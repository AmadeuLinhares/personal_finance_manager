# @pfm/eslint-config

Shared ESLint + Prettier config for the monorepo. Ported from
`ipiercing-front/eslint.config.mjs`, adapted to run as an installed package instead of a
file at the root of one app.

## Usage

```jsonc
// package.json
{
  "devDependencies": {
    "@pfm/eslint-config": "workspace:*",
    "eslint": "^10.8.0",
    "prettier": "^3.9.6",
  },
}
```

```js
// eslint.config.js
import { createConfig } from '@pfm/eslint-config';

export default createConfig({
  tsconfigRootDir: import.meta.dirname,
});
```

```js
// .prettierrc.mjs
export { default } from '@pfm/eslint-config/prettier';
```

`tsconfigRootDir` has to be passed by the consumer. Type-aware rules resolve tsconfigs
relative to it, and this package lives in `node_modules` — it cannot use its own
`import.meta.dirname`. Passing nothing throws instead of silently disabling type checking.

Type-aware linting also needs `"strict": true` in the consuming package's tsconfig.
Without `strictNullChecks`, a large part of `strictTypeChecked` is inert.

## Options

| Option             | Default     | Effect                                                                                             |
| ------------------ | ----------- | -------------------------------------------------------------------------------------------------- |
| `tsconfigRootDir`  | —           | Required unless `typeChecked: false`. Pass `import.meta.dirname`.                                  |
| `ignores`          | `[]`        | Extra global ignore globs, added to `dist`, `build`, `coverage`, `node_modules`, `pnpm-lock.yaml`. |
| `typeChecked`      | `true`      | `strictTypeChecked` + `stylisticTypeChecked`. `false` falls back to the non-type-aware presets.    |
| `react`            | `true`      | eslint-plugin-react recommended + jsx-runtime, plus react-hooks.                                   |
| `reactVersion`     | `'19.0'`    | Version reported to eslint-plugin-react.                                                           |
| `reactRefresh`     | `true`      | react-refresh rules for Vite HMR boundaries.                                                       |
| `noHexColors`      | `true`      | Bans inline hex colors in JS/TS.                                                                   |
| `noHexColorsAllow` | `[]`        | File globs exempt from the hex ban — theme sources, brand gradients, QR codes.                     |
| `prettier`         | `true`      | Runs Prettier as the `prettier/prettier` rule.                                                     |
| `env`              | `'browser'` | `'browser'`, `'node'`, or `'both'`.                                                                |

## What carried over unchanged

- `typescript-eslint` `strictTypeChecked` + `stylisticTypeChecked`, with `projectService`
- `consistent-type-imports` with inline type imports
- `no-misused-promises` with `checksVoidReturn.attributes: false`
- `unused-imports` — errors on unused imports, warns on unused vars, `^_` escapes
- import ordering: two blocks (external, then project code), `@/**` counted as internal,
  blank line between blocks, alphabetised case-insensitively
- `no-duplicates` with `prefer-inline`, `no-cycle`, `no-self-import`
- the inline-hex-color ban, both `Literal` and `TemplateElement` selectors
- JSON / JSONC / JSON5 / Markdown-GFM / CSS language blocks
- `eslint-config-prettier` last, then `prettier/prettier: error`
- every Prettier setting: single quotes, semicolons, trailing commas, width 100, JSX single quotes

## What had to change, and why

| ipiercing-front                                                                      | here                                                                              | reason                                                                                                                  |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `eslint-config-next/core-web-vitals` + `/typescript`                                 | `eslint-plugin-react` recommended + `jsx-runtime`, `react-hooks`, `react-refresh` | `eslint-config-next` only loads inside a Next app; this monorepo is Vite.                                               |
| `eslint-plugin-import` (`import/*`)                                                  | `eslint-plugin-import-x` (`import-x/*`)                                           | `eslint-plugin-import@2.32` declares no ESLint 10 support. `import-x` is the maintained fork, same rules, same options. |
| `settings.react.version: 'detect'`                                                   | pinned via `reactVersion`                                                         | eslint-plugin-react's version sniffing calls an API ESLint 10 removed; `detect` crashes the run.                        |
| hex-ban exceptions hardcoded to `lib/themes.ts`, `CreditCardPreview`, `PixQRDisplay` | `noHexColorsAllow` option                                                         | Those paths do not exist here.                                                                                          |
| `prettier-plugin-tailwindcss` in the Prettier config                                 | omitted                                                                           | It needs a resolvable `tailwindcss`; there is none yet. Add it per-package when Tailwind lands.                         |
| `@eslint/json` v1                                                                    | v2                                                                                | v1 predates ESLint 10.                                                                                                  |
| —                                                                                    | `css/no-invalid-properties: off`                                                  | Custom properties declared in another file read as undefined, so every `var(--x)` across files was a false positive.    |
| —                                                                                    | `tsconfig*.json` parsed as JSONC                                                  | tsconfigs carry comments and failed the strict-JSON parser.                                                             |

## Not ported

`husky`, `lint-staged`, `commitlint` and `knip` are repo-level tooling in ipiercing-front,
not part of the lint config. Say the word and they go in as a separate setup.
