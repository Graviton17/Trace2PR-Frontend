import { motion } from 'framer-motion'
import { Activity, CheckCircle2, Clock, GitPullRequest } from 'lucide-react'
import { MetricCard } from '../components/dashboard/MetricCard'
import { ActiveOperations } from '../components/dashboard/ActiveOperations'
import { AlertStream } from '../components/dashboard/AlertStream'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { SystemHealth } from '../components/dashboard/SystemHealth'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
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
            value="2"
            subtitle="Currently analyzing or fixing"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            icon={CheckCircle2}
            label="Resolution Rate"
            value="84%"
            subtitle="Alerts resolved without humans"
            trend="up"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            icon={Clock}
            label="Avg MTTR"
            value="23m"
            subtitle="Down 8m from last week"
            trend="down"
            invertTrendColor={true} // down is good for MTTR, so we use acid color
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            icon={GitPullRequest}
            label="Pending PRs"
            value="3"
            subtitle="Awaiting human review"
          />
        </motion.div>
      </motion.section>

      {/* Main Content: Active Operations + Alert Stream */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <ActiveOperations />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AlertStream />
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} initial="hidden" animate="show">
        <RecentActivity />
      </motion.div>

      {/* System Health */}
      <motion.div variants={itemVariants} initial="hidden" animate="show">
        <SystemHealth />
      </motion.div>
    </div>
  )
}
