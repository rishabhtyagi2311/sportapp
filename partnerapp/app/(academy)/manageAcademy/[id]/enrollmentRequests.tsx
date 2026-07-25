import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";
import { Student } from "@/types";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";

export default function EnrollmentRequestsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isTablet } = useResponsive();

  const academy = useAcademyStore((state) => state.academies.find((a) => a.id === id));
  const { pendingEnrollments, isLoading, fetchPendingEnrollments, approveEnrollment, rejectEnrollment } =
    useAcademyStore();

  useFocusEffect(
    useCallback(() => {
      if (id) fetchPendingEnrollments(id);
    }, [id, fetchPendingEnrollments])
  );

  const handleApprove = (studentId: string) => {
    approveEnrollment(id, studentId).catch((err: any) => Alert.alert("Error", err.message));
  };

  const handleReject = (studentId: string, childName: string) => {
    Alert.alert("Reject Enrollment", `Reject ${childName}'s enrollment request?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => rejectEnrollment(id, studentId).catch((err: any) => Alert.alert("Error", err.message)),
      },
    ]);
  };

  const renderItem = ({ item, index }: { item: Student; index: number }) => (
    <FadeInView delay={Math.min(index, 8) * 40} className="bg-white rounded-2xl p-5 mb-4 border border-slate-100 shadow-sm">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-slate-900 font-bold text-base">{item.name}</Text>
          <Text className="text-slate-500 text-xs mt-1">
            Age {item.age} • Parent: {item.fatherName} • {item.fatherContact}
          </Text>
        </View>
        <View className="bg-amber-100 px-3 py-1 rounded-full">
          <Text className="text-[10px] font-bold uppercase text-amber-700">Pending</Text>
        </View>
      </View>

      <View className="flex-row justify-end border-t border-slate-50 pt-3" style={{ gap: 8 }}>
        <TouchableOpacity onPress={() => handleReject(item.id, item.name)} className="bg-slate-100 px-4 py-2 rounded-xl">
          <Text className="text-slate-600 font-semibold text-sm">Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleApprove(item.id)} className="bg-blue-600 px-4 py-2 rounded-xl">
          <Text className="text-white font-semibold text-sm">Approve</Text>
        </TouchableOpacity>
      </View>
    </FadeInView>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      <View className="bg-white border-b border-slate-100 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900">Enrollment Requests</Text>
          <Text className="text-xs text-slate-500">{academy?.academyName || "Loading..."}</Text>
        </View>
        {isLoading && <ActivityIndicator size="small" color="#2563eb" />}
      </View>

      <FlatList
        data={pendingEnrollments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
          maxWidth: isTablet ? 768 : undefined,
          width: "100%",
          alignSelf: "center",
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-16">
              <Ionicons name="people-outline" size={48} color="#94a3b8" />
              <Text className="text-slate-400 mt-4 text-center">No pending enrollment requests.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
