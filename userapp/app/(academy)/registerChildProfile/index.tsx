// app/(academy)/createProfile.tsx
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useParentStore } from "@/store/parentAcademyProfile";

export default function CreateProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const setParentProfile = useParentStore((state) => state.setParentProfile);
  const updateParentProfile = useParentStore((state) => state.updateParentProfile);

  const isEditing = params.isEditing === "true";

  const [formData, setFormData] = useState({
    fatherName: "",
    motherName: "",
    childName: "",
    childAge: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    if (isEditing) {
      setFormData({
        fatherName: (params.fatherName as string) || "",
        motherName: (params.motherName as string) || "",
        childName: (params.childName as string) || "",
        childAge: (params.childAge as string) || "",
        address: (params.address as string) || "",
        city: (params.city as string) || "",
      });
    }
  }, [params]);

  const handleSubmit = () => {
    if (
      !formData.fatherName ||
      !formData.motherName ||
      !formData.childName ||
      !formData.childAge ||
      !formData.address ||
      !formData.city
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const age = parseInt(formData.childAge);
    if (isNaN(age) || age < 1 || age > 18) {
      Alert.alert("Error", "Please enter a valid age between 1 and 18");
      return;
    }

    if (isEditing) {
      updateParentProfile({ ...formData });
      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } else {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const parentData = { ...formData, id };
      setParentProfile(parentData);
      Alert.alert("Success", "Profile created successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="w-full h-full bg-slate-900">
        {/* Header */}
        <View className="px-6 py-4 border-b border-white flex-row items-center mt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4"
            activeOpacity={0.7}
            style={{ backgroundColor: 'transparent' }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="mr-4">
            <Ionicons name="person-add-outline" size={24} color="white" />
          </View>
          <Text className="text-white text-xl font-bold">
            {isEditing ? "Edit Profile" : "Create Profile"}
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
          {!isEditing && (
            <View className="mb-8 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <Text className="text-white text-lg font-semibold mb-2">
                Welcome to Academy Connect! 👋
              </Text>
              <Text className="text-slate-300 text-sm leading-5">
                Let's create your parent profile. This will help us personalize your experience.
              </Text>
            </View>
          )}

          {/* Father Name */}
          <View className="mb-5">
            <Text className="text-white font-semibold mb-2 text-sm">
              Father Name *
            </Text>
            <View className="bg-slate-800 rounded-xl border border-slate-700 flex-row items-center px-4">
              <Ionicons name="man-outline" size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-4 px-3 text-base"
                placeholder="Enter father's full name"
                placeholderTextColor="#64748b"
                value={formData.fatherName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, fatherName: text }))
                }
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Mother Name */}
          <View className="mb-5">
            <Text className="text-white font-semibold mb-2 text-sm">
              Mother Name *
            </Text>
            <View className="bg-slate-800 rounded-xl border border-slate-700 flex-row items-center px-4">
              <Ionicons name="woman-outline" size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-4 px-3 text-base"
                placeholder="Enter mother's full name"
                placeholderTextColor="#64748b"
                value={formData.motherName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, motherName: text }))
                }
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Child Name */}
          <View className="mb-5">
            <Text className="text-white font-semibold mb-2 text-sm">
              Child Name *
            </Text>
            <View className="bg-slate-800 rounded-xl border border-slate-700 flex-row items-center px-4">
              <Ionicons name="person-outline" size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-4 px-3 text-base"
                placeholder="Enter child's full name"
                placeholderTextColor="#64748b"
                value={formData.childName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, childName: text }))
                }
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Child Age */}
          <View className="mb-5">
            <Text className="text-white font-semibold mb-2 text-sm">
              Child Age *
            </Text>
            <View className="bg-slate-800 rounded-xl border border-slate-700 flex-row items-center px-4">
              <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-4 px-3 text-base"
                placeholder="Enter child's age"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                maxLength={2}
                value={formData.childAge}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, childAge: text }))
                }
              />
            </View>
          </View>

          {/* Address */}
          <View className="mb-5">
            <Text className="text-white font-semibold mb-2 text-sm">Address *</Text>
            <View className="bg-slate-800 rounded-xl border border-slate-700">
              <View className="flex-row items-start px-4 pt-4">
                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#94a3b8"
                  style={{ marginTop: 4 }}
                />
                <TextInput
                  className="flex-1 text-white py-0 px-3 text-base"
                  placeholder="Complete address with landmarks"
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, address: text }))
                  }
                  style={{ minHeight: 80, paddingBottom: 16 }}
                />
              </View>
            </View>
          </View>

          {/* City */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-sm">City *</Text>
            <View className="bg-slate-800 rounded-xl border border-slate-700 flex-row items-center px-4">
              <Ionicons name="business-outline" size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-4 px-3 text-base"
                placeholder="Enter city name"
                placeholderTextColor="#64748b"
                value={formData.city}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, city: text }))
                }
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-white rounded-xl py-4 mb-6 shadow-lg"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-black font-bold text-lg mr-2">
                {isEditing ? "Update Profile" : "Create Profile"}
              </Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="black"
              />
            </View>
          </TouchableOpacity>

          {/* Footer Note */}
          <View className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-row justify-center align-middle mb-10">
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="white"
              className="ml-2"
            />
            <Text className="text-slate-400 text-sm text-center leading-4 mr-2">
              You can update your profile details anytime from your dashboard
            </Text>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}