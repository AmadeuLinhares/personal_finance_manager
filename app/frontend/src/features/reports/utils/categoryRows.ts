import { type CategoryTotals, type Minor } from '@pfm/contracts';

/** One row of the bar list, after the leaf-or-parent decision has been made. */
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

/**
 * Child categories arrive as themselves, carrying `parentId` — the API leaves the
 * roll-up to the client on purpose. Both readings are defensible ("Rent went
 * over" and "Housing went over"), so the choice is the user's, not ours.
 *
 * Budgets add up the same way the spend does: a parent's total budget is the sum
 * of the budgets that were actually set, and stays unbudgeted while none were.
 */
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

/**
 * The month's expense rows, in bar order.
 *
 * `parentNames` is null while the category list has not loaded (or failed), and
 * that is the same answer as "do not roll up": the roll-up cannot be rendered
 * without the labels, and inventing them would put the wrong name on real money.
 */
export const toCategoryRows = (
  byCategory: CategoryTotals[],
  options: { rolledUp: boolean; parentNames: Map<string, string> | null },
): CategoryRow[] => {
  // A category with no outflow (salary, say) is income, not an expense row.
  const expenses = byCategory.filter((category) => category.outflow > 0);

  if (!options.rolledUp || options.parentNames === null) {
    return expenses.map(leafRow);
  }
  return rollUpRows(expenses, options.parentNames);
};
