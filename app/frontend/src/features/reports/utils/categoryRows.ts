import { type CategoryTotals, type Minor } from '@pfm/contracts';

export interface CategoryRow {
  key: string;
  name: string;
  outflow: Minor;
  budget: Minor | null;
  overBudget: boolean;
}

const leafRow = (category: CategoryTotals): CategoryRow => ({
  key: category.categoryId ?? 'uncategorised',
  name: category.name,
  outflow: category.outflow,
  budget: category.budget ?? null,
  overBudget: category.overBudget ?? false,
});

const rollUpRows = (categories: CategoryTotals[], names: Map<string, string>): CategoryRow[] => {
  const merged = new Map<string, CategoryRow>();

  for (const category of categories) {
    const row = leafRow(category);
    const key = category.parentId ?? row.key;
    const name = category.parentId === null ? row.name : (names.get(category.parentId) ?? row.name);
    const previous = merged.get(key);

    const outflow = (previous?.outflow ?? 0) + row.outflow;
    const budget =
      previous?.budget === null || previous?.budget === undefined
        ? row.budget
        : previous.budget + (row.budget ?? 0);

    merged.set(key, {
      key,
      name,
      outflow,
      budget,
      overBudget: budget !== null && outflow > budget,
    });
  }

  return [...merged.values()].sort((a, b) => b.outflow - a.outflow);
};

export const toCategoryRows = (
  byCategory: CategoryTotals[],
  options: { rolledUp: boolean; parentNames: Map<string, string> | null },
): CategoryRow[] => {
  const expenses = byCategory.filter((category) => category.outflow > 0);

  if (!options.rolledUp || options.parentNames === null) {
    return expenses.map(leafRow);
  }
  return rollUpRows(expenses, options.parentNames);
};
