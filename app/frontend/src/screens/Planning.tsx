import {
  Button,
  Card,
  CardKicker,
  CardMeta,
  CardTitle,
  DateText,
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
  Th,
  Tr,
  TrendChart,
  VisuallyHidden,
  formatMonth,
  toIsoDate,
} from '@pfm/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import type { Occurrence, OccurrenceStatus } from '@/http/api-types';
import type { FetchError } from '@/http/fetch/fetch';
import { usePostOccurrence } from '@/http/mutations/scheduledItems/usePostOccurrence';
import {
  useSkipOccurrence,
  useUnskipOccurrence,
} from '@/http/mutations/scheduledItems/useSkipOccurrence';
import { useGetBudgetProjection } from '@/http/queries/projections/useGetBudgetProjection';
import { useGetOccurrences } from '@/http/queries/scheduledItems/useGetOccurrences';

const STATUS_VARIANT: Record<OccurrenceStatus, 'accent' | 'neutral' | 'outline'> = {
  overdue: 'accent',
  scheduled: 'neutral',
  posted: 'outline',
  skipped: 'outline',
};

const HORIZONS = [3, 6] as const;

/**
 * The window starts at the first of this month, not today.
 *
 * Today is where the forecast begins, but it is not where the user's month
 * begins: what already went out this month is the context that makes the rest of
 * it readable, and an overdue bill from the 12th has to stay visible.
 */
const startOfThisMonth = () => {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
};

/** Day 0 of the following month is the last day of this one, in every month. */
const endOfMonthsAhead = (months: number) => {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth() + months + 1, 0));
};

/** Buckets are keyed `YYYY-MM` at month granularity; the axis wants `Aug`. */
const bucketLabel = (key: string) => formatMonth(key).slice(0, 3);

/** One occurrence is a rule plus a date — neither identifies it on its own. */
const occurrenceKey = (occurrence: Occurrence) =>
  `${occurrence.scheduledItemId}:${occurrence.date}`;

export interface PlanningProps {
  onSchedule: () => void;
}

