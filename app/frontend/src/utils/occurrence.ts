import { type Occurrence } from '@pfm/contracts';

export const occurrenceKey = (occurrence: Occurrence) =>
  `${occurrence.scheduledItemId}:${occurrence.date}`;
