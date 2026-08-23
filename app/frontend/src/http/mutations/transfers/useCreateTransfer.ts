import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IsoDate, Minor, Single, TransactionStatus, Transfer } from '@/http/api-types';
import { fetchData, FetchError } from '@/http/fetch/fetch';
import { routes } from '@/http/routes';

export interface CreateTransferVariables {
  fromAccountId: string;
  toAccountId: string;
  /** A positive magnitude. Each leg's sign is derived by the server. */
  amount: Minor;
  date: IsoDate;
  description?: string | null;
  notes?: string | null;
  status?: TransactionStatus;
}

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
      // Two legs, two accounts. Reports are untouched: transfer legs are already
      // excluded from them by default, so nothing they show can have changed.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['transfers'] }),
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['projections'] }),
      ]);
    },
  });
};
