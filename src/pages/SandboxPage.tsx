import { useState } from 'react';
import { Plus, Terminal, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/common/StateViews';
import { StatusBadge } from '../components/common/Badges';
import {
  useCreateSandbox,
  useDeleteSandbox,
  useExecCommand,
  useSandboxInstances,
  useSandboxTemplates,
} from '../hooks';
import { timeAgo } from '../lib/time';
import type { ExecResult } from '../api';

const card = 'bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5';

function ExecPanel({ instanceId }: { instanceId: string }) {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState<ExecResult | null>(null);
  const exec = useExecCommand(instanceId);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    setResult(await exec.mutateAsync({ command: command.trim() }));
  };

  return (
    <div className={`${card} mt-6`}>
      <h2 className="text-[var(--ink)] font-semibold mb-3 flex items-center gap-2 font-[var(--sans)]">
        <Terminal className="w-4 h-4" /> Run command in {instanceId.slice(0, 8)}
      </h2>
      <form onSubmit={run} className="flex gap-2">
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="ls -la"
          className="flex-1 bg-[#080e0b] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--ink)] font-[var(--mono)]"
        />
        <button
          type="submit"
          disabled={exec.isPending}
          className="px-4 py-2 rounded-lg bg-[var(--acid)] text-[#091006] text-sm font-bold disabled:opacity-50"
        >
          Run
        </button>
      </form>
      {exec.error && <p className="text-[var(--danger)] text-sm mt-3">{(exec.error as Error).message}</p>}
      {result && (
        <pre className="mt-3 bg-[#080e0b] border border-[var(--line)] rounded-lg p-3 text-xs text-[var(--muted-strong)] overflow-x-auto font-[var(--mono)]">
          {result.stdout}
          {result.stderr && <span className="text-[var(--danger)]">{result.stderr}</span>}
          <span className="block text-[var(--muted)] mt-2">exit code {result.exit_code}</span>
        </pre>
      )}
    </div>
  );
}

export default function SandboxPage() {
  const { data: instances = [], isLoading, error, refetch } = useSandboxInstances();
  const { data: templates = [] } = useSandboxTemplates();
  const create = useCreateSandbox();
  const remove = useDeleteSandbox();
  const [templateId, setTemplateId] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const chosenTemplate = templateId || templates[0]?.id || 'base';

  return (
    <div className="max-w-[1100px] mx-auto py-8">
      <PageHeader
        title="Sandbox"
        description="Isolated environments where fixes are tried and tested."
        actions={
          <>
            <select
              value={chosenTemplate}
              onChange={(e) => setTemplateId(e.target.value)}
              className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--ink)]"
            >
              {templates.length === 0 && <option value="base">base</option>}
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button
              onClick={() => create.mutate({ template_id: chosenTemplate })}
              disabled={create.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--acid)] text-[#091006] text-sm font-bold disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> New sandbox
            </button>
          </>
        }
      />
      {create.error && <p className="text-[var(--danger)] text-sm mb-4">{(create.error as Error).message}</p>}

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl overflow-hidden">
        {isLoading ? (
          <LoadingState label="Loading sandboxes…" />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : instances.length === 0 ? (
          <EmptyState title="No running sandboxes" hint="Create one to run commands in an isolated environment." />
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {instances.map((inst) => (
              <li key={inst.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--ink)] text-sm font-[var(--mono)] truncate">{inst.id}</p>
                  <p className="text-[var(--muted)] text-xs font-[var(--mono)]">
                    {inst.template_id} · started {timeAgo(inst.created_at)}
                  </p>
                </div>
                <StatusBadge status={inst.status} />
                <button
                  onClick={() => setActiveId(inst.id)}
                  className="text-xs text-[var(--acid)] hover:underline font-[var(--sans)]"
                >
                  Open terminal
                </button>
                <button
                  onClick={() => remove.mutate(inst.id)}
                  disabled={remove.isPending}
                  aria-label="Delete sandbox"
                  className="text-[var(--muted)] hover:text-[var(--danger)]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {activeId && <ExecPanel key={activeId} instanceId={activeId} />}
    </div>
  );
}
