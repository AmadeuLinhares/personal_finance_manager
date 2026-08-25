# @pfm/contracts

The API's data contract, in one place: the shapes the Express API answers with,
the shapes it accepts, and the closed sets of values it validates against.

Both apps import it. Nothing restates it.

```ts
import { routes, TRANSACTION_STATUSES, type Transaction } from '@pfm/contracts';
```

## Why a package and not a file in each app

The client used to carry `src/http/api-types.ts` — a copy of the contract the API
ships — while the API carried its own copy of the same vocabulary as runtime
arrays in `src/lib/validate.js`. Two declarations of one truth, in two languages,
with nothing to make them disagree out loud. Adding a transaction status meant
editing both and hoping.

Now the vocabulary is declared once, as an array, and the type is derived from it:

```ts
export const TRANSACTION_STATUSES = ['posted', 'pending'] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];
```

The API validates with the array (`z.enum(TRANSACTION_STATUSES)`), the client
types with the union, and the two cannot drift.

## How the API can import a TypeScript package

It is plain JavaScript, and it never compiles anything. Node ≥ 22.18 strips types
on import, so `import { FREQUENCIES } from '@pfm/contracts'` works with no build
step — which is why this package ships source rather than a `dist/`, the same
choice `@pfm/ui` makes.

That is load-bearing, and it is why `tsconfig.json` sets **`erasableSyntaxOnly`**:
type stripping erases, it does not compile. An `enum`, a `namespace` or a
parameter property would type-check here and then crash the server at import. The
compiler is configured to reject them instead.

## What belongs here

| Yes                                                   | No                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| Entities, and the scalars and envelopes they use      | React Query keys, `Response*` aliases, options types         |
| Request bodies (`Create*Variables`) and query filters | Anything about how a screen renders a shape                  |
| The value sets the API validates against              | Values only one app cares about (a screen's currency toggle) |
| `routes` — every URL, with no query string built in   | The fetch wrapper, retry policy, invalidation                |

The rule of thumb: if the API decides it, it lives here. If the client decides
it, it lives in the hook.

## Layout

One module per resource, mirroring the API's own sections:

```text
primitives.ts     scalars, and every value set as `as const` + derived union
envelopes.ts      Single, Collection, ListMeta, ApiErrorBody, BulkResult
routes.ts         every URL the API exposes
accounts.ts       Account, Balance, CurrencyTotal, snapshots, history
categories.ts     Category
transactions.ts   Transaction, Transfer, and their request bodies
projects.ts       Project, ProjectSummary
scheduledItems.ts ScheduledItem, Occurrence, UpcomingResponse
reports.ts        the report shapes, and what they exclude
projections.ts    BudgetProjection
```

Some shapes here have no consumer yet — `CashFlowReport`, `BalanceHistory`,
`ProjectSummary`. They are contract, not dead code: the endpoints exist and are
documented, and the client simply has not wired them. That is also why this
package is not in knip's scope.

If a shape here disagrees with the server, the server wins.
