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
  label: string;
  value: number;
}

export interface TrendChartProps {
  series: TrendPoint[];
  actualUpTo?: number;
  height?: number;
  currency?: Currency;
  label: string;
  className?: string;
}

interface ChartRow {
  label: string;
  value: number;
  actual: number | null;
  forecast: number | null;
  isForecast: boolean;
}

const seamOf = (series: TrendPoint[], actualUpTo: number | undefined): number =>
  actualUpTo === undefined ? 0 : Math.min(Math.max(actualUpTo, 0), series.length - 1);

export function toChartRows(series: TrendPoint[], actualUpTo?: number): ChartRow[] {
  const seam = seamOf(series, actualUpTo);

  return series.map((point, index) => ({
    label: point.label,
    value: point.value,
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
