/**
 * Recurrence: the rules, and the dates they generate on demand.
 */

import type {
  CurrencyCode,
  Frequency,
  IsoDate,
  IsoDateTime,
  Minor,
  OccurrenceStatus,
  ScheduledItemKind,
  ScheduledItemStatus,
  TransactionStatus,
} from './primitives.ts';

/**
 * A rule, not a row: `startDate` + `frequency` generate dates on demand.
 * Monthly-family items stay anchored to their day of month and clamp in short
 * months (the 31st becomes Feb 28, then back to Mar 31).
 */
export interface ScheduledItem {
  id: string;
  name: string;
  kind: ScheduledItemKind;
  accountId: string;
  categoryId: string | null;
  projectId: string | null;
  /** Signed like a transaction: bills negative, income positive. */
  amount: Minor;
  currency: CurrencyCode;
  frequency: Frequency;
  startDate: IsoDate;
  endDate: IsoDate | null;
  autoPay: boolean;
  status: ScheduledItemStatus;
  notes: string | null;
  /** Expected swing around `amount` — a hint for the UI, not enforced. */
  variance: Minor;
  skippedDates: IsoDate[];
  postedOccurrences: { date: IsoDate; transactionId: string }[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  /** Derived on read: next date that is neither posted nor skipped. */
  nextDueDate: IsoDate | null;
}

export interface Occurrence {
  scheduledItemId: string;
  name: string;
  date: IsoDate;
  amount: Minor;
  currency: CurrencyCode;
  accountId: string;
  categoryId: string | null;
  projectId: string | null;
  kind: ScheduledItemKind;
  status: OccurrenceStatus;
  /** Set when the occurrence has been posted. */
  transactionId: string | null;
}

export interface UpcomingResponse {
  range: { from: IsoDate; to: IsoDate };
  occurrences: Occurrence[];
  totals: {
    inflow: Minor;
    outflow: Minor;
    net: Minor;
    occurrenceCount: number;
    overdueCount: number;
  };
}

/**
 * Every rule expanded into dates. Nothing is materialised server-side, so this
 * list is always current with the rules behind it — there is no queue of stale
 * future rows to reconcile.
 */
export interface OccurrenceFilters {
  /** Defaults to today, server-side; `to` defaults to three months after it. */
  from?: IsoDate;
  to?: IsoDate;
  status?: OccurrenceStatus;
  kind?: ScheduledItemKind;
  accountId?: string;
  projectId?: string;
}

export interface CreateScheduledItemVariables {
  name: string;
  kind: ScheduledItemKind;
  accountId: string;
  categoryId?: string | null;
  projectId?: string | null;
  /** Signed like a transaction: bills negative, income positive. */
  amount: Minor;
  frequency: Frequency;
  /** For the monthly family this also fixes the day of month. */
  startDate: IsoDate;
  endDate?: IsoDate | null;
  autoPay?: boolean;
  status?: ScheduledItemStatus;
  notes?: string | null;
  variance?: Minor;
}

export interface PostOccurrenceVariables {
  scheduledItemId: string;
  /** Must be a date the rule actually falls on, or the API answers 422. */
  date: IsoDate;
  /**
   * Defaults to the scheduled amount. It exists because the hydro bill never
   * matches its estimate, and forcing the estimate would corrupt the ledger to
   * protect the forecast.
   */
  amount?: Minor;
  status?: TransactionStatus;
}

export interface SkipOccurrenceVariables {
  scheduledItemId: string;
  date: IsoDate;
}
