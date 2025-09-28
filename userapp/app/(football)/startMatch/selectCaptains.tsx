// app/(football)/startMatch/selectCaptains.tsx
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
import { FootballPlayer } from '@/types/addingMemberTypes';

export default function SelectCaptainsScreen() {
  const router = useRouter();
  const { players } = useFootballStore();
  const { 
    matchData, 
    updateCaptains, 
    setError 
  } = useMatchCreationStore();

  const [myTeamCaptain, setMyTeamCaptain] = useState<string>('');
  const [opponentTeamCaptain, setOpponentTeamCaptain] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Get selected players for both teams
  const myTeamPlayers = useMemo(() => {
    return matchData.myTeam.selectedPlayers
      .map(playerId => players.find(player => player.id === playerId))
      .filter((player): player is FootballPlayer => player !== undefined);
  }, [matchData.myTeam.selectedPlayers, players]);

  const opponentTeamPlayers = useMemo(() => {
    return matchData.opponentTeam.selectedPlayers
      .map(playerId => players.find(player => player.id === playerId))
      .filter((player): player is FootballPlayer => player !== undefined);
  }, [matchData.opponentTeam.selectedPlayers, players]);

  // Initialize with previously selected captains if any
  useEffect(() => {
    if (matchData.myTeam.captain) {
      setMyTeamCaptain(matchData.myTeam.captain);
    }
    if (matchData.opponentTeam.captain) {
      setOpponentTeamCaptain(matchData.opponentTeam.captain);
    }
  }, [matchData]);

  const handlePlayerSelection = useCallback((playerId: string, role: 'myTeamCaptain' | 'opponentTeamCaptain') => {
    switch (role) {
      case 'myTeamCaptain':
        setMyTeamCaptain(playerId);
        break;
      case 'opponentTeamCaptain':
        setOpponentTeamCaptain(playerId);
        break;
    }
  }, []);

  const handleProceed = useCallback(async () => {
    if (!myTeamCaptain || !opponentTeamCaptain) {
      Alert.alert(
        'Captain Selection Required',
        'Please select captains for both teams before proceeding.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      
      // Update store with selected captains
      updateCaptains(
        myTeamCaptain,
        opponentTeamCaptain,
        undefined, // No vice captain
        undefined  // No vice captain
      );
      
      // Navigate to final match details
      router.push('/(football)/startMatch/finalMatchDetails');
      
    } catch (error) {
      console.error('Error proceeding:', error);
      setError('Failed to save captain selection. Please try again.');
      Alert.alert(
        'Error',
        'Failed to save captain selection. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [myTeamCaptain, opponentTeamCaptain, updateCaptains, router, setError]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  // Render player card for captain selection
  const renderPlayerCard = useCallback((
    player: FootballPlayer, 
    isSelected: boolean, 
    teamType: 'my' | 'opponent',
    onSelect: () => void
  ) => {
    
    return (
      <TouchableOpacity
        key={player.id}
        onPress={onSelect}
        activeOpacity={0.7}
        disabled={isLoading}
        className={`rounded-2xl p-4 mb-3 border-2 ${
          isSelected 
            ? teamType === 'my'
              ? 'bg-yellow-50 border-yellow-400'
              : 'bg-yellow-50 border-yellow-400'
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
                isSelected ? 'text-yellow-800' : 'text-slate-900'
              }`}>
                {player.name}
              </Text>
              {player.experience && (
                <View className={`ml-2 px-2 py-1 rounded-lg ${
                  isSelected ? 'bg-yellow-200' : 'bg-slate-100'
                }`}>
                  <Text className={`text-xs font-bold ${
                    isSelected ? 'text-yellow-800' : 'text-slate-600'
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
                color={isSelected ? '#92400e' : '#64748b'} 
              />
              <Text className={`text-sm ml-1 font-medium ${
                isSelected ? 'text-yellow-700' : 'text-slate-600'
              }`}>
                {player.position}
              </Text>
            </View>
            {isSelected && (
              <View className="flex-row items-center">
                <Ionicons 
                  name="star" 
                  size={14} 
                  color="#92400e" 
                />
                <Text className="text-xs ml-1 font-medium text-yellow-700">
                  Captain
                </Text>
              </View>
            )}
          </View>
          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            isSelected 
              ? 'bg-yellow-500 border-yellow-500'
              : 'border-slate-300'
          }`}>
            {isSelected && (
              <Ionicons 
                name="star" 
                size={12} 
                color="white" 
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [isLoading]);

  const canProceed = useMemo(() => 
    myTeamCaptain && opponentTeamCaptain && !isLoading
  , [myTeamCaptain, opponentTeamCaptain, isLoading]);

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
              Select Captains
            </Text>
            <Text className="text-slate-300 mt-1">
              Choose captains and vice captains for both teams
            </Text>
          </View>
          
          <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center">
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="star" size={20} color="white" />
            )}
          </View>
        </View>
      </View>

      {/* Captain Selection Progress */}
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
            <Text className={`text-xs mt-1 ${
              myTeamCaptain ? 'text-green-600' : 'text-slate-600'
            }`}>
              {myTeamCaptain ? 'Captain Selected' : 'Select Captain'}
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
              {matchData.opponentTeam.teamName}
            </Text>
            <Text className={`text-xs mt-1 ${
              opponentTeamCaptain ? 'text-green-600' : 'text-slate-600'
            }`}>
              {opponentTeamCaptain ? 'Captain Selected' : 'Select Captain'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 pt-6" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEnabled={!isLoading}
      >
        {/* My Team Captain Selection */}
        <View className="mx-4 mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-green-500 rounded-lg items-center justify-center mr-3">
              <Ionicons name="shield" size={16} color="white" />
            </View>
            <Text className="text-lg font-bold text-slate-900">
              {matchData.myTeam.teamName} - Select Captain
            </Text>
          </View>

          {myTeamPlayers.map(player => 
            renderPlayerCard(
              player,
              myTeamCaptain === player.id,
              'my',
              () => handlePlayerSelection(player.id, 'myTeamCaptain')
            )
          )}
        </View>

        {/* Opponent Team Captain Selection */}
        <View className="mx-4 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-red-500 rounded-lg items-center justify-center mr-3">
              <Ionicons name="flag" size={16} color="white" />
            </View>
            <Text className="text-lg font-bold text-slate-900">
              {matchData.opponentTeam.teamName} - Select Captain
            </Text>
          </View>

          {opponentTeamPlayers.map(player => 
            renderPlayerCard(
              player,
              opponentTeamCaptain === player.id,
              'opponent',
              () => handlePlayerSelection(player.id, 'opponentTeamCaptain')
            )
          )}
        </View>
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
                Final Match Details
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
        {(!myTeamCaptain || !opponentTeamCaptain) && (
          <Text className="text-orange-500 text-sm text-center mt-2">
            Both teams must have captains selected
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}