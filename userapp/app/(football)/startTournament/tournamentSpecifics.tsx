// app/(football)/tournaments/settings.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTournamentStore, TournamentSettings } from '@/store/footballTournamentStore';

export default function TournamentSettingsScreen() {
  const router = useRouter();
  const { creationDraft, setTournamentSettings, createTournament } = useTournamentStore();

  const [venue, setVenue] = useState('');
  const [numberOfPlayers, setNumberOfPlayers] = useState('11');
  const [numberOfSubstitutes, setNumberOfSubstitutes] = useState('5');
  const [numberOfReferees, setNumberOfReferees] = useState('1');
  const [matchDuration, setMatchDuration] = useState('90');

  useEffect(() => {
    if (creationDraft?.settings) {
      setVenue(creationDraft.settings.venue || '');
      setNumberOfPlayers(String(creationDraft.settings.numberOfPlayers || 11));
      setNumberOfSubstitutes(String(creationDraft.settings.numberOfSubstitutes || 5));
      setNumberOfReferees(String(creationDraft.settings.numberOfReferees || 1));
      setMatchDuration(String(creationDraft.settings.matchDuration || 90));
    }
  }, [creationDraft]);

  const handleCreateTournament = () => {
    if (!venue.trim()) {
      Alert.alert('Error', 'Please enter a venue');
      return;
    }

    const players = parseInt(numberOfPlayers);
    const substitutes = parseInt(numberOfSubstitutes);
    const referees = parseInt(numberOfReferees);
    const duration = parseInt(matchDuration);

    if (isNaN(players) || players < 1 || players > 11) {
      Alert.alert('Error', 'Number of players must be between 1 and 11');
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
      format: creationDraft!.format,
    };

    setTournamentSettings(settings);
    const tournamentId = createTournament();

    if (tournamentId) {
      Alert.alert(
        'Success',
        'Tournament created successfully!',
        [
          {
            text: 'View Tournament',
            onPress: () => router.push(`/(football)/landingScreen/tournament`),
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to create tournament');
    }
  };

  if (!creationDraft) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500">No tournament draft found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
        <View className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 mb-6">
          <Text className="text-white text-sm font-medium mb-2">Creating Tournament</Text>
          <Text className="text-white text-xl font-bold mb-1">{creationDraft.name}</Text>
          <View className="flex-row items-center mt-2">
            <View className="bg-white/20 px-2 py-1 rounded mr-2">
              <Text className="text-white text-xs font-medium">{creationDraft.format.toUpperCase()}</Text>
            </View>
            <View className="bg-white/20 px-2 py-1 rounded">
              <Text className="text-white text-xs font-medium">{creationDraft.selectedTeamIds.length} Teams</Text>
            </View>
          </View>
        </View>

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
                <View>
                  <Text className="text-sm font-semibold text-slate-900">Players per Team</Text>
                  <Text className="text-xs text-slate-500">Standard: 11</Text>
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
                <View>
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
                <View>
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
                <View>
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

        {/* Info */}
        <View className="bg-slate-100 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={18} color="#475569" />
            <Text className="flex-1 text-xs text-slate-600 ml-2 leading-5">
              These settings will apply to all matches in the tournament. Fixtures will be automatically generated based on the {creationDraft.format} format.
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