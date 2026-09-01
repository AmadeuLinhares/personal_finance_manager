import { type BudgetProjection } from '@pfm/contracts';
import {
  Card,
  CardKicker,
  CardMeta,
  CardTitle,
  DateText,
  Money,
  Notice,
  TrendChart,
} from '@pfm/ui';

import { HORIZON } from '../constants';
import { PROJECTION_SEAM, toProjectionSeries } from '@/utils/projectionSeries';

export interface ProjectionSummaryProps {
  projection: BudgetProjection;
}

export function ProjectionSummary({ projection }: ProjectionSummaryProps) {
  return (
    <>
      <TrendChart
        series={toProjectionSeries(projection)}
        actualUpTo={PROJECTION_SEAM}
        height={130}
        label={`Projected ${projection.currency} balance to ${projection.range.to}`}
      />
      <p className='mt-1 text-label text-ink/70'>
        Solid to <DateText value={projection.assumptions.actualsThrough} year /> — actuals. Dashed
        after it — commitments only.
      </p>

      {projection.goesNegative && projection.lowestPoint !== null ? (
        <Notice className='mt-3'>
          Goes negative on commitments alone — down to{' '}
          <Money
            minorUnits={projection.lowestPoint.balance}
            currency={projection.currency}
            colorInflow={false}
          />{' '}
          on <DateText value={projection.lowestPoint.date} year />.
        </Notice>
      ) : null}

      <Card className='mt-3'>
        <CardKicker>Ending balance · {HORIZON} months</CardKicker>
        <CardTitle className='text-[24px] tabular-nums'>
          <Money
            minorUnits={projection.endingBalance}
            currency={projection.currency}
            colorInflow={false}
          />
        </CardTitle>
        <CardMeta className='tabular-nums'>
          <Money
            minorUnits={projection.endingBalance - projection.startingBalance}
            currency={projection.currency}
            signed
          />{' '}
          vs today
        </CardMeta>
      </Card>
    </>
  );
}
