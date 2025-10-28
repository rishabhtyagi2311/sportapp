// app/(football)/landingScreen/matches.tsx
import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFootballMatches, DisplayMatch } from '@/hooks/useFootballMatches';
import { useFootballStore } from '@/store/footballTeamStore';

// Define allowed Ionicon names for TypeScript
type IoniconsName = 'football-outline' | 'timer-outline' | 'calendar-outline' | 'person-outline' | 
                    'shield' | 'flag' | 'trophy' | 'pulse' | 'calendar' | 'location-outline' |
                    'chevron-forward' | 'add' | 'arrow-back' | 'checkmark-circle-outline';

export default function MatchesScreen() {
  const router = useRouter();
  const { completed, live, upcoming } = useFootballMatches();
  const { currentPlayer, teams } = useFootballStore();
  
  console.log('⚽ Matches screen is rendering');
  
  // Filter matches to only show those from teams the current player belongs to
  const filteredMatches = useMemo(() => {
    // If no current player, return all matches
    if (!currentPlayer) {
      return { completed, live, upcoming };
    }

    // Get teams the player belongs to
    const playerTeamIds = teams
      .filter(team => team.memberPlayerIds?.includes(currentPlayer.id))
      .map(team => team.id);
      
    console.log('Player teams:', playerTeamIds);

    // Filter completed matches
    const filteredCompleted = completed.filter(match => 
      playerTeamIds.includes(match.homeTeamId) || 
      playerTeamIds.includes(match.awayTeamId)
    );

    // Filter live matches
    const filteredLive = live.filter(match => 
      playerTeamIds.includes(match.homeTeamId) || 
      playerTeamIds.includes(match.awayTeamId)
    );

    // Filter upcoming matches
    const filteredUpcoming = upcoming.filter(match => 
      playerTeamIds.includes(match.homeTeamId) || 
      playerTeamIds.includes(match.awayTeamId)
    );

    return { 
      completed: filteredCompleted, 
      live: filteredLive, 
      upcoming: filteredUpcoming 
    };
  }, [completed, live, upcoming, currentPlayer, teams]);
  
  const handleCreateMatch = () => {
    try {
      console.log('About to navigate to:', "/(football)/startMatch/selectTeams");
      router.push("/(football)/startMatch/selectTeams");
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to create match screen.');
    }
  };

  const handleViewMatch = useCallback((matchId: string, type: string) => {
    try {
      Alert.alert('Match Selected', `You selected match ID: ${matchId} of type: ${type}`);
      // If needed, implement a simplified navigation later
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  // Format match duration (for completed matches only)
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
    if (match.type === 'upcoming') {
      return { text: 'Upcoming', color: 'text-slate-600', bgColor: 'bg-slate-100' };
    }
    
    if (match.type === 'live') {
      return { text: 'Live', color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    }
    
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
        onPress={() => handleViewMatch(match.id, match.type)}
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

          {/* Score or Match Time */}
          <View className="mx-4 items-center">
            {match.type === 'upcoming' ? (
              // For upcoming matches show the date
              <View className="items-center">
                <Text className="text-lg font-semibold text-slate-800">
                  {match.tournament && `${match.tournament}`}
                </Text>
                <Text className="text-slate-400 text-xs mt-1">
                  {new Date(match.date).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            ) : (
              // For completed and live matches show the score
              <View className="items-center">
                <View className="flex-row items-center bg-slate-50 rounded-lg px-3 py-1">
                  <Text className="text-xl font-bold text-slate-900">{match.homeTeamScore || 0}</Text>
                  <Text className="text-lg font-medium text-slate-400 mx-2">-</Text>
                  <Text className="text-xl font-bold text-slate-900">{match.awayTeamScore || 0}</Text>
                </View>
                <Text className="text-slate-400 text-xs mt-1">
                  {match.type === 'live' ? 'LIVE' : 'FINAL'}
                </Text>
              </View>
            )}
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

        {/* Footer Row - Only for completed and live matches */}
        {match.type !== 'upcoming' && (
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-50">
            {match.type === 'completed' ? (
              <Text className="text-slate-400 text-xs">
                {formatDuration((match as any).actualDuration || 90)}
              </Text>
            ) : (
              <Text className="text-emerald-500 font-medium text-xs">
                {`${(match as any).currentMinute || 0}'`}
              </Text>
            )}
            
            <View className="flex-row items-center">
              <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [getMatchResult, formatDuration, handleViewMatch]);

  // Group and sort all matches by section and date
  const organizedMatches = useMemo(() => {
    const hasLiveMatches = filteredMatches.live && filteredMatches.live.length > 0;
    const hasCompletedMatches = filteredMatches.completed && filteredMatches.completed.length > 0;
    const hasUpcomingMatches = filteredMatches.upcoming && filteredMatches.upcoming.length > 0;
    
    // Sort live matches by current minute (descending)
    const sortedLiveMatches = hasLiveMatches ? 
      [...filteredMatches.live].sort((a, b) => 
        ((b as any).currentMinute || 0) - ((a as any).currentMinute || 0)
      ) : [];
    
    // Sort completed matches by date (most recent first)
    const sortedCompletedMatches = hasCompletedMatches ?
      [...filteredMatches.completed].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ) : [];
    
    // Sort upcoming matches by date (soonest first)
    const sortedUpcomingMatches = hasUpcomingMatches ?
      [...filteredMatches.upcoming].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ) : [];
    
    return {
      hasLiveMatches,
      hasCompletedMatches,
      hasUpcomingMatches,
      liveMatches: sortedLiveMatches,
      completedMatches: sortedCompletedMatches,
      upcomingMatches: sortedUpcomingMatches
    };
  }, [filteredMatches]);
  
  // Create empty state when no matches at all
  const renderEmptyState = () => {
    const iconName: IoniconsName = 'football-outline';
    const title = 'No Matches Found';
    const message = currentPlayer 
      ? 'You don\'t have any matches yet. Join a team or create a match to get started.'
      : 'No matches found. Create your profile to join teams and see their matches.';
    
    return (
      <View className="flex-1 justify-center items-center p-6">
        <View className="items-center">
          <View className="w-28 h-28 bg-slate-100 rounded-full justify-center items-center mb-8">
            <Ionicons name={iconName} size={48} color="#64748b" />
          </View>
          
          <Text className="text-2xl font-bold text-slate-900 mb-3 text-center">
            {title}
          </Text>
          <Text className="text-slate-600 text-center leading-6 max-w-sm mb-8">
            {message}
          </Text>
          
          {!currentPlayer && (
            <TouchableOpacity
              onPress={() => router.push('/create-football-profile')}
              className="bg-blue-500 px-5 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Create Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Check if there are any matches at all
  const hasAnyMatches = 
    (filteredMatches.live && filteredMatches.live.length > 0) || 
    (filteredMatches.completed && filteredMatches.completed.length > 0) || 
    (filteredMatches.upcoming && filteredMatches.upcoming.length > 0);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
  

      {/* Header */}
     
      {!hasAnyMatches ? (
        renderEmptyState()
      ) : (
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
          {/* LIVE MATCHES SECTION */}
          {organizedMatches.hasLiveMatches && (
            <View className="mb-6">
              {/* Section Header */}
              <View className="flex-row items-center mb-4">
                <View className="px-2 py-1 bg-emerald-100 rounded-md mr-2">
                  <Text className="text-emerald-600 font-bold text-xs">LIVE</Text>
                </View>
                <Text className="text-lg font-bold text-slate-800">
                  Live Matches
                </Text>
                <Text className="text-slate-500 text-sm ml-2">
                  ({organizedMatches.liveMatches.length})
                </Text>
                <View className="flex-1 h-px bg-slate-200 ml-3" />
              </View>
              
              {/* Live matches */}
              {organizedMatches.liveMatches.map(renderMatchCard)}
            </View>
          )}

          {/* COMPLETED MATCHES SECTION */}
          {organizedMatches.hasCompletedMatches && (
            <View className="mb-6">
              {/* Section Header */}
              <View className="flex-row items-center mb-4">
                <View className="px-2 py-1 bg-slate-100 rounded-md mr-2">
                  <Text className="text-slate-600 font-bold text-xs">HISTORY</Text>
                </View>
                <Text className="text-lg font-bold text-slate-800">
                  Completed Matches
                </Text>
                <Text className="text-slate-500 text-sm ml-2">
                  ({organizedMatches.completedMatches.length})
                </Text>
                <View className="flex-1 h-px bg-slate-200 ml-3" />
              </View>
              
              {/* Group completed matches by date */}
              {(() => {
                // Group by date string
                const groupedByDate: {[key: string]: DisplayMatch[]} = {};
                organizedMatches.completedMatches.forEach(match => {
                  const dateKey = new Date(match.date).toDateString();
                  if (!groupedByDate[dateKey]) {
                    groupedByDate[dateKey] = [];
                  }
                  groupedByDate[dateKey].push(match);
                });
                
                // Render each date group
                return Object.entries(groupedByDate).map(([dateKey, matches]) => (
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
                ));
              })()}
            </View>
          )}

          {/* UPCOMING MATCHES SECTION */}
          {organizedMatches.hasUpcomingMatches && (
            <View className="mb-6">
              {/* Section Header */}
              <View className="flex-row items-center mb-4">
                <View className="px-2 py-1 bg-blue-100 rounded-md mr-2">
                  <Text className="text-blue-600 font-bold text-xs">UPCOMING</Text>
                </View>
                <Text className="text-lg font-bold text-slate-800">
                  Upcoming Matches
                </Text>
                <Text className="text-slate-500 text-sm ml-2">
                  ({organizedMatches.upcomingMatches.length})
                </Text>
                <View className="flex-1 h-px bg-slate-200 ml-3" />
              </View>
              
              {/* Group upcoming matches by date */}
              {(() => {
                // Group by date string
                const groupedByDate: {[key: string]: DisplayMatch[]} = {};
                organizedMatches.upcomingMatches.forEach(match => {
                  const dateKey = new Date(match.date).toDateString();
                  if (!groupedByDate[dateKey]) {
                    groupedByDate[dateKey] = [];
                  }
                  groupedByDate[dateKey].push(match);
                });
                
                // Render each date group
                return Object.entries(groupedByDate).map(([dateKey, matches]) => (
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
                ));
              })()}
            </View>
          )}
          
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