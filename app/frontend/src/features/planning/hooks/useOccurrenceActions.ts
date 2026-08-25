import { type Occurrence } from '@pfm/contracts';
import { useState } from 'react';

import { usePostOccurrence } from '../http/mutations/usePostOccurrence';
import { useSkipOccurrence, useUnskipOccurrence } from '../http/mutations/useSkipOccurrence';
import { occurrenceKey } from '../utils/occurrence';
import type { FetchError } from '@/http/fetch/fetch';

/**
 * Post, skip and undo, plus the two pieces of state that make them readable.
 *
 * The three mutations differ only in which endpoint they hit and what they
 * invalidate, so the screen should not have to repeat the bookkeeping around
 * them: one row is in flight at a time, and a failure is a message the user can
 * dismiss rather than a state the row is stuck in.
 */
export function useOccurrenceActions() {
  /** Which row is mid-flight, so only its own buttons go quiet. */
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
