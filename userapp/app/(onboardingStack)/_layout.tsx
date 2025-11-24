import { Stack } from 'expo-router';
import InfoRegisterScreen from './basicInfoRegisterOne';




export default function RootStacklayout()
{
  console.log("coming to onbarding");
  
    return (
        <Stack screenOptions={{ headerShown: false }}>

          <Stack.Screen name="welcome"   />
           <Stack.Screen name="basicInfoRegisterOne"   />
            <Stack.Screen name="basicInfoRegisterTwo"   />
             <Stack.Screen name="basicInfoRegisterThree"   />
    
        </Stack>
      );
}