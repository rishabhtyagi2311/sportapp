import { Stack } from "expo-router";

export default function AcademyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // hides headers globally
      }}
    >
      <Stack.Screen name="index" options={{ title: "My Academies" }} />
      <Stack.Screen name="[id]/index" options={{ title: "Academy Details" }} />
      <Stack.Screen name="[id]/edit" options={{ title: "Edit Academy" }} />
      <Stack.Screen name="[id]/students" options={{ title: "Students" }} />
      <Stack.Screen name="[id]/attendance" options={{ title: "Attendance" }} />
       <Stack.Screen name="[id]/studentAttendance" options={{ title: "studentAttendance" }} />
      <Stack.Screen
        name="[id]/certificates"
        options={{ title: "Certificates" }}
      />
    </Stack>
  );
}
