import { formatMoney, toIsoDate } from '@pfm/ui';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { TransactionDialog } from './TransactionDialog';
import { account, category, listMeta } from '@test/fixtures';
import { renderScreen, stubFetch } from '@test/harness';

const button = (name: string) => {
  const element = screen.getByRole('button', { name });
  if (!(element instanceof HTMLButtonElement)) throw new Error(`not a button: ${name}`);
  return element;
};

const input = (label: string) => {
  const element = screen.getByLabelText(label);
  if (!(element instanceof HTMLInputElement)) throw new Error(`not an input: ${label}`);
  return element;
};

const ACCOUNTS = [
  account({ id: 'acc_chequing', name: 'Everyday Chequing' }),
  account({ id: 'acc_savings', name: 'Rainy Day' }),
  account({ id: 'acc_usd', name: 'USD Savings', currency: 'USD' }),
];

const accounts = () => ({
  data: ACCOUNTS,
  meta: { total: ACCOUNTS.length, asOf: toIsoDate(new Date()), totalsByCurrency: {} },
});

const categories = () => ({
  data: [category({ id: 'cat_groceries', name: 'Groceries' })],
  meta: { ...listMeta(1), kinds: { expense: 1, income: 0 } },
});

function renderDialog(overrides: Parameters<typeof stubFetch>[0] = {}) {
  const onClose = vi.fn();
  const stub = stubFetch({
    '/accounts': () => ({ body: accounts() }),
    '/categories': () => ({ body: categories() }),
    '/transactions': () => ({ body: { data: { id: 'txn_new' } } }),
    '/transfers': () => ({ body: { data: { transferId: 'tr_new' } } }),
    ...overrides,
  });
  renderScreen(<TransactionDialog open onClose={onClose} />);
  return { stub, onClose };
}

async function ready() {
  await waitFor(() => {
    expect(screen.getByRole('option', { name: /Everyday Chequing/ })).toBeTruthy();
  });
}

const fill = (description: string, minorUnits: string) => {
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: description } });
  fireEvent.change(screen.getByLabelText('Amount'), { target: { value: minorUnits } });
};

const save = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
};

test('an expense leaves the account, so the amount it posts is negative', async () => {
  const { stub, onClose } = renderDialog();
  await ready();

  fill('Metro Plus', '9512');
  save();

  await waitFor(() => {
    expect(stub.lastTo('/transactions')?.body).toBeTruthy();
  });
  expect(stub.lastTo('/transactions')?.body).toMatchObject({
    accountId: 'acc_chequing',
    amount: -9512,
    description: 'Metro Plus',
    status: 'posted',
  });
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('income is the same form with the sign the other way up', async () => {
  const { stub } = renderDialog();
  await ready();

  fireEvent.click(screen.getByRole('radio', { name: 'Income' }));
  fill('Northwind Studio', '436800');
  save();

  await waitFor(() => {
    expect(stub.lastTo('/transactions')?.body).toMatchObject({ amount: 436800 });
  });
});

test('uncategorised posts null, never an empty string', async () => {
  const { stub } = renderDialog();
  await ready();

  fill('Something', '1000');
  save();

  await waitFor(() => {
    expect(stub.lastTo('/transactions')?.body).toBeTruthy();
  });
  expect((stub.lastTo('/transactions')?.body as { categoryId: unknown }).categoryId).toBeNull();
});

test('a category chosen is a category sent', async () => {
  const { stub } = renderDialog();
  await ready();

  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'cat_groceries' } });
  fill('Metro Plus', '1000');
  save();

  await waitFor(() => {
    expect(stub.lastTo('/transactions')?.body).toMatchObject({ categoryId: 'cat_groceries' });
  });
});

test('a transfer is one request with two accounts and the positive magnitude', async () => {
  const { stub, onClose } = renderDialog();
  await ready();

  fireEvent.click(screen.getByRole('radio', { name: 'Transfer' }));
  await waitFor(() => {
    expect(screen.getByLabelText('To account')).toBeTruthy();
  });
  fireEvent.change(screen.getByLabelText('To account'), { target: { value: 'acc_savings' } });
  fill('Move to savings', '50000');
  save();

  await waitFor(() => {
    expect(stub.lastTo('/transfers')?.body).toBeTruthy();
  });
  expect(stub.lastTo('/transfers')?.body).toMatchObject({
    fromAccountId: 'acc_chequing',
    toAccountId: 'acc_savings',
    amount: 50000,
  });
  expect(stub.matching('/api/transactions')).toHaveLength(0);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('a cross-currency transfer is refused before it is sent', async () => {
  const { stub } = renderDialog();
  await ready();

  fireEvent.click(screen.getByRole('radio', { name: 'Transfer' }));
  await waitFor(() => {
    expect(screen.getByLabelText('To account')).toBeTruthy();
  });
  fireEvent.change(screen.getByLabelText('To account'), { target: { value: 'acc_usd' } });

  await waitFor(() => {
    expect(screen.getByText(/cross-currency transfers are refused/)).toBeTruthy();
  });
  expect(button('Save').disabled).toBe(true);
  expect(stub.matching('/api/transfers')).toHaveLength(0);
});

test('the form refuses its own invalid input without asking the server', async () => {
  const { stub } = renderDialog();
  await ready();

  save();

  await waitFor(() => {
    expect(screen.getByText(/description is required/)).toBeTruthy();
  });
  expect(screen.getByText(/amount must be a positive value/)).toBeTruthy();
  expect(stub.matching('/api/transactions')).toHaveLength(0);
});

test('a 422 detail lands under the field that caused it, not in a banner', async () => {
  renderDialog({
    '/transactions': () => ({
      status: 422,
      body: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid body',
          details: [{ path: 'amount', message: 'must be a non-zero integer' }],
        },
      },
    }),
  });
  await ready();

  fill('Metro Plus', '1000');
  save();

  const message = await screen.findByText(/VALIDATION_ERROR — must be a non-zero integer/);
  const described = screen.getByLabelText('Amount').getAttribute('aria-describedby');
  expect(described).toBe(message.id);
  expect(screen.getByLabelText('Amount').getAttribute('aria-invalid')).toBe('true');
});

test('a detail for a field this form does not have is shown rather than swallowed', async () => {
  renderDialog({
    '/transactions': () => ({
      status: 422,
      body: {
        error: {
          code: 'INVALID_REFERENCE',
          message: 'Invalid body',
          details: [{ path: 'projectId', message: 'no such project' }],
        },
      },
    }),
  });
  await ready();

  fill('Metro Plus', '1000');
  save();

  expect(await screen.findByText('INVALID_REFERENCE — projectId: no such project')).toBeTruthy();
});

test('a failure with no details at all still carries its code', async () => {
  const { onClose } = renderDialog({
    '/transactions': () => ({
      status: 409,
      body: { error: { code: 'CONFLICT', message: 'Already posted.' } },
    }),
  });
  await ready();

  fill('Metro Plus', '1000');
  save();

  expect(await screen.findByText('CONFLICT — Already posted.')).toBeTruthy();
  expect(onClose).not.toHaveBeenCalled();
  expect(input('Amount').value).toBe(formatMoney(1000).replace('$', '').trim());
});

test('with no accounts to post to, the dialog says so and refuses to save', async () => {
  renderDialog({
    '/accounts': () => ({
      status: 500,
      body: { error: { code: 'INTERNAL_ERROR', message: 'No accounts today.' } },
    }),
  });

  expect(await screen.findByText(/accounts could not be loaded/)).toBeTruthy();
  expect(button('Save').disabled).toBe(true);
});
