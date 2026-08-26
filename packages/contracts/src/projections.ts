import type { CurrencyCode, Granularity, IsoDate, Minor } from './primitives.ts';

export interface BudgetProjection {
  range: { from: IsoDate; to: IsoDate };
  granularity: Granularity;
  currency: CurrencyCode;
  asOf: IsoDate;
  scope: { accountIds: string[] };
  startingBalance: Minor;
  endingBalance: Minor;
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

export interface BudgetProjectionFilters {
  from?: IsoDate;
  to?: IsoDate;
  granularity?: Granularity;
  currency?: CurrencyCode;
  accountId?: string;
  includeScheduled?: boolean;
  includeCategoryBudgets?: boolean;
  asOf?: IsoDate;
}
