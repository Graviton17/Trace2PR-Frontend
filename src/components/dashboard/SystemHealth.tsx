import React from 'react';

const SERVICES = [
  { name: 'Supabase', status: 'connected' },
  { name: 'E2B', status: 'connected' },
  { name: 'Datadog', status: 'connected' },
  { name: 'Sentry', status: 'error' },
  { name: 'GitHub', status: 'connected' },
  { name: 'Redis', status: 'unconfigured' },
];

export function SystemHealth() {
  return (
    <div className="bg-[var(--page-deep)] border-t border-[var(--line)] py-3 px-6 overflow-x-auto">
      <div className="flex items-center gap-6 text-[11px] uppercase tracking-wider min-w-max" style={{ fontFamily: 'var(--mono)' }}>
        {SERVICES.map((svc) => (
          <div key={svc.name} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              svc.status === 'connected' ? 'bg-[var(--acid)] shadow-[0_0_8px_var(--acid)]' :
              svc.status === 'error' ? 'bg-[var(--danger)] animate-pulse' :
              'bg-[var(--muted)] opacity-50'
            }`}></div>
            <span className={
              svc.status === 'connected' ? 'text-[var(--muted-strong)]' :
              svc.status === 'error' ? 'text-[var(--danger)]' :
              'text-[var(--muted)]'
            }>
              {svc.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
