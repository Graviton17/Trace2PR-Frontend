import { Bot, Terminal, Wrench } from 'lucide-react';
import type { TranscriptTurn } from '../../api';
import { cn } from '../../lib/utils';

function summarizeInput(input: Record<string, unknown>): string {
  const path = typeof input.path === 'string' ? input.path : '';
  const command = typeof input.command === 'string' ? input.command : '';
  const pattern = typeof input.pattern === 'string' ? input.pattern : '';
  return command || [path, pattern].filter(Boolean).join(' ') || '';
}

export function TranscriptView({ turns }: { turns: TranscriptTurn[] }) {
  if (turns.length === 0) {
    return <p className="text-sm text-muted">No transcript yet.</p>;
  }
  return (
    <ol className="space-y-2.5 max-h-[520px] overflow-y-auto scroll-thin pr-1">
      {turns.map((turn, i) => {
        if (turn.role === 'system') {
          return <li key={i} className="text-[11px] uppercase tracking-wider text-muted font-mono pt-2">{turn.content}</li>;
        }
        if (turn.role === 'tool') {
          return (
            <li key={i} className="flex gap-2">
              <Terminal className={cn('w-4 h-4 shrink-0 mt-0.5', turn.is_error ? 'text-danger' : 'text-muted')} aria-label="tool output" />
              <pre className="flex-1 min-w-0 text-[11px] leading-4 font-mono text-muted-strong whitespace-pre-wrap break-words bg-page-deep border border-line rounded-md p-2 max-h-40 overflow-y-auto scroll-thin">
                {turn.content}
              </pre>
            </li>
          );
        }
        return (
          <li key={i} className="flex gap-2">
            <Bot className="w-4 h-4 shrink-0 mt-0.5 text-acid" aria-label="agent" />
            <div className="flex-1 min-w-0 space-y-1">
              {turn.content && <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{turn.content}</p>}
              {(turn.tool_calls ?? []).map((call, j) => (
                <p key={j} className="flex items-center gap-1.5 text-xs font-mono text-muted-strong min-w-0">
                  <Wrench className="w-3.5 h-3.5 text-cyan shrink-0" />
                  <span className="text-cyan shrink-0">{call.name}</span>
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
