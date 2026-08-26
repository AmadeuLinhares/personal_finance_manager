import { type Occurrence } from '@pfm/contracts';
import { useState } from 'react';

import { usePostOccurrence } from '../http/mutations/usePostOccurrence';
import { useSkipOccurrence, useUnskipOccurrence } from '../http/mutations/useSkipOccurrence';
import type { FetchError } from '@/http/fetch/fetch';
import { occurrenceKey } from '@/utils/occurrence';

export function useOccurrenceActions() {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const post = usePostOccurrence();
  const skip = useSkipOccurrence();
  const unskip = useUnskipOccurrence();

  const run = (
    occurrence: Occurrence,
    mutate: (
      variables: { scheduledItemId: string; date: string },
      handlers: { onError: (error: FetchError) => void; onSettled: () => void },
    ) => void,
  ) => {
    setActionError(null);
    setPendingKey(occurrenceKey(occurrence));

    mutate(
      { scheduledItemId: occurrence.scheduledItemId, date: occurrence.date },
      {
        onError: (error) => {
          setActionError(`${error.data.code} — ${error.data.message}`);
        },
        onSettled: () => {
          setPendingKey(null);
        },
      },
    );
  };

  return {
    pendingKey,
    actionError,
    dismissError: () => {
      setActionError(null);
    },
    post: (occurrence: Occurrence) => {
      run(occurrence, post.mutate);
    },
    skip: (occurrence: Occurrence) => {
      run(occurrence, skip.mutate);
    },
    unskip: (occurrence: Occurrence) => {
      run(occurrence, unskip.mutate);
    },
  };
}
