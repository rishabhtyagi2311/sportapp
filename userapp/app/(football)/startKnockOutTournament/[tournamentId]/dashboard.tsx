import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  Alert, 
  FlatList,
  RefreshControl 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// IMPORTS
import { useKnockoutStore, KnockoutFixture } from '@/store/knockoutTournamentStore';
import KnockoutBracket from '@/components/tournament/KnockOutBracket';

type TabKey = 'current' | 'bracket' | 'results';

export default function KnockoutDashboard() {
  const router = useRouter();
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  
  // Store Actions
  const { 
    getTournament, 
    initializeMatch, 
    deleteKnockoutTournament,
    getFixturesByRound,
    getTournamentProgress
  } = useKnockoutStore();

  const [activeTab, setActiveTab] = useState<TabKey>('current');
  const [refreshing, setRefreshing] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Hack to force re-render on store updates

  // 1. Fetch Data
  const tournament = useMemo(() => getTournament(tournamentId), [tournamentId, getTournament, forceUpdate]);
  const progress = useMemo(() => getTournamentProgress(tournamentId), [tournamentId, getTournamentProgress, forceUpdate]);
  
  // 2. Get Fixtures for Current Round
  const currentRoundFixtures = useMemo(() => {
    if (!tournament) return [];
    return getFixturesByRound(tournament.id, tournament.currentRound);
  }, [tournament, getFixturesByRound, forceUpdate]);

  // 3. Get All Completed Fixtures (for Results tab)
  const completedFixtures = useMemo(() => {
    if (!tournament) return [];
    return tournament.fixtures
      .filter(f => f.status === 'completed')
      .sort((a, b) => b.matchNumber - a.matchNumber); // Newest first
  }, [tournament, forceUpdate]);

  // Handle Pull to Refresh
  const onRefresh = () => {
    setRefreshing(true);
    setForceUpdate(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 500);
  };

  // --- ACTIONS ---

  const handlePlayMatch = (fixture: KnockoutFixture) => {
    // A. Validation
    if (!fixture.homeTeamId || !fixture.awayTeamId) {
      Alert.alert('Not Ready', 'Waiting for previous round winners to be decided.');
      return;
    }

    if (fixture.status === 'completed') {
       return; // Should typically allow viewing details
    }

    // B. Initialize Match in Store
    initializeMatch(tournament!.id, fixture.id);

    // C. Navigate
    router.push({
      pathname: `/(football)/startKnockOutTournament/${tournamentId}/selectPlayers`,
      params: {  fixtureId: fixture.id }
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete Tournament', 'Are you sure? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
          deleteKnockoutTournament(tournamentId);
          router.replace('/(football)/landingScreen/tournament');
      }}
    ]);
  };

  if (!tournament) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500 mb-4">Tournament not found</Text>
        <TouchableOpacity onPress={() => router.navigate("/(football)/landingScreen/tournament")} className="bg-blue-600 px-6 py-3 rounded-full">
            <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- RENDERERS ---

  const renderStatusPill = (status: string) => {
      let color = 'bg-slate-100 text-slate-600';
      if (status === 'active') color = 'bg-green-100 text-green-700';
      if (status === 'completed') color = 'bg-blue-100 text-blue-700';
      
      return (
          <View className={`px-2 py-1 rounded ${color.split(' ')[0]}`}>
             <Text className={`text-xs font-bold uppercase ${color.split(' ')[1]}`}>{status}</Text>
          </View>
      );
  };

  const renderMatchCard = (item: KnockoutFixture, showAction = true) => {
    const isReady = item.homeTeamId && item.awayTeamId;
    const isCompleted = item.status === 'completed';

    return (
        <View key={item.id} className="bg-white rounded-xl border border-slate-200 mb-4 overflow-hidden shadow-sm">
            {/* Header */}
            <View className="bg-slate-50 px-4 py-2 flex-row justify-between items-center border-b border-slate-100">
                <Text className="text-xs font-bold text-slate-500 uppercase">
                    Match {item.matchNumber} • {item.stage.replace('_', ' ')}
                </Text>
                {isCompleted ? (
                     <View className="flex-row items-center">
                         <Ionicons name="checkmark-circle" size={14} color="#15803d" />
                         <Text className="text-xs font-bold text-green-700 ml-1">Final</Text>
                     </View>
                ) : (
                    <Text className="text-xs font-medium text-slate-400">
                        {isReady ? 'Ready to play' : 'Waiting...'}
                    </Text>
                )}
            </View>

            {/* Content */}
            <View className="p-4">
                <View className="flex-row items-center justify-between">
                    {/* Home Team */}
                    <View className="flex-1 items-center">
                         <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center mb-2">
                             <Ionicons name="shield-outline" size={20} color="#2563eb" />
                         </View>
                         <Text className="text-sm font-bold text-slate-900 text-center" numberOfLines={2}>
                             {item.homeTeamName || 'TBD'}
                         </Text>
                    </View>

                    {/* VS / Score */}
                    <View className="mx-4 items-center">
                        {isCompleted ? (
                            <View className="bg-slate-100 px-3 py-1 rounded-lg">
                                <Text className="text-lg font-black text-slate-900">
                                    {item.homeScore} - {item.awayScore}
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-lg font-bold text-slate-300">VS</Text>
                        )}
                    </View>

                    {/* Away Team */}
                    <View className="flex-1 items-center">
                         <View className="w-10 h-10 bg-red-50 rounded-lg items-center justify-center mb-2">
                             <Ionicons name="shield-outline" size={20} color="#dc2626" />
                         </View>
                         <Text className="text-sm font-bold text-slate-900 text-center" numberOfLines={2}>
                             {item.awayTeamName || 'TBD'}
                         </Text>
                    </View>
                </View>
                
                {/* Action Button */}
                {showAction && !isCompleted && isReady && (
                    <TouchableOpacity 
                        onPress={() => handlePlayMatch(item)}
                        className="mt-4 bg-blue-600 py-3 rounded-lg flex-row items-center justify-center"
                    >
                        <Ionicons name="play" size={18} color="white" />
                        <Text className="text-white font-bold ml-2">Play Match</Text>
                    </TouchableOpacity>
                )}

                {showAction && !isCompleted && !isReady && (
                    <View className="mt-4 bg-slate-50 py-3 rounded-lg items-center border border-slate-100">
                        <Text className="text-slate-400 text-xs font-medium">Waiting for previous round</Text>
                    </View>
                )}
            </View>
        </View>
    );
  };

  // --- MAIN LAYOUT ---

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* 1. Header Area */}
      <View className="bg-white border-b border-slate-200">
         <View className="px-4 py-4">
             {/* Top Row: Back & Options */}
             <View className="flex-row items-center justify-between mb-4">
                 <TouchableOpacity onPress={() => router.back()} className="p-1">
                     <Ionicons name="arrow-back" size={24} color="#0f172a" />
                 </TouchableOpacity>
                 <TouchableOpacity onPress={handleDelete} className="p-1">
                     <Ionicons name="trash-outline" size={22} color="#ef4444" />
                 </TouchableOpacity>
             </View>

             {/* Tournament Info */}
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

             {/* Progress Bar */}
             <View className="mt-5">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-xs font-bold text-slate-600">Tournament Progress</Text>
                    <Text className="text-xs font-bold text-slate-900">{progress}%</Text>
                </View>
                <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <View className="h-full bg-orange-500" style={{ width: `${progress}%` }} />
                </View>
             </View>
         </View>

         {/* Stats Row */}
         <View className="flex-row border-t border-slate-100">
             <View className="flex-1 items-center py-3 border-r border-slate-100">
                 <Text className="text-lg font-bold text-slate-900">{tournament.teams.filter(t => t.status === 'active').length}</Text>
                 <Text className="text-xs text-slate-500">Active Teams</Text>
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
             <TouchableOpacity 
                onPress={() => setActiveTab('current')}
                className={`flex-1 pb-3 items-center border-b-2 ${activeTab === 'current' ? 'border-orange-600' : 'border-transparent'}`}
             >
                 <Text className={`font-bold ${activeTab === 'current' ? 'text-orange-600' : 'text-slate-500'}`}>Current Round</Text>
             </TouchableOpacity>
             <TouchableOpacity 
                onPress={() => setActiveTab('bracket')}
                className={`flex-1 pb-3 items-center border-b-2 ${activeTab === 'bracket' ? 'border-orange-600' : 'border-transparent'}`}
             >
                 <Text className={`font-bold ${activeTab === 'bracket' ? 'text-orange-600' : 'text-slate-500'}`}>Bracket</Text>
             </TouchableOpacity>
             <TouchableOpacity 
                onPress={() => setActiveTab('results')}
                className={`flex-1 pb-3 items-center border-b-2 ${activeTab === 'results' ? 'border-orange-600' : 'border-transparent'}`}
             >
                 <Text className={`font-bold ${activeTab === 'results' ? 'text-orange-600' : 'text-slate-500'}`}>Results</Text>
             </TouchableOpacity>
         </View>
      </View>

      {/* 2. Content Area */}
      <View className="flex-1">
          {activeTab === 'current' && (
              <FlatList
                 data={currentRoundFixtures}
                 keyExtractor={item => item.id}
                 contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                 ListHeaderComponent={
                     <View className="mb-4">
                         <Text className="text-lg font-bold text-slate-800">Round {tournament.currentRound}</Text>
                         <Text className="text-slate-500 text-sm">
                             {currentRoundFixtures.every(f => f.status === 'completed') 
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
                     // Only allow navigation if playable
                     if (fixture.status !== 'completed' && fixture.homeTeamId && fixture.awayTeamId) {
                         handlePlayMatch(fixture);
                     }
                 }}
              />
          )}

          {activeTab === 'results' && (
              <FlatList
                 data={completedFixtures}
                 keyExtractor={item => item.id}
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
    </SafeAreaView>
  );
}