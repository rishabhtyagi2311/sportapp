// app/(academy)/profile.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usechildStore } from "@/store/academyChildProfile";

export default function ProfileScreen() {
  const router = useRouter();
  const childProfiles = usechildStore((state) => state.childProfiles);
  const deleteChildProfile = usechildStore((state) => state.deleteChildProfile);

  const navigateToForm = useMemo(() => {
    return (isEditing: boolean = false, profile?: any) => {
      if (isEditing && profile) {
        router.push({
          pathname: "/(academy)/registerChildProfile",
          params: {
            isEditing: "true",
            profileId: profile.id,
            fatherName: profile.fatherName,
            motherName: profile.motherName,
            childName: profile.childName,
            childAge: profile.childAge,
            address: profile.address,
            city: profile.city,
          },
        });
      } else {
        router.push("/(academy)/registerChildProfile");
      }
    };
  }, [router]);

  const handleDelete = (id: string, childName: string) => {
    Alert.alert(
      "Delete Profile",
      `Are you sure you want to delete ${childName}'s profile?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteChildProfile(id),
        },
      ]
    );
  };

  const renderProfileCard = (profile: any) => {
    return (
      <View 
        key={profile.id}
        className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-lg" 
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Child Name Header with Action Buttons */}
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-slate-900 font-bold text-2xl">
              {profile.childName}
            </Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => navigateToForm(true, profile)}
              className="bg-blue-500 rounded-full p-2.5 mr-2"
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(profile.id, profile.childName)}
              className="bg-red-500 rounded-full p-2.5"
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Details */}
        <View className="space-y-3">
          {/* Age */}
          <View className="flex-row items-center py-2">
            <View className="bg-blue-50 rounded-full p-2 mr-3">
              <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-500 text-xs mb-0.5">Age</Text>
              <Text className="text-slate-900 font-semibold text-base">
                {profile.childAge} years old
              </Text>
            </View>
          </View>

          {/* City */}
          <View className="flex-row items-center py-2">
            <View className="bg-green-50 rounded-full p-2 mr-3">
              <Ionicons name="location-outline" size={16} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-500 text-xs mb-0.5">City</Text>
              <Text className="text-slate-900 font-semibold text-base">
                {profile.city}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {childProfiles.length > 0 ? (
          <>
           

            {/* Profile Cards */}
            {childProfiles.map((profile) => renderProfileCard(profile))}
          </>
        ) : (
          <View className="flex-1 items-center justify-center px-6" style={{ minHeight: 500 }}>
            <View className="bg-white rounded-full p-6 mb-4" 
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Ionicons name="person-add-outline" size={48} color="#94a3b8" />
            </View>
            <Text className="text-slate-900 text-2xl font-bold mt-4 text-center">
              No Profile Yet
            </Text>
            <Text className="text-slate-500 text-center mt-2 px-8 text-base">
              Create your child's profile to manage academy enrollments
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
          backgroundColor: "#3b82f6",
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#3b82f6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}