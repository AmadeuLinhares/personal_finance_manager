import { type HTMLAttributes, type ReactNode, useEffect, useId, useRef } from 'react';

import { cn } from '../lib/cn';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function Dialog({ open, onClose, title, children, actions, className }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    return () => {
      returnTo?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
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
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'flex w-[min(440px,100%)] flex-col gap-3 rounded-lg border border-divider',
          'bg-surface p-4 shadow-lg',
          className,
        )}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div id={titleId} className='font-semibold font-heading text-[20px]'>
          {title}
        </div>
        <div className='text-ui opacity-85'>{children}</div>
        {actions ? <div className='mt-2 flex justify-end gap-2'>{actions}</div> : null}
      </div>
    </div>
  );
}

export function Divider({ className, ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('my-4 h-px border-0 bg-divider', className)} {...rest} />;
}
