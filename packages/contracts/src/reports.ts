import type {
  CategoryKind,
  CurrencyCode,
  Granularity,
  IsoDate,
  IsoMonth,
  Minor,
} from './primitives.ts';

export interface CategoryTotals {
  categoryId: string | null;
  name: string;
  parentId: string | null;
  kind: CategoryKind | null;
  color: string;
  monthlyBudget?: Minor | null;
  inflow: Minor;
  outflow: Minor;
  net: Minor;
  transactionCount: number;
  budget?: Minor | null;
  budgetRemaining?: Minor | null;
  budgetUsedRatio?: number | null;
  overBudget?: boolean;
  outflowShare?: number;
}

export interface ReportScope {
  accountIds: string[];
  includesPending: boolean;
  includesTransfers: boolean;
  projectIds?: string[] | null;
}

export interface ReportExclusions {
  transferLegs: number;
  otherCurrencyTransactions: number;
  outOfScopeTransactions: number;
  pendingTransactions: number;
}

export interface MonthlyExpensesReport {
  range: { from: IsoMonth; to: IsoMonth; startDate: IsoDate; endDate: IsoDate };
  currency: CurrencyCode;
  scope: ReportScope;
  months: {
    month: IsoMonth;
    start: IsoDate;
    end: IsoDate;
    inflow: Minor;
    outflow: Minor;
    net: Minor;
    transactionCount: number;
    byCategory: CategoryTotals[];
  }[];
  totals: {
    inflow: Minor;
    outflow: Minor;
    net: Minor;
    transactionCount: number;
    monthCount: number;
    averageMonthlyOutflow: Minor;
    byCategory: CategoryTotals[];
  };
  excluded: ReportExclusions;
}

export interface MonthlyExpensesFilters {
  from?: IsoMonth;
  to?: IsoMonth;
  currency?: CurrencyCode;
  accountId?: string;
  projectId?: string;
  includePending?: boolean;
  includeTransfers?: boolean;
}

export interface CategoryBreakdownReport {
  range: { from: IsoDate; to: IsoDate };
  currency: CurrencyCode;
  scope: ReportScope;
  inflow: Minor;
  outflow: Minor;
  net: Minor;
  transactionCount: number;
  categories: CategoryTotals[];
  excluded: ReportExclusions;
}

export interface CashFlowReport {
  range: { from: IsoDate; to: IsoDate };
  granularity: Granularity;
  currency: CurrencyCode;
  scope: ReportScope;
  series: {
    key: string;
    start: IsoDate;
    end: IsoDate;
    inflow: Minor;
    outflow: Minor;
    net: Minor;
    transactionCount: number;
    savingsRate: number | null;
  }[];
  totals: { inflow: Minor; outflow: Minor; net: Minor };
  excluded: ReportExclusions;
}
