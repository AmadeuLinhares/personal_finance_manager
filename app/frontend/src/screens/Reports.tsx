import {
  Bar,
  DatePicker,
  Divider,
  EmptyState,
  ErrorState,
  Kicker,
  Money,
  Notice,
  Segmented,
  SegmentedOption,
  Skeleton,
  Table,
  Tag,
  Td,
  Tr,
  toIsoMonth,
} from '@pfm/ui';
import { useMemo, useState } from 'react';

import type { CategoryTotals, Minor } from '@/http/api-types';
import { useGetCategories } from '@/http/queries/categories/useGetCategories';
import { useGetMonthlyExpenses } from '@/http/queries/reports/useGetMonthlyExpenses';

/** The two currencies the seed actually holds — there are no FX rates to sum. */
const CURRENCIES = ['CAD', 'USD'] as const;

type ReportCurrency = (typeof CURRENCIES)[number];

/** One row of the bar list, after the leaf-or-parent decision has been made. */
interface CategoryRow {
  key: string;
  name: string;
  outflow: Minor;
  budget: Minor | null;
  overBudget: boolean;
}

const leafRow = (category: CategoryTotals): CategoryRow => ({
  key: category.categoryId ?? 'uncategorised',
  name: category.name,
  outflow: category.outflow,
  budget: category.budget ?? null,
  overBudget: category.overBudget ?? false,
});

/**
 * Child categories arrive as themselves, carrying `parentId` — the API leaves the
 * roll-up to the client on purpose. Both readings are defensible ("Rent went
 * over" and "Housing went over"), so the choice is the user's, not ours.
 *
 * Budgets add up the same way the spend does: a parent's total budget is the sum
 * of the budgets that were actually set, and stays unbudgeted while none were.
 */
const rollUpRows = (categories: CategoryTotals[], names: Map<string, string>): CategoryRow[] => {
  const merged = new Map<string, CategoryRow>();

  for (const category of categories) {
    const row = leafRow(category);
    const key = category.parentId ?? row.key;
    const name = category.parentId === null ? row.name : (names.get(category.parentId) ?? row.name);
    const previous = merged.get(key);

    const outflow = (previous?.outflow ?? 0) + row.outflow;
    const budget =
      previous?.budget === null || previous?.budget === undefined
        ? row.budget
        : previous.budget + (row.budget ?? 0);

    merged.set(key, {
      key,
      name,
      outflow,
      budget,
      overBudget: budget !== null && outflow > budget,
    });
  }

  return [...merged.values()].sort((a, b) => b.outflow - a.outflow);
};

