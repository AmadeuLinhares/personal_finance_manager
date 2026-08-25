/**
 * The ledger itself — one row per movement of money — and transfers, which are two of them.
 */

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
  /** The day it happened. Compare as a string; do not parse into a Date blindly. */
  date: IsoDate;
  amount: Minor;
  /** Always equal to the account's currency. */
  currency: CurrencyCode;
  description: string;
  merchant: string | null;
  categoryId: string | null;
  projectId: string | null;
  status: TransactionStatus;
  /** Set on both legs of a transfer. Reports exclude these by default. */
  transferId: string | null;
  /** Set when this row was generated from a scheduled item. */
  scheduledItemId: string | null;
  notes: string | null;
  tags: string[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;

  /** Present with `?include=…`. */
  account?: Pick<Account, 'id' | 'name' | 'currency' | 'color' | 'type'> | null;
  category?: Pick<Category, 'id' | 'name' | 'color' | 'kind' | 'parentId'> | null;
  project?: Pick<Project, 'id' | 'name' | 'currency' | 'color' | 'status'> | null;
  scheduledItem?: Pick<ScheduledItem, 'id' | 'name' | 'currency' | 'frequency'> | null;
  /** Present with `?withRunningBalance=true`. `null` for pending rows. */
  runningBalance?: Minor | null;
}

/**
 * Every filter the screen exposes maps to a query param — nothing is filtered in
 * the client. `pageSize` maxes out at 500 server-side.
 */
export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  projectId?: string;
  status?: TransactionStatus;
  direction?: Direction;
  from?: IsoDate;
  to?: IsoDate;
  /** Substring over description, merchant and notes. */
  q?: string;
  uncategorised?: boolean;
  includeTransfers?: boolean;
  transfersOnly?: boolean;
  page?: number;
  pageSize?: number;
  /** `-` prefix is descending; later keys break ties. Default `-date,-createdAt`. */
  sort?: string;
  /** Embeds relations, so a row renders without a second lookup. */
  include?: string;
  /**
   * Needs exactly one `accountId` and a date sort, or the API answers 400: a
   * running balance across accounts has no meaning, and one out of date order is
   * not a balance.
   */
  withRunningBalance?: boolean;
}

export interface CreateTransactionVariables {
  accountId: string;
  date: IsoDate;
  /**
   * Integer minor units, signed: negative leaves the account, positive enters
   * it. `45.99` is a 422 — the sign and the scaling are both the client's job.
   */
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
  /** Positive magnitude; the legs carry the signs. */
  amount: Minor;
  currency: CurrencyCode;
  fromAccountId: string;
  toAccountId: string | null;
  description: string;
  status: TransactionStatus;
  legs: { id: string; accountId: string; amount: Minor }[];
  /** True when a leg was force-deleted and the pair no longer balances. */
  isOrphaned: boolean;
}

export interface CreateTransferVariables {
  fromAccountId: string;
  toAccountId: string;
  /** A positive magnitude. Each leg's sign is derived by the server. */
  amount: Minor;
  date: IsoDate;
  description?: string | null;
  notes?: string | null;
  status?: TransactionStatus;
}
