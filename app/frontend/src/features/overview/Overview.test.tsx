import {
  type Account,
  type AccountsMeta,
  type BudgetProjection,
  type CategoryTotals,
  type Collection,
  type MonthlyExpensesReport,
  type Occurrence,
  type UpcomingResponse,
} from '@pfm/contracts';
import { formatDate, formatMoney, toIsoDate, toIsoMonth } from '@pfm/ui';
import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { Overview } from './Overview';
import { account, balance, categoryTotals } from '@test/fixtures';
import { renderScreen, stubFetch } from '@test/harness';

const now = new Date();
const MONTH = toIsoMonth(now);
const ASOF = toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5));
const FIRST_OF_MONTH = toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
const END_OF_HORIZON = toIsoDate(new Date(now.getFullYear(), now.getMonth() + 4, 0));
const day = (offset: number) =>
  toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset));

const ACCOUNTS: Account[] = [
  account({
    id: 'acc_chequing',
    name: 'Everyday Chequing',
    balance: balance({ accountId: 'acc_chequing', available: 4218420, transactionCount: 812 }),
  }),
  account({
    id: 'acc_visa',
    name: 'Travel Visa',
    type: 'credit_card',
    creditLimit: 500000,
    balance: balance({
      accountId: 'acc_visa',
      posted: -128400,
      pending: -4200,
      available: -132600,
      creditLimit: 500000,
      availableCredit: 367400,
    }),
  }),
  account({
    id: 'acc_usd',
    name: 'USD Savings',
    currency: 'USD',
    balance: balance({ accountId: 'acc_usd', currency: 'USD', available: 240000 }),
  }),
  account({ id: 'acc_cash', name: 'Cash tin', type: 'cash' }),
];

const accounts = (): Collection<Account, AccountsMeta> => ({
  data: ACCOUNTS,
  meta: {
    total: ACCOUNTS.length,
    asOf: ASOF,
    totalsByCurrency: {
      CAD: {
        currency: 'CAD',
        posted: 4090020,
        pending: -4200,
        available: 4085820,
        accountCount: 3,
      },
      USD: { currency: 'USD', posted: 240000, pending: 0, available: 240000, accountCount: 1 },
    },
  },
});

const ROWS = [
  categoryTotals({ categoryId: 'cat_groceries', name: 'Groceries', outflow: 60725, budget: 90000 }),
  categoryTotals({ categoryId: 'cat_rent', name: 'Rent', outflow: 215000, budget: 215000 }),
  categoryTotals({
    categoryId: 'cat_salary',
    name: 'Salary',
    kind: 'income',
    outflow: 0,
    inflow: 436800,
    net: 436800,
  }),
  categoryTotals({
    categoryId: 'cat_utilities',
    name: 'Utilities',
    outflow: 20000,
    budget: 18000,
    overBudget: true,
  }),
  categoryTotals({ categoryId: 'cat_dining', name: 'Dining out', outflow: 15200 }),
  categoryTotals({ categoryId: 'cat_transport', name: 'Transport', outflow: 8400 }),
  categoryTotals({ categoryId: 'cat_gifts', name: 'Gifts', outflow: 3100 }),
];

const report = (rows: CategoryTotals[] = ROWS): MonthlyExpensesReport => ({
  range: { from: MONTH, to: MONTH, startDate: `${MONTH}-01`, endDate: `${MONTH}-28` },
  currency: 'CAD',
  scope: {
    accountIds: ['acc_chequing', 'acc_visa'],
    includesPending: true,
    includesTransfers: false,
    projectIds: null,
  },
  months: [
    {
      month: MONTH,
      start: `${MONTH}-01`,
      end: `${MONTH}-28`,
      inflow: 436800,
      outflow: 322425,
      net: 114375,
      transactionCount: 24,
      byCategory: rows,
    },
  ],
  totals: {
    inflow: 436800,
    outflow: 322425,
    net: 114375,
    transactionCount: 24,
    monthCount: 1,
    averageMonthlyOutflow: 322425,
    byCategory: rows,
  },
  excluded: {
    transferLegs: 4,
    otherCurrencyTransactions: 2,
    outOfScopeTransactions: 0,
    pendingTransactions: 0,
  },
});

const occurrence = (
  over: Partial<Occurrence> & Pick<Occurrence, 'scheduledItemId' | 'name' | 'date' | 'amount'>,
): Occurrence => ({
  currency: 'CAD',
  accountId: 'acc_chequing',
  categoryId: null,
  projectId: null,
  kind: 'bill',
  status: 'scheduled',
  transactionId: null,
  ...over,
});

