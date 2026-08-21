import {
  Button,
  Card,
  CardKicker,
  CardMeta,
  CardTitle,
  DateText,
  Divider,
  Kicker,
  Money,
  Segmented,
  SegmentedOption,
  Table,
  Tag,
  Td,
  Th,
  Tr,
  TrendChart,
} from '@pfm/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { type Occurrence, type OccurrenceStatus, OCCURRENCES, TODAY } from '../mock/data';
import { budgetProjection, occurrenceTotals } from '../mock/derive';

const STATUS_VARIANT: Record<OccurrenceStatus, 'accent' | 'neutral' | 'outline'> = {
  overdue: 'accent',
  scheduled: 'neutral',
  posted: 'outline',
  skipped: 'outline',
};

export interface PlanningProps {
  onSchedule: () => void;
}

export function Planning({ onSchedule }: PlanningProps) {
  const [occurrences, setOccurrences] = useState<Occurrence[]>(OCCURRENCES);
  const [horizon, setHorizon] = useState(3);
  const projection = budgetProjection(horizon);
  const totals = occurrenceTotals(occurrences);

  /** Layout-only: a rule is untouched, one date changes state. */
  const setStatus = (id: string, status: OccurrenceStatus) => {
    setOccurrences((previous) =>
      previous.map((occurrence) => (occurrence.id === id ? { ...occurrence, status } : occurrence)),
    );
  };

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='font-heading text-h2 font-semibold'>Bills, income &amp; projection</h2>
          <p className='max-w-[620px] text-ui-sm text-pretty text-ink/55'>
            Occurrences for the next 3 months · rules, not rows — post or skip a date without
            touching the rule
          </p>
        </div>
        <Button variant='primary' className='whitespace-nowrap' onClick={onSchedule}>
          <Plus className='size-3.5' aria-hidden='true' />
          Schedule item
        </Button>
      </div>

      <Divider />

      <div className='grid gap-8 lg:grid-cols-[1.15fr_1fr]'>
        <section>
          <Kicker>Upcoming occurrences</Kicker>
          <div className='overflow-x-auto'>
            <Table>
              <thead>
                <tr>
                  <Th>Due</Th>
                  <Th>Item</Th>
                  <Th>Status</Th>
                  <Th numeric>Amount</Th>
                  <Th numeric>
                    <span className='sr-only'>Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {occurrences.map((occurrence) => {
                  const actionable =
                    occurrence.status === 'overdue' || occurrence.status === 'scheduled';
                  return (
                    <Tr key={occurrence.id}>
                      <Td numeric className='text-left'>
                        <DateText value={occurrence.due} />
                      </Td>
                      <Td>
                        {occurrence.name}
                        {occurrence.note === undefined ? null : (
                          <span className='ml-1.5 text-label text-ink/55'>· {occurrence.note}</span>
                        )}
                        {occurrence.project === undefined ? null : (
                          <Tag variant='outline' className='ml-1.5'>
                            {occurrence.project}
                          </Tag>
                        )}
                      </Td>
                      <Td>
                        <Tag variant={STATUS_VARIANT[occurrence.status]}>{occurrence.status}</Tag>
                      </Td>
                      <Td numeric className={actionable ? undefined : 'text-ink/55'}>
                        <Money minorUnits={occurrence.amount} signed />
                      </Td>
                      <Td numeric>
                        {actionable ? (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setStatus(occurrence.id, 'posted');
                              }}
                            >
                              Post
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-ink'
                              onClick={() => {
                                setStatus(occurrence.id, 'skipped');
                              }}
                            >
                              Skip
                            </Button>
                          </>
                        ) : null}
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          <p className='mt-2 text-ui-sm text-ink/55 tabular-nums'>
            Open bills <Money minorUnits={totals.bills} colorInflow={false} /> · open income{' '}
            <Money minorUnits={totals.income} /> · paused items are excluded from every forecast
          </p>
        </section>

        <section>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Kicker>Budget projection</Kicker>
            <Segmented>
              {[3, 6].map((months) => (
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
          </div>
          <Divider className='mt-2 mb-3' />

          <TrendChart
            series={projection.series}
            actualUpTo={0}
            label={`Projected CAD balance over the next ${String(horizon)} months`}
          />
          <p className='mt-1 text-label text-ink/55'>
            Solid to <DateText value={TODAY} year /> — actuals. Dashed after it — commitments only.
          </p>

          <div className='mt-3 flex flex-wrap gap-3'>
            <Card className='flex-1'>
              <CardKicker>Ending balance · {horizon} months</CardKicker>
              <CardTitle className='text-[26px] tabular-nums'>
                <Money minorUnits={projection.ending} colorInflow={false} />
              </CardTitle>
              <CardMeta className='tabular-nums'>
                <Money minorUnits={projection.delta} signed /> vs starting balance
              </CardMeta>
            </Card>
            <Card className='flex-1'>
              <CardKicker>Lowest point</CardKicker>
              <CardTitle className='text-[26px] tabular-nums'>
                <Money minorUnits={projection.lowest.value} colorInflow={false} />
              </CardTitle>
              <CardMeta className='tabular-nums'>in {projection.lowest.label}</CardMeta>
            </Card>
          </div>

          <p className='mt-3 text-ui-sm text-pretty text-ink/55'>
            Commitments only: actuals through today, unposted scheduled occurrences after it.
            Transfers, paused items and discretionary spending are excluded — this is a forecast of
            commitments, not a behavioural model.
          </p>
        </section>
      </div>
    </>
  );
}
