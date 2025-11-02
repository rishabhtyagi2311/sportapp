import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAcademyStore } from "@/store/academyStore";
import { useEnrollmentStore } from "@/store/academyEnrollmentStore";
import { usechildStore } from "@/store/academyChildProfile";

export default function ChildAttendanceScreen() {
  const router = useRouter();
  const { childId, academyId, academyName } = useLocalSearchParams<{ 
    childId: string; 
    academyId: string;
    academyName: string;
  }>();
  
  // Get the attendance data and methods from the academy store
  const getAttendanceStatus = useAcademyStore((state) => state.getAttendanceStatus);
  const attendance = useAcademyStore((state) => state.attendance);
  const childProfiles = usechildStore((state) => state.childProfiles);
  
  // Find the child profile
  const childProfile = childProfiles.find(profile => profile.id === childId);
  const childName = childProfile?.childName || "Child";

  // Date state
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const years = Array.from({ length: 7 }, (_, i) => now.getFullYear() - 3 + i);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter attendance records for this specific child
  const childAttendance = attendance.filter((a) => a.studentId === childId);
  
  // Create a map for quick lookup
  const attendanceMap: Record<string, boolean> = {};
  childAttendance.forEach((a) => {
    attendanceMap[a.date] = a.present;
  });

  // Get status for a specific day
  const getDayStatus = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return getAttendanceStatus(childId, dateStr);
  };

  // Calculate attendance statistics for the selected month
  const getMonthStats = () => {
    let present = 0;
    let absent = 0;
    let total = 0;

    daysArray.forEach(day => {
      const status = getDayStatus(day);
      if (status === true) {
        present++;
        total++;
      } else if (status === false) {
        absent++;
        total++;
      }
    });

    const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, absent, total, presentPercentage };
  };

  const stats = getMonthStats();

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="bg-slate-900 shadow-lg">
        <View className="flex-row items-center px-4 py-3 border-b border-slate-800">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 rounded-lg"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Header Title */}
          <View className="flex-1">
            <Text className="text-white font-bold text-lg" numberOfLines={1}>
              Attendance Record
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {childName} - {academyName}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Month/Year Selection */}
          <View className="flex-row mb-4">
            <View className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm mr-2">
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
            <View className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm">
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

          {/* Attendance Summary Card */}
          <View className="bg-white rounded-xl shadow-sm mb-5 p-4 border border-gray-200">
            <Text className="text-xl font-bold text-slate-900 mb-3">
              Monthly Summary
            </Text>
            
            <View className="flex-row justify-between mb-2">
              <View className="items-center">
                <Text className="text-sm text-slate-500">Present</Text>
                <Text className="text-lg font-bold text-green-600">{stats.present} days</Text>
              </View>
              
              <View className="items-center">
                <Text className="text-sm text-slate-500">Absent</Text>
                <Text className="text-lg font-bold text-red-500">{stats.absent} days</Text>
              </View>
              
              <View className="items-center">
                <Text className="text-sm text-slate-500">Attendance</Text>
                <Text className="text-lg font-bold text-blue-600">{stats.presentPercentage}%</Text>
              </View>
            </View>
            
            {/* Progress bar */}
            <View className="h-2 bg-gray-200 rounded-full mt-2 mb-1 overflow-hidden">
              <View 
                className="h-2 bg-green-500 rounded-full" 
                style={{ width: `${stats.presentPercentage}%` }} 
              />
            </View>
            
            <Text className="text-xs text-slate-500 text-center mt-1">
              {stats.total > 0 ? 
                `${stats.present} out of ${stats.total} days present this month` : 
                "No attendance records for this month"}
            </Text>
          </View>

          {/* Calendar Section */}
          <View className="bg-white rounded-xl shadow-sm mb-4 border border-gray-200">
            <View className="py-3 px-4 bg-slate-900 rounded-t-xl">
              <Text className="text-white font-bold text-center">
                Attendance for {months[selectedMonth]} {selectedYear}
              </Text>
            </View>

            {/* Calendar Legend */}
            <View className="flex-row justify-center space-x-4 py-2 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="h-3 w-3 rounded-full bg-green-500 mr-1" />
                <Text className="text-xs text-slate-600">Present</Text>
              </View>
              
              <View className="flex-row items-center">
                <View className="h-3 w-3 rounded-full bg-red-500 mr-1" />
                <Text className="text-xs text-slate-600">Absent</Text>
              </View>
              
              <View className="flex-row items-center">
                <View className="h-3 w-3 rounded-full bg-gray-300 mr-1" />
                <Text className="text-xs text-slate-600">No Record</Text>
              </View>
            </View>

            {/* Day Header */}
            <View className="flex-row py-2 border-b border-gray-100">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <View key={`day-${index}`} className="flex-1 items-center">
                  <Text className="font-medium text-slate-500">{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid with proper weekday alignment */}
            <View className="p-2">
              {(() => {
                // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
                const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
                
                // Create calendar rows
                const rows = [];
                let days = [];
                
                // Add empty cells for the first row
                for (let i = 0; i < firstDayOfMonth; i++) {
                  days.push(<View key={`empty-${i}`} className="flex-1 aspect-square p-1" />);
                }
                
                // Add days
                for (let day = 1; day <= daysInMonth; day++) {
                  const status = getDayStatus(day);
                  
                  days.push(
                    <View key={`day-${day}`} className="flex-1 aspect-square p-1">
                      <View 
                        className={`w-full h-full rounded-full items-center justify-center
                          ${status === true ? "bg-green-500" : 
                            status === false ? "bg-red-500" : "bg-gray-200"}`
                        }
                      >
                        <Text className={`text-xs font-medium ${status !== undefined ? "text-white" : "text-slate-800"}`}>
                          {day}
                        </Text>
                      </View>
                    </View>
                  );
                  
                  // If we've reached the end of a row (Saturday) or the end of the month
                  if ((firstDayOfMonth + day) % 7 === 0 || day === daysInMonth) {
                    rows.push(
                      <View key={`row-${rows.length}`} className="flex-row py-1">
                        {days}
                      </View>
                    );
                    days = [];
                  }
                }
                
                return rows;
              })()}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}