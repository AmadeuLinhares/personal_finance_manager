import { DateText, Divider, formatMonth, toIsoMonth } from '@pfm/ui';

import { AccountCards } from './components/AccountCards';
import { Panel } from './components/Panel';
import { ProjectionSummary } from './components/ProjectionSummary';
import { SpendingList } from './components/SpendingList';
import { UpcomingList } from './components/UpcomingList';
import { HORIZON, PREVIEW_ROWS } from './constants';
import { describeTotals } from './utils/balanceLines';
import { topCategories } from './utils/topCategories';
import { unsettled } from './utils/unsettled';
import { type Destination } from '@/constants/screens';
import { useGetAccounts } from '@/http/queries/accounts/useGetAccounts';
import { useGetBudgetProjection } from '@/http/queries/projections/useGetBudgetProjection';
import { useGetMonthlyExpenses } from '@/http/queries/reports/useGetMonthlyExpenses';
import { useGetOccurrences } from '@/http/queries/scheduled-items/useGetOccurrences';
import { endOfMonthsAhead, startOfThisMonth } from '@/utils/window';

export interface OverviewProps {
  asOf: string;
  onGo: (screen: Destination) => void;
}

export function Overview({ asOf, onGo }: OverviewProps) {
  const month = toIsoMonth(new Date());
  const from = startOfThisMonth();
  const to = endOfMonthsAhead(HORIZON);

  const accountsQuery = useGetAccounts({ asOf, includeBalances: true });
  const expensesQuery = useGetMonthlyExpenses({ from: month, to: month, currency: 'CAD' });
  const occurrencesQuery = useGetOccurrences({ from, to });
  const projectionQuery = useGetBudgetProjection({ to, granularity: 'month' });

  const accounts = accountsQuery.data?.data ?? [];
  const report = expensesQuery.data?.months[0];
  const spending = topCategories(report?.byCategory ?? [], PREVIEW_ROWS);
  const occurrences = occurrencesQuery.data?.occurrences ?? [];
  const upcoming = unsettled(occurrences, PREVIEW_ROWS);
  const totals = occurrencesQuery.data?.totals;
  const projection = projectionQuery.data;

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h2 className='font-heading text-h2 font-semibold'>Overview</h2>
          <p className='max-w-[620px] text-ui-sm text-pretty text-ink/70'>
            What the other three screens say, on one page — each panel is a preview of the screen
            that owns it
          </p>
        </div>
        <p className='text-ui-sm text-ink/70'>
          Balances as of <DateText value={asOf} year /> — the date in the header
        </p>
      </div>

      <Divider />

      <Panel
        title='Accounts'
        isPending={accountsQuery.isPending}
        error={accountsQuery.error}
        onRetry={() => {
          void accountsQuery.refetch();
        }}
        empty={accounts.length === 0 ? 'No accounts yet' : undefined}
        busy={accountsQuery.isFetching}
        loadingLines={4}
        link={{
          label: 'Open the ledger',
          onClick: () => {
            onGo('Transactions');
          },
        }}
      >
        <AccountCards accounts={accounts} />
        <p className='mt-3 text-ui-sm text-ink/70 tabular-nums' role='status'>
          {describeTotals(accountsQuery.data?.meta.totalsByCurrency ?? {})}
          {accountsQuery.isFetching ? ' · updating…' : ''}
        </p>
      </Panel>

      <div className='mt-8 grid gap-8 lg:grid-cols-3'>
        <Panel
          title={`Spending · ${formatMonth(month)}`}
          subject='the month'
          isPending={expensesQuery.isPending}
          error={expensesQuery.error}
          onRetry={() => {
            void expensesQuery.refetch();
          }}
          empty={spending.length === 0 ? 'Nothing spent in CAD this month' : undefined}
          link={{
            label: 'Full report',
            onClick: () => {
              onGo('Reports');
            },
          }}
        >
          <SpendingList rows={spending} />
          <p className='mt-3 text-ui-sm text-ink/70' role='status'>
            {`Top ${String(spending.length)} of ${String(report?.byCategory.length ?? 0)} categories, CAD, transfers excluded`}
          </p>
        </Panel>

        <Panel
          title='Upcoming'
          isPending={occurrencesQuery.isPending}
          error={occurrencesQuery.error}
          onRetry={() => {
            void occurrencesQuery.refetch();
          }}
          empty={upcoming.length === 0 ? 'Nothing waiting on a decision' : undefined}
          link={{
            label: 'All scheduled',
            onClick: () => {
              onGo('Planning');
            },
          }}
        >
          <UpcomingList occurrences={upcoming} />
          <p className='mt-3 text-ui-sm text-ink/70 tabular-nums' role='status'>
            {totals !== undefined && totals.overdueCount > 0
              ? `${String(totals.overdueCount)} overdue · `
              : ''}
            {`${String(occurrences.length)} occurrences to `}
            <DateText value={to} year />
          </p>
        </Panel>

        <Panel
          title={`Projection · ${String(HORIZON)} months`}
          subject='the projection'
          isPending={projectionQuery.isPending}
          error={projectionQuery.error}
          onRetry={() => {
            void projectionQuery.refetch();
          }}
          link={{
            label: 'Open planning',
            onClick: () => {
              onGo('Planning');
            },
          }}
        >
          {projection === undefined ? null : <ProjectionSummary projection={projection} />}
        </Panel>
      </div>
    </>
  );
}
