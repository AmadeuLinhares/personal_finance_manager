import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  Frequency,
  IsoDate,
  Minor,
  ScheduledItem,
  ScheduledItemKind,
  ScheduledItemStatus,
  Single,
} from '@/http/api-types';
import { fetchData, FetchError } from '@/http/fetch/fetch';
import { routes } from '@/http/routes';

export interface CreateScheduledItemVariables {
  name: string;
  kind: ScheduledItemKind;
  accountId: string;
  categoryId?: string | null;
  projectId?: string | null;
  /** Signed like a transaction: bills negative, income positive. */
  amount: Minor;
  frequency: Frequency;
  /** For the monthly family this also fixes the day of month. */
  startDate: IsoDate;
  endDate?: IsoDate | null;
  autoPay?: boolean;
  status?: ScheduledItemStatus;
  notes?: string | null;
  variance?: Minor;
}

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
