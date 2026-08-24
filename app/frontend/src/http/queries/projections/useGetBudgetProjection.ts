import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { BudgetProjection, CurrencyCode, Granularity, IsoDate } from '@/http/api-types';
import { fetchData, FetchError } from '@/http/fetch/fetch';
import { routes } from '@/http/routes';
import { withQuery } from '@/utils/queryParams';

/**
 * Where the balance is heading, on commitments only.
 *
 * `asOf` is the seam: dates up to it use real transactions, dates after it use
 * scheduled occurrences that have not been posted. Without that split a rent
 * payment that already cleared would be counted twice — once as history and
 * again as this month's bill.
 */
export interface BudgetProjectionFilters {
  /** Defaults to today; `to` defaults to the end of the sixth month out. */
  from?: IsoDate;
  to?: IsoDate;
  granularity?: Granularity;
  currency?: CurrencyCode;
  accountId?: string;
  includeScheduled?: boolean;
  /** Bolts a crude guess from the category budgets onto the forecast. Off. */
  includeCategoryBudgets?: boolean;
  /** Movable, so "what would last month's projection have said" is answerable. */
  asOf?: IsoDate;
}

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
