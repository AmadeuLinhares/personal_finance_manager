import { type Occurrence, type OccurrenceStatus } from '@pfm/contracts';
import { Button, DateText, Money, Tag, Td, Tr, VisuallyHidden } from '@pfm/ui';

const STATUS_VARIANT: Record<OccurrenceStatus, 'accent' | 'neutral' | 'outline'> = {
  overdue: 'accent',
  scheduled: 'neutral',
  posted: 'outline',
  skipped: 'outline',
};

export interface OccurrenceRowProps {
  occurrence: Occurrence;
  busy: boolean;
  onPost: () => void;
  onSkip: () => void;
  onUnskip: () => void;
}

export function OccurrenceRow({ occurrence, busy, onPost, onSkip, onUnskip }: OccurrenceRowProps) {
  const open = occurrence.status === 'overdue' || occurrence.status === 'scheduled';
  const named = ` ${occurrence.name}, due ${occurrence.date}`;

  return (
    <Tr>
      <Td numeric className='text-left'>
        <DateText value={occurrence.date} />
      </Td>
      <Td>
        {occurrence.name}
        {occurrence.projectId === null ? null : (
          <Tag variant='outline' className='ml-1.5'>
            project
          </Tag>
        )}
      </Td>
      <Td>
        <Tag variant={STATUS_VARIANT[occurrence.status]}>{occurrence.status}</Tag>
      </Td>
      <Td numeric className={open ? undefined : 'text-ink/55'}>
        <Money minorUnits={occurrence.amount} signed />
      </Td>
      <Td numeric>
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
      </Td>
    </Tr>
  );
}
