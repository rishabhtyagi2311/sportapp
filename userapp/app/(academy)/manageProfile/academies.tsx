import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { usechildStore } from "@/store/academyChildProfile";
import { useEnrollmentStore } from "@/store/academyEnrollmentStore";
import { useAcademyStore } from "@/store/academyStore";

export default function ChildAcademiesScreen() {
  const router = useRouter();
  const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>();
  
  // Get store methods
  const childProfiles = usechildStore((state) => state.childProfiles);
  const getEnrollmentsByChild = useEnrollmentStore((state) => state.getEnrollmentsByChild);
  const getAcademyById = useAcademyStore((state) => state.getAcademyById);

  // Find the child profile from the store
  const childProfile = childProfiles.find(profile => profile.id === childId);

  // Get enrollments for this specific child using the store method
  const childEnrollments = getEnrollmentsByChild(childId);
  
  // Get unique academies for this child
  const childAcademyIds = [...new Set(childEnrollments.map(e => e.academyId))];

  const handleBackPress = () => {
    router.back();
  };

  const handleAcademyPress = (academyId: string, academyName: string) => {
    router.push({
      pathname: "/(academy)/manageProfile/childAttendance",
      params: {
        childId,
        academyId,
        academyName
      },
    });
  };

  // Empty state - no enrollments
  if (childAcademyIds.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        
        {/* Header Section */}
        <View className="bg-slate-900 shadow-lg">
          <View className="flex-row items-center px-4 py-3 border-b border-slate-800">
            {/* Back Button */}
            <TouchableOpacity
              onPress={handleBackPress}
              className="mr-3 p-2 rounded-lg"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            {/* Header Title */}
            <View className="flex-1">
              <Text className="text-white font-bold text-lg" numberOfLines={1}>
                {childName}'s Academies
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                View enrolled academies
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-1 bg-white items-center justify-center px-6">
          <Ionicons name="school-outline" size={80} color="#e2e8f0" />
          <Text className="text-slate-900 text-2xl font-bold text-center mt-4">
            No Enrollments Yet
          </Text>
          <Text className="text-slate-500 text-center mt-2">
            {childName} is not enrolled in any academies
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(academy)/browseAcademies")}
            className="mt-6 bg-blue-500 py-3 px-6 rounded-xl"
          >
            <Text className="text-white font-semibold text-base">Browse Academies</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header Section */}
      <View className="bg-slate-900 shadow-lg">
        <View className="flex-row items-center px-4 py-3 border-b border-slate-800">
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBackPress}
            className="mr-3 p-2 rounded-lg"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Header Title */}
          <View className="flex-1">
            <Text className="text-white font-bold text-lg" numberOfLines={1}>
              {childName}'s Academies
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {childAcademyIds.length} {childAcademyIds.length === 1 ? 'academy' : 'academies'} enrolled
            </Text>
          </View>
        </View>
      </View>

      {/* Academy List */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {childAcademyIds.map((academyId) => {
          const academy = getAcademyById(academyId);
          if (!academy) return null;

          return (
            <TouchableOpacity
              key={academyId}
              onPress={() => handleAcademyPress(academyId, academy.academyName)}
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
                    Tap to view attendance
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
    </SafeAreaView>
  );
}