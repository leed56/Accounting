'use client';

import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function FormInput({
  label,
  error,
  required,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className={className}>
      <label className="label">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      <input className={cn('input-field', error && 'border-danger')} {...props} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function CurrencyInput({
  label,
  error,
  required,
  value,
  onChange,
  className,
}: {
  label: string;
  error?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <FormInput
      label={label}
      error={error}
      required={required}
      className={className}
      type="text"
      inputMode="decimal"
      placeholder="Rs. 0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function SelectField({
  label,
  error,
  required,
  options,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string; key?: string }[];
}) {
  return (
    <div className={className}>
      <label className="label">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      <select className={cn('input-field', error && 'border-danger')} {...props}>
        {options.map((o, i) => (
          <option key={o.key ?? `${o.value}-${i}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function TextAreaField({
  label,
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <textarea
        className={cn('input-field min-h-[100px] resize-y', error && 'border-danger')}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
