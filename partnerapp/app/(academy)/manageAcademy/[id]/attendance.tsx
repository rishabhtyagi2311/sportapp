import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAcademyStore } from "@/store/academyStore";
import AttendanceCard from "@/components/AttendanceCard";

export default function AttendanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    markAttendance,
    getAttendanceStatus,
    getStudentsByAcademy,
  } = useAcademyStore();

  if (!id) return null;

  const [selectedTab, setSelectedTab] =
    useState<"mark" | "history">("mark");

  const selectedDate = new Date().toISOString().split("T")[0];

  const students = getStudentsByAcademy(id);

  const handleMarkAttendance = (studentId: string, present: boolean) => {
    markAttendance(studentId, selectedDate, present);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-gray-300 mt-2">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b bg-slate-900 h-16">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">
            Attendance
          </Text>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b bg-gray-100 h-16">
          {["mark", "history"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab as any)}
              className={`flex-1 p-3 items-center justify-center ${
                selectedTab === tab
                  ? "bg-white border-b-2 border-green-500"
                  : ""
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedTab === tab
                    ? "text-green-600"
                    : "text-slate-700"
                }`}
              >
                {tab === "mark" ? "Mark Attendance" : "View Attendance"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedTab === "mark" ? (
          <>
            <View className="px-4 py-3 bg-gray-50 items-center">
              <Text className="font-semibold">
                Date: {selectedDate}
              </Text>
            </View>

            <FlatList
              data={students}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AttendanceCard
                  student={item}
                  attendanceStatus={getAttendanceStatus(
                    item.id,
                    selectedDate
                  )}
                  onMarkAttendance={(present) =>
                    handleMarkAttendance(item.id, present)
                  }
                />
              )}
            />
          </>
        ) : (
          <ScrollView className="p-4">
            {students.map((s) => (
              <TouchableOpacity
                key={s.id}
                className="bg-white rounded-xl border p-4 mb-3"
                onPress={() =>
                  router.push({
                    pathname: "/manageAcademy/[id]/studentAttendance",
                    params: { id, studentId: s.id },
                  })
                }
              >
                <Text className="text-lg font-bold">{s.name}</Text>
                <Text className="text-sm text-gray-600">
                  Father: {s.fatherName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
