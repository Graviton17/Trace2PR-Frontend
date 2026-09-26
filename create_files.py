import os

base_dir = r"c:\VS Code\Trace2PR\Trace2PR-frontend"

os.makedirs(os.path.join(base_dir, "src/pages"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "src/components/layout"), exist_ok=True)

pages = {
    "DashboardHome": ("Dashboard Home", "LayoutDashboard"),
    "IncidentsPage": ("Incidents", "ShieldAlert"),
    "IncidentDetailPage": ("Incident Details", "ShieldAlert"),
    "AlertsPage": ("Alerts", "Bell"),
    "PRsPage": ("Pull Requests", "GitPullRequest"),
    "IntegrationsPage": ("Integrations", "Plug"),
    "KnowledgePage": ("Knowledge Base", "Brain"),
    "SandboxPage": ("Sandbox", "TerminalSquare"),
    "SettingsPage": ("Settings", "Settings")
}

stub_template = """import React from 'react';
import {{ LayoutDashboard, ShieldAlert, Bell, GitPullRequest, Plug, Brain, TerminalSquare, Settings }} from 'lucide-react';
import {{ cn }} from '../lib/utils';

export default function {component_name}() {{
  const Icon = {icon};
  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[600px]">
      <div className="p-4 rounded-full bg-[var(--surface-raised)] border border-[var(--line)] mb-6">
        <Icon className="w-8 h-8 text-[var(--acid)]" />
      </div>
      <h1 className="text-3xl font-semibold text-[var(--ink)] font-[var(--sans)] mb-2">
        {title}
      </h1>
      <p className="text-[var(--muted)] font-[var(--sans)] mb-6">
        Coming soon...
      </p>
      <div className="px-3 py-1 rounded-full bg-[var(--acid)]/10 border border-[var(--acid)]/20 text-[var(--acid)] text-sm font-medium font-[var(--mono)]">
        Under Construction
      </div>
    </div>
  );
}}
"""

for comp, (title, icon) in pages.items():
    with open(os.path.join(base_dir, f"src/pages/{comp}.tsx"), "w", encoding="utf-8") as f:
        f.write(stub_template.format(component_name=comp, title=title, icon=icon))

app_tsx = """import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import AlertsPage from './pages/AlertsPage';
import PRsPage from './pages/PRsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import KnowledgePage from './pages/KnowledgePage';
import SandboxPage from './pages/SandboxPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="incidents/:id" element={<IncidentDetailPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="prs" element={<PRsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="sandbox" element={<SandboxPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
"""

with open(os.path.join(base_dir, "src/App.tsx"), "w", encoding="utf-8") as f:
    f.write(app_tsx)

sidebar_tsx = """import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Bell, 
  GitPullRequest, 
  Plug, 
  Brain, 
  TerminalSquare, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Terminal
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
}

const navItems = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Incidents', path: '/dashboard/incidents', icon: ShieldAlert, badge: 3 },
  { name: 'Alerts', path: '/dashboard/alerts', icon: Bell },
  { name: 'Pull Requests', path: '/dashboard/prs', icon: GitPullRequest, badge: 2 },
  { name: 'Integrations', path: '/dashboard/integrations', icon: Plug },
  { name: 'Knowledge', path: '/dashboard/knowledge', icon: Brain },
  { name: 'Sandbox', path: '/dashboard/sandbox', icon: TerminalSquare },
];

export default function Sidebar({ isCollapsed, setIsCollapsed, isHovered, setIsHovered }: SidebarProps) {
  const location = useLocation();
  const expanded = !isCollapsed || isHovered;

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 240 : 72 }}
      className="fixed left-0 top-0 h-screen bg-[var(--surface)] border-r border-[var(--line)] flex flex-col z-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-14 flex items-center px-4 border-b border-[var(--line)] shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[var(--acid)]/10 flex items-center justify-center shrink-0">
          <Terminal className="w-5 h-5 text-[var(--acid)]" />
        </div>
        <motion.span 
          initial={false}
          animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
          className="ml-3 font-semibold text-[var(--ink)] font-[var(--sans)] whitespace-nowrap overflow-hidden"
        >
          Trace2PR
        </motion.span>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden px-2">
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center h-10 px-2.5 rounded-lg transition-colors relative group whitespace-nowrap shrink-0",
                active 
                  ? "bg-[var(--acid)]/10 text-[var(--acid)]" 
                  : "text-[var(--muted)] hover:text-[var(--muted-strong)] hover:bg-white/5"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--acid)] rounded-r-full" />
              )}
              <item.icon className={cn("w-5 h-5 shrink-0 ml-1.5", active ? "text-[var(--acid)]" : "text-[var(--muted)] group-hover:text-[var(--muted-strong)]")} />
              
              <motion.span
                initial={false}
                animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
                className="ml-3 font-medium font-[var(--sans)] text-sm flex-1 overflow-hidden"
              >
                {item.name}
              </motion.span>

              {item.badge && expanded && (
                <span className="ml-auto w-5 h-5 rounded-full bg-[var(--danger)]/20 text-[var(--danger)] text-xs font-bold flex items-center justify-center font-[var(--mono)] shrink-0">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="my-2 border-t border-[var(--line)] mx-2 shrink-0" />

        <NavLink
          to="/dashboard/settings"
          className={cn(
            "flex items-center h-10 px-2.5 rounded-lg transition-colors relative group whitespace-nowrap shrink-0",
            isActive('/dashboard/settings')
              ? "bg-[var(--acid)]/10 text-[var(--acid)]" 
              : "text-[var(--muted)] hover:text-[var(--muted-strong)] hover:bg-white/5"
          )}
        >
          {isActive('/dashboard/settings') && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--acid)] rounded-r-full" />
          )}
          <Settings className={cn("w-5 h-5 shrink-0 ml-1.5", isActive('/dashboard/settings') ? "text-[var(--acid)]" : "text-[var(--muted)] group-hover:text-[var(--muted-strong)]")} />
          <motion.span
            initial={false}
            animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
            className="ml-3 font-medium font-[var(--sans)] text-sm overflow-hidden"
          >
            Settings
          </motion.span>
        </NavLink>
      </nav>

      <div className="p-3 border-t border-[var(--line)] shrink-0 flex justify-center">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
}
"""

