import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-[var(--muted)] font-[var(--sans)]">
      <Loader2 className="w-5 h-5 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : 'Something went wrong';
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-[var(--danger)] font-[var(--sans)]">
      <AlertCircle className="w-6 h-6" />
      <p>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded-lg border border-[var(--line)] text-[var(--ink)] text-sm hover:border-[var(--acid)] transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-[var(--muted)] font-[var(--sans)]">
      <Inbox className="w-8 h-8" />
      <p className="text-[var(--ink)] font-semibold">{title}</p>
      {hint && <p className="text-sm">{hint}</p>}
    </div>
  );
}
