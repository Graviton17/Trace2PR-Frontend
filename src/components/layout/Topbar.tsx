import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

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
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Extract base route name or default to Dashboard
  let title = 'Dashboard';
  const path = location.pathname;
  if (path.startsWith('/dashboard/incidents/')) {
    title = 'Incident Details';
  } else if (routeNames[path]) {
    title = routeNames[path];
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

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
        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-full hover:bg-white/5 flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--danger)] rounded-full border-2 border-[var(--page)]"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 w-9 h-9 rounded-full hover:bg-white/5 transition-colors"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--acid)] to-[#7eb53c] flex items-center justify-center text-[var(--page-deep)] font-bold font-[var(--sans)] text-sm">
              {getInitials(user?.user_metadata?.full_name, user?.email)}
            </div>
            <ChevronDown className={cn("w-4 h-4 text-[var(--muted)] transition-transform", profileOpen && "rotate-180")} />
          </button>

          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-lg overflow-hidden z-50"
            >
              <div className="p-3 border-b border-[var(--line)]">
                <p className="font-semibold text-[var(--ink)] font-[var(--sans)] text-sm truncate">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-[var(--muted)] text-xs font-[var(--mono)] truncate">
                  {user?.email}
                </p>
              </div>

              <nav className="py-1">
                <button className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-[var(--sans)] text-[var(--muted-strong)] hover:bg-white/5 hover:text-[var(--ink)] transition-colors",
                  location.pathname === '/dashboard/settings' && "bg-white/5 text-[var(--ink)]"
                )} onClick={() => { navigate('/dashboard/settings'); setProfileOpen(false); }}>
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-[var(--sans)] text-[var(--muted-strong)] hover:bg-white/5 hover:text-[var(--ink)] transition-colors",
                  location.pathname === '/dashboard/settings' && "bg-white/5 text-[var(--ink)]"
                )} onClick={() => { navigate('/dashboard/settings'); setProfileOpen(false); }}>
                  <User className="w-4 h-4" />
                  Profile
                </button>
              </nav>

              <div className="border-t border-[var(--line)] p-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-[var(--sans)] text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}