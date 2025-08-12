import { Stack } from 'expo-router';
import InfoRegisterScreen from './basicInfoRegisterOne';




export default function RootStacklayout()
{
  console.log("coming to onbarding");
  
    return (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="basicInfoRegisterOne"   />
    
        </Stack>
      );
}