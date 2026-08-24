import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { CurrencyCode, IsoMonth, MonthlyExpensesReport } from '@/http/api-types';
import { fetchData, FetchError } from '@/http/fetch/fetch';
import { routes } from '@/http/routes';
import { withQuery } from '@/utils/queryParams';

/**
 * One report, one currency: the API refuses to sum across currencies because it
 * has no FX rates, so `currency` picks the scope rather than converting into it.
 */
export interface MonthlyExpensesFilters {
  /** Inclusive `YYYY-MM` bounds. Defaults to the last six months, server-side. */
  from?: IsoMonth;
  to?: IsoMonth;
  currency?: CurrencyCode;
  accountId?: string;
  projectId?: string;
  /** Default `true` — an unposted card hold is still money the user has spent. */
  includePending?: boolean;
  /** Default `false`: a transfer leg is not an expense. */
  includeTransfers?: boolean;
}

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
