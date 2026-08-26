import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(cleanup);

afterEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  window.history.replaceState(null, '', '/');
});
