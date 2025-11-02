import React from "react";
import { Stack } from "expo-router";

export default function AcademyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="profile" />
    
      <Stack.Screen name="academies" />
       <Stack.Screen name="childAttendance" />
    </Stack>
  );
}