import { type ApiErrorBody } from '@pfm/contracts';

interface FetchDataProps<B> {
  url: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: B;
  headers?: HeadersInit;
}

interface SuccessResponse<R> {
  data: R;
  success: true;
  partial: boolean;
}

interface ErrorResponse {
  data: ApiErrorPayload;
  success: false;
  partial: false;
}

export type ResponseProps<R> = SuccessResponse<R> | ErrorResponse;

export interface ApiErrorPayload {
  status: number;
  code: ApiErrorBody['error']['code'] | 'NETWORK_ERROR';
  message: string;
  details?: ApiErrorBody['error']['details'];
}

export class FetchError extends Error {
  readonly data: ApiErrorPayload;

  constructor(data: ApiErrorPayload) {
    super(data.message);
    this.name = 'FetchError';
    this.data = data;
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const fetchData = async <B, R>(props: FetchDataProps<B>): Promise<ResponseProps<R>> => {
  const headers = new Headers(props.headers);
  let body: BodyInit | undefined;

  if (props.body !== undefined) {
    body = JSON.stringify(props.body);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  let resp: Response;
  try {
    resp = await fetch(`${BASE_URL}${props.url}`, {
      method: props.method,
      headers,
      body,
    });
  } catch {
    return {
      success: false,
      partial: false,
      data: {
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Could not reach the API. Is it running on http://localhost:4000?',
      },
    };
  }

  if (!resp.ok) {
    const parsed = await safeJson<ApiErrorBody>(resp);
    return {
      success: false,
      partial: false,
      data: {
        status: resp.status,
        code: parsed?.error.code ?? 'INTERNAL_ERROR',
        message: parsed?.error.message ?? resp.statusText,
        details: parsed?.error.details,
      },
    };
  }

  const data = await safeJson<R>(resp);
  return { data: data as R, success: true, partial: resp.status === 207 };
};

const safeJson = async <T>(resp: Response): Promise<T | null> => {
  const text = await resp.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};
