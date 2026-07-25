import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEnrollmentStore } from "@/store/academyEnrollmentStore";

export default function AcademyDashboard() {
  const router = useRouter();
  const { childId, studentId, academyId, academyName, status } = useLocalSearchParams<{
    childId: string;
    studentId: string;
    academyId: string;
    academyName: string;
    status: string;
  }>();
  const isPending = status === "pending";
  const withdrawEnrollment = useEnrollmentStore((state) => state.withdrawEnrollment);
  const [withdrawing, setWithdrawing] = useState(false);

  const handleCancelAdmission = () => {
    Alert.alert(
      "Cancel Admission",
      `Withdraw this child's enrollment from ${academyName}? This cannot be undone.`,
      [
        { text: "Back", style: "cancel" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: async () => {
            setWithdrawing(true);
            try {
              await withdrawEnrollment(studentId);
              router.replace({
                pathname: "/(academy)/manageProfile/academies",
                params: { childId },
              });
            } catch (err: any) {
              Alert.alert("Error", err.message || "Could not withdraw enrollment");
            } finally {
              setWithdrawing(false);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: "Attendance",
      subtitle: "Track daily presence",
      icon: "calendar-check",
      color: "bg-emerald-500",
      shadow: "shadow-emerald-200",
      path: "/(academy)/manageProfile/childAttendance",
    },
    {
      title: "Announcements",
      subtitle: "Updates & News",
      icon: "megaphone",
      color: "bg-amber-500",
      shadow: "shadow-amber-200",
      path: "/(academy)/manageProfile/announcements",
    },
    {
      title: "Fee Status",
      subtitle: "Payments & Invoices",
      icon: "card",
      color: "bg-blue-500",
      shadow: "shadow-blue-200",
      path: "/(academy)/manageProfile/fees",
    },
    {
      title: "Certifications",
      subtitle: "Achievements & Awards",
      icon: "trophy", // Changed to trophy for a premium feel
      color: "bg-indigo-600",
      shadow: "shadow-indigo-200",
      path: "/(academy)/manageProfile/certificationList",
    },
    {
      title: "Write Review",
      subtitle: "Share your feedback",
      icon: "star",
      color: "bg-purple-500",
      shadow: "shadow-purple-200",
      path: "/(academy)/manageProfile/addReviewForm",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-6 pt-4 pb-8">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center bg-slate-100 rounded-full mb-6"
          >
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </TouchableOpacity>
          
          <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest">Academy Dashboard</Text>
          <Text className="text-slate-900 text-3xl font-black mt-1 leading-9">
            {academyName}
          </Text>
        </View>

        {/* Quick Stats / Info Row */}
        <View className="flex-row px-6 mb-8 justify-between">
          <View className="bg-slate-50 rounded-2xl p-4 flex-1 mr-2 border border-slate-100">
             <Text className="text-slate-400 text-[10px] font-bold uppercase">Status</Text>
             <Text className={`font-bold text-base ${isPending ? 'text-amber-600' : 'text-emerald-600'}`}>
               {isPending ? 'Awaiting Approval' : 'Active'}
             </Text>
          </View>
          <View className="bg-slate-50 rounded-2xl p-4 flex-1 ml-2 border border-slate-100">
             <Text className="text-slate-400 text-[10px] font-bold uppercase">Enrollment ID</Text>
             <Text className="text-slate-900 font-bold text-base">#AC-{academyId?.toString().slice(0,4)}</Text>
          </View>
        </View>

        {isPending ? (
          <View className="px-6">
            <View className="bg-amber-50 border border-amber-100 rounded-3xl p-6 items-center mb-4">
              <View className="bg-amber-500 h-14 w-14 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="time-outline" size={28} color="white" />
              </View>
              <Text className="text-slate-900 font-bold text-lg text-center mb-2">
                Enrollment Pending Approval
              </Text>
              <Text className="text-slate-500 text-center text-sm leading-6">
                The academy hasn't confirmed this enrollment yet. Attendance, certificates, and announcements
                will be available here once they approve it.
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCancelAdmission}
              disabled={withdrawing}
              className="flex-row items-center justify-center bg-red-50 p-4 rounded-2xl border border-red-100"
            >
              {withdrawing ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Text className="text-red-600 font-bold text-base">Cancel Request</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
        <>
        {/* Dashboard Grid */}
        <View className="px-6 flex-row flex-wrap justify-between">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push({
                pathname: item.path,
                params: { childId, studentId, academyId, academyName }
              })}
              activeOpacity={0.8}
              className={`w-[48%] mb-4 p-5 rounded-[24px] bg-white border border-slate-100 shadow-xl ${item.shadow}`}
              style={{ elevation: 4 }}
            >
              <View className={`${item.color} h-12 w-12 rounded-2xl items-center justify-center mb-4`}>
                <Ionicons name={item.icon as any} size={24} color="white" />
              </View>
              <Text className="text-slate-900 font-bold text-lg leading-5">{item.title}</Text>
              <Text className="text-slate-400 text-xs mt-1">{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
          
          {/* Filler view to keep grid alignment if items are odd */}
          {menuItems.length % 2 !== 0 && <View className="w-[48%]" />}
        </View>

        {/* Danger Zone */}
        <View className="px-6 mt-8 mb-10">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 ml-1">Danger Zone</Text>
          <TouchableOpacity
            onPress={handleCancelAdmission}
            disabled={withdrawing}
            className="flex-row items-center justify-between bg-red-50 p-5 rounded-3xl border border-red-100"
          >
            <View className="flex-row items-center">
              <View className="bg-red-500 h-10 w-10 rounded-xl items-center justify-center mr-4">
                <Ionicons name="exit-outline" size={20} color="white" />
              </View>
              <View>
                <Text className="text-red-600 font-bold text-base">Cancel Admission</Text>
                <Text className="text-red-400 text-xs">This action is permanent</Text>
              </View>
            </View>
            {withdrawing ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#ef4444" />
            )}
          </TouchableOpacity>
        </View>
        </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}