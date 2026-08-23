import {
  Bar,
  Divider,
  EmptyState,
  Input,
  Kicker,
  Money,
  Notice,
  Table,
  Tag,
  Td,
  Tr,
} from '@pfm/ui';
import { useState } from 'react';

import { CURRENT_MONTH } from '../mock/data';
import { monthlyExpenses } from '../mock/derive';

export function Reports() {
  const [month, setMonth] = useState(CURRENT_MONTH);
  const report = monthlyExpenses(month);

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='font-heading text-h2 font-semibold'>Expenses by category</h2>
          <p className='text-ui-sm text-ink/55'>CAD · pending included · transfers excluded</p>
        </div>
        <Input
          aria-label='Report month'
          type='month'
          className='w-[160px]'
          value={month}
          onChange={(event) => {
            setMonth(event.target.value);
          }}
        />
      </div>

      <Divider />

      <div className='grid gap-8 lg:grid-cols-[1.4fr_1fr]'>
        <section>
          {report.categories.length === 0 ? (
            <EmptyState
              className='py-8'
              title='No expenses this month'
              description='Pick another month — the fixtures cover August 2026.'
            />
          ) : (
            <>
              <div className='flex flex-col gap-3'>
                {report.categories.map((category) => (
                  <div key={category.name}>
                    <div className='mb-1.5 flex justify-between gap-2 text-ui'>
                      <span>
                        {category.name}
                        {category.overBudget ? (
                          <Tag variant='accent' className='ml-1'>
                            over budget
                          </Tag>
                        ) : null}
                      </span>
                      <span className='whitespace-nowrap tabular-nums'>
                        <Money minorUnits={category.outflow} colorInflow={false} />{' '}
                        {category.budget === null ? (
                          <span className='text-ink/55'>unbudgeted</span>
                        ) : (
                          <span className='text-ink/55'>
                            of <Money minorUnits={category.budget} colorInflow={false} />
                          </span>
                        )}
                      </span>
                    </div>
                    <Bar
                      spent={category.outflow}
                      budget={category.budget ?? report.categories[0].outflow}
                    />
                  </div>
                ))}
              </div>

              <Divider />

              <div className='flex flex-wrap items-baseline justify-between gap-3'>
                <Notice variant='muted' className='border-0 px-0'>
                  Excluded from this report: {report.excludedTransfers} transfer legs ·{' '}
                  {report.otherCurrencies} other-currency
                </Notice>
                <span className='font-heading text-[28px] font-semibold whitespace-nowrap tabular-nums'>
                  <Money minorUnits={-report.outflow} colorInflow={false} />
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
                  <Money minorUnits={-report.outflow} colorInflow={false} />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  Inflow <span className='text-ink/55'>(incl. refunds)</span>
                </Td>
                <Td numeric>
                  <Money minorUnits={report.inflow} colorInflow={false} />
                </Td>
              </Tr>
              <Tr>
                <Td>Net</Td>
                <Td numeric>
                  <Money minorUnits={report.net} signed />
                </Td>
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
    </>
  );
}
