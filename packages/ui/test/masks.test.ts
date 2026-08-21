import assert from 'node:assert/strict';
import { test } from 'vitest';

import { coerceMoneyDisplay, formatMoneyInput, parseMoneyInput } from '../src/lib/masks.ts';

test('digits fill from the right — no decimal point to type', () => {
  const typing: [string, number][] = [
    ['4', 4],
    ['45', 45],
    ['459', 459],
    ['4599', 4599],
  ];
  for (const [typed, expected] of typing) {
    assert.equal(parseMoneyInput(typed), expected, typed);
  }
});

test('parse returns integer minor units, never a float', () => {
  for (const input of ['45.99', '45,99', '$45.99', '10,414.68', '  4599 ']) {
    const value = parseMoneyInput(input);
    assert.ok(Number.isInteger(value), `${input} produced ${String(value)}, not an integer`);
  }
  assert.equal(parseMoneyInput('45.99'), 4599);
  assert.equal(parseMoneyInput('10,414.68'), 1041468);
  assert.equal(parseMoneyInput(''), 0);
  assert.equal(parseMoneyInput('-45.99'), -4599);
});

test('format is exact — built by slicing digits, not dividing', () => {
  const cases: [number, string][] = [
    [4599, '45.99'],
    [0, '0.00'],
    [5, '0.05'],
    [50, '0.50'],
    [1041468, '10,414.68'],
    [-4599, '-45.99'],
    [1850000, '18,500.00'],
  ];
  for (const [minorUnits, expected] of cases) {
    assert.equal(formatMoneyInput(minorUnits), expected, String(minorUnits));
  }
});

test('round-trip is lossless across the seed range', () => {
  for (let cents = 0; cents < 200_000; cents += 7) {
    assert.equal(parseMoneyInput(formatMoneyInput(cents)), cents, `broke at ${String(cents)}`);
  }
});

test('no drift where a naive division by 100 would introduce it', () => {
  for (const cents of [1, 3, 7, 29, 815, 1_000_000_000]) {
    assert.equal(parseMoneyInput(formatMoneyInput(cents)), cents, String(cents));
  }
});

test('coerce turns whatever the form holds into a display string', () => {
  assert.equal(coerceMoneyDisplay(4599), '45.99');
  assert.equal(coerceMoneyDisplay('4599'), '45.99');
  assert.equal(coerceMoneyDisplay(null), '');
  assert.equal(coerceMoneyDisplay(''), '');
  assert.equal(coerceMoneyDisplay(Number.NaN), '');
});
