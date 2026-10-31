import { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode2, FlaskConical } from 'lucide-react';
import type { DiffResponse } from '../../api';
import { cn } from '../../lib/utils';

const TEST_PATH = /(^|\/)(tests?|__tests__|spec|src\/test)\/|(^|\/)test_[^/]+\.py$|_test\.py$|\.(test|spec)\.[jt]sx?$|(Test|Tests|IT)\.(java|kt)$/;

function lineClass(line: string): string {
  if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff --git') || line.startsWith('index ')) {
    return 'text-muted';
  }
  if (line.startsWith('@@')) return 'text-cyan bg-cyan/5';
  if (line.startsWith('+')) return 'text-acid bg-acid/[0.07]';
  if (line.startsWith('-')) return 'text-danger bg-danger/[0.07]';
  return 'text-muted-strong';
}

export function DiffViewer({ diff }: { diff: DiffResponse }) {
  const [open, setOpen] = useState<Record<string, boolean>>(
    () => Object.fromEntries(diff.files.map((f) => [f.file_path, true])),
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted font-mono">
        {diff.files.length} file{diff.files.length === 1 ? '' : 's'} changed ·{' '}
        <span className="text-acid">+{diff.total_additions}</span>{' '}
        <span className="text-danger">−{diff.total_deletions}</span>
      </p>
      {diff.files.map((file) => {
        const isOpen = open[file.file_path];
        const isTest = TEST_PATH.test(file.file_path);
        const Icon = isTest ? FlaskConical : FileCode2;
        return (
          <div key={file.file_path} className="border border-line rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen((o) => ({ ...o, [file.file_path]: !isOpen }))}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-2 px-3 h-9 bg-raised hover:bg-hover text-left transition-colors"
            >
              {isOpen ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
              <Icon className={cn('w-4 h-4', isTest ? 'text-cyan' : 'text-muted')} aria-label={isTest ? 'test file' : 'source file'} />
              <span className="flex-1 text-xs font-mono text-ink truncate">{file.file_path}</span>
              <span className="text-xs font-mono text-acid">+{file.additions}</span>
              <span className="text-xs font-mono text-danger">−{file.deletions}</span>
            </button>
            {isOpen && (
              <pre className="text-[12px] leading-5 font-mono overflow-x-auto max-h-[460px] scroll-thin bg-page-deep py-1">
                {file.diff.split('\n').map((line, i) => (
                  <div key={i} className={cn('px-3 whitespace-pre min-w-fit', lineClass(line))}>{line || ' '}</div>
                ))}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}
