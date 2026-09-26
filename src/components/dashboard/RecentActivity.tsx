import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, CheckCircle, XCircle, GitPullRequest, GitMerge } from 'lucide-react';
import { cn } from '../../lib/utils';

const DUMMY_ACTIVITY = [
  { id: 1, type: 'pr_merged', desc: 'PR #102: Fix memory leak in auth-service', time: '12m ago' },
  { id: 2, type: 'pr_created', desc: 'PR #103: Handle null items in checkout', time: '45m ago' },
  { id: 3, type: 'tests_passed', desc: 'E2E tests passed for INC-491', time: '48m ago' },
  { id: 4, type: 'analysis_started', desc: 'Analysis started for Sentry issue T-442', time: '1h ago' },
  { id: 5, type: 'alert_received', desc: 'Critical alert from Datadog: high CPU', time: '1h 5m ago' },
  { id: 6, type: 'fix_failed', desc: 'Fix failed linting for INC-489, retrying', time: '2h ago' },
  { id: 7, type: 'pr_merged', desc: 'PR #101: Optimize DB queries for catalog', time: '3h ago' },
  { id: 8, type: 'alert_received', desc: 'Warning alert: Redis latency spike', time: '4h ago' },
];

const TYPE_CONFIG = {
  alert_received: { icon: Bell, color: 'text-[var(--cyan)]' },
  analysis_started: { icon: Search, color: 'text-[var(--acid)]' },
  tests_passed: { icon: CheckCircle, color: 'text-[var(--acid)]' },
  fix_failed: { icon: XCircle, color: 'text-[var(--danger)]' },
  pr_created: { icon: GitPullRequest, color: 'text-[var(--acid)]' },
  pr_merged: { icon: GitMerge, color: 'text-[var(--acid)]' },
};

export function RecentActivity() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--line-strong)] rounded-xl p-6 overflow-hidden">
      <h2 className="text-[var(--ink)] text-[16px] font-[600] mb-6" style={{ fontFamily: 'var(--sans)' }}>Recent Activity</h2>
      
      <div className="relative pl-3">
        <div className="absolute top-2 bottom-2 left-[19px] w-[1px] bg-[var(--line)]"></div>
        
        <div className="flex flex-col gap-5">
          {DUMMY_ACTIVITY.map((activity, idx) => {
            const config = TYPE_CONFIG[activity.type as keyof typeof TYPE_CONFIG];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex items-start gap-4 relative z-10 group"
              >
                <div className="bg-[var(--surface)] p-1 rounded-full shrink-0 mt-0.5">
                  <Icon className={cn('w-4 h-4', config.color)} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-1 gap-1">
                  <span className="text-[var(--ink)] text-[13px] group-hover:text-[var(--acid)] transition-colors" style={{ fontFamily: 'var(--sans)' }}>
                    {activity.desc}
                  </span>
                  <span className="text-[var(--muted)] text-[11px] whitespace-nowrap" style={{ fontFamily: 'var(--mono)' }}>
                    {activity.time}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
