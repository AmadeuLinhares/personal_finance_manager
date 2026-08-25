import { type BudgetProjection, type BudgetProjectionFilters, routes } from '@pfm/contracts';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { fetchData, FetchError } from '@/http/fetch/fetch';
import { withQuery } from '@/utils/queryParams';

export type ResponseBudgetProjection = BudgetProjection;

type BudgetProjectionQueryKey = ['projections', 'budget', BudgetProjectionFilters];

type BudgetProjectionQueryOptions = Omit<
  UseQueryOptions<
    ResponseBudgetProjection,
    FetchError,
    ResponseBudgetProjection,
    BudgetProjectionQueryKey
  >,
  'queryKey' | 'queryFn'
>;

export const useGetBudgetProjection = (
  filters: BudgetProjectionFilters = {},
  options?: BudgetProjectionQueryOptions,
) => {
  return useQuery<
    ResponseBudgetProjection,
    FetchError,
    ResponseBudgetProjection,
    BudgetProjectionQueryKey
  >({
    queryKey: ['projections', 'budget', filters],
    queryFn: async () => {
      const resp = await fetchData<undefined, ResponseBudgetProjection>({
        url: withQuery(routes.projections.budget, { ...filters }),
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
