import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Activity, AlertTriangle, Bell, Cloud, ExternalLink, GitBranch, RefreshCw, ShieldAlert, Unplug } from 'lucide-react';
import { integrationsApi } from '../../api';
import type { Integration, IntegrationCatalogItem } from '../../api';
import {
  useIntegrationCatalog, useIntegrations, useRecheckOnboarding, useRemoveIntegration,
} from '../../hooks';
import { WEBHOOK_HELP } from '../../lib/integrations';
import { timeAgo } from '../../lib/time';
import { cn } from '../../lib/utils';
import { StatusBadge } from '../common/Badges';
import { CopyField } from '../common/Controls';
import { ErrorState, Skeleton } from '../common/StateViews';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { errorMessage, useFeedback } from '../ui/feedback';

const ICONS: Record<string, typeof Activity> = {
  datadog: Activity, sentry: ShieldAlert, cloudwatch: Cloud, pagerduty: Bell, grafana: Activity, github: GitBranch,
};

const CATEGORY_LABELS: Record<string, string> = {
  observability: 'Observability', incident: 'Incident management', vcs: 'Version control', cloud: 'Cloud',
};

export function IntegrationsPanel() {
  const catalog = useIntegrationCatalog();
  const integrations = useIntegrations();
  const recheck = useRecheckOnboarding();
  const { toast } = useFeedback();
  const [params, setParams] = useSearchParams();
  const handledReturn = useRef(false);

  // Back from a Composio Connect Link (?service=…): confirm the connection, then clean the URL.
  useEffect(() => {
    const service = params.get('service');
    if (!service || handledReturn.current) return;
    handledReturn.current = true;
    const failed = params.get('error') || (params.get('status') === 'failed' ? 'authorization was not completed' : null);
    setParams({}, { replace: true });
    if (failed) { toast(`Couldn't connect ${service}: ${failed}`, 'error'); return; }
    integrationsApi.status(service)
      .then((r) => toast(r.connected ? `${service} connected.` : r.error || `${service} is not connected yet.`, r.connected ? 'success' : 'error'))
      .catch((e) => toast(errorMessage(e, 'Could not check the connection'), 'error'))
      .finally(() => { integrations.refetch(); recheck(); });
  }, [params, setParams, toast, integrations, recheck]);

  if (catalog.isLoading || integrations.isLoading) {
    return <div className="grid sm:grid-cols-2 gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>;
  }
  if (catalog.error) return <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} />;

  const byService = new Map((integrations.data ?? []).map((i) => [i.service, i]));
  const items = [...(catalog.data ?? [])].sort((a, b) =>
    Number(byService.get(b.id)?.status === 'connected') - Number(byService.get(a.id)?.status === 'connected'));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Connections use OAuth through Composio; Trace2PR never sees your credentials. Each monitoring tool gets a private webhook URL.
      </p>
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
        {items.map((item) => (
          <IntegrationCard key={item.id} item={item} integration={byService.get(item.id)} onChanged={() => { integrations.refetch(); recheck(); }} />
        ))}
      </div>
    </div>
  );
}

function IntegrationCard({ item, integration, onChanged }: {
  item: IntegrationCatalogItem; integration?: Integration; onChanged: () => void;
}) {
  const { toast, confirm } = useFeedback();
  const remove = useRemoveIntegration();
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const status = integration?.status ?? 'disconnected';
  const connected = status === 'connected';
  const Icon = ICONS[item.id] ?? Activity;

  const connect = async () => {
    setConnecting(true);
    try {
      const result = await integrationsApi.connect(item.id, item.category);
      if (result.success && result.redirect_url) { window.location.href = result.redirect_url; return; }
      toast(result.error || 'Could not start the connection', 'error');
    } catch (e) {
      toast(errorMessage(e, 'Could not reach the server'), 'error');
    }
    setConnecting(false);
  };

  const verify = async () => {
    setChecking(true);
    try {
      const r = await integrationsApi.status(item.id);
      toast(r.connected ? `${item.name} is connected and verified.` : r.error || `${item.name} is not connected.`, r.connected ? 'success' : 'error');
      onChanged();
    } catch (e) {
      toast(errorMessage(e, 'Could not check the connection'), 'error');
    } finally {
      setChecking(false);
    }
  };

  const disconnect = async () => {
    const ok = await confirm({
      title: `Disconnect ${item.name}?`,
      description: item.id === 'github'
        ? 'Trace2PR will stop reading code and opening pull requests, and you will be sent back to setup.'
        : 'Alerts sent to its webhook URL will be rejected until you connect it again.',
      confirmLabel: 'Disconnect',
      danger: true,
    });
    if (!ok) return;
    remove.mutate(item.id, {
      onSuccess: () => { toast(`${item.name} disconnected.`); onChanged(); },
      onError: (e) => toast(errorMessage(e), 'error'),
    });
  };

  return (
    <Card className={cn('p-4 flex flex-col gap-3', connected && 'border-acid/20', status === 'error' && 'border-danger/30')}>
      <div className="flex items-start gap-3">
        <span className={cn('w-10 h-10 rounded-lg border flex items-center justify-center shrink-0',
          connected ? 'border-acid/30 bg-acid/10 text-acid' : 'border-line bg-white/5 text-muted-strong')}>
          {item.logo_url ? <img src={item.logo_url} alt="" className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">{item.name}</h3>
            {status !== 'disconnected' && <StatusBadge status={status} />}
          </div>
          <p className="text-xs text-muted mt-0.5">{CATEGORY_LABELS[item.category] ?? item.category} · {item.description}</p>
        </div>
      </div>

      {status === 'error' && integration?.error_message && (
        <p className="flex gap-2 text-xs text-danger"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {integration.error_message}</p>
      )}

      {connected && integration?.webhook_url && (
        <div className="space-y-1.5">
          <CopyField value={integration.webhook_url} />
          <p className="text-xs text-muted">{WEBHOOK_HELP[item.id] ?? `Send ${item.name} alerts to this URL.`} Keep it private.</p>
        </div>
      )}
      {connected && item.id === 'github' && (
        <p className="text-xs text-muted">
          Reads your code and opens draft PRs as you. Choose repositories in{' '}
          <Link to="/dashboard/settings/repositories" className="text-acid hover:underline">Repositories</Link>.
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        {connected ? (
          <>
            <Button size="sm" onClick={verify} loading={checking}>{!checking && <RefreshCw className="w-3.5 h-3.5" />} Verify</Button>
            <Button size="sm" variant="ghost" className="hover:text-danger" onClick={disconnect} loading={remove.isPending}>
              {!remove.isPending && <Unplug className="w-3.5 h-3.5" />} Disconnect
            </Button>
            {integration?.verified_at && <span className="ml-auto text-[11px] text-muted font-mono">verified {timeAgo(integration.verified_at)}</span>}
          </>
        ) : (
          <Button size="sm" variant="primary" onClick={connect} loading={connecting || status === 'pending'}>
            {!connecting && status !== 'pending' && <ExternalLink className="w-3.5 h-3.5" />}
            {status === 'pending' ? 'Waiting for authorization' : status === 'error' ? 'Reconnect' : 'Connect'}
          </Button>
        )}
      </div>
    </Card>
  );
}
