import { type CreateTransferVariables, type Single, type Transfer, routes } from '@pfm/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchData, FetchError } from '@/http/fetch/fetch';

type Response = Single<Transfer>;

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation<Response, FetchError, CreateTransferVariables>({
    mutationFn: async (variables) => {
      const resp = await fetchData<CreateTransferVariables, Response>({
        url: routes.transfers.create,
        method: 'POST',
        body: variables,
      });

      if (resp.success) {
        return resp.data;
      }
      throw new FetchError(resp.data);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['transfers'] }),
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['projections'] }),
      ]);
    },
  });
};
