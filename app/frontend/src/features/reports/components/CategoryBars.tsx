import { Bar, Money, Tag } from '@pfm/ui';

import type { ReportCurrency } from '../constants';
import type { CategoryRow } from '../utils/categoryRows';

export interface CategoryBarsProps {
  rows: CategoryRow[];
  currency: ReportCurrency;
}

export function CategoryBars({ rows, currency }: CategoryBarsProps) {
  const widest = rows[0]?.outflow ?? 0;

  return (
    <ul className='flex flex-col gap-3'>
      {rows.map((row) => (
        <li key={row.key}>
          <div className='mb-1.5 flex justify-between gap-2 text-ui'>
            <span>
              {row.name}
              {row.overBudget ? (
                <Tag variant='accent' className='ml-1'>
                  over budget
                </Tag>
              ) : null}
            </span>
            <span className='whitespace-nowrap tabular-nums'>
              <Money minorUnits={row.outflow} currency={currency} colorInflow={false} />{' '}
              {row.budget === null ? (
                <span className='text-ink/70'>unbudgeted</span>
              ) : (
                <span className='text-ink/70'>
                  of <Money minorUnits={row.budget} currency={currency} colorInflow={false} />
                </span>
              )}
            </span>
          </div>
          <Bar spent={row.outflow} budget={row.budget ?? widest} />
        </li>
      ))}
    </ul>
  );
}
