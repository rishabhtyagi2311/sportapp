import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAcademyStore } from "@/store/academyStore";

export default function StudentAttendanceScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const { attendance } = useAcademyStore();
  const router = useRouter();

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

  const studentAttendance = attendance.filter((a) => a.studentId === studentId);
  const attendanceMap: Record<string, boolean> = {};
  studentAttendance.forEach((a) => {
    attendanceMap[a.date] = a.present;
  });

  const getDayStatus = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return attendanceMap[dateStr];
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Header with Back */}
      <View className="bg-white border-b border-gray-300 flex-row items-center p-4 mt-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#0f172a" /> 
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900">Student Attendance</Text>
      </View>

      <View className=" h-full bg-slate-900">
        <View className="p-4">
        {/* Month/Year Selection */}
        <View className="flex-row mb-4">
          <View className="flex-1 bg-white rounded-lg border border-gray-300 mr-2">
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(val) => setSelectedMonth(val)}
              dropdownIconColor="#0f172a"
            >
              {months.map((m, idx) => (
                <Picker.Item key={m} label={m} value={idx} />
              ))}
            </Picker>
          </View>
          <View className="flex-1 bg-white rounded-lg border border-gray-300">
            <Picker
              selectedValue={selectedYear}
              onValueChange={(val) => setSelectedYear(val)}
              dropdownIconColor="#0f172a"
            >
              {years.map((y) => (
                <Picker.Item key={y} label={String(y)} value={y} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Section label */}
       <View className= "w-full bg-gray-300 rounded-sm flex flex-row justify-center mb-4 ">
         <Text className="text-lg font-bold text-black mb-2 mt-2">
          Attendace Card for {months[selectedMonth]} {selectedYear}
        </Text>

       </View>

        {/* Calendar Grid */}
        <View className="flex-row flex-wrap">
          {daysArray.map((day) => {
            const status = getDayStatus(day);
            return (
              <View
                key={day}
                className="w-[14.28%] aspect-square items-center justify-center"
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center
                    ${
                      status === true
                        ? "bg-green-500"
                        : status === false
                        ? "bg-gray-300"
                        : "bg-white border border-gray-300"
                    }
                  `}
                >
                  <Text
                    className={`font-semibold ${
                      status === true ? "text-white" : "text-slate-900"
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
      </View>
    </SafeAreaView>
  );
}
