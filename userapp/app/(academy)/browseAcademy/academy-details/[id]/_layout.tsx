import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";

const TopTabs = createMaterialTopTabNavigator();
export const Tabs = withLayoutContext(TopTabs.Navigator);

export default function AcademyTabsLayout() {
  const { id } = useLocalSearchParams();
  console.log("Academy ID in layout:", id);

  const { getAcademyById } = useAcademyStore();
  const academy = getAcademyById(id as string);

  if (!academy) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Academy not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Cover Section */}
      <View className="relative">
        <View className="w-full h-64 bg-gray-200 items-center justify-center">
          <Ionicons name="image-outline" size={48} color="black" />
          <Text className="text-black">No Cover Photo</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-4 bg-black/50 rounded-full p-2"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Academy Info */}
      <View className="p-4 bg-slate-900">
        <Text className="text-white text-2xl font-bold">
          {academy.academyName}
        </Text>
        <Text className="text-gray-300">
          {academy.address}, {academy.city}
        </Text>
        <Text className="text-white mt-2">
          ₹{academy.monthlyFee}/{academy.feeStructure}
        </Text>
      </View>

      {/* Material Top Tabs */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#111827",
          tabBarInactiveTintColor: "#6b7280",
          tabBarLabelStyle: { fontWeight: "600", textTransform: "none" },
          tabBarStyle: { pointerEvents: 'none',backgroundColor: "white" },
          tabBarIndicatorStyle: { backgroundColor: "#111827", height: 3 },
        }}
      >
        <Tabs.Screen
          name="details"
          options={{ title: "Details" }}
          initialParams={{ id }}
        />
        <Tabs.Screen
          name="coaches"
          options={{ title: "Coaches" }}
          initialParams={{ id }}
        />
        <Tabs.Screen
          name="photos"
          options={{ title: "Photos" }}
          initialParams={{ id }}
        />
        <Tabs.Screen
          name="reviews"
          options={{ title: "Reviews" }}
          initialParams={{ id }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
