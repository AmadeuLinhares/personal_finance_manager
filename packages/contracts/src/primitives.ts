/**
 * The scalars, and the closed sets of values the API accepts.
 *
 * Every vocabulary here is an `as const` array first and a union type second.
 * That order is the point: the Express API is plain JavaScript, so it can only
 * consume a runtime value — `z.enum(TRANSACTION_STATUSES)` — while the client
 * wants the type. Deriving the type from the array means adding a status is one
 * edit, and the compiler and the validator cannot disagree about the result.
 */

/** Integer minor units (cents). Negative = outflow, positive = inflow. */
export type Minor = number;

/** Calendar date, `YYYY-MM-DD`. Deliberately not a timestamp. */
export type IsoDate = string;

/** Month, `YYYY-MM`. */
export type IsoMonth = string;

/** ISO-8601 UTC instant, e.g. `2025-06-14T18:22:05.114Z`. */
export type IsoDateTime = string;

export const CURRENCY_CODES = ['CAD', 'USD', 'EUR'] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const ACCOUNT_TYPES = ['checking', 'savings', 'credit_card', 'cash', 'investment'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const TRANSACTION_STATUSES = ['posted', 'pending'] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const CATEGORY_KINDS = ['expense', 'income'] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

export const SCHEDULED_ITEM_KINDS = ['bill', 'income'] as const;
export type ScheduledItemKind = (typeof SCHEDULED_ITEM_KINDS)[number];

export const SCHEDULED_ITEM_STATUSES = ['active', 'paused'] as const;
export type ScheduledItemStatus = (typeof SCHEDULED_ITEM_STATUSES)[number];

export const OCCURRENCE_STATUSES = ['posted', 'skipped', 'overdue', 'scheduled'] as const;
export type OccurrenceStatus = (typeof OCCURRENCE_STATUSES)[number];

export const FREQUENCIES = [
  'once',
  'weekly',
  'biweekly',
  'monthly',
  'quarterly',
  'yearly',
] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const PROJECT_STATUSES = ['active', 'planned', 'completed', 'archived'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const GRANULARITIES = ['day', 'week', 'month', 'year'] as const;
export type Granularity = (typeof GRANULARITIES)[number];

/** Which way the money moved. A filter vocabulary, never stored on a record. */
export const DIRECTIONS = ['inflow', 'outflow'] as const;
export type Direction = (typeof DIRECTIONS)[number];
