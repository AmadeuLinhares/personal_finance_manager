import {
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useId,
} from 'react';

import { cn } from '../lib/cn';

const CONTROL =
  'w-full min-h-9 px-2.2 py-1.3 text-ui text-ink caret-accent bg-transparent ' +
  'border border-divider rounded-md hover:border-ink/45 focus-visible:border-accent ' +
  'focus-visible:outline-offset-0 aria-invalid:border-accent-700';

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...rest} />;
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(CONTROL, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, 'min-h-[90px] resize-y', className)} {...rest} />;
}

export interface FieldProps {
  label: string;
  /** Quiet guidance under the control. */
  hint?: ReactNode;
  /**
   * The API's own vocabulary reads best here — VALIDATION_ERROR,
   * CURRENCY_MISMATCH, UNSUPPORTED_OPERATION. Set, it also marks the control
   * aria-invalid.
   */
  error?: ReactNode;
  className?: string;
  children: (props: { id: string; 'aria-invalid'?: true }) => ReactNode;
}

/**
 * Label, control and message. Takes a render function so the control keeps its
 * own type and props while the field owns the id wiring.
 */
export function Field({ label, hint, error, className, children }: FieldProps) {
  const id = useId();
  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={id} className='mb-[5px] block text-label text-ink/70'>
        {label}
      </label>
      {children(error ? { id, 'aria-invalid': true } : { id })}
      {error ? (
        <span className='mt-[5px] flex items-start gap-1.5 text-label text-accent-800'>
          <AlertCircle />
          {error}
        </span>
      ) : hint ? (
        <span className='mt-1 text-meta text-ink/55'>{hint}</span>
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
