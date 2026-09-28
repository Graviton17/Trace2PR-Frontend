import { useState } from 'react';
import { Search, ThumbsDown, ThumbsUp } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/common/StateViews';
import {
  useKnowledgeSearch,
  useKnowledgeStats,
  usePastFixes,
  usePastIncidents,
  useSubmitKnowledgeFeedback,
} from '../hooks';
import { timeAgo } from '../lib/time';

const card = 'bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4';

interface ItemProps {
  id: string;
  type: 'incidents' | 'fixes';
  title: string;
  body: string;
  createdAt: string;
  onFeedback: (id: string, type: string, helpful: boolean) => void;
}

function KnowledgeItem({ id, type, title, body, createdAt, onFeedback }: ItemProps) {
  return (
    <li className={card}>
      <div className="flex justify-between gap-4">
        <p className="text-[var(--ink)] font-semibold text-sm font-[var(--sans)]">{title}</p>
        <span className="text-[var(--muted)] text-xs font-[var(--mono)] whitespace-nowrap">{timeAgo(createdAt)}</span>
      </div>
      <p className="text-[var(--muted-strong)] text-sm mt-2 line-clamp-3 font-[var(--sans)]">{body}</p>
      <div className="flex gap-3 mt-3 text-[var(--muted)]">
        <button aria-label="Helpful" onClick={() => onFeedback(id, type, true)} className="hover:text-[var(--acid)]">
          <ThumbsUp className="w-4 h-4" />
        </button>
        <button aria-label="Not helpful" onClick={() => onFeedback(id, type, false)} className="hover:text-[var(--danger)]">
          <ThumbsDown className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
}

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const incidents = usePastIncidents();
  const fixes = usePastFixes();
  const { data: stats } = useKnowledgeStats();
  const search = useKnowledgeSearch();
  const feedback = useSubmitKnowledgeFeedback();

  const onFeedback = (itemId: string, itemType: string, helpful: boolean) =>
    feedback.mutate({ itemId, itemType, helpful });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) search.mutate({ query: query.trim(), limit: 10 });
  };

  const searching = search.data !== undefined;
  const incidentItems = searching ? search.data.incidents : incidents.data ?? [];
  const fixItems = searching ? search.data.fixes : fixes.data ?? [];
  const isLoading = incidents.isLoading || fixes.isLoading;
  const error = incidents.error ?? fixes.error;

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <PageHeader
        title="Knowledge Base"
        description={
          stats
            ? `${stats.total_incidents_indexed} incidents and ${stats.total_fixes_indexed} fixes indexed`
            : 'Past incidents and fixes'
        }
      />

      <form onSubmit={submitSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (!e.target.value) search.reset(); }}
            placeholder="Search past incidents and fixes"
            className="w-full bg-[var(--surface-raised)] border border-[var(--line)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--ink)]"
          />
        </div>
        <button
          type="submit"
          disabled={search.isPending}
          className="px-4 py-2 rounded-lg bg-[var(--acid)] text-[#091006] text-sm font-bold disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <h2 className="text-[var(--ink)] font-semibold mb-3 font-[var(--sans)]">Past incidents</h2>
            {incidentItems.length === 0 ? (
              <EmptyState title="Nothing here yet" />
            ) : (
              <ul className="space-y-3">
                {incidentItems.map((i) => (
                  <KnowledgeItem key={i.id} id={i.id} type="incidents" title={i.title} body={i.resolution_summary} createdAt={i.created_at} onFeedback={onFeedback} />
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="text-[var(--ink)] font-semibold mb-3 font-[var(--sans)]">Past fixes</h2>
            {fixItems.length === 0 ? (
              <EmptyState title="Nothing here yet" />
            ) : (
              <ul className="space-y-3">
                {fixItems.map((f) => (
                  <KnowledgeItem key={f.id} id={f.id} type="fixes" title={f.description} body={f.diff_summary} createdAt={f.created_at} onFeedback={onFeedback} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
