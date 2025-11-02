// app/(venue)/eventManager/layout.tsx

import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function EventManagerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1e293b', // slate-800
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
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
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="editEvent/[id]"
        options={{
          title: 'Edit Event',
        }}
      />
    </Stack>
  );
}