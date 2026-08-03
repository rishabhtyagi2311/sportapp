import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";
import { useDemoBookingStore, DemoBooking } from "@/store/demoBookingStore";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";
import CalendarModal from "@/components/CalendarModal";

const STATUS_STYLES: Record<DemoBooking["status"], { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
  confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  cancelled: { bg: "bg-slate-200", text: "text-slate-500", label: "Cancelled" },
};

export default function DemoRequestsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isTablet } = useResponsive();

  const academy = useAcademyStore((state) => state.academies.find((a) => a.id === id));
  const {
    bookings,
    isLoading,
    fetchDemoBookings,
    confirmDemoBooking,
    completeDemoBooking,
    cancelDemoBooking,
    rescheduleDemoBooking,
  } = useDemoBookingStore();

  const [reschedulingBookingId, setReschedulingBookingId] = useState<string | null>(null);
  const [reschedulingSaving, setReschedulingSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id) fetchDemoBookings(id);
    }, [id, fetchDemoBookings])
  );

  const handleConfirm = (bookingId: string) => {
    confirmDemoBooking(bookingId).catch((err: any) => Alert.alert("Error", err.message));
  };

  const handleComplete = (bookingId: string) => {
    completeDemoBooking(bookingId).catch((err: any) => Alert.alert("Error", err.message));
  };

  const handleCancel = (bookingId: string) => {
    Alert.alert("Cancel Request", "Cancel this demo booking request?", [
      { text: "Back", style: "cancel" },
      {
        text: "Cancel Request",
        style: "destructive",
        onPress: () => cancelDemoBooking(bookingId).catch((err: any) => Alert.alert("Error", err.message)),
      },
    ]);
  };

  const reschedulingBooking = bookings.find((b) => b.id === reschedulingBookingId);

  const handleRescheduleDate = async (date: Date) => {
    if (!reschedulingBookingId) return;
    setReschedulingSaving(true);
    try {
      await rescheduleDemoBooking(reschedulingBookingId, date.toISOString());
      setReschedulingBookingId(null);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not reschedule demo booking");
    } finally {
      setReschedulingSaving(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const renderItem = ({ item, index }: { item: DemoBooking; index: number }) => {
    const style = STATUS_STYLES[item.status];
    return (
      <FadeInView delay={Math.min(index, 8) * 40} className="bg-white rounded-2xl p-5 mb-4 border border-slate-100 shadow-sm">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-slate-900 font-bold text-base">{item.childName || "Child"}</Text>
            {item.fatherContact ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${item.fatherContact}`)}
                className="flex-row items-center mt-1"
              >
                <Ionicons name="call-outline" size={12} color="#2563eb" />
                <Text className="text-blue-600 text-xs ml-1 font-medium">
                  {item.fatherName || "Parent"} • {item.fatherContact}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-slate-500 text-xs mt-1">Parent: {item.fatherName || "—"}</Text>
            )}
          </View>
          <View className={`px-3 py-1 rounded-full ${style.bg}`}>
            <Text className={`text-[10px] font-bold uppercase ${style.text}`}>{style.label}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-4">
          <Ionicons name="calendar-outline" size={16} color="#64748b" />
          <Text className="text-slate-600 text-sm ml-2">{formatDate(item.bookingDate)}</Text>
        </View>

        {(item.status === "pending" || item.status === "confirmed") && (
          <View className="flex-row justify-end border-t border-slate-50 pt-3" style={{ gap: 8 }}>
            {item.status === "pending" && (
              <TouchableOpacity
                onPress={() => handleConfirm(item.id)}
                className="bg-blue-600 px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-semibold text-sm">Confirm</Text>
              </TouchableOpacity>
            )}
            {item.status === "confirmed" && (
              <TouchableOpacity
                onPress={() => handleComplete(item.id)}
                className="bg-green-600 px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-semibold text-sm">Mark Completed</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setReschedulingBookingId(item.id)}
              className="bg-amber-100 px-4 py-2 rounded-xl"
            >
              <Text className="text-amber-700 font-semibold text-sm">Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCancel(item.id)} className="bg-slate-100 px-4 py-2 rounded-xl">
              <Text className="text-slate-600 font-semibold text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </FadeInView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      <View className="bg-white border-b border-slate-100 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900">Demo Requests</Text>
          <Text className="text-xs text-slate-500">{academy?.academyName || "Loading..."}</Text>
        </View>
        {isLoading && <ActivityIndicator size="small" color="#2563eb" />}
      </View>

      <FlatList
        data={bookings}
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
              <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
              <Text className="text-slate-400 mt-4 text-center">No demo requests yet.</Text>
            </View>
          ) : null
        }
      />

      <CalendarModal
        visible={!!reschedulingBookingId}
        onClose={() => setReschedulingBookingId(null)}
        selectedDate={reschedulingBooking ? new Date(reschedulingBooking.bookingDate) : new Date()}
        onDateSelect={handleRescheduleDate}
        title="Reschedule Demo"
      />

      {reschedulingSaving && (
        <View className="absolute inset-0 bg-black/30 items-center justify-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </SafeAreaView>
  );
}
