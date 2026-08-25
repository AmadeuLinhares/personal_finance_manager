/**
 * Accounts, and the balances derived from them.
 */

import type {
  AccountType,
  CurrencyCode,
  Granularity,
  IsoDate,
  IsoDateTime,
  Minor,
} from './primitives.ts';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution: string | null;
  /** Immutable. Every transaction on the account is in this currency. */
  currency: CurrencyCode;
  /** Balance before the first transaction in the ledger. */
  openingBalance: Minor;
  /** Credit cards only, positive. `availableCredit = creditLimit + balance`. */
  creditLimit: Minor | null;
  color: string;
  openedAt: IsoDate;
  archivedAt: IsoDate | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  /** Attached by list/read endpoints unless `includeBalances=false`. */
  balance?: Balance | null;
}

/**
 * Balances are derived, never stored. `posted` and `pending` are separate because
 * "the balance" is ambiguous once a card pre-authorisation is in flight.
 */
export interface Balance {
  accountId: string;
  currency: CurrencyCode;
  asOf: IsoDate;
  openingBalance: Minor;
  /** Opening balance + every posted transaction up to `asOf`. */
  posted: Minor;
  /** The pending rows alone, usually negative. */
  pending: Minor;
  /** posted + pending. */
  available: Minor;
  transactionCount: number;
  pendingCount: number;
  creditLimit: Minor | null;
  availableCredit: Minor | null;
}

export interface CurrencyTotal {
  currency: CurrencyCode;
  posted: Minor;
  pending: Minor;
  available: Minor;
  accountCount: number;
}

/** Totals are never summed across currencies — there are no FX rates here. */
export interface BalanceSnapshot {
  asOf: IsoDate;
  balances: Balance[];
  totalsByCurrency: Partial<Record<CurrencyCode, CurrencyTotal>>;
}

export interface BalanceHistory {
  accountId: string;
  currency: CurrencyCode;
  granularity: Granularity;
  range: { from: IsoDate; to: IsoDate };
  openingBalance: Minor;
  series: {
    key: string;
    start: IsoDate;
    end: IsoDate;
    inflow: Minor;
    outflow: Minor;
    net: Minor;
    closingBalance: Minor;
  }[];
}

/** Balances arrive attached, and the per-currency totals come in `meta`. */
export interface AccountsMeta {
  total: number;
  asOf: IsoDate;
  totalsByCurrency: Partial<Record<CurrencyCode, CurrencyTotal>>;
}

export interface AccountFilters {
  /** Balances are computed as of this date. Defaults to today, server-side. */
  asOf?: IsoDate;
  /** `false` for the bare records — cheaper when only the names are needed. */
  includeBalances?: boolean;
  includeArchived?: boolean;
  currency?: CurrencyCode;
}
