import { cn } from '../lib/cn';
import { formatDate } from '../lib/format';

export interface DateTextProps {
  value: string;
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
