import { type Direction, type TransactionFilters, type TransactionStatus } from '@pfm/contracts';
import { useState } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const PAGE_SIZE = 8;

/** The one sort the running balance is allowed to use. */
const SORT = '-date,-createdAt';

/** What the filter bar edits. Every field of it ends up as a query param. */
export interface TransactionFilterValues {
  direction: Direction | 'all';
  accountId: string;
  status: TransactionStatus | 'all';
  /** Both ends are inclusive ISO dates, and '' is "unbounded on this side". */
  from: string;
  to: string;
  search: string;
}

const NO_FILTERS: TransactionFilterValues = {
  direction: 'all',
  accountId: 'all',
  status: 'all',
  from: '',
  to: '',
  search: '',
};

/**
 * The screen's own state, and the request it turns into.
 *
 * It lives in a hook rather than in the component because the paging invariant
 * below is the whole reason the two pieces of state cannot be set apart: they
 * are one value, and every caller that forgot the second half of it was a bug.
 */
export function useTransactionFilters() {
  const [values, setValues] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);

  // The search box drives a query param, so it waits for typing to settle.
  const debouncedSearch = useDebouncedValue(values.search);

  /**
   * Changing any filter goes back to the first page. Page 4 of the old result
   * set is not page 4 of the new one, and asking for it usually lands past the
   * end — an empty table over a filter that does match rows.
   */
  const change = (patch: Partial<TransactionFilterValues>) => {
    setValues((previous) => ({ ...previous, ...patch }));
    setPage(1);
  };

  const clear = () => {
    setValues(NO_FILTERS);
    setPage(1);
  };

  /**
   * A running balance is only defined for one account in date order, so the
   * column is requested exactly when the filter allows it. Asking anyway would
   * be a 400, and hiding the rule from the user would be worse.
   */
  const singleAccount = values.accountId !== 'all';
  const search = debouncedSearch.trim();

  const query: TransactionFilters = {
    page,
    pageSize: PAGE_SIZE,
    sort: SORT,
    include: 'account,category',
    accountId: singleAccount ? values.accountId : undefined,
    status: values.status === 'all' ? undefined : values.status,
    direction: values.direction === 'all' ? undefined : values.direction,
    from: values.from === '' ? undefined : values.from,
    to: values.to === '' ? undefined : values.to,
    q: search === '' ? undefined : search,
    withRunningBalance: singleAccount ? true : undefined,
  };

  return { values, change, clear, page, setPage, singleAccount, query };
}
