import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { type ReactElement } from 'react';
import { vi } from 'vitest';

/**
 * What a screen test is allowed to touch.
 *
 * The seam is `fetch`, not the query hooks: a test that mocks `useGetX` proves
 * the component renders its own mock, and would have passed with the filters
 * wired to nothing. Stubbing the transport keeps the query keys, the param
 * building and the error mapping inside what is being tested.
 */
interface StubbedRequest {
  url: string;
  method: string;
  params: URLSearchParams;
  /** The parsed JSON body, for asserting what a mutation actually sent. */
  body: unknown;
}

type Route = (request: StubbedRequest) => { status?: number; body: unknown };

/**
 * Answers `fetch` from a table of path → handler, and records every call.
 *
 * An unmatched path is a 404 rather than a hang: an unexpected request should
 * fail the assertion it belongs to, not time the suite out.
 */
export function stubFetch(routes: Partial<Record<string, Route>>) {
  const calls: StubbedRequest[] = [];

  vi.stubGlobal(
    'fetch',
    // Only ever called by `fetchData`, which builds a string URL.
    vi.fn((url: string, init?: RequestInit) => {
      const [path, query = ''] = url.replace('/api', '').split('?');
      const request = {
        url,
        method: init?.method ?? 'GET',
        params: new URLSearchParams(query),
        body: typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : null,
      };
      calls.push(request);

      const route: Route | undefined = routes[path];
      const { status = 200, body } = route?.(request) ?? {
        status: 404,
        body: { error: { code: 'NOT_FOUND', message: `No stub for ${url}` } },
      };

      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }),
  );

  return {
    calls,
    /** The last call to a path — the request the current filters produced. */
    lastTo: (path: string) => calls.filter((call) => call.url.startsWith(`/api${path}`)).at(-1),
    /** Every call whose URL contains this fragment, in order. */
    matching: (fragment: string) => calls.filter((call) => call.url.includes(fragment)),
  };
}

/**
 * A fresh client per test, so one test's cache is never another's fixture.
 * Retries are off: a stubbed 500 should surface as an error state immediately.
 */
export function renderScreen(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}
