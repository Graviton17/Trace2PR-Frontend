import { useMemo } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, Waypoints } from 'lucide-react';
import { useInbox, useIntegrations, useSystemHealth } from '../../hooks';
import { buildServiceHealth } from '../../lib/health';
import { NAV, SETTINGS_NAV, isNavActive, settingsPath, type NavItem } from '../../lib/nav';
import { cn } from '../../lib/utils';
import { CountBadge } from '../common/Badges';

interface SidebarProps {
  collapsed: boolean;
  onToggle?: () => void;
  /** Called after navigating (closes the mobile drawer). */
  onNavigate?: () => void;
}

export function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const { pathname } = useLocation();
  const inbox = useInbox();
  const counts: Partial<Record<NavItem['id'], { count: number; tone: 'attention' | 'neutral' }>> = {
    inbox: { count: inbox.items.length, tone: 'attention' },
    incidents: { count: inbox.activeCount, tone: 'neutral' },
    prs: { count: inbox.reviewCount, tone: 'attention' },
  };

  return (
    <div className="flex flex-col h-full bg-surface border-r border-line">
      <div className={cn('h-14 flex items-center shrink-0 border-b border-line', collapsed ? 'justify-center' : 'px-4')}>
        <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 rounded-lg" aria-label="Trace2PR inbox">
          <span className="w-8 h-8 rounded-lg border border-acid/30 bg-acid/10 flex items-center justify-center text-acid shrink-0">
            <Waypoints className="w-4 h-4" strokeWidth={2.25} />
          </span>
          {!collapsed && (
            <span className="text-[15px] font-bold tracking-tight">Trace<span className="text-acid">2</span>PR</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto scroll-thin px-2 py-3 space-y-0.5" aria-label="Main">
        {NAV.map((item) => (
          <SidebarLink key={item.id} item={item} active={isNavActive(item, pathname)} collapsed={collapsed}
            badge={counts[item.id]} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-line space-y-0.5 shrink-0">
        <SidebarLink item={SETTINGS_NAV} active={isNavActive(SETTINGS_NAV, pathname)} collapsed={collapsed} onNavigate={onNavigate} />
        <HealthLink collapsed={collapsed} onNavigate={onNavigate} />
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn('w-full flex items-center gap-3 h-9 rounded-lg text-sm text-muted hover:text-ink hover:bg-white/5 transition-colors', collapsed ? 'justify-center' : 'px-2.5')}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : undefined}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <><PanelLeftClose className="w-4 h-4" /> Collapse</>}
          </button>
        )}
      </div>
    </div>
  );
}

function SidebarLink({ item, active, collapsed, badge, onNavigate }: {
  item: NavItem; active: boolean; collapsed: boolean;
  badge?: { count: number; tone: 'attention' | 'neutral' }; onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.exact}
      onClick={onNavigate}
      title={collapsed ? item.name : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-3 h-9 rounded-lg text-sm font-medium transition-colors',
        collapsed ? 'justify-center' : 'px-2.5',
        active ? 'bg-white/[0.07] text-ink' : 'text-muted hover:text-ink hover:bg-white/[0.04]',
      )}
    >
      {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-acid" aria-hidden />}
      <Icon className={cn('w-4 h-4 shrink-0', active && 'text-acid')} aria-hidden />
      {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
      {badge && badge.count > 0 && (
        collapsed
          ? <span className={cn('absolute top-1.5 right-2 w-2 h-2 rounded-full', badge.tone === 'attention' ? 'bg-acid' : 'bg-muted')} aria-label={`${badge.count} items`} />
          : <CountBadge count={badge.count} tone={badge.tone} />
      )}
    </NavLink>
  );
}

/** One-line system status; details live in Settings → Integrations. */
function HealthLink({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { data: health } = useSystemHealth();
  const { data: integrations } = useIntegrations();
  const services = useMemo(() => buildServiceHealth(health, integrations), [health, integrations]);
  if (services.length === 0) return null;
  const broken = services.filter((s) => s.status === 'error');
  const label = broken.length ? `${broken.length} service${broken.length > 1 ? 's' : ''} down` : 'All systems normal';
  const detail = services.map((s) => `${s.name}: ${s.status === 'connected' ? 'ok' : s.status}`).join('\n');

  return (
    <Link
      to={settingsPath('integrations')}
      onClick={onNavigate}
      title={`${label}\n\n${detail}`}
      className={cn('flex items-center gap-3 h-9 rounded-lg text-xs text-muted hover:text-ink hover:bg-white/[0.04] transition-colors', collapsed ? 'justify-center' : 'px-2.5')}
    >
      <span className={cn('relative flex w-2 h-2 mx-1 shrink-0')}>
        {broken.length > 0 && <span className="absolute inset-0 rounded-full bg-danger animate-ping opacity-60" />}
        <span className={cn('relative w-2 h-2 rounded-full', broken.length ? 'bg-danger' : 'bg-acid')} />
      </span>
      {!collapsed && <span className={cn('truncate', broken.length > 0 && 'text-danger')}>{label}</span>}
    </Link>
  );
}
