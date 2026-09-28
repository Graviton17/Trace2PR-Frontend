import { motion } from 'framer-motion';
import { Bell, CheckCircle, GitMerge, GitPullRequest, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { timeAgo } from '../../lib/time';
import type { ActivityItem, ActivityType } from '../../lib/activity';

const TYPE_CONFIG: Record<ActivityType, { icon: typeof Bell; color: string }> = {
  alert_received: { icon: Bell, color: 'text-[var(--cyan)]' },
  incident_opened: { icon: Search, color: 'text-[var(--acid)]' },
  incident_resolved: { icon: CheckCircle, color: 'text-[var(--acid)]' },
  pr_created: { icon: GitPullRequest, color: 'text-[var(--acid)]' },
  pr_merged: { icon: GitMerge, color: 'text-[var(--acid)]' },
};

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--line-strong)] rounded-xl p-6 overflow-hidden">
      <h2 className="text-[var(--ink)] text-[16px] font-[600] mb-6" style={{ fontFamily: 'var(--sans)' }}>
        Recent Activity
      </h2>

      {activities.length === 0 ? (
        <p className="text-[var(--muted)] text-[13px]" style={{ fontFamily: 'var(--sans)' }}>
          No activity yet.
        </p>
      ) : (
        <div className="relative pl-3">
          <div className="absolute top-2 bottom-2 left-[19px] w-[1px] bg-[var(--line)]"></div>
          <div className="flex flex-col gap-5">
            {activities.map((activity, idx) => {
              const config = TYPE_CONFIG[activity.type];
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
                    <span
                      className="text-[var(--ink)] text-[13px] group-hover:text-[var(--acid)] transition-colors"
                      style={{ fontFamily: 'var(--sans)' }}
                    >
                      {activity.desc}
                    </span>
                    <span className="text-[var(--muted)] text-[11px] whitespace-nowrap" style={{ fontFamily: 'var(--mono)' }}>
                      {timeAgo(activity.timestamp)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