const OCCURRENCES: Occurrence[] = [
  occurrence({ scheduledItemId: 'sch_gym', name: 'Gym membership', date: day(6), amount: -4500 }),
  occurrence({
    scheduledItemId: 'sch_rent',
    name: 'Rent',
    date: day(-9),
    amount: -215000,
    status: 'posted',
    transactionId: 'txn_1',
  }),
  occurrence({
    scheduledItemId: 'sch_hydro',
    name: 'Hydro',
    date: day(-2),
    amount: -12480,
    status: 'overdue',
  }),
  occurrence({
    scheduledItemId: 'sch_meal_kit',
    name: 'Meal kit',
    date: day(4),
    amount: -6900,
    status: 'skipped',
  }),
  occurrence({
    scheduledItemId: 'sch_salary',
    name: 'Salary',
    date: day(8),
    amount: 218400,
    kind: 'income',
  }),
];

const upcoming = (): UpcomingResponse => ({
  range: { from: FIRST_OF_MONTH, to: END_OF_HORIZON },
  occurrences: OCCURRENCES,
  totals: {
    inflow: 218400,
    outflow: 238880,
    net: -20480,
    occurrenceCount: OCCURRENCES.length,
    overdueCount: 1,
  },
});

const bucket = (key: string, closingBalance: number) => ({
  key,
  start: `${key}-01`,
  end: `${key}-28`,
  isProjected: true,
  isPartiallyProjected: false,
  daysInBucket: 30,
  projectedDays: 30,
  actual: { inflow: 0, outflow: 0, net: 0, transactionCount: 0 },
  scheduled: { inflow: 0, outflow: 0, net: 0, occurrenceCount: 2 },
  estimatedDiscretionary: 0,
  inflow: 0,
  outflow: 0,
  net: 0,
  closingBalance,
});

const projection = (over: Partial<BudgetProjection> = {}): BudgetProjection => ({
  range: { from: ASOF, to: END_OF_HORIZON },
  granularity: 'month',
  currency: 'CAD',
  asOf: ASOF,
  scope: { accountIds: ['acc_chequing'] },
  startingBalance: 4218420,
  endingBalance: 4717738,
  lowestPoint: null,
  goesNegative: false,
  series: [bucket('2026-08', 4310270), bucket('2026-09', 4058526), bucket('2026-10', 4717738)],
  assumptions: {
    actualsThrough: ASOF,
    forecastFrom: day(1),
    includesScheduled: true,
    includesPendingInStartingBalance: true,
    excludesTransfers: true,
    includesEstimatedDiscretionary: false,
    monthlyCategoryBudgetTotal: null,
    scheduledItemIds: ['sch_rent'],
    note: 'Actual transactions are used up to asOf; scheduled occurrences after it.',
  },
  ...over,
});

function renderOverview(overrides: Parameters<typeof stubFetch>[0] = {}) {
  const onGo = vi.fn();
  const stub = stubFetch({
    '/accounts': () => ({ body: accounts() }),
    '/reports/monthly-expenses': () => ({ body: report() }),
    '/scheduled-items/occurrences': () => ({ body: upcoming() }),
    '/projections/budget': () => ({ body: projection() }),
    ...overrides,
  });
  renderScreen(<Overview asOf={ASOF} onGo={onGo} />);
  return { stub, onGo };
}

const panel = (name: RegExp | string): HTMLElement => {
  const section = screen.getByRole('heading', { name }).closest('section');
  if (!section) throw new Error(`No panel headed "${String(name)}"`);
  return section;
};

const rowsOf = (name: RegExp | string) =>
  within(panel(name))
    .getAllByRole('listitem')
    .map((row) => row.textContent);

test('asks each screen its own question, against the date the header owns', async () => {
  const { stub } = renderOverview();
  await screen.findByText('Everyday Chequing');

  const accountParams = stub.lastTo('/accounts')?.params;
  expect(accountParams?.get('asOf')).toBe(ASOF);
  expect(accountParams?.get('includeBalances')).toBe('true');

  const reportParams = stub.lastTo('/reports/monthly-expenses')?.params;
  expect(reportParams?.get('from')).toBe(MONTH);
  expect(reportParams?.get('to')).toBe(MONTH);
  expect(reportParams?.get('currency')).toBe('CAD');

  const occurrenceParams = stub.lastTo('/scheduled-items/occurrences')?.params;
  expect(occurrenceParams?.get('from')).toBe(FIRST_OF_MONTH);
  expect(occurrenceParams?.get('to')).toBe(END_OF_HORIZON);

  const projectionParams = stub.lastTo('/projections/budget')?.params;
  expect(projectionParams?.get('to')).toBe(END_OF_HORIZON);
  expect(projectionParams?.get('granularity')).toBe('month');
});

