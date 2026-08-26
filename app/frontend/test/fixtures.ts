import {
  type Account,
  type Balance,
  type Category,
  type CategoryTotals,
  type ListMeta,
  type Transaction,
} from '@pfm/contracts';

const STAMP = '2026-08-01T00:00:00.000Z';
const DAY = STAMP.slice(0, 10);

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

export const balance = (
  over: Partial<Balance> & Pick<Balance, 'accountId' | 'available'>,
): Balance => ({
  currency: 'CAD',
  asOf: DAY,
  openingBalance: 0,
  posted: over.available,
  pending: 0,
  transactionCount: 0,
  pendingCount: 0,
  creditLimit: null,
  availableCredit: null,
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

export const listMeta = (total: number): ListMeta => ({
  total,
  count: total,
  page: 1,
  pageSize: 8,
  offset: 0,
  totalPages: 1,
  hasMore: false,
});
