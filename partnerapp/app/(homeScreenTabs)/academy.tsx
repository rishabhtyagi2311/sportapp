import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// ✅ Move helper function OUTSIDE component to avoid re-creation
const renderActionButton = (
  icon: keyof typeof Ionicons.glyphMap,
  label: string,
  action: string,
  onPress: (action: string) => void
) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => onPress(action)}
    style={{
      width: width * 0.25,
      height: width * 0.25,
      backgroundColor: "#334155",
      borderRadius: 20,
      shadowColor: "#000",
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 6,
    }}
  >
    <View className="flex-1 items-center justify-center p-3">
      <View className="bg-white/10 rounded-full p-2 mb-2">
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <Text
        className="text-white font-semibold text-center text-sm"
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function AcademyMainScreen() {
  // ✅ All hooks at the top (no hooks used here, but if needed, put them here)

  const handlePress = (action: string): void => {
    console.log(`${action} pressed`);
    if (action === "Register") {
      router.navigate("./../(academy)/registerAcademy");
    } else if (action === "Manage") {
      router.navigate("./../manageAcademy");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Content Area */}
      <View className="flex-1 bg-slate-900">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold text-center mb-2">
              Academy Connect
            </Text>
            <Text className="text-slate-300 text-center text-base leading-5 px-2">
              Empowering sports academies with discovery and management
            </Text>
          </View>

          {/* Stats Section */}
          <View className="flex-row justify-between mb-14 px-2">
            <View className="items-center">
              <Text className="text-blue-400 text-xl font-bold">1,200+</Text>
              <Text className="text-slate-400 text-xs">Academies</Text>
            </View>
            <View className="items-center">
              <Text className="text-green-400 text-xl font-bold">50K+</Text>
              <Text className="text-slate-400 text-xs">Students</Text>
            </View>
            <View className="items-center">
              <Text className="text-purple-400 text-xl font-bold">98%</Text>
              <Text className="text-slate-400 text-xs">Success Rate</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="items-center mb-4 mt-8">
            <View className="flex-row justify-center mb-8">
              <View className="items-center mx-6">
                {renderActionButton(
                  "compass-outline",
                  "Register Academy",
                  "Register",
                  handlePress
                )}
              </View>

              <View className="items-center mx-6">
                {renderActionButton(
                  "trophy-outline",
                  "Manage Academy",
                  "Manage",
                  handlePress
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}