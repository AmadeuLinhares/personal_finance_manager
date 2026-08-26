import { cn } from '../lib/cn';

export interface BarProps {
  spent: number;
  budget?: number;
  committed?: number;
  size?: 'md' | 'sm';
  className?: string;
}

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
