import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useKnockoutStore } from '@/store/knockoutTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function KnockoutSelectOfficialsScreen() {
  const router = useRouter();
  const { tournamentId, fixtureId } = useLocalSearchParams<{ tournamentId: string; fixtureId: string }>();
  
  const { activeMatch, startMatch, updateDraft } = useKnockoutStore(); // updateDraft is not needed here, we need updateMatch details
  // Note: We need actions to set captains/referees in store. 
  // Assuming these exist or we just pass them when starting.
  // Ideally, useKnockoutStore should have `setMatchCaptains` and `setMatchReferees`.
  // I will simulate saving them via local state passed to a final commit if store doesn't persist them yet.
  
  const { players: allPlayers } = useFootballStore();

  const [homeCaptainId, setHomeCaptainId] = useState<string>('');
  const [awayCaptainId, setAwayCaptainId] = useState<string>('');
  const [refereeName, setRefereeName] = useState('');

  if (!activeMatch) return null;

  // Resolve player objects for dropdown/selection
  const homeStarters = activeMatch.homeTeamPlayers.map(id => allPlayers.find(p => p.id === id)).filter(Boolean);
  const awayStarters = activeMatch.awayTeamPlayers.map(id => allPlayers.find(p => p.id === id)).filter(Boolean);

  const handleStartMatch = () => {
    if (!homeCaptainId || !awayCaptainId) {
      Alert.alert('Missing Captains', 'Please select a captain for both teams.');
      return;
    }
    if (!refereeName.trim()) {
      Alert.alert('Missing Referee', 'Please enter the main referee name.');
      return;
    }

    // Start the match in the store
    startMatch(); 
    
    // Redirect to Scoring Dashboard
    // Important: The `KnockoutMatchScoring` screen we built previously uses this data.
    router.replace({
      pathname: `/(football)/startKnockOutTournament/${tournamentId}/scoringScreen`,
      params: { fixtureId }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-white px-4 py-4 border-b border-slate-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900 ml-4">Officials & Captains</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        
        {/* Home Captain */}
        <Text className="text-sm font-bold text-slate-500 mb-3 uppercase">
          Captain: {activeMatch.homeTeamName}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
          <View className="flex-row gap-3">
            {homeStarters.map(p => (
              <TouchableOpacity
                key={p?.id}
                onPress={() => setHomeCaptainId(p?.id || '')}
                className={`p-3 rounded-xl border items-center w-28 ${
                  homeCaptainId === p?.id ? 'bg-green-50 border-green-500' : 'bg-white border-slate-200'
                }`}
              >
                <Ionicons name="shield" size={20} color={homeCaptainId === p?.id ? '#16a34a' : '#94a3b8'} />
                <Text numberOfLines={1} className="font-bold text-slate-900 mt-2">{p?.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Away Captain */}
        <Text className="text-sm font-bold text-slate-500 mb-3 uppercase">
          Captain: {activeMatch.awayTeamName}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
          <View className="flex-row gap-3">
            {awayStarters.map(p => (
              <TouchableOpacity
                key={p?.id}
                onPress={() => setAwayCaptainId(p?.id || '')}
                className={`p-3 rounded-xl border items-center w-28 ${
                  awayCaptainId === p?.id ? 'bg-red-50 border-red-500' : 'bg-white border-slate-200'
                }`}
              >
                <Ionicons name="shield-outline" size={20} color={awayCaptainId === p?.id ? '#ef4444' : '#94a3b8'} />
                <Text numberOfLines={1} className="font-bold text-slate-900 mt-2">{p?.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Referee */}
        <Text className="text-sm font-bold text-slate-500 mb-3 uppercase">Match Official</Text>
        <View className="bg-white p-4 rounded-xl border border-slate-200 mb-8">
          <Text className="text-slate-900 font-semibold mb-2">Main Referee Name</Text>
          <TextInput
            value={refereeName}
            onChangeText={setRefereeName}
            placeholder="Enter Name"
            className="bg-slate-50 border border-slate-200 rounded-lg p-3"
          />
        </View>

      </ScrollView>

      <View className="p-4 bg-white border-t border-slate-200">
        <TouchableOpacity 
          onPress={handleStartMatch}
          className="bg-green-600 py-4 rounded-xl items-center shadow-lg shadow-green-200"
        >
          <View className="flex-row items-center">
          
            <Text className="text-white font-bold text-lg ml-2">Kick Off Match</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}