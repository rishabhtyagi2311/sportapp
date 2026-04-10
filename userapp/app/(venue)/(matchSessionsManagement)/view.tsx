import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMatchSessionStore, MatchSession } from '@/store/matchSessionStore';
import { format, parseISO } from 'date-fns';

export default function MatchDiscoveryScreen() {
  const router = useRouter();
  const sessions = useMatchSessionStore((state) => state.sessions);

  const renderMatchCard = ({ item }: { item: MatchSession }) => {
    const isLive = item.status === 'live';
    const progress = (item.playersJoined / item.totalPlayers) * 100;

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

        {/* Progress Bar */}
        <View className="mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-500 text-[10px] font-medium">Spots Filled</Text>
            <Text className="text-slate-900 text-[10px] font-bold">{item.playersJoined}/{item.totalPlayers}</Text>
          </View>
          <View className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <View className={`h-full ${isLive ? 'bg-green-500' : 'bg-amber-400'}`} style={{ width: `${progress}%` }} />
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
        <Text className="text-xl font-bold">Public Matches</Text>
        <TouchableOpacity className="p-2 bg-white rounded-full shadow-sm">
          <MaterialIcons name="filter-list" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderMatchCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}