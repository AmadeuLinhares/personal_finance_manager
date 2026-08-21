# @pfm/ui

The Classical design system as React components, built on `@pfm/tokens` and
Tailwind v4. Ported from the design system's `Components.dc.html` reference.

## Using it

```jsonc
// package.json
{ "dependencies": { "@pfm/ui": "workspace:*" } }
```

```css
/* the app's entry CSS */
@import 'tailwindcss';
@import '@pfm/ui/styles.css';
```

```tsx
import { Button, Money, Table, Td, Th, Tr } from '@pfm/ui';
```

That one CSS import brings the tokens with it and points Tailwind at this
package's source, so a class used only inside a component still lands in the
app's bundle. `@source` resolves relative to `styles.css`, so the app never has
to know where `@pfm/ui` sits on disk.

The fonts are not loaded here — put the Cormorant Garamond and Lora `<link>` in
the app's HTML, where it can be preconnected.

## Decision: this package ships source, not a build

`exports` points at `src/index.ts`. There is no `dist`, no `tsup`, no build
script — the consumer's bundler compiles the TSX. This is deliberate; here is the
reasoning, so nobody has to reconstruct it later.

**Why source wins here**

- **No stale artefact.** A `dist` is a second copy of the truth. The moment
  someone edits a component and forgets to rebuild, the app renders yesterday's
  code and the mistake is invisible — it looks like the edit did not work. With
  source there is one copy and it is always current.
- **Tailwind can see the real class strings.** This is the load-bearing reason.
  Tailwind generates utilities by scanning source text for literal class names.
  `styles.css` points `@source` at `./src`, and that only works because `./src`
  is what actually ships. Point it at a minified `dist` and the scan finds
  mangled output; ship a `dist` and forget the `@source`, and every class used
  only inside a component silently vanishes from the app's CSS — a class that is
  not generated does not error, it just does nothing.
- **No build step to keep green.** One less thing in CI, one less watcher in dev,
  and HMR crosses the package boundary for free.

**What it costs**

The consumer has to compile TSX and process our CSS. Every app in this repo does
(Vite, and Storybook's Vite), so today the cost is zero. It would not be zero for
a consumer that expects plain JS — a plain Node script, a Jest setup with no
transform for `node_modules`, or a bundler configured to skip transpiling
dependencies.

**What would flip this decision**

Publishing outside the monorepo. A package on a registry cannot assume the
consumer's toolchain, so it would need a real build: compiled JS, `.d.ts` files,
`exports` pointing at the output, and an `@source` strategy that survives
minification. If that day comes, this section is the thing to reread first — the
Tailwind scanning is the part that quietly breaks.

## Storybook

```bash
pnpm storybook          # from the repo root, or pnpm --filter @pfm/ui storybook
pnpm build-storybook    # static build into packages/ui/storybook-static
```

25 stories under five groups: **Foundations** (the tokens themselves — ramps,
type scale, spacing, radii, elevation), **Primitives** (Button, Tag, Card, Forms),
**Data** (Money & dates, Bar), **Feedback** (States), **Patterns** (Table, Dialog,
Nav). `addon-a11y` runs with `test: 'error'`, so an accessibility violation fails
the story rather than warning quietly.

The canvas loads Tailwind through `.storybook/preview.css`, which imports this
package's `styles.css`. Storybook therefore renders against exactly the same
tokens and the same `@source` scan as the app — no second copy of the theme.

## Components

|                                                                |                                                                                                                                                                                                 |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                                       | `primary` is an accent **outline**, never a fill. Also `secondary`, `ghost`, `icon`, `block`, `size="sm"` for row actions.                                                                      |
| `Tag`                                                          | `accent` marks what needs attention, `neutral` marks categories, `outline` marks metadata. `accent2` exists because the reference has it; the system is mono, so it reads the same as `accent`. |
| `Card` + `CardKicker` `CardTitle` `CardBody` `CardMeta`        | Bordered and unfilled. `elevation` for the shadow scale.                                                                                                                                        |
| `SummaryCard`                                                  | The balance card. Negative is honest — overdrawn, or owed on a card — so inflow colouring is off: a balance is a position, not a movement.                                                      |
| `Field` + `Input` `Select` `Textarea`                          | `Field` takes a render function so the control keeps its own props while the field owns the id wiring and `aria-invalid`.                                                                       |
| `Radio`, `Segmented` + `SegmentedOption`                       | Native inputs, visually replaced. No script, no state to manage.                                                                                                                                |
| `Table` + `Th` `Td` `Tr`                                       | `numeric` gives a cell tabular numerals, no wrap and right alignment — what a column of amounts always wants.                                                                                   |
| `Bar`                                                          | Track `neutral-200`, spent `accent-500`, committed `accent-300`. Over budget saturates the whole bar to `accent-700` rather than overflowing.                                                   |
| `Money`                                                        | Takes **integer minor units**. `-4599` renders `−$45.99` with a real minus sign. Inflows go `accent-700`; outflows stay ink.                                                                    |
| `DateText`                                                     | Takes `YYYY-MM-DD` and renders `21 Aug`.                                                                                                                                                        |
| `Dialog`, `Divider`, `Nav` + `NavBrand` `NavLink`, `Kicker`    |                                                                                                                                                                                                 |
| `Skeleton`, `EmptyState`, `ErrorState`, `Notice`, `Pagination` | `Notice` is the line that owns up to something — a 207 partial import, or the rows a report dropped.                                                                                            |

## The API contract, encoded

The formatters in `src/lib/format.ts` exist because each of these is a bug
waiting to happen:

- **Money is integer minor units.** `formatMoney` takes cents. `inputToMinor`
  returns `null` for anything not exactly representable — the same thing the API
  answers `422` to, rather than rounding it away.
- **Dates are calendar strings.** `formatDate` parses by splitting on `-`.
  `new Date('2026-08-21')` is UTC midnight and renders as the 20th anywhere west
  of Greenwich; it must never touch these values.
- **Currencies are never summed.** `formatMoney` renders CAD as `$` and USD as
  `US$` so two totals cannot be mistaken for one scope.
- **Dates compare as strings.** `isBefore` is `a < b`, which is the whole trick.

## Conventions

Every component takes `className` and merges it through `cn` (tailwind-merge), so
a caller's class beats the component's own instead of both landing in the
attribute and the later one winning by accident.

No component carries a raw hex, font name or spacing value that a token already
holds — the shared ESLint config fails the build on inline hex colors. Interaction
states are themed, never browser defaults: hover and pressed tints come from the
accent ramp, and keyboard focus is the 2px accent `:focus-visible` ring set once
in `styles.css`.
