import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTournamentStore } from '@/store/footballTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function TournamentSelectSubstitutesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tournamentId = params.tournamentId as string;
  const fixtureId = params.fixtureId as string;
  
  const { 
    getTournament,
    activeTournamentMatch, 
    setTournamentMatchSubstitutes
  } = useTournamentStore();
  
  const { getTeamPlayers } = useFootballStore();
  
  const [homeSubs, setHomeSubs] = useState<string[]>([]);
  const [awaySubs, setAwaySubs] = useState<string[]>([]);
  const [currentTeam, setCurrentTeam] = useState<'home' | 'away'>('home');
  
  const tournament = getTournament(tournamentId);
  // Default to 7 if not set, or use tournament settings
  const maxSubs = tournament?.settings.numberOfSubstitutes ?? 5;
  
  // We need to know who is already a starter to filter them out
  const homeStarters = activeTournamentMatch?.homeTeamPlayers || [];
  const awayStarters = activeTournamentMatch?.awayTeamPlayers || [];

  const homeAvailableForBench = useMemo(() => {
    if (!activeTournamentMatch || !tournament) return [];
    const tournamentTeam = tournament.teams.find(t => t.id === activeTournamentMatch.homeTeamId);
    if (!tournamentTeam) return [];
    const allPlayers = getTeamPlayers(tournamentTeam.teamId);
    // Filter out starters
    return allPlayers.filter(p => !homeStarters.includes(p.id));
  }, [activeTournamentMatch, tournament, getTeamPlayers, homeStarters]);

  const awayAvailableForBench = useMemo(() => {
    if (!activeTournamentMatch || !tournament) return [];
    const tournamentTeam = tournament.teams.find(t => t.id === activeTournamentMatch.awayTeamId);
    if (!tournamentTeam) return [];
    const allPlayers = getTeamPlayers(tournamentTeam.teamId);
    return allPlayers.filter(p => !awayStarters.includes(p.id));
  }, [activeTournamentMatch, tournament, getTeamPlayers, awayStarters]);
  
  const currentAvailableList = currentTeam === 'home' ? homeAvailableForBench : awayAvailableForBench;
  
  const isSelected = (playerId: string) => {
    return currentTeam === 'home' 
      ? homeSubs.includes(playerId)
      : awaySubs.includes(playerId);
  };
  
  const toggleSub = (playerId: string) => {
    if (currentTeam === 'home') {
      if (homeSubs.includes(playerId)) {
        setHomeSubs(prev => prev.filter(id => id !== playerId));
      } else {
        if (homeSubs.length >= maxSubs) {
            Alert.alert('Bench Full', `Max ${maxSubs} substitutes allowed.`);
            return;
        }
        setHomeSubs(prev => [...prev, playerId]);
      }
    } else {
      if (awaySubs.includes(playerId)) {
        setAwaySubs(prev => prev.filter(id => id !== playerId));
      } else {
        if (awaySubs.length >= maxSubs) {
            Alert.alert('Bench Full', `Max ${maxSubs} substitutes allowed.`);
            return;
        }
        setAwaySubs(prev => [...prev, playerId]);
      }
    }
  };
  
  const handleContinue = () => {
    if (currentTeam === 'home') {
        // You can have 0 subs, that's allowed.
        setCurrentTeam('away');
    } else {
        // Save to store
        setTournamentMatchSubstitutes(homeSubs, awaySubs);
        // Navigate to Captains
        router.push(`/(football)/startTournament/${tournamentId}/selectCaptains?fixtureId=${fixtureId}`);
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
  const getCurrentCount = () => currentTeam === 'home' ? homeSubs.length : awaySubs.length;
  
  if (!activeTournamentMatch) return null; // Should ideally show error screen

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Select Bench</Text>
          <View className="w-10" />
        </View>

        <View className="bg-amber-50 rounded-xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm text-amber-700 mb-1">Substitutes for</Text>
              <Text className="text-xl font-bold text-amber-900">{getCurrentTeamName()}</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="people" size={28} color="#b45309" />
              </View>
              <Text className="text-sm font-bold text-amber-900">{getCurrentCount()} / {maxSubs}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-sm font-semibold text-slate-700 mb-3">Available for Bench</Text>
        {currentAvailableList.length === 0 ? (
             <Text className="text-slate-500 text-center py-10">No more players available.</Text>
        ) : (
            currentAvailableList.map((player) => {
            const selected = isSelected(player.id);
            return (
                <TouchableOpacity
                key={player.id}
                onPress={() => toggleSub(player.id)}
                className={`bg-white rounded-xl p-4 mb-3 border-2 ${selected ? 'border-amber-500' : 'border-slate-100'}`}
                >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                    <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${selected ? 'bg-amber-100' : 'bg-slate-100'}`}>
                        <Ionicons name="person" size={24} color={selected ? '#d97706' : '#64748b'} />
                    </View>
                    <View>
                        <Text className="text-base font-bold text-slate-900">{player.name}</Text>
                        <Text className="text-xs text-slate-500">{player.position}</Text>
                    </View>
                    </View>
                    <View className={`w-6 h-6 rounded-full items-center justify-center border-2 ${selected ? 'bg-amber-500 border-amber-500' : 'border-slate-300'}`}>
                    {selected && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                </View>
                </TouchableOpacity>
            );
            })
        )}
        <View className="h-24" />
      </ScrollView>

      <View className="bg-white px-4 py-4 border-t border-slate-200">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-blue-600 rounded-xl py-4 items-center"
        >
          <Text className="text-white font-bold text-base">
            {currentTeam === 'home' ? 'Continue to Away Bench' : 'Continue to Captains'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}