import { useEffect, useState } from 'react';

/**
 * Holds a value back until it stops changing.
 *
 * The search box drives a query param, so without this every keystroke is a
 * request — and with `errorRate` turned on, a keystroke that happens to draw the
 * failing request looks like a bug in the search.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}
