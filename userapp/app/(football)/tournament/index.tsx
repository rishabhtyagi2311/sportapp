// app/(football)/tournament.tsx
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TournamentScreen() {
  console.log('🏆 Tournament screen is rendering');
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          🏆 Tournament
        </Text>
        <Text className="text-gray-600 text-center">
          This is the Tournament screen. Your tournament content will go here.
        </Text>
        <View className="mt-4 bg-purple-100 p-2 rounded">
          <Text className="text-xs text-purple-800">DEBUG: Tournament screen loaded successfully</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}