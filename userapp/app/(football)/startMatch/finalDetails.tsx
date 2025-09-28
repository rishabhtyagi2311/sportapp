// app/(football)/startMatch/finalMatchDetails.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFootballStore } from '@/store/footballTeamStore';
import { useMatchCreationStore, MatchSettings } from '@/store/footballMatchCreationStore';
import { FootballPlayer } from '@/types/addingMemberTypes';

export default function FinalMatchDetailsScreen() {
  const router = useRouter();
  const { teams, players } = useFootballStore();
  const { 
    matchData, 
    updateMatchSettings,
    updateSubstitutes,
    setError 
  } = useMatchCreationStore();

  // Match settings state
  const [startHour, setStartHour] = useState('15');
  const [startMinute, setStartMinute] = useState('00');
  const [isAM, setIsAM] = useState(false);
  const [use24Hour, setUse24Hour] = useState(true);
  const [duration, setDuration] = useState('90');
  const [extraTimeAllowed, setExtraTimeAllowed] = useState(false);
  const [extraTimeDuration, setExtraTimeDuration] = useState('30');
  const [substitutionAllowed, setSubstitutionAllowed] = useState(true);
  const [maxSubstitutions, setMaxSubstitutions] = useState('3');

  // Substitute selection state
  const [myTeamSubstitutes, setMyTeamSubstitutes] = useState<string[]>([]);
  const [opponentTeamSubstitutes, setOpponentTeamSubstitutes] = useState<string[]>([]);
  const [showSubstituteSelection, setShowSubstituteSelection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get available substitute players for both teams
  const myTeamData = teams.find(team => team.id === matchData.myTeam.teamId);
  const opponentTeamData = teams.find(team => team.id === matchData.opponentTeam.teamId);

  const availableMyTeamSubstitutes = useMemo(() => {
    if (!myTeamData) return [];
    
    return myTeamData.memberPlayerIds
      .map(playerId => players.find(player => player.id === playerId))
      .filter((player): player is FootballPlayer => 
        player !== undefined && 
        player.isRegistered && 
        !matchData.myTeam.selectedPlayers.includes(player.id)
      );
  }, [myTeamData, players, matchData.myTeam.selectedPlayers]);

  const availableOpponentTeamSubstitutes = useMemo(() => {
    if (!opponentTeamData) return [];
    
    return opponentTeamData.memberPlayerIds
      .map(playerId => players.find(player => player.id === playerId))
      .filter((player): player is FootballPlayer => 
        player !== undefined && 
        player.isRegistered && 
        !matchData.opponentTeam.selectedPlayers.includes(player.id)
      );
  }, [opponentTeamData, players, matchData.opponentTeam.selectedPlayers]);

  // Get formatted time string
  const formattedTime = useMemo(() => {
    if (use24Hour) {
      return `${startHour.padStart(2, '0')}:${startMinute.padStart(2, '0')}`;
    } else {
      const meridiem = isAM ? 'AM' : 'PM';
      return `${startHour}:${startMinute.padStart(2, '0')} ${meridiem}`;
    }
  }, [startHour, startMinute, isAM, use24Hour]);

  // Initialize with existing data if any
  useEffect(() => {
    if (matchData.matchSettings) {
      const settings = matchData.matchSettings;
      
      // Parse existing start time
      if (settings.startTime) {
        const timeMatch = settings.startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
          const [, hour, minute, meridiem] = timeMatch;
          
          if (meridiem) {
            // 12-hour format
            setUse24Hour(false);
            setStartHour(hour);
            setStartMinute(minute);
            setIsAM(meridiem.toUpperCase() === 'AM');
          } else {
            // 24-hour format
            setUse24Hour(true);
            setStartHour(hour);
            setStartMinute(minute);
          }
        }
      }
      
      setDuration(settings.duration.toString());
      setExtraTimeAllowed(settings.extraTimeAllowed);
      setExtraTimeDuration(settings.extraTimeDuration?.toString() || '30');
      setSubstitutionAllowed(settings.substitutionAllowed);
      setMaxSubstitutions(settings.maxSubstitutions?.toString() || '3');
    }
    
    if (matchData.myTeam.substitutes.length > 0) {
      setMyTeamSubstitutes(matchData.myTeam.substitutes);
    }
    if (matchData.opponentTeam.substitutes.length > 0) {
      setOpponentTeamSubstitutes(matchData.opponentTeam.substitutes);
    }
  }, [matchData]);

  const handleHourChange = useCallback((hour: string) => {
    const hourNum = parseInt(hour) || 0;
    if (use24Hour) {
      if (hourNum >= 0 && hourNum <= 23) {
        setStartHour(hour);
      }
    } else {
      if (hourNum >= 1 && hourNum <= 12) {
        setStartHour(hour);
      }
    }
  }, [use24Hour]);

  const handleMinuteChange = useCallback((minute: string) => {
    const minuteNum = parseInt(minute) || 0;
    if (minuteNum >= 0 && minuteNum <= 59) {
      setStartMinute(minute);
    }
  }, []);

  const handleSubstituteToggle = useCallback((playerId: string, team: 'my' | 'opponent') => {
    const maxSubs = parseInt(maxSubstitutions) || 3;
    
    if (team === 'my') {
      setMyTeamSubstitutes(prev => {
        const isSelected = prev.includes(playerId);
        if (isSelected) {
          return prev.filter(id => id !== playerId);
        } else {
          if (prev.length >= maxSubs) {
            Alert.alert(
              'Substitute Limit Reached',
              `You can only select ${maxSubs} substitutes.`,
              [{ text: 'OK' }]
            );
            return prev;
          }
          return [...prev, playerId];
        }
      });
    } else {
      setOpponentTeamSubstitutes(prev => {
        const isSelected = prev.includes(playerId);
        if (isSelected) {
          return prev.filter(id => id !== playerId);
        } else {
          if (prev.length >= maxSubs) {
            Alert.alert(
              'Substitute Limit Reached',
              `You can only select ${maxSubs} substitutes.`,
              [{ text: 'OK' }]
            );
            return prev;
          }
          return [...prev, playerId];
        }
      });
    }
  }, [maxSubstitutions]);

  const handleCompleteMatch = useCallback(async () => {
    try {
      setIsLoading(true);

      if (substitutionAllowed) {
        // Update substitutes
        updateSubstitutes(myTeamSubstitutes, opponentTeamSubstitutes);
      }

      // Navigate to match summary or start match
      router.push('/(football)/matches/matchSummary');
      
    } catch (error) {
      console.error('Error completing match setup:', error);
      setError('Failed to complete match setup. Please try again.');
      Alert.alert(
        'Error',
        'Failed to complete match setup. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [substitutionAllowed, myTeamSubstitutes, opponentTeamSubstitutes, updateSubstitutes, router, setError]);

  const handleSaveMatchSettings = useCallback(() => {
    // Validation
    if (!formattedTime.trim()) {
      Alert.alert('Error', 'Please set start time');
      return;
    }

    const durationNum = parseInt(duration);
    if (!durationNum || durationNum < 1) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    const maxSubsNum = parseInt(maxSubstitutions);
    if (substitutionAllowed && (!maxSubsNum || maxSubsNum < 0)) {
      Alert.alert('Error', 'Please enter a valid number of substitutions');
      return;
    }

    const extraTimeNum = extraTimeAllowed ? parseInt(extraTimeDuration) : undefined;
    if (extraTimeAllowed && (!extraTimeNum || extraTimeNum < 1)) {
      Alert.alert('Error', 'Please enter a valid extra time duration');
      return;
    }

    const settings: MatchSettings = {
      startTime: formattedTime,
      duration: durationNum,
      extraTimeAllowed,
      extraTimeDuration: extraTimeNum,
      substitutionAllowed,
      maxSubstitutions: substitutionAllowed ? maxSubsNum : undefined,
    };

    updateMatchSettings(settings);

    if (substitutionAllowed) {
      setShowSubstituteSelection(true);
    } else {
      // No substitution needed, complete the match setup
      handleCompleteMatch();
    }
  }, [
    formattedTime,
    duration,
    extraTimeAllowed,
    extraTimeDuration,
    substitutionAllowed,
    maxSubstitutions,
    updateMatchSettings,
    handleCompleteMatch
  ]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderSubstituteCard = useCallback((player: FootballPlayer, isSelected: boolean, team: 'my' | 'opponent') => {
    return (
      <TouchableOpacity
        key={player.id}
        onPress={() => handleSubstituteToggle(player.id, team)}
        activeOpacity={0.7}
        disabled={isLoading}
        className={`rounded-2xl p-4 mb-3 border-2 ${
          isSelected 
            ? team === 'my'
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
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
                isSelected 
                  ? team === 'my' ? 'text-green-800' : 'text-red-800'
                  : 'text-slate-900'
              }`}>
                {player.name}
              </Text>
              {player.experience && (
                <View className={`ml-2 px-2 py-1 rounded-lg ${
                  isSelected 
                    ? team === 'my' ? 'bg-green-200' : 'bg-red-200'
                    : 'bg-slate-100'
                }`}>
                  <Text className={`text-xs font-bold ${
                    isSelected 
                      ? team === 'my' ? 'text-green-800' : 'text-red-800'
                      : 'text-slate-600'
                  }`}>
                    {player.experience}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center">
              <Ionicons 
                name="football" 
                size={14} 
                color={isSelected ? (team === 'my' ? '#166534' : '#991b1b') : '#64748b'} 
              />
              <Text className={`text-sm ml-1 font-medium ${
                isSelected 
                  ? team === 'my' ? 'text-green-700' : 'text-red-700'
                  : 'text-slate-600'
              }`}>
                {player.position}
              </Text>
            </View>
          </View>
          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            isSelected 
              ? team === 'my'
                ? 'bg-green-500 border-green-500'
                : 'bg-red-500 border-red-500'
              : 'border-slate-300'
          }`}>
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleSubstituteToggle, isLoading]);

  if (showSubstituteSelection) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        {/* Header */}
        <View className="bg-slate-900 px-4 py-6">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowSubstituteSelection(false)}
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
                Select Substitutes
              </Text>
              <Text className="text-slate-300 mt-1">
                Choose up to {maxSubstitutions} substitutes per team
              </Text>
            </View>
            
            <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center">
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="people" size={20} color="white" />
              )}
            </View>
          </View>
        </View>

        <ScrollView 
          className="flex-1 pt-6" 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 100 }}
          scrollEnabled={!isLoading}
        >
          {/* My Team Substitutes */}
          <View className="mx-4 mb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-green-500 rounded-lg items-center justify-center mr-3">
                <Ionicons name="shield" size={16} color="white" />
              </View>
              <Text className="text-lg font-bold text-slate-900">
                {matchData.myTeam.teamName} Substitutes
              </Text>
              <Text className="text-slate-600 ml-2">
                ({myTeamSubstitutes.length}/{maxSubstitutions})
              </Text>
            </View>
            
            {availableMyTeamSubstitutes.length > 0 ? (
              availableMyTeamSubstitutes.map(player => 
                renderSubstituteCard(player, myTeamSubstitutes.includes(player.id), 'my')
              )
            ) : (
              <Text className="text-slate-600 text-center py-8">
                No additional players available for substitution
              </Text>
            )}
          </View>

          {/* Opponent Team Substitutes */}
          <View className="mx-4 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-red-500 rounded-lg items-center justify-center mr-3">
                <Ionicons name="flag" size={16} color="white" />
              </View>
              <Text className="text-lg font-bold text-slate-900">
                {matchData.opponentTeam.teamName} Substitutes
              </Text>
              <Text className="text-slate-600 ml-2">
                ({opponentTeamSubstitutes.length}/{maxSubstitutions})
              </Text>
            </View>
            
            {availableOpponentTeamSubstitutes.length > 0 ? (
              availableOpponentTeamSubstitutes.map(player => 
                renderSubstituteCard(player, opponentTeamSubstitutes.includes(player.id), 'opponent')
              )
            ) : (
              <Text className="text-slate-600 text-center py-8">
                No additional players available for substitution
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Complete Button */}
        <View className="bg-white px-4 py-4 border-t border-slate-200">
          <TouchableOpacity
            onPress={handleCompleteMatch}
            disabled={isLoading}
            className={`rounded-2xl py-4 flex-row items-center justify-center ${
              isLoading ? 'bg-slate-300' : 'bg-slate-900'
            }`}
            activeOpacity={0.8}
            style={!isLoading ? { 
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
                  Completing Match Setup...
                </Text>
              </>
            ) : (
              <>
                <Text className="font-bold text-lg text-white mr-2">
                  Complete Match Setup
                </Text>
                <Ionicons name="checkmark" size={20} color="white" />
              </>
            )}
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
              Final Match Details
            </Text>
            <Text className="text-slate-300 mt-1">
              Set match timing and rules
            </Text>
          </View>
          
          <View className="w-10 h-10 bg-slate-700 rounded-xl items-center justify-center">
            <Ionicons name="settings" size={20} color="white" />
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        {/* Start Time */}
        <View className="mx-4 mt-6 mb-6">
          <Text className="text-lg font-bold text-slate-900 mb-4">
            Match Start Time
          </Text>
          
          {/* Time Format Toggle */}
          <View className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-slate-700 font-medium">Time Format</Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setUse24Hour(true)}
                  className={`px-3 py-2 rounded-l-lg border ${
                    use24Hour 
                      ? 'bg-slate-900 border-slate-900' 
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    use24Hour ? 'text-white' : 'text-slate-600'
                  }`}>
                    24H
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setUse24Hour(false)}
                  className={`px-3 py-2 rounded-r-lg border ${
                    !use24Hour 
                      ? 'bg-slate-900 border-slate-900' 
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    !use24Hour ? 'text-white' : 'text-slate-600'
                  }`}>
                    12H
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Time Input */}
            <View className="flex-row items-center justify-center">
              {/* Hour Input */}
              <View className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-2 mx-1">
                <TextInput
                  className="text-center text-lg font-bold text-slate-900 w-12"
                  placeholder={use24Hour ? "15" : "3"}
                  placeholderTextColor="#94a3b8"
                  value={startHour}
                  onChangeText={handleHourChange}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text className="text-xs text-slate-500 text-center mt-1">
                  {use24Hour ? '00-23' : '01-12'}
                </Text>
              </View>
              
              <Text className="text-2xl font-bold text-slate-900 mx-2">:</Text>
              
              {/* Minute Input */}
              <View className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-2 mx-1">
                <TextInput
                  className="text-center text-lg font-bold text-slate-900 w-12"
                  placeholder="00"
                  placeholderTextColor="#94a3b8"
                  value={startMinute}
                  onChangeText={handleMinuteChange}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text className="text-xs text-slate-500 text-center mt-1">
                  00-59
                </Text>
              </View>
              
              {/* AM/PM Toggle (only for 12-hour) */}
              {!use24Hour && (
                <>
                  <View className="mx-2" />
                  <View className="flex-col">
                    <TouchableOpacity
                      onPress={() => setIsAM(true)}
                      className={`px-3 py-1 rounded-t-lg border ${
                        isAM 
                          ? 'bg-slate-900 border-slate-900' 
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      <Text className={`text-sm font-medium ${
                        isAM ? 'text-white' : 'text-slate-600'
                      }`}>
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIsAM(false)}
                      className={`px-3 py-1 rounded-b-lg border border-t-0 ${
                        !isAM 
                          ? 'bg-slate-900 border-slate-900' 
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      <Text className={`text-sm font-medium ${
                        !isAM ? 'text-white' : 'text-slate-600'
                      }`}>
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
            
            {/* Preview */}
            <View className="mt-3 pt-3 border-t border-slate-100">
              <View className="flex-row items-center justify-center">
                <Ionicons name="time" size={16} color="#64748b" />
                <Text className="text-slate-600 ml-2 font-medium">
                  Start Time: {formattedTime}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Match Duration */}
        <View className="mx-4 mb-6">
          <Text className="text-lg font-bold text-slate-900 mb-4">
            Match Duration (minutes)
          </Text>
          
          <View className="bg-white rounded-xl border border-slate-200 flex-row items-center px-4">
            <Ionicons name="timer" size={20} color="#64748b" />
            <TextInput
              className="flex-1 py-4 px-3 text-base text-slate-900"
              placeholder="90"
              placeholderTextColor="#94a3b8"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>
          
          <Text className="text-slate-600 text-sm mt-2 px-2">
            Standard: 90 minutes, Youth: 60-80 minutes
          </Text>
        </View>

        {/* Extra Time */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-xl border border-slate-200 p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-900 mb-1">
                  Extra Time Allowed
                </Text>
                <Text className="text-slate-600 text-sm">
                  Allow extra time if match is tied
                </Text>
              </View>
              <Switch
                value={extraTimeAllowed}
                onValueChange={setExtraTimeAllowed}
                trackColor={{ false: '#e2e8f0', true: '#22c55e' }}
                thumbColor={extraTimeAllowed ? '#ffffff' : '#f1f5f9'}
              />
            </View>
            
            {extraTimeAllowed && (
              <View className="border-t border-slate-100 pt-3">
                <Text className="text-slate-700 font-medium mb-2">
                  Extra Time Duration (minutes)
                </Text>
                <View className="bg-slate-50 rounded-lg border border-slate-200 flex-row items-center px-3">
                  <Ionicons name="add-circle" size={18} color="#64748b" />
                  <TextInput
                    className="flex-1 py-3 px-2 text-base text-slate-900"
                    placeholder="30"
                    placeholderTextColor="#94a3b8"
                    value={extraTimeDuration}
                    onChangeText={setExtraTimeDuration}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Substitution Rules */}
        <View className="mx-4 mb-8">
          <View className="bg-white rounded-xl border border-slate-200 p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-900 mb-1">
                  Substitution Allowed
                </Text>
                <Text className="text-slate-600 text-sm">
                  Allow player substitutions during match
                </Text>
              </View>
              <Switch
                value={substitutionAllowed}
                onValueChange={setSubstitutionAllowed}
                trackColor={{ false: '#e2e8f0', true: '#22c55e' }}
                thumbColor={substitutionAllowed ? '#ffffff' : '#f1f5f9'}
              />
            </View>
            
            {substitutionAllowed && (
              <View className="border-t border-slate-100 pt-3">
                <Text className="text-slate-700 font-medium mb-2">
                  Maximum Substitutions per Team
                </Text>
                <View className="bg-slate-50 rounded-lg border border-slate-200 flex-row items-center px-3">
                  <Ionicons name="swap-horizontal" size={18} color="#64748b" />
                  <TextInput
                    className="flex-1 py-3 px-2 text-base text-slate-900"
                    placeholder="3"
                    placeholderTextColor="#94a3b8"
                    value={maxSubstitutions}
                    onChangeText={setMaxSubstitutions}
                    keyboardType="numeric"
                  />
                </View>
                <Text className="text-slate-500 text-xs mt-2">
                  Standard: 3-5 substitutions
                </Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Proceed Button */}
      <View className="bg-white px-4 py-4 border-t border-slate-200">
        <TouchableOpacity
          onPress={handleSaveMatchSettings}
          disabled={isLoading}
          className={`rounded-2xl py-4 flex-row items-center justify-center ${
            isLoading ? 'bg-slate-300' : 'bg-slate-900'
          }`}
          activeOpacity={0.8}
          style={!isLoading ? { 
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
                Saving...
              </Text>
            </>
          ) : (
            <>
              <Text className="font-bold text-lg text-white mr-2">
                {substitutionAllowed ? 'Select Substitutes' : 'Complete Setup'}
              </Text>
              <Ionicons 
                name={substitutionAllowed ? 'people' : 'checkmark'} 
                size={20} 
                color="white" 
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}