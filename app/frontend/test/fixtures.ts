import type { Account, Category, CategoryTotals, ListMeta, Transaction } from '@/http/api-types';

/**
 * Builders, not literals: a fixture that spells out all fourteen fields of an
 * Account buries the one field the test is about. Each takes the fields that
 * matter and fills the contract's rest.
 *
 * They are typed as the real response shapes on purpose — if the API's types
 * change under us, these stop compiling instead of quietly testing a shape the
 * server no longer sends.
 */
const STAMP = '2026-08-01T00:00:00.000Z';

export const account = (over: Partial<Account> & Pick<Account, 'id' | 'name'>): Account => ({
  type: 'checking',
  institution: null,
  currency: 'CAD',
  openingBalance: 0,
  creditLimit: null,
  color: '#475569',
  openedAt: '2025-01-01',
  archivedAt: null,
  createdAt: STAMP,
  updatedAt: STAMP,
  ...over,
});

export const category = (over: Partial<Category> & Pick<Category, 'id' | 'name'>): Category => ({
  kind: 'expense',
  parentId: null,
  monthlyBudget: null,
  color: '#475569',
  archivedAt: null,
  createdAt: STAMP,
  updatedAt: STAMP,
  ...over,
});

/** A report row. `net` follows `inflow - outflow` unless a test overrides it. */
export const categoryTotals = (
  over: Partial<CategoryTotals> & Pick<CategoryTotals, 'name' | 'outflow'>,
): CategoryTotals => ({
  categoryId: null,
  parentId: null,
  kind: 'expense',
  color: '#475569',
  inflow: 0,
  net: -over.outflow,
  transactionCount: 1,
  budget: null,
  overBudget: false,
  ...over,
});

export const transaction = (
  over: Partial<Transaction> & Pick<Transaction, 'id' | 'date' | 'amount' | 'description'>,
): Transaction => ({
  accountId: 'acc_chequing',
  currency: 'CAD',
  merchant: null,
  categoryId: null,
  projectId: null,
  status: 'posted',
  transferId: null,
  scheduledItemId: null,
  notes: null,
  tags: [],
  createdAt: STAMP,
  updatedAt: STAMP,
  ...over,
});

/** One full page: the paging maths is not what these tests are about. */
export const listMeta = (total: number): ListMeta => ({
  total,
  count: total,
  page: 1,
  pageSize: 8,
  offset: 0,
  totalPages: 1,
  hasMore: false,
});
