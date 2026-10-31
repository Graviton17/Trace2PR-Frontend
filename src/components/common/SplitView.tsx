import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * List on the left, the selected item on the right, each scrolling on its own.
 * On small screens only one is shown: the detail when something is selected.
 */
export function SplitView({ list, detail, hasSelection, className }: {
  list: ReactNode; detail: ReactNode; hasSelection: boolean; className?: string;
}) {
  return (
    <div className={cn('h-full grid lg:grid-cols-[minmax(320px,400px)_1fr] xl:grid-cols-[420px_1fr]', className)}>
      <section className={cn('min-h-0 flex-col border-r border-line bg-surface', hasSelection ? 'hidden lg:flex' : 'flex')}>
        {list}
      </section>
      <section className={cn('min-h-0 overflow-y-auto scroll-thin', hasSelection ? 'block' : 'hidden lg:block')}>
        {detail}
      </section>
    </div>
  );
}

/** Header strip at the top of a list pane (tabs, search, filters). */
export function ListPaneHeader({ children }: { children: ReactNode }) {
  return <div className="shrink-0 px-3 pt-3 pb-2 space-y-2.5 border-b border-line">{children}</div>;
}
