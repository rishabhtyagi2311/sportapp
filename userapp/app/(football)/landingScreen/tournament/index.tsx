// app/(football)/tournaments/index.tsx
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTournamentStore, Tournament } from '@/store/footballTournamentStore';

export default function TournamentsScreen() {
  const router = useRouter();
  const { tournaments } = useTournamentStore();

  console.log('🏆 Tournaments screen is rendering');
  
  const handleCreateTournament = () => {
    console.log('About to navigate to:', "/(football)/tournaments/create");
    console.log('Router state:', router);
    router.navigate("/(football)/startTournament/createTournament");
  };

  const handleViewTournament = (tournamentId: string) => {
    router.navigate(`/(football)/startTournament/${tournamentId}`);
  };

  // Group tournaments by status
  const groupedTournaments = useMemo(() => {
    const active = tournaments.filter(t => t.status === 'active');
    const draft = tournaments.filter(t => t.status === 'draft');
    const completed = tournaments.filter(t => t.status === 'completed');
    
    return { active, draft, completed };
  }, [tournaments]);

  const getProgressPercentage = (tournament: Tournament) => {
    if (tournament.fixtures.length === 0) return 0;
    const completed = tournament.fixtures.filter(f => f.status === 'completed').length;
    return Math.round((completed / tournament.fixtures.length) * 100);
  };

  const renderTournamentCard = (tournament: Tournament) => {
    const progress = getProgressPercentage(tournament);
    const completedMatches = tournament.fixtures.filter(f => f.status === 'completed').length;

    return (
      <TouchableOpacity
        key={tournament.id}
        onPress={() => handleViewTournament(tournament.id)}
        className="bg-white rounded-xl p-4 mb-3 border border-slate-100"
        activeOpacity={0.7}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-base font-bold text-slate-900 mb-1" numberOfLines={1}>
              {tournament.name}
            </Text>
            <View className="flex-row items-center flex-wrap">
              <View className={`px-2 py-1 rounded mr-2 ${
                tournament.status === 'active' ? 'bg-green-100' :
                tournament.status === 'completed' ? 'bg-blue-100' :
                'bg-slate-100'
              }`}>
                <Text className={`text-xs font-semibold ${
                  tournament.status === 'active' ? 'text-green-700' :
                  tournament.status === 'completed' ? 'text-blue-700' :
                  'text-slate-600'
                }`}>
                  {tournament.status.toUpperCase()}
                </Text>
              </View>
              <View className="bg-amber-50 px-2 py-1 rounded">
                <Text className="text-xs font-semibold text-amber-700">
                  {tournament.format === 'league' ? 'LEAGUE' : 'KNOCKOUT'}
                </Text>
              </View>
            </View>
          </View>
          <View className="w-12 h-12 bg-amber-100 rounded-lg items-center justify-center">
            <Ionicons name="trophy" size={20} color="#f59e0b" />
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row items-center mb-3">
          <View className="flex-1 flex-row items-center">
            <Ionicons name="people" size={14} color="#64748b" />
            <Text className="text-xs text-slate-600 ml-1 font-medium">{tournament.teams.length} Teams</Text>
          </View>
          <View className="flex-1 flex-row items-center">
            <Ionicons name="calendar" size={14} color="#64748b" />
            <Text className="text-xs text-slate-600 ml-1 font-medium">
              {completedMatches}/{tournament.fixtures.length} Matches
            </Text>
          </View>
          <View className="flex-1 flex-row items-center">
            <Ionicons name="location" size={14} color="#64748b" />
            <Text className="text-xs text-slate-600 ml-1 font-medium" numberOfLines={1}>
              {tournament.settings.venue}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        {tournament.status !== 'draft' && (
          <View>
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs text-slate-500">Progress</Text>
              <Text className="text-xs font-bold text-slate-700">{progress}%</Text>
            </View>
            <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <View 
                className={`h-full ${
                  tournament.status === 'completed' ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>
        )}

        {tournament.status === 'completed' && tournament.winner && (
          <View className="mt-3 bg-amber-50 rounded-lg p-2 flex-row items-center">
            <Ionicons name="trophy" size={14} color="#f59e0b" />
            <Text className="text-xs font-semibold text-amber-900 ml-2">
              Winner: {tournament.winner}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // Empty State Component
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-6">
      <View className="items-center">
        <View className="w-24 h-24 bg-slate-100 rounded-full justify-center items-center mb-6">
          <Ionicons name="trophy-outline" size={40} color="#64748b" />
        </View>
        
        <Text className="text-2xl font-bold text-slate-900 mb-3 text-center">
          No Tournaments Yet
        </Text>
        <Text className="text-slate-600 text-center leading-6 max-w-sm mb-8">
          You haven't created any tournaments yet. Start by organizing your first competition with multiple teams.
        </Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {tournaments.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Header */}
          <View className="bg-white px-6 py-6 border-b border-slate-100">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-bold text-slate-900">Tournaments</Text>
                <Text className="text-slate-600 mt-1">
                  {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Tournaments List */}
          <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
            {/* Active Tournaments */}
            {groupedTournaments.active.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <Text className="text-sm font-bold text-slate-700">Active Tournaments</Text>
                </View>
                {groupedTournaments.active.map(renderTournamentCard)}
              </View>
            )}

            {/* Draft Tournaments */}
            {groupedTournaments.draft.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-2 h-2 bg-slate-400 rounded-full mr-2" />
                  <Text className="text-sm font-bold text-slate-700">Draft Tournaments</Text>
                </View>
                {groupedTournaments.draft.map(renderTournamentCard)}
              </View>
            )}

            {/* Completed Tournaments */}
            {groupedTournaments.completed.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  <Text className="text-sm font-bold text-slate-700">Completed Tournaments</Text>
                </View>
                {groupedTournaments.completed.map(renderTournamentCard)}
              </View>
            )}

            <View className="h-24" />
          </ScrollView>
        </>
      )}

      {/* Floating Create Button */}
      <TouchableOpacity
        onPress={handleCreateTournament}
        className="absolute bottom-6 right-6 w-14 h-14 bg-slate-900 rounded-full justify-center items-center shadow-lg"
        activeOpacity={0.8}
        style={{
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}