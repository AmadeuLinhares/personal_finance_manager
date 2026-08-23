# Bruno collection

Every endpoint of the in-memory API, ready to import.

1. `pnpm --filter @pfm/backend dev` (serves `http://localhost:4000/api`)
2. Bruno → **Open Collection** → pick this `docs/bruno` folder
3. Select the **Local** environment

Or run the whole thing headless as a smoke test:

```bash
cd docs/bruno && npx @usebruno/cli run --env Local
```

66 requests, 59 assertions, all green against a freshly seeded store.

## How it is wired

- `baseUrl` and the seed ids (`acc_chequing`, `cat_groceries`, `proj_remodel`,
  `sch_netflix`) live in `environments/Local.bru`.
- Date params are vars — `{{today}}`, `{{monthStart}}`, `{{thisMonth}}`,
  `{{nextMonthFirst}}`, `{{horizon}}` — recomputed by the collection pre-request
  script, because the seed is anchored to the real clock and hardcoded dates rot.
  The environment carries static fallbacks for when scripting is off.
- List requests set runtime vars (`accountId`, `transactionId`, `transferId`) and
  `create` requests set `createdXId`, so `create → patch → delete` chains work if
  you run a folder top to bottom.
- Extra filters are present but **disabled** (greyed out in the UI) — tick one to
  try it instead of retyping the query string.
- Mutating requests change the in-memory store; `09-dev/reset` puts it back.

## Folders

| | |
|---|---|
| `00-meta` | index, health, every enum |
| `01-accounts` … `06-scheduled-items` | CRUD plus the derived reads per resource |
| `07-reports`, `08-projections` | computed views (no `data` envelope) |
| `09-dev` | reset the store, global latency/error rate, row counts |
| `10-failure-modes` | injected latency/errors and the interesting 4xx: decimal amount, unknown field, currency mismatch, cross-currency transfer, delete conflict, mixed pagination, running balance without a single account, non-occurrence |

Each request's **Docs** tab carries the reasoning behind that endpoint's contract —
why balances are derived and never stored, why a running balance needs one account
and a date sort, why the projection splits at `asOf`.
