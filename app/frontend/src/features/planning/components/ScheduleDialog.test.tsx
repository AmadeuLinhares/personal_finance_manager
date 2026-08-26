import { toIsoDate } from '@pfm/ui';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { ScheduleDialog } from './ScheduleDialog';
import { account, category, listMeta } from '@test/fixtures';
import { renderScreen, stubFetch } from '@test/harness';

const button = (name: string) => {
  const element = screen.getByRole('button', { name });
  if (!(element instanceof HTMLButtonElement)) throw new Error(`not a button: ${name}`);
  return element;
};

const ACCOUNTS = [
  account({ id: 'acc_chequing', name: 'Everyday Chequing' }),
  account({ id: 'acc_savings', name: 'Rainy Day' }),
];

const accounts = () => ({
  data: ACCOUNTS,
  meta: { total: ACCOUNTS.length, asOf: toIsoDate(new Date()), totalsByCurrency: {} },
});

const categories = () => ({
  data: [category({ id: 'cat_utilities', name: 'Utilities' })],
  meta: { ...listMeta(1), kinds: { expense: 1, income: 0 } },
});

function renderDialog(overrides: Parameters<typeof stubFetch>[0] = {}) {
  const onClose = vi.fn();
  const stub = stubFetch({
    '/accounts': () => ({ body: accounts() }),
    '/categories': () => ({ body: categories() }),
    '/scheduled-items': () => ({ body: { data: { id: 'sch_new' } } }),
    ...overrides,
  });
  renderScreen(<ScheduleDialog open onClose={onClose} />);
  return { stub, onClose };
}

async function ready() {
  await waitFor(() => {
    expect(screen.getByRole('option', { name: /Everyday Chequing/ })).toBeTruthy();
  });
}

const fill = (name: string, minorUnits: string) => {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('Amount'), { target: { value: minorUnits } });
};

const save = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Save item' }));
};

test('a bill is negative, and the sign comes from Kind rather than the amount field', async () => {
  const { stub, onClose } = renderDialog();
  await ready();

  fill('Gym membership', '4500');
  save();

  await waitFor(() => {
    expect(stub.lastTo('/scheduled-items')?.body).toBeTruthy();
  });
  expect(stub.lastTo('/scheduled-items')?.body).toMatchObject({
    name: 'Gym membership',
    kind: 'bill',
    amount: -4500,
    accountId: 'acc_chequing',
  });
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('income is the same rule with the sign the other way up', async () => {
  const { stub } = renderDialog();
  await ready();

  fireEvent.click(screen.getByRole('radio', { name: 'Income' }));
  fill('Salary', '436800');
  save();

  await waitFor(() => {
    expect(stub.lastTo('/scheduled-items')?.body).toMatchObject({
      kind: 'income',
      amount: 436800,
    });
  });
});

test('a rule is a frequency and a start date, and both go as chosen', async () => {
  const { stub } = renderDialog();
  await ready();

  fireEvent.change(screen.getByLabelText('Frequency'), { target: { value: 'quarterly' } });
  fill('Car insurance', '120000');
  save();

  await waitFor(() => {
    expect(stub.lastTo('/scheduled-items')?.body).toMatchObject({
      frequency: 'quarterly',
      startDate: toIsoDate(new Date()),
    });
  });
});

test('uncategorised posts null, and a chosen category posts its id', async () => {
  const { stub } = renderDialog();
  await ready();

  fill('Unlabelled', '1000');
  save();
  await waitFor(() => {
    expect(stub.lastTo('/scheduled-items')?.body).toBeTruthy();
  });
  expect((stub.lastTo('/scheduled-items')?.body as { categoryId: unknown }).categoryId).toBeNull();

  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'cat_utilities' } });
  fill('Hydro', '12480');
  save();
  await waitFor(() => {
    expect(stub.lastTo('/scheduled-items')?.body).toMatchObject({ categoryId: 'cat_utilities' });
  });
});

test('the form refuses its own invalid input without asking the server', async () => {
  const { stub } = renderDialog();
  await ready();

  save();

  await waitFor(() => {
    expect(screen.getByText(/name is required/)).toBeTruthy();
  });
  expect(screen.getByText(/amount cannot be zero/)).toBeTruthy();
  expect(stub.matching('/api/scheduled-items')).toHaveLength(0);
});

test('a 422 detail lands under the field that caused it', async () => {
  renderDialog({
    '/scheduled-items': () => ({
      status: 422,
      body: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid body',
          details: [{ path: 'startDate', message: 'must be a calendar date' }],
        },
      },
    }),
  });
  await ready();

  fill('Gym membership', '4500');
  save();

  const message = await screen.findByText(/VALIDATION_ERROR — must be a calendar date/);
  expect(screen.getByLabelText('Start date').getAttribute('aria-describedby')).toBe(message.id);
});

test('a failure with no details keeps its code and leaves the dialog open', async () => {
  const { onClose } = renderDialog({
    '/scheduled-items': () => ({
      status: 422,
      body: { error: { code: 'CURRENCY_MISMATCH', message: 'Account is in USD.' } },
    }),
  });
  await ready();

  fill('Gym membership', '4500');
  save();

  expect(await screen.findByText('CURRENCY_MISMATCH — Account is in USD.')).toBeTruthy();
  expect(onClose).not.toHaveBeenCalled();
});

test('with no accounts to attach the rule to, saving is refused', async () => {
  renderDialog({
    '/accounts': () => ({
      status: 500,
      body: { error: { code: 'INTERNAL_ERROR', message: 'No accounts today.' } },
    }),
  });

  await waitFor(() => {
    expect(button('Save item').disabled).toBe(true);
  });
});
