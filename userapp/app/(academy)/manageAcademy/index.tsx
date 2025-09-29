import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAcademyStore } from '@/store/academyStore';
import AcademyCard from '@/components/AcademyCard';

export default function AcademyListScreen() {
  const academies = useAcademyStore((state) => state.academies);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Custom Header */}
      <View className="flex-row items-center px-4 py-3 mt-2 mb-4 bg-slate-900 shadow-sm border-b border-gray-200">
        <TouchableOpacity onPress={() => router.navigate("/(homeScreenTabs)/academy")} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white flex-1">My Academies</Text>
      </View>

      {/* List Content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {academies.map((academy) => (
          <AcademyCard
            key={academy.id}
            academy={academy}
            onPress={() => router.push(`/manageAcademy/${academy.id}`)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
