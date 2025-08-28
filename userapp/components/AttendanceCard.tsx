import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Student } from '../types';

interface AttendanceCardProps {
  student: Student;
  attendanceStatus: boolean | undefined;
  onMarkAttendance: (present: boolean) => void;
}

export default function AttendanceCard({ student, attendanceStatus, onMarkAttendance }: AttendanceCardProps) {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-900 mb-1">{student.name}</Text>
        <Text className="text-sm text-gray-600">Age: {student.age}</Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className={`px-4 py-2 rounded-lg border ${
            attendanceStatus === true 
              ? 'bg-green-500 border-green-500' 
              : 'bg-white border-gray-300'
          }`}
          onPress={() => onMarkAttendance(true)}
        >
          <Text className={`text-sm font-semibold ${
            attendanceStatus === true ? 'text-white' : 'text-gray-600'
          }`}>Present</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-lg border ${
            attendanceStatus === false 
              ? 'bg-red-500 border-red-500' 
              : 'bg-white border-gray-300'
          }`}
          onPress={() => onMarkAttendance(false)}
        >
          <Text className={`text-sm font-semibold ${
            attendanceStatus === false ? 'text-white' : 'text-gray-600'
          }`}>Absent</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}