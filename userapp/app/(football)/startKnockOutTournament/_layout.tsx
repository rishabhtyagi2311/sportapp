import { Stack } from 'expo-router';

export default function KnockoutTournamentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="step1" options={{ title: 'Tournament Details', headerShown: false }} />
      <Stack.Screen name="step2" options={{ title: 'Select Teams', headerShown: false }} />
      <Stack.Screen name="step3" options={{ title: 'Tournament Settings', headerShown: false }} />
      <Stack.Screen name="[tournamentId]" options={{ headerShown: false }} />
    </Stack>
  );
}
