import { Bot, Terminal, Wrench } from 'lucide-react';
import type { TranscriptTurn } from '../../api';
import { cn } from '../../lib/utils';

function summarizeInput(input: Record<string, unknown>): string {
  const path = typeof input.path === 'string' ? input.path : '';
  const command = typeof input.command === 'string' ? input.command : '';
  const pattern = typeof input.pattern === 'string' ? input.pattern : '';
  return command || [path, pattern].filter(Boolean).join(' ') || '';
}

export default function TranscriptView({ turns }: { turns: TranscriptTurn[] }) {
  if (turns.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No transcript yet.</p>;
  }
  return (
    <ol className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
      {turns.map((turn, i) => {
        if (turn.role === 'system') {
          return (
            <li key={i} className="text-[11px] uppercase tracking-wider text-[var(--muted)] font-[var(--mono)] pt-2">
              {turn.content}
            </li>
          );
        }
        if (turn.role === 'tool') {
          return (
            <li key={i} className="flex gap-2">
              <Terminal className={cn('w-4 h-4 shrink-0 mt-0.5', turn.is_error ? 'text-[var(--danger)]' : 'text-[var(--muted)]')} />
              <pre className="flex-1 text-[11px] leading-4 font-[var(--mono)] text-[var(--muted-strong)] whitespace-pre-wrap break-words bg-[var(--page-deep)] rounded-md p-2 max-h-40 overflow-y-auto">
                {turn.content}
              </pre>
            </li>
          );
        }
        return (
          <li key={i} className="flex gap-2">
            <Bot className="w-4 h-4 shrink-0 mt-0.5 text-[var(--acid)]" />
            <div className="flex-1 space-y-1">
              {turn.content && (
                <p className="text-sm text-[var(--ink)] whitespace-pre-wrap font-[var(--sans)]">{turn.content}</p>
              )}
              {(turn.tool_calls ?? []).map((call, j) => (
                <p key={j} className="flex items-center gap-1.5 text-xs font-[var(--mono)] text-[var(--muted-strong)]">
                  <Wrench className="w-3.5 h-3.5 text-[var(--cyan)]" />
                  <span className="text-[var(--cyan)]">{call.name}</span>
                  <span className="truncate">{summarizeInput(call.input)}</span>
                </p>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
