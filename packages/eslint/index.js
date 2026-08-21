import css from '@eslint/css';
import js from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// The trailing lookahead rejects any word character, not just a hex digit, so an
// anchor like href="#accounts" is not read as the color #acc. The upstream
// version excluded only hex digits, and flagged it.
const HEX_COLOR = '#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])';

// A plain string is only a color if the whole value is one. Matching a substring
// flags prose that merely contains hex-looking digits — 'Freelance invoice #218',
// an issue reference, a fragment. Template chunks keep the loose match, since
// those really are built up out of style fragments.
const HEX_COLOR_LITERAL = `^${HEX_COLOR}$`;

const HEX_COLOR_MESSAGE =
  'Inline hexadecimal colors are not allowed. Use theme tokens (e.g. text-brand-500, bg-brand-50) instead.';

const noHexColorRules = {
  'no-restricted-syntax': [
    'error',
    {
      selector: `Literal[value=/${HEX_COLOR_LITERAL}/]`,
      message: HEX_COLOR_MESSAGE,
    },
    {
      selector: `TemplateElement[value.raw=/${HEX_COLOR}/]`,
      message: HEX_COLOR_MESSAGE,
    },
  ],
};

const SCRIPT_FILES = ['**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts}'];
const TS_FILES = ['**/*.{ts,tsx,mts,cts}'];

const DEFAULT_IGNORES = ['dist/**', 'build/**', 'coverage/**', 'node_modules/**', 'pnpm-lock.yaml'];

/**
 * Builds the shared flat config.
 *
 * `tsconfigRootDir` must come from the consuming package, not from here — type-aware
 * rules resolve tsconfigs relative to it, and this file lives in node_modules.
 *
 * @param {object} [options]
 * @param {string} options.tsconfigRootDir  Pass `import.meta.dirname`. Required for type-aware rules.
 * @param {string[]} [options.ignores]      Extra global ignore globs, added to the defaults.
 * @param {boolean} [options.typeChecked]   Type-aware TS rules. Default true; needs `tsconfigRootDir`.
 * @param {boolean} [options.react]         React + hooks rules. Default true.
 * @param {boolean} [options.reactRefresh]  react-refresh rules for Vite HMR. Default true.
 * @param {boolean} [options.noHexColors]   Ban inline hex colors in JS/TS. Default true.
 * @param {string[]} [options.noHexColorsAllow]  File globs exempt from the hex-color ban.
 * @param {boolean} [options.prettier]      Run Prettier as an ESLint rule. Default true.
 * @param {string} [options.reactVersion]   React version for eslint-plugin-react. Default '19.0'.
 * @param {'browser'|'node'|'both'} [options.env]  Which globals to declare. Default 'browser'.
 */
