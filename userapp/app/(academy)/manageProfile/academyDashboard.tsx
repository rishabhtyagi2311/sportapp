import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function AcademyDashboard() {
  const router = useRouter();
  const { childId, academyId, academyName } = useLocalSearchParams();

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
             <Text className="text-emerald-600 font-bold text-base">Active</Text>
          </View>
          <View className="bg-slate-50 rounded-2xl p-4 flex-1 ml-2 border border-slate-100">
             <Text className="text-slate-400 text-[10px] font-bold uppercase">Enrollment ID</Text>
             <Text className="text-slate-900 font-bold text-base">#AC-{academyId?.toString().slice(0,4)}</Text>
          </View>
        </View>

        {/* Dashboard Grid */}
        <View className="px-6 flex-row flex-wrap justify-between">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push({
                pathname: item.path,
                params: { childId, academyId, academyName }
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
            onPress={() => {/* Add Cancel Admission Logic */}}
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
            <Ionicons name="chevron-forward" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}