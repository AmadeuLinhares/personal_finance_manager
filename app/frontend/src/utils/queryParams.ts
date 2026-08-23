type QueryParamValue = string | number | boolean | null | undefined | string[];

/**
 * Turns a filter object into a query string, dropping anything unset.
 *
 * `null`, `undefined` and `''` are dropped rather than sent: this API is strict,
 * and `?status=` is not the same request as no `status` at all. Arrays become
 * comma-separated, which is how the repeatable filters (`accountId`, `tag`,
 * `categoryId`) are documented.
 */
const formatQueryParams = (params: Record<string, QueryParamValue>): string => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length > 0) search.set(key, value.join(','));
      continue;
    }
    search.set(key, String(value));
  }

  return search.toString();
};

/** `routes.transactions.list` + filters, with the `?` only when there is one. */
export const withQuery = (url: string, params: Record<string, QueryParamValue>): string => {
  const query = formatQueryParams(params);
  return query ? `${url}?${query}` : url;
};
