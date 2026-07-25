// app/(football)/tournaments/[tournamentId].tsx
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTournamentStore } from '@/store/tournamentStore';

type TabType = 'fixtures' | 'standings' | 'matches';

export default function TournamentDashboardScreen() {
  const router = useRouter();
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();

  const { getTournament, getStandings, fetchTournamentById, startTournament, isLoading } = useTournamentStore();

  const [activeTab, setActiveTab] = useState<TabType>('fixtures');

  useFocusEffect(
    useCallback(() => {
      if (tournamentId) fetchTournamentById(tournamentId);
    }, [tournamentId])
  );

  const tournament = getTournament(tournamentId);
  const standings = useMemo(() => (tournamentId ? getStandings(tournamentId) : []), [tournamentId, tournament]);

  const upcomingFixtures = useMemo(
    () => tournament?.fixtures.filter((f) => f.status === 'ready') ?? [],
    [tournament]
  );
  const completedFixtures = useMemo(
    () => tournament?.fixtures.filter((f) => f.status === 'completed') ?? [],
    [tournament]
  );

  const progressPercentage = useMemo(() => {
    if (!tournament || tournament.fixtures.length === 0) return 0;
    return Math.round((completedFixtures.length / tournament.fixtures.length) * 100);
  }, [tournament, completedFixtures.length]);

  const handleStartTournament = () => {
    Alert.alert(
      'Start Tournament',
      'Are you ready to start this tournament? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              await startTournament(tournamentId);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Could not start tournament');
            }
          },
        },
      ]
    );
  };

  const handlePlayMatch = (fixtureId: string) => {
    router.push({
      pathname: '/(football)/startTournament/[tournamentId]/selectPlayers',
      params: { tournamentId, fixtureId },
    });
  };

  const handleGoBack = () => router.push('/(football)/landingScreen/tournament');

  if (isLoading && !tournament) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0f172a" />
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View className="items-center px-6">
          <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="trophy-outline" size={32} color="#64748b" />
          </View>
          <Text className="text-lg font-bold text-slate-900 mb-2">Tournament Not Found</Text>
          <Text className="text-slate-500 text-center mb-6">
            The tournament doesn't exist or may have been deleted.
          </Text>
          <TouchableOpacity onPress={handleGoBack} className="bg-blue-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Go to Tournaments</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={handleGoBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>

        {/* Tournament Header */}
        <View>
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 bg-amber-100 rounded-lg items-center justify-center mr-3">
              <Ionicons name="trophy" size={20} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>
                {tournament.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className={`px-2 py-1 rounded ${
                  tournament.status === 'ongoing' ? 'bg-green-100' :
                  tournament.status === 'completed' ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <Text className={`text-xs font-semibold ${
                    tournament.status === 'ongoing' ? 'text-green-700' :
                    tournament.status === 'completed' ? 'text-blue-700' : 'text-slate-600'
                  }`}>
                    {tournament.status.toUpperCase()}
                  </Text>
                </View>
                <Text className="text-xs text-slate-500 ml-2">League Format</Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-slate-600 font-medium">Tournament Progress</Text>
              <Text className="text-xs text-slate-600 font-bold">{progressPercentage}%</Text>
            </View>
            <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <View className="h-full bg-green-500" style={{ width: `${progressPercentage}%` }} />
            </View>
            <Text className="text-xs text-slate-500 mt-1">
              {completedFixtures.length} of {tournament.fixtures.length} matches completed
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View className="bg-white px-4 py-4 border-b border-slate-100">
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-slate-900">{tournament.entries.length}</Text>
            <Text className="text-xs text-slate-500 mt-1">Teams</Text>
          </View>
          <View className="w-px bg-slate-200" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-slate-900">{tournament.fixtures.length}</Text>
            <Text className="text-xs text-slate-500 mt-1">Matches</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white px-4 pt-2 border-b border-slate-100">
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab('fixtures')}
            className={`flex-1 items-center pb-3 border-b-2 ${activeTab === 'fixtures' ? 'border-blue-600' : 'border-transparent'}`}
          >
            <Text className={`font-semibold text-sm ${activeTab === 'fixtures' ? 'text-blue-600' : 'text-slate-500'}`}>Fixtures</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('standings')}
            className={`flex-1 items-center pb-3 border-b-2 ${activeTab === 'standings' ? 'border-blue-600' : 'border-transparent'}`}
          >
            <Text className={`font-semibold text-sm ${activeTab === 'standings' ? 'text-blue-600' : 'text-slate-500'}`}>Standings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('matches')}
            className={`flex-1 items-center pb-3 border-b-2 ${activeTab === 'matches' ? 'border-blue-600' : 'border-transparent'}`}
          >
            <Text className={`font-semibold text-sm ${activeTab === 'matches' ? 'text-blue-600' : 'text-slate-500'}`}>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Fixtures Tab */}
        {activeTab === 'fixtures' && (
          <View>
            {upcomingFixtures.length === 0 ? (
              <View className="items-center justify-center py-16">
                <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="calendar-outline" size={32} color="#64748b" />
                </View>
                <Text className="text-lg font-bold text-slate-900 mb-2">No Upcoming Fixtures</Text>
                <Text className="text-slate-500 text-center">
                  {tournament.status === 'draft'
                    ? 'Start the tournament to begin playing matches'
                    : 'All matches have been completed'}
                </Text>
              </View>
            ) : (
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-4">Upcoming Matches</Text>

                {upcomingFixtures.map((fixture) => (
                  <View key={fixture.id} className="bg-white rounded-xl p-4 mb-3 border border-slate-100">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-xs font-semibold text-slate-500">Round {fixture.round}</Text>
                      <View className="bg-blue-50 px-2 py-1 rounded">
                        <Text className="text-xs font-semibold text-blue-700">UPCOMING</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1 flex-row items-center">
                        <View className="w-8 h-8 bg-emerald-500 rounded-lg items-center justify-center mr-2">
                          <Ionicons name="shield" size={14} color="white" />
                        </View>
                        <Text className="text-sm font-bold text-slate-900 flex-1" numberOfLines={1}>
                          {fixture.homeTeam?.name}
                        </Text>
                      </View>
                      <Text className="text-lg font-bold text-slate-400 mx-4">vs</Text>
                      <View className="flex-1 flex-row items-center justify-end">
                        <Text className="text-sm font-bold text-slate-900 flex-1 text-right" numberOfLines={1}>
                          {fixture.awayTeam?.name}
                        </Text>
                        <View className="w-8 h-8 bg-red-500 rounded-lg items-center justify-center ml-2">
                          <Ionicons name="flag" size={14} color="white" />
                        </View>
                      </View>
                    </View>

                    {tournament.status === 'ongoing' && fixture.homeTeamId && fixture.awayTeamId && (
                      <TouchableOpacity onPress={() => handlePlayMatch(fixture.id)} className="bg-blue-600 rounded-lg py-3 items-center">
                        <Text className="text-white font-semibold text-sm">Play Match</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Standings Tab */}
        {activeTab === 'standings' && (
          <View>
            {standings.length === 0 ? (
              <View className="items-center justify-center py-16">
                <Text className="text-slate-500">No standings available yet</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="bg-white rounded-xl border border-slate-100 overflow-hidden mb-6 min-w-[720px]">
                  <View className="flex-row items-center bg-slate-50 px-4 py-3 border-b border-slate-100">
                    <Text className="w-10 text-xs font-bold text-slate-600">#</Text>
                    <Text className="w-40 text-xs font-bold text-slate-600">Team</Text>
                    <Text className="w-10 text-xs font-bold text-slate-600 text-center">P</Text>
                    <Text className="w-10 text-xs font-bold text-slate-600 text-center">W</Text>
                    <Text className="w-10 text-xs font-bold text-slate-600 text-center">D</Text>
                    <Text className="w-10 text-xs font-bold text-slate-600 text-center">L</Text>
                    <Text className="w-14 text-xs font-bold text-slate-600 text-center">+/-</Text>
                    <Text className="w-12 text-xs font-bold text-slate-600 text-center">GD</Text>
                    <Text className="w-12 text-xs font-bold text-slate-600 text-center">Pts</Text>
                  </View>

                  {standings.map((entry, index) => {
                    const gd = entry.goalsFor - entry.goalsAgainst;
                    return (
                      <View
                        key={entry.id}
                        className={`flex-row items-center px-4 py-3 ${index < standings.length - 1 ? 'border-b border-slate-50' : ''}`}
                      >
                        <Text className="w-10 text-sm font-bold text-slate-900">{index + 1}</Text>
                        <View className="w-40 pr-2">
                          <Text className="text-sm font-semibold text-slate-900" numberOfLines={2}>
                            {entry.team?.name}
                          </Text>
                        </View>
                        <Text className="w-10 text-sm text-slate-600 text-center">{entry.played}</Text>
                        <Text className="w-10 text-sm text-slate-600 text-center">{entry.won}</Text>
                        <Text className="w-10 text-sm text-slate-600 text-center">{entry.drawn}</Text>
                        <Text className="w-10 text-sm text-slate-600 text-center">{entry.lost}</Text>
                        <Text className="w-14 text-sm text-slate-700 text-center">{entry.goalsFor}/{entry.goalsAgainst}</Text>
                        <Text className={`w-12 text-sm font-semibold text-center ${gd > 0 ? 'text-green-600' : gd < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                          {gd > 0 ? `+${gd}` : gd}
                        </Text>
                        <Text className="w-12 text-sm font-bold text-slate-900 text-center">{entry.points}</Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {/* Completed Matches Tab */}
        {activeTab === 'matches' && (
          <View>
            {completedFixtures.length === 0 ? (
              <View className="items-center justify-center py-16">
                <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle-outline" size={32} color="#64748b" />
                </View>
                <Text className="text-lg font-bold text-slate-900 mb-2">No Completed Matches</Text>
                <Text className="text-slate-500 text-center">Completed matches will appear here</Text>
              </View>
            ) : (
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-4">Completed Matches</Text>

                {completedFixtures.map((fixture) => (
                  <TouchableOpacity
                    key={fixture.id}
                    className="bg-white rounded-xl p-4 mb-3 border border-slate-100"
                    onPress={() => {
                      if (fixture.matchId) {
                        router.push({ pathname: '/(football)/matchDetails/[matchId]', params: { matchId: fixture.matchId } });
                      }
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-xs font-semibold text-slate-500">Round {fixture.round}</Text>
                      <View className="bg-green-50 px-2 py-1 rounded">
                        <Text className="text-xs font-semibold text-green-700">COMPLETED</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 flex-row items-center">
                        <View className="w-8 h-8 bg-emerald-500 rounded-lg items-center justify-center mr-2">
                          <Ionicons name="shield" size={14} color="white" />
                        </View>
                        <Text className="text-sm font-bold flex-1 text-slate-900" numberOfLines={1}>
                          {fixture.homeTeam?.name}
                        </Text>
                      </View>

                      <View className="flex-1 flex-row items-center justify-end">
                        <Text className="text-sm font-bold flex-1 text-right text-slate-900" numberOfLines={1}>
                          {fixture.awayTeam?.name}
                        </Text>
                        <View className="w-8 h-8 bg-red-500 rounded-lg items-center justify-center ml-2">
                          <Ionicons name="flag" size={14} color="white" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Tournament Control Buttons */}
      {tournament.status === 'draft' && (
        <View className="bg-white px-4 py-4 border-t border-slate-200">
          <TouchableOpacity onPress={handleStartTournament} className="bg-green-600 rounded-xl py-4 items-center">
            <View className="flex-row items-center">
              <Ionicons name="play" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Start Tournament</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
