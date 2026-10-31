import { AlertCircle, Inbox, Loader2, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-2 py-16 text-sm text-muted', className)} role="status">
      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export function ErrorState({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  const message = error instanceof Error ? error.message : 'Something went wrong';
  return (
    <div className={cn('flex flex-col items-center gap-3 py-14 px-6 text-center', className)} role="alert">
      <span className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-danger" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">Couldn't load this</p>
        <p className="text-sm text-muted mt-1">{message}</p>
      </div>
      {onRetry && <Button size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function EmptyState({ title, hint, icon: Icon = Inbox, action, className }: {
  title: string; hint?: ReactNode; icon?: LucideIcon; action?: ReactNode; className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 py-14 px-6 text-center', className)}>
      <span className="w-10 h-10 rounded-full bg-white/5 border border-line flex items-center justify-center">
        <Icon className="w-5 h-5 text-muted" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        {hint && <p className="text-sm text-muted mt-1 max-w-sm">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-white/[0.06]', className)} aria-hidden />;
}

/** Placeholder rows for list panes while data loads (no layout shift). */
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="px-4 py-3.5 space-y-2">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
