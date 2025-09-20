// app/(homeScreenTabs)/sports.tsx
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SportsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="bg-sky-100 px-5 py-6 flex-1">
        
        <TouchableOpacity
          onPress={() => router.navigate('./../(footballStack)')}
          className="rounded-xl mb-4 shadow-md overflow-hidden mt-2"
          activeOpacity={0.8}
        >
          <ImageBackground
            source={require('../../assets/images/footballcard.png')} 
            className="h-48 w-full justify-end"
            imageStyle={{ borderRadius: 12 }}
          >
            {/* Gradient overlay for better text visibility */}
            <View className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl" />
            
            {/* Text overlay - positioned at bottom left */}
            <View className="absolute bottom-4 left-4 z-10">
              <Text className="text-black text-3xl font-extrabold mb-1 font-serif">
                Football
              </Text>
              
            </View>
            
            {/* Optional: Icon at bottom right */}
        
          </ImageBackground>
        </TouchableOpacity>
        
        {/* Add more sports cards below following the same pattern */}
      </ScrollView>
    </SafeAreaView>
  );
}