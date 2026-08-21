import { AlertTriangle, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { type ReactNode } from 'react';

import { Button } from './Button';
import { cn } from '../lib/cn';

/** Rows of shimmering rules, sized to the content they stand in for. */
export function Skeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  const widths = ['100%', '88%', '94%', '76%', '91%'];
  return (
    <div className={cn('gap-2.2 flex flex-col', className)} aria-hidden='true'>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className='h-3 animate-skeleton rounded-sm bg-neutral-300'
          style={{
            width: widths[index % widths.length],
            animationDelay: `${String((index % 3) * 0.2)}s`,
          }}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-md border border-divider p-3 text-center', className)}>
      <div className='font-semibold font-heading text-[19px]'>{title}</div>
      {description ? <p className='mb-2.2 mt-1 text-ui-sm text-ink/55'>{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('rounded-md border border-divider p-3', className)}>
      <div className='gap-2.2 flex items-start'>
        <Info className='mt-0.5 size-4.5 flex-none text-accent-700' aria-hidden='true' />
        <div>
          <div className='font-semibold font-heading text-[17px]'>{title}</div>
          {description ? <p className='mt-0.5 mb-2 text-ui-sm text-ink/55'>{description}</p> : null}
          {onRetry ? (
            <Button variant='secondary' onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * The line that owns up to something: a 207 partial import, or the rows a report
 * dropped. `attention` gets an accent border and an icon, `muted` is a quiet
 * footnote.
 */
export function Notice({
  variant = 'attention',
  children,
  action,
  className,
}: {
  variant?: 'attention' | 'muted';
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'gap-2.2 px-2.6 py-2.2 flex items-center rounded-md border text-ui-sm',
        variant === 'attention' ? 'border-accent-400' : 'border-divider text-ink/55',
        className,
      )}
    >
      {variant === 'attention' ? (
        <AlertTriangle className='size-3.5 flex-none text-accent-700' aria-hidden='true' />
      ) : null}
      <span className='tabular-nums'>{children}</span>
      {action ? <span className='ml-auto whitespace-nowrap'>{action}</span> : null}
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  summary,
  className,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** e.g. "Showing 1–8 of 21". Offset pagination, as the API serves it. */
  summary?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      {summary ? <span className='text-ui-sm text-ink/55 tabular-nums'>{summary}</span> : null}
      <div className='flex items-center gap-2'>
        <Button
          icon
          aria-label='Previous page'
          disabled={page <= 1}
          onClick={() => {
            onPageChange(page - 1);
          }}
        >
          <ChevronLeft className='size-3.5' aria-hidden='true' />
        </Button>
        <span className='text-ui-sm whitespace-nowrap tabular-nums'>
          Page {page} of {pageCount}
        </span>
        <Button
          icon
          aria-label='Next page'
          disabled={page >= pageCount}
          onClick={() => {
            onPageChange(page + 1);
          }}
        >
          <ChevronRight className='size-3.5' aria-hidden='true' />
        </Button>
      </div>
    </div>
  );
}
