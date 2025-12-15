
import React from "react";
import { View, Text, ScrollView, SafeAreaView } from "react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-6 py-6">
        <Text className="text-3xl font-bold text-slate-900 mb-2">Profile</Text>
        <Text className="text-slate-600">Profile coming soon</Text>
      </View>
    </SafeAreaView>
  );
}