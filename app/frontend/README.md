# @pfm/frontend

The client. Vite + React 19 + TypeScript, TanStack Query for server state,
react-hook-form for the dialogs, `@pfm/ui` for everything visible.

The decisions — what is built, what is left out, where derived values live, what
each mutation invalidates — are in the [root README](../../README.md). This file
is the map of the folder.

Organised by feature. The rule that decides where a file goes is ownership: if
one screen asks for it, it lives in that screen's folder; if more than one does,
it moves up. Nothing is shared speculatively.

```text
src/
  App.tsx       the shell: which screen, the header's "balance as of", the dialogs
  components/   shared components only — AppHeader, AppFooter, BalanceScope
  constants/    the screen registry
  features/     one folder per screen, plus everything only that screen uses
    overview/     four panels over the other three screens' queries; owns no data
    transactions/
    reports/
    planning/
      components/   the screen's presentational pieces, and its dialog
      hooks/        the state that is the user's
      http/         requests only this feature asks for
      utils/        its pure logic
      *.test.tsx    next to what it tests
  http/         what more than one feature reads
    fetch/        the single wrapper; returns a union, never throws
    queries/      one hook per GET, filters typed and inside the query key
  providers/    the QueryClient and its defaults
  utils/        calendar windows, the projection seam, query strings, form errors
test/           harness, fixtures, setup — shared infrastructure, via @test/*
```

The wire types, the routes and every closed set of values the API validates
against are not here at all: they are in [`@pfm/contracts`](../../packages/contracts),
which the API imports too.

```bash
pnpm dev          # this package alone, on :5173, proxying /api to :4000
pnpm test         # vitest + testing-library over happy-dom
pnpm type-check   # tsc -b --noEmit
pnpm lint         # eslint, type-aware
pnpm knip         # unused files, exports and dependencies
```

`VITE_API_URL` overrides the dev proxy for a build pointed at a real host.
