import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PhotosScreen() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center p-8">
      <View className="bg-white rounded-3xl p-10 items-center shadow-xl border border-gray-100 w-full max-w-sm">
        <View className="bg-slate-900 rounded-3xl p-8 mb-6">
          <Ionicons name="images-outline" size={64} color="white" />
        </View>
        <Text className="text-slate-900 text-xl font-bold mb-4 text-center">
          No Photos Available
        </Text>
        <Text className="text-gray-500 text-center text-base leading-7 px-2">
          The academy owner hasn't uploaded any photos yet. Check back later for academy images and facility tours!
        </Text>
        
        {/* Placeholder for future photos */}
        <View className="mt-6 flex-row space-x-2">
          <View className="w-4 h-4 bg-gray-200 rounded-full"></View>
          <View className="w-4 h-4 bg-gray-200 rounded-full"></View>
          <View className="w-4 h-4 bg-gray-200 rounded-full"></View>
        </View>
      </View>
    </View>
  );
}