import { type Balance, type CurrencyCode, type CurrencyTotal } from '@pfm/contracts';
import { formatMoney } from '@pfm/ui';

export const describeBalance = (balance: Balance): string => {
  if (balance.availableCredit !== null) {
    return `${formatMoney(balance.availableCredit, balance.currency)} left of the limit`;
  }
  if (balance.pending !== 0) {
    return `posted ${formatMoney(balance.posted, balance.currency)} · pending ${formatMoney(
      balance.pending,
      balance.currency,
    )}`;
  }
  return `${String(balance.transactionCount)} transactions · nothing pending`;
};

export const describeTotals = (totals: Partial<Record<CurrencyCode, CurrencyTotal>>): string => {
  const clauses = Object.values(totals).map(
    (total) =>
      `${formatMoney(total.available, total.currency)} across ${String(total.accountCount)} ` +
      `${total.currency} account${total.accountCount === 1 ? '' : 's'}`,
  );

  if (clauses.length === 0) return 'No accounts in scope.';
  return clauses.length === 1 ? clauses[0] : `${clauses.join(' · ')} — never summed`;
};
