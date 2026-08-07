// app/(football)/landingScreen/matches.tsx
import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFootballMatches, DisplayMatch } from '@/hooks/useFootballMatches';
import { useFootballStore } from '@/store/footballTeamStore';
import { useAuthStore } from '@/store/authStore';
import { useMatchExecutionStore } from '@/store/footballMatchEventStore';
import { useMatchCreationStore } from '@/store/footballMatchCreationStore';

// Define allowed Ionicon names for TypeScript
type IoniconsName = 'football-outline' | 'timer-outline' | 'calendar-outline' | 'person-outline' | 
                    'shield' | 'flag' | 'trophy' | 'pulse' | 'calendar' | 'location-outline' |
                    'chevron-forward' | 'add' | 'arrow-back' | 'checkmark-circle-outline';

export default function MatchesScreen() {
  const router = useRouter();
  const { completed, live, upcoming, isLoading, isRefetching, refetch } = useFootballMatches();
  const { profile } = useFootballStore();
  const currentUser = useAuthStore((state) => state.user);
  const { resumeAsCreator } = useMatchExecutionStore();
  const { initializeFromScheduledMatch } = useMatchCreationStore();

  console.log('⚽ Matches screen is rendering');
  
  // Filter matches to only show those from teams the current player belongs to
  const filteredCompletedMatches = useMemo(() => {
    // For now, we're just returning all completed matches
    // We'll implement filtering logic later if needed
    return completed;
  }, [completed]);
  
  const handleCreateMatch = () => {
    try {
      console.log('About to navigate to:', "/(football)/startMatch/selectTeams");
      router.push("/(football)/startMatch/selectTeams");
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to create match screen.');
    }
  };

  const handleViewMatch = useCallback((matchId: string) => {
    try {
      console.log('Navigating to match details:', matchId);
      router.push({
        pathname: "/(football)/matchDetails/[matchId]",
        params: { matchId }
      });
    } catch (error) {
      console.error('Error navigating to match details:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to match details.');
    }
  }, [router]);

  const handleLiveMatchTap = useCallback(async (match: DisplayMatch) => {
    if (currentUser && match.creatorId === currentUser.id) {
      try {
        await resumeAsCreator(match.id);
        router.push('/(football)/startMatch/scoringScreen');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Could not resume match');
      }
      return;
    }
    handleViewMatch(match.id);
  }, [currentUser, resumeAsCreator, router, handleViewMatch]);

  const handleStartScheduledMatch = useCallback((match: DisplayMatch) => {
    initializeFromScheduledMatch({
      id: match.id,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      homeTeam: { name: match.homeTeamName },
      awayTeam: { name: match.awayTeamName },
      venueName: match.venue,
    });
    router.push('/(football)/startMatch/basicDetailsOne');
  }, [initializeFromScheduledMatch, router]);

  // Format match duration
  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  // Get match result text and color
  const getMatchResult = useCallback((match: DisplayMatch) => {
    const isHomeWin = (match.homeTeamScore || 0) > (match.awayTeamScore || 0);
    const isDraw = (match.homeTeamScore || 0) === (match.awayTeamScore || 0);
    
    if (isDraw) {
      return { text: 'Draw', color: 'text-slate-600', bgColor: 'bg-slate-100' };
    } else if (isHomeWin) {
      return { text: 'Win', color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    } else {
      return { text: 'Loss', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
  }, []);

  // Render match card
  const renderMatchCard = useCallback((match: DisplayMatch) => {
    if (!match) return null;
    
    const result = getMatchResult(match);
    
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
                {match.venue || 'TBD'}
              </Text>
            </View>
            <Text className="text-slate-400 text-xs mx-2">
              {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  {match.homeTeamName}
                </Text>
                <Text className="text-slate-500 text-xs">HOME</Text>
              </View>
            </View>
          </View>

          {/* Score */}
          <View className="mx-4 items-center">
            <View className="items-center">
              <View className="flex-row items-center bg-slate-50 rounded-lg px-3 py-1">
                <Text className="text-xl font-bold text-slate-900">{match.homeTeamScore || 0}</Text>
                <Text className="text-lg font-medium text-slate-400 mx-2">-</Text>
                <Text className="text-xl font-bold text-slate-900">{match.awayTeamScore || 0}</Text>
              </View>
              <Text className="text-slate-400 text-xs mt-1">
                FINAL
              </Text>
            </View>
          </View>

          {/* Away Team */}
          <View className="flex-1">
            <View className="flex-row items-center justify-end">
              <View className="flex-1 items-end">
                <Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>
                  {match.awayTeamName}
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
          <Text className="text-slate-400 text-xs">
            {formatDuration(match.duration ?? 0)}
          </Text>
          
          <View className="flex-row items-center">
            <Text className="text-slate-500 text-xs mr-1">View Details</Text>
            <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [getMatchResult, formatDuration, handleViewMatch]);

  const renderLiveCard = useCallback((match: DisplayMatch) => (
    <TouchableOpacity
      key={match.id}
      onPress={() => handleLiveMatchTap(match)}
      activeOpacity={0.9}
      className="bg-white rounded-xl p-4 mb-3 border-2 border-red-400"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center bg-red-500 px-2 py-1 rounded-md">
          <View className="w-1.5 h-1.5 bg-white rounded-full mr-1" />
          <Text className="text-white font-bold text-xs">LIVE</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={12} color="#64748b" />
          <Text className="text-slate-500 text-xs ml-1 font-medium">{match.venue || 'TBD'}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-slate-900 font-bold text-sm" numberOfLines={1}>{match.homeTeamName}</Text>
        <View className="bg-slate-50 rounded-lg px-3 py-1 mx-3">
          <Text className="text-lg font-bold text-slate-900">{match.homeTeamScore ?? 0} - {match.awayTeamScore ?? 0}</Text>
        </View>
        <Text className="flex-1 text-slate-900 font-bold text-sm text-right" numberOfLines={1}>{match.awayTeamName}</Text>
      </View>
      <View className="flex-row items-center justify-end mt-3 pt-3 border-t border-slate-50">
        <Text className="text-slate-500 text-xs mr-1">
          {currentUser && match.creatorId === currentUser.id ? 'Resume Scoring' : 'Watch Live'}
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  ), [handleLiveMatchTap, currentUser]);

  const renderUpcomingCard = useCallback((match: DisplayMatch) => {
    const isCreator = !!currentUser && match.creatorId === currentUser.id;
    return (
      <TouchableOpacity
        key={match.id}
        onPress={() => handleViewMatch(match.id)}
        activeOpacity={0.9}
        className="bg-white rounded-xl p-4 mb-3 border border-slate-100"
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="bg-amber-100 px-2 py-1 rounded-md">
            <Text className="text-amber-700 font-semibold text-xs">UPCOMING</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={12} color="#64748b" />
            <Text className="text-slate-500 text-xs ml-1 font-medium">{match.venue || 'TBD'}</Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="flex-1 text-slate-900 font-bold text-sm" numberOfLines={1}>{match.homeTeamName}</Text>
          <Text className="text-slate-400 font-bold mx-3">VS</Text>
          <Text className="flex-1 text-slate-900 font-bold text-sm text-right" numberOfLines={1}>{match.awayTeamName}</Text>
        </View>
        <View className="flex-row items-center justify-between pt-3 border-t border-slate-50">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text className="text-slate-500 text-xs ml-1">
              {match.date.toLocaleDateString([], { month: 'short', day: 'numeric' })} · {match.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {isCreator && (
            <TouchableOpacity
              onPress={() => handleStartScheduledMatch(match)}
              className="bg-slate-900 px-3 py-1.5 rounded-lg"
            >
              <Text className="text-white text-xs font-bold">Start Match</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [currentUser, handleViewMatch, handleStartScheduledMatch]);

  // Group completed matches by date
  const groupedCompletedMatches = useMemo(() => {
    // Sort completed matches by date (most recent first)
    const sortedCompletedMatches = [...filteredCompletedMatches].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Group by date string
    const groupedByDate: {[key: string]: DisplayMatch[]} = {};
    sortedCompletedMatches.forEach(match => {
      const dateKey = new Date(match.date).toDateString();
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(match);
    });
    
    return groupedByDate;
  }, [filteredCompletedMatches]);

  // Create empty state when no matches
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-6 mb-12">
      <View className="items-center">
        <View className="w-28 h-28 bg-slate-100 rounded-full justify-center items-center mb-8">
          <Ionicons name="football-outline" size={48} color="#64748b" />
        </View>
        
        <Text className="text-2xl font-bold text-slate-900 mb-3 text-center">
          No Matches Yet
        </Text>
        <Text className="text-slate-600 text-center leading-6 max-w-sm mb-8">
          You don't have any matches yet. Create or schedule a match to get started.
        </Text>
        
        {!profile && (
          <TouchableOpacity
            onPress={() => router.push('/(football)/createFootballProfile')}
            className="bg-blue-500 px-5 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Create Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Check if there are any matches at all
  const hasCompletedMatches = filteredCompletedMatches.length > 0;
  const hasAnyMatches = hasCompletedMatches || live.length > 0 || upcoming.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">

      {isLoading && !hasAnyMatches ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : !hasAnyMatches ? (
        renderEmptyState()
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
            />
          }
        >
          {/* LIVE MATCHES SECTION */}
          {live.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-bold text-slate-900 mb-3">Live Matches</Text>
              {live.map(renderLiveCard)}
            </View>
          )}

          {/* UPCOMING MATCHES SECTION */}
          {upcoming.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-bold text-slate-900 mb-3">Upcoming Matches</Text>
              {upcoming.map(renderUpcomingCard)}
            </View>
          )}

          {/* COMPLETED MATCHES SECTION */}
          <View className="mb-6">
            {hasCompletedMatches && (
              <Text className="text-sm font-bold text-slate-900 mb-3">Completed Matches</Text>
            )}
            {/* Render each date group */}
            {Object.entries(groupedCompletedMatches).map(([dateKey, matches]) => (
              <View key={dateKey} className="mb-4">
                {/* Date Header */}
                <View className="flex-row items-center mb-2">
                  <Text className="text-sm font-medium text-slate-700 ml-2">
                    {new Date(dateKey).toLocaleDateString([], { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </Text>
                  <View className="flex-1 h-px bg-slate-100 ml-3" />
                </View>
                
                {/* Matches for this date */}
                {matches.map(renderMatchCard)}
              </View>
            ))}
          </View>
          
          {/* Bottom spacing */}
          <View className="h-24" />
        </ScrollView>
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