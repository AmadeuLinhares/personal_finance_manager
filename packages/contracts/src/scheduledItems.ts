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

export interface ScheduledItem {
  id: string;
  name: string;
  kind: ScheduledItemKind;
  accountId: string;
  categoryId: string | null;
  projectId: string | null;
  amount: Minor;
  currency: CurrencyCode;
  frequency: Frequency;
  startDate: IsoDate;
  endDate: IsoDate | null;
  autoPay: boolean;
  status: ScheduledItemStatus;
  notes: string | null;
  variance: Minor;
  skippedDates: IsoDate[];
  postedOccurrences: { date: IsoDate; transactionId: string }[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
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

export interface OccurrenceFilters {
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
  amount: Minor;
  frequency: Frequency;
  startDate: IsoDate;
  endDate?: IsoDate | null;
  autoPay?: boolean;
  status?: ScheduledItemStatus;
  notes?: string | null;
  variance?: Minor;
}

export interface PostOccurrenceVariables {
  scheduledItemId: string;
  date: IsoDate;
  amount?: Minor;
  status?: TransactionStatus;
}

export interface SkipOccurrenceVariables {
  scheduledItemId: string;
  date: IsoDate;
}
