import React from "react";
import { View, Text } from "react-native";
import { Student } from "../types";
import { Ionicons } from "@expo/vector-icons";

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-200 flex-row items-center">
      {/* Avatar/Icon */}
      <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
        <Ionicons name="person" size={24} color="#2563EB" />
      </View>

      {/* Student Details */}
      <View className="flex-1">
        <Text className="text-lg font-bold text-slate-900">{student.name}</Text>
        <Text className="text-sm text-gray-600">Age: {student.age} yrs</Text>
        <Text className="text-sm text-gray-600">
          Father: <Text className="font-medium text-slate-800">{student.fatherName}</Text>
        </Text>
        <Text className="text-sm text-gray-600">
          Contact: <Text className="font-medium text-slate-800">{student.fatherContact}</Text>
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          Enrolled: {student.enrollmentDate}
        </Text>
      </View>
    </View>
  );
}
