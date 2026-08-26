import { Card, CardKicker, CardMeta, CardTitle } from './Card';
import { Money } from './Money';
import { type Currency } from '../lib/format';

export interface SummaryCardProps {
  label: string;
  minorUnits: number;
  currency?: Currency;
  meta?: string;
  className?: string;
}

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
