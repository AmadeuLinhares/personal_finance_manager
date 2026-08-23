import { type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

/**
 * Text for assistive technology only.
 *
 * Deliberately not `display: none` and not an `aria-label`: it stays in the
 * accessibility tree *and* in the reading order, which is what a table cell or a
 * status line needs — an `aria-label` on a cell would replace the figure the
 * sighted reader sees instead of explaining it.
 *
 * Accepts `role`, so a live region is `<VisuallyHidden role='status'>`.
 */
export function VisuallyHidden({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('sr-only', className)} {...rest} />;
}
