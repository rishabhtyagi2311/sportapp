// app/(football)/startMatch/selectOpponentTeamPlayers.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFootballStore } from '@/store/footballTeamStore';
import { useMatchCreationStore } from '@/store/footballMatchCreationStore';
import { FootballPlayer, FootballPosition } from '@/types/addingMemberTypes';

export default function SelectOpponentTeamPlayersScreen() {
  const router = useRouter();
  const { teams, players } = useFootballStore();
  const { 
    matchData, 
    updateOpponentTeamPlayers, 
    canProceedToNextStep,
    setError 
  } = useMatchCreationStore();

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get opponent team data
  const opponentTeam = teams.find(team => team.id === matchData.opponentTeam.teamId);
  
  // Get available players for opponent team
  const availablePlayers = useMemo(() => {
    if (!opponentTeam) return [];
    
    return opponentTeam.memberPlayerIds
      .map(playerId => players.find(player => player.id === playerId))
      .filter((player): player is FootballPlayer => player !== undefined && player.isRegistered);
  }, [opponentTeam, players]);

  // Initialize with previously selected players if any
  useEffect(() => {
    if (matchData.opponentTeam.selectedPlayers.length > 0) {
      setSelectedPlayers(matchData.opponentTeam.selectedPlayers);
    }
  }, [matchData.opponentTeam.selectedPlayers]);

  // Group players by position
  const playersByPosition = useMemo(() => {
    const grouped: Record<FootballPosition, FootballPlayer[]> = {} as Record<FootballPosition, FootballPlayer[]>;
    availablePlayers.forEach(player => {
      if (!grouped[player.position]) {
        grouped[player.position] = [];
      }
      grouped[player.position].push(player);
    });
    return grouped;
  }, [availablePlayers]);

  const handlePlayerToggle = useCallback((playerId: string) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.includes(playerId);
      
      if (isSelected) {
        // Remove player
        return prev.filter(id => id !== playerId);
      } else {
        // Add player if under limit
        if (prev.length >= matchData.playersPerTeam) {
          Alert.alert(
            'Player Limit Reached',
            `You can only select ${matchData.playersPerTeam} players for this match.`,
            [{ text: 'OK' }]
          );
          return prev;
        }
        return [...prev, playerId];
      }
    });
  }, [matchData.playersPerTeam]);

  const handleProceed = useCallback(async () => {
    if (selectedPlayers.length !== matchData.playersPerTeam) {
      Alert.alert(
        'Incomplete Selection',
        `Please select exactly ${matchData.playersPerTeam} players to continue.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      
      // Update store with selected players
      updateOpponentTeamPlayers(selectedPlayers);
      
      // Navigate to captain selection screen
      router.push('/(football)/startMatch/selectCaptains');
      
    } catch (error) {
      console.error('Error proceeding:', error);
      setError('Failed to save player selection. Please try again.');
      Alert.alert(
        'Error',
        'Failed to save player selection. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlayers, matchData.playersPerTeam, updateOpponentTeamPlayers, router, setError]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  // Render player card
  const renderPlayerCard = useCallback((player: FootballPlayer) => {
    const isSelected = selectedPlayers.includes(player.id);
    
    return (
      <TouchableOpacity
        key={player.id}
        onPress={() => handlePlayerToggle(player.id)}
        activeOpacity={0.7}
        disabled={isLoading}
        className={`rounded-2xl p-4 mb-3 border-2 ${
          isSelected 
            ? 'bg-red-50 border-red-300' 
            : 'bg-white border-slate-200'
        } ${isLoading ? 'opacity-50' : ''}`}
        style={{
          elevation: isSelected ? 3 : 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isSelected ? 0.15 : 0.05,
          shadowRadius: 4,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text className={`text-lg font-bold ${
                isSelected ? 'text-red-800' : 'text-slate-900'
              }`}>
                {player.name}
              </Text>
              {player.experience && (
                <View className={`ml-2 px-2 py-1 rounded-lg ${
                  isSelected ? 'bg-red-200' : 'bg-slate-100'
                }`}>
                  <Text className={`text-xs font-bold ${
                    isSelected ? 'text-red-800' : 'text-slate-600'
                  }`}>
                    {player.experience}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center mb-1">
              <Ionicons 
                name="football" 
                size={14} 
                color={isSelected ? '#991b1b' : '#64748b'} 
              />
              <Text className={`text-sm ml-1 font-medium ${
                isSelected ? 'text-red-700' : 'text-slate-600'
              }`}>
                {player.position}
              </Text>
            </View>
            {player.preferredFoot && (
              <View className="flex-row items-center">
                <Ionicons 
                  name="footsteps" 
                  size={14} 
                  color={isSelected ? '#991b1b' : '#64748b'} 
                />
                <Text className={`text-xs ml-1 ${
                  isSelected ? 'text-red-600' : 'text-slate-500'
                }`}>
                  {player.preferredFoot} foot
                </Text>
              </View>
            )}
          </View>
          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            isSelected 
              ? 'bg-red-500 border-red-500'
              : 'border-slate-300'
          }`}>
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [selectedPlayers, handlePlayerToggle, isLoading]);

  // Computed values
  const canProceed = useMemo(() => 
    selectedPlayers.length === matchData.playersPerTeam && !isLoading
  , [selectedPlayers.length, matchData.playersPerTeam, isLoading]);

  // Error state
  if (!opponentTeam) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
        <View className="items-center">
          <Ionicons name="alert-circle-outline" size={48} color="#64748b" />
          <Text className="text-lg font-semibold text-slate-900 mt-4 mb-2">
            Team Not Found
          </Text>
          <Text className="text-slate-600 text-center mb-6">
            Unable to load opponent team information.
          </Text>
          <TouchableOpacity
            onPress={handleGoBack}
            className="bg-slate-900 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No players available
  if (availablePlayers.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
        <View className="items-center">
          <Ionicons name="people-outline" size={48} color="#64748b" />
          <Text className="text-lg font-semibold text-slate-900 mt-4 mb-2">
            No Players Available
          </Text>
          <Text className="text-slate-600 text-center mb-6">
            {opponentTeam.teamName} doesn't have any registered players.
          </Text>
          <TouchableOpacity
            onPress={handleGoBack}
            className="bg-slate-900 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-slate-900 px-4 py-6">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleGoBack}
            disabled={isLoading}
            className={`mr-4 w-10 h-10 bg-slate-700 rounded-xl items-center justify-center ${
              isLoading ? 'opacity-50' : ''
            }`}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">
              Select Opponent Players
            </Text>
            <Text className="text-slate-300 mt-1">
              {opponentTeam.teamName} • {selectedPlayers.length}/{matchData.playersPerTeam} selected
            </Text>
          </View>
          
          <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center">
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="flag" size={20} color="white" />
            )}
          </View>
        </View>
      </View>

      {/* Team Comparison */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-slate-200">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1 items-center">
            <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mb-2">
              <Ionicons name="shield" size={20} color="#16a34a" />
            </View>
            <Text className="text-xs text-green-600 font-semibold mb-1">MY TEAM</Text>
            <Text className="text-sm font-bold text-slate-900 text-center" numberOfLines={1}>
              {matchData.myTeam.teamName}
            </Text>
            <Text className="text-xs text-slate-600 mt-1">
              {matchData.myTeam.selectedPlayers.length}/{matchData.playersPerTeam} players
            </Text>
          </View>
          
          <View className="mx-4 items-center">
            <View className="w-8 h-8 bg-slate-900 rounded-full items-center justify-center">
              <Text className="text-white font-bold text-xs">VS</Text>
            </View>
          </View>
          
          <View className="flex-1 items-center">
            <View className="w-12 h-12 bg-red-100 rounded-xl items-center justify-center mb-2">
              <Ionicons name="flag" size={20} color="#dc2626" />
            </View>
            <Text className="text-xs text-red-600 font-semibold mb-1">OPPONENT</Text>
            <Text className="text-sm font-bold text-slate-900 text-center" numberOfLines={1}>
              {opponentTeam.teamName}
            </Text>
            <Text className={`text-xs mt-1 ${
              selectedPlayers.length === matchData.playersPerTeam 
                ? 'text-green-600' 
                : 'text-slate-600'
            }`}>
              {selectedPlayers.length}/{matchData.playersPerTeam} players
            </Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View className="bg-slate-200 h-2 rounded-full overflow-hidden">
          <View 
            className={`h-full rounded-full ${
              selectedPlayers.length === matchData.playersPerTeam 
                ? 'bg-red-500' 
                : 'bg-red-300'
            }`}
            style={{ 
              width: `${(selectedPlayers.length / matchData.playersPerTeam) * 100}%` 
            }}
          />
        </View>
        
        {selectedPlayers.length < matchData.playersPerTeam && (
          <Text className="text-slate-600 text-sm mt-2 text-center">
            Select {matchData.playersPerTeam - selectedPlayers.length} more player{matchData.playersPerTeam - selectedPlayers.length !== 1 ? 's' : ''} for {opponentTeam.teamName}
          </Text>
        )}
      </View>

      <ScrollView 
        className="flex-1 pt-6" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEnabled={!isLoading}
      >
        {/* Players by Position */}
        {Object.entries(playersByPosition).map(([position, positionPlayers]) => (
          <View key={position} className="mx-4 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-red-500 rounded-lg items-center justify-center mr-3">
                <Ionicons name="football" size={16} color="white" />
              </View>
              <Text className="text-lg font-bold text-slate-900">
                {position}
              </Text>
              <Text className="text-slate-600 ml-2">
                ({positionPlayers.filter(p => selectedPlayers.includes(p.id)).length}/{positionPlayers.length})
              </Text>
            </View>
            
            {positionPlayers.map(renderPlayerCard)}
          </View>
        ))}

        {/* Show all players if no position grouping */}
        {Object.keys(playersByPosition).length === 0 && (
          <View className="mx-4">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-red-500 rounded-lg items-center justify-center mr-3">
                <Ionicons name="people" size={16} color="white" />
              </View>
              <Text className="text-lg font-bold text-slate-900">All Players</Text>
            </View>
            
            {availablePlayers.map(renderPlayerCard)}
          </View>
        )}
      </ScrollView>

      {/* Proceed Button */}
      <View className="bg-white px-4 py-4 border-t border-slate-200">
        <TouchableOpacity
          onPress={handleProceed}
          disabled={!canProceed}
          className={`rounded-2xl py-4 flex-row items-center justify-center ${
            canProceed ? 'bg-slate-900' : 'bg-slate-300'
          }`}
          activeOpacity={0.8}
          style={canProceed ? { 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 3 }, 
            shadowOpacity: 0.2, 
            shadowRadius: 6, 
            elevation: 4 
          } : {}}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="white" className="mr-2" />
              <Text className="font-bold text-lg text-white">
                Saving Selection...
              </Text>
            </>
          ) : (
            <>
              <Text className={`font-bold text-lg mr-2 ${
                canProceed ? 'text-white' : 'text-slate-500'
              }`}>
                Select Captains
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={canProceed ? 'white' : '#64748b'} 
              />
            </>
          )}
        </TouchableOpacity>
        
        {/* Validation Messages */}
        {selectedPlayers.length > matchData.playersPerTeam && (
          <Text className="text-red-500 text-sm text-center mt-2">
            Too many players selected. Maximum: {matchData.playersPerTeam}
          </Text>
        )}
        {selectedPlayers.length < matchData.playersPerTeam && selectedPlayers.length > 0 && (
          <Text className="text-orange-500 text-sm text-center mt-2">
            Select {matchData.playersPerTeam - selectedPlayers.length} more player{matchData.playersPerTeam - selectedPlayers.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}