import { fireEvent, render, screen } from '@testing-library/react';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { test } from 'vitest';

import { Field, Input, type FieldControlProps } from '../src/components/Field.tsx';
import { moneyRegisterOptions } from '../src/lib/masks.ts';

/*
 * Node's type stripping does not handle JSX, so these use createElement. The
 * point of the file is the react-hook-form wiring, which JSX would not make any
 * clearer.
 */

interface Values {
  amount: number;
}

/** A money field wired exactly the way the README documents it. */
function Harness({ onState }: { onState: (values: Values) => void }) {
  const { register, control } = useForm<Values>({ defaultValues: { amount: 0 } });
  onState({ amount: useWatch({ control, name: 'amount' }) });
  // children goes in the props object: FieldProps requires it, so the
  // createElement overload that takes children as a rest argument does not match.
  return h(Field, {
    label: 'Amount',
    children: (field: FieldControlProps) =>
      h(Input, {
        mask: 'money',
        prefix: '$',
        defaultValue: 0,
        ...field,
        ...register('amount', moneyRegisterOptions),
      }),
  });
}

function setup() {
  let latest: Values = { amount: Number.NaN };
  render(
    h(Harness, {
      onState: (values: Values) => {
        latest = values;
      },
    }),
  );
  const input = screen.getByLabelText('Amount');
  assert.ok(input instanceof HTMLInputElement);
  return { input, state: () => latest };
}

test('typing digits lands integer minor units in form state', () => {
  const { input, state } = setup();
  fireEvent.change(input, { target: { value: '4599' } });
  assert.equal(state().amount, 4599);
  assert.equal(typeof state().amount, 'number');
});

test('the field shows the formatted string while state holds the integer', () => {
  const { input, state } = setup();
  fireEvent.change(input, { target: { value: '4599' } });
  assert.equal(input.value, '45.99');
  assert.equal(state().amount, 4599);
});

test('a grouped thousand does not become NaN — the old failure mode', () => {
  const { input, state } = setup();
  fireEvent.change(input, { target: { value: '1041468' } });
  assert.equal(input.value, '10,414.68');
  assert.ok(!Number.isNaN(state().amount), 'amount became NaN');
  assert.equal(state().amount, 1041468);
});

test('blur does not overwrite state by re-reading the formatted DOM value', () => {
  const { input, state } = setup();
  fireEvent.change(input, { target: { value: '1041468' } });
  const afterChange = state().amount;
  fireEvent.blur(input);
  assert.equal(state().amount, afterChange, 'blur changed the value');
  assert.equal(state().amount, 1041468);
});

test('digits fill from the right as they are typed', () => {
  const { input, state } = setup();
  const steps: [string, number, string][] = [
    ['4', 4, '0.04'],
    ['45', 45, '0.45'],
    ['459', 459, '4.59'],
    ['4599', 4599, '45.99'],
  ];
  for (const [typed, expected, shown] of steps) {
    fireEvent.change(input, { target: { value: typed } });
    assert.equal(state().amount, expected, `typed ${typed}`);
    assert.equal(input.value, shown, `typed ${typed}`);
  }
});

test('clearing the field yields 0, not NaN', () => {
  const { input, state } = setup();
  fireEvent.change(input, { target: { value: '4599' } });
  fireEvent.change(input, { target: { value: '' } });
  assert.equal(state().amount, 0);
});

test('register reaches the DOM node through composeRefs', () => {
  const { input } = setup();
  assert.equal(input.getAttribute('name'), 'amount');
});

test('moneyRegisterOptions uses setValueAs, not valueAsNumber', () => {
  // The two are mutually exclusive in react-hook-form, and valueAsNumber is
  // `+value` on the raw field: `+'10,414.68'` is NaN as soon as the amount
  // reaches a thousand, and `+''` is NaN on an empty field.
  const options: Record<string, unknown> = moneyRegisterOptions;
  assert.equal(typeof options.setValueAs, 'function');
  assert.equal(options.valueAsNumber, undefined);
  assert.ok(Number.isNaN(Number('10,414.68')), 'the premise of this guard changed');
});
