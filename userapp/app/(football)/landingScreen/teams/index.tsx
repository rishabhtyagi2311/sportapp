// app/(football)/teams/index.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TeamsScreen() {
  console.log('👥 Teams screen is rendering');
  
  const handleCreateTeam = () => {
    
    router.push("./../../createNewTeam/basicDetail")
   
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Main Content */}
      <View className="flex-1 justify-center items-center p-4">
        <View className="items-center">
          {/* Empty State Icon */}
          <View className="w-24 h-24 bg-gray-100 rounded-full justify-center items-center mb-6">
            <Ionicons name="people-outline" size={40} color="#6b7280" />
          </View>
          
          {/* Empty State Message */}
          <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
            No Teams Yet
          </Text>
          <Text className="text-gray-600 text-center leading-6 max-w-sm">
            You haven't created any teams yet. Start by creating your first team to manage players and matches.
          </Text>
        </View>
      </View>

      {/* Floating Create Button */}
      <TouchableOpacity
        onPress={handleCreateTeam}
        className="absolute bottom-6 right-6 w-14 h-14 bg-slate-900 rounded-full justify-center items-center shadow-lg"
        activeOpacity={0.8}
        style={{
          elevation: 8, // Android shadow
          shadowColor: '#000', // iOS shadow
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