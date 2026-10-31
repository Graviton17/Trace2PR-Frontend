import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Hide the header (for custom layouts such as the command palette). */
  bare?: boolean;
  /** Vertical position: centered (default) or near the top (palettes). */
  position?: 'center' | 'top';
  labelledBy?: string;
}

/** Modal dialog: Esc and backdrop close it, focus moves in and returns on close. */
export function Dialog({ open, onClose, title, description, children, footer, className, bare, position = 'center', labelledBy }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Callers pass inline onClose functions; keep the latest without re-running
  // the open/close effect (which would steal focus on every render).
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current(); }
      if (e.key === 'Tab' && panelRef.current) {
        // Keep Tab inside the dialog.
        const items = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (items.length === 0) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus the marked element, else the first field, else the panel itself.
    requestAnimationFrame(() => {
      const panel = panelRef.current;
      const target = panel?.querySelector<HTMLElement>('[data-autofocus]')
        ?? panel?.querySelector<HTMLElement>('input:not([disabled]), textarea:not([disabled]), select');
      (target ?? panel)?.focus();
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={cn('fixed inset-0 z-50 flex justify-center p-4', position === 'top' ? 'items-start pt-[12vh]' : 'items-center')}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] animate-fade-in" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? (title ? 'dialog-title' : undefined)}
        tabIndex={-1}
        className={cn(
          'relative w-full max-w-md rounded-xl border border-line-strong bg-surface shadow-[0_24px_80px_rgba(0,0,0,.6)] animate-fade-in outline-none',
          className,
        )}
      >
        {!bare && (
          <div className="flex items-start gap-3 px-5 pt-5">
            <div className="flex-1 min-w-0">
              {title && <h2 id="dialog-title" className="text-base font-semibold text-ink">{title}</h2>}
              {description && <p className="text-sm text-muted mt-1">{description}</p>}
            </div>
            <button onClick={onClose} aria-label="Close" className="-mr-1 -mt-1 p-1.5 rounded-md text-muted hover:text-ink hover:bg-white/5">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {children && <div className={cn(!bare && 'px-5 pt-4')}>{children}</div>}
        {footer && <div className="flex justify-end gap-2 px-5 py-4">{footer}</div>}
        {!footer && !bare && <div className="h-5" />}
      </div>
    </div>,
    document.body,
  );
}
