// components/football/SetFixtureScheduleModal.tsx
// Shared "set date/time/venue" modal for a not-yet-started tournament fixture —
// used by both the league and knockout tournament dashboards.
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CalendarModal from '@/components/CalendarModal';

interface SetFixtureScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  defaultVenueName?: string;
  onSubmit: (data: { scheduledAt: string; venueName?: string }) => Promise<void>;
}

export default function SetFixtureScheduleModal({
  visible,
  onClose,
  defaultVenueName,
  onSubmit,
}: SetFixtureScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [time, setTime] = useState('');
  const [venueName, setVenueName] = useState(defaultVenueName ?? '');
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
      await onSubmit({ scheduledAt: scheduledAt.toISOString(), venueName: venueName.trim() || undefined });
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not set fixture schedule');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-slate-900">Set Match Schedule</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Kickoff Date</Text>
            <TouchableOpacity
              onPress={() => setShowCalendar(true)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 flex-row items-center"
            >
              <Ionicons name="calendar-outline" size={18} color="#374151" />
              <Text className="text-slate-900 ml-2">
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </TouchableOpacity>

            <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Kickoff Time</Text>
            <TextInput
              value={time}
              onChangeText={handleTimeChange}
              placeholder="HH:MM"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              maxLength={5}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 text-slate-900"
            />

            <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Venue</Text>
            <TextInput
              value={venueName}
              onChangeText={setVenueName}
              placeholder="Venue name"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6 text-slate-900"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={onClose} className="flex-1 border border-slate-300 rounded-xl py-3 items-center">
                <Text className="text-slate-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-blue-600 rounded-xl py-3 items-center"
              >
                {submitting ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-semibold">Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    </>
  );
}
