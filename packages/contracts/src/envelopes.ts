/**
 * The shapes every endpoint answers in, and the one shape a failure answers in.
 */

/** Single records come back as `{ data }`. */
export interface Single<T> {
  data: T;
}

/** Collections come back as `{ data, meta }`. Reports return their own shapes. */
export interface Collection<T, M = ListMeta> {
  data: T[];
  meta: M;
}

export interface ListMeta {
  total: number;
  count: number;
  page: number;
  pageSize: number;
  offset: number;
  totalPages: number;
  hasMore: boolean;
  /** Echo of the applied sort, e.g. `-date,-createdAt`. */
  sort?: string;
}

export interface ApiErrorBody {
  error: {
    code:
      | 'BAD_REQUEST'
      | 'VALIDATION_ERROR'
      | 'INVALID_REFERENCE'
      | 'CURRENCY_MISMATCH'
      | 'NOT_AN_OCCURRENCE'
      | 'UNSUPPORTED_OPERATION'
      | 'NOT_FOUND'
      | 'ROUTE_NOT_FOUND'
      | 'CONFLICT'
      | 'MALFORMED_JSON'
      | 'SIMULATED_ERROR'
      | 'INTERNAL_ERROR';
    message: string;
    /** Present on validation failures: one entry per offending field. */
    details?: { path: string; code?: string; message: string }[];
  };
}

/** Bulk endpoints report per-item outcomes and answer 207 on partial success. */
export interface BulkResult<T> {
  data: T[];
  errors: { index?: number; id?: string; error: ApiErrorBody['error'] }[];
  meta: { requested: number; created?: number; updated?: number; failed: number };
}
