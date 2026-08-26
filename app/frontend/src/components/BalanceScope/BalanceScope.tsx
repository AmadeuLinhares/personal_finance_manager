import { DatePicker, Money, VisuallyHidden } from '@pfm/ui';

import { useGetAccounts } from '@/http/queries/accounts/useGetAccounts';
import { today } from '@/utils/window';

export interface BalanceScopeProps {
  value: string;
  onChange: (asOf: string) => void;
}

export function BalanceScope({ value, onChange }: BalanceScopeProps) {
  const { data, isPending, isError } = useGetAccounts({ asOf: value, includeBalances: true });

  const cad = data?.meta.totalsByCurrency.CAD;

  return (
    <div className='hidden items-center gap-2 text-ui-sm whitespace-nowrap text-ink/55 lg:flex'>
      <span>Balance as of</span>

      <DatePicker
        aria-label='Balance as of'
        className='w-[150px]'
        max={today()}
        value={value}
        onChange={(next) => {
          onChange(next ?? today());
        }}
      />

      <span role='status' className='min-w-[110px] text-right tabular-nums'>
        {isPending ? (
          <span aria-hidden='true'>…</span>
        ) : isError ? (
          'unavailable'
        ) : cad === undefined ? (
          'no CAD accounts'
        ) : (
          <>
            <Money minorUnits={cad.available} colorInflow={false} className='text-ink' />
            <VisuallyHidden>
              {` available across ${String(cad.accountCount)} CAD accounts, pending included`}
            </VisuallyHidden>
          </>
        )}
      </span>
    </div>
  );
}
