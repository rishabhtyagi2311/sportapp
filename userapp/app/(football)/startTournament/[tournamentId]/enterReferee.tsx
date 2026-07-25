// app/(football)/tournaments/[tournamentId]/enterReferees.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTournamentStore } from '@/store/tournamentStore';
import { useMatchCreationStore } from '@/store/footballMatchCreationStore';
import { useMatchExecutionStore } from '@/store/footballMatchEventStore';

export default function TournamentEnterRefereesScreen() {
  const router = useRouter();
  const { tournamentId, fixtureId } = useLocalSearchParams<{ tournamentId: string; fixtureId: string }>();

  const { getTournament, startFixtureMatch } = useTournamentStore();
  const { matchData } = useMatchCreationStore();
  const { loadActiveMatch } = useMatchExecutionStore();

  const tournament = getTournament(tournamentId);
  const fixture = tournament?.fixtures.find((f) => f.id === fixtureId);

  const [referees, setReferees] = useState<string[]>(['']);
  const [duration, setDuration] = useState('90');
  const [isStarting, setIsStarting] = useState(false);

  const updateReferee = (index: number, value: string) => {
    setReferees((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addRefereeField = () => setReferees((prev) => [...prev, '']);

  const handleStartMatch = async () => {
    const filledReferees = referees.map((r) => r.trim()).filter(Boolean);

    if (filledReferees.length === 0) {
      Alert.alert('Incomplete', 'Please enter at least one referee name');
      return;
    }

    if (!matchData.myTeam.captain || !matchData.opponentTeam.captain) {
      Alert.alert('Setup Incomplete', 'Captains not selected. Please go back and complete setup.');
      return;
    }

    if (matchData.myTeam.selectedPlayers.length === 0 || matchData.opponentTeam.selectedPlayers.length === 0) {
      Alert.alert('Setup Incomplete', 'Players not selected. Please go back and complete setup.');
      return;
    }

    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum < 1) {
      Alert.alert('Error', 'Please enter a valid match duration.');
      return;
    }

    setIsStarting(true);
    try {
      const match = await startFixtureMatch(tournamentId, fixtureId, {
        duration: durationNum,
        homeRoster: {
          startingXI: matchData.myTeam.selectedPlayers,
          bench: matchData.myTeam.substitutes,
          captainId: matchData.myTeam.captain,
          subsUsed: 0,
        },
        awayRoster: {
          startingXI: matchData.opponentTeam.selectedPlayers,
          bench: matchData.opponentTeam.substitutes,
          captainId: matchData.opponentTeam.captain,
          subsUsed: 0,
        },
        referees: filledReferees,
      });

      loadActiveMatch(match, {
        homeOnPitch: [...matchData.myTeam.selectedPlayers],
        homeBench: [...matchData.myTeam.substitutes],
        awayOnPitch: [...matchData.opponentTeam.selectedPlayers],
        awayBench: [...matchData.opponentTeam.substitutes],
        homeSubsUsed: 0,
        awaySubsUsed: 0,
      });

      router.push({
        pathname: '/(football)/startMatch/scoringScreen',
        params: { tournamentId, format: 'league' },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not start match');
    } finally {
      setIsStarting(false);
    }
  };

  if (!fixture) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View className="items-center px-6">
          <Text className="text-lg font-bold text-slate-900 mb-2">No Active Match Setup</Text>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(football)/startTournament/[tournamentId]', params: { tournamentId } })}
            className="bg-blue-600 px-6 py-3 rounded-xl mt-4"
          >
            <Text className="text-white font-semibold">Go to Tournament</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-slate-50">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-slate-200">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-slate-900">Enter Referees</Text>
            <View className="w-10" />
          </View>

          {/* Match Info */}
          <View className="bg-blue-600 rounded-xl p-4">
            <Text className="text-white text-sm mb-2">Match Ready to Start</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-base font-bold" numberOfLines={1}>{matchData.myTeam.teamName}</Text>
              <Text className="text-white text-lg font-bold">VS</Text>
              <Text className="text-white text-base font-bold" numberOfLines={1}>{matchData.opponentTeam.teamName}</Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
          <View className="mb-6">
            {referees.map((name, index) => (
              <View key={index} className="mb-4">
                <Text className="text-sm font-semibold text-slate-700 mb-2">
                  {index === 0 ? 'Main Referee' : `Assistant Referee ${index}`}
                </Text>
                <TextInput
                  value={name}
                  onChangeText={(value) => updateReferee(index, value)}
                  placeholder="Enter referee name"
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                />
              </View>
            ))}
            <TouchableOpacity onPress={addRefereeField} className="flex-row items-center">
              <Ionicons name="add-circle-outline" size={18} color="#3b82f6" />
              <Text className="text-blue-600 font-semibold ml-2 text-sm">Add another referee</Text>
            </TouchableOpacity>
          </View>

          {/* Match Duration */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-slate-700 mb-2">Match Duration (minutes)</Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Setup Summary Display */}
          <View className="bg-slate-100 rounded-xl p-4 mb-6">
            <Text className="text-sm font-bold text-slate-700 mb-3">Match Setup Summary</Text>

            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-sm text-slate-600 ml-2">
                {matchData.myTeam.teamName}: {matchData.myTeam.selectedPlayers.length} Starters
                {matchData.myTeam.substitutes.length > 0 ? `, ${matchData.myTeam.substitutes.length} Subs` : ''}
              </Text>
            </View>

            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-sm text-slate-600 ml-2">
                {matchData.opponentTeam.teamName}: {matchData.opponentTeam.selectedPlayers.length} Starters
                {matchData.opponentTeam.substitutes.length > 0 ? `, ${matchData.opponentTeam.substitutes.length} Subs` : ''}
              </Text>
            </View>
          </View>
          <View className="h-24" />
        </ScrollView>

        <View className="bg-white px-4 py-4 border-t border-slate-200">
          <TouchableOpacity
            onPress={handleStartMatch}
            disabled={isStarting}
            className="rounded-xl py-4 items-center bg-green-600"
          >
            <View className="flex-row items-center">
              {isStarting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="play-circle" size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">Start Match</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
