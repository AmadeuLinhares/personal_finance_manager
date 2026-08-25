import { Button, EmptyState, ErrorState, Notice, Pagination, Skeleton } from '@pfm/ui';

import { TransactionFilterBar } from './components/TransactionFilterBar';
import { TransactionsTable } from './components/TransactionsTable';
import { useTransactionFilters } from './hooks/useTransactionFilters';
import { useGetTransactions } from './http/queries/useGetTransactions';
import { useGetAccounts } from '@/http/queries/accounts/useGetAccounts';

export function Transactions() {
  const { values, change, clear, page, setPage, singleAccount, query } = useTransactionFilters();

  const accountsQuery = useGetAccounts({ includeBalances: false });

  const { data, error, isPending, isError, isFetching, refetch } = useGetTransactions(query, {
    // Paging keeps the previous page on screen instead of collapsing the table
    // into a skeleton — the rows are about to be replaced, not to disappear.
    placeholderData: (previous) => previous,
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const pageCount = Math.max(1, meta?.totalPages ?? 1);

  return (
    <>
      <h2 className='font-heading text-h2 font-semibold'>Transactions</h2>

      <TransactionFilterBar
        values={values}
        onChange={change}
        accounts={accountsQuery.data?.data ?? []}
        accountsPending={accountsQuery.isPending}
      />

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
            <Button variant='ghost' onClick={clear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <TransactionsTable rows={rows} singleAccount={singleAccount} isFetching={isFetching} />

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
