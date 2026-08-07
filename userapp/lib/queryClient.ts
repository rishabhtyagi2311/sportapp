// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

// A shared default staleTime so any screen migrated to useQuery without its
// own override is safe-by-default (a real cache window) rather than
// behaving like no caching at all. Screens with faster-changing data (e.g.
// a live match) set their own shorter staleTime/refetchInterval.
//
// Exported as a singleton (rather than created inline in _layout.tsx) so
// non-component code — zustand store actions that mutate match/tournament
// data outside of React Query's own useMutation — can invalidate the
// relevant queries directly after a successful write.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: 1,
    },
  },
});
