import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAcademyStore } from "@/store/academyStore";

export default function EditAcademyScreen() {
  /* ---------------- Route Params ---------------- */
  const { id } = useLocalSearchParams<{ id: string }>();

  /* ---------------- Store ---------------- */
  const { academies, updateAcademy } = useAcademyStore();

  if (!id) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-600">Invalid academy</Text>
      </SafeAreaView>
    );
  }

  const academy = academies.find((a) => a.id === id);

  /* ---------------- Local Edit State ---------------- */
  const [editData, setEditData] = useState(
    academy ? JSON.parse(JSON.stringify(academy)) : null
  );

  if (!academy || !editData) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-600">Academy not found</Text>
      </SafeAreaView>
    );
  }

  /* ---------------- Handlers ---------------- */
  const saveChanges = () => {
    if (!editData.academyName?.trim()) {
      Alert.alert("Validation Error", "Academy name is required");
      return;
    }

    if (!editData.contactNumber?.trim()) {
      Alert.alert("Validation Error", "Contact number is required");
      return;
    }

    updateAcademy(editData);
    Alert.alert("Success", "Academy details updated successfully!");
    router.back();
  };

  const feeOptions = ["Monthly", "Quarterly", "Yearly"];

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-slate-900 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white flex-1">
          Edit Academy
        </Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Academy Name */}
        <Text className="text-sm font-semibold text-slate-700 mb-1">
          Academy Name
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white mb-4"
          value={editData.academyName}
          onChangeText={(text) =>
            setEditData({ ...editData, academyName: text })
          }
        />

        {/* Address */}
        <Text className="text-sm font-semibold text-slate-700 mb-1">
          Address
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white mb-4 h-20"
          value={editData.address}
          onChangeText={(text) =>
            setEditData({ ...editData, address: text })
          }
          multiline
          textAlignVertical="top"
        />

        {/* Contact Number */}
        <Text className="text-sm font-semibold text-slate-700 mb-1">
          Contact Number
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white mb-4"
          value={editData.contactNumber}
          onChangeText={(text) =>
            setEditData({ ...editData, contactNumber: text })
          }
          keyboardType="phone-pad"
        />

        {/* Monthly Fee */}
        <Text className="text-sm font-semibold text-slate-700 mb-1">
          Monthly Fee
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white mb-4"
          value={editData.Fee}
          onChangeText={(text) =>
            setEditData({ ...editData, Fee: text })
          }
          keyboardType="numeric"
        />

        {/* Fee Structure */}
        <Text className="text-sm font-semibold text-slate-700 mb-2">
          Fee Structure
        </Text>
        <View className="flex-row justify-between mb-4">
          {feeOptions.map((option) => {
            const selected = editData.feeStructure === option;

            return (
              <TouchableOpacity
                key={option}
                onPress={() =>
                  setEditData({ ...editData, feeStructure: option })
                }
                className={`flex-1 mx-1 py-3 rounded-lg border ${
                  selected
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    selected ? "text-white" : "text-gray-700"
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Facilities */}
        <Text className="text-sm font-semibold text-slate-700 mb-1">
          Facilities
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 bg-white h-20"
          value={editData.facilities}
          onChangeText={(text) =>
            setEditData({ ...editData, facilities: text })
          }
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

      {/* Bottom Save Button */}
      <View className="px-4 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={saveChanges}
          className="bg-blue-600 py-4 rounded-lg"
          activeOpacity={0.85}
        >
          <Text className="text-white text-center font-semibold text-base">
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
