import { Stack } from 'expo-router';

export default function RootStacklayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="advertise" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signUp" />
      <Stack.Screen name="basicInfoRegisterOne" />
      <Stack.Screen name="basicInfoRegisterTwo" />
      <Stack.Screen name="basicInfoRegisterThree" />
    </Stack>
  );
}