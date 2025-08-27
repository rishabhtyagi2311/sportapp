import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";

export default function CoachesScreen() {
  const { id } = useLocalSearchParams();
  
  
  const { getAcademyById } = useAcademyStore();
  const academy = getAcademyById(id as string);

  if (!academy) return null;

  const mockCoaches = [
    {
      name: academy.coachName,
      specialization: `${academy.sportType} Head Coach`,
      experience: "5+ years",
      description: "Certified professional coach with extensive experience in competitive training.",
    },
    {
      name: "Assistant Coach",
      specialization: `${academy.sportType} Training Specialist`,
      experience: "3+ years",
      description: "Focuses on youth development and fundamental skill building.",
    },
    {
      name: "Fitness Trainer",
      specialization: "Physical Conditioning",
      experience: "4+ years",
      description: "Specialized in sports-specific fitness and injury prevention.",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <Text className="text-slate-900 text-2xl font-bold mb-6">Our Coaching Team</Text>
      
      {mockCoaches.map((coach, index) => (
        <View
          key={index}
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
              <View className="flex-row items-center mb-3">
                <Ionicons name="time-outline" size={16} color="#10b981" />
                <Text className="text-green-600 text-sm ml-2 font-semibold">
                  {coach.experience} experience
                </Text>
              </View>
              <Text className="text-gray-700 leading-6 text-sm">
                {coach.description}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}