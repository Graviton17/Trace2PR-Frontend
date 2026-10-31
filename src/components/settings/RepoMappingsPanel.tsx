import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FolderGit2, Plus, Trash2 } from 'lucide-react';
import type { RepoLanguage, RepoMapping, RepoMappingInput } from '../../api';
import {
  useCreateRepoMapping, useDeleteRepoMapping, useGitHubRepos, useIntegrations, useRepoMappings, useUpdateRepoMapping,
} from '../../hooks';
import { cn } from '../../lib/utils';
import { EmptyState, ListSkeleton } from '../common/StateViews';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { errorMessage, useFeedback } from '../ui/feedback';
import { Field, Input, Select, Switch } from '../ui/input';

const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

const EMPTY: RepoMappingInput = {
  service: '', repository: '', default_branch: 'main', language: null,
  install_cmd: null, test_cmd: null, auto_fix: false, enabled: true,
};

export function RepoMappingsPanel() {
  const { data: mappings = [], isLoading } = useRepoMappings();
  const createMapping = useCreateRepoMapping();
  const updateMapping = useUpdateRepoMapping();
  const deleteMapping = useDeleteRepoMapping();
  const { data: integrations = [] } = useIntegrations();
  const githubConnected = integrations.some((i) => i.service === 'github' && i.status === 'connected');
  const { data: repos = [] } = useGitHubRepos(githubConnected);
  const { toast, confirm } = useFeedback();

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<RepoMappingInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof RepoMappingInput>(key: K, value: RepoMappingInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.service.trim()) return setError('Service is required.');
    if (!REPO_PATTERN.test(form.repository.trim())) return setError("Repository must look like 'org/repo'.");
    try {
      await createMapping.mutateAsync({
        ...form,
        service: form.service.trim(),
        repository: form.repository.trim(),
        install_cmd: form.install_cmd?.trim() || null,
        test_cmd: form.test_cmd?.trim() || null,
      });
      toast(`${form.service.trim()} → ${form.repository.trim()} added.`);
      setForm(EMPTY);
      setAdding(false);
    } catch (err) {
      setError(errorMessage(err, 'Failed to save mapping'));
    }
  };

  const toggle = (mapping: RepoMapping, key: 'enabled' | 'auto_fix') =>
    updateMapping.mutate({ id: mapping.id, data: { [key]: !mapping[key] } }, {
      onError: (e) => toast(errorMessage(e), 'error'),
    });

  const remove = async (m: RepoMapping) => {
    if (!await confirm({ title: `Remove ${m.service}?`, description: `Errors from ${m.service} will no longer be fixed in ${m.repository}.`, confirmLabel: 'Remove', danger: true })) return;
    deleteMapping.mutate(m.id, { onSuccess: () => toast('Mapping removed.'), onError: (e) => toast(errorMessage(e), 'error') });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <p className="text-sm text-muted flex-1 min-w-[260px]">
          Which repository holds the code for each service. The service is the name your monitoring tool reports
          (for Sentry, the project slug). Unmapped errors still open incidents, but can't be fixed.
        </p>
        {!adding && <Button variant="primary" onClick={() => setAdding(true)}><Plus className="w-4 h-4" /> Add repository</Button>}
      </div>

      {adding && (
        <Card className="p-4">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Service" htmlFor="rm-service">
                <Input id="rm-service" mono placeholder="checkout-api" value={form.service} onChange={(e) => set('service', e.target.value)} />
              </Field>
              <Field label="Repository" htmlFor="rm-repo"
                hint={!githubConnected ? <>Connect GitHub in <Link className="text-acid hover:underline" to="/dashboard/settings/integrations">Integrations</Link> to pick from your repositories.</> : undefined}>
                <Input id="rm-repo" mono placeholder="acme/checkout-api" value={form.repository} list="rm-repo-options" autoComplete="off"
                  onChange={(e) => {
                    const repo = repos.find((r) => r.full_name === e.target.value);
                    setForm((f) => ({ ...f, repository: e.target.value, default_branch: repo?.default_branch ?? f.default_branch }));
                  }} />
                <datalist id="rm-repo-options">{repos.map((r) => <option key={r.full_name} value={r.full_name} />)}</datalist>
              </Field>
              <Field label="Default branch" htmlFor="rm-branch">
                <Input id="rm-branch" mono value={form.default_branch} onChange={(e) => set('default_branch', e.target.value)} />
              </Field>
              <Field label="Language" htmlFor="rm-lang">
                <Select id="rm-lang" value={form.language ?? ''} onChange={(e) => set('language', (e.target.value || null) as RepoLanguage | null)}>
                  <option value="">Auto-detect</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                </Select>
              </Field>
              <Field label="Install command (optional)" htmlFor="rm-install">
                <Input id="rm-install" mono placeholder='pip install -e ".[dev]"' value={form.install_cmd ?? ''} onChange={(e) => set('install_cmd', e.target.value)} />
              </Field>
              <Field label="Test command (optional)" htmlFor="rm-test">
                <Input id="rm-test" mono placeholder="pytest -x" value={form.test_cmd ?? ''} onChange={(e) => set('test_cmd', e.target.value)} />
              </Field>
            </div>
            {error && <p className="text-sm text-danger" role="alert">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" loading={createMapping.isPending}>Add mapping</Button>
              <Button variant="ghost" onClick={() => { setAdding(false); setError(null); }}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {isLoading ? (
          <ListSkeleton rows={2} />
        ) : mappings.length === 0 ? (
          <EmptyState icon={FolderGit2} title="No repositories mapped" hint="Add one so Trace2PR knows where to fix errors." />
        ) : (
          <ul className="divide-y divide-line">
            {mappings.map((m) => (
              <li key={m.id} className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3', !m.enabled && 'opacity-60')}>
                <div className="flex-1 min-w-[220px]">
                  <p className="text-sm font-mono text-ink flex items-center gap-1.5 flex-wrap">
                    {m.service} <ArrowRight className="w-3.5 h-3.5 text-muted" /> {m.repository}
                  </p>
                  <p className="text-xs text-muted font-mono mt-0.5">
                    {m.default_branch}{m.language && ` · ${m.language}`}{m.test_cmd && ` · test: ${m.test_cmd}`}
                  </p>
                </div>
                <span className="flex items-center gap-2 text-xs text-muted-strong">
                  <Switch checked={m.enabled} onChange={() => toggle(m, 'enabled')} label={`Enable ${m.service}`} /> Enabled
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-strong" title="Start a fix automatically when triage marks an error fixable">
                  <Switch checked={m.auto_fix} onChange={() => toggle(m, 'auto_fix')} label={`Auto-fix ${m.service}`} /> Auto-fix
                </span>
                <Button size="icon-sm" variant="ghost" className="hover:text-danger" onClick={() => remove(m)} aria-label={`Remove mapping for ${m.service}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
