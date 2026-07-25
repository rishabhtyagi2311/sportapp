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
import { useEventManagerStore } from '@/store/eventManagerStore';
import VenueLocationPicker, { VenueLocationValue } from '@/components/VenueLocationPicker';

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */
type TournamentFormat = 'league' | 'knockout';
type FeeType = 'per_team' | 'total';

interface FormState {
  name: string;
  description: string;
  location: VenueLocationValue;
  tournamentFormat: TournamentFormat | '';
  teamSize: string;
  maxTeams: string;
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
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    location: {},
    tournamentFormat: '',
    teamSize: '11',
    maxTeams: '',
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
    if (!formData.location.venueId && !formData.location.locationName?.trim()) {
      Alert.alert('Error', 'Please choose a venue or enter a custom location');
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
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Parse date and time
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      const dateTime = new Date(year, month - 1, day, hours, minutes);

      // Calculate registration deadline (1 day before)
      const deadline = new Date(dateTime);
      deadline.setDate(deadline.getDate() - 1);

      await createEvent({
        eventType: 'footballtournament',
        tournamentFormat: formData.tournamentFormat,
        venueId: formData.location.venueId,
        locationName: formData.location.venueId ? undefined : formData.location.locationName?.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        sportName: 'Football',
        participationType: 'team',
        teamSize: parseInt(formData.teamSize, 10),
        maxParticipants: parseInt(formData.maxTeams, 10),
        dateTime: dateTime.toISOString(),
        duration: Math.round(parseFloat(formData.duration) * 60),
        feeAmount: parseFloat(formData.feeAmount),
        feeType: formData.feeType,
        registrationDeadline: deadline.toISOString(),
      });

      router.push('/(EventManagement)/organizerDashboard');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create tournament event. Please check your inputs.');
    } finally {
      setSubmitting(false);
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
              <VenueLocationPicker
                value={formData.location}
                onChange={(location) => setFormData((prev) => ({ ...prev, location }))}
              />
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
              disabled={submitting}
              className="bg-blue-300 rounded-xl py-4 mb-6 shadow-lg"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-black font-bold text-lg mr-2">
                  {submitting ? 'Creating…' : 'Create Tournament Event'}
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