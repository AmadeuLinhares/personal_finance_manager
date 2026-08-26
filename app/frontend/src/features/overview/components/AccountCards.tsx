import { type Account } from '@pfm/contracts';
import { Card, CardKicker, CardMeta, CardTitle, SummaryCard } from '@pfm/ui';

import { describeBalance } from '../utils/balanceLines';

export interface AccountCardsProps {
  accounts: Account[];
}

export function AccountCards({ accounts }: AccountCardsProps) {
  return (
    <ul className='grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4'>
      {accounts.map((account) => (
        <li key={account.id}>
          {account.balance == null ? (
            <Card>
              <CardKicker>{account.name}</CardKicker>
              <CardTitle className='text-[28px] tabular-nums'>—</CardTitle>
              <CardMeta>no balance in this response</CardMeta>
            </Card>
          ) : (
            <SummaryCard
              label={account.name}
              minorUnits={account.balance.available}
              currency={account.balance.currency}
              meta={describeBalance(account.balance)}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
