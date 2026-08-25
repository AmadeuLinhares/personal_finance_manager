import { type MonthlyExpensesReport } from '@pfm/contracts';
import { formatMoney, toIsoMonth } from '@pfm/ui';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { expect, test } from 'vitest';

import { Reports } from './Reports';
import { category, categoryTotals, listMeta } from '@test/fixtures';
import { renderScreen, stubFetch } from '@test/harness';

/*
 * The rows are built so that the roll-up decision actually changes the answer:
 * Utilities is over its own budget, but Housing — Rent plus Utilities, against
 * both their budgets — is not. "Utilities went over" and "Housing is fine" are
 * both true, which is exactly why the screen lets the user choose and does not
 * pick for them.
 */
const ROWS = [
  categoryTotals({
    categoryId: 'cat_rent',
    name: 'Rent',
    parentId: 'cat_housing',
    outflow: 200000,
    budget: 215000,
  }),
  categoryTotals({
    categoryId: 'cat_utilities',
    name: 'Utilities',
    parentId: 'cat_housing',
    outflow: 20000,
    budget: 18000,
    overBudget: true,
  }),
  categoryTotals({ categoryId: 'cat_groceries', name: 'Groceries', outflow: 60725, budget: 90000 }),
  // categoryId null is how the API reports uncategorised spend — a row, not a bucket.
  categoryTotals({ name: 'Uncategorised', outflow: 11382 }),
  // Income: it belongs in the totals, never in a list of expenses.
  categoryTotals({
    categoryId: 'cat_salary',
    name: 'Salary',
    kind: 'income',
    outflow: 0,
    inflow: 436800,
    net: 436800,
  }),
];

const OUTFLOW = 292107;

const report = (): MonthlyExpensesReport => {
  const month = toIsoMonth(new Date());
  return {
    range: { from: month, to: month, startDate: `${month}-01`, endDate: `${month}-28` },
    currency: 'CAD',
    scope: {
      accountIds: ['acc_chequing', 'acc_visa'],
      includesPending: true,
      includesTransfers: false,
      projectIds: null,
    },
    months: [
      {
        month,
        start: `${month}-01`,
        end: `${month}-28`,
        inflow: 436800,
        outflow: OUTFLOW,
        net: 436800 - OUTFLOW,
        transactionCount: 12,
        byCategory: ROWS,
      },
    ],
    totals: {
      inflow: 436800,
      outflow: OUTFLOW,
      net: 436800 - OUTFLOW,
      transactionCount: 12,
      monthCount: 1,
      averageMonthlyOutflow: OUTFLOW,
      byCategory: ROWS,
    },
    excluded: {
      transferLegs: 8,
      otherCurrencyTransactions: 2,
      outOfScopeTransactions: 0,
      pendingTransactions: 0,
    },
  };
};

const CATEGORIES = {
  data: [
    category({ id: 'cat_housing', name: 'Housing' }),
    category({ id: 'cat_rent', name: 'Rent', parentId: 'cat_housing', monthlyBudget: 215000 }),
    category({ id: 'cat_utilities', name: 'Utilities', parentId: 'cat_housing' }),
  ],
  meta: listMeta(3),
};

function renderReports(overrides: Parameters<typeof stubFetch>[0] = {}) {
  const stub = stubFetch({
    '/reports/monthly-expenses': () => ({ body: report() }),
    '/categories': () => ({ body: CATEGORIES }),
    ...overrides,
  });
  renderScreen(<Reports />);
  return stub;
}

/**
 * The bar row that starts with this name. Throwing when it is absent is what
 * makes it usable inside `waitFor`, which retries until it stops throwing.
 */
const rowNamed = (name: string): HTMLElement => {
  const found = screen.getAllByRole('listitem').find((item) => item.textContent.startsWith(name));
  if (!found) throw new Error(`No category row starting with "${name}"`);
  return found;
};

test('lists every category that spent, and leaves income out of the bars', async () => {
  renderReports();

  await screen.findByText('Rent');
  expect(screen.getAllByRole('listitem')).toHaveLength(4);

  // Salary has an inflow and no outflow: it is not an expense row.
  expect(screen.queryByText('Salary')).toBeNull();
  // …but it is still in the month's inflow.
  expect(screen.getByText(formatMoney(436800))).toBeTruthy();
});

test('an unbudgeted row says so instead of inventing a budget', async () => {
  renderReports();

  const row = await waitFor(() => rowNamed('Uncategorised'));

  expect(within(row).getByText('unbudgeted')).toBeTruthy();
});

test('rolling up sums the children into the parent, budgets included', async () => {
  renderReports();

  const rollUp = await screen.findByRole('radio', { name: 'Rolled up' });
  await waitFor(() => {
    // The option waits for the category names, which are a second request.
    expect((rollUp as HTMLInputElement).disabled).toBe(false);
  });

  // Leaf: the child is over its own budget.
  expect(within(rowNamed('Utilities')).getByText('over budget')).toBeTruthy();

  fireEvent.click(rollUp);

  const housing = await waitFor(() => rowNamed('Housing'));

  // 200000 + 20000 spent, against 215000 + 18000 budgeted.
  expect(within(housing).getByText(formatMoney(220000))).toBeTruthy();
  expect(within(housing).getByText(formatMoney(233000))).toBeTruthy();
  // And the parent is not over, even though one child is.
  expect(within(housing).queryByText('over budget')).toBeNull();

  expect(screen.queryByText('Rent')).toBeNull();
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
});

test('names what the report excluded, and only what it actually excluded', async () => {
  renderReports();

  const excluded = await screen.findByText(/Excluded from this report/);
  expect(excluded.textContent).toContain('8 transfer legs');
  expect(excluded.textContent).toContain('2 other-currency');
  // Both of these are zero — a report should not pad itself with nothing.
  expect(excluded.textContent).not.toContain('out of scope');
  expect(excluded.textContent).not.toContain('pending');
});

test('asks for a single month, and follows the currency switch', async () => {
  const stub = renderReports();
  const month = toIsoMonth(new Date());

  await waitFor(() => {
    const params = stub.lastTo('/reports/monthly-expenses')?.params;
    expect(params?.get('from')).toBe(month);
    expect(params?.get('to')).toBe(month);
    expect(params?.get('currency')).toBe('CAD');
  });

  fireEvent.click(screen.getByRole('radio', { name: 'USD' }));

  await waitFor(() => {
    expect(stub.lastTo('/reports/monthly-expenses')?.params.get('currency')).toBe('USD');
  });
});

test('surfaces the API error code instead of an empty report', async () => {
  renderReports({
    '/reports/monthly-expenses': () => ({
      status: 500,
      body: { error: { code: 'INTERNAL_ERROR', message: 'The report could not be built.' } },
    }),
  });

  const alert = await screen.findByRole('alert');
  expect(alert.textContent).toContain('INTERNAL_ERROR');
  expect(alert.textContent).toContain('The report could not be built.');
  expect(within(alert).getByRole('button', { name: 'Retry' })).toBeTruthy();
});

test('announces what is on screen, since aria-busy alone says nothing', async () => {
  renderReports();

  // The skeleton owns a role=status of its own while loading, so wait for the
  // one that describes the report rather than the wait.
  await waitFor(() => {
    const status = screen.getByRole('status');
    expect(status.textContent).toContain('4 categories');
    expect(status.textContent).toContain('as reported');
  });
});
