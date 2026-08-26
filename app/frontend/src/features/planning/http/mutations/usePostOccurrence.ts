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
