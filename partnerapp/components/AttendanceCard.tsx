import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Student } from "../types";

interface AttendanceCardProps {
  student: Student;
  attendanceStatus: boolean | undefined;
  onMarkAttendance: (present: boolean) => void;
}

export default function AttendanceCard({
  student,
  attendanceStatus,
  onMarkAttendance,
}: AttendanceCardProps) {
  const isPresent = attendanceStatus === true;

  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-bold text-slate-900">{student.name}</Text>
          <Text className="text-sm text-gray-600">Age: {student.age}</Text>
        </View>

        <TouchableOpacity
          className={`px-5 py-2 rounded-lg ${
            isPresent ? "bg-green-500" : "bg-gray-300"
          }`}
          onPress={() => onMarkAttendance(!isPresent)}
        >
          <Text className="text-white font-semibold">
            {isPresent ? "Present" : "Absent"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
