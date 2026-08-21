import { type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export function Table({ className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-ui', className)} {...rest} />;
}

export interface CellProps {
  /**
   * Figures get tabular numerals and no wrap, so a column of amounts lines up.
   * Also right-aligns, which is what a numeric column always wants.
   */
  numeric?: boolean;
}

export function Th({
  numeric = false,
  className,
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & CellProps) {
  return (
    <th
      className={cn(
        'border-b border-divider p-2 text-meta tracking-[0.08em] text-ink/60 uppercase',
        numeric ? 'text-right' : 'text-left',
        className,
      )}
      {...rest}
    />
  );
}

export function Td({
  numeric = false,
  className,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & CellProps) {
  return (
    <td
      className={cn(
        'border-b border-divider p-2',
        numeric && 'text-right whitespace-nowrap tabular-nums',
        className,
      )}
      {...rest}
    />
  );
}

export function Tr({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('hover:bg-ink/4', className)} {...rest} />;
}
