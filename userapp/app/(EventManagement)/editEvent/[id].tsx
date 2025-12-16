// app/(venue)/eventManager/editEvent/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Sport } from '@/types/booking';
import { useEventManagerStore } from '@/store/eventManagerStore';
import { useBookingStore } from '@/store/venueStore';

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */
type EventType = 'tournament' | 'practice' | 'friendly' | 'training' | 'league';
type ParticipationType = 'individual' | 'team';
type FeeType = 'per_person' | 'per_team' | 'total';
type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

interface FormState {
  name: string;
  description: string;
  venueId: string;
  sportId: string;
  eventType: EventType;
  participationType: ParticipationType;
  teamSize: string;
  maxParticipants: string;
  date: string;
  time: string;
  duration: string;
  feeAmount: string;
  feeType: FeeType;
  status: EventStatus;
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT */
/* -------------------------------------------------------------------------- */
export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // 1. USE MANAGER STORE FOR ACTIONS (Syncs automatically)
  const { managedEvents, updateEvent, deleteEvent } = useEventManagerStore();
  // 2. USE BOOKING STORE FOR READ-ONLY DATA
  const { sports } = useBookingStore();
  
  const event = managedEvents.find((e) => e.id === id);
  const [form, setForm] = useState<FormState | null>(null);

  /* ---------------------------- INITIAL LOAD ------------------------------ */
  useEffect(() => {
    if (!event) {
      Alert.alert('Error', 'Event not found');
      router.back();
      return;
    }
    const dt = new Date(event.dateTime);
    setForm({
      name: event.name,
      description: event.description ?? '',
      venueId: event.venueId,
      sportId: event.sport.id,
      eventType: event.eventType,
      participationType: event.participationType,
      teamSize: event.teamSize?.toString() ?? '',
      maxParticipants: event.maxParticipants.toString(),
      date: dt.toISOString().slice(0, 10),
      time: dt.toISOString().slice(11, 16),
      duration: event.duration.toString(),
      feeAmount: event.fees.amount.toString(),
      feeType: event.fees.type,
      status: event.status,
    });
  }, [event]);

  if (!form) return null;

