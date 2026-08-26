import { DatePicker, Segmented, SegmentedOption, VisuallyHidden, toIsoMonth } from '@pfm/ui';

import { CURRENCIES, type ReportCurrency } from '../constants';

export interface ReportControlsProps {
  month: string;
  currency: ReportCurrency;
  rolledUp: boolean;
  canRollUp: boolean;
  onMonthChange: (month: string) => void;
  onCurrencyChange: (currency: ReportCurrency) => void;
  onRolledUpChange: (rolledUp: boolean) => void;
}

export function ReportControls({
  month,
  currency,
  rolledUp,
  canRollUp,
  onMonthChange,
  onCurrencyChange,
  onRolledUpChange,
}: ReportControlsProps) {
  return (
    <div className='flex flex-wrap items-center gap-3'>
      <Segmented label='Currency'>
        {CURRENCIES.map((option) => (
          <SegmentedOption
            key={option}
            name='report-currency'
            checked={currency === option}
            onChange={() => {
              onCurrencyChange(option);
            }}
          >
            {option}
          </SegmentedOption>
        ))}
      </Segmented>

      <Segmented label='Group categories'>
        {([false, true] as const).map((option) => (
          <SegmentedOption
            key={String(option)}
            name='report-grouping'
            checked={rolledUp === option}
            disabled={option && !canRollUp}
            onChange={() => {
              onRolledUpChange(option);
            }}
          >
            {option ? 'Rolled up' : 'Leaf'}
            {option && !canRollUp ? (
              <VisuallyHidden> — unavailable until the category names load</VisuallyHidden>
            ) : null}
          </SegmentedOption>
        ))}
      </Segmented>

      <DatePicker
        mode='month'
        aria-label='Report month'
        className='w-[160px]'
        value={month}
        onChange={(next) => {
          onMonthChange(next ?? toIsoMonth(new Date()));
        }}
      />
    </div>
  );
}
