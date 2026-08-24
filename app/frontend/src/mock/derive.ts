/**
 * Everything a screen needs, computed from the fixtures.
 *
 * Kept as pure functions on purpose: these are the calculations the API does, so
 * when the real endpoints arrive each one is deleted rather than rewritten. The
 * rules they encode are the contract's, not this app's invention.
 */

import {
  type Account,
  type Currency,
  type Transaction,
  ACCOUNTS,
  BUDGETS,
  OCCURRENCES,
  TRANSACTIONS,
} from './data';

/** Balances are derived, never stored. `available = posted + pending`. */
export function available(account: Account): number {
  return account.posted + account.pending;
}

function accountById(id: string): Account | undefined {
  return ACCOUNTS.find((account) => account.id === id);
}

/** Totals are grouped by currency and never summed across them. */
export function totalsFor(currency: Currency) {
  const accounts = ACCOUNTS.filter((account) => account.currency === currency);
  return {
    posted: accounts.reduce((sum, account) => sum + account.posted, 0),
    pending: accounts.reduce((sum, account) => sum + account.pending, 0),
    available: accounts.reduce((sum, account) => sum + available(account), 0),
  };
}

/** A transfer is two transactions sharing a transferId — reports drop both legs. */
function isTransfer(transaction: Transaction): boolean {
  return transaction.transferId !== undefined;
}

function inMonth(isoDate: string, isoMonth: string): boolean {
  return isoDate.startsWith(isoMonth);
}

interface CategoryTotal {
  name: string;
  outflow: number;
  budget: number | null;
  overBudget: boolean;
}

/**
 * Expenses by category for one month, one currency.
 *
 * Classification follows the sign of the amount, not the category's kind, so a
 * refund lands as inflow even inside an expense category. Transfers are excluded
 * and counted, because a report that drops rows silently is lying.
 */
export function monthlyExpenses(isoMonth: string, currency: Currency = 'CAD') {
  const scope = TRANSACTIONS.filter((transaction) => {
    const account = accountById(transaction.accountId);
    return account?.currency === currency && inMonth(transaction.date, isoMonth);
  });

  const excludedTransfers = scope.filter(isTransfer).length;
  const counted = scope.filter((transaction) => !isTransfer(transaction));

  const byCategory = new Map<string, number>();
  let outflow = 0;
  let inflow = 0;

  for (const transaction of counted) {
    if (transaction.amount < 0) {
      outflow += -transaction.amount;
      const key = transaction.category ?? 'Uncategorised';
      byCategory.set(key, (byCategory.get(key) ?? 0) + -transaction.amount);
    } else {
      inflow += transaction.amount;
    }
  }

  const categories: CategoryTotal[] = [...byCategory.entries()]
    .map(([name, total]) => {
      const budget = BUDGETS[name] ?? null;
      return { name, outflow: total, budget, overBudget: budget !== null && total > budget };
    })
    .sort((a, b) => b.outflow - a.outflow);

  const otherCurrencies = TRANSACTIONS.filter((transaction) => {
    const account = accountById(transaction.accountId);
    return (
      account !== undefined && account.currency !== currency && inMonth(transaction.date, isoMonth)
    );
  }).length;

  return { categories, outflow, inflow, net: inflow - outflow, excludedTransfers, otherCurrencies };
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

interface ProjectionPoint {
  label: string;
  value: number;
}

/**
 * Commitments only: actuals through today, then unposted scheduled occurrences.
 *
 * Not a behavioural model — discretionary spending, transfers and paused items are
 * all out. The first point is today's real balance, which is why the chart can
 * draw a seam between what happened and what is merely committed.
 */
export function budgetProjection(months: number) {
  const start = totalsFor('CAD').available;
  const recurringNet = OCCURRENCES.filter(
    (occurrence) => occurrence.frequency !== 'once' && occurrence.status === 'scheduled',
  ).reduce(
    (sum, occurrence) => sum + occurrence.amount * (occurrence.frequency === 'biweekly' ? 2 : 1),
    0,
  );
  const oneOffs = OCCURRENCES.filter(
    (occurrence) => occurrence.frequency === 'once' && occurrence.status === 'scheduled',
  ).reduce((sum, occurrence) => sum + occurrence.amount, 0);

  const series: ProjectionPoint[] = [{ label: 'Aug', value: start }];
  let balance = start;
  for (let index = 0; index < months; index += 1) {
    balance += recurringNet + (index === 0 ? oneOffs : 0);
    const month = (7 + index + 1) % 12;
    series.push({ label: MONTH_LABELS[month] ?? '', value: balance });
  }

  const lowest = series.reduce((low, point) => (point.value < low.value ? point : low), series[0]);
  return { series, start, ending: balance, delta: balance - start, lowest };
}
