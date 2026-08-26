export interface Single<T> {
  data: T;
}

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
    details?: { path: string; code?: string; message: string }[];
  };
}

export interface BulkResult<T> {
  data: T[];
  errors: { index?: number; id?: string; error: ApiErrorBody['error'] }[];
  meta: { requested: number; created?: number; updated?: number; failed: number };
}
