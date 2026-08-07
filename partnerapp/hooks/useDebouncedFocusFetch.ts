// hooks/useDebouncedFocusFetch.ts
import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

/** Runs `fetchFn` on screen focus, but skips it if this same screen instance
 *  already fetched within the last `staleMs` — avoids firing a fresh network
 *  request every single time a user tab-hops back to a screen that's still
 *  mounted in the stack underneath. React Native has no window-focus events
 *  for anything to key an automatic staleness-aware refetch off of, so
 *  screens whose data lives in a shared zustand store use this instead. */
export function useDebouncedFocusFetch(fetchFn: () => void, staleMs = 15_000, key?: string | number) {
  const lastFetchedAtRef = useRef(0);
  const lastKeyRef = useRef(key);

  useFocusEffect(
    useCallback(() => {
      const keyChanged = key !== lastKeyRef.current;
      if (keyChanged || Date.now() - lastFetchedAtRef.current > staleMs) {
        lastKeyRef.current = key;
        lastFetchedAtRef.current = Date.now();
        fetchFn();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staleMs, key])
  );
}
