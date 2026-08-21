import { useMask } from '@react-input/mask';
import {
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactNode,
  useId,
  useState,
} from 'react';

import { cn } from '../lib/cn';
import { composeRefs } from '../lib/composeRefs';
import {
  type CharacterMask,
  type MaskName,
  isValueTransformMask,
  maskDefinitions,
  valueTransformMasks,
} from '../lib/masks';

/** The bordered box. On Input it wraps the control so adornments can sit inside it. */
const BOX =
  'flex min-h-9 w-full items-center gap-2 rounded-md border border-divider bg-transparent px-2.2 ' +
  'hover:border-ink/45 has-[[aria-invalid]]:border-accent-700 ' +
  'has-[:focus-visible]:border-accent has-[:focus-visible]:outline-2 ' +
  'has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ' +
  'has-[:disabled]:opacity-45';

/** A control that is its own box — select and textarea take no adornments. */
const PLAIN =
  'w-full min-h-9 px-2.2 py-1.3 text-ui text-ink caret-accent bg-transparent ' +
  'border border-divider rounded-md hover:border-ink/45 focus-visible:border-accent ' +
  'aria-invalid:border-accent-700 disabled:opacity-45';

/** The control inside a BOX: no border, no ring — the box shows both. */
const INNER =
  'h-full w-full min-w-0 bg-transparent py-1.3 text-ui text-ink caret-accent outline-none ' +
  'placeholder:text-ink/40 disabled:cursor-not-allowed';

export interface InputProps extends Omit<ComponentPropsWithRef<'input'>, 'prefix'> {
  /**
   * A named mask, or a raw @react-input/mask config for a one-off.
   *
   * `'money'` is a value-transform mask: the field shows `45.99` and the form
   * receives `4599` — integer minor units, the number the API stores.
   */
  mask?: MaskName | CharacterMask;
  /** Leading adornment inside the box, e.g. `$`. */
  prefix?: ReactNode;
  /** Trailing adornment inside the box, e.g. `CAD` or an icon. */
  suffix?: ReactNode;
  /** Classes for the bordered box. `className` goes to the input itself. */
  containerClassName?: string;
  /**
   * Fires with the parsed value of a value-transform mask — integer minor units
   * for `money`. This is the framework-agnostic hook: pair it with
   * react-hook-form's `Controller`, or plain `useState`.
   */
  onValueChange?: (value: number) => void;
}

export function Input({
  mask,
  prefix,
  suffix,
  className,
  containerClassName,
  onValueChange,
  ref,
  ...rest
}: InputProps) {
  const transform = isValueTransformMask(mask) ? valueTransformMasks[mask] : null;
  const characterMask =
    mask && !transform
      ? typeof mask === 'string'
        ? maskDefinitions[mask as keyof typeof maskDefinitions]
        : mask
      : undefined;

  // Called unconditionally: hooks cannot be skipped, and an empty mask is inert.
  const maskRef = useMask(characterMask ?? { mask: '', replacement: {} });

  const isControlled = rest.value !== undefined;
  const [display, setDisplay] = useState(() =>
    transform ? transform.coerce(rest.defaultValue ?? rest.value) : '',
  );

  /*
   * The native event is passed through untouched. Reformatting the display does
   * not change what the digits parse to, so whether react-hook-form reads the
   * event or re-reads the DOM node on blur, `setValueAs` sees the same digits and
   * lands the same integer. That is why there is no synthetic event here, and no
   * assumption about how RHF decides where to read from.
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (transform) {
      const parsed = transform.parse(event.target.value);
      if (!isControlled) setDisplay(transform.format(parsed));
      onValueChange?.(parsed);
    }
    rest.onChange?.(event);
  };

  const { value: _value, defaultValue: _defaultValue, onChange: _onChange, ...passthrough } = rest;

  const bindings = transform
    ? { value: isControlled ? transform.coerce(rest.value) : display }
    : { value: rest.value, defaultValue: rest.defaultValue };

  const control = (
    <input
      ref={composeRefs(ref, characterMask ? maskRef : undefined)}
      inputMode={transform ? 'decimal' : passthrough.inputMode}
      className={cn(
        (prefix ?? suffix) ? INNER : PLAIN,
        transform && 'text-right tabular-nums',
        className,
      )}
      onChange={handleChange}
      {...passthrough}
      {...bindings}
    />
  );

  if (prefix == null && suffix == null) return control;

  return (
    <div className={cn(BOX, containerClassName)}>
      {prefix == null ? null : (
        <span className='shrink-0 text-ui text-ink/55 select-none' aria-hidden='true'>
          {prefix}
        </span>
      )}
      {control}
      {suffix == null ? null : (
        <span className='shrink-0 text-ui text-ink/55 select-none' aria-hidden='true'>
          {suffix}
        </span>
      )}
    </div>
  );
}

export function Select({ className, ...rest }: ComponentPropsWithRef<'select'>) {
  return <select className={cn(PLAIN, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentPropsWithRef<'textarea'>) {
  return <textarea className={cn(PLAIN, 'min-h-[90px] resize-y', className)} {...rest} />;
}

/** What Field hands its child, ready to spread onto a control. */
export interface FieldControlProps {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

export interface FieldProps {
  label: string;
  /** Quiet guidance under the control. Hidden while an error is showing. */
  hint?: ReactNode;
  /**
   * The API's own vocabulary reads best here — VALIDATION_ERROR,
   * CURRENCY_MISMATCH, UNSUPPORTED_OPERATION. Pass `errors.x?.message` straight
   * through. Setting it marks the control aria-invalid.
   */
  error?: ReactNode;
  className?: string;
  children: (props: FieldControlProps) => ReactNode;
}

/**
 * Label, control and message.
 *
 * Takes a render function so the control keeps its own props while the field owns
 * the id and aria wiring. Nothing it passes down collides with what
 * react-hook-form's `register()` returns, so the two spread in either order:
 *
 * ```tsx
 * <Field label="Amount ($)" error={errors.amount?.message}>
 *   {(field) => <Input mask="money" prefix="$" {...field} {...register('amount')} />}
 * </Field>
 * ```
 */
export function Field({ label, hint, error, className, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const hasError = error !== undefined && error !== null && error !== false && error !== '';

  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={id} className='mb-[5px] block text-label text-ink/70'>
        {label}
      </label>
      {children({
        id,
        ...(hasError ? { 'aria-invalid': true as const } : {}),
        ...(hasError || hint ? { 'aria-describedby': messageId } : {}),
      })}
      {hasError ? (
        <span
          id={messageId}
          className='mt-[5px] flex items-start gap-1.5 text-label text-accent-800'
        >
          <AlertCircle />
          {error}
        </span>
      ) : hint ? (
        <span id={messageId} className='mt-1 text-meta text-ink/55'>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function AlertCircle() {
  return (
    <svg
      width='13'
      height='13'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      className='mt-[2px] shrink-0'
      aria-hidden='true'
    >
      <circle cx='12' cy='12' r='10' />
      <line x1='12' y1='8' x2='12' y2='12' />
      <line x1='12' y1='16' x2='12.01' y2='16' />
    </svg>
  );
}
