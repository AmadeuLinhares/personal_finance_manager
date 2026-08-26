import type { CategoryKind, IsoDate, IsoDateTime, Minor } from './primitives.ts';

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  parentId: string | null;
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
  includeUsage?: boolean;
}
