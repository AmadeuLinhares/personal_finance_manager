import { useCallback, useEffect, useState } from 'react';

import { SCREENS, type Screen } from '@/constants/screens';

const PARAM = 'screen';

const toParam = (screen: Screen) => screen.toLowerCase();

const fromSearch = (search: string): Screen | null => {
  const value = new URLSearchParams(search).get(PARAM);
  if (value === null) return null;
  return SCREENS.find((screen) => toParam(screen) === value.toLowerCase()) ?? null;
};

const write = (screen: Screen, push: boolean) => {
  const params = new URLSearchParams(window.location.search);
  params.set(PARAM, toParam(screen));
  const url = `${window.location.pathname}?${params.toString()}`;
  if (push) {
    window.history.pushState(null, '', url);
  } else {
    window.history.replaceState(null, '', url);
  }
};

export function useScreenParam(fallback: Screen) {
  const [screen, setScreen] = useState(() => fromSearch(window.location.search) ?? fallback);

  useEffect(() => {
    if (fromSearch(window.location.search) !== screen) write(screen, false);
  }, [screen]);

  useEffect(() => {
    const onPopState = () => {
      setScreen(fromSearch(window.location.search) ?? fallback);
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [fallback]);

  const select = useCallback((next: Screen) => {
    setScreen(next);
    write(next, true);
  }, []);

  return [screen, select] as const;
}
