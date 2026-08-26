import { type Direction, type TransactionFilters, type TransactionStatus } from '@pfm/contracts';
import { useState } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const PAGE_SIZE = 8;

const SORT = '-date,-createdAt';

export interface TransactionFilterValues {
  direction: Direction | 'all';
  accountId: string;
  status: TransactionStatus | 'all';
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

export function useTransactionFilters() {
  const [values, setValues] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(values.search);

  const change = (patch: Partial<TransactionFilterValues>) => {
    setValues((previous) => ({ ...previous, ...patch }));
    setPage(1);
  };

  const clear = () => {
    setValues(NO_FILTERS);
    setPage(1);
  };

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
