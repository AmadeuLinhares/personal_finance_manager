import { toIsoDate } from '@pfm/ui';

/**
 * The window starts at the first of this month, not today.
 *
 * Today is where the forecast begins, but it is not where the user's month
 * begins: what already went out this month is the context that makes the rest of
 * it readable, and an overdue bill from the 12th has to stay visible.
 */
export const startOfThisMonth = () => {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
};

/** Day 0 of the following month is the last day of this one, in every month. */
export const endOfMonthsAhead = (months: number) => {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth() + months + 1, 0));
};
