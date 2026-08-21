import {
  Button,
  DateText,
  EmptyState,
  Input,
  Money,
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
} from '@pfm/ui';
import { useMemo, useState } from 'react';

import { ACCOUNTS, CURRENT_MONTH, TRANSACTIONS } from '../mock/data';
import { accountById, inMonth, isTransfer, withRunningBalance } from '../mock/derive';

type Kind = 'all' | 'inflow' | 'outflow';
/** The API can be slow and can fail on demand, so the screen owes all three. */
type TableState = 'data' | 'loading' | 'empty';

const PAGE_SIZE = 8;

export function Transactions() {
  const [kind, setKind] = useState<Kind>('all');
  const [accountId, setAccountId] = useState('all');
  const [status, setStatus] = useState('all');
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tableState, setTableState] = useState<TableState>('data');

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return TRANSACTIONS.filter((transaction) => {
      if (kind === 'inflow' && transaction.amount <= 0) return false;
      if (kind === 'outflow' && transaction.amount >= 0) return false;
      if (accountId !== 'all' && transaction.accountId !== accountId) return false;
      if (status !== 'all' && transaction.status !== status) return false;
      if (month !== '' && !inMonth(transaction.date, month)) return false;
      if (needle === '') return true;
      const haystack = [
        transaction.description,
        transaction.category ?? 'uncategorised',
        transaction.project ?? '',
        accountById(transaction.accountId)?.name ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [kind, accountId, status, month, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const rows = withRunningBalance(slice, accountId);

  const clearFilters = () => {
    setKind('all');
    setAccountId('all');
    setStatus('all');
    setMonth('');
    setSearch('');
    setPage(1);
    setTableState('data');
  };

  const effectiveState: TableState =
    tableState === 'data' && filtered.length === 0 ? 'empty' : tableState;

  return (
    <>
      <h2 className='font-heading text-h2 font-semibold'>Transactions</h2>

      <div className='my-4 flex flex-wrap items-center gap-3'>
        <Segmented>
          {(['all', 'inflow', 'outflow'] as const).map((option) => (
            <SegmentedOption
              key={option}
              name='txkind'
              checked={kind === option}
              onChange={() => {
                setKind(option);
                setPage(1);
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
          onChange={(event) => {
            setAccountId(event.target.value);
            setPage(1);
          }}
        >
          <option value='all'>All accounts</option>
          {ACCOUNTS.map((account) => (
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
            setStatus(event.target.value);
          }}
        >
          <option value='all'>All statuses</option>
          <option value='posted'>Posted</option>
          <option value='pending'>Pending</option>
        </Select>

        <Input
          aria-label='Month'
          type='month'
          className='w-[150px]'
          value={month}
          onChange={(event) => {
            setMonth(event.target.value);
          }}
        />

        <div className='flex-1' />

        <Input
          aria-label='Search transactions'
          type='search'
          className='w-[300px]'
          placeholder='Search description, category, project'
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />

        {/* Layout-only stand-in for what ?__latency= and ?__error= will drive. */}
        <Segmented className='ml-auto'>
          {(['data', 'loading', 'empty'] as const).map((option) => (
            <SegmentedOption
              key={option}
              name='tablestate'
              checked={tableState === option}
              onChange={() => {
                setTableState(option);
              }}
            >
              {option}
            </SegmentedOption>
          ))}
        </Segmented>
      </div>

      {effectiveState === 'loading' ? (
        <Skeleton lines={8} />
      ) : effectiveState === 'empty' ? (
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
          <div className='overflow-x-auto'>
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th>Account</Th>
                  <Th>Category</Th>
                  <Th numeric>Amount</Th>
                  <Th numeric>Running balance</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ transaction, running }) => (
                  <Tr key={transaction.id}>
                    <Td numeric className='text-left'>
                      <DateText value={transaction.date} />
                    </Td>
                    <Td>
                      {transaction.description}
                      {transaction.project === undefined ? null : (
                        <Tag variant='outline' className='ml-1.5'>
                          {transaction.project}
                        </Tag>
                      )}
                      {transaction.status === 'pending' ? (
                        <Tag variant='outline' className='ml-1.5'>
                          pending
                        </Tag>
                      ) : null}
                      {isTransfer(transaction) ? (
                        <Tag variant='outline' className='ml-1.5'>
                          transfer
                        </Tag>
                      ) : null}
                    </Td>
                    <Td className='whitespace-nowrap text-ink/55'>
                      {accountById(transaction.accountId)?.name}
                    </Td>
                    <Td>
                      {transaction.category === null ? (
                        <Tag variant='outline'>Uncategorised</Tag>
                      ) : (
                        <Tag variant={transaction.category === 'Transfer' ? 'outline' : 'neutral'}>
                          {transaction.category}
                        </Tag>
                      )}
                    </Td>
                    <Td numeric>
                      <Money minorUnits={transaction.amount} signed />
                    </Td>
                    <Td numeric className='text-ink/55'>
                      {running === null ? (
                        <span title='An unsettled row has no defensible total'>null</span>
                      ) : (
                        <Money minorUnits={running} colorInflow={false} />
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>

          <Pagination
            className='mt-3'
            page={current}
            pageCount={pageCount}
            onPageChange={setPage}
            summary={
              accountId === 'all'
                ? `Showing ${String(slice.length)} of ${String(filtered.length)} · running balance needs one account`
                : `Showing ${String(slice.length)} of ${String(filtered.length)} · running balance over the whole ledger`
            }
          />
        </>
      )}
    </>
  );
}
