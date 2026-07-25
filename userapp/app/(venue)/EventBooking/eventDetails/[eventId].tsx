// app/(user)/eventDetails/[eventId].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useEventManagerStore } from '@/store/eventManagerStore';
import { useRegistrationRequestStore } from '@/store/eventRegistrationRequestStore';
import { useAuthStore } from '@/store/authStore';
import { footballService } from '@/services/football';

/* -------------------------------------------------------------------------- */
/* SCREEN */
/* -------------------------------------------------------------------------- */

export default function EventDetailsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();

  const { getEventById, fetchEventById } = useEventManagerStore();
  const { createRegistration } = useRegistrationRequestStore();
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<'details' | 'registration'>('details');
  const [submitting, setSubmitting] = useState(false);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const event = getEventById(eventId!);

  /* ----------------------- LOAD EVENT ----------------------- */

  useEffect(() => {
    if (eventId) fetchEventById(eventId);
  }, [eventId]);

  useEffect(() => {
    if (event?.participationType === 'team' && user) {
      setLoadingTeams(true);
      footballService
        .fetchMyTeams()
        .then((teams: any[]) => {
          setMyTeams(teams.filter((t) => t.createdBy?.user?.id === user.id));
        })
        .finally(() => setLoadingTeams(false));
    }
  }, [event?.participationType, user?.id]);

  if (!event) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0f172a" />
      </SafeAreaView>
    );
  }

  /* ----------------------- DERIVED ----------------------- */

  const eventDate = new Date(event.dateTime);
  const deadline = new Date(event.registrationDeadline);

  const slotsLeft = event.maxParticipants - event.currentParticipants;
  const percentFilled = (event.currentParticipants / event.maxParticipants) * 100;

  const isRegistrationOpen =
    event.status === 'upcoming' &&
    new Date() < deadline &&
    event.currentParticipants < event.maxParticipants;

  /* ----------------------- SUBMIT ----------------------- */

  const handleRegistration = async () => {
    if (event.participationType === 'team' && !selectedTeamId) {
      Alert.alert('Select a team', 'Please select which of your teams you want to register.');
      return;
    }

    setSubmitting(true);
    try {
      await createRegistration(event.id, {
        participationType: event.participationType,
        footballTeamId: event.participationType === 'team' ? selectedTeamId! : undefined,
      });
      Alert.alert('Success', 'Registration submitted', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not submit registration');
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------------- DETAILS TAB ----------------------- */

  const renderDetails = () => (
    <ScrollView
      className="bg-gradient-to-b from-slate-50 to-white flex-1"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 px-6 pt-8 pb-12 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 pr-3">
            <Text className="text-black text-xs font-bold uppercase tracking-wider opacity-90 mb-4 ">
              {event.participationType === 'individual' ? '👤 Individual' : '👥 Team Event'}
            </Text>
            <Text className="text-black text-3xl font-bold leading-tight">
              {event.name}
            </Text>
          </View>
          <View className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Ionicons name="sparkles" size={24} color="black" />
          </View>
        </View>
        {event.description && (
          <Text className="text-black/90 text-sm leading-5">
            {event.description}
          </Text>
        )}
      </View>

      {/* Content Cards */}
      <View className="px-6 pt-6 pb-8">
        {/* Registration Progress */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-green-400/50">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full p-3 mr-3">
                <Ionicons name="people" size={20} color="#059669" />
              </View>
              <View>
                <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  Participation
                </Text>
                <Text className="text-gray-900 text-lg font-bold">
                  {event.currentParticipants}/{event.maxParticipants}
                </Text>
              </View>
            </View>
            <View className="bg-green-50 px-3 py-1 rounded-full border border-green-400">
              <Text className="text-green-700 text-xs font-bold">
                {slotsLeft} left
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <View
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
              style={{ width: `${percentFilled}%` }}
            />
          </View>
          <Text className="text-gray-500 text-xs mt-2">
            {percentFilled.toFixed(0)}% filled
          </Text>
        </View>

        {/* Schedule Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-blue-400/50">
          <View className="flex-row items-center mb-4">
            <View className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-3 mr-3">
              <Ionicons name="calendar" size={20} color="#0369a1" />
            </View>
            <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
              Schedule
            </Text>
          </View>

          <View className="space-y-2">
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-medium w-16">Date:</Text>
              <Text className="text-gray-900 font-semibold">
                {eventDate.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-medium w-16">Time:</Text>
              <View className="flex-row items-center">
                <Ionicons name="time" size={16} color="#6b7280" />
                <Text className="text-gray-900 font-semibold ml-2">
                  {eventDate.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fee Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-orange-400/50">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full p-3 mr-3">
                <Ionicons name="wallet" size={20} color="#d97706" />
              </View>
              <View>
                <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  Entry Fee
                </Text>
                <Text className="text-gray-600 text-sm">
                  {event.feeType.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <Text className="text-orange-600 text-2xl font-bold">
              ₹{event.feeAmount}
            </Text>
          </View>
        </View>

        {/* Venue Card */}
        {(event.venueName || event.locationName) && (
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-purple-400/50">
            <View className="flex-row items-center mb-4">
              <View className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-3 mr-3">
                <Ionicons name="location" size={20} color="#9333ea" />
              </View>
              <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                Venue
              </Text>
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-1">
              {event.venueName || event.locationName}
            </Text>
          </View>
        )}

        {/* Deadline Info */}
        <View className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 border border-red-400/50">
          <View className="flex-row items-center mb-2">
            <Ionicons name="alert-circle" size={20} color="#dc2626" />
            <Text className="text-red-700 font-bold ml-2">Registration Deadline</Text>
          </View>
          <Text className="text-red-600 text-sm">
            {deadline.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  /* ----------------------- REGISTRATION TAB ----------------------- */

  const renderRegistration = () => (
    <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
      {/* Registration Header */}
      <View className="bg-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm border-b border-slate-100">
        <View className="flex-row items-center mb-2">
          <View className="bg-slate-100 p-2 rounded-lg">
            <Ionicons name="clipboard" size={24} color="black" />
          </View>
          <Text className="text-slate-900 text-2xl font-black ml-3">
            {event.participationType === 'individual' ? 'Individual' : 'Team'} Registration
          </Text>
        </View>
        <Text className="text-slate-500 text-base leading-5 ml-1">
          {event.participationType === 'individual'
            ? 'Confirm below to secure your spot.'
            : 'Select one of your football teams to register.'}
        </Text>
      </View>

      <View className="px-6 py-8">
        {!isRegistrationOpen ? (
          <View className="bg-red-50 border border-red-100 rounded-3xl p-6 items-center">
            <View className="bg-red-100 rounded-full p-4 mb-4">
              <Ionicons name="lock-closed" size={32} color="#dc2626" />
            </View>
            <Text className="text-red-800 font-bold text-lg text-center">
              Registration Closed
            </Text>
            <Text className="text-red-600 text-center mt-2 leading-5">
              We're sorry! Registration for this event has reached its deadline or is full.
            </Text>
          </View>
        ) : (
          <>
            {event.participationType === 'individual' ? (
              <View className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm">
                <Text className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Registering as</Text>
                <Text className="text-slate-900 font-bold text-lg">
                  {user ? `${user.firstname} ${user.lastname}` : 'You'}
                </Text>
                <Text className="text-slate-500 text-sm mt-1">{user?.contact}</Text>
              </View>
            ) : (
              <View className="mb-8">
                <Text className="text-slate-800 font-bold text-lg mb-4">Select Your Team</Text>
                {loadingTeams ? (
                  <ActivityIndicator size="small" color="#0f172a" />
                ) : myTeams.length === 0 ? (
                  <View className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                    <Text className="text-amber-800 font-semibold">No teams found</Text>
                    <Text className="text-amber-700 text-sm mt-1">
                      You need to create a football team before registering for a team event.
                    </Text>
                  </View>
                ) : (
                  myTeams.map((team) => (
                    <TouchableOpacity
                      key={team.id}
                      onPress={() => setSelectedTeamId(team.id)}
                      className={`rounded-2xl p-4 mb-3 border-2 ${
                        selectedTeamId === team.id ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text className="text-slate-900 font-bold text-base">{team.name}</Text>
                      <Text className="text-slate-500 text-sm mt-1">{team.location}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegistration}
              disabled={submitting}
              activeOpacity={0.8}
              className="mt-4 overflow-hidden"
            >
              <View className="bg-slate-900 py-5 rounded-2xl flex-row items-center justify-center shadow-xl shadow-slate-300">
                <Text className="text-white text-center font-black text-lg mr-2 uppercase tracking-widest">
                  {submitting ? 'Submitting…' : 'Confirm Registration'}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );

  /* ----------------------- SHELL ----------------------- */

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View className="bg-slate-900 px-6 py-4 flex-row items-center justify-between shadow-xl">
        <TouchableOpacity
          onPress={() => router.back()}
          className=" rounded-full p-3"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-lg font-bold flex-1 ml-4 mr-2" numberOfLines={1}>
          {event.name}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        {(['details', 'registration'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            className={`flex-1 py-4 px-4 ${
              activeTab === t
                ? 'border-b-2 border-green-600 bg-green-50/30'
                : 'bg-white'
            }`}
            onPress={() => setActiveTab(t)}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons
                name={t === 'details' ? 'information-circle' : 'clipboard'}
                size={18}
                color={activeTab === t ? '#059669' : '#9ca3af'}
              />
              <Text
                className={`ml-2 font-bold ${
                  activeTab === t
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                {t === 'details' ? 'Details' : 'Registration'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'details'
        ? renderDetails()
        : renderRegistration()}
    </SafeAreaView>
  );
}
