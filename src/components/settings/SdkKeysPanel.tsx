import { useState } from 'react';
import { KeyRound, Plus } from 'lucide-react';
import { useCreateSdkKey, useRevokeSdkKey, useSdkKeys } from '../../hooks';
import { timeAgo } from '../../lib/time';
import { cn } from '../../lib/utils';
import { CopyField } from '../common/Controls';
import { EmptyState, ListSkeleton } from '../common/StateViews';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { errorMessage, useFeedback } from '../ui/feedback';
import { Field, Input } from '../ui/input';

export function SdkKeysPanel() {
  const { data: keys = [], isLoading } = useSdkKeys();
  const create = useCreateSdkKey();
  const revoke = useRevokeSdkKey();
  const { toast, confirm } = useFeedback();
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const endpoint = `${import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'}/ingest/events`;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await create.mutateAsync({ name: name.trim(), service: service.trim() || null });
      setNewKey(created.key);
      setName('');
      setService('');
    } catch (err) {
      toast(errorMessage(err, 'Could not create the key'), 'error');
    }
  };

  const onRevoke = async (id: string, keyName: string) => {
    if (!await confirm({ title: `Revoke “${keyName}”?`, description: 'Apps using this key can no longer report errors.', confirmLabel: 'Revoke', danger: true })) return;
    revoke.mutate(id, { onSuccess: () => toast('Key revoked.'), onError: (e) => toast(errorMessage(e), 'error') });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        For apps that don't use Sentry or Datadog: the Trace2PR clients (Python, Node) report uncaught errors to
        the endpoint below with the <code className="font-mono text-xs text-muted-strong">X-Trace2PR-Key</code> header.
      </p>
      <CopyField value={endpoint} />

      {newKey && (
        <Card className="p-4 border-acid/30 bg-acid/[0.05] space-y-2">
          <p className="text-sm text-ink font-medium">Copy this key now. It won't be shown again.</p>
          <CopyField value={newKey} />
        </Card>
      )}

      <Card className="p-4">
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <Field label="Name" htmlFor="sdk-name">
            <Input id="sdk-name" placeholder="orders-api production" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Default service (optional)" htmlFor="sdk-service">
            <Input id="sdk-service" mono placeholder="orders-api" value={service} onChange={(e) => setService(e.target.value)} />
          </Field>
          <Button type="submit" variant="primary" disabled={!name.trim()} loading={create.isPending}>
            {!create.isPending && <Plus className="w-4 h-4" />} Create key
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <ListSkeleton rows={2} />
        ) : keys.length === 0 ? (
          <EmptyState icon={KeyRound} title="No SDK keys yet" />
        ) : (
          <ul className="divide-y divide-line">
            {keys.map((k) => (
              <li key={k.id} className={cn('flex items-center gap-3 px-4 py-3', k.revoked_at && 'opacity-50')}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">{k.name}{k.service && <span className="text-muted"> · {k.service}</span>}</p>
                  <p className="text-xs text-muted font-mono">
                    {k.key_prefix}… · {k.revoked_at ? 'revoked' : k.last_used_at ? `used ${timeAgo(k.last_used_at)}` : 'never used'}
                  </p>
                </div>
                {!k.revoked_at && <Button size="sm" variant="ghost" className="hover:text-danger" onClick={() => onRevoke(k.id, k.name)}>Revoke</Button>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
