// app/(football)/tournaments/selectTeams.tsx
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTournamentStore } from '@/store/footballTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function SelectTeamsScreen() {
  const router = useRouter();
  const { teams } = useFootballStore();
  const { creationDraft, addTeamToDraft, removeTeamFromDraft, updateCreationDraft } = useTournamentStore();
  
  const selectedTeamIds = creationDraft?.selectedTeamIds || [];

  const handleToggleTeam = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      removeTeamFromDraft(teamId);
    } else {
      addTeamToDraft(teamId);
    }
  };

  const handleContinue = () => {
    if (selectedTeamIds.length < 2) {
      Alert.alert('Error', 'Please select at least 2 teams');
      return;
    }
    // Navigate to settings
    router.push('/(football)/startTournament/tournamentSpecifics');
  };

  const handleBack = () => {
    router.back();
  };

  // Calculate total matches based on format
  const totalMatches = useMemo(() => {
    const n = selectedTeamIds.length;
    if (n < 2) return 0;

    if (creationDraft?.format === 'league') {
      // Double round-robin: each team plays every other team twice (home & away)
      // Formula: n * (n - 1)
      // Examples: 
      // - 3 teams: 3 * 2 = 6 matches
      // - 4 teams: 4 * 3 = 12 matches
      // - 5 teams: 5 * 4 = 20 matches
      return n * (n - 1);
    } else {
      // Knockout: 2^(ceil(log2(n))) - 1
      // This accounts for byes in non-power-of-2 team counts
      const totalSlots = Math.pow(2, Math.ceil(Math.log2(n)));
      return totalSlots - 1;
    }
  }, [selectedTeamIds.length, creationDraft?.format]);

  // Calculate number of rounds
  const totalRounds = useMemo(() => {
    const n = selectedTeamIds.length;
    if (n < 2) return 0;

    if (creationDraft?.format === 'league') {
      // Double round-robin rounds
      return (n - 1) * 2;
    } else {
      // Knockout rounds
      return Math.ceil(Math.log2(n));
    }
  }, [selectedTeamIds.length, creationDraft?.format]);

  // Group teams by some criteria or just show all
  const availableTeams = useMemo(() => {
    return teams.filter(team => team.teamName); // Filter valid teams
  }, [teams]);

  if (!creationDraft) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500">No tournament draft found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Select Teams</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Progress Indicator */}
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
          <Text className="text-xs font-medium text-green-600">Basic Info</Text>
          <Text className="text-xs font-medium text-blue-600">Teams</Text>
          <Text className="text-xs text-slate-400">Settings</Text>
        </View>
      </View>

      {/* Selected Count */}
      <View className="bg-blue-50 mx-4 mt-4 rounded-xl p-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-sm text-blue-700 mb-1">Selected Teams</Text>
            <Text className="text-2xl font-bold text-blue-900">
              {selectedTeamIds.length} {creationDraft.format === 'knockout' && '/ 8'}
            </Text>
          </View>
          <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center">
            <Ionicons name="people" size={24} color="#1e40af" />
          </View>
        </View>
        
        {selectedTeamIds.length >= 2 && (
          <View className="border-t border-blue-200 pt-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="trophy-outline" size={14} color="#1e40af" />
                <Text className="text-xs text-blue-700 ml-1 font-medium">Total Matches:</Text>
              </View>
              <Text className="text-sm font-bold text-blue-900">{totalMatches}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="layers-outline" size={14} color="#1e40af" />
                <Text className="text-xs text-blue-700 ml-1 font-medium">Total Rounds:</Text>
              </View>
              <Text className="text-sm font-bold text-blue-900">{totalRounds}</Text>
            </View>
            {creationDraft.format === 'league' && (
              <Text className="text-xs text-blue-600 mt-2 italic">
                Double round-robin: Each team plays every other team twice
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Teams List */}
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {availableTeams.length === 0 ? (
          <View className="items-center justify-center py-16">
            <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="people-outline" size={32} color="#64748b" />
            </View>
            <Text className="text-slate-900 font-bold text-lg mb-2">No Teams Available</Text>
            <Text className="text-slate-500 text-center mb-6">
              You need to create teams first before creating a tournament
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-sm font-semibold text-slate-700 mb-3">
              Available Teams ({availableTeams.length})
            </Text>
            {availableTeams.map((team) => {
              const isSelected = selectedTeamIds.includes(team.id);
              return (
                <TouchableOpacity
                  key={team.id}
                  onPress={() => handleToggleTeam(team.id)}
                  className={`bg-white rounded-xl p-4 mb-3 border-2 ${
                    isSelected ? 'border-blue-500' : 'border-slate-100'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View
                        className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                          isSelected ? 'bg-blue-100' : 'bg-slate-100'
                        }`}
                      >
                        <Ionicons
                          name="shield"
                          size={24}
                          color={isSelected ? '#3b82f6' : '#64748b'}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                          {team.teamName}
                        </Text>
                        <Text className="text-sm text-slate-500">
                          {team.memberPlayerIds?.length || 0} Players
                        </Text>
                      </View>
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="white" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
        <View className="h-24" />
      </ScrollView>

      {/* Continue Button */}
      <View className="bg-white px-4 py-4 border-t border-slate-200">
        <TouchableOpacity
          onPress={handleContinue}
          className={`rounded-xl py-4 items-center ${
            selectedTeamIds.length >= 2 ? 'bg-blue-600' : 'bg-slate-300'
          }`}
          disabled={selectedTeamIds.length < 2}
        >
          <Text className="text-white font-bold text-base">
            Continue to Settings ({selectedTeamIds.length} teams)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}