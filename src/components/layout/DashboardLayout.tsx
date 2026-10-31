import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { CommandPaletteProvider } from '../command/CommandPalette';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const COLLAPSE_KEY = 'trace2pr.sidebar.collapsed';

function readCollapsed() {
  try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
}

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const toggle = () => setCollapsed((c) => {
    try { localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1'); } catch { /* storage unavailable */ }
    return !c;
  });

  // Close the drawer with Esc.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <CommandPaletteProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-acid focus:text-on-acid">
        Skip to content
      </a>
      <div className="h-dvh flex bg-page-deep text-ink">
        <aside className={cn('hidden lg:block shrink-0 transition-[width] duration-200', collapsed ? 'w-[60px]' : 'w-[224px]')}>
          <Sidebar collapsed={collapsed} onToggle={toggle} />
        </aside>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={() => setMobileOpen(false)} aria-hidden />
            <aside className="absolute inset-y-0 left-0 w-[260px] max-w-[85vw] animate-fade-in" aria-label="Navigation">
              <Sidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar onOpenMenu={() => setMobileOpen(true)} />
          <main id="main" className="flex-1 min-h-0 overflow-y-auto scroll-thin">
            {/* Keyed so each page fades in; no exit animation, so navigation is instant. */}
            <div key={pathname.split('/').slice(0, 3).join('/')} className="h-full animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
