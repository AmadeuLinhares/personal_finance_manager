import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
  IsoDate,
  OccurrenceStatus,
  ScheduledItemKind,
  UpcomingResponse,
} from '@/http/api-types';
import { fetchData, FetchError } from '@/http/fetch/fetch';
import { routes } from '@/http/routes';
import { withQuery } from '@/utils/queryParams';

/**
 * Every rule expanded into dates. Nothing is materialised server-side, so this
 * list is always current with the rules behind it — there is no queue of stale
 * future rows to reconcile.
 */
export interface OccurrenceFilters {
  /** Defaults to today, server-side; `to` defaults to three months after it. */
  from?: IsoDate;
  to?: IsoDate;
  status?: OccurrenceStatus;
  kind?: ScheduledItemKind;
  accountId?: string;
  projectId?: string;
}

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
