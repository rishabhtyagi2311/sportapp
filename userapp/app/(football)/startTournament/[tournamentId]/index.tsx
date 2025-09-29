// app/(football)/tournaments/[tournamentId].tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTournamentStore } from '@/store/footballTournamentStore';
import { useMatchCreationStore } from '@/store/footballMatchCreationStore';
import { useMatchExecutionStore } from '@/store/footballMatchEventStore';

type TabType = 'fixtures' | 'standings' | 'matches';

export default function TournamentDashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tournamentId = params.tournamentId as string;
  
  const {
    getTournament,
    getTournamentFixtures,
    getTournamentStandings,
    getUpcomingFixtures,
    getCompletedFixtures,
    startTournament,
    initializeTournamentMatch,
    endTournamentMatch,
  } = useTournamentStore();
  const { initializeMatch, updateMatchDetails } = useMatchCreationStore();
  const { activeMatch } = useMatchExecutionStore();

  const [activeTab, setActiveTab] = useState<TabType>('fixtures');
  const [refreshKey, setRefreshKey] = useState(0);

  const tournament = useMemo(() => getTournament(tournamentId), [tournamentId, getTournament, refreshKey]);
  const allFixtures = useMemo(() => getTournamentFixtures(tournamentId), [tournamentId, getTournamentFixtures]);
  const standings = useMemo(() => getTournamentStandings(tournamentId), [tournamentId, getTournamentStandings]);
  const upcomingFixtures = useMemo(() => getUpcomingFixtures(tournamentId), [tournamentId, getUpcomingFixtures]);
  const completedFixtures = useMemo(() => getCompletedFixtures(tournamentId), [tournamentId, getCompletedFixtures]);

  // Debug logging
  useEffect(() => {
    console.log('Tournament Dashboard mounted');
    console.log('Tournament ID:', tournamentId);
    console.log('Tournament data:', tournament);
  }, [tournamentId, tournament]);

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
            setRefreshKey(prev => prev + 1); // Force refresh
          },
        },
      ]
    );
  };

  const handlePlayMatch = (fixtureId: string) => {
    const matchData = initializeTournamentMatch(tournamentId, fixtureId);
    
    if (!matchData) {
      Alert.alert('Error', 'Unable to initialize match');
      return;
    }

    // Navigate to player selection (first step of tournament match flow)
    router.push(`/(football)/startTournament/${tournamentId}/selectPlayers?fixtureId=${fixtureId}`);
  };

  const handleGoBack = () => {
    router.push('/(football)/landingScreen/tournament');
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

  const progressPercentage = useMemo(() => {
    if (allFixtures.length === 0) return 0;
    return Math.round((completedFixtures.length / allFixtures.length) * 100);
  }, [allFixtures.length, completedFixtures.length]);

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
                <View className={`px-2 py-1 rounded ${
                  tournament.status === 'active' ? 'bg-green-100' :
                  tournament.status === 'completed' ? 'bg-blue-100' :
                  'bg-slate-100'
                }`}>
                  <Text className={`text-xs font-semibold ${
                    tournament.status === 'active' ? 'text-green-700' :
                    tournament.status === 'completed' ? 'text-blue-700' :
                    'text-slate-600'
                  }`}>
                    {tournament.status.toUpperCase()}
                  </Text>
                </View>
                <Text className="text-xs text-slate-500 ml-2">
                  {tournament.format === 'league' ? 'League' : 'Knockout'}
                </Text>
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
            <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>{tournament.settings.venue}</Text>
            <Text className="text-xs text-slate-500 mt-1">Venue</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white px-4 pt-2 border-b border-slate-100">
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab('fixtures')}
            className={`flex-1 items-center pb-3 border-b-2 ${
              activeTab === 'fixtures' ? 'border-blue-600' : 'border-transparent'
            }`}
          >
            <Text className={`font-semibold text-sm ${
              activeTab === 'fixtures' ? 'text-blue-600' : 'text-slate-500'
            }`}>
              Fixtures
            </Text>
          </TouchableOpacity>
          {tournament.format === 'league' && (
            <TouchableOpacity
              onPress={() => setActiveTab('standings')}
              className={`flex-1 items-center pb-3 border-b-2 ${
                activeTab === 'standings' ? 'border-blue-600' : 'border-transparent'
              }`}
            >
              <Text className={`font-semibold text-sm ${
                activeTab === 'standings' ? 'text-blue-600' : 'text-slate-500'
              }`}>
                Standings
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setActiveTab('matches')}
            className={`flex-1 items-center pb-3 border-b-2 ${
              activeTab === 'matches' ? 'border-blue-600' : 'border-transparent'
            }`}
          >
            <Text className={`font-semibold text-sm ${
              activeTab === 'matches' ? 'text-blue-600' : 'text-slate-500'
            }`}>
              Completed
            </Text>
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
                  {tournament.status === 'draft' ? 'Start the tournament to begin playing matches' : 'All matches have been completed'}
                </Text>
              </View>
            ) : (
              upcomingFixtures.map((fixture) => (
                <View
                  key={fixture.id}
                  className="bg-white rounded-xl p-4 mb-3 border border-slate-100"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-xs font-semibold text-slate-500">
                      Round {fixture.round} • Match {fixture.matchNumber}
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
                        <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                          {fixture.homeTeamName}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-lg font-bold text-slate-400 mx-4">vs</Text>
                    <View className="flex-1 items-end">
                      <View className="flex-row items-center">
                        <Text className="text-sm font-bold text-slate-900 mr-2" numberOfLines={1}>
                          {fixture.awayTeamName}
                        </Text>
                        <View className="w-8 h-8 bg-red-500 rounded-lg items-center justify-center">
                          <Ionicons name="flag" size={14} color="white" />
                        </View>
                      </View>
                    </View>
                  </View>

                  {tournament.status === 'active' && (
                    <TouchableOpacity
                      onPress={() => handlePlayMatch(fixture.id)}
                      className="bg-blue-600 rounded-lg py-3 items-center"
                    >
                      <Text className="text-white font-semibold text-sm">Play Match</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Standings Tab */}
        {activeTab === 'standings' && tournament.format === 'league' && (
          <View>
            {standings.length === 0 ? (
              <View className="items-center justify-center py-16">
                <Text className="text-slate-500">No standings available yet</Text>
              </View>
            ) : (
              <View className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <View className="flex-row items-center bg-slate-50 px-4 py-3 border-b border-slate-100">
                  <Text className="w-10 text-xs font-bold text-slate-600">#</Text>
                  <Text className="flex-1 text-xs font-bold text-slate-600">Team</Text>
                  <Text className="w-10 text-xs font-bold text-slate-600 text-center">P</Text>
                  <Text className="w-10 text-xs font-bold text-slate-600 text-center">W</Text>
                  <Text className="w-10 text-xs font-bold text-slate-600 text-center">D</Text>
                  <Text className="w-10 text-xs font-bold text-slate-600 text-center">L</Text>
                  <Text className="w-12 text-xs font-bold text-slate-600 text-center">GD</Text>
                  <Text className="w-12 text-xs font-bold text-slate-600 text-center">Pts</Text>
                </View>

                {/* Rows */}
                {standings.map((team, index) => (
                  <View
                    key={team.id}
                    className={`flex-row items-center px-4 py-3 ${
                      index < standings.length - 1 ? 'border-b border-slate-50' : ''
                    } ${index === 0 ? 'bg-green-50' : ''}`}
                  >
                    <Text className="w-10 text-sm font-bold text-slate-900">{index + 1}</Text>
                    <View className="flex-1 flex-row items-center">
                      <View className="w-6 h-6 bg-blue-100 rounded items-center justify-center mr-2">
                        <Ionicons name="shield" size={12} color="#3b82f6" />
                      </View>
                      <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>
                        {team.teamName}
                      </Text>
                    </View>
                    <Text className="w-10 text-sm text-slate-600 text-center">{team.played}</Text>
                    <Text className="w-10 text-sm text-slate-600 text-center">{team.won}</Text>
                    <Text className="w-10 text-sm text-slate-600 text-center">{team.drawn}</Text>
                    <Text className="w-10 text-sm text-slate-600 text-center">{team.lost}</Text>
                    <Text className={`w-12 text-sm font-semibold text-center ${
                      team.goalDifference > 0 ? 'text-green-600' :
                      team.goalDifference < 0 ? 'text-red-600' :
                      'text-slate-600'
                    }`}>
                      {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                    </Text>
                    <Text className="w-12 text-sm font-bold text-slate-900 text-center">{team.points}</Text>
                  </View>
                ))}
              </View>
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
                <Text className="text-slate-500 text-center">
                  Completed matches will appear here
                </Text>
              </View>
            ) : (
              completedFixtures.map((fixture) => (
                <TouchableOpacity
                  key={fixture.id}
                  className="bg-white rounded-xl p-4 mb-3 border border-slate-100"
                  onPress={() => {
                    if (fixture.id) {
                      router.push(`/(football)/landingScreen/matchDetails?matchId=${fixture.id}`);
                    }
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-xs font-semibold text-slate-500">
                      Round {fixture.round} • Match {fixture.matchNumber}
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
                      <Text className="text-sm font-bold text-slate-900 flex-1" numberOfLines={1}>
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
                      <Text className="text-sm font-bold text-slate-900 flex-1 text-right" numberOfLines={1}>
                        {fixture.awayTeamName}
                      </Text>
                      <View className="w-8 h-8 bg-red-500 rounded-lg items-center justify-center ml-2">
                        <Ionicons name="flag" size={14} color="white" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Start Tournament Button */}
      {tournament.status === 'draft' && (
        <View className="bg-white px-4 py-4 border-t border-slate-200">
          <TouchableOpacity
            onPress={handleStartTournament}
            className="bg-green-600 rounded-xl py-4 items-center"
          >
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