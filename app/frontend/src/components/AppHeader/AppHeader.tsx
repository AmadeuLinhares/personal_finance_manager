import { Button, VisuallyHidden, cn } from '@pfm/ui';
import { Plus } from 'lucide-react';
import { type ReactNode } from 'react';

import { IMPLEMENTED_SCREENS, type Screen, SCREENS } from '@/constants/screens';

export interface AppHeaderProps {
  screen: Screen;
  onScreenChange: (screen: Screen) => void;
  /** The balance line. A node, not a string: the header renders it, it does not own it. */
  scope: ReactNode;
  onNewTransaction: () => void;
}

export function AppHeader({ screen, onScreenChange, scope, onNewTransaction }: AppHeaderProps) {
  return (
    <header className='border-b border-divider bg-bg'>
      <div className='mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-4'>
        <div className='flex items-baseline gap-2'>
          <span className='font-heading text-[24px] font-semibold tracking-[-0.01em]'>Folio</span>
          <span className='text-meta tracking-[0.1em] text-ink/55 uppercase'>Personal ledger</span>
        </div>

        <nav className='flex flex-1 gap-6' aria-label='Primary'>
          {SCREENS.map((item) => {
            const current = item === screen;
            const wired = IMPLEMENTED_SCREENS.includes(item);
            return (
              <button
                key={item}
                type='button'
                aria-current={current ? 'page' : undefined}
                onClick={() => {
                  onScreenChange(item);
                }}
                className={cn(
                  'cursor-pointer border-b-2 px-0.5 py-5 font-heading text-h5 font-semibold',
                  current
                    ? 'border-accent text-ink'
                    : 'border-transparent text-ink/55 hover:text-accent-700',
                )}
              >
                {item}
                {wired ? null : (
                  <>
                    <span className='ml-1 align-super text-[9px] text-ink/35' aria-hidden='true'>
                      ●
                    </span>
                    <VisuallyHidden> (not implemented)</VisuallyHidden>
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {scope}
        <Button
          variant='primary'
          className='flex-none whitespace-nowrap'
          onClick={onNewTransaction}
        >
          <Plus className='size-3.5' aria-hidden='true' />
          New transaction
        </Button>
      </div>
    </header>
  );
}
