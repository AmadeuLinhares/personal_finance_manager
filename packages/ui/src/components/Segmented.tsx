import { type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';

export function Segmented({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'inline-flex self-start overflow-hidden rounded-md border border-divider',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface SegmentedOptionProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children: ReactNode;
}

/** One choice in a Segmented. Selection is carried by the native radio. */
export function SegmentedOption({ className, children, ...rest }: SegmentedOptionProps) {
  return (
    <label
      className={cn(
        'px-2.6 inline-flex cursor-pointer items-center gap-1.5 py-1.5 text-ui-sm',
        'border-l border-divider first:border-l-0',
        'has-checked:text-accent has-checked:shadow-[inset_0_0_0_1px_var(--color-accent)]',
        'not-has-checked:hover:bg-ink/7',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2',
        'has-[:focus-visible]:outline-accent',
        className,
      )}
    >
      <input type='radio' className='pointer-events-none absolute size-0 opacity-0' {...rest} />
      {children}
    </label>
  );
}
