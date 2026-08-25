import {
  type PostOccurrenceVariables,
  type ScheduledItem,
  type Single,
  type Transaction,
  routes,
} from '@pfm/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchData, FetchError } from '@/http/fetch/fetch';

type Response = Single<{ transaction: Transaction; scheduledItem: ScheduledItem }>;

/**
 * The widest invalidation in the app, and the reason is worth stating.
 *
 * Posting one occurrence writes a real transaction, so it moves the ledger, the
 * account balance and this month's category totals; and it removes the
 * occurrence from the forecast, so the projection is stale too. Five keys, all
 * derived from the same write.
 */
export const usePostOccurrence = () => {
  const queryClient = useQueryClient();

  return useMutation<Response, FetchError, PostOccurrenceVariables>({
    mutationFn: async ({ scheduledItemId, ...body }) => {
      const resp = await fetchData<Omit<PostOccurrenceVariables, 'scheduledItemId'>, Response>({
        url: routes.scheduledItems.post(scheduledItemId),
        method: 'POST',
        body,
      });

      if (resp.success) {
        return resp.data;
      }
      // 409 when that date was already posted, 422 NOT_AN_OCCURRENCE when the
      // rule does not fall on it. Both need their code on screen.
      throw new FetchError(resp.data);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['scheduled-items'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['reports'] }),
        queryClient.invalidateQueries({ queryKey: ['projections'] }),
      ]);
    },
  });
};
