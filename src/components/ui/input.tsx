import * as React from 'react';
import { cn } from '../../lib/utils';

const control =
  'w-full rounded-lg border border-line bg-page-deep px-3 text-sm text-ink placeholder:text-muted/70 outline-none focus-visible:outline-none transition-colors focus:border-acid/60 focus:ring-2 focus:ring-acid/15 disabled:opacity-60';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }>(
  ({ className, mono, ...props }, ref) => (
    <input ref={ref} className={cn(control, 'h-9', mono && 'font-mono', className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(control, 'py-2 min-h-[72px] resize-y', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(control, 'h-9 pr-8 appearance-none bg-[length:16px] bg-[right_8px_center] bg-no-repeat', className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}
      {...props} />
  ),
);
Select.displayName = 'Select';

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}

/** A labelled form control with optional helper text and an inline error. */
export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-muted-strong mb-1.5">{label}</label>
      {children}
      {error ? (
        <p className="text-xs text-danger mt-1.5" role="alert">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}

/** Accessible on/off switch backed by a real checkbox. */
export function Switch({ checked, onChange, label, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean;
}) {
  return (
    <label className={cn('relative inline-flex items-center shrink-0', disabled ? 'opacity-50' : 'cursor-pointer')}>
      <input type="checkbox" className="sr-only peer" checked={checked} disabled={disabled}
        onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span className="w-9 h-5 rounded-full bg-white/12 peer-checked:bg-acid transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-acid/50" />
      <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4 peer-checked:bg-on-acid" />
    </label>
  );
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn('inline-flex items-center justify-center min-w-5 h-5 px-1 rounded border border-line-strong bg-white/5 font-mono text-[10px] text-muted', className)}>
      {children}
    </kbd>
  );
}
