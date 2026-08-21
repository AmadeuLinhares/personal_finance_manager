import { cn } from '../lib/cn';
import { type Currency, formatMoney } from '../lib/format';

export interface MoneyProps {
  /** Integer minor units, exactly as the API stores them. */
  minorUnits: number;
  currency?: Currency;
  /** Show a + on positive amounts. Ledgers want it; balances do not. */
  signed?: boolean;
  /**
   * Colour inflows accent-700. Outflows always stay ink — the sign carries the
   * direction, colour only highlights money coming in.
   */
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
