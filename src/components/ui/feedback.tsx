import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Dialog } from './dialog';

type ToastKind = 'success' | 'error' | 'info';
interface Toast { id: number; kind: ToastKind; text: string }

interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
}

interface FeedbackContextValue {
  toast: (text: string, kind?: ToastKind) => void;
  /** Resolves true when the user confirms. Replaces window.confirm. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const TONE = {
  success: 'text-acid',
  error: 'text-danger',
  info: 'text-cyan',
};

/** Toasts (bottom-right, auto-dismiss) and a confirm dialog for the whole app. */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback((text: string, kind: ToastKind = 'success') => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-3), { id, kind, text }]);
    setTimeout(() => dismiss(id), kind === 'error' ? 7000 : 4000);
  }, [dismiss]);

  const confirm = useCallback((options: ConfirmOptions) => {
    setPending(options);
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, []);

  const settle = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setPending(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}
      <Dialog
        open={pending !== null}
        onClose={() => settle(false)}
        title={pending?.title}
        description={pending?.description}
        footer={
          <>
            <Button variant="ghost" onClick={() => settle(false)}>Cancel</Button>
            <Button variant={pending?.danger ? 'danger' : 'primary'} onClick={() => settle(true)} data-autofocus>
              {pending?.confirmLabel ?? 'Confirm'}
            </Button>
          </>
        }
      />
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[min(360px,calc(100vw-32px))]" aria-live="polite" role="status">
          {toasts.map((t) => {
            const Icon = ICONS[t.kind];
            return (
              <div key={t.id} className="flex items-start gap-2.5 rounded-lg border border-line-strong bg-raised px-3.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,.5)] animate-fade-in">
                <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', TONE[t.kind])} aria-hidden />
                <p className="flex-1 text-sm text-ink">{t.text}</p>
                <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="text-muted hover:text-ink">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </FeedbackContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook lives with its provider
export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used inside FeedbackProvider');
  return ctx;
}

/** Message from any thrown value, for toasts. */
// eslint-disable-next-line react-refresh/only-export-components
export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
