// app/(football)/teams.tsx
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeamsScreen() {
  console.log('👥 Teams screen is rendering');
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          👥 Teams
        </Text>
        <Text className="text-gray-600 text-center">
          This is the Teams screen. Your teams content will go here.
        </Text>
        <View className="mt-4 bg-blue-100 p-2 rounded">
          <Text className="text-xs text-blue-800">DEBUG: Teams screen loaded successfully</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}