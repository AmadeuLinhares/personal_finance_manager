import { type Transaction } from '@pfm/contracts';
import { DateText, Money, Tag, Td, Tr, VisuallyHidden } from '@pfm/ui';

export interface TransactionRowProps {
  transaction: Transaction;
  singleAccount: boolean;
}

export function TransactionRow({ transaction, singleAccount }: TransactionRowProps) {
  return (
    <Tr>
      <Td numeric className='text-left'>
        <DateText value={transaction.date} />
      </Td>
      <Td>
        {transaction.description}
        {transaction.status === 'pending' ? (
          <Tag variant='outline' className='ml-1.5'>
            pending
          </Tag>
        ) : null}
        {transaction.transferId === null ? null : (
          <Tag variant='outline' className='ml-1.5'>
            transfer
          </Tag>
        )}
      </Td>
      <Td className='whitespace-nowrap text-ink/55'>
        {transaction.account?.name ?? transaction.accountId}
      </Td>
      <Td>
        {transaction.category ? (
          <Tag variant='neutral'>{transaction.category.name}</Tag>
        ) : (
          <Tag variant='outline'>Uncategorised</Tag>
        )}
      </Td>
      <Td numeric>
        <Money
          minorUnits={transaction.amount}
          currency={transaction.currency === 'USD' ? 'USD' : 'CAD'}
          signed
        />
      </Td>
      <Td numeric className='text-ink/55'>
        {!singleAccount ? (
          <>
            <span
              aria-hidden='true'
              title='A running balance across several accounts has no meaning — pick one account'
            >
              —
            </span>
            <VisuallyHidden>not available</VisuallyHidden>
          </>
        ) : transaction.runningBalance === null || transaction.runningBalance === undefined ? (
          <>
            <span aria-hidden='true' title='An unsettled row has no defensible total'>
              null
            </span>
            <VisuallyHidden>no running balance: this row has not settled</VisuallyHidden>
          </>
        ) : (
          <Money minorUnits={transaction.runningBalance} colorInflow={false} />
        )}
      </Td>
    </Tr>
  );
}
