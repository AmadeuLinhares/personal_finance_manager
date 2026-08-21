import { cn } from '../lib/cn';

export interface BarProps {
  /** Money already spent, in minor units. */
  spent: number;
  /** The budget it is measured against, in minor units. Zero or absent hides the ratio. */
  budget?: number;
  /**
   * Future money — scheduled occurrences not yet posted. Drawn in a lighter step
   * beside the spent segment, because a forecast must not read as an actual.
   */
  committed?: number;
  /** 8px for a category bar, 6px for the denser project bar. */
  size?: 'md' | 'sm';
  className?: string;
}

/**
 * The one bar in the system. Track is neutral-200, spent is accent-500,
 * committed is accent-300, and going over budget saturates the whole bar to
 * accent-700 rather than overflowing it.
 */
export function Bar({ spent, budget, committed = 0, size = 'md', className }: BarProps) {
  const overBudget = budget !== undefined && budget > 0 && spent > budget;
  const scale = budget !== undefined && budget > 0 ? budget : spent + committed;
  const pct = (value: number) => (scale > 0 ? Math.min(100, (value / scale) * 100) : 0);
  const spentPct = overBudget ? 100 : pct(spent);
  const committedPct = overBudget ? 0 : Math.min(100 - spentPct, pct(committed));

  return (
    <div
      className={cn(
        'flex overflow-hidden rounded-sm bg-neutral-200',
        size === 'md' ? 'h-2' : 'h-1.5',
        className,
      )}
    >
      <div
        className={overBudget ? 'bg-accent-700' : 'bg-accent-500'}
        style={{ width: `${String(spentPct)}%` }}
      />
      {committedPct > 0 ? (
        <div className='bg-accent-300' style={{ width: `${String(committedPct)}%` }} />
      ) : null}
    </div>
  );
}
