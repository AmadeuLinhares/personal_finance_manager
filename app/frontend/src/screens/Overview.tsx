import {
  Bar,
  Card,
  CardKicker,
  CardMeta,
  CardTitle,
  DateText,
  Divider,
  Input,
  Kicker,
  Money,
  SummaryCard,
  Tag,
  TrendChart,
} from '@pfm/ui';
import { useState } from 'react';

import { ACCOUNTS, OCCURRENCES, TODAY, CURRENT_MONTH } from '../mock/data';
import { available, budgetProjection, monthlyExpenses, totalsFor } from '../mock/derive';

export interface OverviewProps {
  onGo: (screen: 'Transactions' | 'Reports' | 'Planning') => void;
}

export function Overview({ onGo }: OverviewProps) {
  const [asOf, setAsOf] = useState(TODAY);
  const cad = totalsFor('CAD');
  const usd = totalsFor('USD');
  const report = monthlyExpenses(CURRENT_MONTH);
  const projection = budgetProjection(3);
  const topSpend = report.categories.slice(0, 4);
  const biggest = topSpend[0]?.outflow ?? 1;
  const upcoming = OCCURRENCES.filter(
    (occurrence) => occurrence.status === 'overdue' || occurrence.status === 'scheduled',
  ).slice(0, 4);

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <Kicker>Available balance · CAD accounts</Kicker>
          <div className='mt-1.5 font-heading text-display font-normal tabular-nums'>
            <Money minorUnits={cad.available} colorInflow={false} />
          </div>
          <p className='mt-2 text-ui-sm text-ink/55 tabular-nums'>
            posted <Money minorUnits={cad.posted} colorInflow={false} /> · pending{' '}
            <Money minorUnits={cad.pending} colorInflow={false} /> · USD held separately:{' '}
            <Money minorUnits={usd.available} currency='USD' colorInflow={false} />
          </p>
        </div>
        <label className='flex items-center gap-2'>
          <span className='text-ui-sm whitespace-nowrap text-ink/55'>Balance as of</span>
          <Input
            type='date'
            value={asOf}
            onChange={(event) => {
              setAsOf(event.target.value);
            }}
            className='w-[170px]'
          />
        </label>
      </div>

      <Divider />

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {ACCOUNTS.map((account) => (
          <SummaryCard
            key={account.id}
            label={account.kicker}
            minorUnits={available(account)}
            currency={account.currency}
            meta={
              account.creditLimit === null
                ? account.pending === 0
                  ? 'posted · no pending activity'
                  : 'includes pending activity'
                : 'available credit against the limit'
            }
          />
        ))}
      </div>

      <div className='mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr_1.2fr]'>
        <section>
          <Kicker>
            Spending · August{' '}
            <span className='tracking-normal text-ink/55 normal-case'>
              (CAD, transfers excluded)
            </span>
          </Kicker>
          <Divider className='mt-2 mb-3' />
          <div className='flex flex-col gap-3'>
            {topSpend.map((category) => (
              <div key={category.name}>
                <div className='mb-1.5 flex justify-between gap-2 text-ui'>
                  <span>{category.name}</span>
                  <Money minorUnits={category.outflow} colorInflow={false} />
                </div>
                <Bar spent={category.outflow} budget={biggest} size='sm' />
              </div>
            ))}
          </div>
          <button
            type='button'
            className='mt-3 cursor-pointer text-ui-sm text-accent hover:text-accent-600'
            onClick={() => {
              onGo('Reports');
            }}
          >
            Full report →
          </button>
        </section>

        <section>
          <Kicker>Upcoming</Kicker>
          <Divider className='mt-2 mb-3' />
          <ul className='flex flex-col'>
            {upcoming.map((occurrence) => (
              <li
                key={occurrence.id}
                className='flex items-center justify-between gap-2 border-b border-divider py-2 text-ui'
              >
                <span>
                  <DateText value={occurrence.due} className='text-ink/55' /> · {occurrence.name}
                  {occurrence.status === 'overdue' ? (
                    <Tag variant='accent' className='ml-1'>
                      overdue
                    </Tag>
                  ) : null}
                </span>
                <Money minorUnits={occurrence.amount} signed />
              </li>
            ))}
          </ul>
          <button
            type='button'
            className='mt-3 cursor-pointer text-ui-sm text-accent hover:text-accent-600'
            onClick={() => {
              onGo('Planning');
            }}
          >
            All scheduled →
          </button>
        </section>

        <section>
          <Kicker>Projection · next 3 months</Kicker>
          <Divider className='mt-2 mb-3' />
          <TrendChart
            series={projection.series}
            actualUpTo={0}
            height={130}
            label='Projected CAD balance over the next 3 months'
          />
          <Card className='mt-3'>
            <CardKicker>Ending balance</CardKicker>
            <CardTitle className='text-[24px] tabular-nums'>
              <Money minorUnits={projection.ending} colorInflow={false} />
            </CardTitle>
            <CardMeta className='tabular-nums'>
              <Money minorUnits={projection.delta} signed /> vs today
            </CardMeta>
          </Card>
        </section>
      </div>
    </>
  );
}
