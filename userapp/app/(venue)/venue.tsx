import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import your existing component
import VenueTab from '@/components/venueTab'; 

export default function VenuesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER: Professional & Minimal */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-50">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mr-4 p-2 bg-slate-50 rounded-full"
        >
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        
        <View>
          <Text className="text-xl font-bold text-slate-900">Available Venues</Text>
          <Text className="text-slate-400 text-xs font-medium">Find your perfect arena</Text>
        </View>
      </View>

      {/* CONTENT: Your existing Venue List logic */}
      <View className="flex-1">
        <VenueTab />
      </View>
    </SafeAreaView>
  );
}