import {
  Button,
  DatePicker,
  DateText,
  Divider,
  EmptyState,
  ErrorState,
  Kicker,
  Money,
  Notice,
  Skeleton,
} from '@pfm/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { OccurrenceTable } from './components/OccurrenceTable';
import { ProjectionPanel } from './components/ProjectionPanel';
import { useOccurrenceActions } from './hooks/useOccurrenceActions';
import { describeUnsummed, toOccurrenceTotals } from './utils/occurrenceTotals';
import { useGetBudgetProjection } from '@/http/queries/projections/useGetBudgetProjection';
import { useGetOccurrences } from '@/http/queries/scheduled-items/useGetOccurrences';
import { endOfMonthsAhead, startOfThisMonth } from '@/utils/window';

export interface PlanningProps {
  onSchedule: () => void;
}

export function Planning({ onSchedule }: PlanningProps) {
  const [from, setFrom] = useState(startOfThisMonth);
  const [to, setTo] = useState(() => endOfMonthsAhead(3));
  const actions = useOccurrenceActions();

  const occurrencesQuery = useGetOccurrences(
    { from, to },
    { placeholderData: (previous) => previous },
  );
  const projectionQuery = useGetBudgetProjection(
    { from, to, granularity: 'month' },
    { placeholderData: (previous) => previous },
  );

  const occurrences = occurrencesQuery.data?.occurrences ?? [];
  const totals = occurrencesQuery.data?.totals;
  const projection = projectionQuery.data;
  const currency = projection?.currency ?? 'CAD';
  const counted = toOccurrenceTotals(occurrences, currency);
  const unsummed = describeUnsummed(counted.unsummed);

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='font-heading text-h2 font-semibold'>Bills, income &amp; projection</h2>
          <p className='max-w-[620px] text-ui-sm text-pretty text-ink/70'>
            Rules, not rows — posting or skipping one date never touches the rule behind it
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <DatePicker
            aria-label='Window from'
            className='w-[170px]'
            max={to}
            value={from}
            onChange={(next) => {
              setFrom(next ?? startOfThisMonth());
            }}
          />
          <DatePicker
            aria-label='Window to'
            className='w-[170px]'
            min={from}
            value={to}
            onChange={(next) => {
              setTo(next ?? endOfMonthsAhead(3));
            }}
          />

          <Button variant='primary' className='whitespace-nowrap' onClick={onSchedule}>
            <Plus className='size-3.5' aria-hidden='true' />
            Schedule item
          </Button>
        </div>
      </div>

      <Divider />

      {actions.actionError === null ? null : (
        <Notice
          className='mb-3'
          action={
            <Button variant='ghost' size='sm' onClick={actions.dismissError}>
              Dismiss
            </Button>
          }
        >
          {actions.actionError}
        </Notice>
      )}

      {totals !== undefined && totals.overdueCount > 0 ? (
        <Notice className='mb-3'>
          {`${String(totals.overdueCount)} occurrence${totals.overdueCount === 1 ? ' is' : 's are'} overdue — due on or before today, and neither posted nor skipped.`}
        </Notice>
      ) : null}

      {projection?.goesNegative === true && projection.lowestPoint !== null ? (
        <Notice className='mb-3'>
          On commitments alone the balance goes negative — the lowest point is{' '}
          <Money
            minorUnits={projection.lowestPoint.balance}
            currency={projection.currency}
            colorInflow={false}
          />{' '}
          on <DateText value={projection.lowestPoint.date} year />.
        </Notice>
      ) : null}

      <div className='grid gap-8 lg:grid-cols-[1.15fr_1fr]'>
        <section>
          <Kicker>Occurrences</Kicker>

          {occurrencesQuery.isPending ? (
            <Skeleton lines={8} label='Loading occurrences…' />
          ) : occurrencesQuery.isError ? (
            <ErrorState
              title={`Could not load the occurrences — ${occurrencesQuery.error.data.code}`}
              description={occurrencesQuery.error.data.message}
              onRetry={() => {
                void occurrencesQuery.refetch();
              }}
            />
          ) : occurrences.length === 0 ? (
            <EmptyState
              className='py-8'
              title='Nothing scheduled in this window'
              description='Widen the window, or schedule an item — a rule starts generating dates immediately.'
            />
          ) : (
            <>
              <OccurrenceTable
                occurrences={occurrences}
                pendingKey={actions.pendingKey}
                isFetching={occurrencesQuery.isFetching}
                onPost={actions.post}
                onSkip={actions.skip}
                onUnskip={actions.unskip}
              />

              <p className='mt-2 text-ui-sm text-ink/70 tabular-nums' role='status'>
                {`${String(counted.count)} occurrences to `}
                <DateText value={to} year />
                {' · bills '}
                <Money minorUnits={-counted.outflow} currency={currency} colorInflow={false} />
                {' · income '}
                <Money minorUnits={counted.inflow} currency={currency} />
                {unsummed === '' ? '' : ` · ${unsummed}`}
                {occurrencesQuery.isFetching ? ' · updating…' : ''}
              </p>
            </>
          )}
        </section>

        <section>
          <Kicker>Budget projection</Kicker>
          <Divider className='mt-2 mb-3' />

          {projectionQuery.isPending ? (
            <Skeleton lines={6} label='Loading the projection…' />
          ) : projectionQuery.isError ? (
            <ErrorState
              title={`Could not load the projection — ${projectionQuery.error.data.code}`}
              description={projectionQuery.error.data.message}
              onRetry={() => {
                void projectionQuery.refetch();
              }}
            />
          ) : projection === undefined ? null : (
            <ProjectionPanel projection={projection} isFetching={projectionQuery.isFetching} />
          )}
        </section>
      </div>
    </>
  );
}
