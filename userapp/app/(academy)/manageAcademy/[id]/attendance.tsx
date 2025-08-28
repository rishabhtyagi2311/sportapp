import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAcademyStore } from '@/store/academyStore';
import AttendanceCard from '@/components/AttendanceCard';

export default function AttendanceScreen() {
  const { id } = useLocalSearchParams();
  const { getStudentsByAcademy, markAttendance, getAttendanceStatus } = useAcademyStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const students = getStudentsByAcademy(id as string);

  const handleMarkAttendance = (studentId: string, present: boolean) => {
    markAttendance(studentId, selectedDate, present);
  };

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <View className="flex-row justify-between items-center bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
        <Text className="text-base font-semibold text-gray-900">Date: {selectedDate}</Text>
        <TouchableOpacity 
          className="bg-blue-600 rounded-lg px-4 py-2"
          onPress={() => setSelectedDate(new Date().toISOString().split('T')[0])}
        >
          <Text className="text-white text-sm font-semibold">Today</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AttendanceCard
            student={item}
            attendanceStatus={getAttendanceStatus(item.id, selectedDate)}
            onMarkAttendance={(present) => handleMarkAttendance(item.id, present)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
