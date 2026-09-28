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
