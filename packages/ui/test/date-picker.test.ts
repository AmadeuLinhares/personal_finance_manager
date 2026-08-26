import { fireEvent, render, screen, within } from '@testing-library/react';
import assert from 'node:assert/strict';
import { createElement as h, useState } from 'react';
import { test } from 'vitest';

import { DatePicker } from '../src/components/DatePicker.tsx';

function Harness({ mode, initial }: { mode: 'date' | 'month'; initial: string | null }) {
  const [value, setValue] = useState(initial);
  return h('div', null, [
    h(DatePicker, { key: 'picker', mode, value, onChange: setValue, portal: false }),
    h('output', { key: 'out' }, value ?? 'null'),
  ]);
}

const open = () => {
  fireEvent.click(screen.getByRole('button', { name: /2026|Select/ }));
};

test('picking a day emits YYYY-MM-DD for that calendar day', () => {
  render(h(Harness, { mode: 'date', initial: '2026-08-23' }));
  open();

  fireEvent.click(screen.getByRole('button', { name: '14 Aug 2026' }));

  assert.equal(screen.getByRole('status', { hidden: true }).textContent, '2026-08-14');
});

test('month mode emits YYYY-MM and never a day', () => {
  render(h(Harness, { mode: 'month', initial: '2026-08' }));
  open();

  fireEvent.click(screen.getByRole('button', { name: 'June 2026' }));

  assert.equal(screen.getByRole('status', { hidden: true }).textContent, '2026-06');
});

test('month mode opens on the months grid, with no day to click', () => {
  render(h(Harness, { mode: 'month', initial: '2026-08' }));
  open();

  assert.equal(screen.queryByRole('button', { name: '14 Aug 2026' }), null);
  const panel = screen.getByRole('dialog', { name: 'Choose a month' });
  assert.ok(within(panel).getByRole('button', { name: 'August 2026', pressed: true }));
});

test('Clear emits null', () => {
  render(h(Harness, { mode: 'date', initial: '2026-08-23' }));
  open();

  fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

  assert.equal(screen.getByRole('status', { hidden: true }).textContent, 'null');
});

test('the trigger reads as empty when there is no value', () => {
  render(h(Harness, { mode: 'date', initial: null }));

  assert.ok(screen.getByRole('button', { name: 'Select a date' }));
});
