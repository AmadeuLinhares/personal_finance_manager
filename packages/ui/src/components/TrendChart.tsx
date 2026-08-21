import { useRef, useState } from 'react';

import { cn } from '../lib/cn';
import { type Currency, formatMoney } from '../lib/format';

const VIEW_W = 480;
const PAD_X = 10;

export interface TrendPoint {
  /** Short axis label, e.g. `Sep` or `2026-09`. */
  label: string;
  /** Integer minor units. */
  value: number;
}

export interface TrendChartProps {
  series: TrendPoint[];
  /**
   * Index of the last point that is an actual. Everything after it is drawn
   * dashed, because a forecast must not read as something that happened. Omit for
   * an all-forecast line.
   */
  actualUpTo?: number;
  height?: number;
  currency?: Currency;
  /** Names the single series — a one-series chart needs no legend box. */
  label: string;
  className?: string;
}

/**
 * The balance projection line. One series, so no legend: the heading names it.
 *
 * The line is accent-600 rather than the ramp's base 500 — 500 sits at 2.6:1
 * against this ground, under the 3:1 a thin mark needs. The endpoint carries a
 * visible value, and the whole series is repeated as a table for screen readers,
 * so identity and magnitude never depend on the line alone.
 */
export function TrendChart({
  series,
  actualUpTo,
  height = 190,
  currency = 'CAD',
  label,
  className,
}: TrendChartProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  if (series.length < 2) return null;

  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const top = 16;
  const bottom = height - 28;

  const x = (index: number) => PAD_X + (index * (VIEW_W - PAD_X * 2)) / (series.length - 1);
  const y = (value: number) => bottom - ((value - min) / span) * (bottom - top);

  const points = series.map((point, index) => ({ ...point, cx: x(index), cy: y(point.value) }));
  const seam = actualUpTo === undefined ? 0 : Math.min(Math.max(actualUpTo, 0), points.length - 1);
  const line = (from: number, to: number) =>
    points
      .slice(from, to + 1)
      .map((point) => `${String(point.cx)},${String(point.cy)}`)
      .join(' ');

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = wrapper.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const ratio = (event.clientX - box.left) / box.width;
    const index = Math.round(ratio * (series.length - 1));
    setHover(Math.min(Math.max(index, 0), series.length - 1));
  };

  const active = hover === null ? null : points[hover];
  const last = points[points.length - 1];

  return (
    <div className={cn('relative', className)}>
      <div
        ref={wrapper}
        onPointerMove={onMove}
        onPointerLeave={() => {
          setHover(null);
        }}
      >
        <svg
          viewBox={`0 0 ${String(VIEW_W)} ${String(height)}`}
          className='block w-full'
          role='img'
          aria-label={label}
        >
          {[top, (top + bottom) / 2, bottom].map((gridY) => (
            <line
              key={gridY}
              x1={0}
              x2={VIEW_W}
              y1={gridY}
              y2={gridY}
              stroke='var(--color-divider)'
              strokeWidth={1}
            />
          ))}

          {seam > 0 ? (
            <polyline
              points={line(0, seam)}
              fill='none'
              stroke='var(--color-accent-600)'
              strokeWidth={2}
              strokeLinejoin='round'
            />
          ) : null}
          <polyline
            points={line(seam, points.length - 1)}
            fill='none'
            stroke='var(--color-accent-600)'
            strokeWidth={2}
            strokeDasharray='5 4'
            strokeLinejoin='round'
          />

          {/* The seam between what happened and what is only committed. */}
          <circle cx={points[seam].cx} cy={points[seam].cy} r={4} fill='var(--color-accent-600)' />

          {active ? (
            <>
              <line
                x1={active.cx}
                x2={active.cx}
                y1={top - 8}
                y2={bottom + 8}
                stroke='var(--color-accent-400)'
                strokeWidth={1}
              />
              <circle
                cx={active.cx}
                cy={active.cy}
                r={4.5}
                fill='var(--color-accent-600)'
                stroke='var(--color-bg)'
                strokeWidth={2}
              />
            </>
          ) : null}

          {points.map((point) => (
            <text
              key={point.label}
              x={point.cx}
              y={height - 8}
              textAnchor='middle'
              className='fill-ink/55 text-[10px]'
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>

      {/* A visible value on the endpoint: the line alone is under 3:1, so the
          figure has to be readable without it. */}
      <div className='mt-1 flex justify-end'>
        <span className='text-ui-sm text-ink/70 tabular-nums'>
          {last.label} · {formatMoney(last.value, currency)}
        </span>
      </div>

      {active ? (
        <div
          className='pointer-events-none absolute -top-1 rounded-md border border-divider bg-bg px-2 py-1 text-label tabular-nums shadow-md'
          style={{ left: `${String((active.cx / VIEW_W) * 100)}%`, transform: 'translateX(-50%)' }}
        >
          {active.label} · {formatMoney(active.value, currency)}
          {hover !== null && hover > seam ? <span className='text-ink/55'> · forecast</span> : null}
        </div>
      ) : null}

      <table className='sr-only'>
        <caption>{label}</caption>
        <tbody>
          {series.map((point, index) => (
            <tr key={point.label}>
              <th scope='row'>{point.label}</th>
              <td>
                {formatMoney(point.value, currency)}
                {index > seam ? ' (forecast)' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
