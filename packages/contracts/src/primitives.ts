export type Minor = number;

export type IsoDate = string;

export type IsoMonth = string;

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

export const DIRECTIONS = ['inflow', 'outflow'] as const;
export type Direction = (typeof DIRECTIONS)[number];
