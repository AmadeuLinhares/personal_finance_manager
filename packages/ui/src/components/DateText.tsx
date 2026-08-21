import { cn } from '../lib/cn';
import { formatDate } from '../lib/format';

export interface DateTextProps {
  /** A calendar date, `YYYY-MM-DD`. Never a Date or a timestamp. */
  value: string;
  /** Append the year. Off by default — a ledger of one month does not need it. */
  year?: boolean;
  className?: string;
}

export function DateText({ value, year = false, className }: DateTextProps) {
  return (
    <time dateTime={value} className={cn('whitespace-nowrap tabular-nums', className)}>
      {formatDate(value, { year })}
    </time>
  );
}
