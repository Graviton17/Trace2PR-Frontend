import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

/** Incidents | Alerts switch at the top of the incidents workspace. */
export function WorkspaceTabs({ active, counts }: { active: 'incidents' | 'alerts'; counts?: { incidents?: number; alerts?: number } }) {
  const tabs = [
    { id: 'incidents' as const, label: 'Incidents', to: '/dashboard/incidents', count: counts?.incidents },
    { id: 'alerts' as const, label: 'Alerts', to: '/dashboard/alerts', count: counts?.alerts },
  ];
  return (
    <nav className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-page-deep border border-line" aria-label="Incidents workspace">
      {tabs.map((t) => (
        <Link
          key={t.id}
          to={t.to}
          aria-current={active === t.id ? 'page' : undefined}
          className={cn(
            'flex items-center justify-center gap-1.5 h-7 rounded-md text-xs font-semibold transition-colors',
            active === t.id ? 'bg-raised text-ink shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="font-mono text-[11px] text-muted">{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
