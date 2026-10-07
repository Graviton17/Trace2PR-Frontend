import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Clock, GitPullRequest } from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { PipelineCard } from '../components/dashboard/PipelineCard';
import { ActiveOperations } from '../components/dashboard/ActiveOperations';
import { AlertStream } from '../components/dashboard/AlertStream';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { SystemHealth } from '../components/dashboard/SystemHealth';
import { useAlerts, useIncidents, useIntegrations, usePRStats, usePRs, useSystemHealth } from '../hooks';
import { buildActivityFeed } from '../lib/activity';
import { buildServiceHealth } from '../lib/health';
import { formatMinutes } from '../lib/time';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ACTIVE_STATUSES = ['open', 'analyzing', 'fixing'];

export default function DashboardHome() {
  const { data: incidents = [] } = useIncidents();
  const { data: alertsPage, isLoading: alertsLoading } = useAlerts({ per_page: 5 });
  const { data: prs = [] } = usePRs();
  const { data: prStats } = usePRStats();
  const { data: health } = useSystemHealth();
  const { data: integrations } = useIntegrations();

  const alerts = alertsPage?.items ?? [];

  const activeIncidents = useMemo(
    () => incidents.filter((i) => ACTIVE_STATUSES.includes(i.status)),
    [incidents]
  );
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;
  const resolutionRate = incidents.length ? Math.round((resolvedCount / incidents.length) * 100) : 0;
  const pendingPRs = prs.filter((p) => p.status === 'open' || p.status === 'changes_requested').length;

  const activities = useMemo(() => buildActivityFeed(alerts, incidents, prs), [alerts, incidents, prs]);
  const services = useMemo(() => buildServiceHealth(health, integrations), [health, integrations]);

  return (
    <div className="space-y-6">
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <MetricCard
            icon={Activity}
            label="Active Incidents"
            value={String(activeIncidents.length)}
            subtitle="Currently open, analyzing or fixing"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            icon={CheckCircle2}
            label="Resolution Rate"
            value={incidents.length ? `${resolutionRate}%` : '—'}
            subtitle="Incidents resolved of all incidents"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            icon={Clock}
            label="Avg PR Merge Time"
            value={formatMinutes(prStats?.average_merge_time_minutes ?? 0)}
            subtitle="From PR opened to merged"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            icon={GitPullRequest}
            label="Pending PRs"
            value={String(pendingPRs)}
            subtitle="Awaiting human review"
          />
        </motion.div>
      </motion.section>

      <PipelineCard />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <ActiveOperations incidents={activeIncidents} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AlertStream alerts={alerts} isLoading={alertsLoading} />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} initial="hidden" animate="show">
        <RecentActivity activities={activities} />
      </motion.div>

      <motion.div variants={itemVariants} initial="hidden" animate="show">
        <SystemHealth services={services} />
      </motion.div>
    </div>
  );
}
