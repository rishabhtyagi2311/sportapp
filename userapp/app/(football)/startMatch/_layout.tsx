// app/(football)/matches/_layout.tsx
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
       <Stack.Screen
        name="basicDetailsOne"
        options={{
          title: 'Basic Details',
          headerShown: false,
        }}
      />
    
      {/* <Stack.Screen
        name="createMatch"
        options={{
          title: 'Create Match',
          headerShown: false,
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen
        name="matchDetails"
        options={{
          title: 'Match Details',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="matchResults"
        options={{
          title: 'Match Results',
          headerShown: false,
        }}
      /> */}
    </Stack>
  );
}