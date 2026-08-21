import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Without this, every render stacks up in document.body and the next
// getByLabelText finds several matches.
afterEach(cleanup);