export function Planning({ onSchedule }: PlanningProps) {
  const [horizon, setHorizon] = useState<number>(3);
  /** Which row is mid-flight, so only its own buttons go quiet. */
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const from = startOfThisMonth();
  const to = endOfMonthsAhead(horizon);

  const occurrencesQuery = useGetOccurrences(
    { from, to },
    { placeholderData: (previous) => previous },
  );
  const projectionQuery = useGetBudgetProjection(
    { to, granularity: 'month' },
    { placeholderData: (previous) => previous },
  );

  const post = usePostOccurrence();
  const skip = useSkipOccurrence();
  const unskip = useUnskipOccurrence();

  const occurrences = occurrencesQuery.data?.occurrences ?? [];
  const totals = occurrencesQuery.data?.totals;
  const projection = projectionQuery.data;

  /**
   * The starting balance is the balance the day before the forecast opens, so it
   * is the last point that actually happened. Everything after it is a closing
   * balance that already contains scheduled money, which is why the seam sits
   * here and not at the end of the partially-projected first bucket.
   */
  const series = projection
    ? [
        { label: 'Now', value: projection.startingBalance },
        ...projection.series.map((bucket) => ({
          label: bucketLabel(bucket.key),
          value: bucket.closingBalance,
        })),
      ]
    : [];

  const run = (
    occurrence: Occurrence,
    mutate: (
      variables: { scheduledItemId: string; date: string },
      handlers: { onError: (error: FetchError) => void; onSettled: () => void },
    ) => void,
  ) => {
    setActionError(null);
    setPendingKey(occurrenceKey(occurrence));

    mutate(
      { scheduledItemId: occurrence.scheduledItemId, date: occurrence.date },
      {
        onError: (error) => {
          setActionError(`${error.data.code} — ${error.data.message}`);
        },
        onSettled: () => {
          setPendingKey(null);
        },
      },
    );
  };

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='font-heading text-h2 font-semibold'>Bills, income &amp; projection</h2>
          <p className='max-w-[620px] text-ui-sm text-pretty text-ink/55'>
            Rules, not rows — posting or skipping one date never touches the rule behind it
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <Segmented label='Horizon'>
            {HORIZONS.map((months) => (
              <SegmentedOption
                key={months}
                name='horizon'
                checked={horizon === months}
                onChange={() => {
                  setHorizon(months);
                }}
              >
                {months} months
              </SegmentedOption>
            ))}
          </Segmented>

          <Button variant='primary' className='whitespace-nowrap' onClick={onSchedule}>
            <Plus className='size-3.5' aria-hidden='true' />
            Schedule item
          </Button>
        </div>
      </div>

      <Divider />

      {actionError === null ? null : (
        <Notice
          className='mb-3'
          action={
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setActionError(null);
              }}
            >
              Dismiss
            </Button>
          }
        >
          {actionError}
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
          <Money minorUnits={projection.lowestPoint.balance} colorInflow={false} /> on{' '}
          <DateText value={projection.lowestPoint.date} year />.
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
              description='Widen the horizon, or schedule an item — a rule starts generating dates immediately.'
            />
          ) : (
            <>
              <div className='overflow-x-auto' aria-busy={occurrencesQuery.isFetching}>
                <Table caption='Upcoming bills and income, earliest first'>
                  <thead>
                    <tr>
                      <Th>Due</Th>
                      <Th>Item</Th>
                      <Th>Status</Th>
                      <Th numeric>Amount</Th>
                      <Th numeric>
                        <VisuallyHidden>Actions</VisuallyHidden>
                      </Th>
                    </tr>
                  </thead>
                  <tbody>
                    {occurrences.map((occurrence) => {
                      const key = occurrenceKey(occurrence);
                      const open =
                        occurrence.status === 'overdue' || occurrence.status === 'scheduled';
                      const busy = pendingKey === key;
                      // Names the row, so "Post" is not one of thirty identical buttons.
                      const named = ` ${occurrence.name}, due ${occurrence.date}`;

                      return (
                        <Tr key={key}>
                          <Td numeric className='text-left'>
                            <DateText value={occurrence.date} />
                          </Td>
                          <Td>
                            {occurrence.name}
                            {occurrence.projectId === null ? null : (
                              <Tag variant='outline' className='ml-1.5'>
                                project
                              </Tag>
                            )}
                          </Td>
                          <Td>
                            <Tag variant={STATUS_VARIANT[occurrence.status]}>
                              {occurrence.status}
                            </Tag>
                          </Td>
                          <Td numeric className={open ? undefined : 'text-ink/55'}>
                            <Money minorUnits={occurrence.amount} signed />
                          </Td>
                          <Td numeric>
                            {open ? (
                              <>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  disabled={busy}
                                  onClick={() => {
                                    run(occurrence, post.mutate);
                                  }}
                                >
                                  Post
                                  <VisuallyHidden>{named}</VisuallyHidden>
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='text-ink'
                                  disabled={busy}
                                  onClick={() => {
                                    run(occurrence, skip.mutate);
                                  }}
                                >
                                  Skip
                                  <VisuallyHidden>{named}</VisuallyHidden>
                                </Button>
                              </>
                            ) : occurrence.status === 'skipped' ? (
                              <Button
                                variant='ghost'
                                size='sm'
                                disabled={busy}
                                onClick={() => {
                                  run(occurrence, unskip.mutate);
                                }}
                              >
                                Undo skip
                                <VisuallyHidden>{named}</VisuallyHidden>
                              </Button>
                            ) : null}
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              <p className='mt-2 text-ui-sm text-ink/55 tabular-nums' role='status'>
                {`${String(totals?.occurrenceCount ?? occurrences.length)} occurrences to `}
                <DateText value={to} year />
                {' · bills '}
                <Money minorUnits={-(totals?.outflow ?? 0)} colorInflow={false} />
                {' · income '}
                <Money minorUnits={totals?.inflow ?? 0} />
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
            <div aria-busy={projectionQuery.isFetching}>
              <TrendChart
                series={series}
                actualUpTo={0}
                label={`Projected CAD balance to ${projection.range.to}`}
              />
              <p className='mt-1 text-label text-ink/55'>
                Solid to <DateText value={projection.assumptions.actualsThrough} year /> — actuals.
                Dashed after it — commitments only.
              </p>

              <div className='mt-3 flex flex-wrap gap-3'>
                <Card className='flex-1'>
                  <CardKicker>Ending balance · {horizon} months</CardKicker>
                  <CardTitle className='text-[26px] tabular-nums'>
                    <Money minorUnits={projection.endingBalance} colorInflow={false} />
                  </CardTitle>
                  <CardMeta className='tabular-nums'>
                    <Money
                      minorUnits={projection.endingBalance - projection.startingBalance}
                      signed
                    />{' '}
                    vs today
                  </CardMeta>
                </Card>
                <Card className='flex-1'>
                  <CardKicker>Lowest point</CardKicker>
                  <CardTitle className='text-[26px] tabular-nums'>
                    {projection.lowestPoint === null ? (
                      '—'
                    ) : (
                      <Money minorUnits={projection.lowestPoint.balance} colorInflow={false} />
                    )}
                  </CardTitle>
                  <CardMeta className='tabular-nums'>
                    {projection.lowestPoint === null ? (
                      'no dip in this window'
                    ) : (
                      <DateText value={projection.lowestPoint.date} year />
                    )}
                  </CardMeta>
                </Card>
              </div>

              {/* The API states its own assumptions; restating them would let the
                  two drift apart, and this is the paragraph that has to be true. */}
              <p className='mt-3 text-ui-sm text-pretty text-ink/55'>
                {projection.assumptions.note}
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
