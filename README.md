# Folio — a personal finance manager

A React + TypeScript client for the [Personal Finance Manager challenge](docs/CHALLENGE.md),
built on the in-memory API that ships with this repo.

Four of the five user stories, in three screens and an overview that composes
them, on a design system built here rather than adopted. The reasoning for every
one of those choices is below.

---

## Running it

Requires **Node 22.22+** and **pnpm 11**.

```bash
pnpm install
pnpm dev
```

- **Client** — <http://localhost:5173>
- **API** — <http://localhost:4000/api> (that URL lists every endpoint)

`pnpm dev` starts both apps. The client's dev server proxies `/api` to the
backend, so nothing is same-origin by accident and no CORS is involved, and one
`Ctrl-C` stops both. To run them apart — or to check a production build against
the real API — the proxy is shared between `server` and `preview`:

```bash
pnpm dev:api      # the API alone, on :4000
pnpm dev:web      # the client alone, on :5173
pnpm build        # type-check, then a production build
pnpm --filter @pfm/frontend preview   # serve that build on :4173, still proxying /api
```

|                                               |                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm test`                                   | 208 tests with coverage gates — 52 API, 86 design system, 70 client |
| `pnpm lint` · `pnpm type-check` · `pnpm knip` | lint, types, dead code                                              |
| `pnpm storybook`                              | the design system in isolation                                      |
| `pnpm reset`                                  | reseed the API (`scale: 10` gives ~6,600 transactions)              |
| `pnpm lighthouse`                             | build, serve and audit the real app in Chrome                       |

**To see the loading and error states**, make the API misbehave — per request
with `?__latency=2000` or `?__error=500`, or globally:

```bash
curl -X POST localhost:4000/api/dev/settings -H 'content-type: application/json' \
  -d '{"latencyMs": 800, "errorRate": 0.2}'
