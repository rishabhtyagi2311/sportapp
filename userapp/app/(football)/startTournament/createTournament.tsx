// 1. app/(football)/tournaments/create.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTournamentStore } from '@/store/footballTournamentStore';

export default function CreateTournamentScreen() {
  const router = useRouter();
  const { startTournamentCreation, updateCreationDraft } = useTournamentStore();
  
  const [tournamentName, setTournamentName] = useState('');
  const [description, setDescription] = useState('');
  const [teamCount, setTeamCount] = useState('8');
  const [matchesPerPair, setMatchesPerPair] = useState<'1' | '2'>('1');
  
  useEffect(() => {
    const teams = parseInt(teamCount, 10);
    if (!isNaN(teams) && teams > 0 && teams < 2) {
      setTeamCount('2');
    }
  }, [teamCount]);

  const handleContinue = () => {
    if (!tournamentName.trim()) {
      Alert.alert('Error', 'Please enter a tournament name');
      return;
    }

    const teams = parseInt(teamCount, 10);
    if (isNaN(teams) || teams < 2 || teams % 2 !== 0) {
      Alert.alert('Error', 'Please enter an even number of teams (minimum 2)');
      return;
    }

    startTournamentCreation(tournamentName);
    updateCreationDraft({
      description: description.trim() || undefined,
      format: 'league',
      teamCount: teams,
      tableCount: 1,
      settings: { matchesPerPair: parseInt(matchesPerPair, 10) as 1 | 2 },
    });

    router.push('/(football)/startTournament/selectTeams');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="close" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Create Tournament</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="bg-white px-4 py-3 border-b border-slate-100">
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center">
            <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
              <Text className="text-white font-bold text-sm">1</Text>
            </View>
            <View className="flex-1 h-1 bg-slate-200 mx-2" />
          </View>
          <View className="flex-1 flex-row items-center">
            <View className="w-8 h-8 bg-slate-200 rounded-full items-center justify-center">
              <Text className="text-slate-400 font-bold text-sm">2</Text>
            </View>
            <View className="flex-1 h-1 bg-slate-200 mx-2" />
          </View>
          <View className="w-8 h-8 bg-slate-200 rounded-full items-center justify-center">
            <Text className="text-slate-400 font-bold text-sm">3</Text>
          </View>
        </View>
        <View className="flex-row justify-between mt-2 px-1">
          <Text className="text-xs font-medium text-blue-600">Basic Info</Text>
          <Text className="text-xs text-slate-400">Teams</Text>
          <Text className="text-xs text-slate-400">Settings</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Tournament Name */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 mb-2">Tournament Name *</Text>
          <TextInput
            value={tournamentName}
            onChangeText={setTournamentName}
            placeholder="e.g. Summer Championship 2024"
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 mb-2">Description (Optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description of the tournament..."
            multiline
            numberOfLines={3}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900"
            placeholderTextColor="#94a3b8"
            textAlignVertical="top"
          />
        </View>

        {/* Team Count */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 mb-2">Number of Teams *</Text>
          <View className="flex-row items-center">
            <TextInput
              value={teamCount}
              onChangeText={setTeamCount}
              keyboardType="numeric"
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 flex-1"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <Text className="text-xs text-slate-500 mt-2">
            Please enter an even number (e.g., 4, 6, 8, 12, 16, etc.)
          </Text>
        </View>

        {/* League Configuration */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 mb-3">League Configuration</Text>
          
          {/* Matches per pair (once / twice) */}
          <View className="bg-white rounded-xl p-4 mb-3 border border-slate-200">
            <Text className="text-sm font-semibold text-slate-700 mb-2">Round-Robin Type</Text>
            <Text className="text-xs text-slate-500 mb-3">Choose whether teams play each other once or twice (home & away).</Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setMatchesPerPair('1')}
                className={`flex-1 mr-2 p-3 rounded-xl border ${
                  matchesPerPair === '1' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'
                }`}
              >
                <Text className={`text-sm font-semibold ${matchesPerPair === '1' ? 'text-blue-700' : 'text-slate-700'}`}>Play once</Text>
                <Text className="text-xs text-slate-500 mt-1">Single round-robin (one match per pair)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMatchesPerPair('2')}
                className={`flex-1 ml-2 p-3 rounded-xl border ${
                  matchesPerPair === '2' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'
                }`}
              >
                <Text className={`text-sm font-semibold ${matchesPerPair === '2' ? 'text-blue-700' : 'text-slate-700'}`}>Play twice</Text>
                <Text className="text-xs text-slate-500 mt-1">Double round-robin (home & away)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-blue-900 mb-1">Tournament Structure</Text>
              <Text className="text-sm text-blue-700 leading-5">
                {`${parseInt(teamCount, 10) || 0} teams will play in a single league table. The tournament winner will be determined by the standings.`}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="bg-white px-4 py-4 border-t border-slate-200">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-blue-600 rounded-xl py-4 items-center"
          disabled={!tournamentName.trim()}
        >
          <Text className="text-white font-bold text-base">Continue to Team Selection</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}