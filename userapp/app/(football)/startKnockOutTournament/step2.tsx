import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Upgraded from react-native for better notch handling
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useKnockoutStore } from '@/store/knockoutTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function KnockoutStep2() {
  const router = useRouter();
  
  // Access data (Logic preserved)
  const { teams: allTeams } = useFootballStore(); 
  const { draft, addTeamToDraft, removeTeamFromDraft } = useKnockoutStore();

  const selectedCount = draft?.selectedTeamIds.length || 0;
  const requiredCount = draft?.teamCount || 8;

  // Logic preserved exactly as original
  const handleToggleTeam = (teamId: string) => {
    if (!draft) return;
    
    if (draft.selectedTeamIds.includes(teamId)) {
      removeTeamFromDraft(teamId);
    } else {
      if (selectedCount >= requiredCount) {
        Alert.alert('Limit Reached', `You need exactly ${requiredCount} teams for this format.`);
        return;
      }
      addTeamToDraft(teamId);
    }
  };

  // Logic preserved exactly as original
  const handleNext = () => {
    if (selectedCount !== requiredCount) {
      Alert.alert('Invalid Selection', `Please select exactly ${requiredCount} teams.`);
      return;
    }
    router.push('./step3');
  };

  const renderTeamItem = ({ item }: { item: any }) => {
    const isSelected = draft?.selectedTeamIds.includes(item.id);
    // Disable selection of other teams only if limit is reached AND this specific team isn't already selected
    const isDisabled = !isSelected && selectedCount >= requiredCount;

    return (
      <TouchableOpacity
        onPress={() => handleToggleTeam(item.id)}
        disabled={isDisabled}
        className={`bg-white rounded-xl p-4 mb-3 border-2 ${
          isSelected ? 'border-blue-500' : 'border-slate-100'
        } ${isDisabled ? 'opacity-60' : 'opacity-100'}`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            {/* Team Icon / Avatar */}
            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
              isSelected ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              <Ionicons
                name="shield-half"
                size={24}
                color={isSelected ? '#3b82f6' : '#64748b'}
              />
            </View>
            
            {/* Team Info */}
            <View className="flex-1">
              <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                {item.teamName}
              </Text>
              <Text className="text-sm text-slate-500">
                {item.city || 'No Location'}
              </Text>
            </View>
          </View>

          {/* Checkbox UI */}
          {isSelected ? (
            <View className="w-6 h-6 rounded-full items-center justify-center border-2 bg-blue-600 border-blue-600">
              <Ionicons name="checkmark" size={14} color="white" />
            </View>
          ) : (
            <View className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
              isDisabled ? 'border-slate-200' : 'border-slate-300'
            }`} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Select Teams</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Progress Indicator (Visual Upgrade) */}
      <View className="bg-white px-4 py-3 border-b border-slate-100">
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center">
            <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
            <View className="flex-1 h-1 bg-green-600 mx-2" />
          </View>
          <View className="flex-1 flex-row items-center">
            <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
              <Text className="text-white font-bold text-sm">2</Text>
            </View>
            <View className="flex-1 h-1 bg-slate-200 mx-2" />
          </View>
          <View className="w-8 h-8 bg-slate-200 rounded-full items-center justify-center">
            <Text className="text-slate-400 font-bold text-sm">3</Text>
          </View>
        </View>
        <View className="flex-row justify-between mt-2 px-1">
          <Text className="text-xs font-medium text-green-600">Setup</Text>
          <Text className="text-xs font-medium text-blue-600">Selection</Text>
          <Text className="text-xs text-slate-400">Rules</Text>
        </View>
      </View>

      {/* Stats / Info Box */}
      <View className="bg-blue-50 mx-4 mt-4 rounded-xl p-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-blue-700 mb-1">Teams Required</Text>
            <Text className="text-2xl font-bold text-blue-900">
              {selectedCount} / {requiredCount}
            </Text>
            <Text className="text-xs text-blue-700 mt-1 italic">
              Knockout bracket size
            </Text>
          </View>
          <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center">
            <Ionicons name="git-network" size={24} color="#1e40af" />
          </View>
        </View>
      </View>

      {/* Teams List */}
      <View className="flex-1 px-4 pt-4">
        <Text className="text-sm font-semibold text-slate-700 mb-3">
          Available Teams ({allTeams.length})
        </Text>
        
        <FlatList
          data={allTeams}
          keyExtractor={(item) => item.id}
          renderItem={renderTeamItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="people-outline" size={32} color="#64748b" />
              </View>
              <Text className="text-slate-900 font-bold text-lg mb-2">No Teams Found</Text>
              <Text className="text-slate-500 text-center">
                Create teams in your club before starting a tournament.
              </Text>
            </View>
          }
        />
      </View>

      {/* Footer Action Button */}
      <View className="bg-white px-4 py-4 border-t border-slate-200 absolute bottom-0 left-0 right-0">
        <TouchableOpacity
          onPress={handleNext}
          disabled={selectedCount !== requiredCount}
          className={`rounded-xl py-4 items-center ${
            selectedCount === requiredCount ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          <Text className="text-white font-bold text-base">
            Next: Rules & Venue ({selectedCount}/{requiredCount})
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}