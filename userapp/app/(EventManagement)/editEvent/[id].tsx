import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Event, Sport } from '@/types/booking';
import { useEventManagerStore } from '@/store/eventManagerStore';
import { useBookingStore } from '@/store/venueStore';

/* TYPES */
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

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // We use the Manager store for actions and finding the event to edit
  const { managedEvents, updateEvent, deleteEvent } = useEventManagerStore();
  const { sports } = useBookingStore(); // Read-only reference for sports list
  
  const event = managedEvents.find((e) => e.id === id);
  const [form, setForm] = useState<FormState | null>(null);

  /* INITIAL LOAD */
  useEffect(() => {
    if (!event) {
      // If event is not found (e.g., page refresh cleared store), go back
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

  /* HELPERS */
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleDateChange = (text: string) => {
    // ... (Same logic as your original code)
    const sanitized = text.replace(/[^\d-]/g, '');
    let formatted = sanitized;
    if (sanitized.length > 4 && !sanitized.includes('-')) formatted = sanitized.slice(0, 4) + '-' + sanitized.slice(4);
    if (sanitized.length > 7 && sanitized.split('-').length === 2) {
       const parts = formatted.split('-');
       formatted = parts[0] + '-' + parts[1].slice(0, 2) + '-' + parts[1].slice(2);
    }
    if (formatted.length <= 10) update('date', formatted);
  };

  const handleTimeChange = (text: string) => {
     // ... (Same logic as your original code)
    const sanitized = text.replace(/[^\d:]/g, '');
    let formatted = sanitized;
    if (sanitized.length > 2 && !sanitized.includes(':')) formatted = sanitized.slice(0, 2) + ':' + sanitized.slice(2);
    if (formatted.length <= 5) update('time', formatted);
  };

  /* VALIDATION */
  const validateForm = (): boolean => {
    if (!form.name.trim()) { Alert.alert('Error', 'Please enter name'); return false; }
    // ... (Add your specific validation logic here same as before)
    return true;
  };

  /* SAVE */
  const handleSave = () => {
    if (!id) return;
    if (!validateForm()) return;

    try {
      const [y, m, d] = form.date.split('-').map(Number);
      const [hh, mm] = form.time.split(':').map(Number);
      const dateTime = new Date(y, m - 1, d, hh, mm);
      const deadline = new Date(dateTime);
      deadline.setDate(deadline.getDate() - 7);

      const sport: Sport = sports.find((s) => s.id === form.sportId) ?? {
        id: form.sportId,
        name: form.sportId,
        category: 'outdoor',
        varieties: [],
      };

      // TRIGGER UPDATE IN MANAGER STORE
      // This will automatically sync to BookingStore via the store logic
      updateEvent(id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        venueId: form.venueId,
        sport,
        eventType: form.eventType,
        participationType: form.participationType,
        teamSize: form.participationType === 'team' ? Number(form.teamSize) : undefined,
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
      Alert.alert('Error', 'Failed to update event.');
    }
  };

  /* DELETE */
  const handleDelete = () => {
    Alert.alert('Delete Event', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          try {
            // TRIGGER DELETE IN MANAGER STORE
            // This will automatically sync to BookingStore
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

  // ... (UI RENDER CODE REMAINS THE SAME AS PROVIDED)
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="w-full h-full bg-slate-900">
         {/* ... Header and ScrollView ... */}
         {/* ... Use the render code from your original snippet ... */}
         <View className="px-6 py-4 mt-4"><Text className="text-white text-xl">Edit Event UI</Text></View>
         
         <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
            {/* Form inputs go here */}
            
             {/* Save Button */}
             <TouchableOpacity onPress={handleSave} className="bg-blue-300 rounded-xl py-4 mb-4">
               <Text className="text-center font-bold">Save Changes</Text>
             </TouchableOpacity>

             {/* Delete Button */}
             <TouchableOpacity onPress={handleDelete} className="bg-red-600 rounded-xl py-4 mb-6">
               <Text className="text-center font-bold text-white">Delete Event</Text>
             </TouchableOpacity>
         </ScrollView>
      </View>
    </SafeAreaView>
  );
}