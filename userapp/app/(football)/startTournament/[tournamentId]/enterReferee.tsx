// app/(football)/tournaments/[tournamentId]/enterReferees.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTournamentStore } from '@/store/footballTournamentStore';
import { useMatchExecutionStore } from '@/store/footballMatchEventStore'; // Import execution store
import { useFootballStore } from '@/store/footballTeamStore';

export default function TournamentEnterRefereesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tournamentId = params.tournamentId as string;
  const fixtureId = params.fixtureId as string;
  
  const { 
    activeTournamentMatch, 
    setTournamentMatchReferees, 
    getTournament,
    initializeTournamentMatch
  } = useTournamentStore();

  const { startMatch, updateMatchStatus, setMatchContext } = useMatchExecutionStore(); // Execution methods
  
  const { getPlayerById } = useFootballStore();
  
  // Initialize match setup if not already initialized
  useEffect(() => {
    if (!activeTournamentMatch && tournamentId && fixtureId) {
      initializeTournamentMatch(tournamentId, fixtureId);
    }
  }, [tournamentId, fixtureId, activeTournamentMatch, initializeTournamentMatch]);
  
  const tournament = getTournament(tournamentId);
  const requiredReferees = tournament?.settings?.numberOfReferees ?? 1;

  const [referees, setReferees] = useState<string[]>([]);

  useEffect(() => {
    const count = Math.max(1, Number(requiredReferees || 1));
    setReferees(prev => {
      if (prev.length === count) return prev;
      const newArr = Array(count).fill('');
      for (let i = 0; i < Math.min(prev.length, count); i++) newArr[i] = prev[i];
      return newArr;
    });
  }, [requiredReferees]);

  const homeCaptainName = activeTournamentMatch?.homeCaptain
    ? (getPlayerById(activeTournamentMatch.homeCaptain)?.name || 'Selected')
    : null;

  const awayCaptainName = activeTournamentMatch?.awayCaptain
    ? (getPlayerById(activeTournamentMatch.awayCaptain)?.name || 'Selected')
    : null;
  
  const updateReferee = (index: number, value: string) => {
    setReferees(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };
  
  const handleStartMatch = () => {
    const filledReferees = referees.filter(r => r.trim() !== '');
    
    if (filledReferees.length < requiredReferees) {
      Alert.alert('Incomplete', `Please enter all ${requiredReferees} referee name(s)`);
      return;
    }
    
    if (!activeTournamentMatch?.homeCaptain || !activeTournamentMatch?.awayCaptain) {
      Alert.alert('Setup Incomplete', 'Captains not selected. Please go back and complete setup.');
      return;
    }
    
    if ((activeTournamentMatch?.homeTeamPlayers?.length ?? 0) === 0 || (activeTournamentMatch?.awayTeamPlayers?.length ?? 0) === 0) {
      Alert.alert('Setup Incomplete', 'Players not selected. Please go back and complete setup.');
      return;
    }
    
    // 1. Save referees to staging (optional, but good for consistency)
    setTournamentMatchReferees(filledReferees);

    // 2. HANDOVER: Initialize the Match Execution Engine
    const matchSetup = {
        id: `fixture_${fixtureId}`, // Or unique ID
        myTeam: {
            teamId: activeTournamentMatch.homeTeamId,
            teamName: activeTournamentMatch.homeTeamName,
            selectedPlayers: activeTournamentMatch.homeTeamPlayers, // These are STARTERS
            substitutes: activeTournamentMatch.homeTeamSubstitutes || [], // NEW: Pass Substitutes
            captain: activeTournamentMatch.homeCaptain,
        },
        opponentTeam: {
            teamId: activeTournamentMatch.awayTeamId,
            teamName: activeTournamentMatch.awayTeamName,
            selectedPlayers: activeTournamentMatch.awayTeamPlayers, // These are STARTERS
            substitutes: activeTournamentMatch.awayTeamSubstitutes || [], // NEW: Pass Substitutes
            captain: activeTournamentMatch.awayCaptain,
        },
        referees: filledReferees.map((name, i) => ({ name, index: i })),
        venue: { name: tournament?.settings?.venue || '', isCustom: false },
        matchSettings: {
            startTime: new Date().toISOString(),
            duration: tournament?.settings?.matchDuration || 90,
            extraTimeAllowed: false,
            substitutionAllowed: true,
            maxSubstitutions: tournament?.settings?.numberOfSubstitutes || 5 // Pass max subs limit
        }
    };

    // Start the engine
    startMatch(matchSetup as any); 
    
    // Set Context so engine knows this is a tournament match
    setMatchContext({
        type: 'tournament',
        tournamentId,
        fixtureId,
        tableId: tournament?.tables[0]?.id // assuming single table for now
    });
    
    // Start Timer immediately
    updateMatchStatus('in_progress');
    
    // 3. Navigate to Scoring Screen
    router.push(`/(football)/startTournament/${encodeURIComponent(tournamentId)}/scoringScreen?fixtureId=${encodeURIComponent(fixtureId)}`);
  };
  
  if (!activeTournamentMatch) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View className="items-center px-6">
          <Text className="text-lg font-bold text-slate-900 mb-2">No Active Match Setup</Text>
          <TouchableOpacity onPress={() => router.push(`/(football)/tournaments/${encodeURIComponent(tournamentId)}`)} className="bg-blue-600 px-6 py-3 rounded-xl mt-4">
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
              <Text className="text-white text-base font-bold" numberOfLines={1}>{activeTournamentMatch.homeTeamName}</Text>
              <Text className="text-white text-lg font-bold">VS</Text>
              <Text className="text-white text-base font-bold" numberOfLines={1}>{activeTournamentMatch.awayTeamName}</Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
          <View className="mb-6">
             {/* Referee Inputs */}
             {Array.from({ length: Math.max(1, requiredReferees) }).map((_, index) => (
              <View key={index} className="mb-4">
                <Text className="text-sm font-semibold text-slate-700 mb-2">
                  {requiredReferees === 1 ? 'Main Referee' : index === 0 ? 'Main Referee' : `Assistant Referee ${index}`}
                </Text>
                <TextInput
                  value={referees[index] ?? ''}
                  onChangeText={(value) => updateReferee(index, value)}
                  placeholder="Enter referee name"
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                />
              </View>
            ))}
          </View>

          {/* Setup Summary Display */}
          <View className="bg-slate-100 rounded-xl p-4 mb-6">
            <Text className="text-sm font-bold text-slate-700 mb-3">Match Setup Summary</Text>
            
            {/* Home Team Summary */}
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-sm text-slate-600 ml-2">
                {activeTournamentMatch.homeTeamName}: {(activeTournamentMatch.homeTeamPlayers?.length ?? 0)} Starters
                {(activeTournamentMatch.homeTeamSubstitutes?.length ?? 0) > 0 ? `, ${(activeTournamentMatch.homeTeamSubstitutes?.length ?? 0)} Subs` : ''}
              </Text>
            </View>

            {/* Away Team Summary */}
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-sm text-slate-600 ml-2">
                {activeTournamentMatch.awayTeamName}: {(activeTournamentMatch.awayTeamPlayers?.length ?? 0)} Starters
                {(activeTournamentMatch.awayTeamSubstitutes?.length ?? 0) > 0 ? `, ${(activeTournamentMatch.awayTeamSubstitutes?.length ?? 0)} Subs` : ''}
              </Text>
            </View>
          </View>
          <View className="h-24" />
        </ScrollView>

        <View className="bg-white px-4 py-4 border-t border-slate-200">
          <TouchableOpacity
            onPress={handleStartMatch}
            className={`rounded-xl py-4 items-center ${referees.filter(r => r.trim()).length === requiredReferees ? 'bg-green-600' : 'bg-slate-300'}`}
            disabled={referees.filter(r => r.trim()).length !== requiredReferees}
          >
            <View className="flex-row items-center">
              <Ionicons name="play-circle" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Start Match</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}