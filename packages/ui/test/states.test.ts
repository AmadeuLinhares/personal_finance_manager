import { fireEvent, render, screen } from '@testing-library/react';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { expect, test, vi } from 'vitest';

import { Button } from '../src/components/Button.tsx';
import { EmptyState, ErrorState, Notice, Pagination, Skeleton } from '../src/components/states.tsx';

test('a wait is announced, and the bars themselves carry nothing', () => {
  const { container } = render(h(Skeleton, { lines: 4, label: 'Loading the report…' }));

  assert.equal(screen.getByRole('status').textContent, 'Loading the report…');
  const bars = container.querySelector('[aria-hidden="true"]');
  assert.equal(bars?.children.length, 4);
});

test('an unlabelled skeleton announces nothing rather than announcing noise', () => {
  render(h(Skeleton, { lines: 2 }));
  assert.equal(screen.queryByRole('status'), null);
});

test('an empty state can stand on its own, or carry a way out', () => {
  render(h(EmptyState, { title: 'No expenses this month' }));
  assert.ok(screen.getByText('No expenses this month'));
  assert.equal(screen.queryByRole('button'), null);

  render(
    h(EmptyState, {
      title: 'Nothing scheduled',
      description: 'Widen the horizon.',
      action: h(Button, null, 'Schedule item'),
    }),
  );
  assert.ok(screen.getByText('Widen the horizon.'));
  assert.ok(screen.getByRole('button', { name: 'Schedule item' }));
});

test('a failure is an alert, and its retry calls back', () => {
  const onRetry = vi.fn();
  render(
    h(ErrorState, {
      title: 'Could not load the report — SIMULATED_ERROR',
      description: 'No report today.',
      onRetry,
    }),
  );

  const alert = screen.getByRole('alert');
  assert.ok(alert.textContent.includes('SIMULATED_ERROR'));
  assert.ok(alert.textContent.includes('No report today.'));

  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test('an error with nothing to retry offers no button', () => {
  render(h(ErrorState, { title: 'Gone' }));
  assert.equal(screen.queryByRole('button'), null);
});

test('a notice that needs attention is an alert; a footnote is not', () => {
  render(h(Notice, { children: '3 occurrences are overdue' }));
  assert.equal(screen.getByRole('alert').textContent, '3 occurrences are overdue');

  render(h(Notice, { variant: 'muted', children: 'Excluded: 4 transfer legs' }));
  assert.ok(screen.getByText('Excluded: 4 transfer legs'));
  assert.equal(screen.getAllByRole('alert').length, 1);
});

test('a notice can carry the action that dismisses it', () => {
  const onDismiss = vi.fn();
  render(
    h(Notice, {
      action: h(Button, { onClick: onDismiss, children: 'Dismiss' }),
      children: 'It failed',
    }),
  );

  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(onDismiss).toHaveBeenCalledTimes(1);
});

test('pagination says where you are and moves one page at a time', () => {
  const onPageChange = vi.fn();
  render(h(Pagination, { page: 2, pageCount: 5, onPageChange, summary: 'Showing 9–16 of 40' }));

  assert.ok(screen.getByText('Showing 9–16 of 40'));
  assert.ok(screen.getByText(/Page 2 of 5/));

  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(onPageChange).toHaveBeenCalledWith(3);

  fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
  expect(onPageChange).toHaveBeenCalledWith(1);
});

test('the ends of the range are disabled, not merely ignored', () => {
  const onPageChange = vi.fn();
  render(h(Pagination, { page: 1, pageCount: 1, onPageChange }));

  const previous = screen.getByRole('button', { name: 'Previous page' });
  const next = screen.getByRole('button', { name: 'Next page' });
  assert.ok(previous instanceof HTMLButtonElement);
  assert.ok(next instanceof HTMLButtonElement);
  assert.equal(previous.disabled, true);
  assert.equal(next.disabled, true);
});
