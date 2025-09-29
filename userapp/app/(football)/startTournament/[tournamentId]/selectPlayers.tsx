// app/(football)/tournaments/[tournamentId]/selectPlayers.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTournamentStore } from '@/store/footballTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function TournamentSelectPlayersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tournamentId = params.tournamentId as string;
  const fixtureId = params.fixtureId as string;

  const { activeTournamentMatch, setTournamentMatchPlayers } = useTournamentStore();
  const { players } = useFootballStore();

  const [homeSelectedPlayers, setHomeSelectedPlayers] = useState<string[]>([]);
  const [awaySelectedPlayers, setAwaySelectedPlayers] = useState<string[]>([]);
  const [currentTeam, setCurrentTeam] = useState<'home' | 'away'>('home');

  const requiredPlayers = 11; // Can be dynamic based on tournament settings

  // Get available players (filter by team if needed)
  const availablePlayers = useMemo(() => {
    return players.filter(p => p.isRegistered);
  }, [players]);

  const isPlayerSelected = (playerId: string) => {
    if (currentTeam === 'home') {
      return homeSelectedPlayers.includes(playerId);
    } else {
      return awaySelectedPlayers.includes(playerId);
    }
  };

  const togglePlayer = (playerId: string) => {
    if (currentTeam === 'home') {
      if (homeSelectedPlayers.includes(playerId)) {
        setHomeSelectedPlayers(prev => prev.filter(id => id !== playerId));
      } else {
        if (homeSelectedPlayers.length >= requiredPlayers) {
          Alert.alert('Maximum Reached', `You can only select ${requiredPlayers} players`);
          return;
        }
        setHomeSelectedPlayers(prev => [...prev, playerId]);
      }
    } else {
      if (awaySelectedPlayers.includes(playerId)) {
        setAwaySelectedPlayers(prev => prev.filter(id => id !== playerId));
      } else {
        if (awaySelectedPlayers.length >= requiredPlayers) {
          Alert.alert('Maximum Reached', `You can only select ${requiredPlayers} players`);
          return;
        }
        setAwaySelectedPlayers(prev => [...prev, playerId]);
      }
    }
  };

  const handleContinue = () => {
    if (currentTeam === 'home') {
      if (homeSelectedPlayers.length !== requiredPlayers) {
        Alert.alert('Incomplete Selection', `Please select exactly ${requiredPlayers} players for ${activeTournamentMatch?.homeTeamName}`);
        return;
      }
      setCurrentTeam('away');
    } else {
      if (awaySelectedPlayers.length !== requiredPlayers) {
        Alert.alert('Incomplete Selection', `Please select exactly ${requiredPlayers} players for ${activeTournamentMatch?.awayTeamName}`);
        return;
      }
      
      // Save players to store
      setTournamentMatchPlayers(homeSelectedPlayers, awaySelectedPlayers);
      
      // Navigate to captain selection
      router.push(`/(football)/startTournament/${tournamentId}/selectCaptains?fixtureId=${fixtureId}`);
    }
  };

  const getCurrentTeamName = () => {
    return currentTeam === 'home' 
      ? activeTournamentMatch?.homeTeamName 
      : activeTournamentMatch?.awayTeamName;
  };

  const getCurrentCount = () => {
    return currentTeam === 'home' 
      ? homeSelectedPlayers.length 
      : awaySelectedPlayers.length;
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

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Select Players</Text>
          <View className="w-10" />
        </View>

        {/* Team Indicator */}
        <View className="bg-blue-50 rounded-xl p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-blue-700 mb-1">Selecting for</Text>
              <Text className="text-xl font-bold text-blue-900">{getCurrentTeamName()}</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="people" size={28} color="#1e40af" />
              </View>
              <Text className="text-sm font-bold text-blue-900">
                {getCurrentCount()} / {requiredPlayers}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Tabs */}
        <View className="flex-row mt-4">
          <View className={`flex-1 items-center py-2 border-b-2 ${
            currentTeam === 'home' ? 'border-blue-600' : 'border-green-600'
          }`}>
            <Text className={`text-sm font-semibold ${
              currentTeam === 'home' ? 'text-blue-600' : 'text-green-600'
            }`}>
              {activeTournamentMatch.homeTeamName}
            </Text>
            <Text className="text-xs text-slate-500 mt-1">
              {homeSelectedPlayers.length} / {requiredPlayers}
            </Text>
          </View>
          <View className={`flex-1 items-center py-2 border-b-2 ${
            currentTeam === 'away' ? 'border-blue-600' : 'border-slate-200'
          }`}>
            <Text className={`text-sm font-semibold ${
              currentTeam === 'away' ? 'text-blue-600' : 'text-slate-500'
            }`}>
              {activeTournamentMatch.awayTeamName}
            </Text>
            <Text className="text-xs text-slate-500 mt-1">
              {awaySelectedPlayers.length} / {requiredPlayers}
            </Text>
          </View>
        </View>
      </View>

      {/* Players List */}
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-sm font-semibold text-slate-700 mb-3">
          Available Players ({availablePlayers.length})
        </Text>
        
        {availablePlayers.map((player) => {
          const selected = isPlayerSelected(player.id);
          return (
            <TouchableOpacity
              key={player.id}
              onPress={() => togglePlayer(player.id)}
              className={`bg-white rounded-xl p-4 mb-3 border-2 ${
                selected ? 'border-blue-500' : 'border-slate-100'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                      selected ? 'bg-blue-100' : 'bg-slate-100'
                    }`}
                  >
                    <Ionicons
                      name="person"
                      size={24}
                      color={selected ? '#3b82f6' : '#64748b'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                      {player.name}
                    </Text>
                   
                  </View>
                </View>
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
                    selected
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-slate-300'
                  }`}
                >
                  {selected && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View className="h-24" />
      </ScrollView>

      {/* Continue Button */}
      <View className="bg-white px-4 py-4 border-t border-slate-200">
        <TouchableOpacity
          onPress={handleContinue}
          className={`rounded-xl py-4 items-center ${
            getCurrentCount() === requiredPlayers ? 'bg-blue-600' : 'bg-slate-300'
          }`}
          disabled={getCurrentCount() !== requiredPlayers}
        >
          <Text className="text-white font-bold text-base">
            {currentTeam === 'home' ? 'Continue to Away Team' : 'Continue to Captains'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}