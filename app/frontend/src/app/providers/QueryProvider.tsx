import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import { FetchError } from '@/http/fetch/fetch';

/**
 * One client for the app, created once.
 *
 * The defaults encode two decisions worth arguing about:
 *
 * - **A 4xx is never retried.** Repeating a 422 produces the same 422 and makes
 *   the user wait three times for it. Only 5xx, a simulated failure and a dead
 *   server get a second chance.
 * - **No refetch on window focus.** Every balance, report and projection is
 *   derived on read, so a refetch is never free; and while building against
 *   `?__latency=`, a refocus storm hides the state you are trying to look at.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (error instanceof FetchError) {
                const { status } = error.data;
                if (status >= 400 && status < 500) return false;
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
