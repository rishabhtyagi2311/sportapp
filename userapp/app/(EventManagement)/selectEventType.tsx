// app/(venue)/eventManager/selectEventType.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SelectEventTypeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-6">
      {/* Header */}
      <View className="mt-6 mb-10">
        <Text className="text-2xl font-bold text-slate-900">
          Create Event
        </Text>
        <Text className="text-slate-500 mt-2">
          Choose the type of event you want to create
        </Text>
      </View>

      {/* Regular Event */}
      <TouchableOpacity
        onPress={() => router.push('/(EventManagement)/createEvent')}
        className="bg-white rounded-2xl border border-slate-200 p-6 mb-6"
        activeOpacity={0.85}
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
            <Ionicons name="calendar-outline" size={24} color="#2563eb" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-900">
              Regular Event
            </Text>
            <Text className="text-slate-500 text-sm mt-1">
              Practice, friendly matches, training sessions
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Football Tournament */}
      <TouchableOpacity
        onPress={() =>
          router.push('/(EventManagement)/createFootballTournamentEvent')
        }
        className="bg-white rounded-2xl border border-slate-200 p-6"
        activeOpacity={0.85}
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
            <Ionicons name="trophy-outline" size={24} color="#16a34a" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-900">
              Football Tournament
            </Text>
            <Text className="text-slate-500 text-sm mt-1">
              League or knockout football competitions
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
