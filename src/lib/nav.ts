import {
  Bell, BookOpen, FolderGit2, GitPullRequest, Inbox, KeyRound, Plug, Settings, ShieldAlert,
  TerminalSquare, User, UserCog, type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: 'inbox' | 'incidents' | 'prs' | 'knowledge' | 'settings';
  name: string;
  path: string;
  icon: LucideIcon;
  /** Path prefixes that also light this item up. */
  match: string[];
  exact?: boolean;
}

export const NAV: NavItem[] = [
  { id: 'inbox', name: 'Inbox', path: '/dashboard', icon: Inbox, match: ['/dashboard'], exact: true },
  { id: 'incidents', name: 'Incidents', path: '/dashboard/incidents', icon: ShieldAlert, match: ['/dashboard/incidents', '/dashboard/alerts'] },
  { id: 'prs', name: 'Pull requests', path: '/dashboard/prs', icon: GitPullRequest, match: ['/dashboard/prs'] },
  { id: 'knowledge', name: 'Knowledge', path: '/dashboard/knowledge', icon: BookOpen, match: ['/dashboard/knowledge'] },
];

export const SETTINGS_NAV: NavItem = {
  id: 'settings', name: 'Settings', path: '/dashboard/settings', icon: Settings, match: ['/dashboard/settings'],
};

export type SettingsSectionId =
  | 'integrations' | 'repositories' | 'sdk' | 'sandbox' | 'profile' | 'notifications' | 'account';

export interface SettingsSection {
  id: SettingsSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
  group: 'Workspace' | 'Account';
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: 'integrations', label: 'Integrations', description: 'GitHub and monitoring tools', icon: Plug, group: 'Workspace' },
  { id: 'repositories', label: 'Repositories', description: 'Which repo each service lives in', icon: FolderGit2, group: 'Workspace' },
  { id: 'sdk', label: 'SDK keys', description: 'Report errors without Sentry or Datadog', icon: KeyRound, group: 'Workspace' },
  { id: 'sandbox', label: 'Sandbox', description: 'Isolated environments for fixes', icon: TerminalSquare, group: 'Workspace' },
  { id: 'profile', label: 'Profile', description: 'Your name and sign-in', icon: User, group: 'Account' },
  { id: 'notifications', label: 'Notifications', description: 'Email and chat alerts', icon: Bell, group: 'Account' },
  { id: 'account', label: 'Account', description: 'Sign out or delete your account', icon: UserCog, group: 'Account' },
];

export const settingsPath = (id: SettingsSectionId) => `/dashboard/settings/${id}`;

export function isNavActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.path || pathname === `${item.path}/`;
  return item.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

/** Title shown in the top bar for the current route. */
export function routeTitle(pathname: string): string {
  if (pathname.startsWith('/dashboard/settings')) {
    const id = pathname.split('/')[3];
    const section = SETTINGS_SECTIONS.find((s) => s.id === id);
    return section ? `Settings · ${section.label}` : 'Settings';
  }
  if (pathname.startsWith('/dashboard/alerts')) return 'Alerts';
  const item = NAV.find((n) => isNavActive(n, pathname));
  return item?.name ?? 'Dashboard';
}
