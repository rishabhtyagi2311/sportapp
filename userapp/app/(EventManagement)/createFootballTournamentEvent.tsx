// app/(venue)/eventManager/createFootballTournamentEvent.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import uuid from 'react-native-uuid';
import { Event } from '@/types/booking';
import { useEventManagerStore } from '@/store/eventManagerStore';
import { CURRENT_USER } from './usercontext';

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */
type TournamentFormat = 'league' | 'knockout';
type FeeType = 'per_team' | 'total';

interface FormState {
  name: string;
  description: string;
  venueId: string;
  tournamentFormat: TournamentFormat | '';
  teamSize: string;
  maxTeams: string;
  maxRegistrations: string;
  date: string;
  time: string;
  duration: string;
  feeAmount: string;
  feeType: FeeType | '';
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT */
/* -------------------------------------------------------------------------- */
export default function CreateFootballTournamentEventScreen() {
  const { createEvent } = useEventManagerStore();

  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    venueId: '',
    tournamentFormat: '',
    teamSize: '11',
    maxTeams: '',
    maxRegistrations: '',
    date: '',
    time: '',
    duration: '2',
    feeAmount: '',
    feeType: '',
  });

  /* ----------------------------- HELPERS -------------------------------- */
  const updateForm = (key: keyof FormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle date input with format control
  const handleDateChange = (text: string) => {
    const sanitized = text.replace(/[^\d-]/g, '');
    let formatted = sanitized;
    if (sanitized.length > 4 && !sanitized.includes('-')) {
      formatted = sanitized.slice(0, 4) + '-' + sanitized.slice(4);
    }
    if (sanitized.length > 7 && sanitized.split('-').length === 2) {
      const parts = formatted.split('-');
      formatted =
        parts[0] + '-' + parts[1].slice(0, 2) + '-' + parts[1].slice(2);
    }
    if (formatted.length <= 10) {
      updateForm('date', formatted);
    }
  };

  // Handle time input with format control
  const handleTimeChange = (text: string) => {
    const sanitized = text.replace(/[^\d:]/g, '');
    let formatted = sanitized;
    if (sanitized.length > 2 && !sanitized.includes(':')) {
      formatted = sanitized.slice(0, 2) + ':' + sanitized.slice(2);
    }
    if (formatted.length <= 5) {
      updateForm('time', formatted);
    }
  };

  /* ----------------------------- VALIDATION -------------------------------- */
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter tournament name');
      return false;
    }
    if (!formData.venueId.trim()) {
      Alert.alert('Error', 'Please enter venue');
      return false;
    }
    if (!formData.tournamentFormat) {
      Alert.alert('Error', 'Please select tournament format');
      return false;
    }
    if (!formData.teamSize) {
      Alert.alert('Error', 'Please enter team size');
      return false;
    }
    if (!formData.maxRegistrations) {
      Alert.alert('Error', 'Please enter maximum registrations');
      return false;
    }
    if (!formData.maxTeams) {
      Alert.alert('Error', 'Please enter maximum teams');
      return false;
    }
    if (!formData.date) {
      Alert.alert('Error', 'Please enter tournament date');
      return false;
    }
    if (
      formData.date.length !== 10 ||
      !formData.date.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
      return false;
    }
    if (!formData.time) {
      Alert.alert('Error', 'Please enter tournament time');
      return false;
    }
    if (
      formData.time.length !== 5 ||
      !formData.time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    ) {
      Alert.alert('Error', 'Please enter time in HH:MM format');
      return false;
    }
    if (!formData.duration) {
      Alert.alert('Error', 'Please enter tournament duration');
      return false;
    }
    if (!formData.feeAmount) {
      Alert.alert('Error', 'Please enter fee amount');
      return false;
    }
    if (!formData.feeType) {
      Alert.alert('Error', 'Please select fee type');
      return false;
    }
    return true;
  };

  /* ----------------------------- SUBMIT ------------------------------------ */
  const handleSubmit = () => {
    if (!validateForm()) return;

    try {
      // Parse date and time
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      const dateTime = new Date(year, month - 1, day, hours, minutes);

      // Calculate registration deadline (7 days before)
      const deadline = new Date(dateTime);
      deadline.setDate(deadline.getDate() - 1);

      // Create event object
      const event: Event = {
        id: uuid.v4().toString(),
        creatorId: CURRENT_USER.id,
        venueId: formData.venueId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        eventType: 'footballtournament',
        tournamentFormat: formData.tournamentFormat as TournamentFormat,
        sport: {
          id: 'football',
          name: 'Football',
          category: 'outdoor',
          varieties: [],
        },
        participationType: 'team',
        teamSize: parseInt(formData.teamSize),
        maxParticipants: parseInt(formData.maxTeams),
        maxRegistrations: parseInt(formData.maxRegistrations),
        currentParticipants: 0,
        dateTime: dateTime.toISOString(),
        duration: parseFloat(formData.duration),
        fees: {
          amount: parseFloat(formData.feeAmount),
          currency: 'INR',
          type: formData.feeType as FeeType,
        },
        organizer: {
          name: CURRENT_USER.name,
          contact: CURRENT_USER.phone,
        },
        status: 'upcoming',
        isPublic: true,
        registrationDeadline: deadline.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create event (uses Manager store logic which auto-syncs to booking store)
      createEvent(event);
      router.push("/(EventManagement)/organizerDashboard");
    } catch (error) {
      console.error('Error creating tournament event:', error);
      Alert.alert(
        'Error',
        'Failed to create tournament event. Please check your inputs.'
      );
    }
  };

  /* ----------------------------- UI ---------------------------------------- */
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View className="w-full h-full bg-slate-900">
          {/* Header */}
          <View className="px-6 py-4 border-b border-white flex-row items-center mt-4">
            <TouchableOpacity
              className="mr-4"
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">
              Create Football Tournament
            </Text>
          </View>

          {/* Form */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Tournament Name */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">
                Tournament Name *
              </Text>
              <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name="trophy-outline" size={20} color="#374151" />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="Enter tournament name"
                  placeholderTextColor="#6b7280"
                  value={formData.name}
                  onChangeText={(text) => updateForm('name', text)}
                />
              </View>
            </View>

            {/* Venue Selection */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">
                Venue *
              </Text>
              <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name="location-outline" size={20} color="#374151" />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="Enter venue"
                  placeholderTextColor="#6b7280"
                  value={formData.venueId}
                  onChangeText={(text) => updateForm('venueId', text)}
                />
              </View>
            </View>

            {/* Tournament Format Selection */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">
                Tournament Format *
              </Text>
              <Text className="text-gray-400 text-sm mb-3">
                Select the tournament format
              </Text>
              <View className="flex-row">
                {['league', 'knockout'].map((format) => (
                  <TouchableOpacity
                    key={format}
                    onPress={() =>
                      updateForm('tournamentFormat', format as TournamentFormat)
                    }
                    className={`flex-1 rounded-lg py-3 px-2 mr-2 border ${
                      formData.tournamentFormat === format
                        ? 'bg-green-600 border-green-500'
                        : 'bg-sky-100 border-gray-300'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-center text-sm ${
                        formData.tournamentFormat === format
                          ? 'text-white font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      {format.charAt(0).toUpperCase() + format.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">
                Description (Optional)
              </Text>
              <View className="bg-sky-100 rounded-xl border border-gray-200 px-4">
                <TextInput
                  className="w-full text-black py-4 text-base"
                  placeholder="Enter tournament description"
                  placeholderTextColor="#6b7280"
                  value={formData.description}
                  onChangeText={(text) => updateForm('description', text)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Team Size */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">
                Team Size *
              </Text>
              <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name="people-outline" size={20} color="#374151" />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="Enter team size (e.g., 11)"
                  placeholderTextColor="#6b7280"
                  value={formData.teamSize}
                  onChangeText={(text) => updateForm('teamSize', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Maximum Registrations */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">
                Maximum Registrations Allowed *
              </Text>
              <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons
                  name="people-circle-outline"
                  size={20}
                  color="#374151"
                />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="Enter max registrations"
                  placeholderTextColor="#6b7280"
                  value={formData.maxRegistrations}
                  onChangeText={(text) => updateForm('maxRegistrations', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Maximum Teams */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">
                Maximum Teams (Final) *
              </Text>
              <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name="shield-outline" size={20} color="#374151" />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="Enter maximum teams"
                  placeholderTextColor="#6b7280"
                  value={formData.maxTeams}
                  onChangeText={(text) => updateForm('maxTeams', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Date & Time */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">
                Date & Time *
              </Text>
              <View className="flex-row space-x-2">
                <View className="flex-1 bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4 mr-2">
                  <Ionicons name="calendar-outline" size={20} color="#374151" />
                  <TextInput
                    className="flex-1 text-black py-4 px-3 text-base"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#6b7280"
                    value={formData.date}
                    onChangeText={handleDateChange}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                <View className="flex-1 bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                  <Ionicons name="time-outline" size={20} color="#374151" />
                  <TextInput
                    className="flex-1 text-black py-4 px-3 text-base"
                    placeholder="HH:MM"
                    placeholderTextColor="#6b7280"
                    value={formData.time}
                    onChangeText={handleTimeChange}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>
            </View>

            {/* Duration */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">
                Duration (Days) *
              </Text>
              <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name="hourglass-outline" size={20} color="#374151" />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="Enter duration in hours"
                  placeholderTextColor="#6b7280"
                  value={formData.duration}
                  onChangeText={(text) => updateForm('duration', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Fee Amount & Type */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">
                Fee Details *
              </Text>
              <View className="mb-3 bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Text className="text-gray-700 font-bold text-lg">₹</Text>
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="Enter fee amount"
                  placeholderTextColor="#6b7280"
                  value={formData.feeAmount}
                  onChangeText={(text) => updateForm('feeAmount', text)}
                  keyboardType="numeric"
                />
              </View>
              <Text className="text-white font-semibold mb-2">Fee Type</Text>
              <View className="flex-row flex-wrap">
                {['per_team', 'total'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => updateForm('feeType', type as FeeType)}
                    className={`rounded-lg py-2 px-3 mr-2 mb-2 border ${
                      formData.feeType === type
                        ? 'bg-green-600 border-green-500'
                        : 'bg-sky-100 border-gray-300'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm ${
                        formData.feeType === type
                          ? 'text-white font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      {type === 'per_team'
                        ? 'Per Team'
                        : 'Total (Fixed)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-blue-300 rounded-xl py-4 mb-6 shadow-lg"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-black font-bold text-lg mr-2">
                  Create Tournament Event
                </Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="black"
                />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}