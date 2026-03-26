import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { initializeBookingStore } from '@/utils/storeInitializer';

export default function BookingScreen() {
  const router = useRouter();

  useEffect(() => {
    // Keep your initialization logic
    initializeBookingStore();
  }, []);

  const menuOptions = [
    {
      title: 'Book a Venue',
      subtitle: 'Find turfs, courts & pitches',
      icon: <MaterialCommunityIcons name="stadium" size={32} color="#60a5fa" />,
      path: '/(venue)/venue', // Update to your actual route
      accent: 'border-blue-500/20'
    },
    {
      title: 'Explore Events',
      subtitle: 'Tournaments & workshops',
      icon: <FontAwesome5 name="trophy" size={26} color="#fbbf24" />,
      path: '/(venue)/event', // Update to your actual route
      accent: 'border-amber-500/20'
    },
    {
      title: 'Join a Match',
      subtitle: 'Pay per head • Meet players',
      icon: <Ionicons name="people" size={30} color="#10b981" />,
      path: '/match-sessions', // The new screen we discussed
      accent: 'border-emerald-500/20'
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
      >
        {/* HEADER SECTION */}
        <View className="mb-10">
          <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Your Sports Hub
          </Text>
          <Text className="text-3xl font-bold text-slate-900 mt-1">
            What's the plan?
          </Text>
        </View>

        {/* CARDS */}
        {menuOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => router.push(item.path as any)}
            className={`mb-6 bg-slate-900 rounded-[35px] overflow-hidden shadow-2xl shadow-slate-300 border-l-8 ${item.accent}`}
          >
            <View className="p-8 flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <View className="bg-white/10 w-14 h-14 rounded-2xl items-center justify-center mb-4">
                  {item.icon}
                </View>
                <Text className="text-white text-2xl font-bold tracking-tight">
                  {item.title}
                </Text>
                <Text className="text-slate-400 mt-1 text-sm font-medium">
                  {item.subtitle}
                </Text>
              </View>
              
              <View className="bg-white/5 p-3 rounded-full">
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* RECENT ACTIVITY / PROMO SECTION (Optional) */}
        <View className="mt-4 p-6 bg-slate-50 rounded-[30px] border border-slate-100">
          <Text className="text-slate-900 font-bold">Quick Tip</Text>
          <Text className="text-slate-500 text-xs mt-1">
            Joining a match session is the fastest way to play without needing a full team!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}