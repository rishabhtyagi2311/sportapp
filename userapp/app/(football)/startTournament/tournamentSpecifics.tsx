import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTournamentStore, TournamentSettings } from '@/store/footballTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function TournamentSettingsScreen() {
  const router = useRouter();
  const { creationDraft, setTournamentSettings, createTournament } = useTournamentStore();
  const { getTeamById } = useFootballStore();

  const [venue, setVenue] = useState('');
  const [numberOfPlayers, setNumberOfPlayers] = useState('11');
  const [numberOfSubstitutes, setNumberOfSubstitutes] = useState('5');
  const [numberOfReferees, setNumberOfReferees] = useState('1');
  const [matchDuration, setMatchDuration] = useState('90');
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  const teamLimits = useMemo(() => {
    if (!creationDraft || creationDraft.selectedTeamIds.length === 0) {
      return { minPlayers: 0, maxPlayers: 11 };
    }

    const teams = creationDraft.selectedTeamIds
      .map(id => getTeamById(id))
      .filter(team => team !== undefined);

    if (teams.length === 0) {
      return { minPlayers: 0, maxPlayers: 11 };
    }

    const minPlayersInTeams = Math.min(...teams.map(team => team.memberPlayerIds?.length || 0));
    const maxPlayers = Math.min(minPlayersInTeams, 11);

    return {
      minPlayers: minPlayersInTeams,
      maxPlayers: maxPlayers,
      teamPlayerCounts: teams.map(team => ({
        name: team.teamName,
        count: team.memberPlayerIds?.length || 0
      }))
    };
  }, [creationDraft, getTeamById]);

  useEffect(() => {
    if (creationDraft?.settings) {
      setVenue(creationDraft.settings.venue || '');
      setNumberOfPlayers(String(creationDraft.settings.numberOfPlayers || Math.min(11, teamLimits.maxPlayers)));
      setNumberOfSubstitutes(String(creationDraft.settings.numberOfSubstitutes || 5));
      setNumberOfReferees(String(creationDraft.settings.numberOfReferees || 1));
      setMatchDuration(String(creationDraft.settings.matchDuration || 90));
    } else {
      setNumberOfPlayers(String(Math.min(11, teamLimits.maxPlayers)));
    }
    setIsLoadingDraft(false);
  }, [creationDraft, teamLimits.maxPlayers]);

  // Calculate total matches (league-only)
  const totalMatches = useMemo(() => {
    if (!creationDraft) return 0;

    const matchesPerPair = creationDraft.settings?.matchesPerPair || 1;
    const teamCount = creationDraft.teamCount ?? 0;

    if (teamCount > 1) {
      return (teamCount * (teamCount - 1) / 2) * matchesPerPair;
    }
    return 0;
  }, [creationDraft]);

  const handleCreateTournament = () => {
    if (!venue.trim()) {
      Alert.alert('Error', 'Please enter a venue');
      return;
    }

    const players = parseInt(numberOfPlayers, 10);
    const substitutes = parseInt(numberOfSubstitutes, 10);
    const referees = parseInt(numberOfReferees, 10);
    const duration = parseInt(matchDuration, 10);

    if (isNaN(players) || players < 1) {
      Alert.alert('Error', 'Number of players must be at least 1');
      return;
    }

    if (players > teamLimits.maxPlayers) {
      Alert.alert(
        'Error',
        `Number of players cannot exceed ${teamLimits.maxPlayers}.\n\nThe team "${teamLimits.teamPlayerCounts?.find(t => t.count === teamLimits.minPlayers)?.name}" only has ${teamLimits.minPlayers} registered players.`
      );
      return;
    }

    if (isNaN(substitutes) || substitutes < 0 || substitutes > 7) {
      Alert.alert('Error', 'Number of substitutes must be between 0 and 7');
      return;
    }

    if (isNaN(referees) || referees < 1 || referees > 3) {
      Alert.alert('Error', 'Number of referees must be between 1 and 3');
      return;
    }

    if (isNaN(duration) || duration < 1) {
      Alert.alert('Error', 'Match duration must be at least 1 minute');
      return;
    }

    const settings: TournamentSettings = {
      venue: venue.trim(),
      numberOfPlayers: players,
      numberOfSubstitutes: substitutes,
      numberOfReferees: referees,
      matchDuration: duration,
      format: 'league',
      winPoints: 3,
      drawPoints: 1,
      lossPoints: 0,
      matchesPerPair: (creationDraft!.settings?.matchesPerPair as 1 | 2) || 1,
    };

    setTournamentSettings(settings);
    const tournamentId = createTournament();

    if (tournamentId && creationDraft) {
      router.navigate('/(football)/landingScreen/tournament');
    }
  };

  if (teamLimits.maxPlayers === 0) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View className="items-center px-6">
          <View className="w-20 h-20 bg-amber-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="warning" size={32} color="#f59e0b" />
          </View>
          <Text className="text-lg font-bold text-slate-900 mb-2">Insufficient Players</Text>
          <Text className="text-slate-500 text-center mb-6">
            One or more selected teams have no registered players. Please add players to all teams before creating a tournament.
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

  if (creationDraft) {
    const matchesPerPair = creationDraft.settings?.matchesPerPair || 1;

    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-slate-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-slate-900">Tournament Settings</Text>
            <View className="w-10" />
          </View>
        </View>

        {/* Progress Indicator */}
        <View className="bg-white px-4 py-3 border-b border-slate-100">
          <View className="flex-row items-center">
            <View className="flex-1 flex-row items-center">
              <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <View className="flex-1 h-1 bg-green-600 mx-2" />
            </View>
            <View className="flex-1 flex-row items-center">
              <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <View className="flex-1 h-1 bg-green-600 mx-2" />
            </View>
            <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
              <Text className="text-white font-bold text-sm">3</Text>
            </View>
          </View>
          <View className="flex-row justify-between mt-2 px-1">
            <Text className="text-xs font-medium text-green-600">Basic Info</Text>
            <Text className="text-xs font-medium text-green-600">Teams</Text>
            <Text className="text-xs font-medium text-blue-600">Settings</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
          {/* Tournament Summary */}
          <View className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1 mr-3">
                <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Tournament Overview
                </Text>
                <Text className="text-xl font-bold text-slate-900 mb-2">
                  {creationDraft.name}
                </Text>
                <View className="flex-row items-center flex-wrap">
                  <View className="bg-blue-50 px-3 py-1.5 rounded-lg mr-2 mb-2">
                    <Text className="text-xs font-bold text-blue-700">League Format</Text>
                  </View>
                  <View className="bg-slate-100 px-3 py-1.5 rounded-lg mr-2 mb-2">
                    <View className="flex-row items-center">
                      <Ionicons name="people" size={12} color="#475569" />
                      <Text className="text-xs font-bold text-slate-700 ml-1">
                        {creationDraft.selectedTeamIds.length} Teams
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl items-center justify-center shadow-md">
                <Ionicons name="trophy" size={24} color="white" />
              </View>
            </View>

            {/* Quick Stats */}
            <View className="border-t border-slate-100 pt-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 items-center py-2">
                  <Text className="text-2xl font-bold text-slate-900">
                    {creationDraft.selectedTeamIds.length}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Teams</Text>
                </View>
                <View className="w-px h-10 bg-slate-200" />
                <View className="flex-1 items-center py-2">
                  <Text className="text-2xl font-bold text-slate-900">
                    {totalMatches}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">
                    Matches
                  </Text>
                </View>
                <View className="w-px h-10 bg-slate-200" />
                <View className="flex-1 items-center py-2">
                  <Text className="text-2xl font-bold text-slate-900">
                    1
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">
                    Round
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Team Player Count Warning */}
          {teamLimits.maxPlayers < 11 && (
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="warning" size={20} color="#f59e0b" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-semibold text-amber-900 mb-1">
                    Player Limit Adjusted
                  </Text>
                  <Text className="text-xs text-amber-700 mb-2">
                    Maximum {teamLimits.maxPlayers} players per match (based on team with fewest players)
                  </Text>
                  {teamLimits.teamPlayerCounts && (
                    <View className="mt-2">
                      {teamLimits.teamPlayerCounts.map((team, idx) => (
                        <Text key={idx} className="text-xs text-amber-600">
                          • {team.name}: {team.count} players
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Venue */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={16} color="#475569" />
              <Text className="text-sm font-semibold text-slate-700 ml-2">Venue *</Text>
            </View>
            <TextInput
              value={venue}
              onChangeText={setVenue}
              placeholder="e.g. Central Stadium"
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Match Configuration */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-slate-700 mb-3">Match Configuration</Text>

            <View className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Players */}
              <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="people" size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900">Players per Team</Text>
                    <Text className="text-xs text-slate-500">Max: {teamLimits.maxPlayers}</Text>
                  </View>
                </View>
                <TextInput
                  value={numberOfPlayers}
                  onChangeText={setNumberOfPlayers}
                  keyboardType="numeric"
                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center text-base font-bold text-slate-900"
                />
              </View>

              {/* Substitutes */}
              <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-green-50 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="swap-horizontal" size={20} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900">Substitutes Allowed</Text>
                    <Text className="text-xs text-slate-500">Standard: 5</Text>
                  </View>
                </View>
                <TextInput
                  value={numberOfSubstitutes}
                  onChangeText={setNumberOfSubstitutes}
                  keyboardType="numeric"
                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center text-base font-bold text-slate-900"
                />
              </View>

              {/* Referees */}
              <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-amber-50 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="person" size={20} color="#f59e0b" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900">Referees</Text>
                    <Text className="text-xs text-slate-500">1-3 officials</Text>
                  </View>
                </View>
                <TextInput
                  value={numberOfReferees}
                  onChangeText={setNumberOfReferees}
                  keyboardType="numeric"
                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center text-base font-bold text-slate-900"
                />
              </View>

              {/* Match Duration */}
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-purple-50 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="time" size={20} color="#8b5cf6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900">Match Duration</Text>
                    <Text className="text-xs text-slate-500">Minutes per match</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <TextInput
                    value={matchDuration}
                    onChangeText={setMatchDuration}
                    keyboardType="numeric"
                    className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center text-base font-bold text-slate-900"
                  />
                  <Text className="text-slate-500 text-sm ml-2">min</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Match Breakdown */}
          <View className="bg-white rounded-xl p-4 mb-6 border border-slate-200">
            <Text className="text-sm font-semibold text-slate-700 mb-2">Match Breakdown</Text>

            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-600">League Matches:</Text>
                <Text className="text-xs font-medium text-slate-800">
                  {totalMatches}
                </Text>
              </View>

              <View className="flex-row justify-between pt-1 border-t border-slate-100">
                <Text className="text-xs font-semibold text-slate-700">Total Matches:</Text>
                <Text className="text-xs font-bold text-slate-900">{totalMatches}</Text>
              </View>
            </View>
          </View>

          {/* Info */}
          <View className="bg-slate-100 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={18} color="#475569" />
              <Text className="flex-1 text-xs text-slate-600 ml-2 leading-5">
                These settings will apply to all league matches. The tournament winner will be determined by the final standings.
              </Text>
            </View>
          </View>

          <View className="h-24" />
        </ScrollView>

        {/* Create Button */}
        <View className="bg-white px-4 py-4 border-t border-slate-200">
          <TouchableOpacity
            onPress={handleCreateTournament}
            className="bg-green-600 rounded-xl py-4 items-center"
          >
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Create Tournament</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}