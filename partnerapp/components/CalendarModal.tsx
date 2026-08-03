// components/CalendarModal.tsx — shared month-grid date picker modal.
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  title?: string;
}

export default function CalendarModal({
  visible,
  onClose,
  selectedDate,
  onDateSelect,
  title = 'Select Date',
}: CalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const getMonthName = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const renderMonth = (monthDate: Date) => {
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const weeks = [];
    let currentWeek: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(
        <View key={`empty-${i}`} className="w-12 h-12 items-center justify-center" />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isPast = isPastDate(year, month, day);
      const isSelectedDay = isSelected(date);
      const isTodayDay = isToday(date);

      currentWeek.push(
        <TouchableOpacity
          key={day}
          disabled={isPast}
          className={`w-12 h-12 items-center justify-center rounded-lg ${
            isPast
              ? 'opacity-40'
              : isSelectedDay
                ? 'bg-blue-600'
                : isTodayDay
                  ? 'bg-blue-100 border border-blue-300'
                  : 'hover:bg-gray-50'
          }`}
          onPress={() => !isPast && onDateSelect(date)}
        >
          <Text className={`text-sm font-medium ${
            isPast
              ? 'text-gray-400'
              : isSelectedDay
                ? 'text-white'
                : isTodayDay
                  ? 'text-blue-700'
                  : 'text-gray-800'
          }`}>
            {day}
          </Text>
        </TouchableOpacity>
      );

      if (currentWeek.length === 7 || day === daysInMonth) {
        while (currentWeek.length < 7) {
          currentWeek.push(
            <View key={`empty-end-${currentWeek.length}`} className="w-12 h-12" />
          );
        }

        weeks.push(
          <View key={`week-${weeks.length}`} className="flex-row justify-between mb-1">
            {currentWeek}
          </View>
        );
        currentWeek = [];
      }
    }

    return (
      <View className="mb-8">
        <Text className="text-xl font-bold text-gray-900 mb-4 text-center">
          {getMonthName(monthDate)}
        </Text>

        <View className="flex-row justify-between mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <View key={dayName} className="w-12 items-center">
              <Text className="text-xs font-semibold text-gray-600">{dayName}</Text>
            </View>
          ))}
        </View>

        {weeks}
      </View>
    );
  };

  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center p-4">
        <View className="bg-white rounded-2xl p-6 max-h-4/5">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900">{title}</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {renderMonth(currentMonth)}
            {renderMonth(nextMonth)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
