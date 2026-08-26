import { cn } from '../lib/cn';
import { type Currency, formatMoney } from '../lib/format';

export interface MoneyProps {
  minorUnits: number;
  currency?: Currency;
  signed?: boolean;
  colorInflow?: boolean;
  className?: string;
}

export function Money({
  minorUnits,
  currency = 'CAD',
  signed = false,
  colorInflow = true,
  className,
}: MoneyProps) {
  return (
    <span
      className={cn(
        'whitespace-nowrap tabular-nums',
        colorInflow && minorUnits > 0 && 'text-accent-700',
        className,
      )}
    >
      {formatMoney(minorUnits, currency, { signed })}
    </span>
  );
}
