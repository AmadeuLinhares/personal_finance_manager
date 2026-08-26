import { type Occurrence } from '@pfm/contracts';

export const unsettled = (occurrences: Occurrence[], limit: number): Occurrence[] =>
  occurrences
    .filter((occurrence) => occurrence.status === 'overdue' || occurrence.status === 'scheduled')
    .sort((first, second) => first.date.localeCompare(second.date))
    .slice(0, limit);
