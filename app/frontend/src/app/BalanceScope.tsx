import { DatePicker, Money, VisuallyHidden, toIsoDate } from '@pfm/ui';
import { useState } from 'react';

import { useGetAccounts } from '@/http/queries/accounts/useGetAccounts';

/**
 * "The balance", and the date it is the balance on.
 *
 * This is user story 2, and it lives in the header rather than on a screen of
 * its own because a balance is not a destination — it is the number every other
 * screen is read against.
 *
 * Balances are derived server-side from the whole ledger, so asking for a past
 * date is the same code path as asking for today. Nothing is recomputed here,
 * and `asOf` is part of the query key so yesterday's answer never overwrites
 * today's in the cache.
 */
export function BalanceScope() {
  const today = toIsoDate(new Date());
  const [asOf, setAsOf] = useState(today);

  const { data, isPending, isError } = useGetAccounts({ asOf, includeBalances: true });

  const cad = data?.meta.totalsByCurrency.CAD;

  return (
    <div className='hidden items-center gap-2 text-ui-sm whitespace-nowrap text-ink/55 lg:flex'>
      <span>Balance as of</span>

      <DatePicker
        aria-label='Balance as of'
        className='w-[150px]'
        max={today}
        value={asOf}
        onChange={(next) => {
          // Clearing means "now" — there is no such thing as no date here.
          setAsOf(next ?? today);
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
            {/* Two currencies are never summed: there are no FX rates here. */}
            <VisuallyHidden>
              {` available across ${String(cad.accountCount)} CAD accounts, pending included`}
            </VisuallyHidden>
          </>
        )}
      </span>
    </div>
  );
}
