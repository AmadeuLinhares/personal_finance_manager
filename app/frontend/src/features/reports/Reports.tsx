import {
  Divider,
  EmptyState,
  ErrorState,
  Money,
  Notice,
  Skeleton,
  VisuallyHidden,
  formatMonth,
  toIsoMonth,
} from '@pfm/ui';
import { useMemo, useState } from 'react';

import { CategoryBars } from './components/CategoryBars';
import { MonthTotals } from './components/MonthTotals';
import { ReportControls } from './components/ReportControls';
import { type ReportCurrency } from './constants';
import { toCategoryRows } from './utils/categoryRows';
import { describeExcluded } from './utils/excluded';
import { REPORT_SCOPE } from '@/constants/reports';
import { useGetCategories } from '@/http/queries/categories/useGetCategories';
import { useGetMonthlyExpenses } from '@/http/queries/reports/useGetMonthlyExpenses';

export function Reports() {
  const [month, setMonth] = useState(() => toIsoMonth(new Date()));
  const [currency, setCurrency] = useState<ReportCurrency>('CAD');
  const [rolledUp, setRolledUp] = useState(false);

  const categoriesQuery = useGetCategories();
  const categories = categoriesQuery.data?.data;
  const canRollUp = categories !== undefined;

  const { data, error, isPending, isError, isFetching, refetch } = useGetMonthlyExpenses(
    { ...REPORT_SCOPE, from: month, to: month, currency },
    { placeholderData: (previous) => previous },
  );

  const report = data?.months[0];

  const rows = useMemo(
    () =>
      toCategoryRows(report?.byCategory ?? [], {
        rolledUp,
        parentNames:
          categories === undefined
            ? null
            : new Map<string, string>(categories.map((category) => [category.id, category.name])),
      }),
    [report, rolledUp, categories],
  );

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='font-heading text-h2 font-semibold'>Expenses by category</h2>
          <p className='text-ui-sm text-ink/70'>
            {data === undefined
              ? `${currency} · one month, one currency`
              : `${data.currency} · ${String(data.scope.accountIds.length)} accounts · ${
                  data.scope.includesPending ? 'pending included' : 'pending excluded'
                } · ${data.scope.includesTransfers ? 'transfers included' : 'transfers excluded'}`}
          </p>
        </div>

        <ReportControls
          month={month}
          currency={currency}
          rolledUp={rolledUp}
          canRollUp={canRollUp}
          onMonthChange={setMonth}
          onCurrencyChange={setCurrency}
          onRolledUpChange={setRolledUp}
        />
      </div>

      <Divider />

      {categoriesQuery.isError ? (
        <Notice className='mb-3'>
          Category names are unavailable ({categoriesQuery.error.data.code}) — the report is still
          correct, but child categories cannot be rolled up into their parents.
        </Notice>
      ) : null}

      {isPending ? (
        <Skeleton lines={10} label='Loading the report…' />
      ) : isError ? (
        <ErrorState
          title={`Could not load the report — ${error.data.code}`}
          description={error.data.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : (
        <div className='grid gap-8 lg:grid-cols-[1.4fr_1fr]' aria-busy={isFetching}>
          <section>
            <p className='mb-3 text-ui-sm text-ink/70' role='status'>
              {`${formatMonth(month)} · ${String(rows.length)} ${
                rows.length === 1 ? 'category' : 'categories'
              } · ${rolledUp && canRollUp ? 'rolled up into parents' : 'as reported'}${
                isFetching ? ' · updating…' : ''
              }`}
            </p>

            {rows.length === 0 ? (
              <EmptyState
                className='py-8'
                title='No expenses this month'
                description={`Nothing in ${currency} for this month — try another month or the other currency.`}
              />
            ) : (
              <>
                <CategoryBars rows={rows} currency={currency} />

                <Divider />

                <div className='flex flex-wrap items-baseline justify-between gap-3'>
                  <Notice variant='muted' className='border-0 px-0'>
                    {describeExcluded(data.excluded)}
                  </Notice>
                  <span className='font-heading text-[28px] font-semibold whitespace-nowrap tabular-nums'>
                    <VisuallyHidden>Total outflow this month: </VisuallyHidden>
                    <Money
                      minorUnits={-(report?.outflow ?? 0)}
                      currency={currency}
                      colorInflow={false}
                    />
                  </span>
                </div>
              </>
            )}
          </section>

          <MonthTotals report={report} currency={currency} />
        </div>
      )}
    </>
  );
}
