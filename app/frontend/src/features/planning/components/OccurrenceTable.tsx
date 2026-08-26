import { type Occurrence } from '@pfm/contracts';
import { Table, Th, VisuallyHidden } from '@pfm/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

import { OccurrenceRow } from './OccurrenceRow';
import { occurrenceKey } from '@/utils/occurrence';

const ROW_ESTIMATE = 45;
const VIEWPORT = 480;
const VIRTUALISE_ABOVE = 50;

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
  const scroller = useRef<HTMLDivElement>(null);
  const virtualise = occurrences.length > VIRTUALISE_ABOVE;

  const virtualizer = useVirtualizer({
    count: virtualise ? occurrences.length : 0,
    getScrollElement: () => scroller.current,
    estimateSize: () => ROW_ESTIMATE,
    overscan: 8,
  });

  const slice = virtualizer.getVirtualItems();
  const above = slice.length === 0 ? 0 : slice[0].start;
  const below = slice.length === 0 ? 0 : virtualizer.getTotalSize() - slice[slice.length - 1].end;

  const visible = virtualise
    ? slice.map((row) => ({ index: row.index, occurrence: occurrences[row.index] }))
    : occurrences.map((occurrence, index) => ({ index, occurrence }));

  return (
    <div
      ref={scroller}
      className='overflow-auto'
      style={{ maxHeight: VIEWPORT }}
      aria-busy={isFetching}
    >
      <Table
        caption='Upcoming bills and income, earliest first'
        aria-rowcount={virtualise ? occurrences.length + 1 : undefined}
      >
        <thead className='sticky top-0 z-1 bg-bg'>
          <tr aria-rowindex={virtualise ? 1 : undefined}>
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
          {above > 0 ? <tr aria-hidden='true' style={{ height: above }} /> : null}

          {visible.map(({ index, occurrence }) => {
            const key = occurrenceKey(occurrence);

            return (
              <OccurrenceRow
                key={key}
                ref={virtualise ? virtualizer.measureElement : undefined}
                index={virtualise ? index : undefined}
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

          {below > 0 ? <tr aria-hidden='true' style={{ height: below }} /> : null}
        </tbody>
      </Table>
    </div>
  );
}
