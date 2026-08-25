import { type BudgetProjection, type Occurrence, type UpcomingResponse } from '@pfm/contracts';
import { formatMoney, toIsoDate } from '@pfm/ui';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { expect, test } from 'vitest';

import { Planning } from './Planning';
import { renderScreen, stubFetch } from '@test/harness';

const noop = () => undefined;

const day = (offset: number) => {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset));
};

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
  occurrence({ scheduledItemId: 'sch_gym', name: 'Gym membership', date: day(6), amount: -4500 }),
  occurrence({
    scheduledItemId: 'sch_meal_kit',
    name: 'Meal kit',
    date: day(9),
    amount: -6900,
    status: 'skipped',
  }),
];

const upcoming = (occurrences = OCCURRENCES): UpcomingResponse => ({
  range: { from: day(-24), to: day(90) },
  occurrences,
  totals: {
    inflow: 218400,
    outflow: 238880,
    net: -20480,
    occurrenceCount: occurrences.length,
    overdueCount: occurrences.filter((item) => item.status === 'overdue').length,
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
  range: { from: day(0), to: day(90) },
  granularity: 'month',
  currency: 'CAD',
  asOf: day(0),
  scope: { accountIds: ['acc_chequing'] },
  startingBalance: 4218420,
  endingBalance: 4717738,
  lowestPoint: { key: '2026-09', date: '2026-09-30', balance: 4058526 },
  goesNegative: false,
  series: [bucket('2026-08', 4310270), bucket('2026-09', 4058526), bucket('2026-10', 4717738)],
  assumptions: {
    actualsThrough: day(0),
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

function renderPlanning(overrides: Parameters<typeof stubFetch>[0] = {}) {
  const stub = stubFetch({
    '/scheduled-items/occurrences': () => ({ body: upcoming() }),
    '/projections/budget': () => ({ body: projection() }),
    '/scheduled-items/sch_hydro/post': () => ({ body: { data: {} } }),
    '/scheduled-items/sch_hydro/skip': () => ({ body: { data: {} } }),
    '/scheduled-items/sch_meal_kit/unskip': () => ({ body: { data: {} } }),
    ...overrides,
  });
  renderScreen(<Planning onSchedule={noop} />);
  return stub;
}

const rowFor = (name: string): HTMLElement => {
  const found = screen.getAllByRole('row').find((row) => row.textContent.includes(name));
  if (!found) throw new Error(`No occurrence row for "${name}"`);
  return found;
};

test('offers actions only on the dates that still have one', async () => {
  renderPlanning();
  await screen.findByText('Hydro');

  // Overdue and scheduled are open: they can be posted or skipped.
  expect(within(rowFor('Hydro')).getByRole('button', { name: /^Post/ })).toBeTruthy();
  expect(within(rowFor('Gym membership')).getByRole('button', { name: /^Skip/ })).toBeTruthy();

  // A skipped date can come back; a posted one is history and has no action.
  expect(within(rowFor('Meal kit')).getByRole('button', { name: /^Undo skip/ })).toBeTruthy();
  expect(within(rowFor('Rent')).queryByRole('button')).toBeNull();
});

test('each action names its own row, so thirty buttons are not all "Post"', async () => {
  renderPlanning();
  await screen.findByText('Hydro');

  const post = within(rowFor('Hydro')).getByRole('button', { name: /^Post/ });
  expect(post.textContent).toContain('Hydro');
  expect(post.textContent).toContain('due');
});

test('posting sends the occurrence date to the rule that generated it', async () => {
  const stub = renderPlanning();
  await screen.findByText('Hydro');

  fireEvent.click(within(rowFor('Hydro')).getByRole('button', { name: /^Post/ }));

  await waitFor(() => {
    const posts = stub.matching('/sch_hydro/post');
    // Throws while the array is empty, which is what makes waitFor retry.
    expect(posts).toHaveLength(1);
    const [call] = posts;
    expect(call.method).toBe('POST');
    // A rule plus a date: neither identifies an occurrence on its own.
    expect(call.body).toEqual({ date: day(-2) });
  });
});

test('skipping goes to skip, and undoing goes to unskip', async () => {
  const stub = renderPlanning();
  await screen.findByText('Hydro');

  fireEvent.click(within(rowFor('Hydro')).getByRole('button', { name: /^Skip/ }));
  await waitFor(() => {
    expect(stub.matching('/sch_hydro/skip')).toHaveLength(1);
  });

  fireEvent.click(within(rowFor('Meal kit')).getByRole('button', { name: /^Undo skip/ }));
  await waitFor(() => {
    expect(stub.matching('/sch_meal_kit/unskip')).toHaveLength(1);
  });
});

test('a refused post shows the API code instead of failing silently', async () => {
  renderPlanning({
    '/scheduled-items/sch_hydro/post': () => ({
      status: 409,
      body: { error: { code: 'CONFLICT', message: 'That occurrence was already posted.' } },
    }),
  });
  await screen.findByText('Hydro');

  fireEvent.click(within(rowFor('Hydro')).getByRole('button', { name: /^Post/ }));

  const alert = await screen.findByText(/CONFLICT/);
  expect(alert.textContent).toContain('That occurrence was already posted.');
});

test('the horizon moves the end of both windows at once', async () => {
  const stub = renderPlanning();
  await screen.findByText('Hydro');

  const threeMonths = stub.lastTo('/scheduled-items/occurrences')?.params.get('to');
  expect(stub.lastTo('/projections/budget')?.params.get('to')).toBe(threeMonths);

  fireEvent.click(screen.getByRole('radio', { name: '6 months' }));

  await waitFor(() => {
    const sixMonths = stub.lastTo('/scheduled-items/occurrences')?.params.get('to');
    expect(sixMonths).not.toBe(threeMonths);
    // One horizon, one meaning: the list and the line must agree.
    expect(stub.lastTo('/projections/budget')?.params.get('to')).toBe(sixMonths);
  });
});

test('the window opens at the first of the month, not at today', async () => {
  const stub = renderPlanning();
  await screen.findByText('Hydro');

  const now = new Date();
  // What already went out this month is the context for what is left of it.
  expect(stub.lastTo('/scheduled-items/occurrences')?.params.get('from')).toBe(
    toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
  );
});

test('the chart draws today as the seam: before it actual, after it forecast', async () => {
  renderPlanning();
  await screen.findByText('Hydro');

  // TrendChart repeats its series as a screen-reader table, which is where the
  // seam is assertable — a dashed stroke is not.
  const now = within(screen.getByRole('row', { name: /^Now/ }));
  expect(now.getByText(formatMoney(4218420))).toBeTruthy();
  expect(now.queryByText(/forecast/)).toBeNull();

  // Every bucket after it is forecast, including the one today falls in: its
  // closing balance already contains scheduled money that has not happened.
  expect(screen.getByRole('row', { name: /^Aug/ }).textContent).toContain('(forecast)');
  expect(screen.getByRole('row', { name: /^Sep/ }).textContent).toContain('(forecast)');
});

test('a balance heading below zero is called out, with where it happens', async () => {
  renderPlanning({
    '/projections/budget': () => ({
      body: projection({
        goesNegative: true,
        lowestPoint: { key: '2026-10', date: '2026-10-31', balance: -128400 },
      }),
    }),
  });

  const warning = await screen.findByText(/goes negative/);
  expect(warning.textContent).toContain(formatMoney(-128400));
  expect(warning.textContent).toContain('31 Oct 2026');
});

test('a failed projection does not take the occurrence list down with it', async () => {
  renderPlanning({
    '/projections/budget': () => ({
      status: 500,
      body: { error: { code: 'INTERNAL_ERROR', message: 'No forecast today.' } },
    }),
  });

  // The two queries are independent, and so are their failures.
  expect(await screen.findByText(/Could not load the projection/)).toBeTruthy();
  expect(screen.getByText('Hydro')).toBeTruthy();
  expect(within(rowFor('Hydro')).getByRole('button', { name: /^Post/ })).toBeTruthy();
});
