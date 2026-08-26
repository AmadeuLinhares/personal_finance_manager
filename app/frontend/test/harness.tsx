import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { type ReactElement } from 'react';
import { vi } from 'vitest';

interface StubbedRequest {
  url: string;
  method: string;
  params: URLSearchParams;
  body: unknown;
}

type Route = (request: StubbedRequest) => { status?: number; body: unknown };

export function stubFetch(routes: Partial<Record<string, Route>>) {
  const calls: StubbedRequest[] = [];

  vi.stubGlobal(
    'fetch',
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
    lastTo: (path: string) => calls.filter((call) => call.url.startsWith(`/api${path}`)).at(-1),
    matching: (fragment: string) => calls.filter((call) => call.url.includes(fragment)),
  };
}

export function renderScreen(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}
