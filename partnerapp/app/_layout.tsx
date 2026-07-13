// app/_layout.tsx
import "./../global.css"
import { Stack } from "expo-router";

export default function RootLayout() {
  // A real Stack (not a bare Slot) so every top-level section — home tabs,
  // venue management, academy, profile editing, onboarding — participates
  // in native stack navigation. A Slot has no navigation container at all,
  // which is why swipe-back only ever worked *inside* a section that
  // already had its own nested Stack, never *between* sections.
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
    </Stack>
  );
}
