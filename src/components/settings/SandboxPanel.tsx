import { useState } from 'react';
import { Plus, Terminal, Trash2 } from 'lucide-react';
import type { ExecResult } from '../../api';
import { useCreateSandbox, useDeleteSandbox, useExecCommand, useSandboxInstances, useSandboxTemplates } from '../../hooks';
import { timeAgo } from '../../lib/time';
import { cn } from '../../lib/utils';
import { StatusBadge } from '../common/Badges';
import { EmptyState, ErrorState, ListSkeleton } from '../common/StateViews';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { errorMessage, useFeedback } from '../ui/feedback';
import { Input, Select } from '../ui/input';

export function SandboxPanel() {
  const { data: instances = [], isLoading, error, refetch } = useSandboxInstances();
  const { data: templates = [] } = useSandboxTemplates();
  const create = useCreateSandbox();
  const remove = useDeleteSandbox();
  const { toast, confirm } = useFeedback();
  const [templateId, setTemplateId] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const chosenTemplate = templateId || templates[0]?.id || 'base';

  const onCreate = () => create.mutate({ template_id: chosenTemplate }, {
    onSuccess: () => toast('Sandbox started.'),
    onError: (e) => toast(errorMessage(e), 'error'),
  });

  const onDelete = async (id: string) => {
    if (!await confirm({ title: 'Delete this sandbox?', description: 'It is stopped and everything in it is lost.', confirmLabel: 'Delete', danger: true })) return;
    remove.mutate(id, {
      onSuccess: () => { if (activeId === id) setActiveId(null); toast('Sandbox deleted.'); },
      onError: (e) => toast(errorMessage(e), 'error'),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <p className="text-sm text-muted flex-1 min-w-[240px]">
          Fix jobs create their own sandboxes. Start one here to poke around a template by hand.
        </p>
        <Select aria-label="Template" value={chosenTemplate} onChange={(e) => setTemplateId(e.target.value)} className="w-44">
          {templates.length === 0 && <option value="base">base</option>}
          {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
        <Button variant="primary" onClick={onCreate} loading={create.isPending}>
          {!create.isPending && <Plus className="w-4 h-4" />} New sandbox
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <ListSkeleton rows={2} />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : instances.length === 0 ? (
          <EmptyState icon={Terminal} title="No running sandboxes" hint="Start one to run commands in an isolated environment." />
        ) : (
          <ul className="divide-y divide-line">
            {instances.map((inst) => (
              <li key={inst.id} className={cn('flex flex-wrap items-center gap-3 px-4 py-3', activeId === inst.id && 'bg-white/[0.04]')}>
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm text-ink font-mono truncate">{inst.id}</p>
                  <p className="text-xs text-muted font-mono">{inst.template_id} · started {timeAgo(inst.created_at)}</p>
                </div>
                <StatusBadge status={inst.status} />
                <Button size="sm" variant={activeId === inst.id ? 'subtle' : 'secondary'} onClick={() => setActiveId(inst.id)}>
                  <Terminal className="w-3.5 h-3.5" /> Terminal
                </Button>
                <Button size="icon-sm" variant="ghost" className="hover:text-danger" onClick={() => onDelete(inst.id)} aria-label="Delete sandbox">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {activeId && <ExecPanel key={activeId} instanceId={activeId} />}
    </div>
  );
}

function ExecPanel({ instanceId }: { instanceId: string }) {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<{ command: string; result: ExecResult }[]>([]);
  const exec = useExecCommand(instanceId);
  const { toast } = useFeedback();

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.trim();
    if (!cmd) return;
    try {
      const result = await exec.mutateAsync({ command: cmd });
      setHistory((h) => [...h, { command: cmd, result }]);
      setCommand('');
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-line text-xs text-muted font-mono flex items-center gap-2">
        <Terminal className="w-3.5 h-3.5" /> {instanceId.slice(0, 12)}
      </div>
      {history.length > 0 && (
        <div className="max-h-[360px] overflow-y-auto scroll-thin bg-page-deep p-3 space-y-3 font-mono text-xs">
          {history.map((h, i) => (
            <div key={i}>
              <p className="text-acid">$ {h.command}</p>
              {h.result.stdout && <pre className="text-muted-strong whitespace-pre-wrap break-words">{h.result.stdout}</pre>}
              {h.result.stderr && <pre className="text-danger whitespace-pre-wrap break-words">{h.result.stderr}</pre>}
              <p className="text-muted">exit {h.result.exit_code}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={run} className="flex gap-2 p-3">
        <Input mono value={command} onChange={(e) => setCommand(e.target.value)} placeholder="ls -la" aria-label="Command" />
        <Button type="submit" variant="primary" loading={exec.isPending}>Run</Button>
      </form>
    </Card>
  );
}
