import { cn } from '../../lib/utils';

const base =
  'inline-flex items-center gap-1.5 h-5 px-1.5 rounded-md border text-[11px] font-medium leading-none whitespace-nowrap capitalize';

const SEVERITY: Record<string, { cls: string; dot: string }> = {
  critical: { cls: 'text-danger border-danger/30 bg-danger/10', dot: 'bg-danger' },
  high: { cls: 'text-orange border-orange/30 bg-orange/10', dot: 'bg-orange' },
  medium: { cls: 'text-warning border-warning/30 bg-warning/10', dot: 'bg-warning' },
  low: { cls: 'text-cyan border-cyan/30 bg-cyan/10', dot: 'bg-cyan' },
};

const NEUTRAL = 'text-muted-strong border-line-strong bg-white/[0.03]';
const POSITIVE = 'text-acid border-acid/30 bg-acid/10';
const NEGATIVE = 'text-danger border-danger/30 bg-danger/10';
const ACTIVE = 'text-cyan border-cyan/30 bg-cyan/10';
const ATTENTION = 'text-warning border-warning/30 bg-warning/10';

const STATUS: Record<string, string> = {
  resolved: POSITIVE, merged: POSITIVE, completed: POSITIVE, success: POSITIVE, connected: POSITIVE,
  'ci success': POSITIVE, running: POSITIVE, pr_created: POSITIVE,
  failed: NEGATIVE, failure: NEGATIVE, escalated: NEGATIVE, cancelled: NEGATIVE, closed: NEGATIVE,
  error: NEGATIVE, 'ci failure': NEGATIVE,
  analyzing: ACTIVE, fixing: ACTIVE, processing: ACTIVE, queued: ACTIVE, testing: ACTIVE, cloning: ACTIVE,
  sandbox_creating: ACTIVE, pr_creating: ACTIVE, 'ci pending': ACTIVE, pending: ACTIVE,
  draft: ATTENTION, new: ATTENTION, open: ATTENTION, changes_requested: ATTENTION,
};

/** Human labels where the raw status reads awkwardly. */
const STATUS_LABEL: Record<string, string> = {
  pr_created: 'PR open',
  draft: 'needs review',
  changes_requested: 'changes requested',
  sandbox_creating: 'starting',
  pr_creating: 'opening PR',
};

export function SeverityBadge({ severity, className }: { severity: string; className?: string }) {
  const s = SEVERITY[severity];
  return (
    <span className={cn(base, s?.cls ?? NEUTRAL, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', s?.dot ?? 'bg-muted')} aria-hidden />
      {severity}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn(base, STATUS[status] ?? NEUTRAL, className)}>
      {STATUS_LABEL[status] ?? status.replace(/_/g, ' ')}
    </span>
  );
}

/** A colored dot for severity, for dense lists. */
export function SeverityDot({ severity, className }: { severity: string; className?: string }) {
  return (
    <span
      role="img"
      className={cn('inline-block w-2 h-2 rounded-full shrink-0', SEVERITY[severity]?.dot ?? 'bg-muted', className)}
      title={`${severity} severity`}
      aria-label={`${severity} severity`}
    />
  );
}

export function CountBadge({ count, tone = 'neutral', className }: { count: number; tone?: 'neutral' | 'attention' | 'danger'; className?: string }) {
  if (!count) return null;
  return (
    <span className={cn(
      'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold font-mono tabular-nums',
      tone === 'attention' ? 'bg-acid text-on-acid' : tone === 'danger' ? 'bg-danger/15 text-danger' : 'bg-white/8 text-muted-strong',
      className,
    )}>
      {count > 99 ? '99+' : count}
    </span>
  );
}
