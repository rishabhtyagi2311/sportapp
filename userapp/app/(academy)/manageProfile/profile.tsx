// app/(academy)/profile.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useParentStore } from "@/store/parentAcademyProfile";

export default function ProfileScreen() {
  const router = useRouter();
  const parentProfile = useParentStore((state) => state.parentProfile);

  const navigateToForm = (isEditing: boolean = false) => {
    if (isEditing && parentProfile) {
      router.push({
        pathname: "/(academy)/createProfile",
        params: {
          isEditing: "true",
          fatherName: parentProfile.fatherName,
          motherName: parentProfile.motherName,
          childName: parentProfile.childName,
          childAge: parentProfile.childAge,
          address: parentProfile.address,
          city: parentProfile.city,
        },
      });
    } else {
      router.push("/(academy)/createProfile");
    }
  };

  const renderProfileCard = () => {
    if (!parentProfile) return null;

    return (
      <View className="mx-4 mt-4 bg-slate-800 rounded-2xl p-5 border border-slate-700">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View className="bg-white/10 rounded-full p-2 mr-3">
              <Ionicons name="people" size={20} color="#fff" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">Family Profile</Text>
              <Text className="text-slate-400 text-xs">Primary Account</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigateToForm(true)}
            className="bg-white/10 rounded-full p-2"
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Details */}
        <View className="space-y-3">
          <View className="flex-row items-start py-2">
            <Ionicons name="man" size={16} color="#94a3b8" style={{ marginTop: 2 }} />
            <View className="ml-3 flex-1">
              <Text className="text-slate-400 text-xs">Father</Text>
              <Text className="text-white font-semibold">{parentProfile.fatherName}</Text>
            </View>
          </View>

          <View className="flex-row items-start py-2">
            <Ionicons name="woman" size={16} color="#94a3b8" style={{ marginTop: 2 }} />
            <View className="ml-3 flex-1">
              <Text className="text-slate-400 text-xs">Mother</Text>
              <Text className="text-white font-semibold">{parentProfile.motherName}</Text>
            </View>
          </View>

          <View className="flex-row items-start py-2">
            <Ionicons name="person" size={16} color="#94a3b8" style={{ marginTop: 2 }} />
            <View className="ml-3 flex-1">
              <Text className="text-slate-400 text-xs">Child</Text>
              <Text className="text-white font-semibold">
                {parentProfile.childName}, {parentProfile.childAge} years
              </Text>
            </View>
          </View>

          <View className="flex-row items-start py-2">
            <Ionicons name="location" size={16} color="#94a3b8" style={{ marginTop: 2 }} />
            <View className="ml-3 flex-1">
              <Text className="text-slate-400 text-xs">Location</Text>
              <Text className="text-white font-semibold">{parentProfile.city}</Text>
              <Text className="text-slate-400 text-sm mt-1">{parentProfile.address}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-900">
      <ScrollView className="flex-1">
        {parentProfile ? (
          renderProfileCard()
        ) : (
          <View className="flex-1 items-center justify-center px-6" style={{ minHeight: 500 }}>
            <Ionicons name="person-add-outline" size={60} color="#94a3b8" />
            <Text className="text-white text-2xl font-bold mt-6 text-center">
              No Profile Yet
            </Text>
            <Text className="text-slate-400 text-center mt-2 px-4">
              Create your parent profile to manage academy enrollments
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => navigateToForm(false)}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#ffffff",
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#0f172a" />
      </TouchableOpacity>
    </View>
  );
}