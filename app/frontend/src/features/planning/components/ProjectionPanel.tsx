import { type BudgetProjection } from '@pfm/contracts';
import {
  Card,
  CardKicker,
  CardMeta,
  CardTitle,
  DateText,
  Money,
  TrendChart,
  formatMonth,
} from '@pfm/ui';

/** Buckets are keyed `YYYY-MM` at month granularity; the axis wants `Aug`. */
const bucketLabel = (key: string) => formatMonth(key).slice(0, 3);

/**
 * The starting balance is the balance the day before the forecast opens, so it
 * is the last point that actually happened. Everything after it is a closing
 * balance that already contains scheduled money, which is why the seam sits
 * here and not at the end of the partially-projected first bucket.
 */
const toSeries = (projection: BudgetProjection) => [
  { label: 'Now', value: projection.startingBalance },
  ...projection.series.map((bucket) => ({
    label: bucketLabel(bucket.key),
    value: bucket.closingBalance,
  })),
];

export interface ProjectionPanelProps {
  projection: BudgetProjection;
  /** Months ahead, for the card that names the window it is summarising. */
  horizon: number;
  isFetching: boolean;
}

export function ProjectionPanel({ projection, horizon, isFetching }: ProjectionPanelProps) {
  return (
    <div aria-busy={isFetching}>
      <TrendChart
        series={toSeries(projection)}
        actualUpTo={0}
        label={`Projected CAD balance to ${projection.range.to}`}
      />
      <p className='mt-1 text-label text-ink/55'>
        Solid to <DateText value={projection.assumptions.actualsThrough} year /> — actuals. Dashed
        after it — commitments only.
      </p>

      <div className='mt-3 flex flex-wrap gap-3'>
        <Card className='flex-1'>
          <CardKicker>Ending balance · {horizon} months</CardKicker>
          <CardTitle className='text-[26px] tabular-nums'>
            <Money minorUnits={projection.endingBalance} colorInflow={false} />
          </CardTitle>
          <CardMeta className='tabular-nums'>
            <Money minorUnits={projection.endingBalance - projection.startingBalance} signed /> vs
            today
          </CardMeta>
        </Card>
        <Card className='flex-1'>
          <CardKicker>Lowest point</CardKicker>
          <CardTitle className='text-[26px] tabular-nums'>
            {projection.lowestPoint === null ? (
              '—'
            ) : (
              <Money minorUnits={projection.lowestPoint.balance} colorInflow={false} />
            )}
          </CardTitle>
          <CardMeta className='tabular-nums'>
            {projection.lowestPoint === null ? (
              'no dip in this window'
            ) : (
              <DateText value={projection.lowestPoint.date} year />
            )}
          </CardMeta>
        </Card>
      </div>

      {/* The API states its own assumptions; restating them would let the
          two drift apart, and this is the paragraph that has to be true. */}
      <p className='mt-3 text-ui-sm text-pretty text-ink/55'>{projection.assumptions.note}</p>
    </div>
  );
}
