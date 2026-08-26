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

const BOX =
  'flex min-h-9 w-full items-center gap-2 rounded-md border border-divider bg-transparent px-2 ' +
  'hover:border-ink/45 has-[[aria-invalid]]:border-accent-700 ' +
  'has-[:focus-visible]:border-accent has-[:focus-visible]:outline-2 ' +
  'has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ' +
  'has-[:disabled]:opacity-45';

const PLAIN =
  'w-full min-h-9 px-2 py-1.5 text-ui text-ink caret-accent bg-transparent ' +
  'border border-divider rounded-md hover:border-ink/45 focus-visible:border-accent ' +
  'aria-invalid:border-accent-700 disabled:opacity-45';

const INNER =
  'h-full w-full min-w-0 bg-transparent py-1.5 text-ui text-ink caret-accent outline-none ' +
  'placeholder:text-ink/65 disabled:cursor-not-allowed';

export interface InputProps extends Omit<ComponentPropsWithRef<'input'>, 'prefix'> {
  mask?: MaskName | CharacterMask;
  prefix?: ReactNode;
  suffix?: ReactNode;
  containerClassName?: string;
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

  const maskRef = useMask(characterMask ?? { mask: '', replacement: {} });

  const isControlled = rest.value !== undefined;
  const [display, setDisplay] = useState(() =>
    transform ? transform.coerce(rest.defaultValue ?? rest.value) : '',
  );

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
        <span className='shrink-0 text-ui text-ink/70 select-none' aria-hidden='true'>
          {prefix}
        </span>
      )}
      {control}
      {suffix == null ? null : (
        <span className='shrink-0 text-ui text-ink/70 select-none' aria-hidden='true'>
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

export interface FieldControlProps {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

export interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: (props: FieldControlProps) => ReactNode;
}

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
        <span id={messageId} className='mt-1 text-meta text-ink/70'>
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
