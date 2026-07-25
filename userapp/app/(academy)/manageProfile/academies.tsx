import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { usechildStore } from "@/store/academyChildProfile";
import { useEnrollmentStore } from "@/store/academyEnrollmentStore";
import { useAcademyStore } from "@/store/academyStore";

export default function ChildAcademiesScreen() {
  const router = useRouter();
  const { childId, childName } = useLocalSearchParams<{
    childId: string;
    childName: string;
  }>();

  const childProfiles = usechildStore((state) => state.childProfiles);
  const { getEnrollmentsByChild, fetchMyEnrollments } = useEnrollmentStore();
  const { getAcademyById, fetchAcademies } = useAcademyStore();

  useEffect(() => {
    fetchMyEnrollments(childId);
    fetchAcademies();
  }, [childId]);

  const childProfile = childProfiles.find((profile) => profile.id === childId);
  const resolvedChildName = childProfile?.childName || childName || "Child";
  // Withdrawn/rejected enrollments don't clutter the visible list.
  const childEnrollments = getEnrollmentsByChild(childId).filter((e) => e.status !== 'inactive');

  const handleBackPress = () => router.navigate("/(homeScreenTabs)/academy");

  const handleAcademyPress = (studentId: string, academyId: string, academyName: string, status: string) => {
    router.push({
      pathname: "/(academy)/manageProfile/academyDashboard",
      params: { childId, studentId, academyId, academyName, status },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Sleek Header */}
      <View className="px-6 py-6 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={handleBackPress} 
          className="h-12 w-12 bg-white rounded-2xl items-center justify-center shadow-sm border border-slate-100"
        >
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View className="items-end">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Enrolled In</Text>
          <Text className="text-slate-900 font-black text-xl">{childEnrollments.length} {childEnrollments.length === 1 ? 'Academy' : 'Academies'}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
      

        {childEnrollments.map((enrollment) => {
          const academy = getAcademyById(enrollment.academyId);
          if (!academy) return null;
          return (
            <TouchableOpacity
              key={enrollment.id}
              onPress={() => handleAcademyPress(enrollment.id, enrollment.academyId, academy.academyName, enrollment.status)}
              activeOpacity={0.95}
              className="mb-6"
            >
              <View className="bg-white rounded-[28px] flex-row overflow-hidden shadow-md shadow-slate-200 border border-slate-100">
                {/* Left Accent Bar - Uses a sport-themed color */}
                <View className={`w-3 ${enrollment.status === 'pending' ? 'bg-amber-400' : 'bg-slate-900'}`} />

                <View className="flex-1 p-5">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-slate-900 font-bold text-xs uppercase tracking-tighter mb-1">
                        {academy.sportType} Academy
                      </Text>
                      <Text className="text-slate-900 text-2xl font-black mb-4 leading-7">
                        {academy.academyName}
                      </Text>
                      {enrollment.status === 'pending' && (
                        <View className="bg-amber-50 self-start px-3 py-1 rounded-full mb-2 -mt-2">
                          <Text className="text-amber-700 text-[10px] font-bold uppercase">Awaiting Approval</Text>
                        </View>
                      )}
                    </View>
                    <View className="bg-slate-50 p-2 rounded-xl">
                      <Ionicons name="rocket-sharp" size={20} color="#6366f1" />
                    </View>
                  </View>

                  {/* Info Grid */}
                  <View className="flex-row items-center justify-between border-t border-slate-50 pt-4">
                    <View className="flex-row items-center">
                      <View className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center">
                        <Ionicons name="medal" size={14} color="#475569" />
                      </View>
                      <View className="ml-2">
                        <Text className="text-slate-400 text-[10px] font-bold uppercase">Head Coach</Text>
                        <Text className="text-slate-700 font-bold text-sm">{academy.coachName}</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <View className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center">
                        <Ionicons name="location" size={14} color="#475569" />
                      </View>
                      <View className="ml-2">
                        <Text className="text-slate-400 text-[10px] font-bold uppercase">Location</Text>
                        <Text className="text-slate-700 font-bold text-sm">{academy.city}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Decorative "Ticket" Cutouts for a more 'Proper' UI feel */}
              <View className="absolute left-[3px] top-1/2 -translate-y-1/2 h-6 w-3 bg-slate-50 rounded-r-full" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}