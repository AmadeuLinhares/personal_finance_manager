import { type BudgetProjection } from '@pfm/contracts';
import { Card, CardKicker, CardMeta, CardTitle, DateText, Money, TrendChart } from '@pfm/ui';

import { PROJECTION_SEAM, toProjectionSeries } from '@/utils/projectionSeries';

export interface ProjectionPanelProps {
  projection: BudgetProjection;
  isFetching: boolean;
}

export function ProjectionPanel({ projection, isFetching }: ProjectionPanelProps) {
  return (
    <div aria-busy={isFetching}>
      <TrendChart
        series={toProjectionSeries(projection)}
        actualUpTo={PROJECTION_SEAM}
        label={`Projected CAD balance to ${projection.range.to}`}
      />
      <p className='mt-1 text-label text-ink/70'>
        Solid to <DateText value={projection.assumptions.actualsThrough} year /> — actuals. Dashed
        after it — commitments only.
      </p>

      <div className='mt-3 flex flex-wrap gap-3'>
        <Card className='flex-1'>
          <CardKicker>
            Ending balance · <DateText value={projection.range.to} year />
          </CardKicker>
          <CardTitle className='text-[26px] tabular-nums'>
            <Money minorUnits={projection.endingBalance} colorInflow={false} />
          </CardTitle>
          <CardMeta className='tabular-nums'>
            <Money minorUnits={projection.endingBalance - projection.startingBalance} signed /> over
            the window
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

      <p className='mt-3 text-ui-sm text-pretty text-ink/70'>{projection.assumptions.note}</p>
    </div>
  );
}
