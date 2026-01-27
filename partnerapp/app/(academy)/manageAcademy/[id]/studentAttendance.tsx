import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAcademyStore } from "@/store/academyStore";

export default function StudentAttendanceScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const router = useRouter();

  /* ✅ Correct Zustand subscription */
  const attendance = useAcademyStore((state) => state.attendance);

  if (!studentId) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Invalid student</Text>
      </SafeAreaView>
    );
  }

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const years = Array.from({ length: 7 }, (_, i) => now.getFullYear() - 5 + i);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const studentAttendance = attendance.filter(
    (a) => a.studentId === studentId
  );

  const attendanceMap: Record<string, boolean> = {};
  studentAttendance.forEach((a) => {
    attendanceMap[a.date] = a.present;
  });

  const getDayStatus = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return attendanceMap[dateStr];
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      {/* Header */}
      <View className="bg-white border-b border-gray-300 flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900">
          Student Attendance
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Month / Year Pickers */}
        <View className="flex-row mb-4">
          <View className="flex-1 bg-slate-900 rounded-lg border border-gray-300 mr-2">
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(val) => setSelectedMonth(val)}
            >
              {months.map((m, idx) => (
                <Picker.Item key={m} label={m} value={idx} />
              ))}
            </Picker>
          </View>

          <View className="flex-1 bg-slate-900 rounded-lg border border-gray-300">
            <Picker
              selectedValue={selectedYear}
              onValueChange={(val) => setSelectedYear(val)}
            >
              {years.map((y) => (
                <Picker.Item key={y} label={String(y)} value={y} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Title */}
        <View className="bg-white rounded-lg border border-gray-300 py-3 mb-4">
          <Text className="text-center text-base font-semibold text-slate-900">
            Attendance for {months[selectedMonth]} {selectedYear}
          </Text>
        </View>

        {/* Calendar Grid */}
        <View className="bg-white rounded-xl border border-gray-300 p-3">
          <View className="flex-row flex-wrap">
            {daysArray.map((day) => {
              const status = getDayStatus(day);

              return (
                <View
                  key={day}
                  className="w-[14.28%] items-center justify-center mb-3"
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center
                      ${
                        status === true
                          ? "bg-green-500"
                          : status === false
                          ? "bg-red-400"
                          : "bg-slate-100 border border-slate-300"
                      }
                    `}
                  >
                    <Text
                      className={`font-semibold ${
                        status === true || status === false
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      {day}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Empty state */}
        {studentAttendance.length === 0 && (
          <Text className="text-center text-gray-500 mt-6">
            No attendance marked for this student yet
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
