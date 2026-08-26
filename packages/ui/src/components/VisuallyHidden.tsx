import { type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export function VisuallyHidden({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('sr-only', className)} {...rest} />;
}
