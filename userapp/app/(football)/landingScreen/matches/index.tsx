
import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMatchExecutionStore, CompletedMatch } from '@/store/footballMatchEventStore';

export default function MatchesScreen() {
  const router = useRouter();
  const { completedMatches, getCompletedMatches } = useMatchExecutionStore();
  
  console.log('⚽ Matches screen is rendering');
  
  const handleCreateMatch = () => {
    console.log('About to navigate to:', "/(football)/startMatch/selectTeams");
    console.log('Router state:', router);
    router.push("/(football)/startMatch/selectTeams");
  };

  const handleViewMatch = useCallback((matchId: string) => {
    // Navigate to match details view
    router.push(`/(football)/matchDetails/${matchId}`);
  }, [router]);

  // Group matches by date
  const groupedMatches = useMemo(() => {
    const sorted = [...completedMatches].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const grouped: { [key: string]: CompletedMatch[] } = {};
    
    sorted.forEach(match => {
      const dateKey = new Date(match.createdAt).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(match);
    });
    return grouped;
  }, [completedMatches]);

  // Get match result text and color
  const getMatchResult = useCallback((match: CompletedMatch) => {
    const isHomeWin = match.homeTeamScore > match.awayTeamScore;
    const isDraw = match.homeTeamScore === match.awayTeamScore;
    
    if (isDraw) {
      return { text: 'Draw', color: 'text-slate-600', bgColor: 'bg-slate-100' };
    } else if (isHomeWin) {
      return { text: 'Win', color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    } else {
      return { text: 'Loss', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
  }, []);

  // Format match duration
  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  // Get top events for preview
  const getTopEvents = useCallback((match: CompletedMatch) => {
    const goals = match.events.filter(e => e.eventType === 'goal');
    const cards = match.events.filter(e => e.eventType === 'card');
    
    return {
      goals: goals.length,
      cards: cards.length,
      totalEvents: match.events.length
    };
  }, []);

  // Render match card
  const renderMatchCard = useCallback((match: CompletedMatch) => {
    const result = getMatchResult(match);
    const events = getTopEvents(match);
    
    return (
      <TouchableOpacity
        key={match.id}
        onPress={() => handleViewMatch(match.id)}
        activeOpacity={0.9}
        className="bg-white rounded-xl p-4 mb-3 border border-slate-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        {/* Header Row */}
        <View className="flex-row items-center justify-between mb-3">
          <View className={`px-2 py-1 rounded-md ${result.bgColor}`}>
            <Text className={`font-semibold text-xs ${result.color}`}>
              {result.text.toUpperCase()}
            </Text>
          </View>
          
          <View className="flex-row items-center space-x-3">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1 font-medium">
                {match.venue}
              </Text>
            </View>
            <Text className="text-slate-400 text-xs mx-2">
              {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {/* Main Content Row */}
        <View className="flex-row items-center justify-between">
          {/* Home Team */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-emerald-500 rounded-lg items-center justify-center mr-2">
                <Ionicons name="shield" size={14} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>
                  {match.matchSetup.myTeam.teamName}
                </Text>
                <Text className="text-slate-500 text-xs">HOME</Text>
              </View>
            </View>
          </View>

          {/* Score */}
          <View className="mx-4 items-center">
            <View className="flex-row items-center bg-slate-50 rounded-lg px-3 py-1">
              <Text className="text-xl font-bold text-slate-900">{match.homeTeamScore}</Text>
              <Text className="text-lg font-medium text-slate-400 mx-2">-</Text>
              <Text className="text-xl font-bold text-slate-900">{match.awayTeamScore}</Text>
            </View>
            <Text className="text-slate-400 text-xs mt-1">FINAL</Text>
          </View>

          {/* Away Team */}
          <View className="flex-1">
            <View className="flex-row items-center justify-end">
              <View className="flex-1 items-end">
                <Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>
                  {match.matchSetup.opponentTeam.teamName}
                </Text>
                <Text className="text-slate-500 text-xs">AWAY</Text>
              </View>
              <View className="w-8 h-8 bg-red-500 rounded-lg items-center justify-center ml-2">
                <Ionicons name="flag" size={14} color="white" />
              </View>
            </View>
          </View>
        </View>

        {/* Footer Row */}
        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <View className="flex-row items-center space-x-3">
            {events.goals > 0 && (
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-emerald-100 rounded items-center justify-center mr-1">
                  <Ionicons name="football" size={8} color="#10b981" />
                </View>
                <Text className="text-slate-600 text-xs font-medium">{events.goals}</Text>
              </View>
            )}
            {events.cards > 0 && (
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-red-100 rounded items-center justify-center mr-1">
                  <Ionicons name="card" size={8} color="#ef4444" />
                </View>
                <Text className="text-slate-600 text-xs font-medium">{events.cards}</Text>
              </View>
            )}
            <Text className="text-slate-400 text-xs">{formatDuration(match.actualDuration)}</Text>
          </View>
          
          <View className="flex-row items-center">
            {match.events.filter(e => e.eventType === 'goal' && e.eventSubType !== 'own_goal').length > 0 && (
              <Text className="text-slate-500 text-xs mr-2">
                {match.events.filter(e => e.eventType === 'goal' && e.eventSubType !== 'own_goal')[0]?.playerName} +{match.events.filter(e => e.eventType === 'goal' && e.eventSubType !== 'own_goal').length - 1 > 0 ? (match.events.filter(e => e.eventType === 'goal' && e.eventSubType !== 'own_goal').length - 1) : ''}
              </Text>
            )}
            <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [getMatchResult, getTopEvents, formatDuration, handleViewMatch]);

  // Empty State Component
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-6">
      <View className="items-center">
        <View className="w-28 h-28 bg-slate-100 rounded-full justify-center items-center mb-8">
          <Ionicons name="football-outline" size={48} color="#64748b" />
        </View>
        
        <Text className="text-2xl font-bold text-slate-900 mb-3 text-center">
          No Matches Yet
        </Text>
        <Text className="text-slate-600 text-center leading-6 max-w-sm mb-8">
          You haven't completed any matches yet. Start by creating your first match to track games and build your match history.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {completedMatches.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Header */}
          <View className="bg-white px-6 py-6 border-b border-slate-100">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-bold text-slate-900">
                  Match History
                </Text>
                <Text className="text-slate-600 mt-1">
                  {completedMatches.length} match{completedMatches.length !== 1 ? 'es' : ''} played
                </Text>
              </View>
              
              <View className="bg-slate-100 px-4 py-2 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="trophy" size={16} color="#64748b" />
                  <Text className="text-slate-600 font-semibold ml-2">
                    {completedMatches.filter(m => m.homeTeamScore > m.awayTeamScore).length}W
                  </Text>
                  <Text className="text-slate-400 mx-1">•</Text>
                  <Text className="text-slate-600 font-semibold">
                    {completedMatches.filter(m => m.homeTeamScore === m.awayTeamScore).length}D
                  </Text>
                  <Text className="text-slate-400 mx-1">•</Text>
                  <Text className="text-slate-600 font-semibold">
                    {completedMatches.filter(m => m.homeTeamScore < m.awayTeamScore).length}L
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Matches List */}
          <ScrollView 
            className="flex-1 px-4 pt-4"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={() => {
                  // Refresh logic if needed
                }}
              />
            }
          >
            {Object.entries(groupedMatches).map(([dateKey, matches]) => (
              <View key={dateKey} className="mb-6">
                {/* Date Header */}
                <View className="flex-row items-center mb-3">
                  <Text className="text-sm font-bold text-slate-700">
                    {new Date(dateKey).toLocaleDateString([], { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </Text>
                  <View className="flex-1 h-px bg-slate-200 ml-3" />
                </View>
                
                {/* Matches for this date */}
                {matches.map(renderMatchCard)}
              </View>
            ))}
            
            {/* Bottom spacing */}
            <View className="h-24" />
          </ScrollView>
        </>
      )}

      {/* Floating Create Button */}
      <TouchableOpacity
        onPress={handleCreateMatch}
        className="absolute bottom-6 right-6 w-16 h-16 bg-slate-900 rounded-full justify-center items-center shadow-lg"
        activeOpacity={0.8}
        style={{
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}