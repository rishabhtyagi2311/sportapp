// hooks/useDebouncedFocusFetch.ts
import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

/** Runs `fetchFn` on screen focus, but skips it if this same screen instance
 *  already fetched within the last `staleMs` — avoids firing a fresh network
 *  request every single time a user tab-hops back to a screen that's still
 *  mounted in the stack underneath. React Native has no window-focus events
 *  for React Query (or anything else) to key an automatic staleness-aware
 *  refetch off of, so screens whose data lives in a shared zustand store
 *  (rather than a per-screen useQuery) use this instead. Genuinely leaving
 *  and later remounting the screen resets the debounce, which is the
 *  desired behavior — a fresh mount should always fetch. */
export function useDebouncedFocusFetch(fetchFn: () => void, staleMs = 15_000, key?: string | number) {
  const lastFetchedAtRef = useRef(0);
  const lastKeyRef = useRef(key);

  useFocusEffect(
    useCallback(() => {
      // A changed key (e.g. navigating to a different tournamentId) always
      // fetches immediately — the debounce only applies to re-focusing the
      // *same* screen instance, not switching what it's showing.
      const keyChanged = key !== lastKeyRef.current;
      if (keyChanged || Date.now() - lastFetchedAtRef.current > staleMs) {
        lastKeyRef.current = key;
        lastFetchedAtRef.current = Date.now();
        fetchFn();
      }
      // fetchFn intentionally omitted from deps — store actions are stable
      // references from zustand, and including it would risk re-triggering
      // on every render if a caller ever passes an inline arrow function.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staleMs, key])
  );
}
