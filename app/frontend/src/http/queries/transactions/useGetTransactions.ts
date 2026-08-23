import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
  Collection,
  Direction,
  IsoDate,
  Transaction,
  TransactionStatus,
} from '@/http/api-types';
import { fetchData, FetchError } from '@/http/fetch/fetch';
import { routes } from '@/http/routes';
import { withQuery } from '@/utils/queryParams';

/**
 * Every filter the screen exposes maps to a query param — nothing is filtered in
 * the client. `pageSize` maxes out at 500 server-side.
 */
export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  projectId?: string;
  status?: TransactionStatus;
  direction?: Direction;
  from?: IsoDate;
  to?: IsoDate;
  /** Substring over description, merchant and notes. */
  q?: string;
  uncategorised?: boolean;
  includeTransfers?: boolean;
  transfersOnly?: boolean;
  page?: number;
  pageSize?: number;
  /** `-` prefix is descending; later keys break ties. Default `-date,-createdAt`. */
  sort?: string;
  /** Embeds relations, so a row renders without a second lookup. */
  include?: string;
  /**
   * Needs exactly one `accountId` and a date sort, or the API answers 400: a
   * running balance across accounts has no meaning, and one out of date order is
   * not a balance.
   */
  withRunningBalance?: boolean;
}

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
    // The filters are part of the key, so going back to a previous month is a
    // cache hit instead of a refetch.
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
