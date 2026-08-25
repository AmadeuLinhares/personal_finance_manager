import { type ApiErrorBody } from '@pfm/contracts';

/**
 * The single fetch wrapper every query and mutation goes through.
 *
 * It never throws and never rejects: the outcome is a discriminated union, and
 * the hooks decide what an error means. That keeps the transport dumb and puts
 * the policy (retry, invalidate, surface to the user) in one layer up.
 */
interface FetchDataProps<B> {
  url: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: B;
  headers?: HeadersInit;
}

interface SuccessResponse<R> {
  data: R;
  success: true;
  /** 207 on the bulk endpoints: some rows were created, some are in `errors[]`. */
  partial: boolean;
}

interface ErrorResponse {
  data: ApiErrorPayload;
  success: false;
  partial: false;
}

export type ResponseProps<R> = SuccessResponse<R> | ErrorResponse;

/**
 * A failure, flattened.
 *
 * The API answers `{ error: { code, message, details } }` where `code` is its own
 * string enum, not the HTTP status — a `422` can be `VALIDATION_ERROR` or
 * `CURRENCY_MISMATCH`, and a form needs to tell them apart. Both are kept.
 */
export interface ApiErrorPayload {
  status: number;
  code: ApiErrorBody['error']['code'] | 'NETWORK_ERROR';
  message: string;
  /** Present on validation failures: one entry per offending field. */
  details?: ApiErrorBody['error']['details'];
}

/** Error thrown by query/mutation fns, preserving the structured API error. */
export class FetchError extends Error {
  readonly data: ApiErrorPayload;

  constructor(data: ApiErrorPayload) {
    super(data.message);
    this.name = 'FetchError';
    this.data = data;
  }
}

/**
 * Dev goes through Vite's proxy (`/api` → localhost:4000), so requests stay
 * same-origin and no CORS is involved. `VITE_API_URL` overrides it for a build
 * pointed at a real host.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const fetchData = async <B, R>(props: FetchDataProps<B>): Promise<ResponseProps<R>> => {
  const headers = new Headers(props.headers);
  let body: BodyInit | undefined;

  if (props.body !== undefined) {
    body = JSON.stringify(props.body);
    // Let an explicit caller-provided Content-Type win.
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
    // The API is a separate process. "Failed to fetch" with no structure renders
    // as badly as a crash, so a dead server gets the same shape as a 500.
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
    // Error bodies can be empty or non-JSON (a proxy 502, for one) — guard the parse.
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

/** Parse a response body as JSON, returning null when it is empty or invalid. */
const safeJson = async <T>(resp: Response): Promise<T | null> => {
  const text = await resp.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};
