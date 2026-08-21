import { type HTMLAttributes, type ReactNode, useEffect } from 'react';

import { cn } from '../lib/cn';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Buttons, rendered flush right under a gap. */
  actions?: ReactNode;
  className?: string;
}

/**
 * A modal at the top elevation. Escape and a backdrop click both close it; the
 * caller owns the open state.
 */
export function Dialog({ open, onClose, title, children, actions, className }: DialogProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className='fixed inset-0 grid place-items-center bg-neutral-900/50 p-4'
      onClick={onClose}
      role='presentation'
    >
      <div
        role='dialog'
        aria-modal='true'
        className={cn(
          'flex w-[min(440px,100%)] flex-col gap-3 rounded-lg border border-divider',
          'bg-surface p-4 shadow-lg',
          className,
        )}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className='font-semibold font-heading text-[20px]'>{title}</div>
        <div className='text-ui opacity-85'>{children}</div>
        {actions ? <div className='mt-2 flex justify-end gap-2'>{actions}</div> : null}
      </div>
    </div>
  );
}

export function Divider({ className, ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('my-4 h-px border-0 bg-divider', className)} {...rest} />;
}