export function Reports() {
  const [month, setMonth] = useState(() => toIsoMonth(new Date()));
  const [currency, setCurrency] = useState<ReportCurrency>('CAD');
  const [rolledUp, setRolledUp] = useState(false);

  // Only for the parent names: the report knows `parentId`, never the label.
  const categoriesQuery = useGetCategories();
  const canRollUp = categoriesQuery.data !== undefined;

  const { data, error, isPending, isError, isFetching, refetch } = useGetMonthlyExpenses(
    { from: month, to: month, currency },
    // Changing month replaces the numbers; it should not blank the page first.
    { placeholderData: (previous) => previous },
  );

  const report = data?.months[0];

  const rows = useMemo(() => {
    // A category with no outflow (salary, say) is income, not an expense row.
    const expenses = (report?.byCategory ?? []).filter((category) => category.outflow > 0);
    if (!rolledUp || !canRollUp) return expenses.map(leafRow);

    // `canRollUp` above already narrowed this to a loaded list.
    const names = new Map(
      categoriesQuery.data.data.map((category) => [category.id, category.name]),
    );
    return rollUpRows(expenses, names);
  }, [report, rolledUp, canRollUp, categoriesQuery.data]);

  /** Unbudgeted rows are scaled against the largest row, so the bars compare. */
  const widest = rows[0]?.outflow ?? 0;

  const excluded = data?.excluded;
  const excludedParts = [
    { count: excluded?.transferLegs ?? 0, label: 'transfer legs' },
    { count: excluded?.otherCurrencyTransactions ?? 0, label: 'other-currency' },
    { count: excluded?.outOfScopeTransactions ?? 0, label: 'out of scope' },
    { count: excluded?.pendingTransactions ?? 0, label: 'pending' },
  ].filter((part) => part.count > 0);

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='font-heading text-h2 font-semibold'>Expenses by category</h2>
          <p className='text-ui-sm text-ink/55'>
            {data === undefined
              ? `${currency} · one month, one currency`
              : `${data.currency} · ${String(data.scope.accountIds.length)} accounts · ${
                  data.scope.includesPending ? 'pending included' : 'pending excluded'
                } · ${data.scope.includesTransfers ? 'transfers included' : 'transfers excluded'}`}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <Segmented label='Currency'>
            {CURRENCIES.map((option) => (
              <SegmentedOption
                key={option}
                name='report-currency'
                checked={currency === option}
                onChange={() => {
                  setCurrency(option);
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
                // Rolling up needs the parent names, which is a second request.
                disabled={option && !canRollUp}
                onChange={() => {
                  setRolledUp(option);
                }}
              >
                {option ? 'Rolled up' : 'Leaf'}
              </SegmentedOption>
            ))}
          </Segmented>

          <DatePicker
            mode='month'
            aria-label='Report month'
            className='w-[160px]'
            value={month}
            onChange={(next) => {
              setMonth(next ?? toIsoMonth(new Date()));
            }}
          />
        </div>
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
            {rows.length === 0 ? (
              <EmptyState
                className='py-8'
                title='No expenses this month'
                description={`Nothing in ${currency} for this month — try another month or the other currency.`}
              />
            ) : (
              <>
                <div className='flex flex-col gap-3'>
                  {rows.map((row) => (
                    <div key={row.key}>
                      <div className='mb-1.5 flex justify-between gap-2 text-ui'>
                        <span>
                          {row.name}
                          {row.overBudget ? (
                            <Tag variant='accent' className='ml-1'>
                              over budget
                            </Tag>
                          ) : null}
                        </span>
                        <span className='whitespace-nowrap tabular-nums'>
                          <Money minorUnits={row.outflow} currency={currency} colorInflow={false} />{' '}
                          {row.budget === null ? (
                            <span className='text-ink/55'>unbudgeted</span>
                          ) : (
                            <span className='text-ink/55'>
                              of{' '}
                              <Money
                                minorUnits={row.budget}
                                currency={currency}
                                colorInflow={false}
                              />
                            </span>
                          )}
                        </span>
                      </div>
                      <Bar spent={row.outflow} budget={row.budget ?? widest} />
                    </div>
                  ))}
                </div>

                <Divider />

                <div className='flex flex-wrap items-baseline justify-between gap-3'>
                  <Notice variant='muted' className='border-0 px-0'>
                    {excludedParts.length === 0
                      ? 'Nothing was excluded from this report.'
                      : `Excluded from this report: ${excludedParts
                          .map((part) => `${String(part.count)} ${part.label}`)
                          .join(' · ')}`}
                  </Notice>
                  <span className='font-heading text-[28px] font-semibold whitespace-nowrap tabular-nums'>
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

          <section>
            <Kicker>Month totals</Kicker>
            <Divider className='mt-2 mb-0' />
            <Table>
              <tbody>
                <Tr>
                  <Td>Outflow</Td>
                  <Td numeric>
                    <Money
                      minorUnits={-(report?.outflow ?? 0)}
                      currency={currency}
                      colorInflow={false}
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    Inflow <span className='text-ink/55'>(incl. refunds)</span>
                  </Td>
                  <Td numeric>
                    <Money
                      minorUnits={report?.inflow ?? 0}
                      currency={currency}
                      colorInflow={false}
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td>Net</Td>
                  <Td numeric>
                    <Money minorUnits={report?.net ?? 0} currency={currency} signed />
                  </Td>
                </Tr>
                <Tr>
                  <Td>Transactions counted</Td>
                  <Td numeric>{report?.transactionCount ?? 0}</Td>
                </Tr>
              </tbody>
            </Table>
            <p className='mt-3 text-ui-sm text-pretty text-ink/55'>
              Classification follows the sign of the amount, not the category&apos;s kind — a refund
              shows as inflow inside an expense category. Uncategorised spend is a normal row, not a
              separate bucket.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
