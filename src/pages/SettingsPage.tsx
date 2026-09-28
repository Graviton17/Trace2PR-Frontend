import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, GitBranch, Shield, 
  Loader2, CheckCircle2, AlertCircle, Bell, 
  Globe, Palette, Trash2, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { ApiError } from '../api';
import { useDeleteAccount, useSettings, useUpdateProfile, useUpdateSettings } from '../hooks';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations' | 'notifications' | 'appearance' | 'danger'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'error'|'success', text: string} | null>(null);
  
  // Profile form state
  // Draft values override server values only once the user edits them.
  const [draftFullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState(user?.email || '');
  
  // Notification preferences
  const [draftNotifications, setNotifications] = useState<Record<string, boolean> | null>(null);
  
  // Appearance
  const [draftTheme, setTheme] = useState<'system' | 'light' | 'dark' | null>(null);
  
  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data: serverSettings } = useSettings();
  const updateProfile = useUpdateProfile();
  const updateSettings = useUpdateSettings();
  const deleteAccount = useDeleteAccount();

  const fullName = draftFullName ?? serverSettings?.full_name ?? user?.user_metadata?.full_name ?? '';
  const theme = draftTheme ?? serverSettings?.theme ?? 'system';
  const notifications: Record<string, boolean> = {
    email_alerts: true,
    email_weekly_digest: true,
    slack_alerts: false,
    pagerduty_alerts: false,
    ...serverSettings?.notifications,
    ...draftNotifications,
  };

  const errorText = (err: unknown, fallback: string) =>
    err instanceof ApiError || err instanceof Error ? err.message : fallback;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'integrations', label: 'Integrations', icon: GitBranch },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await updateProfile.mutateAsync({ full_name: fullName });
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err, 'Failed to save profile') });
    } finally {
      setLoading(false);
    }
  };

  const persistSettings = async (
    data: { theme?: string; notifications?: Record<string, boolean> },
    successText: string
  ) => {
    setMessage(null);
    try {
      await updateSettings.mutateAsync(data);
      setMessage({ type: 'success', text: successText });
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err, 'Failed to save settings') });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setMessage({ type: 'error', text: 'Click again to confirm account deletion' });
      return;
    }
    setLoading(true);
    try {
      await deleteAccount.mutateAsync();
      await signOut();
      navigate('/login');
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err, 'Failed to delete account') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-2 font-[var(--sans)]">Settings</h1>
        <p className="text-[var(--muted-strong)] font-[var(--sans)]">
          Manage your account, integrations, and preferences.
        </p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-lg mb-6 flex items-start gap-3 border text-sm font-[var(--sans)]",
            message.type === 'success' ? "bg-[var(--acid)]/10 border-[var(--acid)]/30 text-[var(--acid)]" : "bg-[var(--danger)]/10 border-[var(--danger)]/30 text-[var(--danger)]"
          )}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {message.text}
        </motion.div>
      )}

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-[var(--line)] bg-[var(--surface-raised)]">
          <nav className="flex overflow-x-auto px-4" aria-label="Settings sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setMessage(null); setDeleteConfirm(false); }}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold font-[var(--sans)] transition-colors border-b-2 -mb-px",
                    isActive 
                      ? "text-[var(--acid)] border-[var(--acid)]" 
                      : "text-[var(--muted)] hover:text-[var(--muted-strong)] border-transparent"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center gap-4 p-4 bg-[var(--surface-raised)] rounded-xl">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--acid)] to-[#7eb53c] flex items-center justify-center text-[var(--page-deep)] font-bold font-[var(--sans)] text-2xl">
                  {(user?.user_metadata?.full_name || user?.email || 'U').slice(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--ink)] font-[var(--sans)]">
                    {user?.user_metadata?.full_name || 'No name set'}
                  </h3>
                  <p className="text-[var(--muted)] text-sm font-[var(--mono)]">{user?.email}</p>
                  <p className="text-[var(--muted)] text-xs font-[var(--mono)] mt-1">
                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'recently'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[var(--ink)] font-semibold font-[var(--sans)]">Profile Information</h4>
                
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-[var(--muted-strong)] uppercase tracking-wider font-[var(--mono)] mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[var(--page-deep)] border border-[var(--line)] focus:border-[var(--acid)] rounded-lg px-4 py-3 text-[var(--ink)] font-[var(--sans)] text-sm outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-[var(--muted-strong)] uppercase tracking-wider font-[var(--mono)] mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                      className="flex-1 bg-[var(--page-deep)] border border-[var(--line)] rounded-lg px-4 py-3 text-[var(--ink)] font-[var(--sans)] text-sm outline-none"
                    />
                    <span className="px-3 py-1 rounded-lg bg-[var(--acid)]/10 text-[var(--acid)] text-xs font-bold font-[var(--mono)]">
                      Verified
                    </span>
                  </div>
                  <p className="text-[var(--muted)] text-xs font-[var(--sans)] mt-1">Email changes require re-verification</p>
                </div>

                <div className="pt-4 border-t border-[var(--line)]">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--acid)] text-[#091006] hover:bg-[#d1ff99] transition-colors font-bold text-sm font-[var(--sans)] disabled:opacity-50"
                  >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    <CheckCircle2 className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Auth Provider Info */}
              <div className="pt-6 border-t border-[var(--line)]">
                <h4 className="text-[var(--ink)] font-semibold font-[var(--sans)] mb-3">Connected Accounts</h4>
                <div className="flex items-center gap-3 p-3 bg-[var(--surface-raised)] rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#24292e] to-[#2f363d] flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--ink)] font-[var(--sans)]">GitHub</p>
                    <p className="text-[var(--muted)] text-sm font-[var(--sans)]">
                      {user?.app_metadata?.providers?.includes('github') ? 'Connected via OAuth' : 'Not connected'}
                    </p>
                  </div>
                  {user?.app_metadata?.providers?.includes('github') && (
                    <span className="px-2 py-1 rounded text-[var(--acid)] text-xs font-bold font-[var(--mono)] bg-[var(--acid)]/10">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[var(--ink)] font-semibold font-[var(--sans)]">Connected Integrations</h4>
                <button
                  onClick={() => navigate('/dashboard/integrations')}
                  className="px-4 py-2 rounded-lg border border-[var(--line)] text-[var(--muted-strong)] hover:bg-white/5 hover:text-[var(--ink)] font-semibold text-sm font-[var(--sans)] transition-colors"
                >
                  Manage Integrations
                </button>
              </div>
              <p className="text-[var(--muted)] text-sm font-[var(--sans)] mb-4">
                View and manage your connected monitoring tools and services in the Integrations page.
              </p>
              <div className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl p-6 text-center">
                <GitBranch className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                <p className="text-[var(--muted)] font-[var(--sans)]">Go to <span className="text-[var(--acid)] font-medium">Integrations</span> to connect Datadog, Sentry, GitHub, and more.</p>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl space-y-6">
              <h4 className="text-[var(--ink)] font-semibold font-[var(--sans)]">Notification Preferences</h4>
              
              <div className="space-y-4">
                {[
                  { key: 'email_alerts', label: 'Email Alerts', desc: 'Receive email notifications for critical incidents', icon: Mail },
                  { key: 'email_weekly_digest', label: 'Weekly Digest', desc: 'Get a weekly summary of incidents and PR activity', icon: Globe },
                  { key: 'slack_alerts', label: 'Slack Alerts', desc: 'Send alerts to connected Slack workspace (requires Slack integration)', icon: Shield },
                  { key: 'pagerduty_alerts', label: 'PagerDuty Alerts', desc: 'Escalate critical incidents via PagerDuty (requires PagerDuty integration)', icon: Bell },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[var(--acid)]/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-[var(--acid)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--ink)] font-[var(--sans)]">{item.label}</p>
                        <p className="text-[var(--muted)] text-sm font-[var(--sans)]">{item.desc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[var(--line)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--acid)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--line)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--acid)]"></div>
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={() => persistSettings({ notifications }, 'Notification preferences saved!')}
                className="px-6 py-3 rounded-lg bg-[var(--acid)] text-[#091006] hover:bg-[#d1ff99] transition-colors font-bold text-sm font-[var(--sans)]"
              >
                Save Preferences
              </button>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="max-w-2xl space-y-6">
              <h4 className="text-[var(--ink)] font-semibold font-[var(--sans)]">Appearance</h4>
              
              <div>
                <label className="block text-xs font-semibold text-[var(--muted-strong)] uppercase tracking-wider font-[var(--mono)] mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'system', label: 'System', desc: 'Match OS setting' },
                    { value: 'light', label: 'Light', desc: 'Always light mode' },
                    { value: 'dark', label: 'Dark', desc: 'Always dark mode' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTheme(option.value as 'system' | 'light' | 'dark');
                        persistSettings({ theme: option.value }, 'Theme saved!');
                      }}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        theme === option.value
                          ? "border-[var(--acid)] bg-[var(--acid)]/10"
                          : "border-[var(--line)] hover:border-[var(--muted)]"
                      )}
                    >
                      <p className="font-semibold text-[var(--ink)] font-[var(--sans)]">{option.label}</p>
                      <p className="text-[var(--muted)] text-sm font-[var(--sans)]">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="max-w-2xl space-y-6">
              <h4 className="text-[var(--ink)] font-semibold font-[var(--sans)]">Danger Zone</h4>
              <p className="text-[var(--muted)] text-sm font-[var(--sans)]">
                Irreversible and destructive actions.
              </p>

              <div className="p-4 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-xl">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-[var(--danger)] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-[var(--danger)] font-semibold font-[var(--sans)] mb-1">Delete Account</h5>
                    <p className="text-[var(--muted)] text-sm font-[var(--sans)]">
                      Permanently delete your account and all associated data. This action cannot be undone.
                      All your integrations, incidents, pull requests, and knowledge base entries will be deleted.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className={cn(
                        "mt-3 px-4 py-2 rounded-lg border font-semibold text-sm font-[var(--sans)] transition-colors",
                        deleteConfirm
                          ? "border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)]/10"
                          : "border-[var(--line)] text-[var(--muted-strong)] hover:bg-white/5 hover:text-[var(--ink)]"
                      )}
                    >
                      {deleteConfirm ? (
                        <>Delete My Account <Trash2 className="w-4 h-4 ml-2" /></>
                      ) : (
                        'Delete Account'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--line)]">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--line)] text-[var(--muted-strong)] hover:bg-white/5 hover:text-[var(--ink)] font-semibold text-sm font-[var(--sans)] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}