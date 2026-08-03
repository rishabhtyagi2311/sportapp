// app/(football)/teams/viewMembers.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useFootballStore } from '@/store/footballTeamStore';
import { useAuthStore } from '@/store/authStore';
import { footballService } from '@/services/football';
import { FootballMatch, FootballProfile } from '@/types/football';

export default function ViewMembersScreen() {
  const { teamId: teamIdParam } = useLocalSearchParams();
  const teamId = parseInt(teamIdParam as string, 10);
  const { getTeamById, fetchTeamById, getTeamPlayers, updateCaptain, removeTeamMember } = useFootballStore();
  const currentUser = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(true);
  const [recentMatches, setRecentMatches] = useState<FootballMatch[]>([]);
  const [actionPlayerId, setActionPlayerId] = useState<number | null>(null);

  const team = getTeamById(teamId);
  const teamPlayers = team ? getTeamPlayers(team.id) : [];
  const captain = team?.captain;
  const isOwner = !!currentUser && currentUser.id === team?.createdBy?.userId;

  useFocusEffect(
    useCallback(() => {
      if (isNaN(teamId)) return;
      setIsLoading(true);
      Promise.all([fetchTeamById(teamId), footballService.fetchTeamMatches(teamId)])
        .then(([, matches]) => setRecentMatches(matches))
        .finally(() => setIsLoading(false));
    }, [teamId])
  );

  const handleGoBack = () => {
    router.back();
  };

  const handleMakeCaptain = (player: FootballProfile) => {
    if (!team) return;
    const displayName = player.user ? `${player.user.firstname} ${player.user.lastname}` : player.nickname;
    Alert.alert('Make Captain', `Make ${displayName} the team captain?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            setActionPlayerId(player.id);
            await updateCaptain(team.id, player.id);
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not update captain');
          } finally {
            setActionPlayerId(null);
          }
        },
      },
    ]);
  };

  const handleRemovePlayer = (player: FootballProfile) => {
    if (!team) return;
    const displayName = player.user ? `${player.user.firstname} ${player.user.lastname}` : player.nickname;
    Alert.alert('Remove Player', `Remove ${displayName} from the team?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionPlayerId(player.id);
            await removeTeamMember(team.id, player.id);
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not remove player');
          } finally {
            setActionPlayerId(null);
          }
        },
      },
    ]);
  };

  // Get position color for better visual organization
  const getPositionColor = (role: string) => {
    const positionColors: Record<string, string> = {
      'Goalkeeper': '#ef4444',
      'Right Back': '#3b82f6',
      'Left Back': '#3b82f6',
      'Centre Back': '#3b82f6',
      'Defensive Midfielder': '#10b981',
      'Central Midfielder': '#10b981',
      'Attacking Midfielder': '#f59e0b',
      'Right Winger': '#8b5cf6',
      'Left Winger': '#8b5cf6',
      'Striker': '#f97316',
      'Centre Forward': '#f97316'
    };
    return positionColors[role] || '#6b7280';
  };

  const renderPlayerCard = (player: FootballProfile, index: number) => {
    const isCaptain = captain?.id === player.id;
    const isCreator = team?.createdById === player.id;
    const displayName = player.user ? `${player.user.firstname} ${player.user.lastname}` : player.nickname;
    const isBusy = actionPlayerId === player.id;
    const canRemove = isOwner && !isCreator && !isCaptain;
    const canMakeCaptain = isOwner && !isCaptain;

    return (
      <View
        key={player.id}
        className="bg-white rounded-xl mx-4 mb-3 shadow-sm border border-gray-100"
        style={{
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        <View className="flex-row items-center p-4">
          {/* Position Color Bar */}
          <View
            className="w-1 h-12 rounded-full mr-3"
            style={{ backgroundColor: getPositionColor(player.role) }}
          />

          {/* Profile Picture with Position Initial */}
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: getPositionColor(player.role) + '15' }}
          >
            <Text
              className="font-bold text-sm"
              style={{ color: getPositionColor(player.role) }}
            >
              {player.role.charAt(0)}
            </Text>
          </View>
          {/* Player Info */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-gray-900 font-bold text-base mb-1">
                {displayName} ({player.nickname})
              </Text>
              {isCaptain && (
                <View className="ml-2 bg-amber-100 rounded-full px-2 py-0.5">
                  <Text className="text-amber-700 text-xs font-bold">CAPTAIN</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 text-sm">
                {player.role}
              </Text>
              {player.experience && (
                <>
                  <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
                  <Text className="text-gray-500 text-xs">
                    {player.experience}
                  </Text>
                </>
              )}
            </View>
          </View>
          {/* Squad Number */}
          <View className="items-end">
            <View className={`w-8 h-8 rounded-lg items-center justify-center mb-2 ${isCaptain ? 'bg-amber-500' : 'bg-slate-900'}`}>
              <Text className="text-white text-xs font-bold">
                {index + 1}
              </Text>
            </View>
          </View>
        </View>

        {(canMakeCaptain || canRemove) && (
          <View className="flex-row border-t border-gray-100 px-4 py-2">
            {isBusy ? (
              <View className="flex-1 items-center py-1">
                <ActivityIndicator size="small" color="#64748b" />
              </View>
            ) : (
              <>
                {canMakeCaptain && (
                  <TouchableOpacity
                    onPress={() => handleMakeCaptain(player)}
                    className="flex-row items-center mr-5"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="shield-outline" size={16} color="#b45309" />
                    <Text className="text-amber-700 text-sm font-medium ml-1">Make Captain</Text>
                  </TouchableOpacity>
                )}
                {canRemove && (
                  <TouchableOpacity
                    onPress={() => handleRemovePlayer(player)}
                    className="flex-row items-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="person-remove-outline" size={16} color="#dc2626" />
                    <Text className="text-red-600 text-sm font-medium ml-1">Remove</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderRecentMatch = (match: FootballMatch) => {
    const isHome = match.homeTeamId === team?.id;
    const teamScore = isHome ? match.homeScore : match.awayScore;
    const opponentScore = isHome ? match.awayScore : match.homeScore;
    const opponentName = isHome ? match.awayTeam?.name : match.homeTeam?.name;
    const result = teamScore > opponentScore ? 'Win' : teamScore < opponentScore ? 'Loss' : 'Draw';
    const resultColor = result === 'Win' ? 'text-emerald-600' : result === 'Loss' ? 'text-red-600' : 'text-slate-600';

    return (
      <TouchableOpacity
        key={match.id}
        onPress={() => router.push({ pathname: '/(football)/matchDetails/[matchId]', params: { matchId: match.id } })}
        className="bg-white rounded-xl mx-4 mb-2 p-3 border border-gray-100 flex-row items-center justify-between"
      >
        <Text className="text-gray-900 font-medium flex-1" numberOfLines={1}>vs {opponentName}</Text>
        <Text className="text-gray-700 font-bold mx-3">{teamScore} - {opponentScore}</Text>
        <Text className={`text-xs font-bold ${resultColor}`}>{result.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <View className="items-center">
        <View className="w-24 h-24 bg-slate-100 rounded-2xl justify-center items-center mb-6">
          <Ionicons name="people-outline" size={40} color="#64748b" />
        </View>

        <Text className="text-xl font-bold text-gray-900 mb-3 text-center">
          Build Your Squad
        </Text>
        <Text className="text-gray-600 text-center leading-6 max-w-sm mb-6">
          Your team is ready for players! Add registered football players to start building your winning squad.
        </Text>

        <View className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
          <View className="flex-row items-center">
            <Ionicons name="add-circle" size={18} color="#0ea5e9" />
            <Text className="text-slate-700 text-sm ml-2 font-medium">
              Tap the + button to add players
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (isLoading && !team) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0f172a" />
      </SafeAreaView>
    );
  }

  // Handle case where team is not found
  if (!team) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <View className="items-center">
            <View className="w-24 h-24 bg-red-100 rounded-2xl justify-center items-center mb-6">
              <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
            </View>

            <Text className="text-xl font-bold text-gray-900 mb-3 text-center">
              Team Not Found
            </Text>
            <Text className="text-gray-600 text-center leading-6 max-w-sm mb-8">
              The team you're looking for doesn't exist or has been deleted.
            </Text>

            <TouchableOpacity
              onPress={handleGoBack}
              className="bg-slate-900 rounded-xl py-4 px-8"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleGoBack}
            className="mr-3 w-10 h-10 bg-slate-100 rounded-xl items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              Squad
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {team.name}
            </Text>
          </View>
          {/* Member count with progress indicator */}
          <View className="items-end">
            <View className="bg-slate-900 px-3 py-2 rounded-lg">
              <Text className="text-white text-sm font-bold">
                {teamPlayers.length}/{team.maxPlayers}
              </Text>
            </View>
            <View className="w-12 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <View
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${(teamPlayers.length / team.maxPlayers) * 100}%`
                }}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Team Info Section */}
        <View className="items-center mb-6">
          <Text className="text-lg font-bold text-gray-800">{team.name}</Text>

          {captain && (
            <View className="flex-row items-center mt-2 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
              <Ionicons name="shield-outline" size={16} color="#b45309" />
              <Text className="text-amber-700 ml-2 font-medium">
                Captain: {captain.nickname}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View className="flex-row mx-4 mb-4 space-x-3">
          <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="location" size={16} color="#0ea5e9" />
              <Text className="text-sky-700 font-medium text-sm ml-2">
                {team.location}
              </Text>
            </View>
          </View>

          <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="trophy" size={16} color="#f59e0b" />
              <Text className="text-amber-600 font-medium text-sm ml-2">
                {team.matchesWon}W {team.matchesLost}L {team.matchesDrawn}D
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Matches */}
        {recentMatches.length > 0 && (
          <View className="mt-2 mb-4">
            <View className="mx-4 mb-3">
              <Text className="text-gray-900 font-bold text-lg">Recent Matches</Text>
            </View>
            {recentMatches.slice(0, 5).map(renderRecentMatch)}
          </View>
        )}

        {/* Players List */}
        {teamPlayers.length === 0 ? (
          renderEmptyState()
        ) : (
          <View className="mt-2">
            <View className="mx-4 mb-3">
              <Text className="text-gray-900 font-bold text-lg">Players</Text>
              <Text className="text-gray-500 text-sm">
                Roster of your team
              </Text>
            </View>

            {teamPlayers.map((player, index) => renderPlayerCard(player, index))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {teamPlayers.length < team.maxPlayers && (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: '/(football)/TeamsNestedFiles/addTeamMembers',
              params: { teamId: team.id },
            });
          }}
          className="absolute bottom-6 right-6 w-16 h-16 mb-6 bg-slate-900 rounded-full justify-center items-center shadow-lg"
          activeOpacity={0.9}
          style={{
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
