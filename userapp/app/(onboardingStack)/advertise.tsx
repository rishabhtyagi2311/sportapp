import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  
  const handleStartJourney = useCallback(() => {
    // Navigate to your Welcome screen
    router.navigate('/(onboardingStack)/welcome');
    console.log('Journey Started');
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black">
      
      <View className=' flex items-center mt-4 h-32 '>
         <Image
          source={require('@/assets/images/app_name.jpeg')}
          className="w-full h-24 rounded-[48px]"
          resizeMode="contain"
        />
        <Text className='font-bold text-white  ml-32 text-3xl italic'>Be a Sport</Text>
      </View>
      <View className="flex-1 justify-center items-center ">
        <Image
          source={require('@/assets/images/singleAdvertise.png')}
          className="w-full h-full rounded-[48px]"
          resizeMode="contain"
        />
      </View>

      {/* 2. Fixed Button Section */}
      <View className="py-6 px-10 bg-black">
        <TouchableOpacity 
          activeOpacity={0.8}
          className="bg-blue-400 py-5 rounded-2xl shadow-2xl shadow-blue-400/40"
          onPress={handleStartJourney}
        >
          <Text className="text-slate-900 text-center font-extrabold text-xl tracking-tight">
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}