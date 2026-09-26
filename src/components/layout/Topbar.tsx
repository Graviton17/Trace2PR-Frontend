import React from 'react';
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
