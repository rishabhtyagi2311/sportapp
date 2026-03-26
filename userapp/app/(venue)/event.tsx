import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import your existing component
import EventTab from '@/components/eventTab'; 

export default function EventsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER: Consistent with the Venue Screen */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-50">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mr-4 p-2 bg-slate-50 rounded-full"
          >
            <Ionicons name="arrow-back" size={22} color="#1e293b" />
          </TouchableOpacity>
          
          <View>
            <Text className="text-xl font-bold text-slate-900">Explore Events</Text>
            <Text className="text-slate-400 text-xs font-medium">Tournaments & Meetups</Text>
          </View>
        </View>

        {/* Optional: A filter icon specifically for sports categories */}
        <TouchableOpacity className="p-2">
          <Ionicons name="options-outline" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* CONTENT: Your existing Event List logic */}
      <View className="flex-1">
        {/* If EventTab uses a ScrollView internally, ensure it handles padding for the bottom tab bar */}
        <EventTab />
      </View>
    </SafeAreaView>
  );
}