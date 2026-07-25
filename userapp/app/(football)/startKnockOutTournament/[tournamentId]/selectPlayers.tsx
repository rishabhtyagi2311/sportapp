import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTournamentStore } from '@/store/tournamentStore';
import { useMatchCreationStore } from '@/store/footballMatchCreationStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function KnockoutSelectPlayersScreen() {
  const router = useRouter();
  const { tournamentId, fixtureId } = useLocalSearchParams<{ tournamentId: string; fixtureId: string }>();

  const { getTournament } = useTournamentStore();
  const { matchData, initializeMatch, updateMatchDetails, updateMyTeamPlayers, updateOpponentTeamPlayers } = useMatchCreationStore();
  const { getTeamById } = useFootballStore();

  const tournament = getTournament(tournamentId);
  const fixture = tournament?.fixtures.find((f) => f.id === fixtureId);
  const requiredPlayers = tournament?.playersPerTeam ?? 11;

  const [currentTeam, setCurrentTeam] = useState<'home' | 'away'>('home');
  const [homeSelectedPlayers, setHomeSelectedPlayers] = useState<number[]>([]);
  const [awaySelectedPlayers, setAwaySelectedPlayers] = useState<number[]>([]);

  useEffect(() => {
    if (!fixture?.homeTeamId || !fixture?.awayTeamId) return;
    if (matchData.myTeam.teamId === fixture.homeTeamId && matchData.opponentTeam.teamId === fixture.awayTeamId) return;

    initializeMatch(fixture.homeTeamId, fixture.homeTeam?.name ?? 'Home', fixture.awayTeamId, fixture.awayTeam?.name ?? 'Away');
    updateMatchDetails({ name: tournament?.venueName || 'TBD', isCustom: true }, requiredPlayers, []);
  }, [fixture?.homeTeamId, fixture?.awayTeamId]);

  const homeTeamPlayers = useMemo(() => {
    if (!fixture?.homeTeamId) return [];
    return getTeamById(fixture.homeTeamId)?.members.map((m) => m.footballProfile) ?? [];
  }, [fixture?.homeTeamId, getTeamById]);

  const awayTeamPlayers = useMemo(() => {
    if (!fixture?.awayTeamId) return [];
    return getTeamById(fixture.awayTeamId)?.members.map((m) => m.footballProfile) ?? [];
  }, [fixture?.awayTeamId, getTeamById]);

  const availablePlayers = currentTeam === 'home' ? homeTeamPlayers : awayTeamPlayers;
  const selectedPlayers = currentTeam === 'home' ? homeSelectedPlayers : awaySelectedPlayers;
  const setSelectedPlayers = currentTeam === 'home' ? setHomeSelectedPlayers : setAwaySelectedPlayers;

  const togglePlayer = (playerId: number) => {
    setSelectedPlayers((prev) => {
      if (prev.includes(playerId)) return prev.filter((id) => id !== playerId);
      if (prev.length >= requiredPlayers) {
        Alert.alert('Maximum Reached', `You have selected all ${requiredPlayers} starting players.`);
        return prev;
      }
      return [...prev, playerId];
    });
  };

  const handleContinue = () => {
    if (selectedPlayers.length !== requiredPlayers) {
      Alert.alert('Incomplete Selection', `Please select exactly ${requiredPlayers} starters.`);
      return;
    }

    if (currentTeam === 'home') {
      updateMyTeamPlayers(homeSelectedPlayers);
      setCurrentTeam('away');
    } else {
      updateOpponentTeamPlayers(awaySelectedPlayers);
      router.push({
        pathname: '/(football)/startKnockOutTournament/[tournamentId]/selectSubstitution',
        params: { tournamentId, fixtureId },
      });
    }
  };

  const handleBack = () => {
    if (currentTeam === 'away') setCurrentTeam('home');
    else router.back();
  };

  const getCurrentTeamName = () => (currentTeam === 'home' ? matchData.myTeam.teamName : matchData.opponentTeam.teamName);

  if (!fixture) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500">Fixture not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-orange-600 px-6 py-3 rounded-xl">
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

        <View className="bg-orange-50 rounded-xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm text-orange-700 mb-1">Starting XI for</Text>
              <Text className="text-xl font-bold text-orange-900">{getCurrentTeamName()}</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="shirt" size={28} color="#c2410c" />
              </View>
              <Text className="text-sm font-bold text-orange-900">{selectedPlayers.length} / {requiredPlayers}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-sm font-semibold text-slate-700 mb-3">Available Players</Text>
        {availablePlayers.map((player) => {
          const selected = selectedPlayers.includes(player.id);
          return (
            <TouchableOpacity
              key={player.id}
              onPress={() => togglePlayer(player.id)}
              className={`bg-white rounded-xl p-4 mb-3 border-2 ${selected ? 'border-orange-500' : 'border-slate-100'}`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${selected ? 'bg-orange-100' : 'bg-slate-100'}`}>
                    <Ionicons name="person" size={24} color={selected ? '#c2410c' : '#64748b'} />
                  </View>
                  <View>
                    <Text className="text-base font-bold text-slate-900">{player.nickname}</Text>
                    <Text className="text-xs text-slate-500">{player.role}</Text>
                  </View>
                </View>
                <View className={`w-6 h-6 rounded-full items-center justify-center border-2 ${selected ? 'bg-orange-600 border-orange-600' : 'border-slate-300'}`}>
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
          className={`rounded-xl py-4 items-center ${selectedPlayers.length === requiredPlayers ? 'bg-orange-600' : 'bg-slate-300'}`}
          disabled={selectedPlayers.length !== requiredPlayers}
        >
          <Text className="text-white font-bold text-base">
            {currentTeam === 'home' ? 'Continue to Away Starters' : 'Continue to Substitutes'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
