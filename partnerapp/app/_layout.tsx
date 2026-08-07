// app/_layout.tsx
import "./../global.css"
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// A shared default staleTime so any screen migrated to useQuery without its
// own override is safe-by-default (a real cache window) rather than
// behaving like no caching at all.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  // SafeAreaProvider is required by react-native-safe-area-context — every
  // screen's <SafeAreaView> and useSafeAreaInsets() call depends on it for
  // real device measurements. Without it, insets fall back to inconsistent
  // defaults instead of the device's actual safe area, which is why header
  // spacing looked "off" (worse on tablets, where the fallback diverges
  // further from reality).
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        {/* A real Stack (not a bare Slot) so every top-level section — home
        tabs, venue management, academy, profile editing, onboarding —
        participates in native stack navigation. A Slot has no navigation
        container at all, which is why swipe-back only ever worked *inside* a
        section that already had its own nested Stack, never *between*
        sections. */}
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" options={{ animation: 'none' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
