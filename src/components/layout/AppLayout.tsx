import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, AlertCircle, ShieldAlert, GitPullRequest, Settings, TerminalSquare } from 'lucide-react'
import { Badge } from '../ui/badge'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: AlertCircle, label: 'Alerts', active: false },
  { icon: ShieldAlert, label: 'Incidents', active: false },
  { icon: GitPullRequest, label: 'Pull Requests', active: false },
  { icon: Settings, label: 'Integrations', active: false },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[var(--bg-base)] overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col z-10"
      >
        <div className="h-16 flex items-center px-6 border-b border-[var(--border-subtle)]">
          <TerminalSquare className="w-6 h-6 mr-2 text-[var(--accent-primary)]" />
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-purple-400">
            Trace2PR
          </span>
        </div>
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <motion.a
              key={item.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active 
                  ? 'bg-[var(--accent-bg)] text-[var(--accent-primary)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </motion.a>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-base)]">
        {/* Topbar */}
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Overview</h1>
          <div className="flex items-center gap-4">
            <Badge variant="success" className="animate-pulse">Datadog: Connected</Badge>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-purple-400 text-white flex items-center justify-center font-bold shadow-sm cursor-pointer"
            >
              U
            </motion.div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
