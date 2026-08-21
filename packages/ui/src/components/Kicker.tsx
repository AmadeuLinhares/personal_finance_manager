import { type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

/** The small caps label that opens a section. */
export function Kicker({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h6
      className={cn(
        'font-semibold m-0 font-heading text-h6 tracking-[0.08em] text-accent-700 uppercase',
        className,
      )}
      {...rest}
    />
  );
}
