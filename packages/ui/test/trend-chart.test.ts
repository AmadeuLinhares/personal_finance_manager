import { render } from '@testing-library/react';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { test } from 'vitest';

import { TrendChart } from '../src/components/TrendChart.tsx';

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
  const svg = container.querySelector('svg');
  assert.ok(svg, 'no svg rendered');
  const viewBox = (svg.getAttribute('viewBox') ?? '').split(' ').map(Number);
  const polylines = [...container.querySelectorAll('polyline')].map((node) =>
    (node.getAttribute('points') ?? '')
      .trim()
      .split(' ')
      .map((pair) => pair.split(',').map(Number)),
  );
  return { container, svg, width: viewBox[2], height: viewBox[3], polylines };
}

test('every point sits inside the viewBox — nothing overflows', () => {
  const { width, height, polylines } = draw();
  for (const line of polylines) {
    for (const [x, y] of line) {
      assert.ok(x >= 0 && x <= width, `x ${String(x)} outside 0..${String(width)}`);
      assert.ok(y >= 0 && y <= height, `y ${String(y)} outside 0..${String(height)}`);
    }
  }
});

test('x advances monotonically, so the line reads left to right', () => {
  const { polylines } = draw();
  for (const line of polylines) {
    for (let index = 1; index < line.length; index += 1) {
      assert.ok(line[index][0] > line[index - 1][0], 'x went backwards');
    }
  }
});

test('the forecast segment is dashed and the actual segment is not', () => {
  const { container } = draw({ actualUpTo: 1 });
  const lines = [...container.querySelectorAll('polyline')];
  assert.equal(lines.length, 2, 'expected an actual and a forecast segment');
  const dashed = lines.filter((node) => node.getAttribute('stroke-dasharray') !== null);
  assert.equal(dashed.length, 1, 'exactly one segment should be dashed');
});

test('an all-forecast line draws one dashed segment, no solid one', () => {
  const { container } = draw({ actualUpTo: undefined });
  const lines = [...container.querySelectorAll('polyline')];
  assert.equal(lines.length, 1);
  assert.ok(lines[0].getAttribute('stroke-dasharray') !== null);
});

test('the series is repeated as a table, so it is not color-only', () => {
  const { container } = draw();
  const rows = container.querySelectorAll('table tr');
  assert.equal(rows.length, SERIES.length);
  assert.match(container.querySelector('caption')?.textContent ?? '', /Projected balance/);
});

test('the endpoint carries a visible figure — the line is under 3:1 on its own', () => {
  const { container } = draw();
  assert.match(container.textContent, /Nov · \$10,842\.71/);
});

test('a series too short to plot renders nothing rather than a broken axis', () => {
  const { container } = render(
    h(TrendChart, { series: [{ label: 'Aug', value: 100 }], label: 'One point' }),
  );
  assert.equal(container.querySelector('svg'), null);
});
