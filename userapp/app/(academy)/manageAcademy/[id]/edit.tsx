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
    const { id } = useLocalSearchParams();
    const { academies, updateAcademy } = useAcademyStore();
    const academy = academies.find((a) => a.id === id);
    const [editData, setEditData] = useState(academy ? { ...academy } : null);

    if (!academy || !editData)
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
                <Text className="text-gray-600">Academy not found</Text>
            </SafeAreaView>
        );

    const saveChanges = () => {
        updateAcademy(editData);
        Alert.alert("Success", "Academy details updated successfully!");
        router.back();
    };

    const feeOptions = ["Monthly", "Quarterly", "Yearly"];

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="w-full h-full bg-gray-300 mt-2">

                <View className="flex-row items-center px-4 py-3 bg-slate-900 shadow-sm border-b">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-white flex-1">
                        Edit Academy
                    </Text>
                </View>

                {/* Content */}
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
                    <View>
                        <Text className="text-base font-semibold text-gray-900 mb-2">
                            Academy Name
                        </Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 text-base bg-white mb-4"
                            value={editData.academyName}
                            onChangeText={(text) =>
                                setEditData({ ...editData, academyName: text })
                            }
                        />

                        <Text className="text-base font-semibold text-gray-900 mb-2">
                            Address
                        </Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 text-base bg-white mb-4 h-20"
                            value={editData.address}
                            onChangeText={(text) => setEditData({ ...editData, address: text })}
                            multiline
                            textAlignVertical="top"
                        />

                        <Text className="text-base font-semibold text-gray-900 mb-2">
                            Contact Number
                        </Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 text-base bg-white mb-4"
                            value={editData.contactNumber}
                            onChangeText={(text) =>
                                setEditData({ ...editData, contactNumber: text })
                            }
                            keyboardType="phone-pad"
                        />

                        <Text className="text-base font-semibold text-gray-900 mb-2">
                            Monthly Fee
                        </Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 text-base bg-white mb-4"
                            value={editData.Fee}
                            onChangeText={(text) => setEditData({ ...editData, Fee: text })}
                            keyboardType="numeric"
                        />

                        {/* Fee Structure */}
                        <Text className="text-base font-semibold text-gray-900 mb-2">
                            Fee Structure
                        </Text>
                        <View className="flex-row justify-between mb-4">
                            {feeOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => setEditData({ ...editData, feeStructure: option })}
                                    className={`flex-1 mx-1 py-3 rounded-lg border ${editData.feeStructure === option
                                            ? "bg-blue-600 border-blue-600"
                                            : "bg-white border-gray-300"
                                        }`}
                                >
                                    <Text
                                        className={`text-center font-medium ${editData.feeStructure === option
                                                ? "text-white"
                                                : "text-gray-700"
                                            }`}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text className="text-base font-semibold text-gray-900 mb-2">
                            Facilities
                        </Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 text-base bg-white mb-4 h-20"
                            value={editData.facilities}
                            onChangeText={(text) =>
                                setEditData({ ...editData, facilities: text })
                            }
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>

                {/* Bottom Save Button */}
                <View className="px-4 py-3 bg-white border-t border-gray-200">
                    <TouchableOpacity
                        onPress={saveChanges}
                        className="bg-blue-600 py-3 rounded-lg"
                    >
                        <Text className="text-white text-center font-semibold text-base">
                            Save Changes
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
