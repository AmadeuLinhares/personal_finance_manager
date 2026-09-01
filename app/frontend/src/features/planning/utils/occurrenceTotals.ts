import { type CurrencyCode, type Occurrence } from '@pfm/contracts';

export interface OccurrenceTotals {
  count: number;
  inflow: number;
  outflow: number;
  unsummed: { currency: CurrencyCode; count: number }[];
}

export const toOccurrenceTotals = (
  occurrences: Occurrence[],
  currency: CurrencyCode,
): OccurrenceTotals => {
  const others = new Map<CurrencyCode, number>();
  let count = 0;
  let inflow = 0;
  let outflow = 0;

  for (const occurrence of occurrences) {
    if (occurrence.currency !== currency) {
      others.set(occurrence.currency, (others.get(occurrence.currency) ?? 0) + 1);
      continue;
    }

    count += 1;
    if (occurrence.status === 'skipped') continue;
    if (occurrence.amount > 0) inflow += occurrence.amount;
    else outflow -= occurrence.amount;
  }

  return {
    count,
    inflow,
    outflow,
    unsummed: [...others.entries()]
      .map(([code, total]) => ({ currency: code, count: total }))
      .sort((a, b) => b.count - a.count || a.currency.localeCompare(b.currency)),
  };
};

export const describeUnsummed = (unsummed: OccurrenceTotals['unsummed']): string =>
  unsummed.length === 0
    ? ''
    : `${unsummed
        .map(({ currency, count }) => `${String(count)} in ${currency}`)
        .join(' · ')}, not summed`;
