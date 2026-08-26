import { type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children: ReactNode;
}

export function Radio({ className, children, ...rest }: RadioProps) {
  return (
    <label className={cn('group inline-flex cursor-pointer items-center gap-2 text-ui', className)}>
      <input type='radio' className='pointer-events-none absolute size-0 opacity-0' {...rest} />
      <span
        className={cn(
          'size-4 flex-none rounded-full border-[1.5px] border-divider',
          'group-hover:border-accent',
          'group-has-checked:border-accent group-has-checked:bg-accent',
          'group-has-checked:shadow-[inset_0_0_0_4px_var(--color-bg)]',
          'group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-2',
          'group-has-[:focus-visible]:outline-accent',
        )}
      />
      {children}
    </label>
  );
}
