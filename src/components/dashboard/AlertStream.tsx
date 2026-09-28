import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { timeAgo } from '../../lib/time';
import type { AlertDetail, AlertSource, Severity } from '../../api';

const SOURCE_COLORS: Record<AlertSource, string> = {
  datadog: 'text-[#c4a1ff] bg-[#c4a1ff]/10 border-[#c4a1ff]/30',
  sentry: 'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/30',
  cloudwatch: 'text-[var(--cyan)] bg-[var(--cyan)]/10 border-[var(--cyan)]/30',
  pagerduty: 'text-[var(--acid)] bg-[var(--acid)]/10 border-[var(--acid)]/30',
  grafana: 'text-[#ffb84d] bg-[#ffb84d]/10 border-[#ffb84d]/30',
  generic: 'text-[var(--muted-strong)] bg-[var(--surface-raised)] border-[var(--line)]',
};

const SEVERITY_DOT: Record<Severity, string> = {
  critical: 'bg-[var(--danger)]',
  high: 'bg-[#ff7a45]',
  medium: 'bg-[#ffb84d]',
  low: 'bg-[var(--cyan)]',
};

interface AlertStreamProps {
  alerts: AlertDetail[];
  isLoading?: boolean;
}

export function AlertStream({ alerts, isLoading }: AlertStreamProps) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--line-strong)] rounded-xl flex flex-col h-full max-h-[600px] overflow-hidden">
      <div className="p-4 border-b border-[var(--line)] flex justify-between items-center shrink-0">
        <h2 className="text-[var(--ink)] text-[14px] font-[600]" style={{ fontFamily: 'var(--sans)' }}>
          Real-Time Alerts
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--acid)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--acid)]"></span>
          </div>
          <span className="text-[var(--acid)] text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--mono)' }}>
            Live
          </span>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-2">
        {isLoading && (
          <p className="text-[var(--muted)] text-[12px] p-2" style={{ fontFamily: 'var(--sans)' }}>
            Loading alerts…
          </p>
        )}
        {!isLoading && alerts.length === 0 && (
          <p className="text-[var(--muted)] text-[12px] p-2" style={{ fontFamily: 'var(--sans)' }}>
            No alerts yet.
          </p>
        )}
        {alerts.map((alert, idx) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg p-3 hover:border-[color-mix(in_srgb,var(--acid)_30%,transparent)] transition-colors group flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <span
                className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider',
                  SOURCE_COLORS[alert.source] ?? SOURCE_COLORS.generic
                )}
                style={{ fontFamily: 'var(--sans)' }}
              >
                {alert.source}
              </span>
              <span className="text-[var(--muted)] text-[10px]" style={{ fontFamily: 'var(--mono)' }}>
                {timeAgo(alert.created_at)}
              </span>
            </div>
            <div className="flex gap-2 items-start mt-1">
              <div className="pt-1">
                <div className={cn('w-1.5 h-1.5 rounded-full', SEVERITY_DOT[alert.severity])}></div>
              </div>
              <p
                className="text-[var(--ink)] text-[12px] font-[600] line-clamp-2 leading-snug group-hover:text-[var(--acid)] transition-colors"
                style={{ fontFamily: 'var(--sans)' }}
              >
                {alert.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-3 border-t border-[var(--line)] shrink-0 flex justify-center">
        <Link
          to="/dashboard/alerts"
          className="text-[var(--muted)] hover:text-[var(--acid)] text-[12px] flex items-center gap-1 transition-colors"
          style={{ fontFamily: 'var(--sans)' }}
        >
          View all alerts <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
