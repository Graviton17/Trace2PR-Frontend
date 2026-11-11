import { useEffect, useRef } from 'react';

/** Runs `callback` when the browser restores this page from its back/forward
 *  cache, e.g. the user pressed Back on an external page (Composio). The page
 *  comes back exactly as it was left, spinners included, so reset them here. */
export function usePageRestore(callback: () => void) {
  const ref = useRef(callback);
  useEffect(() => { ref.current = callback; });
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) ref.current(); };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);
}
