import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, ShieldAlert, Cloud, Bell, GitBranch, 
  CheckCircle2, Loader2, XCircle, ExternalLink, 
  RefreshCw, AlertTriangle, Wifi
} from 'lucide-react';
import { cn } from '../lib/utils';
import { integrationsApi } from '../api';
import type { ConnectResponse, Integration, IntegrationCatalogItem, StatusResponse } from '../api';

// Catalog items from the API, decorated client-side with an icon component
// (components can't be serialized over the wire).
type CatalogItem = IntegrationCatalogItem & {
  icon: React.ComponentType<{ className?: string }>;
};

// Category icons
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  observability: Activity,
  incident: Bell,
  vcs: GitBranch,
  cloud: Cloud,
};

const categoryLabels: Record<string, string> = {
  observability: 'Observability',
  incident: 'Incident Management',
  vcs: 'Version Control',
  cloud: 'Cloud',
};

export default function IntegrationsPage() {
  const [activeId, setActiveId] = useState<string>('');
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  // Load catalog and user integrations on mount
  useEffect(() => {
    loadCatalog();
    loadIntegrations();
  }, []);

  // Check for URL params (OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');
    const service = params.get('service');

    if (connected) {
      setMessage({ type: 'success', text: `${connected} connected successfully!` });
      loadIntegrations();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error && service) {
      setMessage({ type: 'error', text: `Failed to connect ${service}: ${error}` });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadCatalog = async () => {
    try {
      const data = await integrationsApi.catalog();
      // Add icon components to catalog items (can't be serialized over API)
      const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
        datadog: Activity,
        sentry: ShieldAlert,
        cloudwatch: Cloud,
        pagerduty: Bell,
        grafana: Activity,
        github: GitBranch,
      };
      const catalogWithIcons = data.map((item) => ({
        ...item,
        icon: iconMap[item.id] || Activity,
      }));
      setCatalog(catalogWithIcons);
      if (data.length > 0 && !activeId) {
        setActiveId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load catalog', err);
      setMessage({ type: 'error', text: 'Failed to load integrations catalog' });
    } finally {
      setCatalogLoading(false);
    }
  };

  const loadIntegrations = async () => {
    try {
      const data = await integrationsApi.list();
      setIntegrations(data);
    } catch (err) {
      console.error('Failed to load integrations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (service: string, category: string) => {
    setConnecting(service);
    setMessage(null);

    try {
      const result: ConnectResponse = await integrationsApi.connect(service, category);
      
      if (result.success && result.redirect_url) {
        // Redirect to Composio OAuth
        window.location.href = result.redirect_url;
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to initiate connection' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error. Could not reach server.' });
    } finally {
      setConnecting(null);
    }
  };

  const handleCheckStatus = async (service: string) => {
    setCheckingStatus(service);
    try {
      const result: StatusResponse = await integrationsApi.status(service);
      
      if (result.connected) {
        setMessage({ type: 'success', text: `${service} is connected and verified!` });
      } else {
        setMessage({ type: 'error', text: result.error || `${service} is not connected` });
      }
      loadIntegrations();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to check status' });
    } finally {
      setCheckingStatus(null);
    }
  };

  const handleDisconnect = async (service: string) => {
    if (!confirm(`Are you sure you want to disconnect ${service}?`)) return;

    setMessage(null);
    try {
      await integrationsApi.remove(service);
      setMessage({ type: 'success', text: `${service} disconnected successfully` });
      loadIntegrations();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to disconnect' });
    }
  };

  if (loading || catalogLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--acid)] animate-spin" />
      </div>
    );
  }

  const activeIntegration = catalog.find(c => c.id === activeId);
  const configuredIntegration = integrations.find(i => i.service === activeId);
  const isConnected = configuredIntegration?.status === 'connected';
  const isPending = configuredIntegration?.status === 'pending';
  const hasError = configuredIntegration?.status === 'error';

  if (!activeIntegration) {
    return (
      <div className="max-w-[1000px] mx-auto py-8 text-center">
        <p className="text-[var(--muted)]">No integrations available</p>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[activeIntegration.category] || Activity;

  return (
    <div className="max-w-[1000px] mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-2 font-[var(--sans)]">Integrations</h1>
        <p className="text-[var(--muted-strong)] font-[var(--sans)]">
          Connect your observability and incident management tools to allow Trace2PR agents to automatically analyze and fix issues.
          {catalog.some(c => c.oauth_supported) && ' Connections use secure OAuth via Composio.'}
        </p>
      </div>

      <div className="grid grid-cols-[260px_1fr] gap-8 bg-[var(--surface)] border border-[var(--line)] rounded-xl overflow-hidden min-h-[500px]">
        
        {/* Sidebar - Integration Catalog */}
        <div className="bg-[var(--surface-raised)] border-r border-[var(--line)] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-[var(--mono)]">Available Apps</div>
            <span className="text-xs text-[var(--muted)] font-[var(--mono)]">{catalog.length} integrations</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1">
            {catalog.map((item) => {
              const isActive = activeId === item.id;
              const itemIntegration = integrations.find(i => i.service === item.id);
              const itemStatus = itemIntegration?.status || 'disconnected';
              const itemConnected = itemStatus === 'connected';
              const itemPending = itemStatus === 'pending';
              const itemError = itemStatus === 'error';

              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveId(item.id); setMessage(null); }}
                  className={cn(
                    "flex items-center gap-3 w-full p-3 rounded-lg text-left transition-all duration-200",
                    isActive ? "bg-[var(--acid)]/10 text-[var(--ink)]" : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--ink)]"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    itemConnected ? "bg-[var(--acid)]/10 border border-[var(--acid)]/30" : 
                    itemPending ? "bg-[var(--warning)]/10 border border-[var(--warning)]/30" :
                    itemError ? "bg-[var(--danger)]/10 border border-[var(--danger)]/30" :
                    "bg-white/5 border border-[var(--line)]"
                  )}>
                    {item.logo_url ? (
                      <img src={item.logo_url} alt={item.name} className="w-5 h-5" />
                    ) : (
                      <item.icon className={cn("w-5 h-5", 
                        itemConnected ? "text-[var(--acid)]" : 
                        itemPending ? "text-[var(--warning)]" :
                        itemError ? "text-[var(--danger)]" :
                        "text-[var(--muted-strong)]"
                      )} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm font-[var(--sans)] truncate">{item.name}</span>
                      {itemConnected && (
                        <span className="flex items-center gap-1 text-[10px] font-[var(--mono)] text-[var(--acid)] uppercase">
                          <Wifi className="w-3 h-3" /> Connected
                        </span>
                      )}
                      {itemPending && (
                        <span className="flex items-center gap-1 text-[10px] font-[var(--mono)] text-[var(--warning)] uppercase">
                          <Loader2 className="w-3 h-3 animate-spin" /> Pending
                        </span>
                      )}
                      {itemError && (
                        <span className="flex items-center gap-1 text-[10px] font-[var(--mono)] text-[var(--danger)] uppercase">
                          <AlertTriangle className="w-3 h-3" /> Error
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--muted)] truncate font-[var(--sans)]">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Details Panel */}
        <div className="p-8 overflow-y-auto">
          <div className="flex items-start gap-4 mb-6">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              isConnected ? "bg-[var(--acid)]/10 border border-[var(--acid)]/30" :
              isPending ? "bg-[var(--warning)]/10 border border-[var(--warning)]/30" :
              hasError ? "bg-[var(--danger)]/10 border border-[var(--danger)]/30" :
              "bg-[var(--acid)]/10 border border-[var(--acid)]/30"
            )}>
              <CategoryIcon className={cn("w-6 h-6",
                isConnected ? "text-[var(--acid)]" :
                isPending ? "text-[var(--warning)]" :
                hasError ? "text-[var(--danger)]" :
                "text-[var(--acid)]"
              )} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[var(--ink)] font-[var(--sans)]">{activeIntegration.name}</h2>
              <p className="text-[var(--muted)] text-sm font-[var(--sans)] mt-1">{activeIntegration.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-[var(--mono)] uppercase bg-[var(--surface-raised)] border border-[var(--line)] text-[var(--muted)]">
                  {categoryLabels[activeIntegration.category] || activeIntegration.category}
                </span>
                {activeIntegration.oauth_supported && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-[var(--mono)] uppercase bg-[var(--acid)]/10 text-[var(--acid)] border border-[var(--acid)]/20">
                    OAuth via Composio
                  </span>
                )}
              </div>
            </div>
            {isConnected && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--acid)]/10 text-[var(--acid)] text-xs font-[var(--mono)] uppercase font-semibold border border-[var(--acid)]/20">
                <CheckCircle2 className="w-4 h-4" /> Connected
              </div>
            )}
            {isPending && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--warning)]/10 text-[var(--warning)] text-xs font-[var(--mono)] uppercase font-semibold border border-[var(--warning)]/20">
                <Loader2 className="w-4 h-4 animate-spin" /> Pending
              </div>
            )}
            {hasError && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--danger)]/10 text-[var(--danger)] text-xs font-[var(--mono)] uppercase font-semibold border border-[var(--danger)]/20">
                <AlertTriangle className="w-4 h-4" /> Error
              </div>
            )}
          </div>

          <div className="w-full h-[1px] bg-[var(--line)] mb-8" />

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-lg mb-6 flex items-start gap-3 border text-sm font-[var(--sans)]",
                message.type === 'success' ? "bg-[var(--acid)]/10 border-[var(--acid)]/30 text-[var(--acid)]" : "bg-[var(--danger)]/10 border-[var(--danger)]/30 text-[var(--danger)]"
              )}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
              {message.text}
            </motion.div>
          )}

          {isConnected ? (
            // Connected state
            <div className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-[var(--ink)] font-semibold font-[var(--sans)] mb-1">Connection Active</h3>
                <p className="text-[var(--muted)] text-sm font-[var(--sans)]">
                  Trace2PR has verified access to {activeIntegration.name} via Composio. 
                  Credentials are securely managed and tokens are auto-refreshed.
                </p>
              </div>

              {configuredIntegration?.verified_at && (
                <div className="text-[var(--muted)] text-xs font-[var(--mono)]">
                  Last verified: {new Date(configuredIntegration.verified_at).toLocaleString()}
                </div>
              )}

              {configuredIntegration?.config && Object.keys(configuredIntegration.config).length > 0 && (
                <div className="pt-4 border-t border-[var(--line)]">
                  <h4 className="text-[var(--muted-strong)] text-xs font-semibold uppercase tracking-wider font-[var(--mono)] mb-2">Configuration</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm font-[var(--sans)]">
                    {Object.entries(configuredIntegration.config).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-[var(--muted)]">{key}</span>
                        <span className="text-[var(--ink)] font-[var(--mono)]">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-[var(--line)]">
                <button
                  onClick={() => handleCheckStatus(activeId)}
                  disabled={checkingStatus === activeId}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--line)] text-[var(--muted-strong)] hover:bg-white/5 hover:text-[var(--ink)] font-semibold text-sm font-[var(--sans)] transition-colors"
                >
                  {checkingStatus === activeId && <Loader2 className="w-4 h-4 animate-spin" />}
                  <RefreshCw className="w-4 h-4" />
                  Verify Connection
                </button>
                <button
                  onClick={() => handleDisconnect(activeId)}
                  disabled={connecting === activeId}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--danger)]/30 text-[var(--danger)] hover:bg-[var(--danger)]/10 font-semibold text-sm font-[var(--sans)] transition-colors"
                >
                  {connecting === activeId && <Loader2 className="w-4 h-4 animate-spin" />}
                  <XCircle className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            // Not connected - show connect button
            <div className="max-w-[500px]">
              <div className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl p-6 mb-6">
                <h3 className="text-[var(--ink)] font-semibold font-[var(--sans)] mb-2">Connect {activeIntegration.name}</h3>
                <p className="text-[var(--muted)] text-sm font-[var(--sans)] mb-4">
                  {activeIntegration.oauth_supported ? (
                    <>
                      You'll be redirected to {activeIntegration.name} to authorize Trace2PR via Composio. 
                      This is a secure OAuth flow - we never see your credentials.
                    </>
                  ) : (
                    'Enter your API credentials to connect.'
                  )}
                </p>
                
                {activeIntegration.required_fields.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h4 className="text-[var(--muted-strong)] text-xs font-semibold uppercase tracking-wider font-[var(--mono)]">Required fields:</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeIntegration.required_fields.map(field => (
                        <span key={field} className="px-2 py-1 rounded bg-white/5 border border-[var(--line)] text-[var(--muted)] text-xs font-[var(--mono)]">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleConnect(activeId, activeIntegration.category)}
                disabled={connecting === activeId || isPending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--acid)] text-[#091006] hover:bg-[#d1ff99] transition-colors font-bold text-sm font-[var(--sans)] disabled:opacity-50"
              >
                {connecting === activeId && <Loader2 className="w-5 h-5 animate-spin" />}
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : activeIntegration.oauth_supported ? (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    Connect via OAuth
                  </>
                ) : (
                  'Connect'
                )}
              </button>

              {isPending && (
                <p className="text-center text-[var(--warning)] text-sm font-[var(--sans)] mt-3">
                  Connection pending. Please complete the OAuth flow in the popup window.
                </p>
              )}

              {hasError && (
                <div className="mt-4 p-4 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] text-sm font-[var(--sans)]">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-semibold">Connection Error</span>
                  </div>
                  <p>{configuredIntegration?.error_message || 'Unknown error occurred'}</p>
                  <button
                    onClick={() => handleConnect(activeId, activeIntegration.category)}
                    className="mt-2 text-xs underline hover:no-underline"
                  >
                    Try connecting again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Webhook Info Section */}
          {isConnected && (
            <div className="mt-8 p-4 rounded-lg bg-[var(--page-deep)] border border-[var(--line)]">
              <h4 className="flex items-center gap-2 text-[var(--ink)] font-semibold font-[var(--sans)] mb-3">
                <Wifi className="w-5 h-5 text-[var(--acid)]" />
                Webhook Configuration
              </h4>
              <p className="text-[var(--muted)] text-sm font-[var(--sans)] mb-3">
                To receive real-time alerts from {activeIntegration.name}, configure the webhook URL in your {activeIntegration.name} settings:
              </p>
              <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg p-3 font-[var(--mono)] text-xs">
                <code className="flex-1 text-[var(--ink)]">
                  {import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'}/webhooks/composio
                </code>
                <button 
                  className="px-3 py-1 rounded text-[var(--acid)] hover:bg-[var(--acid)]/10 text-xs font-[var(--mono)]"
                  onClick={() => navigator.clipboard.writeText(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'}/webhooks/composio`)}
                >
                  Copy
                </button>
              </div>
              <p className="text-[var(--muted)] text-xs font-[var(--sans)] mt-2">
                Composio will automatically forward events from {activeIntegration.name} to this endpoint.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}