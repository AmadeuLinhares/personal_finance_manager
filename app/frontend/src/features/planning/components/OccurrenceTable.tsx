import { type Occurrence } from '@pfm/contracts';
import { VisuallyHidden, cn } from '@pfm/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

import { CELLS, OccurrenceRow } from './OccurrenceRow';
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
      role='table'
      className='overflow-x-auto'
      aria-label='Upcoming bills and income, earliest first'
      aria-rowcount={virtualise ? occurrences.length + 1 : undefined}
      aria-busy={isFetching}
    >
      <div
        role='row'
        aria-rowindex={virtualise ? 1 : undefined}
        className={cn(
          CELLS,
          'border-b border-divider py-2 text-meta tracking-[0.08em] text-ink/70 uppercase',
        )}
      >
        <span role='columnheader'>Due</span>
        <span role='columnheader'>Item</span>
        <span role='columnheader'>Status</span>
        <span role='columnheader' className='text-right'>
          Amount
        </span>
        <span role='columnheader' className='text-right'>
          <VisuallyHidden>Actions</VisuallyHidden>
        </span>
      </div>

      <div
        ref={scroller}
        role='rowgroup'
        style={{
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          ...(virtualise ? { height: VIEWPORT } : { maxHeight: VIEWPORT }),
        }}
      >
        <div style={{ paddingTop: above, paddingBottom: below }}>
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
        </div>
      </div>
    </div>
  );
}
