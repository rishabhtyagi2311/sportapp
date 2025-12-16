import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useKnockoutStore } from '@/store/knockoutTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function KnockoutStep2() {
  const router = useRouter();
  
  // Access data
  const { teams: allTeams } = useFootballStore(); // Teams from central store
  const { draft, addTeamToDraft, removeTeamFromDraft } = useKnockoutStore();

  const selectedCount = draft?.selectedTeamIds.length || 0;
  const requiredCount = draft?.teamCount || 8;

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

  const handleNext = () => {
    if (selectedCount !== requiredCount) {
      Alert.alert('Invalid Selection', `Please select exactly ${requiredCount} teams.`);
      return;
    }
    router.push('./step3');
  };

  const renderTeamItem = ({ item }: { item: any }) => {
    const isSelected = draft?.selectedTeamIds.includes(item.id);
    return (
      <TouchableOpacity
        onPress={() => handleToggleTeam(item.id)}
        className={`flex-row items-center p-4 mb-3 rounded-xl border ${
          isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'
        }`}
      >
        <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
          isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
        }`}>
          {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
        </View>
        
        <View className="flex-1">
          <Text className={`font-bold text-base ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
            {item.teamName}
          </Text>
          <Text className="text-slate-500 text-xs">{item.city}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 py-4 bg-white border-b border-slate-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View className="items-end">
          <Text className="text-lg font-bold text-slate-900">Select Teams</Text>
          <Text className={`text-xs ${selectedCount === requiredCount ? 'text-green-600 font-bold' : 'text-slate-500'}`}>
            {selectedCount} / {requiredCount} selected
          </Text>
        </View>
      </View>

      <FlatList
        data={allTeams}
        keyExtractor={(item) => item.id}
        renderItem={renderTeamItem}
        contentContainerStyle={{ padding: 24 }}
        ListEmptyComponent={
          <Text className="text-center text-slate-400 mt-10">No teams available in your club.</Text>
        }
      />

      <View className="p-6 bg-white border-t border-slate-100">
        <TouchableOpacity
          onPress={handleNext}
          disabled={selectedCount !== requiredCount}
          className={`py-4 rounded-xl items-center ${
            selectedCount === requiredCount ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          <Text className="text-white font-bold text-lg">Next: Rules & Venue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}