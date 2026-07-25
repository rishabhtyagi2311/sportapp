import React, { useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";

export default function CoachesScreen() {
  const { id } = useLocalSearchParams();
  const academyId = id as string;

  const { getAcademyById, fetchAcademyById, isLoading } = useAcademyStore();
  const academy = getAcademyById(academyId);

  useEffect(() => {
    fetchAcademyById(academyId);
  }, [academyId]);

  if (!academy) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        {isLoading && <ActivityIndicator size="large" color="#0f172a" />}
      </View>
    );
  }

  const coaches = academy.coaches?.length
    ? academy.coaches
    : [{ id: "head", name: academy.coachName, specialization: `${academy.sportType} Head Coach`, experience: "", contact: academy.contactNumber }];

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <Text className="text-slate-900 text-2xl font-bold mb-6">Our Coaching Team</Text>

      {coaches.map((coach) => (
        <View
          key={coach.id}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6"
        >
          <View className="flex-row items-start">
            <View className="w-12 h-12 bg-slate-900 rounded-2xl items-center justify-center mr-5">
              <Ionicons name="person" size={30} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 text-xl font-bold mb-2">
                {coach.name}
              </Text>
              <View className="flex-row items-center mb-2">
                <Ionicons name="medal-outline" size={16} color="#4f46e5" />
                <Text className="text-gray-600 text-base ml-2 font-medium">
                  {coach.specialization}
                </Text>
              </View>
              {!!coach.experience && (
                <View className="flex-row items-center mb-3">
                  <Ionicons name="time-outline" size={16} color="#10b981" />
                  <Text className="text-green-600 text-sm ml-2 font-semibold">
                    {coach.experience} experience
                  </Text>
                </View>
              )}
              {!!coach.contact && (
                <View className="flex-row items-center">
                  <Ionicons name="call-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-700 text-sm ml-2">{coach.contact}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}