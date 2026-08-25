import {
  type Account,
  type AccountFilters,
  type AccountsMeta,
  type Collection,
  routes,
} from '@pfm/contracts';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { fetchData, FetchError } from '@/http/fetch/fetch';
import { withQuery } from '@/utils/queryParams';

export type ResponseAccounts = Collection<Account, AccountsMeta>;

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
