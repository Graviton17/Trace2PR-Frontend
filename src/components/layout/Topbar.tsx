import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search, Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { routeTitle, settingsPath } from '../../lib/nav';
import { cn } from '../../lib/utils';
import { useCommandPalette } from '../command/CommandPalette';
import { Kbd } from '../ui/input';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

function initials(name?: string | null, email?: string | null) {
  if (name) return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (email ?? 'U').slice(0, 2).toUpperCase();
}

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { pathname } = useLocation();
  const palette = useCommandPalette();

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-3 sm:px-5 border-b border-line bg-page/80 backdrop-blur supports-[backdrop-filter]:bg-page/70 sticky top-0 z-20">
      <button onClick={onOpenMenu} className="lg:hidden p-2 -ml-1 rounded-lg text-muted hover:text-ink hover:bg-white/5" aria-label="Open navigation">
        <Menu className="w-5 h-5" />
      </button>
      <h1 className="text-sm font-semibold text-ink truncate min-w-0">{routeTitle(pathname)}</h1>

      <button
        onClick={palette.open}
        className="ml-auto sm:mx-auto flex items-center gap-2 h-9 w-9 sm:w-full sm:max-w-md justify-center sm:justify-start sm:px-3 rounded-lg border border-line bg-surface text-sm text-muted hover:text-muted-strong hover:border-line-strong transition-colors"
        aria-label="Search or jump to (Command K)"
      >
        <Search className="w-4 h-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline flex-1 text-left truncate">Search or jump to…</span>
        <span className="hidden sm:flex gap-0.5"><Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd><Kbd>K</Kbd></span>
      </button>

      <UserMenu />
    </header>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const name = user?.user_metadata?.full_name as string | undefined;
  const item = 'w-full flex items-center gap-2.5 px-2.5 h-9 rounded-md text-sm text-muted-strong hover:bg-white/5 hover:text-ink';

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="w-9 h-9 rounded-full flex items-center justify-center hover:ring-2 hover:ring-white/10 transition-shadow"
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-acid to-[#6fae2c] flex items-center justify-center text-on-acid font-bold text-xs">
          {initials(name, user?.email)}
        </span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-line-strong bg-raised p-1 shadow-[0_16px_48px_rgba(0,0,0,.5)] animate-fade-in z-30">
          <div className="px-2.5 py-2 border-b border-line mb-1">
            <p className="text-sm font-medium text-ink truncate">{name || 'Signed in'}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
          <Link role="menuitem" to={settingsPath('profile')} onClick={() => setOpen(false)} className={item}>
            <User className="w-4 h-4" /> Profile
          </Link>
          <Link role="menuitem" to={settingsPath('integrations')} onClick={() => setOpen(false)} className={item}>
            <Settings className="w-4 h-4" /> Settings
          </Link>
          <button role="menuitem" onClick={() => signOut().then(() => navigate('/login'))} className={cn(item, 'text-danger hover:text-danger hover:bg-danger/10')}>
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
