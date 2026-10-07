import { useState } from 'react';
import { FolderGit2, Loader2, Plus, Trash2 } from 'lucide-react';
import { ApiError } from '../../api';
import type { RepoLanguage, RepoMapping, RepoMappingInput } from '../../api';
import {
  useCreateRepoMapping,
  useDeleteRepoMapping,
  useRepoMappings,
  useUpdateRepoMapping,
} from '../../hooks';
import { cn } from '../../lib/utils';

const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

const EMPTY: RepoMappingInput = {
  service: '',
  repository: '',
  default_branch: 'main',
  language: null,
  install_cmd: null,
  test_cmd: null,
  auto_fix: false,
  enabled: true,
};

const label =
  'block text-xs font-semibold text-[var(--muted-strong)] uppercase tracking-wider font-[var(--mono)] mb-2';
const input =
  'w-full bg-[var(--page-deep)] border border-[var(--line)] focus:border-[var(--acid)] rounded-lg px-3 py-2 text-[var(--ink)] font-[var(--sans)] text-sm outline-none transition-colors';

export default function RepoMappingsPanel() {
  const { data: mappings = [], isLoading } = useRepoMappings();
  const createMapping = useCreateRepoMapping();
  const updateMapping = useUpdateRepoMapping();
  const deleteMapping = useDeleteRepoMapping();

  const [form, setForm] = useState<RepoMappingInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof RepoMappingInput>(key: K, value: RepoMappingInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = async () => {
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
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed to save mapping');
    }
  };

  const toggle = (mapping: RepoMapping, key: 'enabled' | 'auto_fix') =>
    updateMapping.mutate({ id: mapping.id, data: { [key]: !mapping[key] } });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h4 className="text-[var(--ink)] font-semibold font-[var(--sans)]">Repository mappings</h4>
        <p className="text-[var(--muted)] text-sm font-[var(--sans)] mt-1">
          Tell Trace2PR which repository holds the code for each service. For Sentry, the service is
          the project slug (or numeric project ID). Unmapped errors still open incidents, but can't
          be fixed.
        </p>
      </div>

      {isLoading ? (
        <p className="text-[var(--muted)] text-sm">Loading…</p>
      ) : mappings.length === 0 ? (
        <div className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-xl p-6 text-center">
          <FolderGit2 className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-[var(--muted)] text-sm font-[var(--sans)]">No repositories mapped yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {mappings.map((m) => (
            <li
              key={m.id}
              className={cn(
                'flex flex-wrap items-center gap-3 p-3 bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg',
                !m.enabled && 'opacity-60'
              )}
            >
              <div className="flex-1 min-w-[220px]">
                <p className="text-[var(--ink)] text-sm font-[var(--mono)]">
                  {m.service} <span className="text-[var(--muted)]">→</span> {m.repository}
                </p>
                <p className="text-[var(--muted)] text-xs font-[var(--mono)] mt-0.5">
                  {m.default_branch}
                  {m.language && ` · ${m.language}`}
                  {m.test_cmd && ` · test: ${m.test_cmd}`}
                </p>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-[var(--muted-strong)] font-[var(--sans)]">
                <input type="checkbox" checked={m.enabled} onChange={() => toggle(m, 'enabled')} />
                Enabled
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[var(--muted-strong)] font-[var(--sans)]">
                <input type="checkbox" checked={m.auto_fix} onChange={() => toggle(m, 'auto_fix')} />
                Auto-fix
              </label>
              <button
                onClick={() => deleteMapping.mutate(m.id)}
                disabled={deleteMapping.isPending}
                aria-label={`Delete mapping for ${m.service}`}
                className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-6 border-t border-[var(--line)] space-y-4">
        <h5 className="text-[var(--ink)] font-semibold text-sm font-[var(--sans)]">Add a mapping</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rm-service" className={label}>Service</label>
            <input id="rm-service" className={input} placeholder="checkout-api" value={form.service}
              onChange={(e) => set('service', e.target.value)} />
          </div>
          <div>
            <label htmlFor="rm-repo" className={label}>Repository</label>
            <input id="rm-repo" className={input} placeholder="acme/checkout-api" value={form.repository}
              onChange={(e) => set('repository', e.target.value)} />
          </div>
          <div>
            <label htmlFor="rm-branch" className={label}>Default branch</label>
            <input id="rm-branch" className={input} value={form.default_branch}
              onChange={(e) => set('default_branch', e.target.value)} />
          </div>
          <div>
            <label htmlFor="rm-lang" className={label}>Language</label>
            <select id="rm-lang" className={input} value={form.language ?? ''}
              onChange={(e) => set('language', (e.target.value || null) as RepoLanguage | null)}>
              <option value="">Auto-detect</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
            </select>
          </div>
          <div>
            <label htmlFor="rm-install" className={label}>Install command (optional)</label>
            <input id="rm-install" className={input} placeholder='pip install -e ".[dev]"'
              value={form.install_cmd ?? ''} onChange={(e) => set('install_cmd', e.target.value)} />
          </div>
          <div>
            <label htmlFor="rm-test" className={label}>Test command (optional)</label>
            <input id="rm-test" className={input} placeholder="pytest -x"
              value={form.test_cmd ?? ''} onChange={(e) => set('test_cmd', e.target.value)} />
          </div>
        </div>
        {error && <p className="text-[var(--danger)] text-sm font-[var(--sans)]">{error}</p>}
        <button
          onClick={handleCreate}
          disabled={createMapping.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--acid)] text-[#091006] hover:bg-[#d1ff99] transition-colors font-bold text-sm font-[var(--sans)] disabled:opacity-50"
        >
          {createMapping.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add mapping
        </button>
      </div>
    </div>
  );
}
