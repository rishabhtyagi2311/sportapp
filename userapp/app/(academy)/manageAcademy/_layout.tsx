import { Stack } from "expo-router";

export default function Layout() {
 
return (
    <Stack
      screenOptions={{
        headerShown: false,        // hide default header
        animation: "slide_from_right", // smooth stack animation
        gestureEnabled: true,     // allow swipe back on iOS
      }}
    >
      {/* Optional: customize specific screens */}
      <Stack.Screen
        name="index"
        
      />
      
    </Stack>
  );
}
