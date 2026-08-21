/**
 * The same tokens as theme.css, as typed values.
 *
 * theme.css is what the UI and the app should use — Tailwind utilities read from
 * it. Reach for this module only where a CSS class cannot go: chart libraries
 * that want a color string, canvas drawing, inline SVG stops, a `<meta
 * name="theme-color">`. Keep the two files in step; theme.css wins if they drift.
 */

export const color = {
  bg: '#f3f2f2',
  surface: '#eae9e9',
  ink: '#201f1d',
  divider: 'color-mix(in srgb, #201f1d 16%, transparent)',
  accent: '#b68235',
  neutral: {
    100: '#f8f4f4',
    200: '#eae7e7',
    300: '#d7d3d3',
    400: '#bab6b6',
    500: '#9b9797',
    600: '#7d7979',
    700: '#605d5d',
    800: '#444141',
    900: '#2d2b2b',
  },
  accent1: {
    100: '#fff3e4',
    200: '#ffe3bf',
    300: '#facb8d',
    400: '#e1ad66',
    500: '#c28d41',
    600: '#a06f24',
    700: '#7d5411',
    800: '#5a3b0a',
    900: '#3a270d',
  },
} as const;

/**
 * Roles, not colors. Charts and bars should ask for the meaning and let this
 * table decide the step, so a retune happens in one place.
 *
 * There is no red in this palette: attention is carried by the deep accent steps.
 */
export const semantic = {
  /** Positive amounts. Outflows stay ink. */
  inflow: color.accent1[700],
  outflow: color.ink,
  /** Money already spent, in bars. */
  spent: color.accent1[500],
  /** Future money — scheduled, not yet actual. */
  committed: color.accent1[300],
  /** Overdue, over budget, errors. */
  attention: color.accent1[700],
  attentionStrong: color.accent1[800],
  /** The unfilled part of any bar. */
  track: color.neutral[200],
} as const;

export const font = {
  heading: "'Cormorant Garamond', ui-serif, Georgia, serif",
  body: 'Lora, ui-serif, Georgia, serif',
  /** Interface headings cap here. Display sizes go lighter, to 400. */
  headingWeight: 600,
} as const;

/** One step. Every spacing value in the system is a whole multiple of it. */
export const spacingStep = 4.6;

export const radius = { sm: '2px', md: '4px', lg: '7px' } as const;

export const shadow = {
  sm: '0 1px 2px color-mix(in srgb, #2d2b2b 14%, transparent)',
  md: '0 3px 10px color-mix(in srgb, #2d2b2b 16%, transparent)',
  lg: '0 12px 32px color-mix(in srgb, #2d2b2b 22%, transparent)',
} as const;

/** The ordered accent ramp, for charts that need N distinguishable series. */
export const accentRamp = [
  color.accent1[300],
  color.accent1[500],
  color.accent1[700],
  color.accent1[200],
  color.accent1[600],
  color.accent1[800],
] as const;
