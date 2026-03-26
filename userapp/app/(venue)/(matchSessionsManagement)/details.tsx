import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useMatchSessionStore } from '@/store/matchSessionStore';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const session = useMatchSessionStore((state) => state.sessions.find(s => s.id === id));

  if (!session) return null;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* HERO IMAGE SECTION */}
        <View className="h-64 bg-slate-900 relative">
          {/* Mock Image / Replace with sport specific images later */}
          <View className="absolute inset-0 bg-blue-600/20 items-center justify-center">
             <FontAwesome5 name="running" size={80} color="rgba(255,255,255,0.2)" />
          </View>
          
          <SafeAreaView className="flex-row justify-between px-6 pt-4">
            <TouchableOpacity onPress={() => router.back()} className="bg-white/20 p-2 rounded-full">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white/20 p-2 rounded-full">
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* INFO SECTION */}
        <View className="px-6 -mt-10 bg-white rounded-t-[40px] pt-8">
          <View className="flex-row justify-between items-center mb-2">
            <View className="bg-blue-100 px-3 py-1 rounded-lg">
              <Text className="text-blue-700 font-bold text-[10px] uppercase">{session.sport}</Text>
            </View>
            <Text className="text-slate-400 text-xs font-medium">Hosted by {session.hostName}</Text>
          </View>

          <Text className="text-3xl font-black text-slate-900 mb-6">{session.venueName}</Text>

          {/* DATE & TIME CARDS */}
          <View className="flex-row justify-between mb-8">
            <View className="w-[48%] bg-slate-50 p-4 rounded-3xl border border-slate-100 flex-row items-center">
              <Ionicons name="calendar" size={20} color="#3b82f6" />
              <View className="ml-3">
                <Text className="text-[10px] text-slate-400 font-bold uppercase">Date</Text>
                <Text className="text-slate-900 font-bold text-sm">{session.date}</Text>
              </View>
            </View>
            <View className="w-[48%] bg-slate-50 p-4 rounded-3xl border border-slate-100 flex-row items-center">
              <Ionicons name="time" size={20} color="#3b82f6" />
              <View className="ml-3">
                <Text className="text-[10px] text-slate-400 font-bold uppercase">Time</Text>
                <Text className="text-slate-900 font-bold text-sm">{session.startTime}</Text>
              </View>
            </View>
          </View>

          <Text className="text-lg font-bold text-slate-900 mb-2">Match Description</Text>
          <Text className="text-slate-500 leading-6 mb-8">{session.description}</Text>

          {/* PLAYER SLOT INFO */}
          <View className="bg-slate-900 p-6 rounded-[32px] mb-10">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white font-bold text-lg">Availability</Text>
                <Text className="text-blue-400 font-bold">{session.totalPlayers - session.playersJoined} slots left</Text>
            </View>
            <View className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <View className="h-full bg-blue-500" style={{ width: `${(session.playersJoined / session.totalPlayers) * 100}%` }} />
            </View>
            <Text className="text-slate-400 text-xs mt-4">Note: Match will be confirmed once {session.minPlayersForLive} players join.</Text>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER ACTION */}
      <View className="p-6 border-t border-slate-100 flex-row items-center justify-between pb-10">
        <View>
          <Text className="text-slate-400 text-xs font-bold uppercase">Total Price</Text>
          <Text className="text-2xl font-black text-slate-900">₹{session.pricePerPerson}</Text>
        </View>
        <TouchableOpacity 
          className="bg-blue-600 px-10 py-5 rounded-[24px] shadow-lg shadow-blue-200"
          onPress={() => alert('Proceeding to Payment...')}
        >
          <Text className="text-white font-black text-lg">Join Match</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}