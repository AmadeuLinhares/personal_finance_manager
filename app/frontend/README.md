# @pfm/frontend

The client. Vite + React 19 + TypeScript, TanStack Query for server state,
react-hook-form for the dialogs, `@pfm/ui` for everything visible.

The decisions — what is built, what is left out, where derived values live, what
each mutation invalidates — are in the [root README](../../README.md). This file
is the map of the folder.

```text
src/
  app/        the shell: header, footer, screen registry, query provider
  screens/    one file per screen; state that is the user's lives here
  dialogs/    the three forms
  http/       everything the API owns
    queries/    one hook per GET, filters typed, filters inside the query key
    mutations/  one hook per write, each with its own invalidation set
    fetch/      the single wrapper; returns a union, never throws
    routes.ts   every URL, in one place
    api-types.ts  copied from docs/api-types.d.ts — the server wins on conflict
  utils/      query-string building, API error → form error
  mock/       fixtures for the two screens that are still layout only
test/         screen tests; the seam is fetch, not the query hooks
```

```bash
pnpm dev          # this package alone, on :5173, proxying /api to :4000
pnpm test         # vitest + testing-library over happy-dom
pnpm type-check   # tsc -b --noEmit
pnpm lint         # eslint, type-aware
pnpm knip         # unused files, exports and dependencies
```

`VITE_API_URL` overrides the dev proxy for a build pointed at a real host.
