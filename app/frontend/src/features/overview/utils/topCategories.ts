import { type CategoryTotals } from '@pfm/contracts';

export const topCategories = (byCategory: CategoryTotals[], limit: number): CategoryTotals[] =>
  byCategory
    .filter((category) => category.outflow > 0)
    .sort((first, second) => second.outflow - first.outflow)
    .slice(0, limit);