with open(os.path.join(base_dir, "src/components/layout/Sidebar.tsx"), "w", encoding="utf-8") as f:
    f.write(sidebar_tsx)

topbar_tsx = """import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';

const routeNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/incidents': 'Incidents',
  '/dashboard/alerts': 'Alerts',
  '/dashboard/prs': 'Pull Requests',
  '/dashboard/integrations': 'Integrations',
  '/dashboard/knowledge': 'Knowledge Base',
  '/dashboard/sandbox': 'Sandbox',
  '/dashboard/settings': 'Settings',
};

export default function Topbar() {
  const location = useLocation();
  
  // Extract base route name or default to Dashboard
  let title = 'Dashboard';
  const path = location.pathname;
  if (path.startsWith('/dashboard/incidents/')) {
    title = 'Incident Details';
  } else if (routeNames[path]) {
    title = routeNames[path];
  }

  return (
    <header className="h-14 border-b border-[var(--line)] bg-[var(--page)] flex items-center justify-between px-6 z-10 w-full shrink-0">
      <h1 className="text-xl font-semibold text-[var(--ink)] font-[var(--sans)]">
        {title}
      </h1>

      <div className="flex-1 flex justify-center max-w-md mx-6">
        <button className="flex items-center w-full h-9 px-3 rounded-full bg-[var(--surface-raised)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--muted-strong)] hover:border-[var(--line-strong)] transition-colors font-[var(--sans)] text-sm group">
          <Search className="w-4 h-4 mr-2 text-[var(--muted)] group-hover:text-[var(--muted-strong)]" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 font-[var(--mono)] text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[var(--muted)]">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative w-9 h-9 rounded-full hover:bg-white/5 flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--danger)] rounded-full border-2 border-[var(--page)]"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--acid)] to-[#7eb53c] flex items-center justify-center text-[var(--page-deep)] font-bold font-[var(--sans)] text-sm cursor-pointer hover:opacity-90 transition-opacity">
          U
        </div>
      </div>
    </header>
  );
}
"""

with open(os.path.join(base_dir, "src/components/layout/Topbar.tsx"), "w", encoding="utf-8") as f:
    f.write(topbar_tsx)

layout_tsx = """import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  const sidebarWidth = !isCollapsed || isHovered ? 240 : 72;

  return (
    <div className="min-h-screen bg-[var(--page)] flex font-[var(--sans)] overflow-hidden">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        isHovered={isHovered}
        setIsHovered={setIsHovered}
      />
      
      <motion.div 
        layout
        initial={false}
        animate={{ paddingLeft: sidebarWidth }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="flex-1 flex flex-col min-w-0 h-screen"
      >
        <Topbar />
        
        <main className="flex-1 overflow-auto p-6 bg-[var(--page-deep)] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}
"""

with open(os.path.join(base_dir, "src/components/layout/DashboardLayout.tsx"), "w", encoding="utf-8") as f:
    f.write(layout_tsx)

print("Files generated successfully.")
