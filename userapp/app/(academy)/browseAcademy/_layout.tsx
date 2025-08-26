import React from 'react';
import { Stack } from 'expo-router';

export default function AcademyLayout(){
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Browse Academies',
        }}
      />
      <Stack.Screen 
        name="academy-detail" 
        options={{
          title: 'Academy Details',
        }}
      />
    </Stack>
  );
}