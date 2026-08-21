# @pfm/tokens

The design tokens of the Classical system, ported from the design system's
`styles.css`, which stays the source of truth for the look.

Two exports, one set of values:

| Export                  | What it is                   | Use it when                                                       |
| ----------------------- | ---------------------------- | ----------------------------------------------------------------- |
| `@pfm/tokens/theme.css` | A Tailwind v4 `@theme` block | Always. Tailwind utilities are generated from it.                 |
| `@pfm/tokens`           | The same values, typed       | Only where a class cannot go: chart libraries, canvas, SVG stops. |

## Why this is its own package

Both the component library and the app need the theme. The app needs it even on a
screen that renders no component of ours — `p-4`, `text-ink` and `border-divider`
all come from here. Keeping tokens separate means the app can have the palette
without pulling React and every component in to get it, and something that is not
React at all could read the values later.

## Using it

```css
@import 'tailwindcss';
@import '@pfm/tokens/theme.css';
```

`@pfm/ui/styles.css` already imports it, so an app that consumes the components
gets the theme with it and does not need the line above.

## What is in the theme

- **Colors** — `bg`, `surface`, `ink`, `divider`, `accent`, and the `neutral`,
  `accent` and `accent-2` ramps at 100–900. Ramps are OKLCH-generated on one
  shared lightness scale, so step 500 of any ramp carries the same visual weight
  as step 500 of another. 100–300 are tinted fills and hovers, 500 is the base,
  700–900 is text on tints and pressed states.
- **Type** — `font-heading` (Cormorant Garamond) and `font-body` (Lora). Content
  sizes `text-display` through `text-h6` and `text-body`; interface sizes
  `text-ui`, `text-ui-sm`, `text-label`, `text-meta`, `text-micro`. 600 is the
  weight ceiling — there is no bold in this system.
- **Spacing** — one token, `--spacing: 4.6px`. The design system's scale
  (4.6 · 9.2 · 13.8 · 18.4 · 27.6 · 36.8) is exactly that step times
  1 · 2 · 3 · 4 · 6 · 8, so `p-1`…`p-8` reproduce it and every step between comes
  for free.
- **Radii** `sm` 2px, `md` 4px, `lg` 7px. **Shadows** `sm`/`md`/`lg` — elevation
  here is a whisper.
- **Motion** — `animate-skeleton`, the loading pulse.

## Two deliberate choices

**Tailwind's stock palette is dropped** (`--color-*: initial`). The system is
mono and has no red, so `text-red-500` resolving to something would be a bug
waiting to be shipped. `transparent`, `current`, `white` and `black` are kept.
To get a one-off color back, add it to this file — that is the point.

**Attention is not red.** Overdue, over budget and error states use
`accent-700`/`accent-800`. The ramp carries urgency; nothing else needs to.

## Semantic roles

`semantic` in `index.ts` names the meanings rather than the steps — `inflow`,
`outflow`, `spent`, `committed`, `attention`, `track`. Charts should ask for the
role so a retune happens in one place. In CSS the same mapping is documented in
the design system's section 13.

## Keeping it honest

`theme.css` and `index.ts` hold the same numbers twice. If they drift,
`theme.css` wins. Both are checked by the shared ESLint config, which bans inline
hex colors everywhere except `index.ts` — the one file whose job is to hold them.
