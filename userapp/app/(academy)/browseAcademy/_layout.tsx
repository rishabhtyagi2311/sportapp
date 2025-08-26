import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,       
        animation: "slide_from_right", 
        gestureEnabled: true,     
      }}
    >
      {/* Optional: customize specific screens */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Academy Home",
          headerStyle: { backgroundColor: "#0f172a" }, // slate-900
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: false, // since we built a custom header in your form
        }}
      />
    </Stack>
  );
}
