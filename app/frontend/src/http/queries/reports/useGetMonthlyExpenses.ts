import { type MonthlyExpensesFilters, type MonthlyExpensesReport, routes } from '@pfm/contracts';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { fetchData, FetchError } from '@/http/fetch/fetch';
import { withQuery } from '@/utils/queryParams';

export type ResponseMonthlyExpenses = MonthlyExpensesReport;

type MonthlyExpensesQueryKey = ['reports', 'monthly-expenses', MonthlyExpensesFilters];

type MonthlyExpensesQueryOptions = Omit<
  UseQueryOptions<
    ResponseMonthlyExpenses,
    FetchError,
    ResponseMonthlyExpenses,
    MonthlyExpensesQueryKey
  >,
  'queryKey' | 'queryFn'
>;

export const useGetMonthlyExpenses = (
  filters: MonthlyExpensesFilters = {},
  options?: MonthlyExpensesQueryOptions,
) => {
  return useQuery<
    ResponseMonthlyExpenses,
    FetchError,
    ResponseMonthlyExpenses,
    MonthlyExpensesQueryKey
  >({
    queryKey: ['reports', 'monthly-expenses', filters],
    queryFn: async () => {
      const resp = await fetchData<undefined, ResponseMonthlyExpenses>({
        url: withQuery(routes.reports.monthlyExpenses, { ...filters }),
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
