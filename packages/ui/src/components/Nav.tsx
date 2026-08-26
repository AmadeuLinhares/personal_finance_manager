import { type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';

export function Nav({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn('flex items-center gap-4 border-b border-divider px-4 py-3', className)}
      {...rest}
    />
  );
}

export function NavBrand({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn('font-semibold mr-auto font-heading text-[18px]', className)}>
      {children}
    </span>
  );
}

export function NavLink({ className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        'text-ui text-inherit no-underline hover:text-accent-700 aria-[current=page]:text-accent-700',
        className,
      )}
      {...rest}
    />
  );
}
