// app/(football)/tournaments/[tournamentId]/selectCaptains.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTournamentStore } from '@/store/footballTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function TournamentSelectCaptainsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tournamentId = params.tournamentId as string;
  const fixtureId = params.fixtureId as string;
  
  const { 
    activeTournamentMatch, 
    setTournamentMatchCaptains,
    initializeTournamentMatch
  } = useTournamentStore();
  
  const { getPlayerById } = useFootballStore();
  
  const [homeCaptain, setHomeCaptain] = useState<string | null>(null);
  const [awayCaptain, setAwayCaptain] = useState<string | null>(null);
  
  // Initialize match if not already initialized
  useEffect(() => {
    if (!activeTournamentMatch && tournamentId && fixtureId) {
      initializeTournamentMatch(tournamentId, fixtureId);
    }
  }, [tournamentId, fixtureId, activeTournamentMatch, initializeTournamentMatch]);
  
  // Get full player objects from the selected player IDs
  const homePlayers = useMemo(() => {
    if (!activeTournamentMatch) return [];
    return activeTournamentMatch.homeTeamPlayers
      .map(id => getPlayerById(id))
      .filter(p => p !== undefined);
  }, [activeTournamentMatch?.homeTeamPlayers, getPlayerById]);
  
  const awayPlayers = useMemo(() => {
    if (!activeTournamentMatch) return [];
    return activeTournamentMatch.awayTeamPlayers
      .map(id => getPlayerById(id))
      .filter(p => p !== undefined);
  }, [activeTournamentMatch?.awayTeamPlayers, getPlayerById]);
  
  const handleContinue = () => {
    if (!homeCaptain || !awayCaptain) {
      Alert.alert('Incomplete Selection', 'Please select captains for both teams');
      return;
    }
    
    // Save captains to store
    setTournamentMatchCaptains(homeCaptain, awayCaptain);
    
    // Navigate to referee entry
    router.push(`/(football)/startTournament/${tournamentId}/enterReferee?fixtureId=${fixtureId}`);
  };
  
  if (!activeTournamentMatch) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500">No active match found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  if (homePlayers.length === 0 || awayPlayers.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View className="items-center px-6">
          <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="alert-circle" size={32} color="#ef4444" />
          </View>
          <Text className="text-lg font-bold text-slate-900 mb-2">Players Not Selected</Text>
          <Text className="text-slate-500 text-center mb-6">
            Please go back and select players for both teams first.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Select Captains</Text>
          <View className="w-10" />
        </View>

        {/* Progress */}
        <View className="bg-amber-50 rounded-xl p-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="star" size={24} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-amber-700 mb-1">Match Setup Progress</Text>
              <Text className="text-base font-bold text-amber-900">
                {(homeCaptain && awayCaptain) ? '2/2 Captains Selected' : `${(homeCaptain ? 1 : 0) + (awayCaptain ? 1 : 0)}/2 Captains Selected`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        {/* Home Team Captain */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 bg-emerald-500 rounded-lg items-center justify-center mr-2">
              <Ionicons name="shield" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900">
                {activeTournamentMatch.homeTeamName} Captain
              </Text>
              <Text className="text-xs text-slate-500 mt-1">
                Select from {homePlayers.length} players
              </Text>
            </View>
          </View>

          {homePlayers.map((player) => (
            <TouchableOpacity
              key={player.id}
              onPress={() => setHomeCaptain(player.id)}
              className={`bg-white rounded-xl p-4 mb-3 border-2 ${
                homeCaptain === player.id ? 'border-emerald-500' : 'border-slate-100'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                      homeCaptain === player.id ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}
                  >
                    <Ionicons
                      name={homeCaptain === player.id ? "star" : "person"}
                      size={24}
                      color={homeCaptain === player.id ? '#10b981' : '#64748b'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                      {player.name}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-1">
                      {player.position}
                    </Text>
                  </View>
                </View>
                {homeCaptain === player.id && (
                  <View className="bg-emerald-100 px-3 py-1 rounded-lg">
                    <Text className="text-xs font-bold text-emerald-700">CAPTAIN</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Away Team Captain */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 bg-red-500 rounded-lg items-center justify-center mr-2">
              <Ionicons name="flag" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900">
                {activeTournamentMatch.awayTeamName} Captain
              </Text>
              <Text className="text-xs text-slate-500 mt-1">
                Select from {awayPlayers.length} players
              </Text>
            </View>
          </View>

          {awayPlayers.map((player) => (
            <TouchableOpacity
              key={player.id}
              onPress={() => setAwayCaptain(player.id)}
              className={`bg-white rounded-xl p-4 mb-3 border-2 ${
                awayCaptain === player.id ? 'border-red-500' : 'border-slate-100'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                      awayCaptain === player.id ? 'bg-red-100' : 'bg-slate-100'
                    }`}
                  >
                    <Ionicons
                      name={awayCaptain === player.id ? "star" : "person"}
                      size={24}
                      color={awayCaptain === player.id ? '#ef4444' : '#64748b'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                      {player.name}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-1">
                      {player.position}
                    </Text>
                  </View>
                </View>
                {awayCaptain === player.id && (
                  <View className="bg-red-100 px-3 py-1 rounded-lg">
                    <Text className="text-xs font-bold text-red-700">CAPTAIN</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Continue Button */}
      <View className="bg-white px-4 py-4 border-t border-slate-200">
        <TouchableOpacity
          onPress={handleContinue}
          className={`rounded-xl py-4 items-center ${
            homeCaptain && awayCaptain ? 'bg-blue-600' : 'bg-slate-300'
          }`}
          disabled={!homeCaptain || !awayCaptain}
        >
          <Text className="text-white font-bold text-base">Continue to Referees</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}