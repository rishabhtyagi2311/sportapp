import { Stack } from 'expo-router';




export default function RootStacklayout()
{
  console.log("coming to onbarding");
  
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>

          <Stack.Screen name="welcome" options={{ animation: 'fade' }}  />
           <Stack.Screen name="login"   />
           <Stack.Screen name="basicInfoRegisterOne"   />
            <Stack.Screen name="basicInfoRegisterTwo"   />
             <Stack.Screen name="basicInfoRegisterThree"   />
    
        </Stack>
      );
}