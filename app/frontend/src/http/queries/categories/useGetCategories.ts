import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { Category, CategoryKind, Collection } from '@/http/api-types';
import { fetchData, FetchError } from '@/http/fetch/fetch';
import { routes } from '@/http/routes';
import { withQuery } from '@/utils/queryParams';

export interface CategoryFilters {
  kind?: CategoryKind;
  includeArchived?: boolean;
  /** Adds `transactionCount` — only worth asking for on a management screen. */
  includeUsage?: boolean;
}

export type ResponseCategories = Collection<Category, { total: number }>;

type CategoriesQueryKey = ['categories', CategoryFilters];

type CategoriesQueryOptions = Omit<
  UseQueryOptions<ResponseCategories, FetchError, ResponseCategories, CategoriesQueryKey>,
  'queryKey' | 'queryFn'
>;

export const useGetCategories = (
  filters: CategoryFilters = {},
  options?: CategoriesQueryOptions,
) => {
  return useQuery<ResponseCategories, FetchError, ResponseCategories, CategoriesQueryKey>({
    queryKey: ['categories', filters],
    queryFn: async () => {
      const resp = await fetchData<undefined, ResponseCategories>({
        url: withQuery(routes.categories.list, { ...filters }),
        method: 'GET',
      });

      if (resp.success) {
        return resp.data;
      }
      throw new FetchError(resp.data);
    },
    // Categories are effectively reference data: they change on a settings
    // screen, not while someone reads a ledger.
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
