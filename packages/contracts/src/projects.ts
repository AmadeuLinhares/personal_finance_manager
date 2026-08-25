/**
 * Projects: a label with a budget, not a container. Spending stays in its account's ledger.
 */

import type {
  CurrencyCode,
  IsoDate,
  IsoDateTime,
  IsoMonth,
  Minor,
  ProjectStatus,
} from './primitives.ts';
import type { CategoryTotals } from './reports.ts';
import type { Occurrence } from './scheduledItems.ts';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  currency: CurrencyCode;
  budget: Minor | null;
  startDate: IsoDate;
  endDate: IsoDate | null;
  color: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  summary?: ProjectSummary | null;
}

export interface ProjectSummary {
  projectId: string;
  currency: CurrencyCode;
  budget: Minor | null;
  outflow: Minor;
  inflow: Minor;
  /** Net cash out the door (outflow - inflow). Compare this to `budget`. */
  spent: Minor;
  /** Sum of future scheduled items linked to the project. */
  committed: Minor;
  projectedTotal: Minor;
  budgetRemaining: Minor | null;
  budgetUsedRatio: number | null;
  overBudget: boolean;
  transactionCount: number;
  firstTransactionDate: IsoDate | null;
  lastTransactionDate: IsoDate | null;
  byCategory: CategoryTotals[];
  byMonth: {
    month: IsoMonth;
    inflow: Minor;
    outflow: Minor;
    net: Minor;
    transactionCount: number;
  }[];
  upcoming: Occurrence[];
  /** More than one entry means the totals above mix currencies. */
  currenciesInvolved: CurrencyCode[];
}
