import { type Occurrence } from '@pfm/contracts';
import { DateText, Money, Tag } from '@pfm/ui';

import { occurrenceKey } from '@/utils/occurrence';

export interface UpcomingListProps {
  occurrences: Occurrence[];
}

export function UpcomingList({ occurrences }: UpcomingListProps) {
  return (
    <ul className='flex flex-col'>
      {occurrences.map((occurrence) => (
        <li
          key={occurrenceKey(occurrence)}
          className='flex items-center justify-between gap-2 border-b border-divider py-2 text-ui'
        >
          <span>
            <DateText value={occurrence.date} className='text-ink/55' /> · {occurrence.name}
            {occurrence.status === 'overdue' ? (
              <Tag variant='accent' className='ml-1'>
                overdue
              </Tag>
            ) : null}
          </span>
          <Money minorUnits={occurrence.amount} currency={occurrence.currency} signed />
        </li>
      ))}
    </ul>
  );
}
