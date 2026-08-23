import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { Account, Collection, CurrencyCode, CurrencyTotal, IsoDate } from '@/http/api-types';
import { fetchData, FetchError } from '@/http/fetch/fetch';
import { routes } from '@/http/routes';
import { withQuery } from '@/utils/queryParams';

export interface AccountFilters {
  /** Balances are computed as of this date. Defaults to today, server-side. */
  asOf?: IsoDate;
  /** `false` for the bare records — cheaper when only the names are needed. */
  includeBalances?: boolean;
  includeArchived?: boolean;
  currency?: CurrencyCode;
}

/** Balances arrive attached, and the per-currency totals come in `meta`. */
export type ResponseAccounts = Collection<
  Account,
  {
    total: number;
    asOf: IsoDate;
    totalsByCurrency: Partial<Record<CurrencyCode, CurrencyTotal>>;
  }
>;

type AccountsQueryKey = ['accounts', AccountFilters];

type AccountsQueryOptions = Omit<
  UseQueryOptions<ResponseAccounts, FetchError, ResponseAccounts, AccountsQueryKey>,
  'queryKey' | 'queryFn'
>;

export const useGetAccounts = (filters: AccountFilters = {}, options?: AccountsQueryOptions) => {
  return useQuery<ResponseAccounts, FetchError, ResponseAccounts, AccountsQueryKey>({
    // `asOf` belongs in the key: without it, asking for a past balance would
    // poison today's cache entry.
    queryKey: ['accounts', filters],
    queryFn: async () => {
      const resp = await fetchData<undefined, ResponseAccounts>({
        url: withQuery(routes.accounts.list, { ...filters }),
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
