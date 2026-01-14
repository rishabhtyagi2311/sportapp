import React from "react";
import {
  
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// Helper function remains exactly the same
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
  
  const academyLogo = null; 
  const fallbackImage = require("@/assets/images/academyPartnerBanner.png"); 

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
          {/* Top Image Section */}
          <View className="w-full h-90 mb-8 rounded-2xl overflow-hidden bg-slate-800 shadow-lg">
             <Image 
                source={academyLogo ? { uri: academyLogo } : fallbackImage}
                className="w-full h-full"
                resizeMode="cover"
             />
             <View className="absolute inset-0 bg-black/20" />
          </View>

          {/* Header Section */}
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold text-center mb-2">
              Welcome to your Academy Center 
            </Text>
          </View>

          {/* Stats Section */}
          <View className="flex-row justify-between px-2">
            <View className="items-center">
              <Text className="text-blue-400 text-xl font-bold">12</Text>
              <Text className="text-slate-400 text-xs">Academies</Text>
            </View>
            <View className="items-center">
              <Text className="text-green-400 text-xl font-bold">501</Text>
              <Text className="text-slate-400 text-xs">Students</Text>
            </View>
            <View className="items-center">
              <Text className="text-purple-400 text-xl font-bold">4.1</Text>
              <Text className="text-slate-400 text-xs">Avg Review</Text>
            </View>
          </View>

          {/* Action Buttons Grid */}
          <View className="items-center mb-4 mt-24">
            {/* UPDATED LAYOUT: 
                Changed to flex-wrap with gap-y-8 to handle multiple rows gracefully. 
                Using margin-horizontal (mx-4) to space items.
            */}
            <View className="flex-row  justify-center gap-y-8 w-full">
              
              {/* Button 1: Register */}
              <View className="items-center mx-4">
                {renderActionButton(
                  "compass-outline",
                  "Register Academy",
                  "Register",
                  handlePress
                )}
              </View>

              {/* Button 2: Manage */}
              <View className="items-center mx-4">
                {renderActionButton(
                  "trophy-outline",
                  "Manage Academy",
                  "Manage",
                  handlePress
                )}
              </View>

              {/* Button 3: Announcements (NEW) */}
              <View className="items-center mx-4">
                {renderActionButton(
                  "megaphone-outline", 
                  "Info- Channel ",
                  "Announcements",
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