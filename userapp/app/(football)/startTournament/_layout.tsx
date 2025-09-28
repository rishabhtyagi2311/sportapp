
import { Stack } from 'expo-router';

export default function MatchesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
        animation: 'slide_from_right',
      }}
    >
      
      <Stack.Screen
        name="selectTeams"
        options={{
          title: 'Select Teams',
          headerShown: false,
        }}
      />

    
    
    </Stack>
  );
}