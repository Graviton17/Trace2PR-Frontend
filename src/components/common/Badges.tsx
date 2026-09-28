import { cn } from '../../lib/utils';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'text-[var(--danger)] border-[var(--danger)]/30 bg-[var(--danger)]/10',
  high: 'text-[#ff7a45] border-[#ff7a45]/30 bg-[#ff7a45]/10',
  medium: 'text-[#ffb84d] border-[#ffb84d]/30 bg-[#ffb84d]/10',
  low: 'text-[var(--cyan)] border-[var(--cyan)]/30 bg-[var(--cyan)]/10',
};

const NEUTRAL = 'text-[var(--muted-strong)] border-[var(--line)] bg-[var(--surface-raised)]';
const POSITIVE = 'text-[var(--acid)] border-[var(--acid)]/30 bg-[var(--acid)]/10';
const NEGATIVE = 'text-[var(--danger)] border-[var(--danger)]/30 bg-[var(--danger)]/10';

const STATUS_STYLES: Record<string, string> = {
  resolved: POSITIVE,
  merged: POSITIVE,
  completed: POSITIVE,
  success: POSITIVE,
  running: POSITIVE,
  connected: POSITIVE,
  failed: NEGATIVE,
  failure: NEGATIVE,
  escalated: NEGATIVE,
  cancelled: NEGATIVE,
  closed: NEGATIVE,
  dismissed: NEUTRAL,
};

const base = 'inline-block text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-[var(--sans)]';

export function SeverityBadge({ severity }: { severity: string }) {
  return <span className={cn(base, SEVERITY_STYLES[severity] ?? NEUTRAL)}>{severity}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn(base, STATUS_STYLES[status] ?? NEUTRAL)}>{status.replace(/_/g, ' ')}</span>;
}
