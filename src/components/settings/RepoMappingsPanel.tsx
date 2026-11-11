import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Activity, AlertTriangle, ArrowRight, ChevronRight, Cloud, ExternalLink, FolderGit2, GitBranch, Lock, Pencil, Plus,
  RefreshCw, Shield, ShieldAlert, Trash2,
} from 'lucide-react';
import type { GitHubBranch, GitHubRepo, MappingSource, MonitoredService, RepoLanguage, RepoMapping, RepoMappingInput } from '../../api';
import {
  useCreateRepoMapping, useDeleteRepoMapping, useGitHubBranches, useGitHubRepos, useIntegrations, useMonitoredServices,
  useRepoMappings, useUpdateRepoMapping,
} from '../../hooks';
import { SERVICE_KEY_HELP } from '../../lib/integrations';
import { timeAgo } from '../../lib/time';
import { cn } from '../../lib/utils';
import { EmptyState, ListSkeleton } from '../common/StateViews';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Combobox } from '../ui/combobox';
import { errorMessage, useFeedback } from '../ui/feedback';
import { Field, Input, Select, Switch } from '../ui/input';

const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const INTEGRATIONS_PATH = '/dashboard/settings/integrations';

/** GitHub's primary-language name → the sandbox language, when supported. */
const GITHUB_LANGUAGES: Record<string, RepoLanguage> = {
  Python: 'python', JavaScript: 'javascript', TypeScript: 'typescript', Java: 'java',
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** The repo a service most likely lives in: same name, else a name containing it. */
function suggestRepo(service: string, repos: GitHubRepo[]): GitHubRepo | undefined {
  const name = slugify(service);
  const repoName = (r: GitHubRepo) => slugify(r.full_name.split('/')[1]);
  return repos.find((r) => repoName(r) === name)
    ?? repos.find((r) => repoName(r).includes(name) || name.includes(repoName(r)));
}

/** Monitoring tools whose projects/services are listed for linking, in page order. */
const TOOLS: { id: Exclude<MappingSource, 'sdk'>; title: string; noun: string; icon: LucideIcon; createLabel: string }[] = [
  { id: 'sentry', title: 'Sentry projects', noun: 'project', icon: ShieldAlert, createLabel: 'Create a project in Sentry' },
  { id: 'datadog', title: 'Datadog services', noun: 'service', icon: Activity, createLabel: 'Open the Datadog service catalog' },
  { id: 'cloudwatch', title: 'CloudWatch', noun: 'alarm', icon: Cloud, createLabel: 'Create an alarm in CloudWatch' },
];

const SOURCE_LABELS: Record<MappingSource, string> = { sentry: 'Sentry', datadog: 'Datadog', cloudwatch: 'CloudWatch', sdk: 'SDK' };

/** The mapping an error from `source` named `key` uses: one for that tool, else one for any tool. */
function mappingFor(mappings: RepoMapping[], source: MappingSource, key: string) {
  return mappings.find((m) => m.service === key && m.source === source)
    ?? mappings.find((m) => m.service === key && !m.source);
}

export function RepoMappingsPanel() {
  const { data: mappings = [], isLoading } = useRepoMappings();
  const { data: integrations = [] } = useIntegrations();
  const connected = (service: string) => integrations.some((i) => i.service === service && i.status === 'connected');
  const githubConnected = connected('github');
  // One query per tool (a fixed set, so hooks stay unconditional).
  const lists = {
    sentry: useMonitoredServices('sentry', connected('sentry')),
    datadog: useMonitoredServices('datadog', connected('datadog')),
    cloudwatch: useMonitoredServices('cloudwatch', connected('cloudwatch')),
  };
  const shown = TOOLS.filter((t) => connected(t.id));

  // Which row's form is open: '<tool>:<key>', 'edit:<mapping id>', or 'new'.
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));

  // Mappings that some section displays; the rest are listed under Other services.
  const displayed = new Set<string>();
  for (const tool of shown) {
    for (const item of lists[tool.id].data?.items ?? []) {
      const m = mappingFor(mappings, tool.id, item.key);
      if (m) displayed.add(m.id);
    }
  }
  const others = mappings.filter((m) => !displayed.has(m.id));

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted max-w-3xl">
        Link what each monitoring tool reports (Sentry projects, Datadog services, CloudWatch alarms) to the repository
        that holds its code. Errors from unlinked services still open incidents, but can't be fixed.
      </p>

      {!githubConnected && (
        <Notice>
          <Link className="text-acid hover:underline" to={INTEGRATIONS_PATH}>Connect GitHub</Link> to pick from your repositories and branches.
        </Notice>
      )}
      {shown.length === 0 && (
        <Notice>
          <Link className="text-acid hover:underline" to={INTEGRATIONS_PATH}>Connect Sentry, Datadog or CloudWatch</Link> to
          list their projects and services here, ready to link.
        </Notice>
      )}

      {shown.map((tool) => {
        const query = lists[tool.id];
        const items = query.data?.items ?? [];
        const linked = items.filter((i) => mappingFor(mappings, tool.id, i.key)).length;
        const account = query.data?.accounts.length ? query.data.accounts.join(', ') : null;
        return (
          <section key={tool.id} className="space-y-3" aria-labelledby={`rm-${tool.id}`}>
            <div className="flex flex-wrap items-center gap-3">
              <tool.icon className="w-4 h-4 text-muted-strong" />
              <h3 id={`rm-${tool.id}`} className="text-sm font-semibold text-ink">{tool.title}</h3>
              {query.isSuccess && (
                <span className="text-xs text-muted">
                  {account && <span className="font-mono">{account} · </span>}{linked} of {items.length} linked
                </span>
              )}
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => query.refetch()} disabled={query.isFetching}
                aria-label={`Refresh ${tool.title}`}>
                <RefreshCw className={cn('w-3.5 h-3.5', query.isFetching && 'animate-spin')} /> Refresh
              </Button>
            </div>
            <Card className="overflow-hidden">
              {query.isLoading || isLoading ? (
                <ListSkeleton rows={2} />
              ) : query.isError ? (
                <div className="p-4 text-sm text-danger flex flex-wrap items-center gap-3">
                  Couldn't load {tool.title}: {errorMessage(query.error)}
                  <Button size="sm" onClick={() => query.refetch()}>Retry</Button>
                </div>
              ) : items.length === 0 ? (
                <EmptyState icon={tool.icon} title={`No ${tool.noun}s${account ? ` in ${account}` : ''} yet`}
                  hint={`${tool.title.split(' ')[0]} hasn't reported any ${tool.noun}s. Add one there, then refresh.`}
                  action={query.data?.create_url ? (
                    <a href={query.data.create_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-acid hover:underline">
                      {tool.createLabel} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : undefined} />
              ) : (
                <ul className="divide-y divide-line">
                  {items.map((item) => {
                    const mapping = mappingFor(mappings, tool.id, item.key);
                    const rowId = `${tool.id}:${item.key}`;
                    return (
                      <li key={`${item.group ?? ''}/${item.key}`}>
                        <ServiceRow item={item} mapping={mapping} onEdit={() => toggle(rowId)}
                          onLink={() => setOpen(rowId)} linking={open === rowId} />
                        {open === rowId && (
                          <div className="px-4 pb-4">
                            <MappingForm service={item.key} source={tool.id} mapping={mapping}
                              githubConnected={githubConnected} onDone={() => setOpen(null)} />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </section>
        );
      })}

      {/* ----- names typed by hand: the SDK, or services a tool doesn't list ----- */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <h3 className="text-sm font-semibold text-ink">Other services</h3>
            <p className="text-xs text-muted mt-0.5">Services from the Trace2PR SDK, or names a tool reports that aren't listed above.</p>
          </div>
          {open !== 'new' && <Button size="sm" onClick={() => setOpen('new')}><Plus className="w-3.5 h-3.5" /> Add service</Button>}
        </div>
        {open === 'new' && (
          <Card className="p-4">
            <MappingForm githubConnected={githubConnected} onDone={() => setOpen(null)} />
          </Card>
        )}
        {isLoading ? (
          <Card><ListSkeleton rows={2} /></Card>
        ) : others.length > 0 ? (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-line">
              {others.map((m) => (
                <li key={m.id}>
                  <div className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3', !m.enabled && 'opacity-60')}>
                    <div className="flex-1 min-w-[220px]">
                      <p className="text-sm font-mono text-ink flex items-center gap-1.5 flex-wrap">
                        {m.service} <ArrowRight className="w-3.5 h-3.5 text-muted" /> {m.repository}
                        <Badge>{m.source ? SOURCE_LABELS[m.source] : 'any tool'}</Badge>
                      </p>
                      <p className="text-xs text-muted font-mono mt-0.5">
                        {m.default_branch}{m.language && ` · ${m.language}`}{m.test_cmd && ` · test: ${m.test_cmd}`}
                      </p>
                    </div>
                    <MappingControls mapping={m} onEdit={() => toggle(`edit:${m.id}`)} />
                  </div>
                  {open === `edit:${m.id}` && (
                    <div className="px-4 pb-4">
                      <MappingForm service={m.service} mapping={m} githubConnected={githubConnected} onDone={() => setOpen(null)} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ) : open !== 'new' && (
          <p className="text-xs text-muted">None yet.</p>
        )}
      </section>
    </div>
  );
}

function ServiceRow({ item, mapping, onEdit, onLink, linking }: {
  item: MonitoredService; mapping?: RepoMapping; onEdit: () => void; onLink: () => void; linking: boolean;
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3', mapping && !mapping.enabled && 'opacity-60')}>
      <div className="flex-1 min-w-[220px]">
        <p className="text-sm text-ink flex items-center gap-1.5 flex-wrap">
          <span className="font-medium">{item.name}</span>
          {item.name !== item.key && <span className="font-mono text-xs text-muted">{item.key}</span>}
          {item.detail && <Badge>{item.detail}</Badge>}
        </p>
        {mapping ? (
          <p className="text-xs text-muted font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
            <ArrowRight className="w-3 h-3" /> <span className="text-muted-strong">{mapping.repository}</span>
            <GitBranch className="w-3 h-3 ml-1" /> {mapping.default_branch}
            {mapping.language && ` · ${mapping.language}`}{mapping.test_cmd && ` · test: ${mapping.test_cmd}`}
          </p>
        ) : (
          <p className="text-xs text-warning mt-0.5">
            Not linked: errors from it can't be fixed.{' '}
            <span className="text-muted">Service key will be <span className="font-mono text-ink">{item.key}</span>.</span>
          </p>
        )}
      </div>
      {mapping ? (
        <MappingControls mapping={mapping} onEdit={onEdit} />
      ) : !linking && (
        <Button size="sm" variant="subtle" onClick={onLink}>Link repository</Button>
      )}
    </div>
  );
}

// ----- row controls -----

function MappingControls({ mapping: m, onEdit }: { mapping: RepoMapping; onEdit: () => void }) {
  const updateMapping = useUpdateRepoMapping();
  const deleteMapping = useDeleteRepoMapping();
  const { toast, confirm } = useFeedback();

  const toggle = (key: 'enabled' | 'auto_fix') =>
    updateMapping.mutate({ id: m.id, data: { [key]: !m[key] } }, { onError: (e) => toast(errorMessage(e), 'error') });

  const remove = async () => {
    if (!await confirm({ title: `Unlink ${m.service}?`, description: `Errors from ${m.service} will no longer be fixed in ${m.repository}.`, confirmLabel: 'Unlink', danger: true })) return;
    deleteMapping.mutate(m.id, { onSuccess: () => toast('Repository unlinked.'), onError: (e) => toast(errorMessage(e), 'error') });
  };

  return (
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-2 text-xs text-muted-strong">
        <Switch checked={m.enabled} onChange={() => toggle('enabled')} label={`Enable ${m.service}`} /> Enabled
      </span>
      <span className="flex items-center gap-2 text-xs text-muted-strong" title="Start a fix automatically when triage marks an error fixable">
        <Switch checked={m.auto_fix} onChange={() => toggle('auto_fix')} label={`Auto-fix ${m.service}`} /> Auto-fix
      </span>
      <span className="flex items-center">
        <Button size="icon-sm" variant="ghost" onClick={onEdit} aria-label={`Change repository for ${m.service}`}><Pencil className="w-4 h-4" /></Button>
        <Button size="icon-sm" variant="ghost" className="hover:text-danger" onClick={remove} aria-label={`Unlink ${m.service}`}><Trash2 className="w-4 h-4" /></Button>
      </span>
    </div>
  );
}

// ----- link / edit form -----

/** Links a service to a repository. With `service`, the service is fixed (a Sentry
 *  project or an existing mapping); without it, the user names one. */
function MappingForm({ service: fixedService, source: fixedSource, mapping, githubConnected, onDone }: {
  service?: string; source?: MappingSource; mapping?: RepoMapping; githubConnected: boolean; onDone: () => void;
}) {
  const createMapping = useCreateRepoMapping();
  const updateMapping = useUpdateRepoMapping();
  const { toast } = useFeedback();
  const reposQuery = useGitHubRepos(githubConnected);
  const repos = reposQuery.data ?? [];

  const [service, setService] = useState(fixedService ?? '');
  // Linking from a tool's section records that tool; typed names choose one (or any).
  const [source, setSource] = useState<MappingSource | null>(fixedSource ?? mapping?.source ?? null);
  const [repoText, setRepoText] = useState(mapping?.repository ?? '');
  const [branch, setBranch] = useState(mapping?.default_branch ?? '');
  const [language, setLanguage] = useState<RepoLanguage | null>(mapping?.language ?? null);
  const [installCmd, setInstallCmd] = useState(mapping?.install_cmd ?? '');
  const [testCmd, setTestCmd] = useState(mapping?.test_cmd ?? '');
  const [advanced, setAdvanced] = useState(Boolean(mapping?.language || mapping?.install_cmd || mapping?.test_cmd));
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(Boolean(mapping));

  // New Sentry links start on the repo whose name matches the project, once repos load.
  const suggestion = !touched && fixedService ? suggestRepo(fixedService, repos) : undefined;
  const repository = touched ? repoText : suggestion?.full_name ?? '';
  const selectedRepo = repos.find((r) => r.full_name === repository);
  const branchValue = touched || branch ? branch : selectedRepo?.default_branch ?? '';
  const validRepo = REPO_PATTERN.test(repository.trim());
  const branches = useGitHubBranches(githubConnected && selectedRepo ? selectedRepo.full_name : null);
  const detected = selectedRepo?.language ? GITHUB_LANGUAGES[selectedRepo.language] : undefined;

  const pickRepo = (repo: GitHubRepo) => {
    setTouched(true);
    setRepoText(repo.full_name);
    setBranch(repo.default_branch);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!service.trim()) return setError('Name the service your monitoring tool reports.');
    if (!validRepo) return setError("Repository must look like 'owner/repo'.");
    const data: RepoMappingInput = {
      service: service.trim(),
      source,
      repository: repository.trim(),
      default_branch: branchValue.trim() || 'main',
      language,
      install_cmd: installCmd.trim() || null,
      test_cmd: testCmd.trim() || null,
      auto_fix: mapping?.auto_fix ?? false,
      enabled: mapping?.enabled ?? true,
    };
    try {
      if (mapping) await updateMapping.mutateAsync({ id: mapping.id, data });
      else await createMapping.mutateAsync(data);
      toast(`${data.service} → ${data.repository} ${mapping ? 'updated' : 'linked'}.`);
      onDone();
    } catch (err) {
      setError(errorMessage(err, 'Failed to save'));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-line bg-page-deep/40 p-4">
      {!fixedService && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Service"
            htmlFor="rm-service"
            hint={
              source && SERVICE_KEY_HELP[source]
                ? <>Must be {SERVICE_KEY_HELP[source]}.</>
                : 'The service name errors arrive with — must match exactly.'
            }
          >
            <Input id="rm-service" mono placeholder="checkout-api" value={service} onChange={(e) => setService(e.target.value)} autoFocus />
          </Field>
          <Field label="From" htmlFor="rm-source" hint="Only errors from this tool use the link.">
            <Select id="rm-source" value={source ?? ''} onChange={(e) => setSource((e.target.value || null) as MappingSource | null)}>
              <option value="">Any tool</option>
              <option value="sdk">Trace2PR SDK</option>
              <option value="sentry">Sentry</option>
              <option value="datadog">Datadog</option>
              <option value="cloudwatch">CloudWatch</option>
            </Select>
          </Field>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Repository" htmlFor="rm-repo"
          hint={reposQuery.isError ? <span className="text-danger">Couldn't list repositories: {errorMessage(reposQuery.error)}</span>
            : suggestion && !touched ? 'Suggested from the project name.'
            : githubConnected && reposQuery.isSuccess ? (
              <>{repos.length} repositories · <button type="button" className="text-acid hover:underline" onClick={() => reposQuery.refetch()}>Refresh</button></>
            ) : undefined}>
          <Combobox<GitHubRepo>
            id="rm-repo"
            items={repos}
            value={repository}
            onSelect={pickRepo}
            allowCustom
            onInputChange={(text) => { setTouched(true); setRepoText(text); setBranch(''); }}
            itemKey={(r) => r.full_name}
            itemText={(r) => r.full_name}
            itemSearchText={(r) => r.description ?? ''}
            renderItem={(r) => <RepoOption repo={r} />}
            loading={reposQuery.isFetching}
            loadingText="Loading your repositories…"
            emptyText={githubConnected ? 'No matching repositories' : 'GitHub not connected'}
            placeholder={githubConnected ? 'Search repositories' : 'owner/repo'}
            mono
          />
        </Field>
        <Field label="Branch" htmlFor="rm-branch" hint="Fixes are based on, and PRs opened against, this branch.">
          <Combobox<GitHubBranch>
            id="rm-branch"
            items={branches.data ?? []}
            value={branchValue}
            onSelect={(b) => setBranch(b.name)}
            allowCustom
            onInputChange={setBranch}
            itemKey={(b) => b.name}
            itemText={(b) => b.name}
            renderItem={(b) => (
              <span className="flex items-center gap-2 font-mono text-sm">
                {b.name}
                {b.name === selectedRepo?.default_branch && <Badge>default</Badge>}
                {b.protected && <Shield className="w-3.5 h-3.5 text-muted" aria-label="protected" />}
              </span>
            )}
            loading={branches.isFetching}
            loadingText="Loading branches…"
            emptyText={selectedRepo ? 'No matching branches' : 'Pick a repository first'}
            placeholder="main"
            leading={<GitBranch className="w-4 h-4" />}
            disabled={!validRepo}
            mono
          />
        </Field>
      </div>

      <div>
        <button type="button" onClick={() => setAdvanced((a) => !a)} aria-expanded={advanced}
          className="text-xs font-medium text-muted-strong hover:text-ink flex items-center gap-1">
          <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', advanced && 'rotate-90')} />
          Advanced: language, install and test commands
        </button>
        {advanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <Field label="Language" htmlFor="rm-lang">
              <Select id="rm-lang" value={language ?? ''} onChange={(e) => setLanguage((e.target.value || null) as RepoLanguage | null)}>
                <option value="">Auto-detect{detected ? ` (${selectedRepo?.language})` : ''}</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java</option>
              </Select>
            </Field>
            <Field label="Install command" htmlFor="rm-install" hint="Detected from the repo when empty.">
              <Input id="rm-install" mono placeholder='pip install -e ".[dev]"' value={installCmd} onChange={(e) => setInstallCmd(e.target.value)} />
            </Field>
            <Field label="Test command" htmlFor="rm-test" hint="Detected from the repo when empty.">
              <Input id="rm-test" mono placeholder="pytest -x" value={testCmd} onChange={(e) => setTestCmd(e.target.value)} />
            </Field>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" loading={createMapping.isPending || updateMapping.isPending} disabled={!validRepo || !service.trim()}>
          {mapping ? 'Save changes' : 'Link repository'}
        </Button>
        <Button variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}

// ----- small pieces -----

function RepoOption({ repo }: { repo: GitHubRepo }) {
  return (
    <span className="flex items-center gap-2.5 min-w-0">
      {repo.owner_avatar_url
        ? <img src={repo.owner_avatar_url} alt="" className="w-5 h-5 rounded-full shrink-0" loading="lazy" />
        : <FolderGit2 className="w-4 h-4 text-muted shrink-0" />}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="font-mono text-sm text-ink truncate">{repo.full_name}</span>
          {repo.private && <Lock className="w-3 h-3 text-muted shrink-0" aria-label="private" />}
        </span>
        {repo.description && <span className="block text-xs text-muted truncate">{repo.description}</span>}
      </span>
      <span className="text-[11px] text-muted whitespace-nowrap shrink-0 text-right">
        {repo.language && <span className="block">{repo.language}</span>}
        {repo.pushed_at && <span className="block">{timeAgo(repo.pushed_at)}</span>}
      </span>
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] uppercase font-mono text-muted border border-line rounded px-1.5 py-px">{children}</span>;
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-strong flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
      <AlertTriangle className="w-4 h-4 text-warning shrink-0" /> <span>{children}</span>
    </p>
  );
}
