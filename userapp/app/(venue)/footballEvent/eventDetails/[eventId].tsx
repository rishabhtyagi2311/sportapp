import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Event } from '@/types/booking';
import { useBookingStore } from '@/store/venueStore';
import { useFootballStore, Team } from '@/store/footballTeamStore';
import { useRegistrationRequestStore } from '@/store/eventRegistrationRequestStore';

const generateId = () =>
  `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export default function FootballTournamentEventDetailsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();

  const { getEventById, getVenueById } = useBookingStore();
  const { currentPlayer, teams } = useFootballStore();
  const { addRequest } = useRegistrationRequestStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (!eventId) return;
    const found = getEventById(eventId);
    if (found) setEvent(found);
  }, [eventId]);

  if (!event) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-100">
        <Text className="text-slate-500">Tournament not found</Text>
      </SafeAreaView>
    );
  }

  const venue = getVenueById(event.venueId);
  const deadline = new Date(event.registrationDeadline);

  const isRegistrationOpen =
    event.status === 'upcoming' &&
    new Date() < deadline &&
    event.currentParticipants < event.maxParticipants;

  const captainTeams = currentPlayer
    ? teams.filter(
        (t) => t.captainId === currentPlayer.id && t.status === 'active'
      )
    : [];

  const canRegister =
    !!currentPlayer && captainTeams.length > 0 && isRegistrationOpen;

  const handleRegister = () => {
    if (!currentPlayer || !selectedTeam) {
      Alert.alert('Select a team', 'Please select a team to continue.');
      return;
    }

    addRequest({
      id: generateId(),
      domain: 'football_tournament',
      eventId: event.id,
      teamId: selectedTeam.id,
      teamName: selectedTeam.teamName,
      captainPlayerId: currentPlayer.id,
      captainName: currentPlayer.name,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });

    Alert.alert(
      'Registration Submitted',
      'Your request has been sent to the organizer.'
    );

    setSelectedTeam(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-slate-900">
          Tournament Details
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Event Hero Card */}
        <View className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <View
              className={`px-3 py-1 rounded-full ${
                isRegistrationOpen
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}
            >
              <Text
                className={`text-xs font-semibold uppercase ${
                  isRegistrationOpen
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}
              >
                {isRegistrationOpen
                  ? 'Registration Open'
                  : 'Registration Closed'}
              </Text>
            </View>

            <View className="px-3 py-1 rounded-full bg-slate-100">
              <Text className="text-xs font-medium text-slate-700 uppercase">
                {event.tournamentFormat}
              </Text>
            </View>
          </View>

          <Text className="text-2xl font-bold text-slate-900">
            {event.name}
          </Text>

          {event.description && (
            <Text className="text-slate-600 mt-2 leading-6">
              {event.description}
            </Text>
          )}

          {/* Stats */}
          <View className="flex-row flex-wrap mt-5 gap-3">
            <View className="flex-row items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <Ionicons name="people" size={16} color="#334155" />
              <Text className="ml-2 text-slate-700 font-medium">
                {event.teamSize} / team
              </Text>
            </View>

            <View className="flex-row items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <Ionicons name="trophy" size={16} color="#334155" />
              <Text className="ml-2 text-slate-700 font-medium">
                {event.currentParticipants}/{event.maxParticipants} teams
              </Text>
            </View>

            <View className="flex-row items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <Ionicons name="location" size={16} color="#334155" />
              <Text className="ml-2 text-slate-700 font-medium">
                {venue?.name ?? 'Venue TBD'}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Messages */}
        {!currentPlayer && (
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <Text className="text-amber-800 font-medium">
              Please sign in to your football profile to register.
            </Text>
          </View>
        )}

        {currentPlayer && captainTeams.length === 0 && (
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <Text className="text-blue-800 font-medium">
              Only team captains can register for tournaments.
            </Text>
          </View>
        )}

        {/* Team Selection */}
        {canRegister && (
          <View className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <Text className="text-lg font-semibold text-slate-900 mb-4">
              Select Your Team
            </Text>

            {captainTeams.map((team) => {
              const selected = selectedTeam?.id === team.id;

              return (
                <TouchableOpacity
                  key={team.id}
                  onPress={() => setSelectedTeam(team)}
                  activeOpacity={0.85}
                  className={`p-4 rounded-xl mb-3 border ${
                    selected
                      ? 'bg-slate-900 border-slate-900'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text
                        className={`font-semibold text-base ${
                          selected ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {team.teamName}
                      </Text>
                      <Text
                        className={`text-sm mt-1 ${
                          selected
                            ? 'text-slate-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {team.city} • {team.memberPlayerIds.length} players
                      </Text>
                    </View>

                    <Ionicons
                      name={
                        selected
                          ? 'checkmark-circle'
                          : 'radio-button-off'
                      }
                      size={24}
                      color={selected ? '#ffffff' : '#cbd5f5'}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={handleRegister}
              activeOpacity={0.9}
              className="mt-5 bg-slate-900 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-base">
                Submit Registration Request
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
