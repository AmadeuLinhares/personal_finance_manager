export type Currency = 'CAD' | 'USD' | 'EUR';

const MINUS = '−';

export function formatMoney(
  minorUnits: number,
  currency: Currency = 'CAD',
  options: { signed?: boolean } = {},
): string {
  const { signed = false } = options;
  const formatted = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  }).format(Math.abs(minorUnits) / 100);

  if (minorUnits < 0) return `${MINUS}${formatted}`;
  return signed && minorUnits > 0 ? `+${formatted}` : formatted;
}

export function minorToInput(minorUnits: number): string {
  return (minorUnits / 100).toFixed(2);
}

export function inputToMinor(value: string): number | null {
  const trimmed = value.trim().replace(/[$\s,]/g, '');
  if (!/^-?\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  return Math.round(Number(trimmed) * 100);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(isoDate: string, options: { year?: boolean } = {}): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  const dayNumber = Number(day);
  const monthNumber = Number(month);
  if (!Number.isInteger(dayNumber) || !Number.isInteger(monthNumber)) return isoDate;
  const label = `${String(dayNumber)} ${MONTHS[monthNumber - 1] ?? month}`;
  return options.year ? `${label} ${year}` : label;
}

export function formatMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split('-');
  if (!year || !month) return isoMonth;
  const monthNumber = Number(month);
  if (!Number.isInteger(monthNumber)) return isoMonth;
  const full = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${full[monthNumber - 1] ?? month} ${year}`;
}

export function isBefore(a: string, b: string): boolean {
  return a < b;
}

export function parseIsoDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

const pad = (value: number) => String(value).padStart(2, '0');

export function toIsoDate(date: Date): string {
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toIsoMonth(date: Date): string {
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}`;
}
