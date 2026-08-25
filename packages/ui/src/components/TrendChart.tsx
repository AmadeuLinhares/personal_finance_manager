import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';

import { cn } from '../lib/cn';
import { type Currency, formatMoney } from '../lib/format';

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

interface ChartRow {
  label: string;
  value: number;
  /**
   * The same figure split across two keys. `null` breaks a line, so the solid
   * and dashed segments never draw over each other; they meet at the seam, which
   * both keys carry so there is no gap between them.
   */
  actual: number | null;
  forecast: number | null;
  isForecast: boolean;
}

/** Clamp an author-supplied seam to a real index. */
const seamOf = (series: TrendPoint[], actualUpTo: number | undefined): number =>
  actualUpTo === undefined ? 0 : Math.min(Math.max(actualUpTo, 0), series.length - 1);

/**
 * Exported for the test: the split is the whole point of this chart, and it is
 * plain data, so it can be asserted without a layout engine.
 */
export function toChartRows(series: TrendPoint[], actualUpTo?: number): ChartRow[] {
  const seam = seamOf(series, actualUpTo);

  return series.map((point, index) => ({
    label: point.label,
    value: point.value,
    // A one-point solid segment would be an invisible line with a stray dot, so
    // a seam of 0 means everything is forecast.
    actual: seam > 0 && index <= seam ? point.value : null,
    forecast: index >= seam ? point.value : null,
    isForecast: index > seam,
  }));
}

const ChartTooltip = ({
  active,
  payload,
  currency,
}: TooltipContentProps & { currency: Currency }) => {
  const row = payload[0]?.payload as ChartRow | undefined;
  if (!active || row === undefined) return null;

  return (
    <div className='rounded-md border border-divider bg-bg px-2 py-1 text-label tabular-nums shadow-md'>
      {row.label} · {formatMoney(row.value, currency)}
      {row.isForecast ? <span className='text-ink/55'> · forecast</span> : null}
    </div>
  );
};

/**
 * The balance projection line. One series, so no legend: the heading names it.
 *
 * The line is accent-600 rather than the ramp's base 500 — 500 sits at 2.6:1
 * against this ground, under the 3:1 a thin mark needs. The endpoint carries a
 * visible value, and the whole series is repeated as a table for screen readers,
 * so identity and magnitude never depend on the line alone. That table is the
 * accessible representation, which is why the plot itself is `aria-hidden`.
 *
 * Colors come from CSS variables rather than the tokens module, so the chart
 * re-themes without a re-render.
 */
export function TrendChart({
  series,
  actualUpTo,
  height = 190,
  currency = 'CAD',
  label,
  className,
}: TrendChartProps) {
  if (series.length < 2) return null;

  const rows = toChartRows(series, actualUpTo);
  const seam = seamOf(series, actualUpTo);
  const last = series[series.length - 1];

  return (
    <div className={cn('relative', className)}>
      <div style={{ height }} aria-hidden>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={rows} margin={{ top: 16, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid vertical={false} stroke='var(--color-divider)' />
            <XAxis
              dataKey='label'
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--color-ink)', fillOpacity: 0.55, fontSize: 10 }}
            />
            {/* Hidden, but it still sets the scale: the original chart mapped the
                series' own min and max to the plot's edges, and so does this. */}
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Tooltip
              content={(props: TooltipContentProps) => (
                <ChartTooltip {...props} currency={currency} />
              )}
              cursor={{ stroke: 'var(--color-accent-400)', strokeWidth: 1 }}
              isAnimationActive={false}
            />
            <Line
              type='linear'
              dataKey='actual'
              name={label}
              stroke='var(--color-accent-600)'
              strokeWidth={2}
              strokeLinejoin='round'
              dot={false}
              activeDot={{ r: 4.5, stroke: 'var(--color-bg)', strokeWidth: 2 }}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              type='linear'
              dataKey='forecast'
              name={label}
              stroke='var(--color-accent-600)'
              strokeWidth={2}
              strokeDasharray='5 4'
              strokeLinejoin='round'
              dot={false}
              activeDot={{ r: 4.5, stroke: 'var(--color-bg)', strokeWidth: 2 }}
              connectNulls={false}
              isAnimationActive={false}
            />
            {/* The seam between what happened and what is only committed. */}
            <ReferenceDot
              x={rows[seam].label}
              y={rows[seam].value}
              r={4}
              fill='var(--color-accent-600)'
              stroke='none'
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* A visible value on the endpoint: the line alone is under 3:1, so the
          figure has to be readable without it. */}
      <div className='mt-1 flex justify-end'>
        <span className='text-ui-sm text-ink/70 tabular-nums'>
          {last.label} · {formatMoney(last.value, currency)}
        </span>
      </div>

      <table className='sr-only'>
        <caption>{label}</caption>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope='row'>{row.label}</th>
              <td>
                {formatMoney(row.value, currency)}
                {row.isForecast ? ' (forecast)' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
