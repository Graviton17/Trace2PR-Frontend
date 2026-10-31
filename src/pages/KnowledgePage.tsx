import { useState } from 'react';
import { BookOpen, Search, ThumbsDown, ThumbsUp, Wrench, X } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState, ErrorState, ListSkeleton } from '../components/common/StateViews';
import { Button } from '../components/ui/button';
import { Card, CardHeader } from '../components/ui/card';
import { errorMessage, useFeedback } from '../components/ui/feedback';
import { useKnowledgeSearch, useKnowledgeStats, usePastFixes, usePastIncidents, useSubmitKnowledgeFeedback } from '../hooks';
import { timeAgo } from '../lib/time';

interface ItemProps {
  id: string;
  type: 'incidents' | 'fixes';
  title: string;
  body: string;
  createdAt: string;
  score: number | null;
}

function KnowledgeItem({ id, type, title, body, createdAt, score }: ItemProps) {
  const feedback = useSubmitKnowledgeFeedback();
  const { toast } = useFeedback();
  const [voted, setVoted] = useState<boolean | null>(null);

  const vote = (helpful: boolean) => feedback.mutate({ itemId: id, itemType: type, helpful }, {
    onSuccess: () => { setVoted(helpful); toast('Thanks, feedback saved.'); },
    onError: (e) => toast(errorMessage(e), 'error'),
  });

  return (
    <li className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-ink leading-snug">{title}</p>
        <span className="text-xs text-muted font-mono whitespace-nowrap">
          {score != null && <span className="text-acid mr-2">{Math.round(score * 100)}% match</span>}
          {timeAgo(createdAt)}
        </span>
      </div>
      <p className="text-sm text-muted-strong mt-1.5 line-clamp-3 leading-relaxed whitespace-pre-wrap">{body}</p>
      <div className="flex items-center gap-1 mt-2 -ml-2">
        <span className="text-xs text-muted px-2">Helpful?</span>
        <Button size="icon-sm" variant="ghost" aria-label="Helpful" aria-pressed={voted === true}
          className={voted === true ? 'text-acid' : 'hover:text-acid'} onClick={() => vote(true)}>
          <ThumbsUp className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Not helpful" aria-pressed={voted === false}
          className={voted === false ? 'text-danger' : 'hover:text-danger'} onClick={() => vote(false)}>
          <ThumbsDown className="w-3.5 h-3.5" />
        </Button>
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

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) search.mutate({ query: query.trim(), limit: 10 });
  };
  const clear = () => { setQuery(''); search.reset(); };

  const searching = search.data !== undefined;
  const incidentItems = searching ? search.data.incidents : incidents.data ?? [];
  const fixItems = searching ? search.data.fixes : fixes.data ?? [];
  const isLoading = incidents.isLoading || fixes.isLoading;
  const error = incidents.error ?? fixes.error;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Knowledge"
        description={stats
          ? `What Trace2PR learned from ${stats.total_incidents_indexed} resolved incidents and ${stats.total_fixes_indexed} merged fixes. Future fixes use it.`
          : 'Past incidents and fixes that inform future fixes.'}
      />

      <form onSubmit={submitSearch} className="flex gap-2 mb-5" role="search">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" aria-hidden />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (!e.target.value) search.reset(); }}
            placeholder="Describe an error, e.g. “KeyError on cart summary”"
            aria-label="Search past incidents and fixes"
            className="w-full h-10 rounded-lg border border-line bg-surface pl-9 pr-9 text-sm text-ink placeholder:text-muted/70 outline-none focus-visible:outline-none focus:border-acid/60 focus:ring-2 focus:ring-acid/15"
          />
          {query && (
            <button type="button" onClick={clear} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted hover:text-ink">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="primary" size="lg" className="h-10" loading={search.isPending} disabled={!query.trim()}>Search</Button>
      </form>

      {searching && (
        <p className="text-sm text-muted mb-4">
          {incidentItems.length + fixItems.length} results for “{query}” · <button onClick={clear} className="text-acid hover:underline">show all</button>
        </p>
      )}

      {error ? (
        <ErrorState error={error} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <Card className="overflow-hidden">
            <CardHeader title="Past incidents" icon={<BookOpen className="w-4 h-4" />} description="How each one was resolved" />
            {isLoading ? <ListSkeleton rows={3} /> : incidentItems.length === 0 ? (
              <EmptyState title={searching ? 'No matching incidents' : 'Nothing here yet'} hint={!searching ? 'Resolved incidents are added automatically.' : undefined} />
            ) : (
              <ul className="divide-y divide-line border-t border-line">
                {incidentItems.map((i) => (
                  <KnowledgeItem key={i.id} id={i.id} type="incidents" title={i.title} body={i.resolution_summary} createdAt={i.created_at} score={i.similarity_score} />
                ))}
              </ul>
            )}
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title="Past fixes" icon={<Wrench className="w-4 h-4" />} description="Merged changes and what they touched" />
            {isLoading ? <ListSkeleton rows={3} /> : fixItems.length === 0 ? (
              <EmptyState title={searching ? 'No matching fixes' : 'Nothing here yet'} hint={!searching ? 'Merged fixes are added automatically.' : undefined} />
            ) : (
              <ul className="divide-y divide-line border-t border-line">
                {fixItems.map((f) => (
                  <KnowledgeItem key={f.id} id={f.id} type="fixes" title={f.description} body={f.diff_summary} createdAt={f.created_at} score={f.similarity_score} />
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
