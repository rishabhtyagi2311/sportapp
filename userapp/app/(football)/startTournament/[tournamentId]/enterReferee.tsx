// app/(football)/tournaments/[tournamentId]/enterReferees.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTournamentStore } from '@/store/footballTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function TournamentEnterRefereesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tournamentId = params.tournamentId as string;
  const fixtureId = params.fixtureId as string;
  
  const { 
    activeTournamentMatch, 
    setTournamentMatchReferees, 
    startTournamentMatchScoring, 
    getTournament,
    initializeTournamentMatch
  } = useTournamentStore();
  
  const { getPlayerById } = useFootballStore();
  
  // Initialize match if not already initialized
  useEffect(() => {
    if (!activeTournamentMatch && tournamentId && fixtureId) {
      initializeTournamentMatch(tournamentId, fixtureId);
    }
  }, [tournamentId, fixtureId, activeTournamentMatch, initializeTournamentMatch]);
  
  const tournament = getTournament(tournamentId);
  const requiredReferees = tournament?.settings?.numberOfReferees ?? 1;

  // start with empty array, populate after tournament loads / requiredReferees becomes known
  const [referees, setReferees] = useState<string[]>([]);

  useEffect(() => {
    // ensure referees state has the right length when the tournament/settings load or change
    const count = Math.max(1, Number(requiredReferees || 1));
    setReferees(prev => {
      if (prev.length === count) return prev;
      const newArr = Array(count).fill('');
      // copy existing values into new array if available
      for (let i = 0; i < Math.min(prev.length, count); i++) newArr[i] = prev[i];
      return newArr;
    });
  }, [requiredReferees]);

  // Get captain names for display (safe guards)
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
    
    // Validate match setup (use optional chaining)
    if (!activeTournamentMatch?.homeCaptain || !activeTournamentMatch?.awayCaptain) {
      Alert.alert('Setup Incomplete', 'Captains not selected. Please go back and complete setup.');
      return;
    }
    
    if ((activeTournamentMatch?.homeTeamPlayers?.length ?? 0) === 0 || (activeTournamentMatch?.awayTeamPlayers?.length ?? 0) === 0) {
      Alert.alert('Setup Incomplete', 'Players not selected. Please go back and complete setup.');
      return;
    }
    
    // Save referees and start match
    setTournamentMatchReferees(filledReferees);
    startTournamentMatchScoring();
    
    // Navigate to match scoring (safely encode params)
    router.push(`/(football)/startTournament/${encodeURIComponent(tournamentId)}/scoringScreen?fixtureId=${encodeURIComponent(fixtureId)}`);
  };
  
  if (!activeTournamentMatch) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View className="items-center px-6">
          <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="alert-circle" size={32} color="#ef4444" />
          </View>
          <Text className="text-lg font-bold text-slate-900 mb-2">No Active Match</Text>
          <Text className="text-slate-500 text-center mb-6">
            No match found. Please start from the tournament dashboard.
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/(football)/tournaments/${encodeURIComponent(tournamentId)}`)}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go to Tournament</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
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
              <Text className="text-white text-base font-bold" numberOfLines={1}>
                {activeTournamentMatch.homeTeamName}
              </Text>
              <Text className="text-white text-lg font-bold">VS</Text>
              <Text className="text-white text-base font-bold" numberOfLines={1}>
                {activeTournamentMatch.awayTeamName}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="person" size={20} color="#f59e0b" />
              </View>
              <View>
                <Text className="text-lg font-bold text-slate-900">Match Officials</Text>
                <Text className="text-sm text-slate-500">Enter {requiredReferees} referee name(s)</Text>
              </View>
            </View>

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

          {/* Setup Summary */}
          <View className="bg-slate-100 rounded-xl p-4 mb-6">
            <Text className="text-sm font-bold text-slate-700 mb-3">Match Setup Summary</Text>
            
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-sm text-slate-600 ml-2">
                {(activeTournamentMatch.homeTeamPlayers?.length ?? 0)} players for {activeTournamentMatch.homeTeamName}
              </Text>
            </View>
            
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text className="text-sm text-slate-600 ml-2">
                {(activeTournamentMatch.awayTeamPlayers?.length ?? 0)} players for {activeTournamentMatch.awayTeamName}
              </Text>
            </View>
            
            {homeCaptainName && awayCaptainName && (
              <>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text className="text-sm text-slate-600 ml-2">
                    Captain: {homeCaptainName} ({activeTournamentMatch.homeTeamName})
                  </Text>
                </View>
                
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text className="text-sm text-slate-600 ml-2">
                    Captain: {awayCaptainName} ({activeTournamentMatch.awayTeamName})
                  </Text>
                </View>
              </>
            )}
            
            <View className="flex-row items-center">
              <Ionicons 
                name={referees.filter(r => r.trim()).length === requiredReferees ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={referees.filter(r => r.trim()).length === requiredReferees ? "#10b981" : "#94a3b8"} 
              />
              <Text className="text-sm text-slate-600 ml-2">
                {referees.filter(r => r.trim()).length} / {requiredReferees} referee(s) entered
              </Text>
            </View>
          </View>

          {/* Tournament Info */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={18} color="#3b82f6" />
              <Text className="text-sm font-semibold text-blue-900 ml-2">Tournament Match</Text>
            </View>
            <Text className="text-xs text-blue-700">
              This is a tournament match. All match data will be saved to the tournament standings.
            </Text>
          </View>

          <View className="h-24" />
        </ScrollView>

        {/* Start Match Button */}
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
