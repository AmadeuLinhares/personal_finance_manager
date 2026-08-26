import { type Occurrence } from '@pfm/contracts';
import { Table, Th, VisuallyHidden } from '@pfm/ui';

import { OccurrenceRow } from './OccurrenceRow';
import { occurrenceKey } from '@/utils/occurrence';

const VIEWPORT = 500;

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
    <div
      style={{ overflow: 'auto', overscrollBehavior: 'contain', maxHeight: VIEWPORT }}
      aria-busy={isFetching}
    >
      <div style={{ display: 'block', height: 'max-content' }}>
        <Table caption='Upcoming bills and income, earliest first'>
          <thead className='sticky top-0 bg-bg'>
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
    </div>
  );
}
