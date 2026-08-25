import { formatDate, toIsoDate } from '@pfm/ui';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';

import { Transactions } from './Transactions';
import { account, listMeta, transaction } from '@test/fixtures';
import { renderScreen, stubFetch } from '@test/harness';

const ACCOUNTS = {
  data: [
    account({ id: 'acc_chequing', name: 'Everyday Chequing' }),
    account({ id: 'acc_visa', name: 'Visa', type: 'credit_card', creditLimit: 500000 }),
  ],
  meta: { total: 2, asOf: '2026-08-24', totalsByCurrency: {} },
};

const TRANSACTIONS = {
  data: [
    transaction({ id: 'txn_1', date: '2026-08-14', amount: -4599, description: 'Coffee' }),
    transaction({ id: 'txn_2', date: '2026-08-02', amount: 320000, description: 'Salary' }),
  ],
  meta: listMeta(2),
};

function renderTransactions() {
  const stub = stubFetch({
    '/transactions': () => ({ body: TRANSACTIONS }),
    '/accounts': () => ({ body: ACCOUNTS }),
  });
  renderScreen(<Transactions />);
  return stub;
}

const params = (stub: ReturnType<typeof stubFetch>) => stub.lastTo('/transactions')?.params;

/**
 * The day cell for a date in the currently shown month. The picker opens on
 * today, and the calendar labels each day in full so a screen reader hears the
 * month — which is what makes it addressable here.
 */
function pickDay(pickerLabel: string, date: Date) {
  fireEvent.click(screen.getByRole('button', { name: pickerLabel }));
  fireEvent.click(
    screen.getByRole('button', { name: formatDate(toIsoDate(date), { year: true }) }),
  );
}

const dayOfThisMonth = (day: number) => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), day);
};

test('every filter is a query param, and nothing is filtered in the client', async () => {
  const stub = renderTransactions();

  await screen.findByText('Coffee');

  // Both rows came back and both are rendered: the client is not sifting them.
  expect(screen.getByText('Salary')).toBeTruthy();
  expect(params(stub)?.get('pageSize')).toBe('8');
  expect(params(stub)?.get('sort')).toBe('-date,-createdAt');
  expect(params(stub)?.get('include')).toBe('account,category');
});

test('an unset date range is absent from the request, not sent empty', async () => {
  const stub = renderTransactions();

  await screen.findByText('Coffee');

  // `?from=` is a different request from no `from` at all, and this API is strict.
  expect(params(stub)?.has('from')).toBe(false);
  expect(params(stub)?.has('to')).toBe(false);
});

test('picking a start date sends a full date, not a month', async () => {
  const stub = renderTransactions();
  await screen.findByText('Coffee');

  const fifteenth = dayOfThisMonth(15);
  pickDay('From date', fifteenth);

  await waitFor(() => {
    expect(params(stub)?.get('from')).toBe(toIsoDate(fifteenth));
    // The other end stays open: one date is a bound, not a range.
    expect(params(stub)?.has('to')).toBe(false);
  });
});

test('both ends can be set, and the range goes out inclusive', async () => {
  const stub = renderTransactions();
  await screen.findByText('Coffee');

  const from = dayOfThisMonth(3);
  const to = dayOfThisMonth(21);
  pickDay('From date', from);
  pickDay('To date', to);

  await waitFor(() => {
    expect(params(stub)?.get('from')).toBe(toIsoDate(from));
    expect(params(stub)?.get('to')).toBe(toIsoDate(to));
  });
});

test('the To picker cannot be set before the From date', async () => {
  renderTransactions();
  await screen.findByText('Coffee');

  pickDay('From date', dayOfThisMonth(15));

  fireEvent.click(screen.getByRole('button', { name: 'To date' }));
  const earlier = screen.getByRole('button', {
    name: formatDate(toIsoDate(dayOfThisMonth(10)), { year: true }),
  });

  // An inverted range is not a validation message to write — it is a day the
  // calendar will not offer.
  expect((earlier as HTMLButtonElement).disabled).toBe(true);
});

test('a running balance is asked for only once a single account is chosen', async () => {
  const stub = renderTransactions();
  await screen.findByText('Coffee');

  // Across accounts the column has no meaning, and asking anyway is a 400.
  expect(params(stub)?.has('withRunningBalance')).toBe(false);

  fireEvent.change(screen.getByLabelText('Account'), { target: { value: 'acc_visa' } });

  await waitFor(() => {
    expect(params(stub)?.get('accountId')).toBe('acc_visa');
    expect(params(stub)?.get('withRunningBalance')).toBe('true');
  });
});

test('changing a filter goes back to the first page', async () => {
  const stub = renderTransactions();
  await screen.findByText('Coffee');

  fireEvent.click(screen.getByRole('radio', { name: 'Outflow' }));

  await waitFor(() => {
    expect(params(stub)?.get('direction')).toBe('outflow');
    // Page 3 of the old filter is not page 3 of the new one.
    expect(params(stub)?.get('page')).toBe('1');
  });
});
