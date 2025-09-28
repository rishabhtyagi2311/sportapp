// app/(football)/matches.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MatchesScreen() {
  const router = useRouter()
  console.log('⚽ Matches screen is rendering');
  
  const handleCreateMatch = () => {
    console.log('About to navigate to:', "/(football)/startMatch/selectTeams");
  console.log('Router state:', router);
    router.push("/(football)/startMatch/selectTeams");
  };
  
  // Empty State Component
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-4">
      <View className="items-center">
        <View className="w-24 h-24 bg-gray-100 rounded-full justify-center items-center mb-6">
          <Ionicons name="football-outline" size={40} color="#6b7280" />
        </View>
        
        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          No Matches Yet
        </Text>
        <Text className="text-gray-600 text-center leading-6 max-w-sm">
          You haven't played any matches yet. Start by creating your first match to track games and results.
        </Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      {renderEmptyState()}

      {/* Floating Create Button */}
      <TouchableOpacity
        onPress={handleCreateMatch}
        className="absolute bottom-6 right-6 w-14 h-14 bg-slate-900 rounded-full justify-center items-center shadow-lg"
        activeOpacity={0.8}
        style={{
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}