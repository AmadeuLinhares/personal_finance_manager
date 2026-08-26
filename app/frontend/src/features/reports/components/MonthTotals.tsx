import { type MonthlyExpensesReport } from '@pfm/contracts';
import { Divider, Kicker, Money, Table, Td, Tr } from '@pfm/ui';

import type { ReportCurrency } from '../constants';

export interface MonthTotalsProps {
  report: MonthlyExpensesReport['months'][number] | undefined;
  currency: ReportCurrency;
}

export function MonthTotals({ report, currency }: MonthTotalsProps) {
  return (
    <section>
      <Kicker>Month totals</Kicker>
      <Divider className='mt-2 mb-0' />
      <Table caption='Month totals'>
        <tbody>
          <Tr>
            <Td>Outflow</Td>
            <Td numeric>
              <Money minorUnits={-(report?.outflow ?? 0)} currency={currency} colorInflow={false} />
            </Td>
          </Tr>
          <Tr>
            <Td>
              Inflow <span className='text-ink/55'>(incl. refunds)</span>
            </Td>
            <Td numeric>
              <Money minorUnits={report?.inflow ?? 0} currency={currency} colorInflow={false} />
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
        Classification follows the sign of the amount, not the category&apos;s kind — a refund shows
        as inflow inside an expense category. Uncategorised spend is a normal row, not a separate
        bucket.
      </p>
    </section>
  );
}
