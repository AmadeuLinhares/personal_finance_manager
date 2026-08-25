import {
  type CategoriesMeta,
  type Category,
  type CategoryFilters,
  type Collection,
  routes,
} from '@pfm/contracts';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { fetchData, FetchError } from '@/http/fetch/fetch';
import { withQuery } from '@/utils/queryParams';

export type ResponseCategories = Collection<Category, CategoriesMeta>;

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
