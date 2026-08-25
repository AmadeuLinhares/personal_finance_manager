import { type ReportExclusions } from '@pfm/contracts';

/**
 * What the report left out, as a sentence.
 *
 * Naming the exclusions is the point: a total that quietly drops transfer legs
 * and USD rows is a number the user cannot reconcile against their own account.
 * Zero counts are left out — "0 pending" is noise, not reassurance.
 */
export const describeExcluded = (excluded: ReportExclusions): string => {
  const parts = [
    { count: excluded.transferLegs, label: 'transfer legs' },
    { count: excluded.otherCurrencyTransactions, label: 'other-currency' },
    { count: excluded.outOfScopeTransactions, label: 'out of scope' },
    { count: excluded.pendingTransactions, label: 'pending' },
  ].filter((part) => part.count > 0);

  if (parts.length === 0) {
    return 'Nothing was excluded from this report.';
  }
  return `Excluded from this report: ${parts
    .map((part) => `${String(part.count)} ${part.label}`)
    .join(' · ')}`;
};
