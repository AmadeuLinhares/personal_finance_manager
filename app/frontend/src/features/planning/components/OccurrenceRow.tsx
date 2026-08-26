import { type Occurrence, type OccurrenceStatus } from '@pfm/contracts';
import { Button, DateText, Money, Tag, VisuallyHidden, cn } from '@pfm/ui';
import { type Ref } from 'react';

const STATUS_VARIANT: Record<OccurrenceStatus, 'accent' | 'neutral' | 'outline'> = {
  overdue: 'accent',
  scheduled: 'neutral',
  posted: 'outline',
  skipped: 'outline',
};

export const CELLS =
  'grid min-w-[560px] grid-cols-[76px_1fr_104px_112px_128px] items-center gap-2 px-2';

export interface OccurrenceRowProps {
  occurrence: Occurrence;
  busy: boolean;
  onPost: () => void;
  onSkip: () => void;
  onUnskip: () => void;
  ref?: Ref<HTMLDivElement>;
  index?: number;
}

export function OccurrenceRow({
  occurrence,
  busy,
  onPost,
  onSkip,
  onUnskip,
  ref,
  index,
}: OccurrenceRowProps) {
  const open = occurrence.status === 'overdue' || occurrence.status === 'scheduled';
  const named = ` ${occurrence.name}, due ${occurrence.date}`;

  return (
    <div
      ref={ref}
      role='row'
      data-index={index}
      aria-rowindex={index === undefined ? undefined : index + 2}
      className={cn(CELLS, 'border-b border-divider py-2 text-ui hover:bg-ink/4')}
    >
      <span role='cell'>
        <DateText value={occurrence.date} />
      </span>
      <span role='cell' className='min-w-0'>
        {occurrence.name}
        {occurrence.projectId === null ? null : (
          <Tag variant='outline' className='ml-1.5'>
            project
          </Tag>
        )}
      </span>
      <span role='cell'>
        <Tag variant={STATUS_VARIANT[occurrence.status]}>{occurrence.status}</Tag>
      </span>
      <span role='cell' className={cn('text-right tabular-nums', open ? undefined : 'text-ink/70')}>
        <Money minorUnits={occurrence.amount} signed />
      </span>
      <span role='cell' className='text-right whitespace-nowrap'>
        {open ? (
          <>
            <Button variant='ghost' size='sm' disabled={busy} onClick={onPost}>
              Post
              <VisuallyHidden>{named}</VisuallyHidden>
            </Button>
            <Button variant='ghost' size='sm' className='text-ink' disabled={busy} onClick={onSkip}>
              Skip
              <VisuallyHidden>{named}</VisuallyHidden>
            </Button>
          </>
        ) : occurrence.status === 'skipped' ? (
          <Button variant='ghost' size='sm' disabled={busy} onClick={onUnskip}>
            Undo skip
            <VisuallyHidden>{named}</VisuallyHidden>
          </Button>
        ) : null}
      </span>
    </div>
  );
}
