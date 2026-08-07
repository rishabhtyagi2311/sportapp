import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTournamentStore } from '@/store/tournamentStore';
import { useAuthStore } from '@/store/authStore';
import { useDebouncedFocusFetch } from '@/hooks/useDebouncedFocusFetch';
import { TournamentFixture } from '@/types/football';
import KnockoutBracket from '@/components/tournament/KnockOutBracket';
import SetFixtureScheduleModal from '@/components/football/SetFixtureScheduleModal';

type TabKey = 'current' | 'bracket' | 'results';

export default function KnockoutDashboard() {
  const router = useRouter();
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();

  const { getTournament, fetchTournamentById, deleteTournament, setFixtureSchedule, getTournamentProgress, isLoading } = useTournamentStore();
  const currentUser = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<TabKey>('current');
  const [refreshing, setRefreshing] = useState(false);
  const [schedulingFixture, setSchedulingFixture] = useState<TournamentFixture | null>(null);

  useDebouncedFocusFetch(() => {
    if (tournamentId) fetchTournamentById(tournamentId);
  }, 15_000, tournamentId);

  const tournament = getTournament(tournamentId);
  const isCreator = !!currentUser && tournament?.creatorId === currentUser.id;
  const progress = useMemo(() => (tournamentId ? getTournamentProgress(tournamentId) : { completed: 0, total: 0 }), [tournamentId, tournament]);
  const progressPercent = progress.total === 0 ? 0 : Math.round((progress.completed / progress.total) * 100);

  const currentRoundFixtures = useMemo(() => {
    if (!tournament) return [];
    return tournament.fixtures.filter((f) => f.round === tournament.currentRound);
  }, [tournament]);

  const completedFixtures = useMemo(() => {
    if (!tournament) return [];
    return tournament.fixtures.filter((f) => f.status === 'completed');
  }, [tournament]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (tournamentId) await fetchTournamentById(tournamentId);
    setRefreshing(false);
  };

  const handlePlayMatch = (fixture: TournamentFixture) => {
    if (!fixture.homeTeamId || !fixture.awayTeamId) {
      Alert.alert('Not Ready', 'Waiting for previous round winners to be decided.');
      return;
    }
    if (fixture.status === 'completed') return;

    router.push({
      pathname: '/(football)/startKnockOutTournament/[tournamentId]/selectPlayers',
      params: { tournamentId, fixtureId: fixture.id },
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete Tournament', 'Are you sure? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTournament(tournamentId);
            router.replace('/(football)/landingScreen/tournament');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Could not delete tournament');
          }
        },
      },
    ]);
  };

  if (isLoading && !tournament) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0f172a" />
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500 mb-4">Tournament not found</Text>
        <TouchableOpacity onPress={() => router.navigate('/(football)/landingScreen/tournament')} className="bg-slate-900 px-6 py-3 rounded-full">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderStatusPill = (status: string) => {
    let color = 'bg-slate-100 text-slate-600';
    if (status === 'ongoing') color = 'bg-green-100 text-green-700';
    if (status === 'completed') color = 'bg-blue-100 text-blue-700';

    return (
      <View className={`px-2 py-1 rounded ${color.split(' ')[0]}`}>
        <Text className={`text-xs font-bold uppercase ${color.split(' ')[1]}`}>{status}</Text>
      </View>
    );
  };

  const renderMatchCard = (item: TournamentFixture, showAction = true) => {
    const isReady = item.homeTeamId && item.awayTeamId;
    const isCompleted = item.status === 'completed';

    const cardContent = (
      <View className="bg-white rounded-xl border border-slate-200 mb-4 overflow-hidden shadow-sm">
        {/* Header */}
        <View className="bg-slate-50 px-4 py-2 flex-row justify-between items-center border-b border-slate-100">
          <Text className="text-xs font-bold text-slate-500 uppercase">Round {item.round}</Text>
          {isCompleted ? (
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={14} color="#15803d" />
              <Text className="text-xs font-bold text-green-700 ml-1">Final</Text>
            </View>
          ) : (
            <Text className="text-xs font-medium text-slate-400">{isReady ? 'Ready to play' : 'Waiting...'}</Text>
          )}
        </View>

        {/* Content */}
        <View className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 items-center">
              <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center mb-2">
                <Ionicons name="shield-outline" size={20} color="#2563eb" />
              </View>
              <Text className="text-sm font-bold text-slate-900 text-center" numberOfLines={2}>
                {item.homeTeam?.name || 'TBD'}
              </Text>
            </View>

            <View className="mx-4 items-center">
              <Text className="text-lg font-bold text-slate-300">VS</Text>
            </View>

            <View className="flex-1 items-center">
              <View className="w-10 h-10 bg-red-50 rounded-lg items-center justify-center mb-2">
                <Ionicons name="shield-outline" size={20} color="#dc2626" />
              </View>
              <Text className="text-sm font-bold text-slate-900 text-center" numberOfLines={2}>
                {item.awayTeam?.name || 'TBD'}
              </Text>
            </View>
          </View>

          {showAction && !isCompleted && isReady && item.scheduledAt && (
            <View className="mt-4 flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">
                {new Date(item.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} ·{' '}
                {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {(item.venueName || tournament?.venueName) && ` · ${item.venueName || tournament?.venueName}`}
              </Text>
            </View>
          )}

          {showAction && !isCompleted && isReady && (
            <View className="flex-row mt-4" style={{ gap: 8 }}>
              {isCreator && (
                <TouchableOpacity onPress={() => handlePlayMatch(item)} className="flex-1 bg-blue-600 py-3 rounded-lg flex-row items-center justify-center">
                  <Ionicons name="play" size={18} color="white" />
                  <Text className="text-white font-bold ml-2">Play Match</Text>
                </TouchableOpacity>
              )}
              {isCreator && (
                <TouchableOpacity onPress={() => setSchedulingFixture(item)} className="flex-1 bg-amber-100 py-3 rounded-lg items-center justify-center">
                  <Text className="text-amber-700 font-bold">{item.scheduledAt ? 'Edit Schedule' : 'Set Schedule'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {showAction && !isCompleted && !isReady && (
            <View className="mt-4 bg-slate-50 py-3 rounded-lg items-center border border-slate-100">
              <Text className="text-slate-400 text-xs font-medium">Waiting for previous round</Text>
            </View>
          )}

          {isCompleted && !showAction && (
            <View className="mt-3 flex-row items-center justify-center">
              <Text className="text-xs text-slate-400">Tap to view match details</Text>
              <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
            </View>
          )}
        </View>
      </View>
    );

    if (isCompleted && item.matchId) {
      return (
        <TouchableOpacity
          key={item.id}
          onPress={() => router.push({ pathname: '/(football)/matchDetails/[matchId]', params: { matchId: item.matchId! } })}
        >
          {cardContent}
        </TouchableOpacity>
      );
    }

    return <View key={item.id}>{cardContent}</View>;
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white border-b border-slate-200">
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.navigate('/(football)/landingScreen/tournament')} className="p-1">
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            {tournament.status === 'draft' && isCreator && (
              <TouchableOpacity onPress={handleDelete} className="p-1">
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-2xl font-bold text-slate-900">{tournament.name}</Text>
              <View className="flex-row items-center mt-1">
                {renderStatusPill(tournament.status)}
                <Text className="text-xs text-slate-500 ml-2">Knockout Cup</Text>
              </View>
            </View>
            <View className="w-12 h-12 bg-orange-100 rounded-xl items-center justify-center">
              <Ionicons name="trophy" size={24} color="#ea580c" />
            </View>
          </View>

          <View className="mt-5">
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs font-bold text-slate-600">Tournament Progress</Text>
              <Text className="text-xs font-bold text-slate-900">{progressPercent}%</Text>
            </View>
            <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <View className="h-full bg-orange-500" style={{ width: `${progressPercent}%` }} />
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row border-t border-slate-100">
          <View className="flex-1 items-center py-3 border-r border-slate-100">
            <Text className="text-lg font-bold text-slate-900">{tournament.entries.length}</Text>
            <Text className="text-xs text-slate-500">Teams</Text>
          </View>
          <View className="flex-1 items-center py-3 border-r border-slate-100">
            <Text className="text-lg font-bold text-slate-900">{tournament.currentRound}</Text>
            <Text className="text-xs text-slate-500">Current Round</Text>
          </View>
          <View className="flex-1 items-center py-3">
            <Text className="text-lg font-bold text-slate-900">{tournament.fixtures.length}</Text>
            <Text className="text-xs text-slate-500">Total Matches</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row px-4 pt-2">
          <TouchableOpacity onPress={() => setActiveTab('current')} className={`flex-1 pb-3 items-center border-b-2 ${activeTab === 'current' ? 'border-orange-600' : 'border-transparent'}`}>
            <Text className={`font-bold ${activeTab === 'current' ? 'text-orange-600' : 'text-slate-500'}`}>Current Round</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('bracket')} className={`flex-1 pb-3 items-center border-b-2 ${activeTab === 'bracket' ? 'border-orange-600' : 'border-transparent'}`}>
            <Text className={`font-bold ${activeTab === 'bracket' ? 'text-orange-600' : 'text-slate-500'}`}>Bracket</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('results')} className={`flex-1 pb-3 items-center border-b-2 ${activeTab === 'results' ? 'border-orange-600' : 'border-transparent'}`}>
            <Text className={`font-bold ${activeTab === 'results' ? 'text-orange-600' : 'text-slate-500'}`}>Results</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        {tournament.status === 'draft' && isCreator && (
          <View className="px-4 pt-4">
            <TouchableOpacity
              onPress={async () => {
                try {
                  await useTournamentStore.getState().startTournament(tournamentId);
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'Could not start tournament');
                }
              }}
              className="bg-green-600 rounded-xl py-4 items-center flex-row justify-center"
            >
              <Ionicons name="play" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Start Tournament</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'current' && (
          <FlatList
            data={currentRoundFixtures}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={
              <View className="mb-4">
                <Text className="text-lg font-bold text-slate-800">Round {tournament.currentRound}</Text>
                <Text className="text-slate-500 text-sm">
                  {currentRoundFixtures.every((f) => f.status === 'completed')
                    ? 'Round Complete. Proceeding to next stage.'
                    : 'Play matches to advance winners.'}
                </Text>
              </View>
            }
            renderItem={({ item }) => renderMatchCard(item, true)}
            ListEmptyComponent={
              <View className="items-center py-10">
                <Text className="text-slate-400">No matches scheduled for this round.</Text>
              </View>
            }
          />
        )}

        {activeTab === 'bracket' && (
          <KnockoutBracket
            tournament={tournament}
            onPressMatch={(fixture) => {
              if (fixture.status === 'completed' && fixture.matchId) {
                router.push({ pathname: '/(football)/matchDetails/[matchId]', params: { matchId: fixture.matchId } });
              } else if (isCreator && fixture.status !== 'completed' && fixture.homeTeamId && fixture.awayTeamId) {
                handlePlayMatch(fixture);
              }
            }}
          />
        )}

        {activeTab === 'results' && (
          <FlatList
            data={completedFixtures}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => renderMatchCard(item, false)}
            ListEmptyComponent={
              <View className="items-center justify-center py-20 bg-white rounded-xl mx-4 mt-4 border border-slate-100 border-dashed">
                <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-3">
                  <Ionicons name="football-outline" size={32} color="#cbd5e1" />
                </View>
                <Text className="text-slate-500 font-medium">No matches completed yet</Text>
                <Text className="text-slate-400 text-xs mt-1">Play matches in the Current Round tab</Text>
              </View>
            }
          />
        )}
      </View>

      <SetFixtureScheduleModal
        visible={!!schedulingFixture}
        onClose={() => setSchedulingFixture(null)}
        defaultVenueName={schedulingFixture?.venueName ?? tournament.venueName}
        onSubmit={(data) => setFixtureSchedule(tournamentId, schedulingFixture!.id, data)}
      />
    </SafeAreaView>
  );
}
