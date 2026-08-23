import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  type Ref,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../lib/cn';
import { composeRefs } from '../lib/composeRefs';
import { formatDate, formatMonth, parseIsoDate, toIsoDate, toIsoMonth } from '../lib/format';

/*
 * Month and weekday names are built once at module load, so the calendar never
 * depends on the runtime "today". `en-CA` matches formatMoney's locale — the app
 * speaks one language to the user, not one per component.
 */
const monthName = (month: 'long' | 'short') =>
  Array.from({ length: 12 }, (_, index) =>
    new Intl.DateTimeFormat('en-CA', { month }).format(new Date(2023, index, 1)),
  );

const MONTHS = monthName('long');
const MONTHS_SHORT = monthName('short');

// 1 Jan 2023 was a Sunday, so this walks Sun→Sat for the weekday header.
const WEEKDAYS = Array.from({ length: 7 }, (_, index) =>
  new Intl.DateTimeFormat('en-CA', { weekday: 'narrow' }).format(new Date(2023, 0, 1 + index)),
);

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const sameDay = (a: Date, b: Date | null) =>
  a.getFullYear() === b?.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export interface DatePickerProps {
  /** Forwarded to the trigger, so react-hook-form can focus the field on error. */
  ref?: Ref<HTMLButtonElement>;
  /**
   * `'date'` reads and writes `YYYY-MM-DD`; `'month'` reads and writes `YYYY-MM`
   * and skips the day grid entirely. Both are what the API takes — a month filter
   * that emitted a full date would just be thrown away by the caller.
   */
  mode?: 'date' | 'month';
  value?: string | null;
  /** The new ISO value, or null when cleared. */
  onChange?: (value: string | null) => void;
  /** Fired when the panel closes — wire react-hook-form's `field.onBlur` here. */
  onBlur?: () => void;
  /** Bounds, in the same shape as `value`. */
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  /**
   * `false` renders the panel inline, absolutely positioned. Needed inside a
   * Dialog: a portaled panel lives outside the dialog's DOM, so its focus trap
   * cannot reach the calendar and Tab would escape the modal.
   */
  portal?: boolean;
  id?: string;
  /** Renders a hidden input, for an uncontrolled form post. */
  name?: string;
  className?: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
  /** Names the trigger where no visible label does, e.g. a filter bar. */
  'aria-label'?: string;
}

const GAP = 6;
const PANEL_WIDTH = 288;

/**
 * A calendar in the system's own chrome, because the native control is not
 * styleable and renders a different widget in every browser.
 *
 * Label, hint and error are deliberately absent: `Field` owns those, and owns the
 * id and aria wiring that goes with them. Pass this as a Field child, the same way
 * as Input and Select.
 */
