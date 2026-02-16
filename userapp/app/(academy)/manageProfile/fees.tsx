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

export default function FeesScreen() {
  const router = useRouter();
  const { academyName } = useLocalSearchParams();

  // Dummy Data
  const upcomingFee = {
    month: "March 2026",
    amount: "₹2,500",
    dueDate: "March 05, 2026",
    status: "Pending",
  };

  const feeHistory = [
    { id: 1, month: "February 2026", amount: "₹2,500", date: "Feb 02, 2026", status: "Paid" },
    { id: 2, month: "January 2026", amount: "₹2,500", date: "Jan 04, 2026", status: "Paid" },
    { id: 3, month: "December 2025", amount: "₹2,200", date: "Dec 05, 2025", status: "Paid" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 ml-2">Fee Management</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        
        {/* Academy Label */}
        <View className="mb-6">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Academy</Text>
          <Text className="text-slate-900 text-lg font-bold">{academyName || "Sports Academy"}</Text>
        </View>

        {/* Upcoming Fee Card (Hero Card) */}
        <View className="bg-slate-900 rounded-[32px] p-6 mb-8 shadow-xl shadow-slate-400">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-indigo-300 text-xs font-bold uppercase mb-1">Upcoming Payment</Text>
              <Text className="text-white text-3xl font-black">{upcomingFee.amount}</Text>
            </View>
            <View className="bg-white/10 px-3 py-1 rounded-full">
              <Text className="text-white text-[10px] font-bold uppercase">{upcomingFee.month}</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-6">
            <Ionicons name="time-outline" size={18} color="#94a3b8" />
            <Text className="text-slate-300 ml-2">Due on <Text className="text-white font-bold">{upcomingFee.dueDate}</Text></Text>
          </View>

          <TouchableOpacity 
            activeOpacity={0.8}
            className="bg-indigo-500 py-4 rounded-2xl items-center shadow-lg shadow-indigo-400"
          >
            <Text className="text-white font-black text-lg">Pay Now</Text>
          </TouchableOpacity>
        </View>

        {/* Payment History */}
        <View>
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="text-slate-900 font-black text-lg">Payment History</Text>
            <Ionicons name="receipt-outline" size={20} color="#64748b" />
          </View>

          {feeHistory.map((fee) => (
            <View 
              key={fee.id} 
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between border border-slate-100 shadow-sm"
            >
              <View className="flex-row items-center">
                <View className="h-10 w-10 bg-emerald-50 rounded-full items-center justify-center mr-4">
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                </View>
                <View>
                  <Text className="text-slate-900 font-bold">{fee.month}</Text>
                  <Text className="text-slate-400 text-xs">Paid on {fee.date}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-slate-900 font-black">{fee.amount}</Text>
                <Text className="text-emerald-500 text-[10px] font-bold uppercase">Success</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Help Note */}
        <TouchableOpacity className="mt-4 items-center py-4">
          <Text className="text-slate-400 text-xs">Need help with payments? <Text className="text-indigo-500 font-bold">Contact Support</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}