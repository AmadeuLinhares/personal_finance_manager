import { type BudgetProjection } from '@pfm/contracts';
import { type TrendPoint, formatMonth } from '@pfm/ui';

const bucketLabel = (key: string) => formatMonth(key).slice(0, 3);

export const toProjectionSeries = (projection: BudgetProjection): TrendPoint[] => [
  { label: 'Now', value: projection.startingBalance },
  ...projection.series.map((bucket) => ({
    label: bucketLabel(bucket.key),
    value: bucket.closingBalance,
  })),
];

export const PROJECTION_SEAM = 0;
