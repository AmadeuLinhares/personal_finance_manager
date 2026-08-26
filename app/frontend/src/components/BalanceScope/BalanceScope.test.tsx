import { formatDate, formatMoney, toIsoDate } from '@pfm/ui';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { expect, test } from 'vitest';

import { BalanceScope } from './BalanceScope';
import { account } from '@test/fixtures';
import { renderScreen, stubFetch } from '@test/harness';

const balances = (available: number) => ({
  data: [account({ id: 'acc_chequing', name: 'Everyday Chequing' })],
  meta: {
    total: 1,
    asOf: toIsoDate(new Date()),
    totalsByCurrency: {
      CAD: { currency: 'CAD', posted: available, pending: 0, available, accountCount: 4 },
    },
  },
});

const today = new Date();
const dayOfThisMonth = (day: number) => new Date(today.getFullYear(), today.getMonth(), day);
const dayLabel = (date: Date) => formatDate(toIsoDate(date), { year: true });

function Shell() {
  const [asOf, setAsOf] = useState(toIsoDate(today));
  return <BalanceScope value={asOf} onChange={setAsOf} />;
}

function renderScope(overrides: Parameters<typeof stubFetch>[0] = {}) {
  const stub = stubFetch({
    '/accounts': () => ({ body: balances(4218420) }),
    ...overrides,
  });
  renderScreen(<Shell />);
  return stub;
}

test('asks for the balance as of today, with the balances attached', async () => {
  const stub = renderScope();

  await screen.findByText(formatMoney(4218420));

  const params = stub.lastTo('/accounts')?.params;
  expect(params?.get('asOf')).toBe(toIsoDate(today));
  expect(params?.get('includeBalances')).toBe('true');
});

test('a past date is a new request, not a client-side recalculation', async () => {
  const stub = renderScope();
  await screen.findByText(formatMoney(4218420));

  const first = dayOfThisMonth(1);
  fireEvent.click(screen.getByRole('button', { name: /^Balance as of/ }));
  fireEvent.click(screen.getByRole('button', { name: dayLabel(first) }));

  await waitFor(() => {
    expect(stub.lastTo('/accounts')?.params.get('asOf')).toBe(toIsoDate(first));
  });
});

test('tomorrow is not a balance anyone can have', async () => {
  renderScope();
  await screen.findByText(formatMoney(4218420));

  fireEvent.click(screen.getByRole('button', { name: /^Balance as of/ }));
  const tomorrow = screen.getByRole('button', {
    name: dayLabel(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)),
  });

  expect((tomorrow as HTMLButtonElement).disabled).toBe(true);
});

test('a failed balance says so rather than showing a stale or blank figure', async () => {
  renderScope({
    '/accounts': () => ({
      status: 500,
      body: { error: { code: 'INTERNAL_ERROR', message: 'No balances today.' } },
    }),
  });

  expect(await screen.findByText('unavailable')).toBeTruthy();
});
