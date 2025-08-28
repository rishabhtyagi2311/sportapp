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
import { dummyStudents } from "@/constants/dummyData";
export default function AttendanceScreen() {
    const { id } = useLocalSearchParams();
    const { markAttendance, getAttendanceStatus } = useAcademyStore();

    const [selectedTab, setSelectedTab] = useState<"mark" | "history">("mark");
    const selectedDate = new Date().toISOString().split("T")[0];

    const students = dummyStudents.filter((s) => s.academyId === id);

    const handleMarkAttendance = (studentId: string, present: boolean) => {
        markAttendance(studentId, selectedDate, present);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
           <View className = "w-full h-full bg-gray-300 mt-2">
             {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b bg-slate-900 ">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <Ionicons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-white">Attendance</Text>
            </View>

            {/* Tabs */}
            <View className="flex-row justify-around border-b border-gray-300 bg-gray-100">
                <TouchableOpacity
                    onPress={() => setSelectedTab("mark")}
                    className={`flex-1 p-3 items-center ${selectedTab === "mark" ? "bg-white border-b-2 border-green-500" : ""
                        }`}
                >
                    <Text
                        className={`font-semibold ${selectedTab === "mark" ? "text-green-600" : "text-slate-700"
                            }`}
                    >
                        Mark Attendance
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setSelectedTab("history")}
                    className={`flex-1 p-3 items-center ${selectedTab === "history"
                            ? "bg-white border-b-2 border-green-500"
                            : ""
                        }`}
                >
                    <Text
                        className={`font-semibold ${selectedTab === "history" ? "text-green-600" : "text-slate-700"
                            }`}
                    >
                        View Attendance
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {selectedTab === "mark" ? (
                <>
                    {/* Show today's date */}
                    <View className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex flex-row justify-center">
                        <Text className="text-base font-semibold text-slate-900 ">
                            Date: {selectedDate}
                        </Text>
                    </View>

                    <FlatList
                        className="p-4"
                        data={students}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <AttendanceCard
                                student={item}
                                attendanceStatus={getAttendanceStatus(item.id, selectedDate)}
                                onMarkAttendance={(present) =>
                                    handleMarkAttendance(item.id, present)
                                }
                            />
                        )}
                    />
                </>
            ) : (
                <ScrollView className="p-4">
                   <View className="flex flex-row justify-center">
                     <Text className="text-lg font-bold text-slate-900 mb-4">
                        Select a student
                    </Text>
                   </View>
                    {students.map((s) => (
                        <TouchableOpacity
                            key={s.id}
                            className="bg-white rounded-xl border border-gray-300 p-4 mb-3 shadow-sm"
                            onPress={() =>
                                router.push({
                                    pathname: "/manageAcademy/[id]/studentAttendance",
                                    params: { studentId: s.id },
                                })
                            }
                        >
                            <Text className="text-lg font-bold text-slate-900">{s.name}</Text>
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
