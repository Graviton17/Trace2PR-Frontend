import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bell, CornerDownLeft, GitPullRequest, LogOut, Plus, Search, ShieldAlert, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useIncidents, usePRs } from '../../hooks';
import { NAV, SETTINGS_SECTIONS, settingsPath } from '../../lib/nav';
import { timeAgo } from '../../lib/time';
import { cn } from '../../lib/utils';
import { SeverityDot, StatusBadge } from '../common/Badges';
import { Dialog } from '../ui/dialog';
import { Kbd } from '../ui/input';

interface Command {
  id: string;
  group: 'Go to' | 'Incidents' | 'Pull requests' | 'Actions';
  label: string;
  hint?: string;
  keywords?: string;
  icon?: LucideIcon;
  leading?: ReactNode;
  trailing?: ReactNode;
  run: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const PaletteContext = createContext<{ open: () => void } | null>(null);

// eslint-disable-next-line react-refresh/only-export-components -- hook lives with its provider
export function useCommandPalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error('useCommandPalette must be used inside CommandPaletteProvider');
  return ctx;
}

/** Owns the palette's open state and the ⌘K / Ctrl+K shortcut. */
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const open = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      {isOpen && <CommandPalette onClose={() => setOpen(false)} />}
    </PaletteContext.Provider>
  );
}

function matches(command: Command, words: string[]) {
  const hay = `${command.label} ${command.hint ?? ''} ${command.keywords ?? ''}`.toLowerCase();
  return words.every((w) => hay.includes(w));
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: incidents = [] } = useIncidents();
  const { data: prs = [] } = usePRs();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const go = useCallback((path: string) => { onClose(); navigate(path); }, [navigate, onClose]);

  const commands = useMemo<Command[]>(() => [
    ...NAV.map((n) => ({ id: `nav-${n.id}`, group: 'Go to' as const, label: n.name, icon: n.icon, run: () => go(n.path) })),
    { id: 'nav-alerts', group: 'Go to', label: 'Alerts', icon: Bell, keywords: 'monitoring events', run: () => go('/dashboard/alerts') },
    ...SETTINGS_SECTIONS.map((s) => ({
      id: `set-${s.id}`, group: 'Go to' as const, label: `Settings: ${s.label}`, hint: s.description, icon: s.icon,
      run: () => go(settingsPath(s.id)),
    })),
    ...incidents.map((i) => ({
      id: `inc-${i.id}`, group: 'Incidents' as const, label: i.title,
      hint: `${i.service || 'unknown service'} · ${timeAgo(i.updated_at)}`,
      keywords: `${i.id} ${i.status} ${i.severity} ${i.repository ?? ''}`,
      leading: <SeverityDot severity={i.severity} />, trailing: <StatusBadge status={i.status} />,
      run: () => go(`/dashboard/incidents/${i.id}`),
    })),
    ...prs.map((p) => ({
      id: `pr-${p.id}`, group: 'Pull requests' as const, label: p.title,
      hint: [p.repository, p.number ? `#${p.number}` : null].filter(Boolean).join(' '),
      keywords: `${p.status} ${p.branch ?? ''}`, icon: GitPullRequest, trailing: <StatusBadge status={p.status} />,
      run: () => go(`/dashboard/prs/${p.id}`),
    })),
    { id: 'act-connect', group: 'Actions', label: 'Connect a monitoring tool', icon: Plus, keywords: 'integration sentry datadog cloudwatch', run: () => go(settingsPath('integrations')) },
    { id: 'act-repo', group: 'Actions', label: 'Map a repository', icon: Plus, keywords: 'github service', run: () => go(settingsPath('repositories')) },
    { id: 'act-sdk', group: 'Actions', label: 'Create an SDK key', icon: Plus, run: () => go(settingsPath('sdk')) },
    { id: 'act-signout', group: 'Actions', label: 'Sign out', icon: LogOut, run: () => { onClose(); signOut().then(() => navigate('/login')); } },
  ], [incidents, prs, go, onClose, signOut, navigate]);

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      // Without a query: pages, the most recent incidents and PRs, actions.
      return [
        ...commands.filter((c) => c.group === 'Go to' && c.id.startsWith('nav-')),
        ...commands.filter((c) => c.group === 'Incidents').slice(0, 5),
        ...commands.filter((c) => c.group === 'Pull requests').slice(0, 3),
        ...commands.filter((c) => c.group === 'Actions'),
      ];
    }
    const groups: Command['group'][] = ['Incidents', 'Pull requests', 'Go to', 'Actions'];
    return groups.flatMap((g) => commands.filter((c) => c.group === g && matches(c, words)).slice(0, 8));
  }, [commands, query]);

  const clamped = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${clamped}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [clamped]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((clamped + 1) % Math.max(results.length, 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((clamped - 1 + results.length) % Math.max(results.length, 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); results[clamped]?.run(); }
  };

  let lastGroup: string | null = null;

  return (
    <Dialog open onClose={onClose} bare position="top" className="max-w-xl overflow-hidden" labelledBy="palette-label">
      <div className="flex items-center gap-2.5 px-4 border-b border-line">
        <Search className="w-4 h-4 text-muted shrink-0" aria-hidden />
        <label id="palette-label" htmlFor="palette-input" className="sr-only">Search or jump to</label>
        <input
          id="palette-input"
          data-autofocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={onKeyDown}
          placeholder="Search incidents, pull requests, pages…"
          autoComplete="off"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={results[clamped] ? `cmd-${results[clamped].id}` : undefined}
          className="flex-1 h-12 bg-transparent text-sm text-ink placeholder:text-muted/80 outline-none focus-visible:outline-none"
        />
        <Kbd>Esc</Kbd>
      </div>

      <div ref={listRef} id="palette-list" role="listbox" className="max-h-[min(420px,60vh)] overflow-y-auto scroll-thin p-1.5">
        {results.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-muted">No matches for “{query}”.</p>
        )}
        {results.map((c, index) => {
          const header = c.group !== lastGroup ? c.group : null;
          lastGroup = c.group;
          const Icon = c.icon ?? (c.group === 'Incidents' ? ShieldAlert : ArrowRight);
          const selected = index === clamped;
          return (
            <div key={c.id}>
              {header && <p className="px-2.5 pt-2.5 pb-1 text-[11px] font-medium text-muted">{header}</p>}
              <div
                id={`cmd-${c.id}`}
                role="option"
                aria-selected={selected}
                data-index={index}
                onMouseMove={() => setActive(index)}
                onClick={c.run}
                className={cn('flex items-center gap-3 px-2.5 h-10 rounded-lg cursor-pointer', selected ? 'bg-white/[0.07]' : '')}
              >
                <span className="w-4 flex justify-center shrink-0 text-muted">{c.leading ?? <Icon className="w-4 h-4" aria-hidden />}</span>
                <span className="flex-1 min-w-0 flex items-baseline gap-2">
                  <span className="truncate text-sm text-ink">{c.label}</span>
                  {c.hint && <span className="truncate text-xs text-muted">{c.hint}</span>}
                </span>
                {c.trailing}
                {selected && <CornerDownLeft className="w-3.5 h-3.5 text-muted shrink-0" aria-hidden />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 px-4 h-9 border-t border-line text-[11px] text-muted">
        <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> move</span>
        <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
        <span className="ml-auto flex items-center gap-1"><Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd><Kbd>K</Kbd> toggle</span>
      </div>
    </Dialog>
  );
}
