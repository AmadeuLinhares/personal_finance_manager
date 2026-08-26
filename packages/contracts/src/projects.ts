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
  spent: Minor;
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
  currenciesInvolved: CurrencyCode[];
}
