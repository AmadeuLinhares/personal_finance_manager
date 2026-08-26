import { type Occurrence } from '@pfm/contracts';
import { Table, Th, VisuallyHidden } from '@pfm/ui';

import { OccurrenceRow } from './OccurrenceRow';
import { occurrenceKey } from '@/utils/occurrence';

export interface OccurrenceTableProps {
  occurrences: Occurrence[];
  pendingKey: string | null;
  isFetching: boolean;
  onPost: (occurrence: Occurrence) => void;
  onSkip: (occurrence: Occurrence) => void;
  onUnskip: (occurrence: Occurrence) => void;
}

export function OccurrenceTable({
  occurrences,
  pendingKey,
  isFetching,
  onPost,
  onSkip,
  onUnskip,
}: OccurrenceTableProps) {
  return (
    <div className='overflow-x-auto' aria-busy={isFetching}>
      <Table caption='Upcoming bills and income, earliest first'>
        <thead>
          <tr>
            <Th>Due</Th>
            <Th>Item</Th>
            <Th>Status</Th>
            <Th numeric>Amount</Th>
            <Th numeric>
              <VisuallyHidden>Actions</VisuallyHidden>
            </Th>
          </tr>
        </thead>
        <tbody>
          {occurrences.map((occurrence) => {
            const key = occurrenceKey(occurrence);

            return (
              <OccurrenceRow
                key={key}
                occurrence={occurrence}
                busy={pendingKey === key}
                onPost={() => {
                  onPost(occurrence);
                }}
                onSkip={() => {
                  onSkip(occurrence);
                }}
                onUnskip={() => {
                  onUnskip(occurrence);
                }}
              />
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
