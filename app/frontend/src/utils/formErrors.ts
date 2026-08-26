import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import type { FetchError } from '@/http/fetch/fetch';

export function applyApiErrorToForm<T extends FieldValues>(
  error: FetchError,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): string | null {
  const { code, message, details } = error.data;
  const unplaced: string[] = [];

  for (const detail of details ?? []) {
    const path = detail.path as Path<T>;
    if (fields.includes(path)) {
      setError(path, { type: 'server', message: `${code} — ${detail.message}` });
    } else {
      unplaced.push(`${detail.path}: ${detail.message}`);
    }
  }

  if (details && details.length > 0) {
    return unplaced.length > 0 ? `${code} — ${unplaced.join(' · ')}` : null;
  }

  return `${code} — ${message}`;
}
