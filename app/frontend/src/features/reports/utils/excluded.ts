import { type ReportExclusions } from '@pfm/contracts';

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
