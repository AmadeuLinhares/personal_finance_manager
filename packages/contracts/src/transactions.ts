import type { Account } from './accounts.ts';
import type { Category } from './categories.ts';
import type {
  CurrencyCode,
  Direction,
  IsoDate,
  IsoDateTime,
  Minor,
  TransactionStatus,
} from './primitives.ts';
import type { Project } from './projects.ts';
import type { ScheduledItem } from './scheduledItems.ts';

export interface Transaction {
  id: string;
  accountId: string;
  date: IsoDate;
  amount: Minor;
  currency: CurrencyCode;
  description: string;
  merchant: string | null;
  categoryId: string | null;
  projectId: string | null;
  status: TransactionStatus;
  transferId: string | null;
  scheduledItemId: string | null;
  notes: string | null;
  tags: string[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;

  account?: Pick<Account, 'id' | 'name' | 'currency' | 'color' | 'type'> | null;
  category?: Pick<Category, 'id' | 'name' | 'color' | 'kind' | 'parentId'> | null;
  project?: Pick<Project, 'id' | 'name' | 'currency' | 'color' | 'status'> | null;
  scheduledItem?: Pick<ScheduledItem, 'id' | 'name' | 'currency' | 'frequency'> | null;
  runningBalance?: Minor | null;
}

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  projectId?: string;
  status?: TransactionStatus;
  direction?: Direction;
  from?: IsoDate;
  to?: IsoDate;
  q?: string;
  uncategorised?: boolean;
  includeTransfers?: boolean;
  transfersOnly?: boolean;
  page?: number;
  pageSize?: number;
  sort?: string;
  include?: string;
  withRunningBalance?: boolean;
}

export interface CreateTransactionVariables {
  accountId: string;
  date: IsoDate;
  amount: Minor;
  description: string;
  merchant?: string | null;
  categoryId?: string | null;
  projectId?: string | null;
  status?: TransactionStatus;
  notes?: string | null;
  tags?: string[];
}

export interface Transfer {
  transferId: string;
  date: IsoDate;
  amount: Minor;
  currency: CurrencyCode;
  fromAccountId: string;
  toAccountId: string | null;
  description: string;
  status: TransactionStatus;
  legs: { id: string; accountId: string; amount: Minor }[];
  isOrphaned: boolean;
}

export interface CreateTransferVariables {
  fromAccountId: string;
  toAccountId: string;
  amount: Minor;
  date: IsoDate;
  description?: string | null;
  notes?: string | null;
  status?: TransactionStatus;
}
