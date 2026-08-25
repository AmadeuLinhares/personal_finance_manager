import {
  type CreateScheduledItemVariables,
  type ScheduledItem,
  type Single,
  routes,
} from '@pfm/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchData, FetchError } from '@/http/fetch/fetch';

type Response = Single<ScheduledItem>;

export const useCreateScheduledItem = () => {
  const queryClient = useQueryClient();

  return useMutation<Response, FetchError, CreateScheduledItemVariables>({
    mutationFn: async (variables) => {
      const resp = await fetchData<CreateScheduledItemVariables, Response>({
        url: routes.scheduledItems.create,
        method: 'POST',
        body: variables,
      });

      if (resp.success) {
        return resp.data;
      }
      throw new FetchError(resp.data);
    },
    onSuccess: async () => {
      // A new rule generates dates immediately, so the forecast changes with it.
      // The ledger does not: nothing has been posted yet.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['scheduled-items'] }),
        queryClient.invalidateQueries({ queryKey: ['projections'] }),
      ]);
    },
  });
};