test('an account with no balance shows an em dash, and the totals are never summed', async () => {
  renderOverview();
  await screen.findByText('Everyday Chequing');

  expect(screen.getByText(/Balances as of/).textContent).toContain(
    formatDate(ASOF, { year: true }),
  );

  const accountsPanel = panel('Accounts');
  expect(within(accountsPanel).getByText(`${formatMoney(367400)} left of the limit`)).toBeTruthy();
  expect(within(accountsPanel).getByText('—')).toBeTruthy();

  const totals = within(accountsPanel).getByRole('status').textContent;
  expect(totals).toContain(`${formatMoney(4085820)} across 3 CAD accounts`);
  expect(totals).toContain(`${formatMoney(240000, 'USD')} across 1 USD account`);
  expect(totals).toContain('never summed');
});

test('spending shows the five biggest expenses, largest first, and no income row', async () => {
  renderOverview();
  await screen.findByText('Rent');

  const rows = rowsOf(/^Spending/);
  expect(rows).toHaveLength(5);
  expect(rows[0]).toContain('Rent');
  expect(rows[1]).toContain('Groceries');
  expect(rows[2]).toContain('Utilities');
  expect(rows[3]).toContain('Dining out');
  expect(rows[4]).toContain('Transport');
  expect(rows.join()).not.toContain('Gifts');
  expect(within(panel(/^Spending/)).queryByText('Salary')).toBeNull();
  expect(rows[2]).toContain('over budget');
});

test('an income row is never a spending row, whatever else the month holds', async () => {
  renderOverview({
    '/reports/monthly-expenses': () => ({
      body: report([
        categoryTotals({ categoryId: 'cat_rent', name: 'Rent', outflow: 215000 }),
        categoryTotals({
          categoryId: 'cat_salary',
          name: 'Salary',
          kind: 'income',
          outflow: 0,
          inflow: 436800,
          net: 436800,
        }),
      ]),
    }),
  });
  await screen.findByText('Rent');

  expect(rowsOf(/^Spending/)).toHaveLength(1);
  expect(within(panel(/^Spending/)).queryByText('Salary')).toBeNull();
});

test('upcoming shows only the dates still waiting on a decision, earliest first', async () => {
  renderOverview();
  await screen.findByText(/Hydro/);

  const rows = rowsOf('Upcoming');
  expect(rows).toHaveLength(3);
  expect(rows[0]).toContain('Hydro');
  expect(rows[0]).toContain('overdue');
  expect(rows[1]).toContain('Gym membership');
  expect(rows[2]).toContain('Salary');
  expect(rows.join()).not.toContain('Rent');
  expect(rows.join()).not.toContain('Meal kit');

  expect(within(panel('Upcoming')).getByRole('status').textContent).toContain('1 overdue');
});

test('the projection names the balance it ends on, and says when it dips below zero', async () => {
  renderOverview({
    '/projections/budget': () => ({
      body: projection({
        goesNegative: true,
        lowestPoint: { key: '2026-09', date: '2026-09-30', balance: -18355 },
      }),
    }),
  });
  await screen.findByText(/Goes negative on commitments alone/);

  const projectionPanel = panel(/^Projection/);
  expect(within(projectionPanel).getByText(formatMoney(-18355))).toBeTruthy();
  expect(within(projectionPanel).getAllByText(formatMoney(4717738)).length).toBeGreaterThan(0);
});

test('a panel that fails takes nothing else down with it', async () => {
  const { onGo } = renderOverview({
    '/reports/monthly-expenses': () => ({
      status: 500,
      body: { error: { code: 'SIMULATED_ERROR', message: 'No report today.' } },
    }),
  });

  expect(await screen.findByText('Could not load the month — SIMULATED_ERROR')).toBeTruthy();
  expect(await screen.findByText('Everyday Chequing')).toBeTruthy();
  expect(screen.getByText(/Hydro/)).toBeTruthy();

  fireEvent.click(within(panel(/^Spending/)).getByRole('button', { name: /Full report/ }));
  expect(onGo).toHaveBeenCalledWith('Reports');
});
