// app/(football)/tournaments/[tournamentId].tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTournamentStore } from '@/store/footballTournamentStore';

type TabType = 'fixtures' | 'standings' | 'matches';

export default function TournamentDashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tournamentId = params.tournamentId as string;

  const {
    getTournament,
    getTournamentFixtures,
    getTournamentTable,
    getUpcomingFixtures,
    getCompletedFixtures,
    startTournament,
    initializeTournamentMatch,
  } = useTournamentStore();

  const [activeTab, setActiveTab] = useState<TabType>('fixtures');
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const tournament = useMemo(() => getTournament(tournamentId), [tournamentId, getTournament, refreshKey]);
  const allFixtures = useMemo(() => getTournamentFixtures(tournamentId), [tournamentId, getTournamentFixtures, refreshKey]);
  const upcomingFixtures = useMemo(() => getUpcomingFixtures(tournamentId), [tournamentId, getUpcomingFixtures, refreshKey]);
  const completedFixtures = useMemo(() => getCompletedFixtures(tournamentId), [tournamentId, getCompletedFixtures, refreshKey]);
  console.log(upcomingFixtures);

  // Set initial active table when tournament loads
  useEffect(() => {
    if (tournament?.tables && tournament.tables.length > 0 && !activeTableId) {
      setActiveTableId(tournament.tables[0].id);
    }
  }, [tournament, activeTableId]);

  // Get table standings for the active table (raw)
  const tableStandings = useMemo(() => {
    if (!tournament || !activeTableId) return [];
    return getTournamentTable(tournamentId, activeTableId);
  }, [getTournamentTable, tournamentId, activeTableId, refreshKey]);



  // Sort standings by points desc, then NGR desc (tie-breaker)
  const standingsSorted = useMemo(() => {
    return [...tableStandings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return 0;
    });
  }, [tableStandings]);

  // Filter fixtures: league format only shows group stage
  const filteredUpcomingFixtures = useMemo(() => {
    if (!tournament) return [];
    return upcomingFixtures.filter(fixture => fixture.stage === 'group');
  }, [tournament, upcomingFixtures]);

  const filteredCompletedFixtures = useMemo(() => {
    if (!tournament) return [];
    return completedFixtures.filter(fixture => fixture.stage === 'group');
  }, [tournament, completedFixtures]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (allFixtures.length === 0) return 0;
    return Math.round((completedFixtures.length / allFixtures.length) * 100);
  }, [allFixtures.length, completedFixtures.length]);

  const handleStartTournament = () => {
    Alert.alert(
      'Start Tournament',
      'Are you ready to start this tournament? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          style: 'default',
          onPress: () => {
            startTournament(tournamentId);
            setRefreshKey(prev => prev + 1);
          },
        },
      ]
    );
  };

  const handlePlayMatch = (fixtureId: string) => {
    // basic guards
    if (!tournamentId) {
      Alert.alert('Error', 'Invalid tournament');
      return;
    }

    const fixture = allFixtures.find(f => f.id === fixtureId);
    if (!fixture) {
      Alert.alert('Error', 'Fixture not found');
      return;
    }
    if (!fixture.homeTeamId || !fixture.awayTeamId) {
      Alert.alert('Error', 'Fixture is not ready. Teams are not set.');
      return;
    }

    const matchData = initializeTournamentMatch(tournamentId, fixtureId);
    if (!matchData) {
      Alert.alert('Error', 'Unable to initialize match');
      return;
    }

    router.push(
      `/(football)/startTournament/${encodeURIComponent(tournamentId)}/selectPlayers?fixtureId=${encodeURIComponent(fixtureId)}`
    );
  };

  const handleGoBack = () => {
    router.push('/(football)/landingScreen/tournament');
  };

  // Get group name for a team
  const getTeamGroupName = (teamId?: string | null) => {
    if (!teamId || !tournament) return '';

    const team = tournament.teams.find(t => t.id === teamId);
    if (!team || !team.tableId) return '';

    const table = tournament.tables.find(t => t.id === team.tableId);
    if (!table) return '';

    return table.name;
  };

  if (!tournamentId) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View className="items-center px-6">
          <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="alert-circle" size={32} color="#ef4444" />
          </View>
          <Text className="text-lg font-bold text-slate-900 mb-2">Invalid Tournament ID</Text>
          <Text className="text-slate-500 text-center mb-6">
            No tournament ID was provided.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(football)/landingScreen/tournament')}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go to Tournaments</Text>
          </TouchableOpacity>
        </View>
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
          <Text className="text-slate-500 text-center mb-2">
            ID: {tournamentId}
          </Text>
          <Text className="text-slate-500 text-center mb-6">
            The tournament doesn't exist or may have been deleted.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(football)/landingScreen/tournament')}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
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
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={24} color="#1e293b" />
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
                <View className={`px-2 py-1 rounded ${tournament.status === 'active' ? 'bg-green-100' :
                  tournament.status === 'completed' ? 'bg-blue-100' :
                    'bg-slate-100'
                  }`}>
                  <Text className={`text-xs font-semibold ${tournament.status === 'active' ? 'text-green-700' :
                    tournament.status === 'completed' ? 'text-blue-700' :
                      'text-slate-600'
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
              <View
                className="h-full bg-green-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
            <Text className="text-xs text-slate-500 mt-1">
              {completedFixtures.length} of {allFixtures.length} matches completed
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View className="bg-white px-4 py-4 border-b border-slate-100">
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-slate-900">{tournament.teams.length}</Text>
            <Text className="text-xs text-slate-500 mt-1">Teams</Text>
          </View>
          <View className="w-px bg-slate-200" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-slate-900">{allFixtures.length}</Text>
            <Text className="text-xs text-slate-500 mt-1">Matches</Text>
          </View>
          <View className="w-px bg-slate-200" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-slate-900">{tournament.currentRound}</Text>
            <Text className="text-xs text-slate-500 mt-1">Round</Text>
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
            {filteredUpcomingFixtures.length === 0 ? (
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
                <Text className="text-sm font-bold text-slate-700 mb-4">
                  Upcoming Matches
                </Text>

                {filteredUpcomingFixtures.map((fixture) => (
                  <View
                    key={fixture.id}
                    className="bg-white rounded-xl p-4 mb-3 border border-slate-100"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-xs font-semibold text-slate-500">
                        {fixture.roundName || `Round ${fixture.round}`} • Match {fixture.matchNumber}
                      </Text>
                      <View className="bg-blue-50 px-2 py-1 rounded">
                        <Text className="text-xs font-semibold text-blue-700">UPCOMING</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 bg-emerald-500 rounded-lg items-center justify-center mr-2">
                            <Ionicons name="shield" size={14} color="white" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                              {fixture.homeTeamName}
                            </Text>
                            <Text className="text-xs text-slate-500">{getTeamGroupName(fixture.homeTeamId)}</Text>
                          </View>
                        </View>
                      </View>
                      <Text className="text-lg font-bold text-slate-400 mx-4">vs</Text>
                      <View className="flex-1 items-end">
                        <View className="flex-row items-center">
                          <View className="flex-1 items-end">
                            <Text className="text-sm font-bold text-slate-900 mr-2" numberOfLines={1}>
                              {fixture.awayTeamName}
                            </Text>
                            <Text className="text-xs text-slate-500 text-right">{getTeamGroupName(fixture.awayTeamId)}</Text>
                          </View>
                          <View className="w-8 h-8 bg-red-500 rounded-lg items-center justify-center">
                            <Ionicons name="flag" size={14} color="white" />
                          </View>
                        </View>
                      </View>
                    </View>

                    {tournament.status === 'active' && fixture.homeTeamId && fixture.awayTeamId && (
                      <TouchableOpacity
                        onPress={() => handlePlayMatch(fixture.id)}
                        className="bg-blue-600 rounded-lg py-3 items-center"
                      >
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
            {standingsSorted.length === 0 ? (
              <View className="items-center justify-center py-16">
                <Text className="text-slate-500">No standings available yet</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="bg-white rounded-xl border border-slate-100 overflow-hidden mb-6 min-w-[720px]">

                  {/* Header */}
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

                  {/* Rows */}
                  {standingsSorted.map((team, index) => {
                    const gf = team.goalsFor ?? 0;
                    const ga = team.goalsAgainst ?? 0;
                    const gd = team.goalDifference ?? 0;

                    return (
                      <View
                        key={team.id}
                        className={`flex-row items-center px-4 py-3 ${index < standingsSorted.length - 1
                          ? 'border-b border-slate-50'
                          : ''
                          }`}
                      >
                        <Text className="w-10 text-sm font-bold text-slate-900">
                          {index + 1}
                        </Text>

                        {/* Team name – 2 lines */}
                        <View className="w-40 pr-2">
                          <Text
                            className="text-sm font-semibold text-slate-900"
                            numberOfLines={2}
                          >
                            {team.teamName}
                          </Text>
                        </View>

                        <Text className="w-10 text-sm text-slate-600 text-center">
                          {team.played}
                        </Text>
                        <Text className="w-10 text-sm text-slate-600 text-center">
                          {team.won}
                        </Text>
                        <Text className="w-10 text-sm text-slate-600 text-center">
                          {team.drawn}
                        </Text>
                        <Text className="w-10 text-sm text-slate-600 text-center">
                          {team.lost}
                        </Text>

                        {/* +/- */}
                        <Text className="w-14 text-sm text-slate-700 text-center">
                          {gf}/{ga}
                        </Text>

                        {/* GD */}
                        <Text
                          className={`w-12 text-sm font-semibold text-center ${gd > 0
                            ? 'text-green-600'
                            : gd < 0
                              ? 'text-red-600'
                              : 'text-slate-600'
                            }`}
                        >
                          {gd > 0 ? `+${gd}` : gd}
                        </Text>

                        {/* Points */}
                        <Text className="w-12 text-sm font-bold text-slate-900 text-center">
                          {team.points}
                        </Text>
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
            {filteredCompletedFixtures.length === 0 ? (
              <View className="items-center justify-center py-16">
                <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle-outline" size={32} color="#64748b" />
                </View>
                <Text className="text-lg font-bold text-slate-900 mb-2">No Completed Matches</Text>
                <Text className="text-slate-500 text-center">
                  Completed matches will appear here
                </Text>
              </View>
            ) : (
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-4">
                  Completed Matches
                </Text>

                {filteredCompletedFixtures.map((fixture) => (
                  <TouchableOpacity
                    key={fixture.id}
                    className="bg-white rounded-xl p-4 mb-3 border border-slate-100"
                    onPress={() => {
                      if (fixture.id) {
                        router.push({
                          pathname: '/(football)/matchDetails/[matchId]',
                          params: { matchId: fixture.id },
                        });

                      }
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-xs font-semibold text-slate-500">
                        {fixture.roundName || `Round ${fixture.round}`} • Match {fixture.matchNumber}
                      </Text>
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
                          {fixture.homeTeamName}
                        </Text>
                      </View>

                      <View className="mx-4 bg-slate-50 rounded-lg px-3 py-2">
                        <View className="flex-row items-center">
                          <Text className="text-lg font-bold text-slate-900">{fixture.homeScore}</Text>
                          <Text className="text-sm font-medium text-slate-400 mx-2">-</Text>
                          <Text className="text-lg font-bold text-slate-900">{fixture.awayScore}</Text>
                        </View>
                      </View>

                      <View className="flex-1 flex-row items-center justify-end">
                        <Text className="text-sm font-bold flex-1 text-right text-slate-900" numberOfLines={1}>
                          {fixture.awayTeamName}
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
      <View className="bg-white px-4 py-4 border-t border-slate-200">
        {tournament.status === 'draft' ? (
          // Start Tournament Button
          <TouchableOpacity
            onPress={handleStartTournament}
            className="bg-green-600 rounded-xl py-4 items-center"
          >
            <View className="flex-row items-center">
              <Ionicons name="play" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Start Tournament</Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}