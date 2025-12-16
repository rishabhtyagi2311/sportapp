import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TournamentFormatSelectionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="px-6 py-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-slate-900">Create Tournament</Text>
        <Text className="text-slate-500 text-base mt-2">Choose your tournament format</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* LEAGUE OPTION */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => router.push('./createTournament')} 
          className="bg-white p-6 rounded-2xl border border-slate-200 mb-6 shadow-sm"
        >
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="list" size={24} color="#2563eb" />
          </View>
          <Text className="text-xl font-bold text-slate-900 mb-2">League Format</Text>
          <Text className="text-slate-500 leading-6">
            Classic round-robin style. Every team plays against every other team. Best for seasons and long-term competitions.
          </Text>
          <View className="mt-4 flex-row items-center">
            <Text className="text-blue-600 font-semibold mr-2">Select League</Text>
            <Ionicons name="arrow-forward" size={16} color="#2563eb" />
          </View>
        </TouchableOpacity>

        {/* KNOCKOUT OPTION */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => router.push('(football)/startKnockOutTournament/step1')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="git-network-outline" size={24} color="#ea580c" />
          </View>
          <Text className="text-xl font-bold text-slate-900 mb-2">Knockout Cup</Text>
          <Text className="text-slate-500 leading-6">
            Elimination style bracket. Winners advance, losers go home. Perfect for cups, playoffs, and short events.
          </Text>
          <View className="mt-4 flex-row items-center">
            <Text className="text-orange-600 font-semibold mr-2">Select Knockout</Text>
            <Ionicons name="arrow-forward" size={16} color="#ea580c" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}