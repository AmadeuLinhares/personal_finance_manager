export interface CharacterMask {
  mask: string;
  replacement: Record<string, RegExp>;
}

export const maskDefinitions = {
  isoDate: { mask: 'yyyy-mm-dd', replacement: { y: /\d/, m: /\d/, d: /\d/ } },
  isoMonth: { mask: 'yyyy-mm', replacement: { y: /\d/, m: /\d/ } },
} satisfies Record<string, CharacterMask>;

export function parseMoneyInput(input: unknown): number {
  if (input == null || input === '') return 0;
  if (typeof input === 'number') return Number.isFinite(input) ? Math.trunc(input) : 0;

  if (typeof input !== 'string') return 0;

  const negative = input.trimStart().startsWith('-');
  const digits = input.replace(/\D/g, '');
  if (digits === '') return 0;
  const minorUnits = Number(digits);
  return negative ? -minorUnits : minorUnits;
}

export function formatMoneyInput(minorUnits: number): string {
  const negative = minorUnits < 0;
  const digits = String(Math.abs(Math.trunc(minorUnits))).padStart(3, '0');
  const whole = digits.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}${whole}.${digits.slice(-2)}`;
}

export function coerceMoneyDisplay(raw: unknown): string {
  if (raw == null || raw === '') return '';
  const value = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(value) ? formatMoneyInput(value) : '';
}

export const valueTransformMasks = {
  money: {
    parse: parseMoneyInput,
    format: formatMoneyInput,
    coerce: coerceMoneyDisplay,
  },
} as const;

export type ValueTransformMaskName = keyof typeof valueTransformMasks;

export type MaskName = keyof typeof maskDefinitions | ValueTransformMaskName;

export function isValueTransformMask(mask: unknown): mask is ValueTransformMaskName {
  return mask === 'money';
}

export const moneyRegisterOptions = {
  setValueAs: parseMoneyInput,
} as const;