  /* ----------------------------- HELPERS -------------------------------- */
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  // Handle date input
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
      update('date', formatted);
    }
  };

  // Handle time input
  const handleTimeChange = (text: string) => {
    const sanitized = text.replace(/[^\d:]/g, '');
    let formatted = sanitized;
    if (sanitized.length > 2 && !sanitized.includes(':')) {
      formatted = sanitized.slice(0, 2) + ':' + sanitized.slice(2);
    }
    if (formatted.length <= 5) {
      update('time', formatted);
    }
  };

  /* ----------------------------- VALIDATION -------------------------------- */
  const validateForm = (): boolean => {
    if (!form.name.trim()) { Alert.alert('Error', 'Please enter event name'); return false; }
    if (!form.venueId.trim()) { Alert.alert('Error', 'Please enter venue'); return false; }
    if (!form.sportId.trim()) { Alert.alert('Error', 'Please enter sport'); return false; }
    if (!form.eventType) { Alert.alert('Error', 'Please select event type'); return false; }
    if (!form.participationType) { Alert.alert('Error', 'Please select participation type'); return false; }
    if (form.participationType === 'team' && !form.teamSize) { Alert.alert('Error', 'Please enter team size'); return false; }
    if (!form.maxParticipants) { Alert.alert('Error', 'Please enter maximum participants'); return false; }
    if (!form.date) { Alert.alert('Error', 'Please enter event date'); return false; }
    if (form.date.length !== 10 || !form.date.match(/^\d{4}-\d{2}-\d{2}$/)) { Alert.alert('Error', 'Please enter date in YYYY-MM-DD format'); return false; }
    if (!form.time) { Alert.alert('Error', 'Please enter event time'); return false; }
    if (form.time.length !== 5 || !form.time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) { Alert.alert('Error', 'Please enter time in HH:MM format'); return false; }
    if (!form.duration) { Alert.alert('Error', 'Please enter event duration'); return false; }
    if (!form.feeAmount) { Alert.alert('Error', 'Please enter fee amount'); return false; }
    if (!form.feeType) { Alert.alert('Error', 'Please select fee type'); return false; }
    return true;
  };

  /* ------------------------------ SAVE ------------------------------------ */
  const handleSave = () => {
    if (!id) return;
    if (!validateForm()) return;

    try {
      const [y, m, d] = form.date.split('-').map(Number);
      const [hh, mm] = form.time.split(':').map(Number);
      const dateTime = new Date(y, m - 1, d, hh, mm);

      const deadline = new Date(dateTime);
      deadline.setDate(deadline.getDate() - 7);

      const sport: Sport =
        sports.find((s) => s.id === form.sportId) ?? {
          id: form.sportId,
          name: form.sportId,
          category: 'outdoor',
          varieties: [],
        };

      // TRIGGER UPDATE IN MANAGER STORE (Auto-syncs to BookingStore)
      updateEvent(id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        venueId: form.venueId,
        sport,
        eventType: form.eventType,
        participationType: form.participationType,
        teamSize:
          form.participationType === 'team'
            ? Number(form.teamSize)
            : undefined,
        maxParticipants: Number(form.maxParticipants),
        dateTime: dateTime.toISOString(),
        duration: Number(form.duration),
        fees: {
          amount: Number(form.feeAmount),
          currency: 'INR',
          type: form.feeType,
        },
        status: form.status,
        registrationDeadline: deadline.toISOString(),
      });

      Alert.alert('Success', 'Event updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert('Error', 'Failed to update event. Please check your inputs.');
    }
  };

  /* ------------------------------ DELETE ---------------------------------- */
  const handleDelete = () => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          try {
            // TRIGGER DELETE IN MANAGER STORE (Auto-syncs to BookingStore)
            deleteEvent(id!);
            router.back();
          } catch (error) {
            console.error('Error deleting event:', error);
            Alert.alert('Error', 'Failed to delete event');
          }
        },
      },
    ]);
  };

  /* ------------------------------ UI -------------------------------------- */
  return (
    <SafeAreaView className="flex-1 bg-white">
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
          <Text className="text-white text-xl font-bold">Edit Event</Text>
        </View>

        {/* Form */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Event Name */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Event Name *
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="trophy-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="Enter event name"
                placeholderTextColor="#6b7280"
                value={form.name}
                onChangeText={(text) => update('name', text)}
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
                value={form.venueId}
                onChangeText={(text) => update('venueId', text)}
              />
            </View>
          </View>

          {/* Sport Selection */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Sport *
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="basketball-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="Enter sport"
                placeholderTextColor="#6b7280"
                value={form.sportId}
                onChangeText={(text) => update('sportId', text)}
              />
            </View>
          </View>

          {/* Event Type Selection */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Event Type *
            </Text>
            <Text className="text-gray-400 text-sm mb-3">
              Select the type of event
            </Text>
            <View className="flex-row flex-wrap mb-3">
              {['tournament', 'practice', 'friendly', 'training', 'league'].map(
                (type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => update('eventType', type as EventType)}
                    className={`rounded-lg px-3 py-2 mr-2 mb-2 border ${
                      form.eventType === type
                        ? 'bg-green-600 border-green-500'
                        : 'bg-sky-100 border-gray-300'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm ${
                        form.eventType === type
                          ? 'text-white font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
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
                placeholder="Enter event description"
                placeholderTextColor="#6b7280"
                value={form.description}
                onChangeText={(text) => update('description', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Participation Type */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Participation Type *
            </Text>
            <View className="flex-row">
              {['individual', 'team'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() =>
                    update('participationType', type as ParticipationType)
                  }
                  className={`flex-1 rounded-lg py-3 px-2 mr-2 border ${
                    form.participationType === type
                      ? 'bg-green-600 border-green-500'
                      : 'bg-sky-100 border-gray-300'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-center text-sm ${
                      form.participationType === type
                        ? 'text-white font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Team Size (if applicable) */}
          {form.participationType === 'team' && (
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">
                Team Size *
              </Text>
              <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name="people-outline" size={20} color="#374151" />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="Enter team size"
                  placeholderTextColor="#6b7280"
                  value={form.teamSize}
                  onChangeText={(text) => update('teamSize', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {/* Maximum Participants */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Maximum{' '}
              {form.participationType === 'team' ? 'Teams' : 'Participants'} *
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons
                name="people-circle-outline"
                size={20}
                color="#374151"
              />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder={`Enter maximum ${
                  form.participationType === 'team' ? 'teams' : 'participants'
                }`}
                placeholderTextColor="#6b7280"
                value={form.maxParticipants}
                onChangeText={(text) => update('maxParticipants', text)}
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
              <View className="flex-1 bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name="calendar-outline" size={20} color="#374151" />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6b7280"
                  value={form.date}
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
                  value={form.time}
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
              Duration (hours) *
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="hourglass-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="Enter duration in hours"
                placeholderTextColor="#6b7280"
                value={form.duration}
                onChangeText={(text) => update('duration', text)}
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
                value={form.feeAmount}
                onChangeText={(text) => update('feeAmount', text)}
                keyboardType="numeric"
              />
            </View>
            <Text className="text-white font-semibold mb-2">Fee Type</Text>
            <View className="flex-row flex-wrap">
              {['per_person', 'per_team', 'total'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => update('feeType', type as FeeType)}
                  className={`rounded-lg py-2 px-3 mr-2 mb-2 border ${
                    form.feeType === type
                      ? 'bg-green-600 border-green-500'
                      : 'bg-sky-100 border-gray-300'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm ${
                      form.feeType === type
                        ? 'text-white font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    {type === 'per_person'
                      ? 'Per Person'
                      : type === 'per_team'
                      ? 'Per Team'
                      : 'Total (Fixed)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Event Status *
            </Text>
            <Text className="text-gray-400 text-sm mb-3">
              Select event status
            </Text>
            <View className="flex-row flex-wrap">
              {['upcoming', 'ongoing', 'completed', 'cancelled'].map(
                (status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => update('status', status as EventStatus)}
                    className={`rounded-lg px-3 py-2 mr-2 mb-2 border ${
                      form.status === status
                        ? 'bg-green-600 border-green-500'
                        : 'bg-sky-100 border-gray-300'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm ${
                        form.status === status
                          ? 'text-white font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            className="bg-blue-300 rounded-xl py-4 mb-4 shadow-lg"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-black font-bold text-lg mr-2">
                Save Changes
              </Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="black"
              />
            </View>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={handleDelete}
            className="bg-red-600 rounded-xl py-4 mb-6 shadow-lg"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-white font-bold text-lg mr-2">
                Delete Event
              </Text>
              <Ionicons name="trash-outline" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}