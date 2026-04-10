import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMatchExecutionStore, MatchEvent } from '@/store/footballMatchEventStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function MatchDetailScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams();
  const { getMatchById } = useMatchExecutionStore();
  
  const match = getMatchById(matchId as string);

  if (!match) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#64748b" />
        <Text className="text-xl font-bold text-slate-900 mt-4">Match Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-slate-900 px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const result = useMemo(() => {
    const isHomeWin = match.homeTeamScore > match.awayTeamScore;
    const isDraw = match.homeTeamScore === match.awayTeamScore;
    if (isDraw) return { text: 'Draw', color: 'text-slate-500', bgColor: 'bg-slate-100' };
    return isHomeWin 
      ? { text: 'Win', color: 'text-emerald-600', bgColor: 'bg-emerald-100' }
      : { text: 'Loss', color: 'text-red-600', bgColor: 'bg-red-100' };
  }, [match]);

  const possession = useMemo(() => {
    const home = (match as any).homePossessionSeconds || 50;
    const away = (match as any).awayPossessionSeconds || 50;
    const total = home + away || 1;
    return {
      home: Math.round((home / total) * 100),
      away: Math.round((away / total) * 100)
    };
  }, [match]);

  const StatRow = ({ label, home, away, isPercentage = false }: { label: string, home: number, away: number, isPercentage?: boolean }) => {
    const total = home + away || 1;
    const homeWidth = (home / total) * 100;
    return (
      <View className="mb-5">
        <View className="flex-row justify-between mb-2">
          <Text className="text-slate-900 font-black text-xs">{home}{isPercentage ? '%' : ''}</Text>
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{label}</Text>
          <Text className="text-slate-900 font-black text-xs">{away}{isPercentage ? '%' : ''}</Text>
        </View>
        <View className="h-1.5 bg-slate-100 rounded-full flex-row overflow-hidden">
          <View style={{ width: `${homeWidth}%` }} className="bg-emerald-500 h-full" />
          <View className="flex-1 bg-red-500 h-full" />
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* --- SCOREBOARD HEADER --- */}
        <View className="rounded-b-[40px] overflow-hidden shadow-2xl">
          <LinearGradient colors={['#0f172a', '#1e293b']} className="pt-16 pb-10 px-6">
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white/60 font-black uppercase text-[10px] tracking-widest">Match Report</Text>
              <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                <Ionicons name="share-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-white/10 rounded-2xl items-center justify-center mb-3 border border-white/5">
                  <Ionicons name="shield" size={32} color="#10b981" />
                </View>
                <Text className="text-white font-black text-center text-[10px] uppercase" numberOfLines={1}>
                  {match.matchSetup.myTeam.teamName}
                </Text>
              </View>

              <View className="items-center px-4">
                <View className="flex-row items-center">
                  <Text className="text-white text-5xl font-black italic">{match.homeTeamScore}</Text>
                  <Text className="text-blue-500 text-3xl font-black mx-3">-</Text>
                  <Text className="text-white text-5xl font-black italic">{match.awayTeamScore}</Text>
                </View>
                <View className="bg-blue-600 px-3 py-1 rounded-full mt-2 shadow-sm">
                  <Text className="text-white font-black text-[9px] uppercase tracking-tighter">Full Time</Text>
                </View>
              </View>

              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-white/10 rounded-2xl items-center justify-center mb-3 border border-white/5">
                  <Ionicons name="shield-outline" size={32} color="#ef4444" />
                </View>
                <Text className="text-white font-black text-center text-[10px] uppercase" numberOfLines={1}>
                  {match.matchSetup.opponentTeam.teamName}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* --- METADATA CARD --- */}
        <View className="px-6 -mt-6">
          <View className="bg-white rounded-3xl p-5 shadow-xl border border-slate-50 flex-row justify-between">
            <View className="items-center flex-1 border-r border-slate-100">
              <Text className="text-slate-400 font-bold text-[9px] uppercase mb-1">Time</Text>
              <Text className="text-slate-900 font-black">{match.actualDuration}m</Text>
            </View>
            <View className="items-center flex-1 border-r border-slate-100">
              <Text className="text-slate-400 font-bold text-[9px] uppercase mb-1">Venue</Text>
              <Text className="text-slate-900 font-black text-[10px]" numberOfLines={1}>{match.venue}</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-slate-400 font-bold text-[9px] uppercase mb-1">Result</Text>
              <Text className={`font-black text-[10px] ${result.color}`}>{result.text}</Text>
            </View>
          </View>
        </View>

        {/* --- ANALYTICS SECTION --- */}
        <View className="p-6">
          <Text className="text-slate-900 font-black text-lg italic uppercase mb-4 tracking-tight">Match Statistics</Text>
          <View className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
            <StatRow label="Possession" home={possession.home} away={possession.away} isPercentage />
            <StatRow label="Goals" home={match.homeTeamStats.goals} away={match.awayTeamStats.goals} />
            <StatRow label="Fouls" home={match.homeTeamStats.fouls} away={match.awayTeamStats.fouls} />
            <StatRow label="Corners" home={match.homeTeamStats.corners} away={match.awayTeamStats.corners} />
            
            <View className="flex-row justify-between mt-2 pt-5 border-t border-slate-50">
               <View className="flex-row">
                  <View className="w-5 h-7 bg-yellow-400 rounded-md mr-1.5 items-center justify-center border-b-2 border-yellow-600">
                    <Text className="text-white font-black text-[10px]">{match.homeTeamStats.yellowCards}</Text>
                  </View>
                  <View className="w-5 h-7 bg-red-500 rounded-md items-center justify-center border-b-2 border-red-700">
                    <Text className="text-white font-black text-[10px]">{match.homeTeamStats.redCards}</Text>
                  </View>
               </View>
               <Text className="text-slate-300 font-black text-[10px] uppercase">Bookings</Text>
               <View className="flex-row">
                  <View className="w-5 h-7 bg-yellow-400 rounded-md mr-1.5 items-center justify-center border-b-2 border-yellow-600">
                    <Text className="text-white font-black text-[10px]">{match.awayTeamStats.yellowCards}</Text>
                  </View>
                  <View className="w-5 h-7 bg-red-500 rounded-md items-center justify-center border-b-2 border-red-700">
                    <Text className="text-white font-black text-[10px]">{match.awayTeamStats.redCards}</Text>
                  </View>
               </View>
            </View>
          </View>
        </View>

        {/* --- TIMELINE SECTION --- */}
        <View className="px-6 pb-6">
          <Text className="text-slate-900 font-black text-lg italic uppercase mb-4 tracking-tight">Timeline</Text>
          <View className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
            {match.events.length === 0 ? (
              <View className="items-center py-4">
                <Text className="text-slate-400 font-bold italic">No events tracked</Text>
              </View>
            ) : (
              match.events.map((event, idx) => (
                <View key={event.id} className="flex-row mb-6 last:mb-0">
                  <View className="items-center mr-4">
                    <View className={`w-10 h-10 rounded-2xl items-center justify-center ${event.teamId === match.matchSetup.myTeam.teamId ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      {event.eventType === 'goal' && <Ionicons name="football" size={18} color="#10b981" />}
                      {event.eventType === 'card' && <Ionicons name="card" size={18} color={event.eventSubType === 'yellow_card' ? '#eab308' : '#ef4444'} />}
                      {event.eventType === 'substitution' && <Ionicons name="swap-horizontal" size={18} color="#3b82f6" />}
                    </View>
                    {idx !== match.events.length - 1 && <View className="w-[1.5px] flex-1 bg-slate-100 my-2" />}
                  </View>
                  <View className="flex-1 justify-center">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-slate-900 font-black text-sm">{event.playerName}</Text>
                      <Text className="text-blue-500 font-black text-xs italic">{event.minute}'</Text>
                    </View>
                    <Text className="text-slate-400 font-bold text-[9px] uppercase tracking-tighter">
                      {event.eventType.replace('_', ' ')} {event.eventSubType ? `• ${event.eventSubType.replace('_', ' ')}` : ''}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* --- NOTES --- */}
        {match.notes && (
          <View className="px-6 mb-12">
            <View className="bg-slate-900 p-8 rounded-[40px] shadow-lg">
              <View className="flex-row items-center mb-3">
                <Ionicons name="document-text" size={16} color="#3b82f6" />
                <Text className="text-white font-black italic uppercase ml-2 text-xs tracking-widest">Match Notes</Text>
              </View>
              <Text className="text-slate-400 text-xs leading-5 font-medium">{match.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}