import { render } from '@testing-library/react';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { test } from 'vitest';

import { TrendChart, toChartRows } from '../src/components/TrendChart.tsx';

const SERIES = [
  { label: 'Aug', value: 1116468 },
  { label: 'Sep', value: 949269 },
  { label: 'Oct', value: 1016770 },
  { label: 'Nov', value: 1084271 },
];

function draw(props: Partial<Parameters<typeof TrendChart>[0]> = {}) {
  const { container } = render(
    h(TrendChart, { series: SERIES, actualUpTo: 0, label: 'Projected balance', ...props }),
  );
  return container;
}

test('the actual and forecast segments meet at the seam without overlapping', () => {
  const rows = toChartRows(SERIES, 1);

  assert.deepEqual(
    rows.map((row) => row.actual),
    [1116468, 949269, null, null],
  );
  assert.deepEqual(
    rows.map((row) => row.forecast),
    [null, 949269, 1016770, 1084271],
  );
});

test('a seam past the end is clamped, so nothing reads as forecast', () => {
  const rows = toChartRows(SERIES, 99);

  assert.equal(rows.filter((row) => row.isForecast).length, 0, 'no point sits after the last one');
  assert.deepEqual(
    rows.map((row) => row.actual),
    SERIES.map((point) => point.value),
  );
});

test('an all-forecast line draws no solid segment at all', () => {
  const rows = toChartRows(SERIES, undefined);

  assert.deepEqual(
    rows.map((row) => row.actual),
    [null, null, null, null],
  );
  assert.deepEqual(
    rows.map((row) => row.forecast),
    SERIES.map((point) => point.value),
  );
});

test('the series is repeated as a table, so it is not color-only', () => {
  const container = draw();
  const rows = container.querySelectorAll('table tr');

  assert.equal(rows.length, SERIES.length);
  assert.match(container.querySelector('caption')?.textContent ?? '', /Projected balance/);
});

test('the table marks every point after the seam as a forecast', () => {
  const container = draw({ actualUpTo: 1 });
  const marked = [...container.querySelectorAll('table tr')].map((row) =>
    row.textContent.includes('(forecast)'),
  );

  assert.deepEqual(marked, [false, false, true, true]);
});

test('the plot is hidden from screen readers — the table is what they get', () => {
  const container = draw();
  const plot = container.querySelector('[aria-hidden]');

  assert.ok(plot, 'the plot should be aria-hidden');
  assert.equal(plot.querySelector('table'), null, 'the table must sit outside it');
});

test('the endpoint carries a visible figure — the line is under 3:1 on its own', () => {
  const container = draw();

  assert.match(container.textContent, /Nov · \$10,842\.71/);
});

test('a series too short to plot renders nothing rather than a broken axis', () => {
  const { container } = render(
    h(TrendChart, { series: [{ label: 'Aug', value: 100 }], label: 'One point' }),
  );

  assert.equal(container.textContent, '');
});
