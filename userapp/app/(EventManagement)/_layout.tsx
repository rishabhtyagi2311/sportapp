
import React from 'react';
import { Stack } from 'expo-router';


export default function EventManagerLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="profile"
        options={{
          title: 'Event Manager',
        }}
      />
      <Stack.Screen
        name="createEvent"
        options={{
          title: 'Create Event',
        
        }}
      />
      <Stack.Screen
        name="editEvent/[id]"
        options={{
          title: 'Edit Event',
        }}
      />
      <Stack.Screen
        name="organizerDashboard"
        options={{
          title: 'Organizer Dashboard',
        }}
      />
    </Stack>
  );
}