import { type Collection, type Transaction, type TransactionFilters, routes } from '@pfm/contracts';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { fetchData, FetchError } from '@/http/fetch/fetch';
import { withQuery } from '@/utils/queryParams';

export type ResponseTransactions = Collection<Transaction>;

type TransactionsQueryKey = ['transactions', TransactionFilters];

type TransactionsQueryOptions = Omit<
  UseQueryOptions<ResponseTransactions, FetchError, ResponseTransactions, TransactionsQueryKey>,
  'queryKey' | 'queryFn'
>;

export const useGetTransactions = (
  filters: TransactionFilters,
  options?: TransactionsQueryOptions,
) => {
  return useQuery<ResponseTransactions, FetchError, ResponseTransactions, TransactionsQueryKey>({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const resp = await fetchData<undefined, ResponseTransactions>({
        url: withQuery(routes.transactions.list, { ...filters }),
        method: 'GET',
      });

      if (resp.success) {
        return resp.data;
      }
      throw new FetchError(resp.data);
    },
    ...options,
  });
};
