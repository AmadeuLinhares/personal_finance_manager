import { Button, Divider, EmptyState, ErrorState, Kicker, Skeleton } from '@pfm/ui';
import { ArrowRight } from 'lucide-react';
import { type ReactNode } from 'react';

import { type FetchError } from '@/http/fetch/fetch';

export interface PanelProps {
  title: string;
  subject?: string;
  isPending: boolean;
  error: FetchError | null;
  onRetry: () => void;
  empty?: string;
  link?: { label: string; onClick: () => void };
  busy?: boolean;
  loadingLines?: number;
  children: ReactNode;
}

export function Panel({
  title,
  subject,
  isPending,
  error,
  onRetry,
  empty,
  link,
  busy = false,
  loadingLines = 6,
  children,
}: PanelProps) {
  const name = subject ?? title.toLowerCase();

  return (
    <section aria-busy={busy}>
      <Kicker>{title}</Kicker>
      <Divider className='mt-2 mb-3' />

      {isPending ? (
        <Skeleton lines={loadingLines} label={`Loading ${name}…`} />
      ) : error !== null ? (
        <ErrorState
          title={`Could not load ${name} — ${error.data.code}`}
          description={error.data.message}
          onRetry={onRetry}
        />
      ) : empty === undefined ? (
        children
      ) : (
        <EmptyState className='py-6' title={empty} />
      )}

      {link === undefined ? null : (
        <Button variant='ghost' size='sm' className='mt-3 -ml-1' onClick={link.onClick}>
          {link.label}
          <ArrowRight className='size-3.5' aria-hidden='true' />
        </Button>
      )}
    </section>
  );
}
