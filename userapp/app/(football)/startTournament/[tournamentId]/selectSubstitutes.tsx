import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTournamentStore } from '@/store/tournamentStore';
import { useMatchCreationStore } from '@/store/footballMatchCreationStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function TournamentSelectSubstitutesScreen() {
  const router = useRouter();
  const { tournamentId, fixtureId } = useLocalSearchParams<{ tournamentId: string; fixtureId: string }>();

  const { getTournament } = useTournamentStore();
  const { matchData, updateSubstitutes } = useMatchCreationStore();
  const { getTeamById } = useFootballStore();

  const tournament = getTournament(tournamentId);
  const fixture = tournament?.fixtures.find((f) => f.id === fixtureId);
  const maxSubs = tournament?.allowedSubs ?? 5;

  const [homeSubs, setHomeSubs] = useState<number[]>([]);
  const [awaySubs, setAwaySubs] = useState<number[]>([]);
  const [currentTeam, setCurrentTeam] = useState<'home' | 'away'>('home');

  const homeAvailableForBench = useMemo(() => {
    if (!fixture?.homeTeamId) return [];
    const roster = getTeamById(fixture.homeTeamId)?.members.map((m) => m.footballProfile) ?? [];
    return roster.filter((p) => !matchData.myTeam.selectedPlayers.includes(p.id));
  }, [fixture?.homeTeamId, getTeamById, matchData.myTeam.selectedPlayers]);

  const awayAvailableForBench = useMemo(() => {
    if (!fixture?.awayTeamId) return [];
    const roster = getTeamById(fixture.awayTeamId)?.members.map((m) => m.footballProfile) ?? [];
    return roster.filter((p) => !matchData.opponentTeam.selectedPlayers.includes(p.id));
  }, [fixture?.awayTeamId, getTeamById, matchData.opponentTeam.selectedPlayers]);

  const currentAvailableList = currentTeam === 'home' ? homeAvailableForBench : awayAvailableForBench;
  const currentSubs = currentTeam === 'home' ? homeSubs : awaySubs;
  const setCurrentSubs = currentTeam === 'home' ? setHomeSubs : setAwaySubs;

  const toggleSub = (playerId: number) => {
    setCurrentSubs((prev) => {
      if (prev.includes(playerId)) return prev.filter((id) => id !== playerId);
      if (prev.length >= maxSubs) {
        Alert.alert('Bench Full', `Max ${maxSubs} substitutes allowed.`);
        return prev;
      }
      return [...prev, playerId];
    });
  };

  const handleContinue = () => {
    if (currentTeam === 'home') {
      setCurrentTeam('away');
    } else {
      updateSubstitutes(homeSubs, awaySubs);
      router.push({
        pathname: '/(football)/startTournament/[tournamentId]/selectCaptains',
        params: { tournamentId, fixtureId },
      });
    }
  };

  const handleBack = () => {
    if (currentTeam === 'away') setCurrentTeam('home');
    else router.back();
  };

  const getCurrentTeamName = () => (currentTeam === 'home' ? matchData.myTeam.teamName : matchData.opponentTeam.teamName);

  if (!fixture) return null;

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
              <Text className="text-sm font-bold text-amber-900">{currentSubs.length} / {maxSubs}</Text>
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
            const selected = currentSubs.includes(player.id);
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
                      <Text className="text-base font-bold text-slate-900">{player.nickname}</Text>
                      <Text className="text-xs text-slate-500">{player.role}</Text>
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
