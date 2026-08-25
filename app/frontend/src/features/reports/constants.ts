/** The two currencies the seed actually holds — there are no FX rates to sum. */
export const CURRENCIES = ['CAD', 'USD'] as const;

export type ReportCurrency = (typeof CURRENCIES)[number];
