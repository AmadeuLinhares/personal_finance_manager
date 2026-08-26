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

const HEX_COLOR = '#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])';

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

    {
      files: SCRIPT_FILES,
      extends: [js.configs.recommended],
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: envGlobals,
      },
    },

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
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-misused-promises': [
          'error',
          { checksVoidReturn: { attributes: false } },
        ],
      },
    },

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
              'react/prop-types': 'off',
            },
          },
        ]
      : []),

    ...(withReactRefresh ? [{ files: SCRIPT_FILES, extends: [reactRefresh.configs.vite] }] : []),

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

    {
      files: ['**/*.json'],
      plugins: { json },
      language: 'json/json',
      extends: ['json/recommended'],
    },
    {
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
        'css/no-invalid-properties': 'off',
      },
    },

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
