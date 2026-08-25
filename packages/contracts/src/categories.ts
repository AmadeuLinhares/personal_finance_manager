/**
 * Categories: reference data, and the tree the reports roll up into.
 */

import type { CategoryKind, IsoDate, IsoDateTime, Minor } from './primitives.ts';

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  /** One level of nesting only: a child never has children. */
  parentId: string | null;
  /** Minor units per month; `null` means not budgeted. */
  monthlyBudget: Minor | null;
  color: string;
  archivedAt: IsoDate | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  childIds?: string[];
  transactionCount?: number;
}

export interface CategoriesMeta {
  total: number;
}

export interface CategoryFilters {
  kind?: CategoryKind;
  includeArchived?: boolean;
  /** Adds `transactionCount` — only worth asking for on a management screen. */
  includeUsage?: boolean;
}
