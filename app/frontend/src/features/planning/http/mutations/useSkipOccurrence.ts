import {
  type IsoDate,
  type ScheduledItem,
  type Single,
  type SkipOccurrenceVariables,
  routes,
} from '@pfm/contracts';
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { fetchData, FetchError } from '@/http/fetch/fetch';

type Response = Single<ScheduledItem>;

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

export const useSkipOccurrence = () => useSkipMutation(routes.scheduledItems.skip);

export const useUnskipOccurrence = () => useSkipMutation(routes.scheduledItems.unskip);
