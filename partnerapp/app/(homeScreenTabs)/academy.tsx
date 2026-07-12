import React, { useCallback } from "react";
import {

  View,
  Text,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";
import AnimatedPressable from "@/components/animated/AnimatedPressable";

// Helper function remains exactly the same
const renderActionButton = (
  icon: keyof typeof Ionicons.glyphMap,
  label: string,
  action: string,
  onPress: (action: string) => void,
  size: number,
  delay: number
) => (
  <FadeInView delay={delay}>
    <AnimatedPressable
      onPress={() => onPress(action)}
      style={{
        width: size,
        height: size,
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
    </AnimatedPressable>
  </FadeInView>
);

export default function AcademyMainScreen() {

  const academyLogo = null;
  const fallbackImage = require("@/assets/images/academyPartnerBanner.png");
  const { width, isTablet } = useResponsive();
  // Cap the action-button size so it doesn't balloon on tablets.
  const buttonSize = Math.min(width * 0.25, 110);

  const academies = useAcademyStore((state) => state.academies);
  const fetchMyAcademies = useAcademyStore((state) => state.fetchMyAcademies);

  useFocusEffect(
    useCallback(() => {
      fetchMyAcademies();
    }, [fetchMyAcademies])
  );

  const totalAcademies = academies.length;
  const totalStudents = academies.reduce((sum, a) => sum + (a.studentCount || 0), 0);
  const activeAcademies = academies.filter((a) => a.isActive !== false).length;

  const handlePress = (action: string): void => {
    console.log(`${action} pressed`);
    if (action === "Register") {
      router.navigate("./../(academy)/registerAcademy");
    } else if (action === "Manage") {
      router.navigate("./../manageAcademy");
    } else if (action === "Announcements") {
      router.navigate("./../(academy)/announcements");
      console.log("Navigate to Announcements Feed");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-slate-900">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className={isTablet ? "self-center w-full max-w-2xl" : "w-full"}>
          {/* Top Image Section */}
          <FadeInView direction="none" className="w-full h-90 mb-8 rounded-2xl overflow-hidden bg-slate-800 shadow-lg">
             <Image
                source={academyLogo ? { uri: academyLogo } : fallbackImage}
                className="w-full h-full"
                resizeMode="cover"
             />
             <View className="absolute inset-0 bg-black/20" />
          </FadeInView>

          {/* Header Section */}
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold text-center mb-2">
              Welcome to your Academy Center
            </Text>
          </View>

          {/* Stats Section */}
          <FadeInView delay={80} className="flex-row justify-between px-2">
            <View className="items-center">
              <Text className="text-blue-400 text-xl font-bold">{totalAcademies}</Text>
              <Text className="text-slate-400 text-xs">Academies</Text>
            </View>
            <View className="items-center">
              <Text className="text-green-400 text-xl font-bold">{totalStudents}</Text>
              <Text className="text-slate-400 text-xs">Students</Text>
            </View>
            <View className="items-center">
              <Text className="text-purple-400 text-xl font-bold">{activeAcademies}</Text>
              <Text className="text-slate-400 text-xs">Active</Text>
            </View>
          </FadeInView>

          {/* Action Buttons Grid */}
          <View className="items-center mb-4 mt-24">
            <View className="flex-row justify-center gap-y-8 w-full">

              {/* Button 1: Register */}
              <View className="items-center mx-4">
                {renderActionButton(
                  "compass-outline",
                  "Register Academy",
                  "Register",
                  handlePress,
                  buttonSize,
                  140
                )}
              </View>

              {/* Button 2: Manage */}
              <View className="items-center mx-4">
                {renderActionButton(
                  "trophy-outline",
                  "Manage Academy",
                  "Manage",
                  handlePress,
                  buttonSize,
                  190
                )}
              </View>

              {/* Button 3: Announcements (NEW) */}
              <View className="items-center mx-4">
                {renderActionButton(
                  "megaphone-outline",
                  "Info- Channel ",
                  "Announcements",
                  handlePress,
                  buttonSize,
                  240
                )}
              </View>

            </View>
          </View>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}