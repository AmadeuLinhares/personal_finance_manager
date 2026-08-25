import { type Occurrence } from '@pfm/contracts';

/** One occurrence is a rule plus a date — neither identifies it on its own. */
export const occurrenceKey = (occurrence: Occurrence) =>
  `${occurrence.scheduledItemId}:${occurrence.date}`;