export function DatePicker({
  ref,
  mode = 'date',
  value,
  onChange,
  onBlur,
  min,
  max,
  placeholder = mode === 'month' ? 'Select a month' : 'Select a date',
  disabled = false,
  portal = true,
  id,
  name,
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'days' | 'months'>(mode === 'month' ? 'months' : 'days');
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /** A month value parses as its first day, which is all the grid needs. */
  const selected = useMemo(
    () => parseIsoDate(mode === 'month' && value ? `${value}-01` : value),
    [mode, value],
  );
  const minDate = useMemo(
    () => (min ? parseIsoDate(mode === 'month' ? `${min}-01` : min) : null),
    [min, mode],
  );
  const maxDate = useMemo(
    () => (max ? parseIsoDate(mode === 'month' ? `${max}-01` : max) : null),
    [max, mode],
  );

  const [cursor, setCursor] = useState(() => selected ?? new Date());

  /*
   * Keep the visible month in step when the value changes from outside. Adjusting
   * state during render is React's own recommendation for this, and avoids the
   * setState-in-effect cascade the lint rule (rightly) rejects.
   */
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (selected) setCursor(selected);
  }

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const place = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setCoords({
      top: rect.bottom + GAP,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 8)),
    });
  };

  /** Every close path goes through here, so `onBlur` fires exactly once. */
  const close = useCallback(() => {
    setOpen(false);
    onBlur?.();
  }, [onBlur]);

  // Position before paint, or the panel flashes at the wrong spot.
  useLayoutEffect(() => {
    if (open && portal) place();
  }, [open, portal]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
        triggerRef.current?.focus();
      }
    };
    const reposition = () => {
      if (portal) place();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, close, portal]);

  const outOfRange = (date: Date) =>
    (minDate !== null && date < startOfDay(minDate)) ||
    (maxDate !== null && date > startOfDay(maxDate));
  const monthBelowMin = (y: number, m: number) =>
    minDate !== null && new Date(y, m + 1, 0) < startOfDay(minDate);
  const monthAboveMax = (y: number, m: number) =>
    maxDate !== null && new Date(y, m, 1) > startOfDay(maxDate);
  const yearBelowMin = (y: number) => minDate !== null && new Date(y, 11, 31) < startOfDay(minDate);
  const yearAboveMax = (y: number) => maxDate !== null && new Date(y, 0, 1) > startOfDay(maxDate);

  // Six weeks from the Sunday on or before the 1st: a fixed grid never reflows.
  const grid = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay();
    return Array.from(
      { length: 42 },
      (_, index) => new Date(year, month, 1 - firstWeekday + index),
    );
  }, [year, month]);

  const today = startOfDay(new Date());
  const label = value
    ? mode === 'month'
      ? formatMonth(value)
      : formatDate(value, { year: true })
    : placeholder;

  const commit = (next: string) => {
    onChange?.(next);
    close();
    triggerRef.current?.focus();
  };

  const pickDay = (date: Date) => {
    if (outOfRange(date)) return;
    commit(toIsoDate(date));
  };

  const pickMonth = (index: number) => {
    if (mode === 'month') {
      commit(toIsoMonth(new Date(year, index, 1)));
      return;
    }
    setCursor(new Date(year, index, 1));
    setView('days');
  };

  const toggle = () => {
    if (disabled) return;
    if (open) {
      close();
      return;
    }
    setView(mode === 'month' ? 'months' : 'days');
    setOpen(true);
  };

  const steppingYears = view === 'months';
  const step = (delta: number) => {
    setCursor(steppingYears ? new Date(year + delta, month, 1) : new Date(year, month + delta, 1));
  };

  const navButton =
    'flex size-8 flex-none items-center justify-center rounded-md text-ink/55 ' +
    'hover:bg-ink/7 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent';

  /** Selection is a stroke, not a fill — the same rule Button and Segmented follow. */
  const chosen = 'text-accent font-semibold shadow-[inset_0_0_0_1px_var(--color-accent)]';

  const panel = (
    <div
      ref={panelRef}
      role='dialog'
      aria-label={mode === 'month' ? 'Choose a month' : 'Choose a date'}
      style={
        portal && coords ? { top: coords.top, left: coords.left, width: PANEL_WIDTH } : undefined
      }
      className={cn(
        'rounded-lg border border-divider bg-surface p-3 shadow-lg',
        portal ? 'fixed z-50' : 'absolute top-full left-0 z-50 mt-1 w-[288px]',
      )}
    >
      <div className='mb-2 flex items-center gap-1'>
        <button
          type='button'
          aria-label={steppingYears ? 'Previous year' : 'Previous month'}
          disabled={steppingYears ? yearBelowMin(year - 1) : monthBelowMin(year, month - 1)}
          onClick={() => {
            step(-1);
          }}
          className={navButton}
        >
          <ChevronLeft className='size-4' aria-hidden='true' />
        </button>

        <button
          type='button'
          // In month mode the day grid is not a place the user can go.
          disabled={mode === 'month'}
          aria-expanded={mode === 'month' ? undefined : view === 'months'}
          onClick={() => {
            setView(view === 'days' ? 'months' : 'days');
          }}
          className={cn(
            'flex flex-1 items-center justify-center gap-1 rounded-md py-1.5',
            'font-semibold font-heading text-ui hover:bg-ink/7 disabled:hover:bg-transparent',
          )}
        >
          {view === 'days' ? `${MONTHS[month] ?? ''} ${String(year)}` : String(year)}
          {mode === 'month' ? null : (
            <ChevronDown
              className={cn('size-3 text-ink/55', view === 'months' && 'rotate-180')}
              aria-hidden='true'
            />
          )}
        </button>

        <button
          type='button'
          aria-label={steppingYears ? 'Next year' : 'Next month'}
          disabled={steppingYears ? yearAboveMax(year + 1) : monthAboveMax(year, month + 1)}
          onClick={() => {
            step(1);
          }}
          className={navButton}
        >
          <ChevronRight className='size-4' aria-hidden='true' />
        </button>
      </div>

      {view === 'days' ? (
        <>
          <div
            className='mb-1 grid grid-cols-7 text-center text-meta text-ink/55'
            aria-hidden='true'
          >
            {WEEKDAYS.map((weekday, index) => (
              <span key={index}>{weekday}</span>
            ))}
          </div>
          <div className='grid grid-cols-7 gap-0.5'>
            {grid.map((date) => {
              const outside = date.getMonth() !== month;
              const isSelected = sameDay(date, selected);
              const isToday = sameDay(date, today);
              return (
                <button
                  key={toIsoDate(date)}
                  type='button'
                  disabled={outOfRange(date)}
                  // Otherwise a screen reader hears "14, button" with no month.
                  aria-label={formatDate(toIsoDate(date), { year: true })}
                  aria-current={isToday ? 'date' : undefined}
                  aria-pressed={isSelected}
                  onClick={() => {
                    pickDay(date);
                  }}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-md text-ui-sm',
                    'hover:bg-accent/12 disabled:opacity-30 disabled:hover:bg-transparent',
                    outside && !isSelected && 'text-ink/35',
                    isToday && !isSelected && 'font-semibold text-accent-700',
                    isSelected && chosen,
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className='grid grid-cols-3 gap-1.5'>
          {MONTHS_SHORT.map((short, index) => {
            const isSelected = selected?.getFullYear() === year && selected.getMonth() === index;
            return (
              <button
                key={short}
                type='button'
                disabled={monthBelowMin(year, index) || monthAboveMax(year, index)}
                aria-label={`${MONTHS[index] ?? short} ${String(year)}`}
                aria-pressed={isSelected}
                onClick={() => {
                  pickMonth(index);
                }}
                className={cn(
                  'h-9 rounded-md border border-divider text-ui-sm',
                  'hover:bg-ink/7 disabled:opacity-30 disabled:hover:bg-transparent',
                  isSelected && `${chosen} border-transparent`,
                )}
              >
                {short}
              </button>
            );
          })}
        </div>
      )}

      <div className='mt-2 flex items-center gap-2 border-t border-divider pt-2'>
        <button
          type='button'
          disabled={outOfRange(today)}
          onClick={() => {
            if (mode === 'month') commit(toIsoMonth(today));
            else pickDay(today);
          }}
          className='rounded-md px-2 py-1 text-label text-accent hover:bg-accent/10 disabled:opacity-40'
        >
          {mode === 'month' ? 'This month' : 'Today'}
        </button>
        {value ? (
          <button
            type='button'
            onClick={() => {
              onChange?.(null);
              close();
              triggerRef.current?.focus();
            }}
            className='ml-auto rounded-md px-2 py-1 text-label text-ink/55 hover:bg-ink/7 hover:text-ink'
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      {name === undefined ? null : <input type='hidden' name={name} value={value ?? ''} />}

      <button
        ref={composeRefs(ref, triggerRef)}
        type='button'
        id={id}
        disabled={disabled}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        onClick={toggle}
        className={cn(
          'flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-divider',
          'bg-transparent px-2 py-1.5 text-left text-ui text-ink',
          'hover:border-ink/45 focus-visible:border-accent focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-accent',
          'disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-accent-700',
          open && 'border-accent',
        )}
      >
        <Calendar className='size-3.5 flex-none text-ink/55' aria-hidden='true' />
        <span className={cn('min-w-0 flex-1 truncate', !value && 'text-ink/40')}>{label}</span>
        <ChevronDown
          className={cn('size-3 flex-none text-ink/55', open && 'rotate-180')}
          aria-hidden='true'
        />
      </button>

      {!open ? null : portal ? createPortal(panel, document.body) : panel}
    </div>
  );
}
