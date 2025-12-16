import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useKnockoutStore } from '@/store/knockoutTournamentStore';

export default function KnockoutStep3() {
  const router = useRouter();
  const { draft, updateDraft, createTournament } = useKnockoutStore();

  const [venue, setVenue] = useState(draft?.settings.venue || '');
  const [duration, setDuration] = useState(draft?.settings.matchDuration?.toString() || '90');
  const [allowExtraTime, setAllowExtraTime] = useState(draft?.settings.extraTime ?? true);
  const [allowPenalties, setAllowPenalties] = useState(draft?.settings.penalties ?? true);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if (!venue.trim()) {
      Alert.alert('Venue Required', 'Please enter the main venue for the tournament.');
      return;
    }

    setIsCreating(true);

    // 1. Update draft with final settings
    updateDraft({
      settings: {
        venue,
        matchDuration: parseInt(duration) || 90,
        extraTime: allowExtraTime,
        penalties: allowPenalties,
      }
    });

    // 2. Generate Tournament
    // Using setTimeout to allow state update to propagate
    setTimeout(() => {
        const tournamentId = createTournament();
        setIsCreating(false);
        
        if (tournamentId) {
          // 3. Navigate to Dashboard (We will build this next)
          router.replace({
            pathname: '/(football)/tournament',
            params: { tournamentId }
          });
        } else {
          Alert.alert('Error', 'Failed to create tournament. Please try again.');
        }
    }, 500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 border-b border-slate-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900">Rules & Specifics</Text>
        <View className="w-6" /> 
      </View>

      <ScrollView className="flex-1 p-6">
        <Text className="text-slate-500 mb-8">Step 3 of 3</Text>

        {/* Venue */}
        <Text className="text-slate-900 font-semibold mb-3">Tournament Venue</Text>
        <TextInput
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base mb-6"
          placeholder="Main Stadium / Ground"
          value={venue}
          onChangeText={setVenue}
        />

        {/* Match Duration */}
        <Text className="text-slate-900 font-semibold mb-3">Match Duration (Minutes)</Text>
        <TextInput
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base mb-8"
          placeholder="90"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />

        {/* Toggles */}
        <View className="bg-slate-50 rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1 mr-4">
              <Text className="text-slate-900 font-bold text-base">Extra Time</Text>
              <Text className="text-slate-500 text-xs">Allow 30 mins extra time if draw.</Text>
            </View>
            <Switch
              value={allowExtraTime}
              onValueChange={setAllowExtraTime}
              trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-slate-900 font-bold text-base">Penalties</Text>
              <Text className="text-slate-500 text-xs">Shootout if draw persists.</Text>
            </View>
            <Switch
              value={allowPenalties}
              onValueChange={setAllowPenalties}
              trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
            />
          </View>
        </View>

        {/* Summary Card */}
        <View className="bg-orange-50 border border-orange-100 rounded-xl p-4 mt-4">
          <Text className="text-orange-800 font-bold mb-2">Summary</Text>
          <Text className="text-orange-700 text-sm">
            {draft?.name} • {draft?.teamCount} Teams • Knockout Format
          </Text>
        </View>
      </ScrollView>

      <View className="p-6 border-t border-slate-100">
        <TouchableOpacity
          onPress={handleCreate}
          disabled={isCreating}
          className="bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-200"
        >
          <Text className="text-white font-bold text-lg">
            {isCreating ? 'Creating Bracket...' : 'Create Tournament'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}