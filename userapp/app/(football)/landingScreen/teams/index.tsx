// app/(football)/teams/index.tsx
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFootballStore } from '@/store/footballTeamStore';

const { width } = Dimensions.get('window');

export default function TeamsScreen() {
  console.log('👥 Teams screen is rendering');
  
  const { teams } = useFootballStore();
  
  const handleCreateTeam = () => {
    router.push("./../../createNewTeam/basicDetail");
  };

  const handleTeamPress = (team: any) => {
    // Navigate to view members screen with team ID as parameter
    router.push(`/(football)/TeamsNestedFiles/viewMembers?teamId=${team.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTeamCard = (team: any) => (
    <TouchableOpacity
      key={team.id}
      onPress={() => handleTeamPress(team)}
      activeOpacity={0.8}
      className="bg-slate-900 rounded-2xl p-6 mb-4 mx-4 shadow-lg"
      style={{
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      }}
    >
      {/* Team Header */}
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1 mr-3">
          <Text className="text-white text-xl font-bold mb-1" numberOfLines={2}>
            {team.teamName}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color="#94a3b8" />
            <Text className="text-slate-400 text-sm ml-1">{team.city}</Text>
          </View>
        </View>
        
        {/* Status Badge */}
        <View className={`px-3 py-1 rounded-full ${
          team.status === 'active' 
            ? 'bg-green-600' 
            : team.status === 'inactive' 
              ? 'bg-yellow-600' 
              : 'bg-red-600'
        }`}>
          <Text className="text-white text-xs font-semibold capitalize">
            {team.status}
          </Text>
        </View>
      </View>

      {/* Team Stats Row */}
      <View className="flex-row items-center justify-between mb-4">
        {/* Members Count */}
        <View className="flex-row items-center bg-sky-100/10 px-3 py-2 rounded-lg flex-1 mr-2">
          <Ionicons name="people-outline" size={18} color="#0ea5e9" />
          <Text className="text-sky-100 text-sm font-semibold ml-2">
            {team.memberPlayerIds.length}/{team.maxPlayers} Players
          </Text>
        </View>

        {/* Match Record */}
        <View className="flex-row items-center bg-sky-100/10 px-3 py-2 rounded-lg flex-1 ml-2">
          <Ionicons name="trophy-outline" size={18} color="#0ea5e9" />
          <Text className="text-sky-100 text-sm font-semibold ml-2">
            {team.matchesWon}W {team.matchesLost}L {team.matchesDrawn}D
          </Text>
        </View>
      </View>

      {/* Creation Date and Arrow */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
          <Text className="text-slate-400 text-xs ml-1">
            Created {formatDate(team.createdAt)}
          </Text>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </View>

      {/* Progress Bar for Team Capacity */}
      <View className="mt-4">
        <View className="bg-slate-700 h-2 rounded-full overflow-hidden">
          <View 
            className="bg-sky-400 h-full rounded-full"
            style={{
              width: `${(team.memberPlayerIds.length / team.maxPlayers) * 100}%`
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  // Empty State Component
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-4">
      <View className="items-center">
        <View className="w-24 h-24 bg-gray-100 rounded-full justify-center items-center mb-6">
          <Ionicons name="people-outline" size={40} color="#6b7280" />
        </View>
        
        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          No Teams Yet
        </Text>
        <Text className="text-gray-600 text-center leading-6 max-w-sm">
          You haven't created any teams yet. Start by creating your first team to manage players and matches.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {teams.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Header */}
          <View className="px-4 -mt-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between ">
              <View >
                <Text className="text-2xl font-bold text-gray-900">My Teams</Text>
                <Text className="text-gray-600 text-sm">
                  {teams.length} {teams.length === 1 ? 'team' : 'teams'} created
                </Text>
              </View>
              
              {/* Stats Summary */}
              <View className="items-end">
                <Text className="text-sm text-gray-500">Active Teams</Text>
                <Text className="text-xl font-bold text-slate-900">
                  {teams.filter(t => t.status === 'active').length}
                </Text>
              </View>
            </View>
          </View>

          {/* Teams List */}
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingVertical: 16,
              paddingBottom: 100 // Space for floating button
            }}
          >
            {teams.map(team => renderTeamCard(team))}
          </ScrollView>
        </>
      )}

      {/* Floating Create Button */}
      <TouchableOpacity
        onPress={handleCreateTeam}
        className="absolute bottom-6 right-6 w-14 h-14 bg-sky-100 rounded-full justify-center items-center shadow-lg"
        activeOpacity={0.8}
        style={{
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
      >
        <Ionicons name="add" size={28} color="black" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}