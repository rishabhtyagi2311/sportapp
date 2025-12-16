import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import uuid from 'react-native-uuid';
import { Event, Sport } from '@/types/booking';
import { useEventManagerStore } from '@/store/eventManagerStore';
import { useBookingStore } from '@/store/venueStore';
import { CURRENT_USER } from './usercontext';

/* TYPES */
type EventType = 'tournament' | 'practice' | 'friendly' | 'training' | 'league';
type ParticipationType = 'individual' | 'team';
type FeeType = 'per_person' | 'per_team' | 'total';

interface FormState {
  name: string;
  description: string;
  venueId: string;
  sportId: string;
  eventType: EventType | '';
  participationType: ParticipationType | '';
  teamSize: string;
  maxParticipants: string;
  date: string;
  time: string;
  duration: string;
  feeAmount: string;
  feeType: FeeType | '';
}

export default function CreateEventScreen() {
  // We strictly use createEvent from the Manager Store
  const { createEvent } = useEventManagerStore();
  // We use booking store only for reference data (sports list)
  const { sports } = useBookingStore();

  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    venueId: '',
    sportId: '',
    eventType: '',
    participationType: '',
    teamSize: '',
    maxParticipants: '',
    date: '',
    time: '',
    duration: '',
    feeAmount: '',
    feeType: '',
  });

  /* HELPERS */
  const updateForm = (key: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (text: string) => {
    const sanitized = text.replace(/[^\d-]/g, '');
    let formatted = sanitized;
    if (sanitized.length > 4 && !sanitized.includes('-')) {
      formatted = sanitized.slice(0, 4) + '-' + sanitized.slice(4);
    }
    if (sanitized.length > 7 && sanitized.split('-').length === 2) {
      const parts = formatted.split('-');
      formatted = parts[0] + '-' + parts[1].slice(0, 2) + '-' + parts[1].slice(2);
    }
    if (formatted.length <= 10) updateForm('date', formatted);
  };

  const handleTimeChange = (text: string) => {
    const sanitized = text.replace(/[^\d:]/g, '');
    let formatted = sanitized;
    if (sanitized.length > 2 && !sanitized.includes(':')) {
      formatted = sanitized.slice(0, 2) + ':' + sanitized.slice(2);
    }
    if (formatted.length <= 5) updateForm('time', formatted);
  };

  /* VALIDATION */
  const validateForm = (): boolean => {
    if (!formData.name.trim()) { Alert.alert('Error', 'Please enter event name'); return false; }
    if (!formData.venueId.trim()) { Alert.alert('Error', 'Please enter venue'); return false; }
    if (!formData.sportId.trim()) { Alert.alert('Error', 'Please enter sport'); return false; }
    if (!formData.eventType) { Alert.alert('Error', 'Please select event type'); return false; }
    if (!formData.participationType) { Alert.alert('Error', 'Please select participation type'); return false; }
    if (formData.participationType === 'team' && !formData.teamSize) { Alert.alert('Error', 'Please enter team size'); return false; }
    if (!formData.maxParticipants) { Alert.alert('Error', 'Please enter maximum participants'); return false; }
    if (!formData.date || formData.date.length !== 10) { Alert.alert('Error', 'Please enter date YYYY-MM-DD'); return false; }
    if (!formData.time || formData.time.length !== 5) { Alert.alert('Error', 'Please enter time HH:MM'); return false; }
    if (!formData.duration) { Alert.alert('Error', 'Please enter duration'); return false; }
    if (!formData.feeAmount) { Alert.alert('Error', 'Please enter fee amount'); return false; }
    if (!formData.feeType) { Alert.alert('Error', 'Please select fee type'); return false; }
    return true;
  };

  /* SUBMIT */
  const handleSubmit = () => {
    if (!validateForm()) return;

    try {
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      const dateTime = new Date(year, month - 1, day, hours, minutes);

      const deadline = new Date(dateTime);
      deadline.setDate(deadline.getDate() - 7);

      const sport: Sport = sports.find((s) => s.id === formData.sportId) ?? {
        id: formData.sportId,
        name: formData.sportId,
        category: 'outdoor',
        varieties: [],
      };

      const event: Event = {
        id: uuid.v4().toString(),
        creatorId: CURRENT_USER.id,
        venueId: formData.venueId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        eventType: formData.eventType as EventType,
        sport,
        participationType: formData.participationType as ParticipationType,
        teamSize: formData.participationType === 'team' ? parseInt(formData.teamSize) : undefined,
        maxParticipants: parseInt(formData.maxParticipants),
        currentParticipants: 0,
        dateTime: dateTime.toISOString(),
        duration: parseFloat(formData.duration || '2'),
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

      // Calls Manager Store -> which auto-syncs to Booking Store
      createEvent(event);
      router.back();
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event.');
    }
  };

  // ... (UI RENDER CODE REMAINS THE SAME AS PROVIDED)
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="w-full h-full bg-slate-900">
        <View className="px-6 py-4 border-b border-white flex-row items-center mt-4">
          <TouchableOpacity className="mr-4" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Create Event</Text>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          {/* ... Inputs for Name, Venue, Sport ... */}
          {/* (I am abbreviating the UI here as your original UI code was fine, 
              just inserting the logic hooks above) */}
          {/* ... Use the render code from your original snippet ... */}
          <Text className="text-white">Form UI Here (Same as your code)</Text>
          <TouchableOpacity onPress={handleSubmit} className="bg-blue-300 rounded-xl py-4 mt-6">
             <Text className="text-center font-bold">Create Event</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}