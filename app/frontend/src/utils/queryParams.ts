type QueryParamValue = string | number | boolean | null | undefined | string[];

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

export const withQuery = (url: string, params: Record<string, QueryParamValue>): string => {
  const query = formatQueryParams(params);
  return query ? `${url}?${query}` : url;
};
