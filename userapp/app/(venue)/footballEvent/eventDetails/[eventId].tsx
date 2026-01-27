// app/(venue)/tournament/eventDetails/[eventId].tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Event } from '@/types/booking';
import { useBookingStore } from '@/store/venueStore';
import { useFootballStore, Team } from '@/store/footballTeamStore';

export default function FootballTournamentEventDetailsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();

  const { getEventById, getVenueById } = useBookingStore();
  const { currentPlayer, teams } = useFootballStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    const found = getEventById(eventId);
    if (!found) return;
    setEvent(found);
  }, [eventId]);

  if (!event) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Ionicons name="search-outline" size={48} color="#d1d5db" />
        <Text className="text-gray-500 mt-4 font-medium">Tournament not found</Text>
      </SafeAreaView>
    );
  }

  const venue = getVenueById(event.venueId);
  const eventDate = new Date(event.dateTime);
  const deadline = new Date(event.registrationDeadline);
  const slotsLeft = event.maxParticipants - event.currentParticipants;

  const isRegistrationOpen =
    event.status === 'upcoming' &&
    new Date() < deadline &&
    event.currentParticipants < event.maxParticipants;

  const captainTeams = currentPlayer
    ? teams.filter(
        (t) => t.captainId === currentPlayer.id && t.status === 'active'
      )
    : [];

  const canRegister = !!currentPlayer && captainTeams.length > 0 && isRegistrationOpen;

  const handleRegister = () => {
    if (!selectedTeam) {
      Alert.alert('Select Team', 'Please select a team to register');
      return;
    }
    Alert.alert('Success', `Team "${selectedTeam.teamName}" selected for registration`);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} className="bg-white border-b border-slate-100 shadow-sm">
        <View className="px-4 py-4 flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="bg-slate-100 p-2 rounded-full"
          >
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-slate-900 text-lg font-black">Tournament Details</Text>
          <View className="w-10" /> 
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Banner Info */}
        <View className="bg-white px-6 pt-6 pb-8 rounded-b-[40px] shadow-sm border-b border-slate-100">
          <View className="flex-row items-center mb-4">
            <View className={`px-3 py-1 rounded-full ${isRegistrationOpen ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className={`text-[10px] font-black uppercase tracking-wider ${isRegistrationOpen ? 'text-green-700' : 'text-red-700'}`}>
                {isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}
              </Text>
            </View>
            <View className="bg-black-100 px-3 py-1 rounded-full ml-2">
              <Text className="text-black-700 text-[10px] font-black uppercase tracking-wider">
                {event.tournamentFormat}
              </Text>
            </View>
          </View>

          <Text className="text-3xl font-black text-slate-900 leading-tight">
            {event.name}
          </Text>

          {event.description && (
            <Text className="text-slate-500 mt-2 text-base leading-6">
              {event.description}
            </Text>
          )}

          <View className="flex-row items-center mt-6">
            <View className="flex-row items-center bg-slate-50 px-4 py-3 rounded-2xl mr-3 flex-1 border border-slate-100">
              <Ionicons name="people" size={18} color="black" />
              <Text className="ml-2 text-slate-700 font-bold">
                {event.teamSize} Per Side
              </Text>
            </View>
            <View className="flex-row items-center bg-slate-50 px-4 py-3 rounded-2xl flex-1 border border-slate-100">
              <Ionicons name="map" size={18} color="black" />
              <Text className="ml-2 text-slate-700 font-bold truncate" numberOfLines={1}>
                {venue?.name || 'Local Venue'}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Grid */}
        <View className="px-6 -mt-4">
          <View className="flex-row flex-wrap justify-between">
            {/* Schedule */}
            <View className="bg-white w-[48%] rounded-3xl p-4 mb-4 shadow-sm border border-slate-50">
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter mb-2">Schedule</Text>
              <Text className="text-slate-900 font-bold">
                {eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </Text>
              <Text className="text-slate-500 text-xs">Starts {eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>

            {/* Participation */}
            <View className="bg-white w-[48%] rounded-3xl p-4 mb-4 shadow-sm border border-slate-50">
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter mb-2">Capacity</Text>
              <Text className="text-slate-900 font-bold">{event.currentParticipants}/{event.maxParticipants} Teams</Text>
              <Text className={`text-xs font-bold ${slotsLeft <= 2 ? 'text-red-500' : 'text-slate-500'}`}>
                {slotsLeft} slots left
              </Text>
            </View>

            {/* Entry Fee */}
            <View className="bg-white w-full rounded-3xl p-5 mb-6 shadow-sm border border-slate-50 flex-row items-center justify-between">
              <View>
                <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter mb-1">Registration Fee</Text>
                <Text className="text-black-600 text-2xl font-black">₹{event.fees.amount}</Text>
                <Text className="text-slate-500 text-xs italic">{event.fees.type.replace('_', ' ')}</Text>
              </View>
              <View className="bg-black-50 p-3 rounded-2xl">
                <Ionicons name="wallet-outline" size={24} color="black" />
              </View>
            </View>
          </View>

          {/* Location Details */}
          {venue && (
            <View className="bg-white rounded-3xl p-5 mb-8 border border-slate-100">
              <View className="flex-row items-center mb-3">
                <Ionicons name="location-sharp" size={20} color="#f43f5e" />
                <Text className="text-slate-900 font-black text-lg ml-2">Venue</Text>
              </View>
              <Text className="text-slate-800 font-bold mb-1">{venue.name}</Text>
              <Text className="text-slate-500 leading-5">
                {venue.address.street}, {venue.address.city}
              </Text>
            </View>
          )}

          {/* Registration Logic Section */}
          <View className="mb-12">
            {!currentPlayer && (
              <View className="bg-amber-50 border border-amber-100 rounded-3xl p-5 flex-row items-center">
                <Ionicons name="alert-circle" size={24} color="#d97706" />
                <Text className="text-amber-800 font-bold flex-1 ml-3 leading-5">
                  Sign in to your football profile to register a team.
                </Text>
              </View>
            )}

            {currentPlayer && captainTeams.length === 0 && (
              <View className="bg-blue-50 border border-blue-100 rounded-3xl p-5 flex-row items-center">
                <Ionicons name="information-circle" size={24} color="#2563eb" />
                <Text className="text-blue-800 font-bold flex-1 ml-3 leading-5">
                  Only team captains can register for this tournament.
                </Text>
              </View>
            )}

            {canRegister && (
              <View>
                <Text className="text-slate-900 font-black text-xl mb-4">Select Your Squad</Text>
                {captainTeams.map((team) => (
                  <TouchableOpacity
                    key={team.id}
                    onPress={() => setSelectedTeam(team)}
                    className={`p-5 rounded-3xl mb-4 border-2 flex-row items-center justify-between ${
                      selectedTeam?.id === team.id
                        ? 'bg-black-600 border-black-600 shadow-lg shadow-black-200'
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <View className="flex-1">
                      <Text className={`font-black text-lg ${selectedTeam?.id === team.id ? 'text-white' : 'text-slate-900'}`}>
                        {team.teamName}
                      </Text>
                      <Text className={`text-xs mt-1 font-medium ${selectedTeam?.id === team.id ? 'text-black-100' : 'text-slate-400'}`}>
                        {team.city} • {team.memberPlayerIds.length} Squad Members
                      </Text>
                    </View>
                    <Ionicons 
                      name={selectedTeam?.id === team.id ? "checkmark-circle" : "radio-button-off"} 
                      size={28} 
                      color={selectedTeam?.id === team.id ? "white" : "#e2e8f0"} 
                    />
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={handleRegister}
                  activeOpacity={0.9}
                  className="mt-4 shadow-xl shadow-black-300"
                >
                  <View className="bg-black-600 py-5 rounded-3xl flex-row items-center justify-center">
                    <Text className="text-white font-black text-lg mr-2 uppercase tracking-widest">
                      Confirm Registration
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}