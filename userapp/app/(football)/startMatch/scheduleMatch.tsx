// app/(football)/startMatch/scheduleMatch.tsx
// Lightweight "schedule for later" path: teams + date/time/venue only.
// Lineup and other settings are deferred until kickoff (see scoringScreen's
// finalize-and-start flow for a match created here).
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFootballStore } from '@/store/footballTeamStore';
import { useMatchExecutionStore } from '@/store/footballMatchEventStore';
import CalendarModal from '@/components/CalendarModal';
import VenueLocationPicker, { VenueLocationValue } from '@/components/VenueLocationPicker';

export default function ScheduleMatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ myTeamId: string; opponentTeamId: string }>();
  const { getTeamById } = useFootballStore();
  const { scheduleMatch } = useMatchExecutionStore();

  const myTeamId = parseInt(params.myTeamId, 10);
  const opponentTeamId = parseInt(params.opponentTeamId, 10);
  const myTeam = getTeamById(myTeamId);
  const opponentTeam = getTeamById(opponentTeamId);

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState<VenueLocationValue>({});
  const [submitting, setSubmitting] = useState(false);

  const handleTimeChange = (text: string) => {
    const sanitized = text.replace(/[^\d:]/g, '');
    let formatted = sanitized;
    if (sanitized.length > 2 && !sanitized.includes(':')) {
      formatted = sanitized.slice(0, 2) + ':' + sanitized.slice(2);
    }
    if (formatted.length <= 5) {
      setTime(formatted);
    }
  };

  const handleSubmit = async () => {
    if (!time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      Alert.alert('Error', 'Please enter the kickoff time in HH:MM format');
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    if (scheduledAt.getTime() <= Date.now()) {
      Alert.alert('Error', 'The scheduled kickoff must be in the future');
      return;
    }

    setSubmitting(true);
    try {
      await scheduleMatch({
        homeTeamId: myTeamId,
        awayTeamId: opponentTeamId,
        scheduledAt: scheduledAt.toISOString(),
        venueName: location.venueName ?? location.locationName ?? undefined,
      });
      Alert.alert('Match Scheduled', 'Your teammates will see this under Upcoming Matches.', [
        { text: 'OK', onPress: () => router.push('/(football)/landingScreen/matches') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not schedule match');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="w-full h-full bg-slate-900">
          {/* Header */}
          <View className="px-6 py-4 border-b border-white flex-row items-center">
            <TouchableOpacity className="mr-4" onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Schedule Match</Text>
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            {/* Team confirmation */}
            <View className="bg-sky-100 rounded-2xl p-4 mb-6 flex-row items-center justify-between">
              <View className="items-center flex-1">
                <Ionicons name="shield" size={24} color="#16a34a" />
                <Text className="text-slate-900 font-bold text-sm mt-1" numberOfLines={1}>
                  {myTeam?.name ?? 'My Team'}
                </Text>
              </View>
              <Text className="text-slate-500 font-bold mx-2">VS</Text>
              <View className="items-center flex-1">
                <Ionicons name="flag" size={24} color="#2563eb" />
                <Text className="text-slate-900 font-bold text-sm mt-1" numberOfLines={1}>
                  {opponentTeam?.name ?? 'Opponent'}
                </Text>
              </View>
            </View>

            <Text className="text-gray-300 text-sm mb-6">
              Set a date, time, and venue now — your teammates and the opponent team will see this
              match under Upcoming. Lineup and other settings are picked later, closer to kickoff.
            </Text>

            {/* Date & Time */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">Kickoff Date & Time *</Text>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => setShowCalendar(true)}
                  className="flex-1 bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4 py-4 mr-2"
                >
                  <Ionicons name="calendar-outline" size={20} color="#374151" />
                  <Text className="text-black ml-3 text-base">
                    {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
                <View className="flex-1 bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                  <Ionicons name="time-outline" size={20} color="#374151" />
                  <TextInput
                    className="flex-1 text-black py-4 px-3 text-base"
                    placeholder="HH:MM"
                    placeholderTextColor="#6b7280"
                    value={time}
                    onChangeText={handleTimeChange}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>
            </View>

            {/* Venue */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">Venue *</Text>
              <VenueLocationPicker value={location} onChange={setLocation} />
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className="bg-blue-300 rounded-xl py-4 mb-6 shadow-lg"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-black font-bold text-lg mr-2">
                  {submitting ? 'Scheduling…' : 'Schedule Match'}
                </Text>
                <Ionicons name="checkmark-circle-outline" size={24} color="black" />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        selectedDate={selectedDate}
        onDateSelect={(date) => {
          setSelectedDate(date);
          setShowCalendar(false);
        }}
        title="Select Kickoff Date"
      />
    </SafeAreaView>
  );
}
