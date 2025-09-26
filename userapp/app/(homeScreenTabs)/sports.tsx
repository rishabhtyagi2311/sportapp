// app/(homeScreenTabs)/sports.tsx - CLEAN VERSION
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function SportsScreen() {
  
  const navigateToFootball = () => {
    console.log('🏈 Navigating to football matches...');
    router.push('/(football)/createFootballProfile'); 
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="bg-sky-100 px-5 py-6 flex-1">
        
        {/* Football Card */}
        <TouchableOpacity
          onPress={navigateToFootball}
          className="rounded-xl mb-4 shadow-md overflow-hidden mt-2"
          activeOpacity={0.8}
        >
          <ImageBackground
            source={require('../../assets/images/footballcard.png')} 
            className="h-48 w-full justify-end"
            imageStyle={{ borderRadius: 12 }}
          >
            <View className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl" />
            
            <View className="absolute bottom-4 left-4 z-10">
              <Text className="text-white text-3xl font-extrabold mb-1 font-serif">
                Football
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
        
        {/* Add more sports cards below */}
      </ScrollView>
    </SafeAreaView>
  );
}