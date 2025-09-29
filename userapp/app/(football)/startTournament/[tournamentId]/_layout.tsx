
import { Stack } from 'expo-router';

export default function tournamentDashboardLayout
() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
        animation: 'slide_from_right',
      }}
    >
      
      <Stack.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="selectPlayers"
        options={{
          title: 'Select Players',
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="selectCaptains"
        options={{
          title: 'Select Captains',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="enterReferee"
        options={{
          title: 'Referee Names',
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="scoringScreen"
        options={{
          title: 'Score Screen',
          headerShown: false,
        }}
      />


    
    
    </Stack>
  );
}