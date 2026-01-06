import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  Switch 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useKnockoutStore } from '@/store/knockoutTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function KnockoutStep3() {
  const router = useRouter();
  const { draft, updateDraft, createTournament } = useKnockoutStore();
  const { getTeamById } = useFootballStore();

  const [venue, setVenue] = useState(draft?.settings.venue || '');
  const [matchDuration, setMatchDuration] = useState(draft?.settings.matchDuration?.toString() || '90');
  const [allowExtraTime, setAllowExtraTime] = useState(draft?.settings.extraTime ?? true);
  
  // New State variables from League format
  const [numberOfPlayers, setNumberOfPlayers] = useState('11');
  const [numberOfSubstitutes, setNumberOfSubstitutes] = useState('5');
  const [numberOfReferees, setNumberOfReferees] = useState('1');
  
  const [isCreating, setIsCreating] = useState(false);

  // --- 1. Team Limit Logic (Copied & Adapted) ---
  const teamLimits = useMemo(() => {
    if (!draft || draft.selectedTeamIds.length === 0) {
      return { minPlayers: 0, maxPlayers: 11 };
    }

    const teams = draft.selectedTeamIds
      .map(id => getTeamById(id))
      .filter(team => team !== undefined);

    if (teams.length === 0) {
      return { minPlayers: 0, maxPlayers: 11 };
    }

    const minPlayersInTeams = Math.min(...teams.map(team => team.memberPlayerIds?.length || 0));
    // Cap max players at 11 or the lowest team count
    const maxPlayers = Math.min(minPlayersInTeams, 11);

    return {
      minPlayers: minPlayersInTeams,
      maxPlayers: maxPlayers,
      teamPlayerCounts: teams.map(team => ({
        name: team.teamName,
        count: team.memberPlayerIds?.length || 0
      }))
    };
  }, [draft, getTeamById]);

  // --- 2. Calculate Total Matches ---
  const totalMatches = useMemo(() => {
    if (!draft) return 0;
    // For Knockout: (N - 1) matches + 1 for 3rd place? (Usually N-1)
    return draft.teamCount - 1;
  }, [draft]);

  const handleCreate = () => {
    // A. Venue Validation
    if (!venue.trim()) {
      Alert.alert('Venue Required', 'Please enter the main venue for the tournament.');
      return;
    }

    // B. Numeric Validation
    const players = parseInt(numberOfPlayers, 10);
    const substitutes = parseInt(numberOfSubstitutes, 10);
    const referees = parseInt(numberOfReferees, 10);
    const duration = parseInt(matchDuration, 10);

    if (isNaN(players) || players < 1) {
      Alert.alert('Error', 'Number of players must be at least 1');
      return;
    }

    // C. Team Limit Check
    if (players > teamLimits.maxPlayers) {
      Alert.alert(
        'Error',
        `Number of players cannot exceed ${teamLimits.maxPlayers}.\n\nThe team "${teamLimits.teamPlayerCounts?.find(t => t.count === teamLimits.minPlayers)?.name}" only has ${teamLimits.minPlayers} registered players.`
      );
      return;
    }

    if (isNaN(substitutes) || substitutes < 0 || substitutes > 12) {
      Alert.alert('Error', 'Number of substitutes must be reasonable (0-12).');
      return;
    }

    if (isNaN(referees) || referees < 1 || referees > 5) {
      Alert.alert('Error', 'Number of referees must be between 1 and 5');
      return;
    }

    if (isNaN(duration) || duration < 5) {
      Alert.alert('Error', 'Match duration must be at least 5 minutes');
      return;
    }

    setIsCreating(true);

    // 1. Update draft with final settings
    updateDraft({
      settings: {
        venue,
        matchDuration: duration,
        extraTime: allowExtraTime,
        // penalties: true (implicit in store logic now)
        numberOfPlayers: players,
        numberOfSubstitutes: substitutes,
        numberOfReferees: referees
      }
    });

    // 2. Generate Tournament
    setTimeout(() => {
        const tournamentId = createTournament();
        setIsCreating(false);
        
        if (tournamentId) {
          // 3. Navigate to Dashboard
          router.replace({
            pathname: '/(football)/landingScreen/tournament',
            params: { tournamentId }
          });
        } else {
          Alert.alert('Error', 'Failed to create tournament. Please try again.');
        }
    }, 500);
  };

  // Guard Clause for Empty Draft (Shouldn't happen in flow)
  if (!draft) return null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-slate-200 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900">Tournament Rules</Text>
        <View className="w-6" /> 
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
            <View className="w-8 h-8 bg-orange-600 rounded-full items-center justify-center">
              <Text className="text-white font-bold text-sm">3</Text>
            </View>
          </View>
          <View className="flex-row justify-between mt-2 px-1">
            <Text className="text-xs font-medium text-green-600">Basic Info</Text>
            <Text className="text-xs font-medium text-green-600">Teams</Text>
            <Text className="text-xs font-medium text-orange-600">Rules</Text>
          </View>
        </View>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>

        {/* Tournament Summary Card */}
        <View className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1 mr-3">
                <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Tournament Overview
                </Text>
                <Text className="text-xl font-bold text-slate-900 mb-2">
                  {draft.name}
                </Text>
                <View className="flex-row items-center flex-wrap">
                  <View className="bg-orange-50 px-3 py-1.5 rounded-lg mr-2 mb-2">
                    <Text className="text-xs font-bold text-orange-700">Knockout Format</Text>
                  </View>
                  <View className="bg-slate-100 px-3 py-1.5 rounded-lg mr-2 mb-2">
                    <View className="flex-row items-center">
                      <Ionicons name="people" size={12} color="#475569" />
                      <Text className="text-xs font-bold text-slate-700 ml-1">
                        {draft.teamCount} Teams
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl items-center justify-center shadow-md">
                <Ionicons name="trophy" size={24} color="white" />
              </View>
            </View>

            {/* Quick Stats */}
            <View className="border-t border-slate-100 pt-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 items-center py-2">
                  <Text className="text-2xl font-bold text-slate-900">
                    {draft.teamCount}
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
                   {/* Rounds Formula: log2(N) */}
                  <Text className="text-2xl font-bold text-slate-900">
                    {Math.log2(draft.teamCount)}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">
                    Rounds
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
                    <Text className="text-sm font-semibold text-slate-900">Substitutes</Text>
                    <Text className="text-xs text-slate-500">Bench size (0-12)</Text>
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
                    <Text className="text-xs text-slate-500">Officials count</Text>
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

        {/* Toggles (Extra Time) */}
        <View className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-slate-900 font-bold text-base">Extra Time</Text>
              <Text className="text-slate-500 text-xs">Allow 30 mins extra time if draw.</Text>
            </View>
            <Switch
              value={allowExtraTime}
              onValueChange={setAllowExtraTime}
              trackColor={{ false: '#cbd5e1', true: '#ea580c' }} // Orange for Knockout
            />
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Footer Create Button */}
      <View className="p-6 border-t border-slate-200 bg-white">
        <TouchableOpacity
          onPress={handleCreate}
          disabled={isCreating}
          className="bg-orange-600 py-4 rounded-xl items-center shadow-lg shadow-orange-200"
        >
          {isCreating ? (
            <Text className="text-white font-bold text-lg">Creating Bracket...</Text>
          ) : (
             <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Create Tournament</Text>
             </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}