export function createConfig(options = {}) {
  const {
    tsconfigRootDir,
    ignores = [],
    typeChecked = true,
    react: withReact = true,
    reactRefresh: withReactRefresh = true,
    noHexColors = true,
    noHexColorsAllow = [],
    prettier: withPrettier = true,
    // Not 'detect': eslint-plugin-react's version sniffing calls an API that
    // ESLint 10 removed, and crashes the whole run.
    reactVersion = '19.0',
    env = 'browser',
  } = options;

  if (typeChecked && !tsconfigRootDir) {
    throw new Error(
      '@pfm/eslint-config: type-aware linting needs `tsconfigRootDir`. ' +
        'Pass `createConfig({ tsconfigRootDir: import.meta.dirname })`, ' +
        'or opt out with `{ typeChecked: false }`.',
    );
  }

  const envGlobals = {
    ...(env === 'browser' || env === 'both' ? globals.browser : {}),
    ...(env === 'node' || env === 'both' ? globals.node : {}),
  };

  return defineConfig([
    globalIgnores([...DEFAULT_IGNORES, ...ignores]),

    // Baseline for everything that is a script.
    {
      files: SCRIPT_FILES,
      extends: [js.configs.recommended],
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: envGlobals,
      },
    },

    // TypeScript. Type-aware when `tsconfigRootDir` is given, syntactic otherwise.
    {
      files: TS_FILES,
      extends: typeChecked
        ? [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked]
        : [...tseslint.configs.strict, ...tseslint.configs.stylistic],
      ...(typeChecked
        ? {
            languageOptions: {
              parserOptions: {
                projectService: true,
                tsconfigRootDir,
              },
            },
          }
        : {}),
      rules: {
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
        ],
        // unused-imports/no-unused-vars owns this below.
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-misused-promises': [
          'error',
          { checksVoidReturn: { attributes: false } },
        ],
      },
    },

    // React. Replaces eslint-config-next's core-web-vitals + typescript layers,
    // which cannot be used outside a Next app.
    ...(withReact
      ? [
          {
            files: SCRIPT_FILES,
            extends: [
              react.configs.flat.recommended,
              react.configs.flat['jsx-runtime'],
              reactHooks.configs.flat.recommended,
            ],
            settings: { react: { version: reactVersion } },
            rules: {
              // TS already checks props; propTypes are noise in a typed codebase.
              'react/prop-types': 'off',
            },
          },
        ]
      : []),

    ...(withReactRefresh ? [{ files: SCRIPT_FILES, extends: [reactRefresh.configs.vite] }] : []),

    // Imports and unused code.
    {
      files: SCRIPT_FILES,
      plugins: {
        'unused-imports': unusedImports,
        'import-x': importX,
      },
      settings: {
        'import-x/resolver-next': [createTypeScriptImportResolver({ alwaysTryTypes: true })],
      },
      rules: {
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],
        'import-x/order': [
          'error',
          {
            // Two blocks separated by a blank line:
            //   1) external libs (builtin + node_modules)
            //   2) project code (resolved via @/ or relative paths)
            // Type imports follow their source's natural block.
            groups: [
              ['builtin', 'external'],
              ['internal', 'parent', 'sibling', 'index', 'object'],
            ],
            pathGroups: [{ pattern: '@/**', group: 'internal' }],
            pathGroupsExcludedImportTypes: [],
            'newlines-between': 'always',
            alphabetize: { order: 'asc', caseInsensitive: true },
          },
        ],
        'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
        'import-x/no-cycle': 'error',
        'import-x/no-self-import': 'error',
      },
    },

    ...(noHexColors
      ? [
          { files: SCRIPT_FILES, rules: noHexColorRules },
          ...(noHexColorsAllow.length
            ? [
                {
                  files: noHexColorsAllow,
                  rules: { 'no-restricted-syntax': 'off' },
                },
              ]
            : []),
        ]
      : []),

    // Data and docs languages.
    {
      files: ['**/*.json'],
      plugins: { json },
      language: 'json/json',
      extends: ['json/recommended'],
    },
    {
      // tsconfig files are JSON with comments, whatever their extension says.
      files: ['**/*.jsonc', '.vscode/*.json', '**/tsconfig*.json'],
      plugins: { json },
      language: 'json/jsonc',
      extends: ['json/recommended'],
    },
    {
      files: ['**/*.json5'],
      plugins: { json },
      language: 'json/json5',
      extends: ['json/recommended'],
    },
    {
      files: ['**/*.md'],
      plugins: { markdown },
      language: 'markdown/gfm',
      extends: ['markdown/recommended'],
    },
    {
      files: ['**/*.css'],
      plugins: { css },
      language: 'css/css',
      extends: ['css/recommended'],
      rules: {
        'css/use-baseline': 'off',
        'css/no-invalid-at-rules': 'off',
        // Custom properties declared in another file read as undefined here.
        'css/no-invalid-properties': 'off',
      },
    },

    // Prettier last, so formatting rules win.
    ...(withPrettier
      ? [
          prettierConfig,
          {
            files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts,css,json,jsonc,json5}'],
            plugins: { prettier: prettierPlugin },
            rules: {
              'prettier/prettier': 'error',
            },
          },
        ]
      : []),
  ]);
}

export default createConfig;
