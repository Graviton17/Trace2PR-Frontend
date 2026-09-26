import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const DUMMY_ALERTS = [
  { id: 1, source: 'Datadog', title: 'High memory usage in worker pool', time: '1m ago', severity: 'warning', sourceColor: 'text-[#c4a1ff] bg-[#c4a1ff]/10 border-[#c4a1ff]/30' },
  { id: 2, source: 'Sentry', title: 'TypeError: undefined is not an object (evaluating \'e.items\')', time: '3m ago', severity: 'critical', sourceColor: 'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/30' },
  { id: 3, source: 'CloudWatch', title: 'API Gateway 5xx Error Rate > 1%', time: '12m ago', severity: 'critical', sourceColor: 'text-[var(--cyan)] bg-[var(--cyan)]/10 border-[var(--cyan)]/30' },
  { id: 4, source: 'PagerDuty', title: 'Payment Gateway Timeout', time: '28m ago', severity: 'critical', sourceColor: 'text-[var(--acid)] bg-[var(--acid)]/10 border-[var(--acid)]/30' },
  { id: 5, source: 'Datadog', title: 'Database connection pool near capacity', time: '1h ago', severity: 'warning', sourceColor: 'text-[#c4a1ff] bg-[#c4a1ff]/10 border-[#c4a1ff]/30' },
];

export function AlertStream() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--line-strong)] rounded-xl flex flex-col h-full max-h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--line)] flex justify-between items-center shrink-0">
        <h2 className="text-[var(--ink)] text-[14px] font-[600]" style={{ fontFamily: 'var(--sans)' }}>Real-Time Alerts</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--acid)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--acid)]"></span>
          </div>
          <span className="text-[var(--acid)] text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--mono)' }}>Live</span>
        </div>
      </div>

      {/* List */}
      <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-2">
        {DUMMY_ALERTS.map((alert, idx) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg p-3 hover:border-[color-mix(in_srgb,var(--acid)_30%,transparent)] transition-colors cursor-pointer group flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <span className={cn('text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider', alert.sourceColor)} style={{ fontFamily: 'var(--sans)' }}>
                {alert.source}
              </span>
              <span className="text-[var(--muted)] text-[10px]" style={{ fontFamily: 'var(--mono)' }}>
                {alert.time}
              </span>
            </div>
            
            <div className="flex gap-2 items-start mt-1">
              <div className="pt-1">
                {alert.severity === 'critical' && <div className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]"></div>}
                {alert.severity === 'warning' && <div className="w-1.5 h-1.5 rounded-full bg-[#ffb84d]"></div>}
                {alert.severity === 'info' && <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]"></div>}
              </div>
              <p className="text-[var(--ink)] text-[12px] font-[600] line-clamp-2 leading-snug group-hover:text-[var(--acid)] transition-colors" style={{ fontFamily: 'var(--sans)' }}>
                {alert.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--line)] shrink-0 flex justify-center">
        <button className="text-[var(--muted)] hover:text-[var(--acid)] text-[12px] flex items-center gap-1 transition-colors" style={{ fontFamily: 'var(--sans)' }}>
          View all alerts <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
