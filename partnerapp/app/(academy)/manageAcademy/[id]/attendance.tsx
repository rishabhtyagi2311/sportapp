import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { addDays, format, isSameDay, subDays } from "date-fns";
import { useAcademyStore } from "@/store/academyStore";
import AttendanceCard from "@/components/AttendanceCard";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";
import AnimatedPressable from "@/components/animated/AnimatedPressable";

export default function AttendanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isTablet } = useResponsive();

  const {
    markAttendance,
    getAttendanceStatus,
    fetchStudents,
    fetchAcademyAttendance,
    isLoading,
  } = useAcademyStore();
  const allStudents = useAcademyStore((state) => state.students);

  const [selectedTab, setSelectedTab] =
    useState<"mark" | "history">("mark");
  const [selectedDay, setSelectedDay] = useState(new Date());

  const selectedDate = format(selectedDay, "yyyy-MM-dd");
  const isToday = isSameDay(selectedDay, new Date());

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchStudents(id);
        fetchAcademyAttendance(id, selectedDate);
      }
    }, [id, fetchStudents, fetchAcademyAttendance, selectedDate])
  );

  const students = useMemo(
    () => allStudents.filter((s) => s.academyId === id && s.status !== 'pending'),
    [allStudents, id]
  );

  if (!id) return null;

  const handleMarkAttendance = (studentId: string, present: boolean) => {
    markAttendance(studentId, selectedDate, present).catch(() => {});
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-gray-300 mt-2">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b bg-slate-900 h-16">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1">
            Attendance
          </Text>
          {isLoading && <ActivityIndicator color="white" size="small" />}
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
            <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50">
              <TouchableOpacity onPress={() => setSelectedDay((d) => subDays(d, 1))} className="p-2">
                <Ionicons name="chevron-back" size={22} color="#334155" />
              </TouchableOpacity>

              <View className="items-center">
                <Text className="font-semibold text-slate-900">
                  {format(selectedDay, "EEEE, MMM d")}
                </Text>
                {!isToday && (
                  <TouchableOpacity onPress={() => setSelectedDay(new Date())}>
                    <Text className="text-xs text-blue-600 font-medium mt-0.5">Jump to Today</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() => setSelectedDay((d) => addDays(d, 1))}
                disabled={isToday}
                className="p-2"
              >
                <Ionicons name="chevron-forward" size={22} color={isToday ? "#cbd5e1" : "#334155"} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={students}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ maxWidth: isTablet ? 768 : undefined, width: '100%', alignSelf: 'center' }}
              renderItem={({ item, index }) => (
                <FadeInView delay={Math.min(index, 8) * 50}>
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
                </FadeInView>
              )}
            />
          </>
        ) : (
          <ScrollView className="p-4" contentContainerStyle={isTablet ? { maxWidth: 768, width: '100%', alignSelf: 'center' } : undefined}>
            {students.map((s, index) => (
              <FadeInView key={s.id} delay={Math.min(index, 8) * 50}>
                <AnimatedPressable
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
                </AnimatedPressable>
              </FadeInView>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