```

---

## What I built

The brief says five screens rushed are worth less than three done properly, and
that the user stories are a menu rather than a checklist. I took it literally:
three screens carry the four user stories I chose, and the fourth is a
composition of those three rather than a fifth thing to build.

| Screen           | User story | What it does                                                                                                                  |
| ---------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Overview**     | —          | A preview of each of the three below, read against the header's date. It owns no data: every request on it is one of theirs   |
| **Transactions** | 1          | Paged ledger; filters for account, status, direction, full date range and search, all as query params; running balance column |
| **Reports**      | 3          | Expenses by category for a month, against budget, with a leaf/rolled-up toggle and the excluded rows named                    |
| **Planning**     | 4          | Upcoming bills and income with post/skip/undo per date, a free date window driving both panels, and the actual/forecast seam  |
| _the header_     | 2          | "Balance as of" any date, on every screen                                                                                     |
| _the URL_        | —          | `?screen=` holds which screen you are on, so a refresh comes back to it and the back button works                             |

User story 2 has no screen of its own on purpose. A balance is not a
destination — it is the number every other screen is read against, so it lives
in the header, where changing the date changes the frame around whatever you are
already looking at. The Overview is the clearest case of that: the date in the
header is the date its account cards are computed on, because both ask for it
with the same filters and therefore share one request rather than showing two
dates' numbers on one page.

**The Overview is a composition, not a fifth source of truth.** Each of its four
panels asks exactly the question the screen it previews asks — same filters, same
query key — so opening that screen from here is a cache hit rather than a round
trip. It is also why three query hooks live in `src/http/queries/` and not in a
feature: an overview is by definition a second reader of every other screen's
data. Each panel carries its own loading, error and empty state, because four
requests are four things that can fail and a screen that blanks because one of
them did is worse than no screen.

Creating things works too: a transaction, a transfer, and a scheduled item, each
with the API's validation errors landing under the field that caused them.

### What I deliberately left out

|                                      | Why                                                                                                                                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User story 5 — Projects**          | Another aggregate over the same ledger, and `GET /projects` already embeds the summary, so "implementing" it would be mostly rendering. High screen cost, low argument.                |
| **The Projects layout**              | It existed, unwired, over fixtures. I deleted it rather than ship it behind a "not implemented" banner: four screens that all work read better than five where one is a promise.       |
| **CRUD for accounts and categories** | Repeats the form the transaction dialog already demonstrates. The interesting case is `DELETE /categories/:id` with `reassignTo` vs `force`, and that is a conversation, not a screen. |
| **A router**                         | The screen lives in `?screen=`, which survives a refresh and gives back a history entry. A router earns its dependency when filters go in the URL too, not before.                     |
| **Auth**                             | The brief says to skip it.                                                                                                                                                             |

---

## Architecture

### The shape of the repo

A pnpm workspace. Two apps, four packages:

|                      |                                                                                   |
| -------------------- | --------------------------------------------------------------------------------- |
| `app/frontend`       | the client — Vite, React 19, TanStack Query, react-hook-form                      |
| `app/backend`        | the starter's in-memory Express API. Not mine, and not evaluated                  |
| `packages/ui`        | `@pfm/ui` — 36 primitives on Tailwind v4, with Storybook                          |
| `packages/tokens`    | `@pfm/tokens` — colour, spacing, type and radii as CSS variables and typed values |
| `packages/contracts` | `@pfm/contracts` — the API's data contract, imported by the client _and_ the API  |
| `packages/eslint`    | the shared eslint and prettier config                                             |

The client is organised by feature, and the rule that decides where a file goes is
ownership: one screen asks for it, it lives in that screen's folder; more than one
does, it moves up. [`app/frontend/README.md`](app/frontend/README.md) is the map of
that folder. The three sections below are why it is shaped that way.

### Server state is not client state, and the split is enforced by where code lives

Everything the API owns goes through TanStack Query: one hook per endpoint,
filters typed, query keys carrying those filters. Which folder that hook lives in
is the rest of the argument. A request only one feature asks for sits in that
feature's own `http/`, next to the components, hooks and pure logic of the screen
that asks for it, and next to that screen's test. `src/http/` keeps what is
genuinely shared: the fetch wrapper, and the five endpoints more than one feature
reads — accounts and categories, plus the monthly report, the occurrences and the
projection, all three of which the Overview reads as well as the screen that owns
them.

What the hook does **not** own is the contract. That lives in
[`@pfm/contracts`](packages/contracts) and both apps import it: the shapes, the
request bodies, the routes, and every closed set of values the API validates
against. See that package's README for where the line falls.

### The contract is declared once, and the API is what proves it

The client used to carry a copy of the contract the API ships, and the API
carried its own copy of the same vocabulary as runtime arrays in
`src/lib/validate.js`. Two declarations of one truth, in two languages, with
nothing to make them disagree out loud.

Now each value set is an array first and a type second:

```ts
export const TRANSACTION_STATUSES = ['posted', 'pending'] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];
```

The API validates with the array — `z.enum(TRANSACTION_STATUSES)`, which is why
its 422 reads _"Expected 'posted' | 'pending'"_ — and the client types with the
union. Adding a status is one edit, and there is no second place to forget.

The API is plain JavaScript and compiles nothing, so this only works because
Node ≥ 22.18 strips types on import. The package ships source for that reason,
like `@pfm/ui`, and its tsconfig sets `erasableSyntaxOnly` so a shape that cannot
survive stripping fails the type-check instead of the server.

Everything the _user_ owns — which month, which currency, which row is
mid-flight — is `useState` in the screen. There is no store in between, because
there is nothing to put in one: after the server state moves out, what is left is
small and local.

**Every filter is a query param.** Nothing is filtered, sorted or paged in the
client. A client-side filter over one page of results is a lie about the other
pages, and the moment the list is bigger than the page it is also wrong.

**Filters live inside the query key.** Going back to last month is a cache hit
rather than a refetch, and `asOf` in the key is what stops a historical balance
from overwriting today's.

### Invalidation is a decision per mutation, not a policy

This is where a finance client gets interesting, because one write moves several
derived numbers and each mutation moves a different set:

| Mutation           | Invalidates                                                   | Why                                                                                                                                         |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Post an occurrence | transactions, accounts, reports, projections, scheduled-items | It writes a real transaction, so the ledger, the balances and the month's category totals all move — and the occurrence leaves the forecast |
| Skip an occurrence | scheduled-items, projections                                  | Nothing is written. The ledger, the balances and the reports cannot have changed                                                            |
| Create a transfer  | transactions, transfers, accounts, projections                | Two legs, two accounts — but reports exclude transfer legs by default, so nothing they show has changed                                     |

Treating these alike would mean either refetching the whole app to dismiss a
bill, or leaving a bill on screen after paying it. Both are visible to the user.

### Derived values live where the data they need lives

- **Running balance — server.** It depends on every prior row in the ledger, and
  the client holds eight of them. It is requested with `withRunningBalance=true`,
  and only when a single account is selected and the sort is by date, because
  those are the conditions under which it means anything. Pending rows come back
  `null`, and the column shows that rather than inventing a total.
- **Category roll-up — client.** The API reports child categories as themselves,
  carrying `parentId`, and leaves the roll-up open on purpose. Both readings are
  true — "Utilities went over budget" and "Housing is fine" can both hold — so it
  is a toggle rather than a decision made for the user.
- **Projection — server.** The seam between actuals and forecast is the whole
  problem, and only the server knows where it falls. The client draws it.

### Errors carry their code

The transport never throws: `fetchData` returns a discriminated union, hooks
decide what a failure means. A `422` with `details[]` gets pinned per field; a
`409` or a dead server has no field to sit under and is shown in full, **with the
code**. `CURRENCY_MISMATCH` and `VALIDATION_ERROR` are both 422s and mean
different things, so the code is the part that makes the message unambiguous.

---

## Handling real-world data

The seed has edge cases planted in it on purpose. These are the ones that shaped
the code:

**Money is an integer number of minor units, everywhere.** No float ever touches
an amount. The conversion happens once, at the input mask, and a value that is
not exactly representable is refused rather than rounded — the same thing the API
does with a 422. `−$45.99` is `-4599`, negative means money left the account, and
`Money` renders a real minus sign because a hyphen does not line up in a column of
figures.

**Two currencies are never summed.** There are no FX rates here, so the report is
per-currency, the header balance says CAD, and the USD account's rows are counted
as excluded rather than quietly dropped.

**Dates are calendar days, not instants.** `2026-08-21` is a day something
happened on. `new Date('2026-08-21')` is UTC midnight, which renders as the 20th
anywhere west of Greenwich, so dates are parsed by splitting the string and
compared as strings — which works, because ISO dates sort lexicographically. The
seed has two transactions straddling a month boundary specifically so this leaks
if you get it wrong.

**A report that drops rows says which.** Transfer legs, other-currency rows and
out-of-scope transactions are counted and named on screen. A total that silently
excludes money is a wrong total presented confidently.

**Two currencies are never summed — and Planning was the screen breaking that
rule.** `GET /scheduled-items/occurrences` returns every account's occurrences
regardless of currency, and its `totals` sum them: on the default seed, the
`income` figure was CAD 69,090.00 plus USD 6,000.00 rendered as one number. The
projection beside it is CAD-only, so a USD occurrence is a row you can act on
whose action can never move the chart. Both halves are fixed in the client:
`toOccurrenceTotals` computes the totals from the rows in the projection's
currency and counts the rest, so the footer reads _"4 occurrences to 30 Nov 2026
· bills −$2,319.80 · income $0.00 · 1 in USD, not summed"_ — the same
count-and-name treatment the monthly report gives its exclusions. And every
`Money` now carries the currency of the record it renders: `formatMoney` fixes
the locale to `en-CA`, so CAD is `$1,500.00` and USD is `US$1,500.00`, but the
component defaults to CAD and the occurrence row was letting it, which is why a
USD invoice read as `$1,500.00`. Thirteen of twenty-one call sites had the same
omission; the ones over a projection or a report were accidentally right, because
those responses are single-currency by construction.

**Post is offered only on a date that has arrived.** The projection splits its two
sources at `asOf`: actual transactions up to it, scheduled occurrences after it.
That model assumes you only record what already happened, and the API does not
enforce the assumption — `POST /scheduled-items/:id/post` accepts any date the
rule generates, including a future one. Post a future occurrence and the money
lands in neither half: it leaves the forecast, because the occurrence is now
`posted`, and it never enters the actuals, because each bucket requires
`date <= asOf`. Measured on the seed: posting a `+$2,184.00` salary due in twelve
days moved the ending balance from `$70,208.78` to `$68,024.78` — down by exactly
the amount recorded. So the row offers **Post** only when `status === 'overdue'`;
a future date offers **Skip** alone. That is the right product rule
independently — "record that this happened" does not apply to a day that has not
come — and it happens to close the hole. The cost is that paying a bill early
cannot be recorded from this screen, and the fix on the API side would be to
count posted transactions where their date falls rather than dropping them.

**Large lists: paged where the API pages, capped where it does not.** Two lists,
two answers, and the API decided which.

The ledger pages. `GET /transactions` takes `page` and `pageSize` and returns
`meta.totalPages`, so the client asks for 8 rows at a time and never holds more.
That is correct at any size — the default seed is ~1,100 rows and `scale: 10`
gives ~6,600 — and it is why there is nothing to virtualise there.

`GET /scheduled-items/occurrences` does not page. No `page` in the filters, no
`meta` in the response: it expands every rule across the window and returns the
lot. That was invisible while the window was a two-option preset, and it stopped
being invisible when the window became a free date range, so I measured what the
endpoint actually returns:

| window   | occurrences |
| -------- | ----------- |
| 1 year   | 157         |
| 3 years  | 443         |
| 5 years  | 729         |
| 10 years | 1,445       |

Roughly 145 rows a year, five cells each — about 14,000 nodes at ten years, and
ten years is two clicks away. So the occurrence list is virtualised with
`@tanstack/react-virtual`, and only **above 50 rows**: below that the machinery
costs more than it saves and the default window is twelve, so there are two code
paths on purpose rather than one that is wrong at one end. The table declares
`aria-rowcount` and each row its `aria-rowindex`, because a virtual list that does
not say what total it is a window onto is a list a screen reader cannot count. Cost:
24 kB raw, 8 kB gzipped.

**This is where the session's worst bug lived, and it was not the virtualiser.**
Scrolling the list grew the _page_, in proportion to the inner scroll. Five
diagnoses died on it — a spacer `<tr>` with no cells (a real bug, but not this
one), a `<table>` as the direct child of an overflow box, a block box in between —
and the list was rewritten as a `div` grid and back, and virtualisation removed and
restored, for nothing. The cause was `VisuallyHidden`: see "where it fought me"
under Design system. `position: relative` on the scroll region was the whole fix,
and with it in place the virtualiser behaves.

Two things that outlast the bug. The measurement above is why virtualisation is
there at all — the README's own rule is to measure before building, and 1,445 rows
is the number that earned it. And what the tests can prove is bounded: happy-dom
gives every element zero height, so they assert the mechanism — every row in the DOM
under the threshold, a fraction of them above it, the real total declared — and not
the scrolling. The threshold and the 45px row estimate are numbers a browser would
sharpen.

---

## Design system

**Built, not adopted** — `@pfm/tokens` (colour, spacing, type, radii as CSS
variables and typed values), `@pfm/ui` (36 exported primitives on Tailwind v4), and
Storybook.

The reason is that the domain primitives are where the consistency actually
matters, and no library ships them: `Money` knows minor units and sign
convention, `DateText` knows a calendar day is not a timestamp, `Bar` knows what
over-budget looks like, `TrendChart` knows a forecast must not read as history.
Adopting MUI would still have left all four to write, on top of learning
somebody else's theming.

Three decisions worth naming, one of which cost something:

- **The chart is recharts, and it is the most expensive line in the repo.**
  `TrendChart` was hand-rolled SVG first. Moving it to recharts took the bundle
  from 407 kB raw / 127 kB gzip to **762 kB / 232 kB** — the library is roughly
  half of what ships, for one line chart. (The client builds at 787 kB / 240 kB
  today; the other 25 kB is the list virtualiser.) What it bought: a tooltip, an axis and
  responsive resizing I would otherwise maintain, and a component whose props did
  not change, so the seam between actuals and forecast is still drawn by our code
  and still tested. Worth knowing before the next chart: the second one is free,
  and if there is never a second one this was a bad trade. It is also not what
  costs the performance score — see Quality.
- **The package ships source, not a build.** Tailwind generates utilities by
  scanning text for literal class strings; point it at a `dist` and every class
  used only inside a component silently vanishes from the app's CSS. A missing
  class does not error, it just does nothing — so the artefact that could go
  stale simply does not exist. The cost is that the consumer compiles TSX, which
  every consumer here already does.
- **Selection is a stroke, not a fill.** Consistent across Button, Segmented and
  the calendar, and it keeps contrast where a filled state would drop it.

Where it fought me: **`VisuallyHidden` inside a scroll region grows the page.**
`sr-only` is `position: absolute` with no offsets, so it lands on its static
position — but its containing block is the nearest _positioned_ ancestor, and an
`overflow` container only clips descendants for which it is in that chain. A
scroll region left at `position: static` therefore does not clip the hidden text
inside it: each span extends the document down to wherever its row happens to sit.
With a virtualised list that is proportional — scroll the list halfway and the page
grows by half the list's height, because the rendered rows moved down. `position:
relative` on the scroll container is the whole fix, and it is now on both tables.
This one cost five wrong diagnoses before Amadeu found it by commenting out the
actions cell, which is the sort of bug that only a browser tells you about.

`Field` owns the label/hint/error and the aria wiring that
goes with them, which means a component used inside it must not render its own
label — a rule that is invisible until someone breaks it. And a portalled
`DatePicker` panel lives outside the dialog's DOM, so its focus trap cannot reach
the calendar; the fix is a `portal={false}` prop, which is the kind of leak a
bought design system would have solved for me.

---

## Quality

**States are real, not placeholders.** Every screen has loading, error with the
code and a retry, empty, and _partial_ failure — when Reports cannot load
category names, the report still renders and says the roll-up is unavailable
instead of failing whole.

**Accessibility, and it is measured rather than asserted.** Focus trap and restore
in `Dialog`; `role="status"` lines that say what changed, because `aria-busy` on
its own announces nothing; a visually hidden `<caption>` on every table; per-row
action buttons that name their row, so thirty buttons are not all called "Post"; a
chart whose series is repeated as a screen-reader table, so magnitude never depends
on the line alone. `@storybook/addon-a11y` runs axe over every story, and
Lighthouse runs it over the assembled screen on every push — **100, and the floor
is 0.95, so it stays there.**

That number started at 89, which is the point of measuring: three real defects
were hiding behind code I would have defended. A chart marked `aria-hidden` whose
surface recharts had made focusable — a keyboard trap. Thirty-four elements below
the contrast floor, from three colours I had picked by eye. And a `Kicker` that
rendered an `h6` directly under an `h2`. None of those would have been caught by a
test asserting roles and names, which is exactly what the screen tests assert.

Still not covered, and worth saying: Lighthouse only sees the Overview, because
without a router the other three screens have no URL to audit. Automated audits
also do not cover what needs a person — there is still no arrow-key navigation
inside the calendar grid.

**CI runs what I run.** `.github/workflows/ci.yml` has two jobs. `checks` runs
lint, `prettier --check`, `tsc`, knip and the test suite with its coverage gate,
then uploads the coverage reports. `lighthouse` builds the app, serves it, and
audits it in a real Chrome. Nothing in the pipeline is a command that exists only
in CI — every step is one I run locally, under the same name.

**Lighthouse audits the real app, not a shell.** `pnpm lighthouse` starts the API,
serves the production build and runs Lighthouse three times against it, so the
page being audited has real accounts, real category totals and a real projection
on it. That needed one fix: the `/api` proxy lived only under Vite's `server`
config, so `vite preview` was not proxying and a production build served locally
could not reach the API at all. It is shared between `server` and `preview` now.

Where it stands, measured on the runner over three runs of the same commit:

|                | score                                      |
| -------------- | ------------------------------------------ |
| Accessibility  | **100**                                    |
| Best practices | **100**                                    |
| SEO            | **100**                                    |
| Performance    | **83** (median; the three runs give 82–83) |

Accessibility started at 89. The report named three audits and all three were
real: `aria-hidden-focus` — recharts made the chart surface focusable inside the
`aria-hidden` plot, which is a keyboard trap; `color-contrast` — 34 elements from
three colours, `ink/55` at 3.63:1, `ink/50` at 3.15:1 and `accent` at 3.02:1,
against the 4.5:1 normal text needs; and `heading-order` — `Kicker` was an `h6`
directly under an `h2`. Fixing them is what the audit was for.

SEO was 91 until a `robots.txt` existed. Without one the SPA answered `index.html`
for it, and Lighthouse parsed HTML as a robots file — one "Syntax not understood"
per line. Two lines in `public/` closed it.

The thresholds in `lighthouserc.json` fail the build below 0.95 on accessibility,
best practices and SEO, and below **0.7** on performance, all against the median
of the three runs. That performance floor is deliberately loose, and the reason is
runner variance across pushes, which has been as wide as 57 on the same commit. A
gate set near the median would fail on noise, and a gate that cries wolf gets
switched off.
0.7 catches a real regression — a doubled bundle, a blocking request — without
firing at variance.

**Performance is 83 and the reason is not the bundle.** FCP 0.8 s, LCP 0.9 s,
Speed Index 0.8 s and **0 ms of total blocking time** all score 0.96 or better.
What costs the points is one metric alone: CLS at 0.318, scoring 0.36. The CLS is not attributed to elements in the report, and the
two candidates — the two Google-hosted serif faces swapping in over a fallback,
and the loading skeletons being shorter than the content they stand in for — need
measurement to separate. That is the next pass, and it is a real one: on weight,
CLS and TBT are 55 of the performance score.

Two limits worth naming out loud:

- **Only the Overview is audited, for now.** Until the screen went into the URL
  there was nothing to point Lighthouse at but the default one. `?screen=reports`
  is a real address now, so widening the audit to all four is a config change
  rather than a refactor — and the three screens it would newly cover have never
  been audited, which is a reason to expect it to find something.
- **Desktop preset.** A ledger is read at a desk. Mobile throttling would produce
  a worse number that says less about how this app is used — that is a choice, so
  it is written down rather than buried in a config file.

**Coverage is a gate, not a report.** `pnpm test` runs with `--coverage` and
`vitest.config.ts` sets a floor of 80% on statements, branches, functions and
lines in both `@pfm/ui` and the client; under it, the suite fails. Where it
stands:

|                | statements | branches | functions | lines |
| -------------- | ---------- | -------- | --------- | ----- |
| `@pfm/ui`      | 87.4%      | 82.4%    | 88.3%     | 90.0% |
| `app/frontend` | 91.9%      | 83.6%    | 89.2%     | 92.1% |

Storybook stories, `main.tsx`, the barrels and the ambient `.d.ts` are excluded —
none of them is code that can be wrong. Everything else counts, including files no
test imports, so the number cannot be flattered by leaving a file out.

**Testing — what, and why that.** 70 client tests, and the seam is `fetch`, not
the query hooks. A test that mocks `useGetTransactions` proves the component can
render its own mock; it would pass with the filters wired to nothing. Stubbing
the transport keeps the query keys, the param building and the error mapping
inside what is under test. So the tests cover the things that can be silently
wrong: that an unset filter is _absent_ from the request rather than sent empty,
that the roll-up sums budgets as well as spend, that posting carries the rule id
_and_ the date, that the chart's seam is where I claim it is. Each one was
mutation-checked — break the line it covers, watch it fail — because a test that
cannot fail is decoration.

---

## Where I used AI

I used Claude Code throughout, and I own all of it.

**How the work was split.** I set the architecture up front — the feature-based
layout, where server state lives, what belongs in a shared package — and said how
things were to be built before any of them were. Then, rather than describing a
convention, I wrote one of each by hand as the pattern: one query hook and one
mutation hook in the react-query layer, one screen, one test. Everything after that
was asked to follow the example.

That is why every hook in `src/http/` and in the features' own `http/` folders has
the same shape, why the query keys carry their filters the same way in all of them,
and why the invalidation set is the only part that differs between mutations. The
shape was a decision I made once, not something that emerged.

**Where I leaned on it hardest.** Three places, all of them work where reading the
whole repo at once beats reading it a file at a time:

- **The Lighthouse score** — standing the audit up, and then closing what it
  found: a focusable node inside an `aria-hidden` chart, thirty-four elements under
  the contrast floor, a heading level skipped.
- **Accessibility past what an audit catches** — the `role="status"` lines that say
  what changed, the screen-reader table under the chart, per-row buttons that name
  their own row.
- **The unit tests** — their breadth, and the coverage gate that keeps them honest.

**What is not mine.** The backend ships with the starter repo. I read its contract
closely — `docs/API.md` and the Bruno collection — and probed every endpoint I
consume with `curl` before writing against it, including the failure cases (`409`
on a double post, `422 NOT_AN_OCCURRENCE`, the sign check on a bill). I did not
review its implementation, and the brief says I do not have to.

**What is mine.** The decisions in this README: what to leave out, where derived
values live, what each mutation invalidates, building the design system rather than
adopting one, the fetch seam in the tests. The code implementing them was largely
written with Claude against the patterns above, then reviewed, corrected and
mutation-checked.

**Where I pushed back.** The first pass at Reports announced nothing to a screen
reader and had no tests at all — both caught by asking for a review, not by the
code looking wrong.

Ask me about any file in here.

---

## What I would do next

1. **Filters in the URL, then a router if it earns it.** The screen is already
   there — `?screen=planning` survives a refresh and leaves a history entry, in
   ~40 lines and no dependency. What is still missing is the part that makes a
   support conversation possible: "send me the link you're looking at" only works
   once the month, the account and the date range are in the URL too. A router
   becomes worth its weight at that point, not before.
2. **Take the performance score apart.** 83, and not because of the bundle — FCP
   0.8 s, LCP 0.9 s, Speed Index 0.8 s and 0 ms of blocking time all score 0.96 or
   better. It is CLS alone, at 0.318 — 25 of the score's weight in one metric. The report does not
   attribute the shift to elements, and the two candidates — two Google-hosted
   serif faces swapping in over a fallback, and loading skeletons shorter than the
   content they stand in for — need measuring apart before either is "fixed".
3. **Measure the list, then decide.** Reset with `scale: 10`, profile the table,
   and virtualise only if the numbers say so. If the store were ever real, cursor
   pagination would matter more than either.
4. **User story 5**, now that Planning proved the project link is already carried
   on occurrences and transactions.
5. **Optimistic updates for post and skip**, with rollback. They are the two
   actions where the round trip is visible, and the invalidation map that makes
   them correct already exists.
6. **Editing and deleting** transactions and scheduled items. Creating is wired;
   the rest is the same shape, plus the `reassignTo` vs `force` conversation on
   category deletion.
