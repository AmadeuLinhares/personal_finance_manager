import { toIsoDate } from '@pfm/ui';

export const today = () => toIsoDate(new Date());

export const startOfThisMonth = () => {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
};

export const endOfMonthsAhead = (months: number) => {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth() + months + 1, 0));
};
