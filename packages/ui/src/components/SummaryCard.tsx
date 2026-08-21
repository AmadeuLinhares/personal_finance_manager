import { Card, CardKicker, CardMeta, CardTitle } from './Card';
import { Money } from './Money';
import { type Currency } from '../lib/format';

export interface SummaryCardProps {
  /** What the figure is — account name, or the span a total covers. */
  label: string;
  /** The headline figure, in integer minor units. */
  minorUnits: number;
  currency?: Currency;
  /**
   * The decomposition: pending, available credit, change vs the starting
   * balance. The headline is `available`; this line explains it.
   */
  meta?: string;
  className?: string;
}

/**
 * The balance card. Negative is honest here — overdrawn, or owed on a card — so
 * the figure is never abs()'d and inflow colouring is off: a balance is a
 * position, not a movement.
 */
export function SummaryCard({ label, minorUnits, currency, meta, className }: SummaryCardProps) {
  return (
    <Card className={className}>
      <CardKicker>{label}</CardKicker>
      <CardTitle className='text-[28px] whitespace-nowrap tabular-nums'>
        <Money minorUnits={minorUnits} currency={currency} colorInflow={false} />
      </CardTitle>
      {meta ? <CardMeta className='tabular-nums'>{meta}</CardMeta> : null}
    </Card>
  );
}
