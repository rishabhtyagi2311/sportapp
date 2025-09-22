// app/(football)/teams/create.tsx
import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function CreateTeamForm() {
  const [formData, setFormData] = useState({
    teamName: "",
    maxPlayers: "",
    city: "",
  });

  const validateForm = () => {
    if (!formData.teamName.trim()) {
      Alert.alert("Error", "Please enter a team name");
      return false;
    }
    if (!formData.maxPlayers.trim()) {
      Alert.alert("Error", "Please enter maximum number of players");
      return false;
    }
    if (isNaN(Number(formData.maxPlayers)) || Number(formData.maxPlayers) < 1) {
      Alert.alert("Error", "Maximum players must be a valid number greater than 0");
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert("Error", "Please enter the city");
      return false;
    }
    return true;
  };

  const handleAddMembers = () => {
    if (!validateForm()) return;
    
    console.log("Team data:", formData);
    // TODO: Save team data to store
    
    // Navigate to add members page
    Alert.alert("Success", "Team created! Now add members.", [
      {
        text: "OK",
        onPress: () => {
          // TODO: Navigate to add members screen
          // router.push('/(football)/teams/add-members');
            router.push("./addTeamMembers")
        }
      }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="w-full h-full bg-slate-900">
        {/* Header */}
        <View className="px-6 py-4 border-b border-white flex-row items-center mt-4">
          <TouchableOpacity
            className="mr-4"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            Create New Team
          </Text>
        </View>

        {/* Form */}
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === "ios" ? 20 : 50}
        >
          {/* Team Name */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Team Name *
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="shield-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="Enter team name"
                placeholderTextColor="#6b7280"
                value={formData.teamName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, teamName: text }))
                }
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Maximum Players */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Maximum Players *
            </Text>
            <Text className="text-gray-400 text-sm mb-3">
              Set the maximum number of players allowed in your team
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="people-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="e.g., 11, 15, 20"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                value={formData.maxPlayers}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, maxPlayers: text }))
                }
              />
            </View>
          </View>

          {/* City */}
          <View className="mb-8">
            <Text className="text-white font-semibold mb-2 text-base">
              City *
            </Text>
            <Text className="text-gray-400 text-sm mb-3">
              The city where your team is based
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="location-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="Enter city name"
                placeholderTextColor="#6b7280"
                value={formData.city}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, city: text }))
                }
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Team Info Card */}
          <View className="bg-sky-100/20 rounded-xl p-4 border border-sky-100/30 mb-8">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle-outline" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Info</Text>
            </View>
            <Text className="text-gray-300 text-sm leading-5">
              After creating your team, you'll be able to add players, assign positions, 
              and manage team details. You can always modify these settings later.
            </Text>
          </View>
        </KeyboardAwareScrollView>

        {/* Add Members Button */}
        <View className="px-6 pb-6 pt-4">
          <TouchableOpacity
            onPress={handleAddMembers}
            className="bg-white rounded-xl py-4 shadow-lg"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-black font-bold text-lg mr-6">
                Add Team Members
              </Text>
              <Ionicons name="person-add-outline" size={24} color="black" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}