// app/(academy)/enrolledAcademies.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usechildStore } from "@/store/academyChildProfile";
import { useEnrollmentStore } from "@/store/academyEnrollmentStore";
import { useAcademyStore } from "@/store/academyStore";

export default function EnrolledAcademiesScreen() {
  const router = useRouter();
  const childProfiles = usechildStore((state) => state.childProfiles);
  const enrollments = useEnrollmentStore((state) => state.enrollments);
  const getAcademyById = useAcademyStore((state) => state.getAcademyById);

  // Get unique academies from all enrollments
  const uniqueAcademyIds = [...new Set(enrollments.map(e => e.academyId))];

  // Empty state
  if (childProfiles.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="school-outline" size={80} color="#e2e8f0" />
        <Text className="text-slate-900 text-2xl font-bold text-center mt-4">
          No Child Profiles
        </Text>
        <Text className="text-slate-500 text-center mt-2">
          Create a child profile to start enrolling in academies
        </Text>
      </View>
    );
  }

  if (uniqueAcademyIds.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="albums-outline" size={80} color="#e2e8f0" />
        <Text className="text-slate-900 text-2xl font-bold text-center mt-4">
          No Enrollments Yet
        </Text>
        <Text className="text-slate-500 text-center mt-2">
          Browse and enroll in academies to see them here
        </Text>
      </View>
    );
  }

  const handleAcademyPress = (academyId: string) => {
    // Get all children enrolled in this academy
    const enrolledChildren = enrollments
      .filter(e => e.academyId === academyId)
      .map(e => e.childId);

    router.push({
      pathname: "/(academy)/enrollmentDetails",
      params: {
        academyId: academyId,
        enrolledChildrenIds: JSON.stringify(enrolledChildren),
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 bg-white border-b border-gray-100">
        <Text className="text-slate-900 text-2xl font-bold">
          My Academies
        </Text>
        <Text className="text-slate-500 text-sm mt-1">
          {uniqueAcademyIds.length} {uniqueAcademyIds.length === 1 ? 'academy' : 'academies'} enrolled
        </Text>
      </View>

      {/* Academy List */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {uniqueAcademyIds.map((academyId) => {
          const academy = getAcademyById(academyId);
          if (!academy) return null;

          // Get enrolled children for this academy
          const enrolledInThisAcademy = enrollments.filter(e => e.academyId === academyId);
          const enrolledChildrenCount = enrolledInThisAcademy.length;

          return (
            <TouchableOpacity
              key={academyId}
              onPress={() => handleAcademyPress(academyId)}
              activeOpacity={0.7}
              className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-200"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {/* Card Header */}
              <View className="bg-slate-900 px-5 py-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-white text-lg font-bold mb-2">
                      {academy.academyName}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="bg-white/20 px-3 py-1 rounded-lg">
                        <Text className="text-white text-xs font-semibold">
                          {academy.sportType}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward-circle" size={28} color="rgba(255,255,255,0.7)" />
                </View>
              </View>

              {/* Card Body */}
              <View className="px-5 py-4">
                {/* Enrolled Children Badge */}
                <View className="bg-blue-50 px-3 py-2 rounded-xl mb-4 self-start">
                  <View className="flex-row items-center">
                    <Ionicons name="people" size={16} color="#3b82f6" />
                    <Text className="text-blue-600 text-sm font-semibold ml-2">
                      {enrolledChildrenCount} {enrolledChildrenCount === 1 ? 'child' : 'children'} enrolled
                    </Text>
                  </View>
                </View>

                {/* Academy Info Grid */}
                <View className="space-y-3">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="person" size={20} color="#a855f7" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-500 text-xs">Coach</Text>
                      <Text className="text-slate-900 font-semibold text-base">
                        {academy.coachName}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="location" size={20} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-500 text-xs">Location</Text>
                      <Text className="text-slate-900 font-semibold text-base">
                        {academy.city}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="call" size={20} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-500 text-xs">Contact</Text>
                      <Text className="text-slate-900 font-semibold text-base">
                        {academy.contactNumber}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Card Footer */}
              <View className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-500 text-xs">
                    Tap to view attendance & details
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#94a3b8" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Bottom Spacing */}
        <View className="h-4" />
      </ScrollView>
    </View>
  );
}