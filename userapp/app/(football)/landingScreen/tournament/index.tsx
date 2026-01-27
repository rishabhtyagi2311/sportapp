import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Stores
import { useTournamentStore, Tournament } from '@/store/footballTournamentStore'; // Leagues
import { useKnockoutStore, KnockoutTournament } from '@/store/knockoutTournamentStore'; // Knockouts

export default function TournamentsScreen() {
  const router = useRouter();
  
  // 1. Fetch from BOTH stores
  const { tournaments: leagueTournaments, deleteTournament: deleteLeague } = useTournamentStore();
  const { tournaments: knockoutTournaments, deleteKnockoutTournament } = useKnockoutStore(); // Assuming you added delete action to store

  console.log('🏆 Tournaments screen is rendering');
  
  const handleCreateTournament = () => {
    router.push("/(football)/startTournament/formatSelectionScreen"); // Updated path
  };

  const handleViewTournament = (tournament: Tournament | KnockoutTournament) => {
    if (tournament.settings.format === 'knockout') {
        // Navigate to Knockout Dashboard
        router.push({
            pathname: `/(football)/startKnockOutTournament/${tournament.id}/dashboard`,
            params: { tournamentId: tournament.id }
        });
    } else {
        // Navigate to League Dashboard (Existing)
        router.push(`/(football)/startTournament/${tournament.id}`);
    }
  };

  const handleDeleteTournament = (tournament: Tournament | KnockoutTournament) => {
    Alert.alert(
      'Delete Tournament',
      `Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (tournament.settings.format === 'knockout') {
                // You need to ensure deleteKnockoutTournament exists in your store
                // If not, add it: deleteKnockoutTournament: (id) => set(state => { state.tournaments = state.tournaments.filter(t => t.id !== id) })
                useKnockoutStore.getState().deleteKnockoutTournament?.(tournament.id); // Safe call
            } else {
                deleteLeague(tournament.id);
            }
            console.log(`🗑️ Deleted tournament: ${tournament.name} (${tournament.id})`);
          },
        },
      ],
      { cancelable: true }
    );
  };

  // 2. Merge and Group Tournaments
  const groupedTournaments = useMemo(() => {
    // Combine lists
    // Note: We cast to 'any' here for simple merging if types slightly differ, 
    // but logically they share common fields (id, name, status, format).
    const allTournaments = [...leagueTournaments, ...knockoutTournaments];

    const active = allTournaments.filter(t => t.status === 'active');
    const draft = allTournaments.filter(t => t.status === 'draft');
    const completed = allTournaments.filter(t => t.status === 'completed');
    
    return { active, draft, completed };
  }, [leagueTournaments, knockoutTournaments]);

  const getProgressPercentage = (tournament: any) => {
    if (!tournament.fixtures || tournament.fixtures.length === 0) return 0;
    const completed = tournament.fixtures.filter((f: any) => f.status === 'completed').length;
    return Math.round((completed / tournament.fixtures.length) * 100);
  };

  const renderTournamentCard = (tournament: any) => {
    const progress = getProgressPercentage(tournament);
    const completedMatches = tournament.fixtures.filter((f: any) => f.status === 'completed').length;
    const isDraft = tournament.status === 'draft';
    const isKnockout = tournament.settings.format === 'knockout';

    return (
      <TouchableOpacity
        key={tournament.id}
        onPress={() => handleViewTournament(tournament)}
        className="bg-white rounded-xl p-4 mb-3 border border-slate-100 shadow-sm"
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
              <View className={`px-2 py-1 rounded ${isKnockout ? 'bg-orange-50' : 'bg-blue-50'}`}>
                <Text className={`text-xs font-semibold ${isKnockout ? 'text-orange-700' : 'text-blue-700'}`}>
                  {isKnockout ? 'KNOCKOUT' : 'LEAGUE'}
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className={`w-12 h-12 rounded-lg items-center justify-center ${isKnockout ? 'bg-orange-100' : 'bg-blue-100'}`}>
              <Ionicons 
                name={isKnockout ? "git-network-outline" : "list"} 
                size={20} 
                color={isKnockout ? "#ea580c" : "#2563eb"} 
              />
            </View>
            {isDraft && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteTournament(tournament);
                }}
                className="ml-2 w-12 h-12 bg-red-100 rounded-lg items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </TouchableOpacity>
            )}
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
              {tournament.settings.venue || 'TBD'}
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

        {tournament.status === 'completed' && tournament.winnerId && (
          <View className="mt-3 bg-amber-50 rounded-lg p-2 flex-row items-center">
            <Ionicons name="trophy" size={14} color="#f59e0b" />
            <Text className="text-xs font-semibold text-amber-900 ml-2">
              Winner: {isKnockout 
                ? tournament.teams.find((t: any) => t.id === tournament.winnerId)?.teamName 
                : tournament.winner 
              }
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // Empty State Component
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-6 mt-12">
      <View className="items-center">
        <View className="w-24 h-24 bg-slate-100 rounded-full justify-center items-center mb-6">
          <Ionicons name="trophy-outline" size={40} color="#64748b" />
        </View>
        
        <Text className="text-2xl font-bold text-slate-900 mb-3 text-center">
          No Tournaments Yet
        </Text>
        <Text className="text-slate-600 text-center leading-6 max-w-sm mb-8">
          You haven't created any tournaments yet. Start by organizing your first competition.
        </Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {groupedTournaments.active.length === 0 && 
       groupedTournaments.draft.length === 0 && 
       groupedTournaments.completed.length === 0 ? (
        <>
            {renderEmptyState()}
            {/* Floating Create Button */}
            <TouchableOpacity
                onPress={handleCreateTournament}
                className="absolute bottom-6 right-6 w-14 h-14 bg-slate-900 rounded-full justify-center items-center shadow-lg"
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
        </>
      ) : (
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
      )}

      {/* Floating Create Button (Visible even with content) */}
      {(groupedTournaments.active.length > 0 || groupedTournaments.draft.length > 0 || groupedTournaments.completed.length > 0) && (
          <TouchableOpacity
            onPress={handleCreateTournament}
            className="absolute bottom-6 right-6 w-14 h-14 bg-slate-900 rounded-full justify-center items-center shadow-lg"
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}