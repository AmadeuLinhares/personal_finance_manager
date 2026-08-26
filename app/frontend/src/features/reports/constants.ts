export const CURRENCIES = ['CAD', 'USD'] as const;

export type ReportCurrency = (typeof CURRENCIES)[number];
