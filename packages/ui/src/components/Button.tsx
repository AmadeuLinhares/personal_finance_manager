import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';

const BASE =
  'inline-flex items-center justify-center gap-1.5 cursor-pointer font-heading font-semibold ' +
  'text-ui rounded-md border border-transparent transition-colors ' +
  'disabled:opacity-45 disabled:cursor-not-allowed';

/** Primary is an accent outline, never a fill — the system draws with strokes. */
const VARIANT = {
  primary:
    'text-accent border-accent hover:bg-accent/12 active:bg-accent/22 ' +
    'disabled:hover:bg-transparent',
  secondary:
    'text-ink border-divider hover:bg-ink/7 active:bg-ink/14 disabled:hover:bg-transparent',
  ghost: 'text-accent px-1 hover:bg-accent/10 active:bg-accent/18 disabled:hover:bg-transparent',
} as const;

const PADDING = {
  md: 'px-3.6 py-2',
  sm: 'px-3 py-1 text-ui-sm',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANT;
  size?: keyof typeof PADDING;
  /** Square 36x36, for a lone icon. Requires an aria-label. */
  icon?: boolean;
  /** Full width, for the end of a form. */
  block?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon = false,
  block = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        BASE,
        VARIANT[variant],
        icon ? 'size-9 p-0' : PADDING[size],
        block && 'mt-2 w-full',
        className,
      )}
      {...rest}
    />
  );
}
