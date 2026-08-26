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

The client's dev server proxies `/api` to the backend, so nothing is same-origin
by accident and no CORS is involved. One `Ctrl-C` stops both.

|                                               |                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm test`                                   | 199 tests with coverage gates — 52 API, 86 design system, 61 client |
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
| **Planning**     | 4          | Upcoming bills and income with post/skip/undo per date, and a balance projection with the actual/forecast seam drawn          |
| _the header_     | 2          | "Balance as of" any date, on every screen                                                                                     |

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
| **A router**                         | Screens are local state. Nothing deep-links yet; this is the first thing I would add, and it is a contained change.                                                                    |
| **Auth**                             | The brief says to skip it.                                                                                                                                                             |

---

## Architecture

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

**Large lists: paged, not virtualised — for now.** The default seed is ~1,100
rows and `scale: 10` gives ~6,600. Paging is 8 rows a page against the server,
which is correct at any size; virtualisation would only matter for a "show
everything" view that does not exist yet. I have not measured it, and I would
measure before building it.

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

Two decisions worth naming:

- **The package ships source, not a build.** Tailwind generates utilities by
  scanning text for literal class strings; point it at a `dist` and every class
  used only inside a component silently vanishes from the app's CSS. A missing
  class does not error, it just does nothing — so the artefact that could go
  stale simply does not exist. The cost is that the consumer compiles TSX, which
  every consumer here already does.
- **Selection is a stroke, not a fill.** Consistent across Button, Segmented and
  the calendar, and it keeps contrast where a filled state would drop it.

Where it fought me: `Field` owns the label/hint/error and the aria wiring that
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

**Accessibility.** Focus trap and restore in `Dialog`; `role="status"` lines that
say what changed, because `aria-busy` on its own announces nothing; a visually
hidden `<caption>` on every table; per-row action buttons that name their row, so
thirty buttons are not all called "Post"; a chart whose series is repeated as a
screen-reader table, so magnitude never depends on the line alone. `@storybook/addon-a11y` runs axe over every
story, which is where contrast and landmark problems surface. Known gaps: no
arrow-key navigation inside the calendar grid, and no axe run over the assembled
screens — what the screen tests assert is roles and accessible names, not colour.

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

The thresholds are in `lighthouserc.json` — accessibility, best practices and SEO
fail the build below 0.95, 0.9 and 0.9. **Performance is a warning rather than an
error until it has been measured on the runner**: the bundle is 762 kB raw for one
recharts line chart, and publishing the number the pipeline actually produces is
worth more than guessing at a floor. Two limits worth naming out loud:

- **Only the Overview is audited.** Screens are local state, not routes, so there
  is no URL for Transactions, Reports or Planning to point Lighthouse at. That is
  the most concrete cost of having no router yet, and the audit gets wider the day
  there is one.
- **Desktop preset.** A ledger is read at a desk. Mobile throttling would produce
  a worse number that says less about how this app is used — that is a choice, so
  it is written down rather than buried in a config file.

**Coverage is a gate, not a report.** `pnpm test` runs with `--coverage` and
`vitest.config.ts` sets a floor of 80% on statements, branches, functions and
lines in both `@pfm/ui` and the client; under it, the suite fails. Where it
stands:

|                | statements | branches | functions | lines |
| -------------- | ---------- | -------- | --------- | ----- |
| `@pfm/ui`      | 87.4%      | 82.6%    | 88.3%     | 90.0% |
| `app/frontend` | 91.5%      | 85.1%    | 89.3%     | 91.8% |

Storybook stories, `main.tsx`, the barrels and the ambient `.d.ts` are excluded —
none of them is code that can be wrong. Everything else counts, including files no
test imports, so the number cannot be flattered by leaving a file out.

**Testing — what, and why that.** 61 client tests, and the seam is `fetch`, not
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

- **The backend is not mine.** It ships with the starter repo. I read its
  contract closely — `docs/API.md` and the Bruno collection — and probed every
  endpoint I consume with `curl` before writing against it, including the failure
  cases (`409` on a double post, `422 NOT_AN_OCCURRENCE`, the sign check on a
  bill). I did not review its implementation, and the brief says I do not have to.
- **The client is AI-assisted and human-directed.** The decisions in this README
  are the ones I made and can defend: what to leave out, where derived values
  live, what each mutation invalidates, building the design system, the fetch
  seam in the tests. The code that implements them was largely written with
  Claude, then reviewed, corrected and mutation-checked.
- **Where I pushed back on it.** The first pass at Reports announced nothing to a
  screen reader and had no tests at all — both were caught by asking for a review
  rather than by the code looking wrong.

Ask me about any file in here.

---

## What I would do next

1. **A router.** Screens are local state today. Deep links, back-button
   behaviour, and filters in the URL — the last one is what makes a support
   conversation possible ("send me the link you're looking at").
2. **Measure the list, then decide.** Reset with `scale: 10`, profile the table,
   and virtualise only if the numbers say so. If the store were ever real, cursor
   pagination would matter more than either.
3. **User story 5**, now that Planning proved the project link is already carried
   on occurrences and transactions.
4. **Optimistic updates for post and skip**, with rollback. They are the two
   actions where the round trip is visible, and the invalidation map that makes
   them correct already exists.
5. **Editing and deleting** transactions and scheduled items. Creating is wired;
   the rest is the same shape, plus the `reassignTo` vs `force` conversation on
   category deletion.
