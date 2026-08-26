import { type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

const VARIANT = {
  accent: 'bg-accent-100 text-accent-800',
  accent2: 'bg-accent-2-100 text-accent-2-800',
  neutral: 'bg-neutral-100 text-neutral-800',
  outline: 'border border-accent text-accent-700',
} as const;

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof VARIANT;
}

export function Tag({ variant = 'neutral', className, ...rest }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[calc(var(--radius-md)*0.75)] px-[10px] py-[3px] text-meta tracking-[0.02em]',
        VARIANT[variant],
        className,
      )}
      {...rest}
    />
  );
}
