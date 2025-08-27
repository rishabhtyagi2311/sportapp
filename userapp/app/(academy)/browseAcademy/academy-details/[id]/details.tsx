import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const { getAcademyById } = useAcademyStore();
  const academy = getAcademyById(id as string);

  if (!academy) return null;

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <Text className="text-slate-900 text-2xl font-bold mb-6">Academy Information</Text>
      
      <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
        <View className="flex-row items-center mb-5">
          <View className="bg-slate-900 rounded-xl p-3 mr-4">
            <Ionicons name="information-circle-outline" size={24} color="white" />
          </View>
          <Text className="text-slate-900 font-bold text-xl">Basic Details</Text>
        </View>
        
        <View className="space-y-1">
          <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
            <Text className="text-gray-600 font-medium text-base">Sport Type</Text>
            <View className="bg-slate-900 px-3 py-1 rounded-lg">
              <Text className="text-white font-bold text-sm">{academy.sportType}</Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
            <Text className="text-gray-600 font-medium text-base">Head Coach</Text>
            <Text className="text-slate-900 font-bold text-base">{academy.coachName}</Text>
          </View>
          <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
            <Text className="text-gray-600 font-medium text-base">Fee Structure</Text>
            <Text className="text-slate-900 font-bold text-base capitalize">{academy.feeStructure}</Text>
          </View>
          <View className="flex-row justify-between items-center py-4">
            <Text className="text-gray-600 font-medium text-base">Contact</Text>
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={16} color="#6b7280" />
              <Text className="text-slate-900 font-bold text-base ml-2">{academy.contactNumber}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <View className="flex-row items-center mb-5">
          <View className="bg-green-500 rounded-xl p-3 mr-4">
            <Ionicons name="checkmark-circle-outline" size={24} color="white" />
          </View>
          <Text className="text-slate-900 font-bold text-xl">Facilities & Amenities</Text>
        </View>
        <Text className="text-gray-700 leading-7 text-base">{academy.facilities}</Text>
      </View>
    </ScrollView>
  );
}