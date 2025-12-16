import React, { useState, useMemo, useEffect } from 'react';
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
  
  const { 
    getTournament,
    activeTournamentMatch, 
    setTournamentMatchPlayers,
    initializeTournamentMatch
  } = useTournamentStore();
  
  const { getTeamPlayers } = useFootballStore();
  
  const [homeSelectedPlayers, setHomeSelectedPlayers] = useState<string[]>([]);
  const [awaySelectedPlayers, setAwaySelectedPlayers] = useState<string[]>([]);
  const [currentTeam, setCurrentTeam] = useState<'home' | 'away'>('home');
  
  const tournament = getTournament(tournamentId);
  // These are the STARTERS
  const requiredPlayers = tournament?.settings.numberOfPlayers || 11;
  
  useEffect(() => {
    if (!activeTournamentMatch && tournamentId && fixtureId) {
      initializeTournamentMatch(tournamentId, fixtureId);
    }
  }, [tournamentId, fixtureId, activeTournamentMatch, initializeTournamentMatch]);
  
  const homeTeamPlayers = useMemo(() => {
    if (!activeTournamentMatch || !tournament) return [];
    const tournamentTeam = tournament.teams.find(t => t.id === activeTournamentMatch.homeTeamId);
    if (!tournamentTeam) return [];
    return getTeamPlayers(tournamentTeam.teamId);
  }, [activeTournamentMatch, tournament, getTeamPlayers]);
  
  const awayTeamPlayers = useMemo(() => {
    if (!activeTournamentMatch || !tournament) return [];
    const tournamentTeam = tournament.teams.find(t => t.id === activeTournamentMatch.awayTeamId);
    if (!tournamentTeam) return [];
    return getTeamPlayers(tournamentTeam.teamId);
  }, [activeTournamentMatch, tournament, getTeamPlayers]);
  
  const availablePlayers = useMemo(() => {
    return currentTeam === 'home' ? homeTeamPlayers : awayTeamPlayers;
  }, [currentTeam, homeTeamPlayers, awayTeamPlayers]);
  
  const isPlayerSelected = (playerId: string) => {
    return currentTeam === 'home' 
      ? homeSelectedPlayers.includes(playerId)
      : awaySelectedPlayers.includes(playerId);
  };
  
  const togglePlayer = (playerId: string) => {
    if (currentTeam === 'home') {
      if (homeSelectedPlayers.includes(playerId)) {
        setHomeSelectedPlayers(prev => prev.filter(id => id !== playerId));
      } else {
        if (homeSelectedPlayers.length >= requiredPlayers) {
          Alert.alert('Maximum Reached', `You have selected all ${requiredPlayers} starting players.`);
          return;
        }
        setHomeSelectedPlayers(prev => [...prev, playerId]);
      }
    } else {
      if (awaySelectedPlayers.includes(playerId)) {
        setAwaySelectedPlayers(prev => prev.filter(id => id !== playerId));
      } else {
        if (awaySelectedPlayers.length >= requiredPlayers) {
          Alert.alert('Maximum Reached', `You have selected all ${requiredPlayers} starting players.`);
          return;
        }
        setAwaySelectedPlayers(prev => [...prev, playerId]);
      }
    }
  };
  
  const handleContinue = () => {
    if (currentTeam === 'home') {
      if (homeSelectedPlayers.length !== requiredPlayers) {
        Alert.alert('Incomplete Selection', `Please select exactly ${requiredPlayers} starters for ${activeTournamentMatch?.homeTeamName}`);
        return;
      }
      setCurrentTeam('away');
    } else {
      if (awaySelectedPlayers.length !== requiredPlayers) {
        Alert.alert('Incomplete Selection', `Please select exactly ${requiredPlayers} starters for ${activeTournamentMatch?.awayTeamName}`);
        return;
      }
      
      // Save STARTERS to store
      setTournamentMatchPlayers(homeSelectedPlayers, awaySelectedPlayers);
      
      // Navigate to SUBSTITUTES selection
      router.push(`/(football)/startTournament/${tournamentId}/selectSubstitutes?fixtureId=${fixtureId}`);
    }
  };
  
  const handleBack = () => {
    if (currentTeam === 'away') {
      setCurrentTeam('home');
    } else {
      router.back();
    }
  };
  
  const getCurrentTeamName = () => currentTeam === 'home' ? activeTournamentMatch?.homeTeamName : activeTournamentMatch?.awayTeamName;
  const getCurrentCount = () => currentTeam === 'home' ? homeSelectedPlayers.length : awaySelectedPlayers.length;
  
  if (!activeTournamentMatch) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500">No active match found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-blue-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Select Starters</Text>
          <View className="w-10" />
        </View>

        <View className="bg-blue-50 rounded-xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm text-blue-700 mb-1">Starting XI for</Text>
              <Text className="text-xl font-bold text-blue-900">{getCurrentTeamName()}</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="shirt" size={28} color="#1e40af" />
              </View>
              <Text className="text-sm font-bold text-blue-900">{getCurrentCount()} / {requiredPlayers}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-sm font-semibold text-slate-700 mb-3">Available Players</Text>
        {availablePlayers.map((player) => {
          const selected = isPlayerSelected(player.id);
          return (
            <TouchableOpacity
              key={player.id}
              onPress={() => togglePlayer(player.id)}
              className={`bg-white rounded-xl p-4 mb-3 border-2 ${selected ? 'border-blue-500' : 'border-slate-100'}`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${selected ? 'bg-blue-100' : 'bg-slate-100'}`}>
                    <Ionicons name="person" size={24} color={selected ? '#3b82f6' : '#64748b'} />
                  </View>
                  <View>
                    <Text className="text-base font-bold text-slate-900">{player.name}</Text>
                    <Text className="text-xs text-slate-500">{player.position}</Text>
                  </View>
                </View>
                <View className={`w-6 h-6 rounded-full items-center justify-center border-2 ${selected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                  {selected && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View className="h-24" />
      </ScrollView>

      <View className="bg-white px-4 py-4 border-t border-slate-200">
        <TouchableOpacity
          onPress={handleContinue}
          className={`rounded-xl py-4 items-center ${getCurrentCount() === requiredPlayers ? 'bg-blue-600' : 'bg-slate-300'}`}
          disabled={getCurrentCount() !== requiredPlayers}
        >
          <Text className="text-white font-bold text-base">
            {currentTeam === 'home' ? 'Continue to Away Starters' : 'Continue to Substitutes'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}