import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { format, parseISO } from 'date-fns';

// Stores
import { useMatchSessionStore, MatchSession } from '@/store/matchSessionStore';
import { useResponsive } from '@/hooks/useResponsive';
import FadeInView from '@/components/animated/FadeInView';

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
/* -------------------------------------------------------------------------- */

const StatusBadge = ({ status }: { status: MatchSession['status'] }) => {
  const configs = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Gathering Players' },
    live: { bg: 'bg-green-100', text: 'text-green-700', label: 'Match Live' },
    cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Cancelled' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Finished' },
  };

  const config = configs[status] || configs.pending;

  return (
    <View className={`${config.bg} px-3 py-1 rounded-full`}>
      <Text className={`${config.text} text-[10px] font-bold uppercase`}>{config.label}</Text>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN VIEW                                                                  */
/* -------------------------------------------------------------------------- */

export default function VenueMatchSessionsView() {
  const router = useRouter();
  const { isTablet } = useResponsive();
  const { venueId } = useLocalSearchParams() as { venueId: string };
  
  const sessions = useMatchSessionStore((state) =>
    state.sessions.filter(s => s.venueId === venueId)
  );
  const { isLoading, fetchSessions, cancelSession, setSessionStatus } = useMatchSessionStore();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (venueId) fetchSessions(venueId);
    }, [venueId])
  );

  const handleCancelSession = (session: MatchSession) => {
    Alert.alert(
      'Cancel Match Session',
      'This will cancel the session and free up the slot for new bookings. Continue?',
      [
        { text: 'Keep Session', style: 'cancel' },
        {
          text: 'Cancel Session',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(session.id);
            try {
              await cancelSession(venueId, session.id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not cancel match session');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const handleSetStatus = async (session: MatchSession, status: 'live' | 'completed') => {
    setStatusUpdatingId(session.id);
    try {
      await setSessionStatus(venueId, session.id, status);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update match session status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Sort sessions by date (closest first)
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => 
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );
  }, [sessions]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="bg-white border-b border-slate-100 px-4 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900">Match Sessions</Text>
          {isLoading && <ActivityIndicator color="#2563eb" size="small" style={{ marginLeft: 12 }} />}
        </View>
        <TouchableOpacity
          className="p-2 bg-blue-50 rounded-full"
          onPress={() => router.push({ pathname: "/(venueManagement)/slotHandling/viewSlots", params: { venueId } })}
        >
          <Ionicons name="add" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className={isTablet ? 'self-center w-full max-w-2xl' : 'w-full'}>
        {sortedSessions.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="bg-slate-100 p-6 rounded-full mb-4">
              <FontAwesome5 name="calendar-times" size={40} color="#94a3b8" />
            </View>
            <Text className="text-slate-500 font-medium">No active match sessions found.</Text>
            <Text className="text-slate-400 text-xs mt-1">Create one from the Slot Manager.</Text>
          </View>
        ) : (
          sortedSessions.map((session, index) => {
            const progress = (session.playersJoined / session.totalPlayers) * 100;
            const isGathering = session.playersJoined < session.minPlayersForLive;

            return (
              <FadeInView
                key={session.id}
                delay={Math.min(index, 8) * 60}
                className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100"
              >
                {/* Top Row: Sport & Status */}
                <View className="flex-row justify-between items-start mb-4">
                  <View>
                    <Text className="text-slate-900 font-bold text-lg">{session.sport}</Text>
                    <View className="flex-row items-center mt-1">
                      <MaterialIcons name="event" size={14} color="#64748b" />
                      <Text className="text-slate-500 text-xs ml-1">
                        {format(parseISO(session.date), 'EEE, MMM do')} • {session.startTime}
                      </Text>
                    </View>
                  </View>
                  <StatusBadge status={session.status} />
                </View>

                {/* Progress Section */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Registration Progress
                    </Text>
                    <Text className="text-slate-900 font-bold">
                      {session.playersJoined} <Text className="text-slate-400">/ {session.totalPlayers}</Text>
                    </Text>
                  </View>
                  
                  {/* Progress Bar Background */}
                  <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    {/* The actual progress fill */}
                    <View 
                      className={`h-full rounded-full ${isGathering ? 'bg-amber-400' : 'bg-green-500'}`}
                      style={{ width: `${Math.max(progress, 5)}%` }} 
                    />
                  </View>

                  {isGathering && (
                    <Text className="text-amber-600 text-[10px] mt-2 font-medium">
                      {session.minPlayersForLive - session.playersJoined} more players needed to confirm match
                    </Text>
                  )}
                </View>

                {/* Bottom Stats */}
                <View className="flex-row border-t border-slate-50 pt-4 justify-between">
                  <View className="flex-row items-center">
                    <FontAwesome5 name="money-bill-wave" size={12} color="#10b981" />
                    <Text className="text-slate-600 text-xs ml-2 font-bold">₹{session.pricePerPerson}/head</Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons name="bolt" size={14} color="#f59e0b" />
                    <Text className="text-slate-600 text-xs ml-1 font-bold">{session.skillLevel}</Text>
                  </View>
                </View>

                {(session.status === 'pending' || session.status === 'live') && (
                  <View className="flex-row mt-4 pt-4 border-t border-slate-50">
                    {session.status === 'pending' && (
                      <TouchableOpacity
                        onPress={() => handleSetStatus(session, 'live')}
                        disabled={statusUpdatingId === session.id}
                        className="flex-1 flex-row items-center justify-center bg-green-50 rounded-xl py-2 mr-2"
                      >
                        {statusUpdatingId === session.id ? (
                          <ActivityIndicator size="small" color="#16a34a" />
                        ) : (
                          <>
                            <MaterialIcons name="play-circle-outline" size={16} color="#16a34a" />
                            <Text className="text-green-600 text-xs font-bold ml-1">Mark Live</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {session.status === 'live' && (
                      <TouchableOpacity
                        onPress={() => handleSetStatus(session, 'completed')}
                        disabled={statusUpdatingId === session.id}
                        className="flex-1 flex-row items-center justify-center bg-blue-50 rounded-xl py-2 mr-2"
                      >
                        {statusUpdatingId === session.id ? (
                          <ActivityIndicator size="small" color="#2563eb" />
                        ) : (
                          <>
                            <MaterialIcons name="check-circle-outline" size={16} color="#2563eb" />
                            <Text className="text-blue-600 text-xs font-bold ml-1">Mark Completed</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => handleCancelSession(session)}
                      disabled={cancellingId === session.id}
                      className="flex-1 flex-row items-center justify-center bg-red-50 rounded-xl py-2"
                    >
                      {cancellingId === session.id ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                      ) : (
                        <>
                          <MaterialIcons name="cancel" size={16} color="#ef4444" />
                          <Text className="text-red-500 text-xs font-bold ml-1">Cancel</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </FadeInView>
            )
          })
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}