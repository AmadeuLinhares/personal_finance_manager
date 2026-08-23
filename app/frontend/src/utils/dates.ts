import type { IsoDate, IsoMonth } from '@/http/api-types';

/**
 * `'2026-02'` → `{ from: '2026-02-01', to: '2026-02-28' }`.
 *
 * The API's ranges are inclusive on both ends, so the last day has to be real:
 * `2026-02-31` would be rejected, and clamping to the 28th every month would
 * silently drop the 29th to the 31st from any longer month.
 *
 * `Date.UTC` is used purely as a day counter and never rendered — day 0 of the
 * next month is the last day of this one. The values that reach the API stay
 * strings, which is the only form the contract has.
 */
export function monthRange(isoMonth: IsoMonth): { from: IsoDate; to: IsoDate } {
  const [year, month] = isoMonth.split('-').map(Number);
  if (!year || !month) return { from: `${isoMonth}-01`, to: `${isoMonth}-01` };

  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const pad = (value: number) => String(value).padStart(2, '0');

  return {
    from: `${String(year)}-${pad(month)}-01`,
    to: `${String(year)}-${pad(month)}-${pad(lastDay)}`,
  };
}
