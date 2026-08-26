import {
  type HTMLAttributes,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';

import { cn } from '../lib/cn';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  caption?: ReactNode;
}

export function Table({ caption, className, children, ...rest }: TableProps) {
  return (
    <table className={cn('w-full border-collapse text-ui', className)} {...rest}>
      {caption ? <caption className='sr-only'>{caption}</caption> : null}
      {children}
    </table>
  );
}

export interface CellProps {
  numeric?: boolean;
}

export function Th({
  numeric = false,
  scope = 'col',
  className,
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & CellProps) {
  return (
    <th
      scope={scope}
      className={cn(
        'border-b border-divider p-2 text-meta tracking-[0.08em] text-ink/70 uppercase',
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
