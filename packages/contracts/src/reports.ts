/**
 * Reporting shapes. `outflow`/`inflow` are magnitudes; `net = inflow - outflow`.
 */

import type {
  CategoryKind,
  CurrencyCode,
  Granularity,
  IsoDate,
  IsoMonth,
  Minor,
} from './primitives.ts';

/**
 * Reporting vocabulary: `outflow` and `inflow` are magnitudes (>= 0) and
 * `net = inflow - outflow`. Classification follows the sign of the amount, not
 * the category's kind — a refund is an inflow even in an expense category.
 */
export interface CategoryTotals {
  categoryId: string | null;
  /** `Uncategorised` when `categoryId` is null. */
  name: string;
  parentId: string | null;
  kind: CategoryKind | null;
  color: string;
  monthlyBudget?: Minor | null;
  inflow: Minor;
  outflow: Minor;
  net: Minor;
  transactionCount: number;
  /** `monthlyBudget` scaled to the reported period. */
  budget?: Minor | null;
  budgetRemaining?: Minor | null;
  budgetUsedRatio?: number | null;
  overBudget?: boolean;
  /** Share of the period's total outflow, 0–1. Only on category-breakdown. */
  outflowShare?: number;
}

export interface ReportScope {
  accountIds: string[];
  includesPending: boolean;
  includesTransfers: boolean;
  projectIds?: string[] | null;
}

/** What the report left out, so the UI can say so instead of quietly losing money. */
export interface ReportExclusions {
  transferLegs: number;
  otherCurrencyTransactions: number;
  /** Right currency, still out of scope: archived, or filtered out by `accountId`. */
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

/**
 * One report, one currency: the API refuses to sum across currencies because it
 * has no FX rates, so `currency` picks the scope rather than converting into it.
 */
export interface MonthlyExpensesFilters {
  /** Inclusive `YYYY-MM` bounds. Defaults to the last six months, server-side. */
  from?: IsoMonth;
  to?: IsoMonth;
  currency?: CurrencyCode;
  accountId?: string;
  projectId?: string;
  /** Default `true` — an unposted card hold is still money the user has spent. */
  includePending?: boolean;
  /** Default `false`: a transfer leg is not an expense. */
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
    /** net / inflow, 0–1. `null` when there was no income in the bucket. */
    savingsRate: number | null;
  }[];
  totals: { inflow: Minor; outflow: Minor; net: Minor };
  excluded: ReportExclusions;
}
