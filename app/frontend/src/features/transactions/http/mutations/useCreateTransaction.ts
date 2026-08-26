import {
  type CreateTransactionVariables,
  type Single,
  type Transaction,
  routes,
} from '@pfm/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchData, FetchError } from '@/http/fetch/fetch';

type Response = Single<Transaction>;

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<Response, FetchError, CreateTransactionVariables>({
    mutationFn: async (variables) => {
      const resp = await fetchData<CreateTransactionVariables, Response>({
        url: routes.transactions.create,
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
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['reports'] }),
        queryClient.invalidateQueries({ queryKey: ['projections'] }),
      ]);
    },
  });
};
