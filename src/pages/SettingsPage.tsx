import { useState } from 'react';
import { Navigate, NavLink, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Bell, Globe, LogOut, Mail, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { IntegrationsPanel } from '../components/settings/IntegrationsPanel';
import { RepoMappingsPanel } from '../components/settings/RepoMappingsPanel';
import { SandboxPanel } from '../components/settings/SandboxPanel';
import { SdkKeysPanel } from '../components/settings/SdkKeysPanel';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { errorMessage, useFeedback } from '../components/ui/feedback';
import { Field, Input, Switch } from '../components/ui/input';
import { useDeleteAccount, useSettings, useUpdateProfile, useUpdateSettings } from '../hooks';
import { SETTINGS_SECTIONS, settingsPath, type SettingsSectionId } from '../lib/nav';
import { cn } from '../lib/utils';

export default function SettingsPage() {
  const { section } = useParams<{ section: string }>();
  const current = SETTINGS_SECTIONS.find((s) => s.id === section);
  if (!current) return <Navigate to={settingsPath('integrations')} replace />;

  const groups = ['Workspace', 'Account'] as const;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-10">
        <nav aria-label="Settings sections" className="flex md:flex-col gap-1 overflow-x-auto scroll-thin md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0">
          {groups.map((g) => (
            <div key={g} className="contents md:block md:space-y-0.5 md:mb-5">
              <p className="hidden md:block px-2.5 mb-1.5 text-[11px] font-medium text-muted">{g}</p>
              {SETTINGS_SECTIONS.filter((s) => s.group === g).map((s) => (
                <NavLink
                  key={s.id}
                  to={settingsPath(s.id)}
                  className={({ isActive }) => cn(
                    'flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-sm whitespace-nowrap transition-colors shrink-0',
                    isActive ? 'bg-white/[0.07] text-ink font-medium' : 'text-muted hover:text-ink hover:bg-white/[0.04]',
                  )}
                >
                  <s.icon className="w-4 h-4" aria-hidden /> {s.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <section className="min-w-0" aria-labelledby="settings-title">
          <header className="mb-5">
            <h1 id="settings-title" className="text-xl font-semibold tracking-tight text-ink">{current.label}</h1>
            <p className="text-sm text-muted mt-1">{current.description}</p>
          </header>
          <SectionBody id={current.id} />
        </section>
      </div>
    </div>
  );
}

function SectionBody({ id }: { id: SettingsSectionId }) {
  switch (id) {
    case 'integrations': return <IntegrationsPanel />;
    case 'repositories': return <RepoMappingsPanel />;
    case 'sdk': return <SdkKeysPanel />;
    case 'sandbox': return <SandboxPanel />;
    case 'profile': return <ProfilePanel />;
    case 'notifications': return <NotificationsPanel />;
    case 'account': return <AccountPanel />;
  }
}

function ProfilePanel() {
  const { user } = useAuth();
  const { data: settings } = useSettings();
  const updateProfile = useUpdateProfile();
  const { toast } = useFeedback();
  // Draft overrides the server value only once the user edits it.
  const [draftName, setDraftName] = useState<string | null>(null);
  const fullName = draftName ?? settings?.full_name ?? (user?.user_metadata?.full_name as string | undefined) ?? '';
  const providers: string[] = user?.app_metadata?.providers ?? [];

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ full_name: fullName }, {
      onSuccess: () => { setDraftName(null); toast('Profile saved.'); },
      onError: (err) => toast(errorMessage(err, 'Failed to save profile'), 'error'),
    });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Card className="p-4 flex items-center gap-4">
        <span className="w-14 h-14 rounded-full bg-gradient-to-br from-acid to-[#6fae2c] flex items-center justify-center text-on-acid font-bold text-lg shrink-0">
          {(fullName || user?.email || 'U').slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="text-base font-semibold text-ink truncate">{fullName || 'No name set'}</p>
          <p className="text-sm text-muted truncate">{user?.email}</p>
          <p className="text-xs text-muted mt-0.5">
            Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'recently'}
            {providers.length > 0 && ` · signs in with ${providers.join(', ')}`}
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <form onSubmit={save} className="space-y-4">
          <Field label="Full name" htmlFor="fullName">
            <Input id="fullName" value={fullName} onChange={(e) => setDraftName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />
          </Field>
          <Field label="Email" htmlFor="email" hint="Comes from your sign-in provider.">
            <Input id="email" type="email" value={user?.email ?? ''} disabled />
          </Field>
          <Button type="submit" variant="primary" loading={updateProfile.isPending} disabled={draftName === null}>Save changes</Button>
        </form>
      </Card>
    </div>
  );
}

const NOTIFICATION_ITEMS = [
  { key: 'email_alerts', label: 'Email alerts', desc: 'An email for critical incidents', icon: Mail },
  { key: 'email_weekly_digest', label: 'Weekly digest', desc: 'A weekly summary of incidents and PRs', icon: Globe },
  { key: 'slack_alerts', label: 'Slack alerts', desc: 'Post alerts to your Slack workspace (needs the Slack integration)', icon: Shield },
  { key: 'pagerduty_alerts', label: 'PagerDuty escalation', desc: 'Escalate critical incidents (needs the PagerDuty integration)', icon: Bell },
];

function NotificationsPanel() {
  const { data: settings } = useSettings();
  const update = useUpdateSettings();
  const { toast } = useFeedback();
  const notifications: Record<string, boolean> = {
    email_alerts: true, email_weekly_digest: true, slack_alerts: false, pagerduty_alerts: false,
    ...settings?.notifications,
  };

  // Each switch saves immediately: no separate Save button to forget.
  const set = (key: string, value: boolean) => update.mutate({ notifications: { ...notifications, [key]: value } }, {
    onSuccess: () => toast('Notification preferences saved.'),
    onError: (e) => toast(errorMessage(e, 'Failed to save'), 'error'),
  });

  return (
    <Card className="max-w-2xl divide-y divide-line">
      {NOTIFICATION_ITEMS.map((item) => (
        <div key={item.key} className="flex items-center gap-4 px-4 py-3.5">
          <item.icon className="w-4 h-4 text-muted shrink-0" aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink">{item.label}</p>
            <p className="text-xs text-muted">{item.desc}</p>
          </div>
          <Switch checked={Boolean(notifications[item.key])} onChange={(v) => set(item.key, v)} label={item.label} disabled={update.isPending} />
        </div>
      ))}
    </Card>
  );
}

function AccountPanel() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const deleteAccount = useDeleteAccount();
  const { confirm, toast } = useFeedback();

  const onSignOut = () => signOut().then(() => navigate('/login'));

  const onDelete = async () => {
    const ok = await confirm({
      title: 'Delete your account?',
      description: 'This permanently deletes your account and all of its data: integrations, incidents, pull request records and knowledge base. It cannot be undone.',
      confirmLabel: 'Delete my account',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteAccount.mutateAsync();
      await signOut();
      navigate('/login');
    } catch (e) {
      toast(errorMessage(e, 'Failed to delete account'), 'error');
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Card className="p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <p className="text-sm font-medium text-ink">Sign out</p>
          <p className="text-xs text-muted">Sign out of Trace2PR on this device.</p>
        </div>
        <Button onClick={onSignOut}><LogOut className="w-4 h-4" /> Sign out</Button>
      </Card>
      <Card className="p-4 border-danger/30 bg-danger/[0.03] flex flex-wrap items-center gap-4">
        <AlertTriangle className="w-5 h-5 text-danger shrink-0" aria-hidden />
        <div className="flex-1 min-w-[200px]">
          <p className="text-sm font-medium text-danger">Delete account</p>
          <p className="text-xs text-muted">Permanently delete your account and everything in it.</p>
        </div>
        <Button variant="danger" onClick={onDelete} loading={deleteAccount.isPending}>
          {!deleteAccount.isPending && <Trash2 className="w-4 h-4" />} Delete account
        </Button>
      </Card>
    </div>
  );
}
