import { formatMoney, toIsoDate } from '@pfm/ui';
import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import App from './App';
import { account, category, listMeta, transaction } from '@test/fixtures';
import { renderScreen, stubFetch } from '@test/harness';

const TODAY = toIsoDate(new Date());
const MONTH = TODAY.slice(0, 7);

const accounts = () => ({
  data: [account({ id: 'acc_chequing', name: 'Everyday Chequing' })],
  meta: {
    total: 1,
    asOf: TODAY,
    totalsByCurrency: {
      CAD: { currency: 'CAD', posted: 4218420, pending: 0, available: 4218420, accountCount: 1 },
    },
  },
});

const report = () => ({
  range: { from: MONTH, to: MONTH, startDate: `${MONTH}-01`, endDate: `${MONTH}-28` },
  currency: 'CAD',
  scope: { accountIds: [], includesPending: true, includesTransfers: false, projectIds: null },
  months: [
    {
      month: MONTH,
      start: `${MONTH}-01`,
      end: `${MONTH}-28`,
      inflow: 0,
      outflow: 0,
      net: 0,
      transactionCount: 0,
      byCategory: [],
    },
  ],
  totals: {
    inflow: 0,
    outflow: 0,
    net: 0,
    transactionCount: 0,
    monthCount: 1,
    averageMonthlyOutflow: 0,
    byCategory: [],
  },
  excluded: {
    transferLegs: 0,
    otherCurrencyTransactions: 0,
    outOfScopeTransactions: 0,
    pendingTransactions: 0,
  },
});

const occurrences = () => ({
  range: { from: `${MONTH}-01`, to: TODAY },
  occurrences: [],
  totals: { inflow: 0, outflow: 0, net: 0, occurrenceCount: 0, overdueCount: 0 },
});

const projection = () => ({
  range: { from: TODAY, to: TODAY },
  granularity: 'month',
  currency: 'CAD',
  asOf: TODAY,
  scope: { accountIds: [] },
  startingBalance: 4218420,
  endingBalance: 4218420,
  lowestPoint: null,
  goesNegative: false,
  series: [],
  assumptions: {
    actualsThrough: TODAY,
    forecastFrom: TODAY,
    includesScheduled: true,
    includesPendingInStartingBalance: true,
    excludesTransfers: true,
    includesEstimatedDiscretionary: false,
    monthlyCategoryBudgetTotal: null,
    scheduledItemIds: [],
    note: 'Commitments only.',
  },
});

function renderApp() {
  const stub = stubFetch({
    '/accounts': () => ({ body: accounts() }),
    '/categories': () => ({
      body: { data: [category({ id: 'cat_a', name: 'Groceries' })], meta: listMeta(1) },
    }),
    '/transactions': () => ({
      body: {
        data: [transaction({ id: 'txn_1', date: TODAY, amount: -4599, description: 'Metro Plus' })],
        meta: listMeta(1),
      },
    }),
    '/reports/monthly-expenses': () => ({ body: report() }),
    '/scheduled-items/occurrences': () => ({ body: occurrences() }),
    '/projections/budget': () => ({ body: projection() }),
  });
  renderScreen(<App />);
  return stub;
}

test('the app opens on the Overview, with the header owning the balance', async () => {
  renderApp();

  expect(screen.getByRole('heading', { name: 'Overview' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Overview' }).getAttribute('aria-current')).toBe(
    'page',
  );

  expect(await screen.findAllByText(formatMoney(4218420))).toHaveLength(2);
});

test('the header and the Overview read one request, not two answers', async () => {
  const stub = renderApp();
  await screen.findByText('Everyday Chequing');

  const scoped = stub.matching('/api/accounts').filter((call) => call.params.has('asOf'));
  expect(scoped).toHaveLength(1);
  expect(scoped[0].params.get('asOf')).toBe(TODAY);
});

test('the nav moves between the four screens', async () => {
  renderApp();

  fireEvent.click(screen.getByRole('button', { name: 'Transactions' }));
  expect(await screen.findByText('Metro Plus')).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'Reports' }));
  expect(screen.getByRole('heading', { name: 'Expenses by category' })).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'Planning' }));
  expect(screen.getByRole('heading', { name: /Bills, income/ })).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'Overview' }));
  expect(screen.getByRole('heading', { name: 'Overview' })).toBeTruthy();
});

test('Projects is not in the navigation at all', () => {
  renderApp();
  expect(screen.queryByRole('button', { name: 'Projects' })).toBeNull();
  expect(screen.queryByText(/not implemented/)).toBeNull();
});

test('an Overview panel sends you to the screen it previews', async () => {
  renderApp();
  await screen.findByText('Everyday Chequing');

  fireEvent.click(screen.getByRole('button', { name: /Open the ledger/ }));
  expect(await screen.findByText('Metro Plus')).toBeTruthy();
});

test('the header opens the transaction dialog', async () => {
  renderApp();

  fireEvent.click(screen.getByRole('button', { name: /New transaction/ }));
  expect(await screen.findByRole('dialog', { name: 'New transaction' })).toBeTruthy();
});

test('Planning opens the schedule dialog', async () => {
  renderApp();

  fireEvent.click(screen.getByRole('button', { name: 'Planning' }));
  fireEvent.click(screen.getByRole('button', { name: /Schedule item/ }));
  expect(await screen.findByRole('dialog', { name: 'Schedule item' })).toBeTruthy();
});
