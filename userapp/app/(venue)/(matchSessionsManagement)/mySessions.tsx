import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMatchSessionStore, MatchSession } from '@/store/matchSessionStore';
import { format, parseISO } from 'date-fns';

export default function MyMatchSessionsScreen() {
  const router = useRouter();
  const { myJoinedSessions, isLoading, fetchMySessions } = useMatchSessionStore();

  useEffect(() => {
    fetchMySessions();
  }, []);

  const renderMatchCard = ({ item }: { item: MatchSession }) => {
    const isLive = item.status === 'live';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: './details', params: { id: item.id } })}
        className="bg-white rounded-[30px] p-6 mb-5 shadow-xl shadow-slate-100 border border-slate-50"
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                {format(parseISO(item.date), 'EEEE, MMM do')}
              </Text>
              <View className="mx-2 w-1 h-1 rounded-full bg-slate-300" />
              <Text className="text-slate-400 font-bold text-[10px] uppercase">{item.startTime}</Text>
            </View>
            <Text className="text-xl font-extrabold text-slate-900">{item.sport}</Text>
            <Text className="text-slate-500 text-xs mt-1 italic">{item.venueName}</Text>
          </View>

          <View className={`px-3 py-1 rounded-full ${isLive ? 'bg-green-100' : 'bg-amber-100'}`}>
            <Text className={`text-[10px] font-bold ${isLive ? 'text-green-700' : 'text-amber-700'}`}>
              {isLive ? 'MATCH LIVE' : 'GATHERING'}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center pt-4 border-t border-slate-50">
          <View className="flex-row items-center">
            <FontAwesome5 name="medal" size={12} color="#64748b" />
            <Text className="text-slate-600 text-xs ml-2 font-semibold">{item.skillLevel}</Text>
          </View>
          <Text className="text-blue-600 font-black text-lg">₹{item.pricePerPerson}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View className="px-6 py-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-white rounded-full shadow-sm">
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">My Match Sessions</Text>
        <View className="w-10" />
      </View>

      {isLoading && myJoinedSessions.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={myJoinedSessions}
          renderItem={renderMatchCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-16">
              <Text className="text-slate-400 text-center mb-4">You haven't joined any match sessions yet.</Text>
              <TouchableOpacity onPress={() => router.push('./view')} className="bg-blue-600 px-6 py-3 rounded-xl">
                <Text className="text-white font-semibold">Browse Public Matches</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
