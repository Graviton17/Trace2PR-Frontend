import { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode2, FlaskConical } from 'lucide-react';
import type { DiffResponse } from '../../api';
import { cn } from '../../lib/utils';

const TEST_PATH = /(^|\/)(tests?|__tests__|spec|src\/test)\/|(^|\/)test_[^/]+\.py$|_test\.py$|\.(test|spec)\.[jt]sx?$|(Test|Tests|IT)\.(java|kt)$/;

function lineClass(line: string): string {
  if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff --git') || line.startsWith('index ')) {
    return 'text-[var(--muted)]';
  }
  if (line.startsWith('@@')) return 'text-[var(--cyan)]';
  if (line.startsWith('+')) return 'text-[var(--acid)] bg-[var(--acid)]/5';
  if (line.startsWith('-')) return 'text-[var(--danger)] bg-[var(--danger)]/5';
  return 'text-[var(--muted-strong)]';
}

export default function DiffViewer({ diff }: { diff: DiffResponse }) {
  const [open, setOpen] = useState<Record<string, boolean>>(
    () => Object.fromEntries(diff.files.map((f) => [f.file_path, true])),
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--muted)] font-[var(--mono)]">
        {diff.files.length} file(s) ·{' '}
        <span className="text-[var(--acid)]">+{diff.total_additions}</span>{' '}
        <span className="text-[var(--danger)]">−{diff.total_deletions}</span>
      </p>
      {diff.files.map((file) => {
        const isOpen = open[file.file_path];
        const Icon = TEST_PATH.test(file.file_path) ? FlaskConical : FileCode2;
        return (
          <div key={file.file_path} className="border border-[var(--line)] rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen((o) => ({ ...o, [file.file_path]: !isOpen }))}
              className="w-full flex items-center gap-2 px-3 py-2 bg-[var(--surface-raised)] text-left"
            >
              {isOpen ? <ChevronDown className="w-4 h-4 text-[var(--muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--muted)]" />}
              <Icon className="w-4 h-4 text-[var(--muted)]" />
              <span className="flex-1 text-xs font-[var(--mono)] text-[var(--ink)] truncate">{file.file_path}</span>
              <span className="text-xs font-[var(--mono)] text-[var(--acid)]">+{file.additions}</span>
              <span className="text-xs font-[var(--mono)] text-[var(--danger)]">−{file.deletions}</span>
            </button>
            {isOpen && (
              <pre className="text-[12px] leading-5 font-[var(--mono)] overflow-x-auto max-h-[420px] bg-[var(--page-deep)]">
                {file.diff.split('\n').map((line, i) => (
                  <div key={i} className={cn('px-3 whitespace-pre', lineClass(line))}>
                    {line || ' '}
                  </div>
                ))}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}
