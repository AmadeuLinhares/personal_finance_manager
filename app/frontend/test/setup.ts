import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Without this, every render stacks up in document.body and the next
// getByRole finds several matches.
afterEach(cleanup);

// A stubbed fetch must not survive into the next test's assertions.
afterEach(() => {
  vi.unstubAllGlobals();
});
