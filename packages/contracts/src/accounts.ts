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
  currency: CurrencyCode;
  openingBalance: Minor;
  creditLimit: Minor | null;
  color: string;
  openedAt: IsoDate;
  archivedAt: IsoDate | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  balance?: Balance | null;
}

export interface Balance {
  accountId: string;
  currency: CurrencyCode;
  asOf: IsoDate;
  openingBalance: Minor;
  posted: Minor;
  pending: Minor;
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

export interface AccountsMeta {
  total: number;
  asOf: IsoDate;
  totalsByCurrency: Partial<Record<CurrencyCode, CurrencyTotal>>;
}

export interface AccountFilters {
  asOf?: IsoDate;
  includeBalances?: boolean;
  includeArchived?: boolean;
  currency?: CurrencyCode;
}
