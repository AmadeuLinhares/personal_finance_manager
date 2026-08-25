import { type Transaction } from '@pfm/contracts';
import { Table, Th, VisuallyHidden } from '@pfm/ui';

import { TransactionRow } from './TransactionRow';

export interface TransactionsTableProps {
  rows: Transaction[];
  singleAccount: boolean;
  /** A refetch behind rows that are still on screen, not a first load. */
  isFetching: boolean;
}

export function TransactionsTable({ rows, singleAccount, isFetching }: TransactionsTableProps) {
  return (
    <div className='overflow-x-auto' aria-busy={isFetching}>
      <Table caption='Transactions, newest first'>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Description</Th>
            <Th>Account</Th>
            <Th>Category</Th>
            <Th numeric>Amount</Th>
            <Th numeric>
              Running balance
              {singleAccount ? null : (
                <VisuallyHidden> — unavailable while several accounts are shown</VisuallyHidden>
              )}
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              singleAccount={singleAccount}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
}
