import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IsoDate, Minor, Single, Transaction, TransactionStatus } from '@/http/api-types';
import { fetchData, FetchError } from '@/http/fetch/fetch';
import { routes } from '@/http/routes';

export interface CreateTransactionVariables {
  accountId: string;
  date: IsoDate;
  /**
   * Integer minor units, signed: negative leaves the account, positive enters
   * it. `45.99` is a 422 — the sign and the scaling are both the client's job.
   */
  amount: Minor;
  description: string;
  merchant?: string | null;
  categoryId?: string | null;
  projectId?: string | null;
  status?: TransactionStatus;
  notes?: string | null;
  tags?: string[];
}

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
      // FetchError, not Error: the form needs `details[]` to put a message under
      // the field that caused it.
      throw new FetchError(resp.data);
    },
    onSuccess: async () => {
      // One new row moves the account balance, the month's category totals and
      // the starting point of the projection. All three are derived from the same
      // ledger, so all three are now stale.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['reports'] }),
        queryClient.invalidateQueries({ queryKey: ['projections'] }),
      ]);
    },
  });
};
