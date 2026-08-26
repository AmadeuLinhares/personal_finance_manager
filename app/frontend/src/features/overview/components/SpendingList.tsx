import { type CategoryTotals } from '@pfm/contracts';
import { Bar, Money, Tag } from '@pfm/ui';

export interface SpendingListProps {
  rows: CategoryTotals[];
}

export function SpendingList({ rows }: SpendingListProps) {
  const widest = rows[0]?.outflow ?? 0;

  return (
    <ul className='flex flex-col gap-3'>
      {rows.map((row) => (
        <li key={row.categoryId ?? 'uncategorised'}>
          <div className='mb-1.5 flex justify-between gap-2 text-ui'>
            <span>
              {row.name}
              {row.overBudget === true ? (
                <Tag variant='accent' className='ml-1'>
                  over budget
                </Tag>
              ) : null}
            </span>
            <Money minorUnits={row.outflow} colorInflow={false} />
          </div>
          <Bar spent={row.outflow} budget={row.budget ?? widest} />
        </li>
      ))}
    </ul>
  );
}
