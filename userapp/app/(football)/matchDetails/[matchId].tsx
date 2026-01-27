import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMatchExecutionStore, MatchEvent } from '@/store/footballMatchEventStore';

export default function MatchDetailScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams();
  const { getMatchById } = useMatchExecutionStore();
  
  const match = getMatchById(matchId as string);

  // If match not found, show error
  if (!match) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="alert-circle-outline" size={64} color="#64748b" />
          <Text className="text-xl font-bold text-slate-900 mt-4">Match Not Found</Text>
          <Text className="text-slate-600 mt-2">This match could not be found.</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-slate-900 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Get match result
  const getMatchResult = () => {
    const isHomeWin = match.homeTeamScore > match.awayTeamScore;
    const isDraw = match.homeTeamScore === match.awayTeamScore;
    
    if (isDraw) {
      return { text: 'Draw', color: 'text-slate-600', bgColor: 'bg-slate-100' };
    } else if (isHomeWin) {
      return { text: 'Win', color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    } else {
      return { text: 'Loss', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
  };

  const result = getMatchResult();

  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Render event icon
  const renderEventIcon = (event: MatchEvent) => {
    switch (event.eventType) {
      case 'goal':
        return <Ionicons name="football" size={14} color="#10b981" />;
      case 'card':
        return <Ionicons name="card" size={14} color={event.eventSubType === 'yellow_card' ? '#eab308' : '#ef4444'} />;
      case 'substitution':
        return <Ionicons name="swap-horizontal" size={14} color="#3b82f6" />;
      case 'corner':
        return <Ionicons name="flag" size={12} color="#64748b" />;
      case 'foul':
        return <Ionicons name="hand-left" size={12} color="#ef4444" />;
      default:
        return <Ionicons name="ellipse" size={8} color="#64748b" />;
    }
  };

  // Get event color based on team
  const getEventColor = (event: MatchEvent) => {
    const isHomeTeam = event.teamId === match.matchSetup.myTeam.teamId;
    return isHomeTeam ? 'border-emerald-500' : 'border-red-500';
  };

  // Get stat percentage
  const getStatPercentage = (home: number, away: number, isHome: boolean) => {
    const total = home + away || 1;
    const value = isHome ? home : away;
    return `${(value / total) * 100}%`;
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-slate-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#1e293b" />
          </TouchableOpacity>
          
          <Text className="text-lg font-bold text-slate-900">Match Details</Text>
          
          <View className="w-10 h-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Match Result Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-slate-100">
          {/* Result Badge */}
          <View className="flex-row items-center justify-between mb-6">
            <View className={`px-3 py-1.5 rounded-lg ${result.bgColor}`}>
              <Text className={`font-bold text-sm ${result.color}`}>
                {result.text.toUpperCase()}
              </Text>
            </View>
            <Text className="text-slate-500 text-sm font-medium">
              {new Date(match.startTime).toLocaleDateString([], { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>

          {/* Teams and Score */}
          <View className="items-center mb-6">
            {/* Home Team */}
            <View className="flex-row items-center mb-4 w-full">
              <View className="w-12 h-12 bg-emerald-500 rounded-xl items-center justify-center">
                <Ionicons name="shield" size={20} color="white" />
              </View>
              <Text className="text-slate-900 font-bold text-lg ml-3 flex-1" numberOfLines={1}>
                {match.matchSetup.myTeam.teamName}
              </Text>
            </View>

            {/* Score */}
            <View className="bg-slate-50 rounded-2xl px-8 py-4 my-2">
              <View className="flex-row items-center">
                <Text className="text-4xl font-bold text-slate-900">{match.homeTeamScore}</Text>
                <Text className="text-2xl font-medium text-slate-400 mx-4">-</Text>
                <Text className="text-4xl font-bold text-slate-900">{match.awayTeamScore}</Text>
              </View>
              <Text className="text-slate-500 text-xs text-center mt-2 font-semibold">
                FULL TIME
              </Text>
            </View>

            {/* Away Team */}
            <View className="flex-row items-center mt-4 w-full">
              <View className="w-12 h-12 bg-red-500 rounded-xl items-center justify-center">
                <Ionicons name="flag" size={20} color="white" />
              </View>
              <Text className="text-slate-900 font-bold text-lg ml-3 flex-1" numberOfLines={1}>
                {match.matchSetup.opponentTeam.teamName}
              </Text>
            </View>
          </View>

          {/* Match Info */}
          <View className="border-t border-slate-100 pt-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="location" size={16} color="#64748b" />
              <Text className="text-slate-600 ml-2 font-medium">{match.venue}</Text>
            </View>
            <View className="flex-row items-center mb-3">
              <Ionicons name="time" size={16} color="#64748b" />
              <Text className="text-slate-600 ml-2 font-medium">
                {formatTime(match.startTime)} • {formatDuration(match.actualDuration)}
              </Text>
            </View>
            {match.referees.length > 0 && (
              <View className="flex-row items-center">
                <Ionicons name="person" size={16} color="#64748b" />
                <Text className="text-slate-600 ml-2 font-medium">
                  {match.referees.join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Statistics */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-6 border border-slate-100">
          <Text className="text-lg font-bold text-slate-900 mb-4">Statistics</Text>
          
          {/* Goals */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-600 text-sm font-medium">Goals</Text>
              <Text className="text-slate-900 font-bold">
                {match.homeTeamStats.goals} - {match.awayTeamStats.goals}
              </Text>
            </View>
            <View className="h-2 bg-slate-100 rounded-full overflow-hidden flex-row">
              <View 
                className="bg-emerald-500 h-full"
                style={{ 
                  width: getStatPercentage(match.homeTeamStats.goals, match.awayTeamStats.goals, true) as any
                }}
              />
              <View 
                className="bg-red-500 h-full"
                style={{ 
                  width: getStatPercentage(match.homeTeamStats.goals, match.awayTeamStats.goals, false) as any
                }}
              />
            </View>
          </View>

          {/* Fouls */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-600 text-sm font-medium">Fouls</Text>
              <Text className="text-slate-900 font-bold">
                {match.homeTeamStats.fouls} - {match.awayTeamStats.fouls}
              </Text>
            </View>
            <View className="h-2 bg-slate-100 rounded-full overflow-hidden flex-row">
              <View 
                className="bg-emerald-500 h-full"
                style={{ 
                  width: getStatPercentage(match.homeTeamStats.fouls, match.awayTeamStats.fouls, true) as any
                }}
              />
              <View 
                className="bg-red-500 h-full"
                style={{ 
                  width: getStatPercentage(match.homeTeamStats.fouls, match.awayTeamStats.fouls, false) as any
                }}
              />
            </View>
          </View>

          {/* Cards */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-slate-600 text-sm font-medium mb-2">Cards</Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-3">
                  <View className="w-4 h-5 bg-yellow-400 rounded-sm mr-1" />
                  <Text className="text-slate-900 font-semibold text-sm">
                    {match.homeTeamStats.yellowCards}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-4 h-5 bg-red-500 rounded-sm mr-1" />
                  <Text className="text-slate-900 font-semibold text-sm">
                    {match.homeTeamStats.redCards}
                  </Text>
                </View>
              </View>
            </View>
            
            <View className="flex-1 items-end">
              <Text className="text-slate-600 text-sm font-medium mb-2">Cards</Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-3">
                  <Text className="text-slate-900 font-semibold text-sm mr-1">
                    {match.awayTeamStats.yellowCards}
                  </Text>
                  <View className="w-4 h-5 bg-yellow-400 rounded-sm" />
                </View>
                <View className="flex-row items-center">
                  <Text className="text-slate-900 font-semibold text-sm mr-1">
                    {match.awayTeamStats.redCards}
                  </Text>
                  <View className="w-4 h-5 bg-red-500 rounded-sm" />
                </View>
              </View>
            </View>
          </View>

          {/* Corners & Offsides */}
          <View className="flex-row items-center justify-between pt-2 border-t border-slate-100">
            <View>
              <Text className="text-slate-600 text-xs font-medium">Corners</Text>
              <Text className="text-slate-900 font-bold mt-1">
                {match.homeTeamStats.corners} - {match.awayTeamStats.corners}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-slate-600 text-xs font-medium">Offsides</Text>
              <Text className="text-slate-900 font-bold mt-1">
                {match.homeTeamStats.offsides} - {match.awayTeamStats.offsides}
              </Text>
            </View>
          </View>
        </View>

        {/* Match Events Timeline */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-6 border border-slate-100">
          <Text className="text-lg font-bold text-slate-900 mb-4">Match Events</Text>
          
          {match.events.length === 0 ? (
            <View className="py-8 items-center">
              <Ionicons name="calendar-outline" size={32} color="#94a3b8" />
              <Text className="text-slate-500 mt-2">No events recorded</Text>
            </View>
          ) : (
            <View>
              {match.events.map((event, index) => (
                <View key={event.id} className="flex-row items-start mb-4">
                  {/* Timeline */}
                  <View className="items-center mr-3">
                    <View className={`w-8 h-8 rounded-full border-2 ${getEventColor(event)} bg-white items-center justify-center`}>
                      {renderEventIcon(event)}
                    </View>
                    {index < match.events.length - 1 && (
                      <View className="w-0.5 h-full bg-slate-200 absolute top-8" />
                    )}
                  </View>

                  {/* Event Details */}
                  <View className="flex-1 pb-2">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-slate-900 font-semibold text-sm">
                        {event.playerName}
                      </Text>
                      <Text className="text-slate-500 text-xs font-bold">
                        {event.minute}'
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-slate-600 text-xs capitalize">
                        {event.eventType}
                        {event.eventSubType && ` • ${event.eventSubType.replace(/_/g, ' ')}`}
                      </Text>
                    </View>
                    {event.assistPlayerName && (
                      <Text className="text-slate-500 text-xs mt-0.5">
                        Assist: {event.assistPlayerName}
                      </Text>
                    )}
                   
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Notes Section */}
        {match.notes && (
          <View className="mx-4 mt-4 bg-white rounded-2xl p-6 border border-slate-100">
            <Text className="text-lg font-bold text-slate-900 mb-3">Notes</Text>
            <Text className="text-slate-600 leading-6">{match.notes}</Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}