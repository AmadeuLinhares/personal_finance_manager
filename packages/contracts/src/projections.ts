/**
 * Where the balance is heading, on commitments only.
 */

import type { CurrencyCode, Granularity, IsoDate, Minor } from './primitives.ts';

/**
 * Actual transactions cover dates up to `asOf`; scheduled occurrences cover
 * everything after it. Nothing is counted twice, and the bucket containing
 * `asOf` is a hybrid (`isPartiallyProjected`).
 */
export interface BudgetProjection {
  range: { from: IsoDate; to: IsoDate };
  granularity: Granularity;
  currency: CurrencyCode;
  asOf: IsoDate;
  scope: { accountIds: string[] };
  /** Balance across in-scope accounts the day before `range.from`. */
  startingBalance: Minor;
  endingBalance: Minor;
  /** The dip a user actually worries about. */
  lowestPoint: { key: string; date: IsoDate; balance: Minor } | null;
  goesNegative: boolean;
  series: {
    key: string;
    start: IsoDate;
    end: IsoDate;
    isProjected: boolean;
    isPartiallyProjected: boolean;
    daysInBucket: number;
    projectedDays: number;
    actual: { inflow: Minor; outflow: Minor; net: Minor; transactionCount: number };
    scheduled: { inflow: Minor; outflow: Minor; net: Minor; occurrenceCount: number };
    /** Only non-zero with `includeCategoryBudgets=true`. A guess, labelled as one. */
    estimatedDiscretionary: Minor;
    inflow: Minor;
    outflow: Minor;
    net: Minor;
    closingBalance: Minor;
  }[];
  assumptions: {
    actualsThrough: IsoDate;
    forecastFrom: IsoDate;
    includesScheduled: boolean;
    includesPendingInStartingBalance: boolean;
    excludesTransfers: boolean;
    includesEstimatedDiscretionary: boolean;
    monthlyCategoryBudgetTotal: Minor | null;
    scheduledItemIds: string[];
    note: string;
  };
}

/**
 * Where the balance is heading, on commitments only.
 *
 * `asOf` is the seam: dates up to it use real transactions, dates after it use
 * scheduled occurrences that have not been posted. Without that split a rent
 * payment that already cleared would be counted twice — once as history and
 * again as this month's bill.
 */
export interface BudgetProjectionFilters {
  /** Defaults to today; `to` defaults to the end of the sixth month out. */
  from?: IsoDate;
  to?: IsoDate;
  granularity?: Granularity;
  currency?: CurrencyCode;
  accountId?: string;
  includeScheduled?: boolean;
  /** Bolts a crude guess from the category budgets onto the forecast. Off. */
  includeCategoryBudgets?: boolean;
  /** Movable, so "what would last month's projection have said" is answerable. */
  asOf?: IsoDate;
}
