/**
 * Formatting at the edge of the app.
 *
 * The API's rules, restated because every one of them is a bug waiting to
 * happen: money is an integer number of minor units, dates are calendar strings
 * with no timezone, and two currencies are never added together.
 */

/** ISO 4217 codes the seed data actually contains. */
export type Currency = 'CAD' | 'USD';

const MINUS = '−'; // real minus sign, not a hyphen — it aligns with figures

/**
 * Renders integer minor units as money. `-4599` becomes `−$45.99`.
 *
 * @param minorUnits cents, as the API stores them. Never a float.
 * @param currency   CAD renders as `$`, USD as `US$` — they are never summed, so
 *                   the symbol has to keep them apart on screen.
 */
export function formatMoney(
  minorUnits: number,
  currency: Currency = 'CAD',
  options: { signed?: boolean } = {},
): string {
  const { signed = false } = options;
  const formatted = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  }).format(Math.abs(minorUnits) / 100);

  if (minorUnits < 0) return `${MINUS}${formatted}`;
  return signed && minorUnits > 0 ? `+${formatted}` : formatted;
}

/** `4599` → `45.99`, for putting a stored amount back into a text input. */
export function minorToInput(minorUnits: number): string {
  return (minorUnits / 100).toFixed(2);
}

/**
 * `'45.99'` → `4599`. Returns null when the text is not exactly representable in
 * minor units, which is the same thing the API answers 422 to.
 */
export function inputToMinor(value: string): number | null {
  const trimmed = value.trim().replace(/[$\s,]/g, '');
  if (!/^-?\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  return Math.round(Number(trimmed) * 100);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * `'2026-08-21'` → `'21 Aug'`, or `'21 Aug 2026'` when the year is not the
 * current one.
 *
 * Parsed by splitting the string. `new Date('2026-08-21')` is UTC midnight, which
 * renders as the 20th anywhere west of Greenwich — the API's dates are calendar
 * days and must never touch a Date.
 */
export function formatDate(isoDate: string, options: { year?: boolean } = {}): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  const label = `${String(Number(day))} ${MONTHS[Number(month) - 1] ?? month}`;
  return options.year ? `${label} ${year}` : label;
}

/** `'2026-08'` → `'August 2026'`, for report headers. */
export function formatMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split('-');
  if (!year || !month) return isoMonth;
  const full = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${full[Number(month) - 1] ?? month} ${year}`;
}

/** Calendar dates sort and compare as plain strings. That is the whole trick. */
export function isBefore(a: string, b: string): boolean {
  return a < b;
}
