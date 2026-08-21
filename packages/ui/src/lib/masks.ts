/**
 * Input masks, in the two flavours the pattern needs.
 *
 * **Character masks** shape the text as it is typed and leave the value a
 * string. They are applied through a ref by `useMask` from @react-input/mask.
 *
 * **Value-transform masks** show one thing and store another: the field displays
 * `10,414.68` while the form holds the number. These cannot use `useMask` — they
 * need a synthetic change event so react-hook-form records the number instead of
 * the formatted string. `Input` does that wiring.
 */

/** A raw @react-input/mask config, for a one-off mask with no name. */
export interface CharacterMask {
  mask: string;
  replacement: Record<string, RegExp>;
}

/**
 * Named character masks. Only what this domain actually uses: the API's dates
 * are `YYYY-MM-DD` calendar strings, and a masked text input can express a
 * partial date, which `<input type="date">` cannot.
 */
export const maskDefinitions = {
  isoDate: { mask: 'yyyy-mm-dd', replacement: { y: /\d/, m: /\d/, d: /\d/ } },
  isoMonth: { mask: 'yyyy-mm', replacement: { y: /\d/, m: /\d/ } },
} satisfies Record<string, CharacterMask>;

/**
 * Digits fill from the right, so the decimal point never has to be typed:
 * `4`, `45`, `459`, `4599` read as 0.04 → 0.45 → 4.59 → 45.99.
 *
 * The return value is **integer minor units**, which is what the API stores. No
 * division happens, so no float ever exists to carry a rounding error — typing
 * digits IS the minor-unit integer.
 *
 * Takes `unknown` on purpose. react-hook-form runs `setValueAs` on every value it
 * reads, including the number in `defaultValues` at registration time, so this is
 * handed numbers as well as typed text. A number is already minor units and comes
 * back unchanged.
 */
export function parseMoneyInput(input: unknown): number {
  if (input == null || input === '') return 0;
  if (typeof input === 'number') return Number.isFinite(input) ? Math.trunc(input) : 0;

  // Anything that is neither a number nor typed text is not a money input.
  if (typeof input !== 'string') return 0;

  const negative = input.trimStart().startsWith('-');
  const digits = input.replace(/\D/g, '');
  if (digits === '') return 0;
  const minorUnits = Number(digits);
  return negative ? -minorUnits : minorUnits;
}

/**
 * `4599` → `45.99`, grouped. Built by slicing the digit string rather than
 * dividing by 100, so the displayed figure is exactly the stored integer.
 *
 * No currency symbol: that belongs in the field's `prefix`, where it does not
 * move as the number grows.
 */
export function formatMoneyInput(minorUnits: number): string {
  const negative = minorUnits < 0;
  const digits = String(Math.abs(Math.trunc(minorUnits))).padStart(3, '0');
  const whole = digits.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}${whole}.${digits.slice(-2)}`;
}

/** Turns whatever the form holds — a number, a numeric string, nothing — into a display string. */
export function coerceMoneyDisplay(raw: unknown): string {
  if (raw == null || raw === '') return '';
  const value = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(value) ? formatMoneyInput(value) : '';
}

export const valueTransformMasks = {
  money: {
    parse: parseMoneyInput,
    format: formatMoneyInput,
    coerce: coerceMoneyDisplay,
  },
} as const;

export type ValueTransformMaskName = keyof typeof valueTransformMasks;

export type MaskName = keyof typeof maskDefinitions | ValueTransformMaskName;

export function isValueTransformMask(mask: unknown): mask is ValueTransformMaskName {
  return mask === 'money';
}

/**
 * Register options for a `money` field, so the caller does not have to remember
 * them: `{...register('amount', moneyRegisterOptions)}`.
 *
 * `setValueAs` is react-hook-form's public hook for exactly this — it runs on
 * every path RHF reads a value on, so the event and a later re-read of the DOM
 * node both land the same integer. Do not add `valueAsNumber`; the two are
 * mutually exclusive, and `+'10,414.68'` is NaN.
 */
export const moneyRegisterOptions = {
  setValueAs: parseMoneyInput,
} as const;
