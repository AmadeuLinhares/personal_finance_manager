import { fireEvent, render, screen } from '@testing-library/react';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { expect, test, vi } from 'vitest';

import {
  Field,
  Input,
  Select,
  Textarea,
  type FieldControlProps,
} from '../src/components/Field.tsx';

const firstChild = (container: HTMLElement) => {
  const element = container.firstElementChild;
  assert.ok(element);
  return element;
};

const query = (container: HTMLElement, selector: string) => {
  const element = container.querySelector(selector);
  assert.ok(element);
  return element;
};

const field = (props: Partial<Parameters<typeof Field>[0]> = {}) =>
  render(
    h(Field, {
      label: 'Description',
      children: (control: FieldControlProps) => h(Input, control),
      ...props,
    }),
  );

test('the label points at the control it labels', () => {
  field();
  const input = screen.getByLabelText('Description');
  assert.ok(input.id);
  assert.equal(input.getAttribute('aria-invalid'), null);
  assert.equal(input.getAttribute('aria-describedby'), null);
});

test('a hint is wired to the control through aria-describedby', () => {
  field({ hint: 'Merchant name, as it appears on the statement' });
  const input = screen.getByLabelText('Description');
  const described = input.getAttribute('aria-describedby');
  assert.ok(described);
  assert.equal(
    document.getElementById(described)?.textContent,
    'Merchant name, as it appears on the statement',
  );
  assert.equal(input.getAttribute('aria-invalid'), null);
});

test('an error marks the control invalid and describes it', () => {
  field({ error: 'Description is required' });
  const input = screen.getByLabelText('Description');
  assert.equal(input.getAttribute('aria-invalid'), 'true');
  const described = input.getAttribute('aria-describedby');
  assert.ok(described);
  assert.ok(document.getElementById(described)?.textContent.includes('Description is required'));
});

test('the error replaces the hint rather than stacking with it', () => {
  field({ hint: 'A hint', error: 'An error' });
  assert.equal(screen.queryByText('A hint'), null);
  assert.ok(screen.getByText('An error'));
});

test('a falsy error is not an error — false, null and empty string all pass through', () => {
  for (const error of [false, null, ''] as const) {
    const { unmount } = field({ error, hint: 'still the hint' });
    const input = screen.getByLabelText('Description');
    assert.equal(input.getAttribute('aria-invalid'), null, `error=${JSON.stringify(error)}`);
    assert.ok(screen.getByText('still the hint'));
    unmount();
  }
});

test('an Input with no affixes is the bare control, with no wrapper', () => {
  const { container } = render(h(Input, { 'aria-label': 'Plain' }));
  assert.equal(firstChild(container).tagName, 'INPUT');
});

test('a prefix or a suffix wraps the control in a box, and is hidden from readers', () => {
  const prefixed = render(h(Input, { prefix: '$', 'aria-label': 'Amount' })).container;
  assert.equal(firstChild(prefixed).tagName, 'DIV');
  assert.equal(query(prefixed, '[aria-hidden="true"]').textContent, '$');

  const suffixed = render(h(Input, { suffix: 'CAD', 'aria-label': 'Amount' })).container;
  assert.equal(firstChild(suffixed).tagName, 'DIV');
  assert.equal(query(suffixed, '[aria-hidden="true"]').textContent, 'CAD');
});

test('both affixes sit either side of the control, in order', () => {
  const { container } = render(h(Input, { prefix: '$', suffix: 'CAD', 'aria-label': 'Amount' }));
  const box = firstChild(container);
  assert.equal(box.children.length, 3);
  assert.equal(box.children[0].textContent, '$');
  assert.equal(box.children[1].tagName, 'INPUT');
  assert.equal(box.children[2].textContent, 'CAD');
});

test('a money input reports integer minor units and takes decimal input mode', () => {
  const onValueChange = vi.fn();
  render(h(Input, { mask: 'money', 'aria-label': 'Amount', defaultValue: 0, onValueChange }));

  const input = screen.getByLabelText('Amount');
  assert.equal(input.getAttribute('inputmode'), 'decimal');

  fireEvent.change(input, { target: { value: '4599' } });
  expect(onValueChange).toHaveBeenCalledWith(4599);
  assert.equal((input as HTMLInputElement).value, '45.99');
});

test('a controlled money input renders what it was handed, not its own state', () => {
  const { rerender } = render(h(Input, { mask: 'money', 'aria-label': 'Amount', value: 4599 }));
  const first = screen.getByLabelText('Amount');
  assert.ok(first instanceof HTMLInputElement);
  assert.equal(first.value, '45.99');

  rerender(h(Input, { mask: 'money', 'aria-label': 'Amount', value: 320000 }));
  const second = screen.getByLabelText('Amount');
  assert.ok(second instanceof HTMLInputElement);
  assert.equal(second.value, '3,200.00');
});

test('a character mask still forwards the raw change event', () => {
  const onChange = vi.fn();
  render(h(Input, { mask: 'isoDate', 'aria-label': 'Date', onChange }));

  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-08-21' } });
  expect(onChange).toHaveBeenCalledTimes(1);
});

test('Select and Textarea are the same field, in another shape', () => {
  render(
    h(Field, {
      label: 'Account',
      children: (control: FieldControlProps) =>
        h(Select, { ...control, children: h('option', null, 'Chequing') }),
    }),
  );
  assert.equal(screen.getByLabelText('Account').tagName, 'SELECT');

  render(
    h(Field, {
      label: 'Notes',
      children: (control: FieldControlProps) => h(Textarea, control),
    }),
  );
  assert.equal(screen.getByLabelText('Notes').tagName, 'TEXTAREA');
});
