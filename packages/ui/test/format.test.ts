import assert from 'node:assert/strict';
import { test } from 'vitest';

import {
  formatDate,
  formatMonth,
  formatMoney,
  inputToMinor,
  isBefore,
  minorToInput,
  parseIsoDate,
  toIsoDate,
  toIsoMonth,
} from '../src/lib/format.ts';

const MINUS = '−';

test('an outflow is drawn with a real minus sign, not a hyphen', () => {
  assert.equal(formatMoney(-4599), `${MINUS}$45.99`);
  assert.equal(formatMoney(-4599).startsWith('-'), false);
});

test('the symbol keeps the currencies apart, because they are never summed', () => {
  assert.equal(formatMoney(4599), '$45.99');
  assert.equal(formatMoney(240000, 'USD'), 'US$2,400.00');
  assert.equal(formatMoney(1000, 'EUR'), '€10.00');
});

test('a plus is opt-in, and zero never gets one', () => {
  assert.equal(formatMoney(4599, 'CAD', { signed: true }), '+$45.99');
  assert.equal(formatMoney(4599), '$45.99');
  assert.equal(formatMoney(0, 'CAD', { signed: true }), '$0.00');
});

test('minor units round-trip through the input and back', () => {
  assert.equal(minorToInput(4599), '45.99');
  assert.equal(minorToInput(-4599), '-45.99');
  assert.equal(minorToInput(320000), '3200.00');
  assert.equal(inputToMinor(minorToInput(4599)), 4599);
});

test('an amount that is not exactly representable in cents is refused, not rounded', () => {
  assert.equal(inputToMinor('45.999'), null);
  assert.equal(inputToMinor('4.5.6'), null);
  assert.equal(inputToMinor('abc'), null);
  assert.equal(inputToMinor(''), null);
  assert.equal(inputToMinor('45.9'), 4590);
  assert.equal(inputToMinor('45'), 4500);
});

test('the currency furniture a user pastes in is stripped rather than rejected', () => {
  assert.equal(inputToMinor(' $1,234.50 '), 123450);
  assert.equal(inputToMinor('-1,234.50'), -123450);
});

test('a calendar day is formatted by splitting the string, never through Date', () => {
  assert.equal(formatDate('2026-08-21'), '21 Aug');
  assert.equal(formatDate('2026-08-21', { year: true }), '21 Aug 2026');
  assert.equal(formatDate('2026-01-01'), '1 Jan');
  assert.equal(formatDate('2026-12-31', { year: true }), '31 Dec 2026');
});

test('a string that is not a calendar day comes back untouched', () => {
  assert.equal(formatDate('not-a-date'), 'not-a-date');
  assert.equal(formatDate('2026-08'), '2026-08');
  assert.equal(formatMonth('nope'), 'nope');
  assert.equal(formatMonth('year-month'), 'year-month');
  assert.equal(parseIsoDate('nope'), null);
  assert.equal(parseIsoDate(''), null);
  assert.equal(parseIsoDate(null), null);
  assert.equal(parseIsoDate(undefined), null);
});

test('a month renders in full, for a report header', () => {
  assert.equal(formatMonth('2026-08'), 'August 2026');
  assert.equal(formatMonth('2026-01'), 'January 2026');
});

test('calendar dates compare as plain strings', () => {
  assert.equal(isBefore('2026-08-01', '2026-08-02'), true);
  assert.equal(isBefore('2026-08-02', '2026-08-01'), false);
  assert.equal(isBefore('2026-08-01', '2026-08-01'), false);
  assert.equal(isBefore('2026-09-01', '2026-10-01'), true);
});

test('parsing gives local midnight, so the day never shifts west of Greenwich', () => {
  const parsed = parseIsoDate('2026-08-21');
  assert.ok(parsed);
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 7);
  assert.equal(parsed.getDate(), 21);
  assert.equal(parsed.getHours(), 0);
});

test('a Date goes back to a calendar string without touching UTC', () => {
  assert.equal(toIsoDate(new Date(2026, 7, 21)), '2026-08-21');
  assert.equal(toIsoDate(new Date(2026, 0, 1)), '2026-01-01');
  assert.equal(toIsoMonth(new Date(2026, 7, 21)), '2026-08');
  assert.equal(toIsoMonth(new Date(2026, 11, 31)), '2026-12');
});

test('the round trip through Date and back is the identity', () => {
  const iso = '2026-03-09';
  const parsed = parseIsoDate(iso);
  assert.ok(parsed);
  assert.equal(toIsoDate(parsed), iso);
});
