// app/(football)/matches/matchScoring.tsx - Fixed version
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMatchCreationStore } from '@/store/footballMatchCreationStore';
import { useMatchExecutionStore } from '@/store/footballMatchEventStore';
import { useFootballStore } from '@/store/footballTeamStore';
import { FootballPlayer } from '@/types/addingMemberTypes';
// EVENT CONFIGURATIONS
const EVENT_CONFIGS = {
  goal: {
    name: 'Goal',
    icon: 'football',
    color: '#10b981',
    subTypes: [
      { id: 'header', name: 'Header' },
      { id: 'left_foot', name: 'Left Foot' },
      { id: 'right_foot', name: 'Right Foot' },
      { id: 'penalty_goal', name: 'Penalty' },
      { id: 'free_kick_goal', name: 'Free Kick' },
      { id: 'own_goal', name: 'Own Goal' },
    ],
  },
  card: {
    name: 'Card',
    icon: 'card',
    color: '#f59e0b',
    subTypes: [
      { id: 'yellow_card', name: 'Yellow Card' },
      { id: 'red_card', name: 'Red Card' },
      { id: 'second_yellow', name: 'Second Yellow' },
    ],
  },
  substitution: {
    name: 'Substitution',
    icon: 'swap-horizontal',
    color: '#6366f1',
    subTypes: [],
  },
  foul: {
    name: 'Foul',
    icon: 'warning',
    color: '#f97316',
    subTypes: [
      { id: 'dangerous_play', name: 'Dangerous Play' },
      { id: 'unsporting_behavior', name: 'Unsporting Behavior' },
      { id: 'dissent', name: 'Dissent' },
      { id: 'handball', name: 'Handball' },
    ],
  },
  corner: {
    name: 'Corner',
    icon: 'flag',
    color: '#8b5cf6',
    subTypes: [],
  },
  offside: {
    name: 'Offside',
    icon: 'flag-outline',
    color: '#ef4444',
    subTypes: [],
  },
};
export default function MatchScoringScreen() {
  const router = useRouter();
  const { matchData } = useMatchCreationStore();
  const { players } = useFootballStore();
  const {
    activeMatch,
    startMatch,
    addEvent,
    endMatch,
    updateCurrentMinute,
    updateLiveMatch,
  } = useMatchExecutionStore();
  
  // Timer state
  const [timer, setTimer] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerStartedAt = useRef<Date | null>(null);
  
  // Modal + event form states
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'my' | 'opponent' | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<FootballPlayer | null>(null);
  const [selectedAssistPlayer, setSelectedAssistPlayer] = useState<FootballPlayer | null>(null);
  const [eventMinute, setEventMinute] = useState('');
  const [isExtraTime, setIsExtraTime] = useState(false);
  const [eventDescription, setEventDescription] = useState('');
  
  // Start the timer when component mounts
  useEffect(() => {
    // Start timer on first load
    if (!timerStartedAt.current) {
      timerStartedAt.current = new Date();
    }
    
    timerIntervalRef.current = setInterval(() => {
      if (timerStartedAt.current) {
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - timerStartedAt.current.getTime()) / 1000);
        setTimer(elapsedSeconds);
      }
    }, 1000);
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);
  
  // Format timer as MM:SS
  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timer]);
  
  // Initialize match in execution store
  useEffect(() => {
    if (!activeMatch && matchData) {
      startMatch(matchData);
    }
  }, [activeMatch, matchData, startMatch]);
  
  // Update match time periodically
  useEffect(() => {
    if (activeMatch) {
      const timerForMinutes = setInterval(() => {
        // Calculate current minute based on timer (converting seconds to minutes)
        const minutesPassed = Math.floor(timer / 60);
        
        // Update the active match time
        updateCurrentMinute(minutesPassed);
        
        // Also update the corresponding live match
        if (activeMatch.id) {
          updateLiveMatch(activeMatch.id, {
            currentMinute: minutesPassed
          });
        }
      }, 60000); // Update every minute
      
      return () => clearInterval(timerForMinutes);
    }
  }, [activeMatch, timer, updateCurrentMinute, updateLiveMatch]);
  
  // Get team players
  const myTeamPlayers = useMemo(() => {
    return matchData?.myTeam?.selectedPlayers
      ?.map(id => players.find(p => p.id === id))
      ?.filter((p): p is FootballPlayer => !!p) || [];
  }, [matchData?.myTeam?.selectedPlayers, players]);
  
  const opponentTeamPlayers = useMemo(() => {
    return matchData?.opponentTeam?.selectedPlayers
      ?.map(id => players.find(p => p.id === id))
      ?.filter((p): p is FootballPlayer => !!p) || [];
  }, [matchData?.opponentTeam?.selectedPlayers, players]);
  
  // Get events from activeMatch
  const events = useMemo(() => {
    return activeMatch?.events || [];
  }, [activeMatch?.events]);
  
  // Calculate scores from activeMatch
  const { myTeamScore, opponentTeamScore } = useMemo(() => {
    if (!activeMatch || !matchData) {
      return { myTeamScore: 0, opponentTeamScore: 0 };
    }
    return {
      myTeamScore: activeMatch.homeTeamScore,
      opponentTeamScore: activeMatch.awayTeamScore,
    };
  }, [activeMatch?.homeTeamScore, activeMatch?.awayTeamScore, matchData]);
  
  // Reset event form
  const resetEventForm = useCallback(() => {
    setSelectedEventType(null);
    setSelectedSubType(null);
    setSelectedPlayer(null);
    setSelectedAssistPlayer(null);
    
    // Automatically set current minute from timer
    const currentMinute = Math.floor(timer / 60).toString();
    setEventMinute(currentMinute);
    
    setIsExtraTime(false);
    setEventDescription('');
    setSelectedTeam(null);
  }, [timer]);
  
  // Create event and push to store
  const handleCreateEvent = useCallback(() => {
    if (!selectedEventType || !selectedPlayer || !eventMinute.trim() || !selectedTeam || !matchData || !activeMatch) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    const minute = parseInt(eventMinute);
    if (isNaN(minute) || minute < 1) {
      Alert.alert('Error', 'Invalid minute');
      return;
    }
    
    const eventData = {
      teamId: selectedTeam === 'my' ? matchData.myTeam.teamId : matchData.opponentTeam.teamId,
      eventType: selectedEventType as any,
      eventSubType: selectedSubType as any,
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      assistPlayerId: selectedAssistPlayer?.id,
      assistPlayerName: selectedAssistPlayer?.name,
      minute,
      isExtraTime,
      description: eventDescription.trim() || undefined,
    };
    
    // Add event to active match
    addEvent(eventData);
    
    // Calculate new scores based on the event
    if (selectedEventType === 'goal') {
      // Calculate updated scores
      let homeTeamScore = activeMatch.homeTeamScore;
      let awayTeamScore = activeMatch.awayTeamScore;
      
      const isHomeTeam = eventData.teamId === matchData.myTeam.teamId;
      const isOwnGoal = selectedSubType === 'own_goal';
      
      if (isOwnGoal) {
        // Own goal counts for opposing team
        if (isHomeTeam) {
          awayTeamScore += 1;
        } else {
          homeTeamScore += 1;
        }
      } else {
        // Regular goal
        if (isHomeTeam) {
          homeTeamScore += 1;
        } else {
          awayTeamScore += 1;
        }
      }
      
      // Update the corresponding live match with new scores
      if (activeMatch.id) {
        updateLiveMatch(activeMatch.id, {
          homeTeamScore,
          awayTeamScore,
          currentMinute: minute,
          events: [...activeMatch.events, {
            ...eventData,
            id: `event_${Date.now()}`,
            timestamp: new Date(),
          }]
        });
      }
    }
    
    setShowEventModal(false);
    resetEventForm();
  }, [
    selectedEventType,
    selectedPlayer,
    selectedAssistPlayer,
    selectedTeam,
    eventMinute,
    isExtraTime,
    eventDescription,
    selectedSubType,
    matchData,
    activeMatch,
    addEvent,
    updateLiveMatch,
    resetEventForm,
  ]);
  
  // Handle End Match
  const handleEndMatch = useCallback(() => {
    Alert.alert(
      'End Match', 
      'Are you sure you want to end this match? All data will be saved.', 
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Match',
          style: 'destructive',
          onPress: () => {
            // Stop the timer
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }
            
            const completedMatch = endMatch();
            if (completedMatch) {
              router.push('/(football)/landingScreen/matches');
            }
          },
        },
      ]
    );
  }, [endMatch, router]);
  
  // Handle opening event modal for specific team
  const handleAddEvent = useCallback((team: 'my' | 'opponent') => {
    setSelectedTeam(team);
    
    // Automatically set current minute from timer
    const currentMinute = Math.floor(timer / 60).toString();
    setEventMinute(currentMinute);
    
    setShowEventModal(true);
  }, [timer]);
  
  // Get current players for selected team
  const getCurrentPlayers = useCallback(() => {
    return selectedTeam === 'my' ? myTeamPlayers : opponentTeamPlayers;
  }, [selectedTeam, myTeamPlayers, opponentTeamPlayers]);
  
  // Render single event card with new design
  const renderEventCard = useCallback((event: any) => {
    const config = EVENT_CONFIGS[event.eventType as keyof typeof EVENT_CONFIGS];
    if (!config) return null;
    
    const isMyTeam = event.teamId === matchData?.myTeam?.teamId;
    
    return (
      <View key={event.id} className="flex-row mb-4">
        {/* Time Card */}
        <View className="bg-slate-800 rounded-l-xl py-3 px-4 items-center justify-center">
          <Text className="text-white text-lg font-bold">{event.minute}'</Text>
          {event.isExtraTime && (
            <Text className="text-amber-400 text-xs font-medium">+ET</Text>
          )}
        </View>
        
        {/* Event Card */}
        <View 
          className={`flex-1 bg-white rounded-r-xl py-3 px-4 border-l-4 ml-1 ${
            isMyTeam ? 'border-green-500' : 'border-red-500'
          }`}
          style={{ 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View className={`flex-row items-center ${isMyTeam ? 'justify-start' : 'justify-end'}`}>
            {isMyTeam && (
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: config.color }}
              >
                <Ionicons name={config.icon as any} size={16} color="white" />
              </View>
            )}
            
            <View className={isMyTeam ? 'items-start' : 'items-end'}>
              <Text className="text-base font-bold text-slate-900">
                {config.name}
                {event.eventSubType &&
                  ` - ${config.subTypes?.find(st => st.id === event.eventSubType)?.name || ''}`}
              </Text>
              
              <Text className="text-sm text-slate-600">
                {event.playerName}
                {event.assistPlayerName && ` (Assist: ${event.assistPlayerName})`}
              </Text>
              
              <Text className={`text-xs font-medium ${isMyTeam ? 'text-green-600' : 'text-red-600'}`}>
                {isMyTeam ? matchData?.myTeam?.teamName : matchData?.opponentTeam?.teamName}
              </Text>
            </View>
            
            {!isMyTeam && (
              <View
                className="w-8 h-8 rounded-full items-center justify-center ml-3"
                style={{ backgroundColor: config.color }}
              >
                <Ionicons name={config.icon as any} size={16} color="white" />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }, [matchData]);
  
  if (!matchData) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100 items-center justify-center">
        <Text className="text-slate-500 text-lg">No match data found</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      {/* Header with Image Background */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80' }}
        className="h-64"
        resizeMode="cover"
      >
        <View className="flex-1 bg-black/50">
          <SafeAreaView>
            <View className="flex-row items-center justify-between px-4 py-2">
              <TouchableOpacity onPress={() => router.back()} className="p-2">
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold">Live Match</Text>
              <View className="w-10" />
            </View>
          </SafeAreaView>
          
          {/* Score Section with Team Logos */}
          <View className="flex-1 justify-center px-4">
            <View className="flex-row items-center justify-between">
              {/* My Team */}
              <TouchableOpacity 
                onPress={() => handleAddEvent('my')}
                className="items-center flex-1"
              >
                <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-2 border-2 border-white/30">
                  <Ionicons name="shield" size={40} color="white" />
                </View>
                <Text className="text-white text-sm font-medium text-center mb-1">
                  {matchData.myTeam.teamName}
                </Text>
                <Text className="text-white text-4xl font-bold">{myTeamScore}</Text>
              </TouchableOpacity>
              
              {/* VS */}
              <View className="px-8">
                <Text className="text-white text-2xl font-bold">VS</Text>
              </View>
              
              {/* Opponent Team */}
              <TouchableOpacity 
                onPress={() => handleAddEvent('opponent')}
                className="items-center flex-1"
              >
                <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-2 border-2 border-white/30">
                  <Ionicons name="shield-outline" size={40} color="white" />
                </View>
                <Text className="text-white text-sm font-medium text-center mb-1">
                  {matchData.opponentTeam.teamName}
                </Text>
                <Text className="text-white text-4xl font-bold">{opponentTeamScore}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Live Timer Display */}
            <View className="items-center mt-4">
              <View className="bg-white/20 px-6 py-2 rounded-full flex-row items-center">
                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                <Text className="text-white font-semibold">{formattedTimer}</Text>
              </View>
              <Text className="text-white/80 text-sm mt-1">
                {activeMatch?.currentMinute || 0}' {activeMatch?.isExtraTime && '+ ET'}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
      
      {/* Event List */}
      <ScrollView className="flex-1 px-4 pt-4">
        {events.length > 0 ? (
          <>
            <Text className="text-lg font-bold text-slate-900 mb-4">
              Match Timeline ({events.length})
            </Text>
            {events
              .sort((a, b) => a.minute - b.minute)
              .map(renderEventCard)}
          </>
        ) : (
          <View className="items-center justify-center py-16">
            <Ionicons name="football" size={48} color="#94a3b8" />
            <Text className="text-slate-500 text-lg font-medium mt-4">No events yet</Text>
            <Text className="text-slate-400 text-sm mt-2">Tap the buttons above to add match events</Text>
          </View>
        )}
      </ScrollView>
      
      {/* End Match Button */}
      <View className="p-4 bg-white border-t border-slate-200">
        <TouchableOpacity
          onPress={handleEndMatch}
          className="bg-red-600 rounded-2xl py-4 items-center"
        >
          <View className="flex-row items-center">
            <Ionicons name="stop-circle" size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">End Match</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Event Creation Modal */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        onRequestClose={() => {
          setShowEventModal(false);
          resetEventForm();
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <SafeAreaView className="flex-1 bg-white mt-12">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-slate-200">
              <TouchableOpacity
                onPress={() => {
                  setShowEventModal(false);
                  resetEventForm();
                }}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-slate-900">
                Add Event - {selectedTeam === 'my' ? matchData.myTeam.teamName : matchData.opponentTeam.teamName}
              </Text>
              <TouchableOpacity
                onPress={handleCreateEvent}
                className="bg-blue-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              className="flex-1 p-4"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Event Type Selection */}
              <Text className="text-lg font-bold text-slate-900 mb-3">Event Type</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {Object.entries(EVENT_CONFIGS).map(([key, config]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      setSelectedEventType(key);
                      setSelectedSubType(null);
                    }}
                    className={`flex-row items-center px-4 py-3 rounded-xl border ${
                      selectedEventType === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2"
                      style={{ backgroundColor: config.color }}
                    >
                      <Ionicons name={config.icon as any} size={12} color="white" />
                    </View>
                    <Text className={`font-medium ${
                      selectedEventType === key ? 'text-blue-700' : 'text-slate-700'
                    }`}>
                      {config.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Sub Type Selection */}
              {selectedEventType && EVENT_CONFIGS[selectedEventType as keyof typeof EVENT_CONFIGS]?.subTypes?.length > 0 && (
                <>
                  <Text className="text-lg font-bold text-slate-900 mb-3">Sub Type</Text>
                  <View className="flex-row flex-wrap gap-2 mb-6">
                    {EVENT_CONFIGS[selectedEventType as keyof typeof EVENT_CONFIGS].subTypes.map((subType) => (
                      <TouchableOpacity
                        key={subType.id}
                        onPress={() => setSelectedSubType(subType.id)}
                        className={`px-4 py-2 rounded-lg border ${
                          selectedSubType === subType.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <Text className={`${
                          selectedSubType === subType.id ? 'text-blue-700' : 'text-slate-700'
                        }`}>
                          {subType.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              
              {/* Player Selection */}
              <Text className="text-lg font-bold text-slate-900 mb-3">Player</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <View className="flex-row gap-2">
                  {getCurrentPlayers().map((player) => (
                    <TouchableOpacity
                      key={player.id}
                      onPress={() => setSelectedPlayer(player)}
                      className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${
                        selectedPlayer?.id === player.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <Text className={`font-medium ${
                        selectedPlayer?.id === player.id ? 'text-blue-700' : 'text-slate-700'
                      }`}>
                        {player.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              {/* Assist Player (for goals) */}
              {selectedEventType === 'goal' && (
                <>
                  <Text className="text-lg font-bold text-slate-900 mb-3">Assist Player (Optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => setSelectedAssistPlayer(null)}
                        className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${
                          !selectedAssistPlayer
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <Text className={`font-medium ${
                          !selectedAssistPlayer ? 'text-blue-700' : 'text-slate-700'
                        }`}>
                          No Assist
                        </Text>
                      </TouchableOpacity>
                      {getCurrentPlayers()
                        .filter(p => p.id !== selectedPlayer?.id)
                        .map((player) => (
                        <TouchableOpacity
                          key={player.id}
                          onPress={() => setSelectedAssistPlayer(player)}
                          className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${
                            selectedAssistPlayer?.id === player.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <Text className={`font-medium ${
                            selectedAssistPlayer?.id === player.id ? 'text-blue-700' : 'text-slate-700'
                          }`}>
                            {player.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}
              
              {/* Minute Input */}
              <Text className="text-lg font-bold text-slate-900 mb-3">Minute</Text>
              <View className="flex-row gap-3 mb-6">
                <TextInput
                  value={eventMinute}
                  onChangeText={setEventMinute}
                  placeholder="45"
                  keyboardType="numeric"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg"
                />
                <TouchableOpacity
                  onPress={() => setIsExtraTime(!isExtraTime)}
                  className={`px-4 py-3 rounded-xl border ${
                    isExtraTime
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <Text className={`font-medium ${
                    isExtraTime ? 'text-orange-700' : 'text-slate-700'
                  }`}>
                    Extra Time
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Description (Optional) */}
              <Text className="text-lg font-bold text-slate-900 mb-3">Description (Optional)</Text>
              <TextInput
                value={eventDescription}
                onChangeText={setEventDescription}
                placeholder="Additional notes about the event..."
                multiline
                numberOfLines={3}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base"
                textAlignVertical="top"
              />
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}