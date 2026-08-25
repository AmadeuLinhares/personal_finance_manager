import { type Account, type TransactionStatus } from '@pfm/contracts';
import { DatePicker, Input, Segmented, SegmentedOption, Select } from '@pfm/ui';

import type { TransactionFilterValues } from '../hooks/useTransactionFilters';

export interface TransactionFilterBarProps {
  values: TransactionFilterValues;
  /** A patch, not a whole value: the caller owns the paging that comes with it. */
  onChange: (patch: Partial<TransactionFilterValues>) => void;
  /** Names for the account picker — empty while they load, or if they failed. */
  accounts: Account[];
  accountsPending: boolean;
}

export function TransactionFilterBar({
  values,
  onChange,
  accounts,
  accountsPending,
}: TransactionFilterBarProps) {
  return (
    <div className='my-4 flex flex-wrap items-center gap-3'>
      <Segmented label='Direction'>
        {(['all', 'inflow', 'outflow'] as const).map((option) => (
          <SegmentedOption
            key={option}
            name='txkind'
            checked={values.direction === option}
            onChange={() => {
              onChange({ direction: option });
            }}
          >
            {option === 'all' ? 'All' : option === 'inflow' ? 'Inflow' : 'Outflow'}
          </SegmentedOption>
        ))}
      </Segmented>

      <Select
        aria-label='Account'
        className='w-[190px]'
        value={values.accountId}
        disabled={accountsPending}
        onChange={(event) => {
          onChange({ accountId: event.target.value });
        }}
      >
        <option value='all'>All accounts</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </Select>

      <Select
        aria-label='Status'
        className='w-[130px]'
        value={values.status}
        onChange={(event) => {
          onChange({ status: event.target.value as TransactionStatus | 'all' });
        }}
      >
        <option value='all'>All statuses</option>
        <option value='posted'>Posted</option>
        <option value='pending'>Pending</option>
      </Select>

      <DatePicker
        aria-label='From date'
        className='w-[170px]'
        placeholder='Any start date'
        value={values.from}
        max={values.to === '' ? undefined : values.to}
        onChange={(next) => {
          onChange({ from: next ?? '' });
        }}
      />

      <DatePicker
        aria-label='To date'
        className='w-[170px]'
        placeholder='Any end date'
        value={values.to}
        min={values.from === '' ? undefined : values.from}
        onChange={(next) => {
          onChange({ to: next ?? '' });
        }}
      />

      <Input
        aria-label='Search transactions'
        type='search'
        className='ml-auto w-[300px]'
        placeholder='Search description, merchant, notes'
        value={values.search}
        onChange={(event) => {
          onChange({ search: event.target.value });
        }}
      />
    </div>
  );
}
