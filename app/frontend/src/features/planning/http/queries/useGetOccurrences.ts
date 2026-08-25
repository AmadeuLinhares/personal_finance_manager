import { type OccurrenceFilters, type UpcomingResponse, routes } from '@pfm/contracts';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { fetchData, FetchError } from '@/http/fetch/fetch';
import { withQuery } from '@/utils/queryParams';

export type ResponseOccurrences = UpcomingResponse;

type OccurrencesQueryKey = ['scheduled-items', 'occurrences', OccurrenceFilters];

type OccurrencesQueryOptions = Omit<
  UseQueryOptions<ResponseOccurrences, FetchError, ResponseOccurrences, OccurrencesQueryKey>,
  'queryKey' | 'queryFn'
>;

export const useGetOccurrences = (
  filters: OccurrenceFilters = {},
  options?: OccurrencesQueryOptions,
) => {
  return useQuery<ResponseOccurrences, FetchError, ResponseOccurrences, OccurrencesQueryKey>({
    // The `scheduled-items` prefix is what posting and skipping invalidate.
    queryKey: ['scheduled-items', 'occurrences', filters],
    queryFn: async () => {
      const resp = await fetchData<undefined, ResponseOccurrences>({
        url: withQuery(routes.scheduledItems.occurrences, { ...filters }),
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
