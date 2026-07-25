import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";

export default function FeesScreen() {
  const router = useRouter();
  const { academyId, academyName } = useLocalSearchParams<{ academyId: string; academyName: string }>();
  const { getAcademyById, fetchAcademyById } = useAcademyStore();

  useEffect(() => {
    if (academyId) fetchAcademyById(academyId);
  }, [academyId]);

  const academy = getAcademyById(academyId);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 ml-2">Fee Information</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {/* Academy Label */}
        <View className="mb-6">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Academy</Text>
          <Text className="text-slate-900 text-lg font-bold">{academy?.academyName || academyName || "Sports Academy"}</Text>
        </View>

        {/* Fee Card */}
        <View className="bg-slate-900 rounded-[32px] p-6 mb-8 shadow-xl shadow-slate-400">
          <Text className="text-indigo-300 text-xs font-bold uppercase mb-1">Academy Fee</Text>
          <Text className="text-white text-3xl font-black mb-4">
            {academy ? `₹${academy.fee}` : "—"}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="repeat-outline" size={18} color="#94a3b8" />
            <Text className="text-slate-300 ml-2">
              Billed <Text className="text-white font-bold">{academy?.feeStructure || "Monthly"}</Text>
            </Text>
          </View>
        </View>

        {/* Note */}
        <View className="bg-white rounded-2xl p-5 border border-slate-100">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle-outline" size={18} color="#64748b" />
            <Text className="text-slate-700 font-semibold ml-2">Payments</Text>
          </View>
          <Text className="text-slate-500 text-sm leading-6">
            Online fee payment isn't available yet. Please contact the academy directly to arrange payment.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
