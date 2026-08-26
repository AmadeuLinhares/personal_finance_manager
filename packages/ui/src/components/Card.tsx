import { type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

const ELEVATION = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
} as const;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: keyof typeof ELEVATION;
}

export function Card({ elevation = 'none', className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-md border border-divider bg-transparent p-3',
        ELEVATION[elevation],
        className,
      )}
      {...rest}
    />
  );
}

export function CardKicker({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('text-micro tracking-[0.1em] text-accent uppercase', className)}
      {...rest}
    />
  );
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('text-[17px]/tight font-semibold font-heading', className)} {...rest} />
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('m-0 flex-1 text-ui-sm opacity-80', className)} {...rest} />;
}

export function CardMeta({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('flex items-center gap-1.5 text-meta text-ink/50', className)} {...rest} />
  );
}
