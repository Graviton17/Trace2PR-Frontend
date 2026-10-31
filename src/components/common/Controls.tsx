import { useState, type ReactNode } from 'react';
import { Check, Copy, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Segmented filter chips with optional counts. */
export function FilterTabs<T extends string>({ options, value, onChange, label, className }: {
  options: FilterOption<T>[]; value: T; onChange: (v: T) => void; label: string; className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn('flex flex-wrap gap-1', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
              active ? 'bg-white/10 text-ink' : 'text-muted hover:text-ink hover:bg-white/5',
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={cn('font-mono tabular-nums text-[11px]', active ? 'text-muted-strong' : 'text-muted/80')}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, className, label }: {
  value: string; onChange: (v: string) => void; placeholder: string; className?: string; label?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className="w-full h-8 rounded-lg border border-line bg-page-deep pl-8 pr-7 text-sm text-ink placeholder:text-muted/70 outline-none focus-visible:outline-none focus:border-acid/60 focus:ring-2 focus:ring-acid/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded text-muted hover:text-ink">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function CopyButton({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  });
  return (
    <button onClick={copy} aria-label={copied ? 'Copied' : label}
      className={cn('inline-flex items-center gap-1 h-7 px-2 rounded-md text-xs font-medium text-acid hover:bg-acid/10 shrink-0 transition-colors', className)}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

/** Monospace value with a copy button, e.g. webhook URLs and keys. */
export function CopyField({ value, className }: { value: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 rounded-lg border border-line bg-page-deep pl-3 pr-1 py-1', className)}>
      <code className="flex-1 min-w-0 text-xs font-mono text-ink break-all py-1">{value}</code>
      <CopyButton text={value} />
    </div>
  );
}

/** Key/value fact tile. */
export function Fact({ label, value, warn, mono = true }: { label: string; value: ReactNode; warn?: boolean; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className={cn('text-sm mt-0.5 truncate', mono && 'font-mono', warn ? 'text-danger' : 'text-ink')}
        title={typeof value === 'string' ? value : undefined}>
        {value}
      </dd>
    </div>
  );
}
