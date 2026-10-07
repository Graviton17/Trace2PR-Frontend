import { useState } from 'react';
import { Copy, KeyRound, Plus } from 'lucide-react';
import { useCreateSdkKey, useRevokeSdkKey, useSdkKeys } from '../../hooks/useSdkKeys';
import { timeAgo } from '../../lib/time';
import { cn } from '../../lib/utils';

const input =
  'w-full bg-[var(--page-deep)] border border-[var(--line)] focus:border-[var(--acid)] rounded-lg px-3 py-2 text-[var(--ink)] font-[var(--sans)] text-sm outline-none';

export default function SdkKeysPanel() {
  const { data: keys = [], isLoading } = useSdkKeys();
  const create = useCreateSdkKey();
  const revoke = useRevokeSdkKey();
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const endpoint = `${import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'}/ingest/events`;

  const handleCreate = async () => {
    const created = await create.mutateAsync({ name: name.trim(), service: service.trim() || null });
    setNewKey(created.key);
    setName('');
    setService('');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h4 className="text-[var(--ink)] font-semibold font-[var(--sans)]">SDK keys</h4>
        <p className="text-[var(--muted)] text-sm font-[var(--sans)] mt-1">
          For apps that don't use Sentry or Datadog: the Trace2PR clients (Python, Node) report
          uncaught errors to <code className="font-[var(--mono)] text-xs">{endpoint}</code> with
          the <code className="font-[var(--mono)] text-xs">X-Trace2PR-Key</code> header.
        </p>
      </div>

      {newKey && (
        <div className="p-4 rounded-lg border border-[var(--acid)]/30 bg-[var(--acid)]/10 space-y-2">
          <p className="text-sm text-[var(--ink)] font-[var(--sans)]">Copy this key now — it won't be shown again.</p>
          <div className="flex gap-2">
            <code className="flex-1 truncate px-3 py-2 rounded bg-[var(--page-deep)] text-xs font-[var(--mono)] text-[var(--ink)]">{newKey}</code>
            <button
              onClick={() => navigator.clipboard.writeText(newKey)}
              aria-label="Copy key"
              className="px-3 rounded-lg border border-[var(--line)] text-[var(--muted-strong)] hover:text-[var(--acid)]"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-[var(--muted)] text-sm">Loading…</p>
      ) : keys.length === 0 ? (
        <div className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl p-6 text-center">
          <KeyRound className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-[var(--muted)] text-sm font-[var(--sans)]">No SDK keys yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {keys.map((k) => (
            <li
              key={k.id}
              className={cn(
                'flex items-center gap-3 p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg',
                k.revoked_at && 'opacity-50',
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--ink)] font-[var(--sans)]">
                  {k.name} {k.service && <span className="text-[var(--muted)]">· {k.service}</span>}
                </p>
                <p className="text-xs text-[var(--muted)] font-[var(--mono)]">
                  {k.key_prefix}… · {k.revoked_at ? 'revoked' : k.last_used_at ? `used ${timeAgo(k.last_used_at)}` : 'never used'}
                </p>
              </div>
              {!k.revoked_at && (
                <button
                  onClick={() => revoke.mutate(k.id)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs font-semibold text-[var(--muted-strong)] hover:text-[var(--danger)]"
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="pt-6 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div>
          <label htmlFor="sdk-name" className="block text-xs font-semibold text-[var(--muted-strong)] uppercase tracking-wider font-[var(--mono)] mb-2">Name</label>
          <input id="sdk-name" className={input} placeholder="orders-api production" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="sdk-service" className="block text-xs font-semibold text-[var(--muted-strong)] uppercase tracking-wider font-[var(--mono)] mb-2">Default service</label>
          <input id="sdk-service" className={input} placeholder="orders-api" value={service} onChange={(e) => setService(e.target.value)} />
        </div>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || create.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--acid)] text-[#091006] hover:bg-[#d1ff99] font-bold text-sm font-[var(--sans)] disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Create key
        </button>
      </div>
    </div>
  );
}
