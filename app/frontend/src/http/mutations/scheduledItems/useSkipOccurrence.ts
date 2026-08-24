import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import type { IsoDate, ScheduledItem, Single } from '@/http/api-types';
import { fetchData, FetchError } from '@/http/fetch/fetch';
import { routes } from '@/http/routes';

export interface SkipOccurrenceVariables {
  scheduledItemId: string;
  date: IsoDate;
}

type Response = Single<ScheduledItem>;

/**
 * Skipping writes no transaction, so it invalidates far less than posting does:
 * the ledger, the balances and the reports cannot have changed. Only the
 * occurrence's own status and the forecast that counted it move.
 */
const useSkipMutation = (
  endpoint: (id: string) => string,
): UseMutationResult<Response, FetchError, SkipOccurrenceVariables> => {
  const queryClient = useQueryClient();

  return useMutation<Response, FetchError, SkipOccurrenceVariables>({
    mutationFn: async ({ scheduledItemId, date }) => {
      const resp = await fetchData<{ date: IsoDate }, Response>({
        url: endpoint(scheduledItemId),
        method: 'POST',
        body: { date },
      });

      if (resp.success) {
        return resp.data;
      }
      throw new FetchError(resp.data);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['scheduled-items'] }),
        queryClient.invalidateQueries({ queryKey: ['projections'] }),
      ]);
    },
  });
};

/** Dismiss one date without touching the rule behind it. */
export const useSkipOccurrence = () => useSkipMutation(routes.scheduledItems.skip);

/** Put a skipped date back into the forecast. */
export const useUnskipOccurrence = () => useSkipMutation(routes.scheduledItems.unskip);
