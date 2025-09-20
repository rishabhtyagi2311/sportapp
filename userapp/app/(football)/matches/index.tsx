// app/(football)/matches.tsx
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MatchesScreen() {
  console.log('⚽ Matches screen is rendering');
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          ⚽ Matches
        </Text>
        <Text className="text-gray-600 text-center">
          This is the Matches screen. Your matches content will go here.
        </Text>
        <View className="mt-4 bg-green-100 p-2 rounded">
          <Text className="text-xs text-green-800">DEBUG: Matches screen loaded successfully</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}