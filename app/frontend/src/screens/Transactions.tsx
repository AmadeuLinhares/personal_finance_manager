import {
  Button,
  DatePicker,
  DateText,
  EmptyState,
  ErrorState,
  Input,
  Money,
  Notice,
  Pagination,
  Segmented,
  SegmentedOption,
  Select,
  Skeleton,
  Table,
  Tag,
  Td,
  Th,
  Tr,
  VisuallyHidden,
} from '@pfm/ui';
import { useState } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { Direction, TransactionStatus } from '@/http/api-types';
import { useGetAccounts } from '@/http/queries/accounts/useGetAccounts';
import {
  useGetTransactions,
  type TransactionFilters,
} from '@/http/queries/transactions/useGetTransactions';
import { monthRange } from '@/utils/dates';

const PAGE_SIZE = 8;

/** The one sort the running balance is allowed to use. */
const SORT = '-date,-createdAt';

export function Transactions() {
  const [direction, setDirection] = useState<Direction | 'all'>('all');
  const [accountId, setAccountId] = useState('all');
  const [status, setStatus] = useState<TransactionStatus | 'all'>('all');
  const [month, setMonth] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // The search box drives a query param, so it waits for typing to settle.
  const debouncedSearch = useDebouncedValue(search);

  const accountsQuery = useGetAccounts({ includeBalances: false });

  /**
   * A running balance is only defined for one account in date order, so the
   * column is requested exactly when the filter allows it. Asking anyway would
   * be a 400, and hiding the rule from the user would be worse.
   */
  const singleAccount = accountId !== 'all';
  const range = month === '' ? undefined : monthRange(month);

  const filters: TransactionFilters = {
    page,
    pageSize: PAGE_SIZE,
    sort: SORT,
    include: 'account,category',
    accountId: singleAccount ? accountId : undefined,
    status: status === 'all' ? undefined : status,
    direction: direction === 'all' ? undefined : direction,
    from: range?.from,
    to: range?.to,
    q: debouncedSearch.trim() === '' ? undefined : debouncedSearch.trim(),
    withRunningBalance: singleAccount ? true : undefined,
  };

  const { data, error, isPending, isError, isFetching, refetch } = useGetTransactions(filters, {
    // Paging keeps the previous page on screen instead of collapsing the table
    // into a skeleton — the rows are about to be replaced, not to disappear.
    placeholderData: (previous) => previous,
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const pageCount = Math.max(1, meta?.totalPages ?? 1);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setDirection('all');
    setAccountId('all');
    setStatus('all');
    setMonth('');
    setSearch('');
    setPage(1);
  };

  return (
    <>
      <h2 className='font-heading text-h2 font-semibold'>Transactions</h2>

      <div className='my-4 flex flex-wrap items-center gap-3'>
        <Segmented label='Direction'>
          {(['all', 'inflow', 'outflow'] as const).map((option) => (
            <SegmentedOption
              key={option}
              name='txkind'
              checked={direction === option}
              onChange={() => {
                setDirection(option);
                resetToFirstPage();
              }}
            >
              {option === 'all' ? 'All' : option === 'inflow' ? 'Inflow' : 'Outflow'}
            </SegmentedOption>
          ))}
        </Segmented>

        <Select
          aria-label='Account'
          className='w-[190px]'
          value={accountId}
          disabled={accountsQuery.isPending}
          onChange={(event) => {
            setAccountId(event.target.value);
            resetToFirstPage();
          }}
        >
          <option value='all'>All accounts</option>
          {(accountsQuery.data?.data ?? []).map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>

        <Select
          aria-label='Status'
          className='w-[130px]'
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as TransactionStatus | 'all');
            resetToFirstPage();
          }}
        >
          <option value='all'>All statuses</option>
          <option value='posted'>Posted</option>
          <option value='pending'>Pending</option>
        </Select>

        <DatePicker
          mode='month'
          aria-label='Month'
          className='w-[170px]'
          placeholder='Any month'
          value={month}
          onChange={(next) => {
            setMonth(next ?? '');
            resetToFirstPage();
          }}
        />

        <Input
          aria-label='Search transactions'
          type='search'
          className='ml-auto w-[300px]'
          placeholder='Search description, merchant, notes'
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            resetToFirstPage();
          }}
        />
      </div>

      {accountsQuery.isError ? (
        <Notice className='mb-3'>
          Account names are unavailable ({accountsQuery.error.data.code}) — the ledger below is
          still correct.
        </Notice>
      ) : null}

      {isPending ? (
        <Skeleton lines={8} label='Loading transactions…' />
      ) : isError ? (
        <ErrorState
          title={`Could not load transactions — ${error.data.code}`}
          description={error.data.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          className='py-8'
          title='No transactions match'
          description='Try a wider date range, or clear the search and filters.'
          action={
            <Button variant='ghost' onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
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
                      <VisuallyHidden>
                        {' '}
                        — unavailable while several accounts are shown
                      </VisuallyHidden>
                    )}
                  </Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((transaction) => (
                  <Tr key={transaction.id}>
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
                      ) : transaction.runningBalance === null ||
                        transaction.runningBalance === undefined ? (
                        <>
                          <span aria-hidden='true' title='An unsettled row has no defensible total'>
                            null
                          </span>
                          <VisuallyHidden>
                            no running balance: this row has not settled
                          </VisuallyHidden>
                        </>
                      ) : (
                        <Money minorUnits={transaction.runningBalance} colorInflow={false} />
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>

          <Pagination
            className='mt-3'
            page={meta?.page ?? page}
            pageCount={pageCount}
            onPageChange={setPage}
            summary={
              <span role='status'>
                {`Showing ${String(rows.length)} of ${String(meta?.total ?? rows.length)}${
                  isFetching ? ' · updating…' : ''
                } · ${
                  singleAccount
                    ? 'running balance over the whole ledger'
                    : 'running balance needs one account'
                }`}
              </span>
            }
          />
        </>
      )}
    </>
  );
}
