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
import { useMatchExecutionStore, MatchEvent } from '@/store/footballMatchEventStore';
import { useFootballStore } from '@/store/footballTeamStore';
import { FootballPlayer } from '@/types/addingMemberTypes';

// EVENT CONFIGS (unchanged)
const EVENT_CONFIGS = {
  goal: {
    name: 'Goal',
    icon: 'football' as const,
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
    icon: 'card' as const,
    color: '#f59e0b',
    subTypes: [
      { id: 'yellow_card', name: 'Yellow Card' },
      { id: 'red_card', name: 'Red Card' },
      { id: 'second_yellow', name: 'Second Yellow' },
    ],
  },
  substitution: {
    name: 'Substitution',
    icon: 'swap-horizontal' as const,
    color: '#6366f1',
    subTypes: [],
  },
  foul: {
    name: 'Foul',
    icon: 'warning' as const,
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
    icon: 'flag' as const,
    color: '#8b5cf6',
    subTypes: [],
  },
  offside: {
    name: 'Offside',
    icon: 'flag-outline' as const,
    color: '#ef4444',
    subTypes: [],
  },
};

// Helper function to get card color based on event type and sub type
const getCardColor = (eventType: string, eventSubType?: string): string => {
  if (eventType === 'card') {
    if (eventSubType === 'red_card' || eventSubType === 'second_yellow') {
      return '#ef4444'; // Red
    } else if (eventSubType === 'yellow_card') {
      return '#fbbf24'; // Yellow
    }
  }
  return '#f59e0b'; // Default orange for card
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
    updateLiveMatch,
  } = useMatchExecutionStore();
  const extraTimeAllowed = matchData?.matchSettings?.extraTimeAllowed;
  const extraTime = matchData?.matchSettings?.extraTimeDuration ?? 0;

  // Timer state
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [extraTimeMinutes, setExtraTimeMinutes] = useState<number>(extraTime);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setExtraTimeMinutes(typeof extraTime === 'number' ? extraTime : 0);
  }, [extraTime]);

  // Modal + event states
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'my' | 'opponent' | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<FootballPlayer | null>(null);
  const [selectedAssistPlayer, setSelectedAssistPlayer] = useState<FootballPlayer | null>(null);
  const [eventMinute, setEventMinute] = useState('');

  // Timer interval
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Formatted timer
  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timer]);

  const currentMinute = useMemo(() => Math.floor(timer / 60), [timer]);

  const isInExtraTime = useMemo(() => {
    return currentMinute > 90 && extraTimeMinutes > 0;
  }, [currentMinute, extraTimeMinutes]);

  useEffect(() => {
    if (!activeMatch && matchData) startMatch(matchData);
  }, [activeMatch, matchData, startMatch]);

  const myTeamPlayers = useMemo(() => {
    return matchData?.myTeam?.selectedPlayers
      ?.map((id: string) => players.find((p: FootballPlayer) => p.id === id))
      ?.filter((p): p is FootballPlayer => !!p) || [];
  }, [matchData?.myTeam?.selectedPlayers, players]);

  const opponentTeamPlayers = useMemo(() => {
    return matchData?.opponentTeam?.selectedPlayers
      ?.map((id: string) => players.find((p: FootballPlayer) => p.id === id))
      ?.filter((p): p is FootballPlayer => !!p) || [];
  }, [matchData?.opponentTeam?.selectedPlayers, players]);

  const events = useMemo(() => activeMatch?.events || [], [activeMatch?.events]);

  const { myTeamScore, opponentTeamScore } = useMemo(() => {
    if (!activeMatch || !matchData) return { myTeamScore: 0, opponentTeamScore: 0 };
    return { myTeamScore: activeMatch.homeTeamScore, opponentTeamScore: activeMatch.awayTeamScore };
  }, [activeMatch?.homeTeamScore, activeMatch?.awayTeamScore, matchData]);

  const resetEventForm = useCallback(() => {
    setSelectedEventType(null);
    setSelectedSubType(null);
    setSelectedPlayer(null);
    setSelectedAssistPlayer(null);
    setEventMinute(formattedTimer.toString());
    setSelectedTeam(null);
  }, [formattedTimer]);

  const handlePlayPause = useCallback(() => {
    setIsTimerRunning((prev) => !prev);
  }, []);

  const handleCreateEvent = useCallback(() => {
    if (!selectedEventType || !selectedPlayer || !eventMinute.trim() || !selectedTeam || !matchData || !activeMatch) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    let minute: number;
    let seconds: number = 0;

    // Check if eventMinute contains a colon (formatted timer like "01:23")
    if (eventMinute.includes(':')) {
      const parts = eventMinute.split(':');
      minute = parseInt(parts[0], 10);
      seconds = parseInt(parts[1], 10);
    } else {
      // Plain minute input (just a number like "45")
      minute = parseInt(eventMinute, 10);
      seconds = 0;
    }

    // Validation
    if (isNaN(minute) || minute < 0 || minute > 120) {
      Alert.alert('Error', 'Invalid minute. Please enter a value between 0 and 120');
      return;
    }

    if (isNaN(seconds) || seconds < 0 || seconds > 59) {
      Alert.alert('Error', 'Invalid seconds. Please enter a value between 0 and 59');
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
      seconds,
      isExtraTime: isInExtraTime,
    };

    addEvent(eventData);
    setShowEventModal(false);
    resetEventForm();
  }, [
    selectedEventType,
    selectedPlayer,
    selectedAssistPlayer,
    selectedTeam,
    eventMinute,
    selectedSubType,
    matchData,
    activeMatch,
    addEvent,
    resetEventForm,
    isInExtraTime,
  ]);

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
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            const completedMatch = endMatch();
            if (completedMatch) router.push('/(football)/landingScreen/matches');
          },
        },
      ]
    );
  }, [endMatch, router]);

  const handleAddEvent = useCallback((team: 'my' | 'opponent') => {
    setSelectedTeam(team);
    setEventMinute(formattedTimer);
    setShowEventModal(true);
  }, [formattedTimer]);

  const getCurrentPlayers = useCallback((): FootballPlayer[] => {
    return selectedTeam === 'my' ? myTeamPlayers : opponentTeamPlayers;
  }, [selectedTeam, myTeamPlayers, opponentTeamPlayers]);

  const renderEventCard = useCallback((event: MatchEvent) => {
    const config = EVENT_CONFIGS[event.eventType as keyof typeof EVENT_CONFIGS];
    if (!config) return null;

    const isMyTeam = event.teamId === matchData?.myTeam?.teamId;

    return (
      <View key={event.id} className="flex-row mb-4">
        <View className="bg-slate-800 rounded-l-xl py-3 px-4 items-center justify-center">
          <Text className="text-white text-lg font-bold">{event.minute}:{event.seconds}'</Text>
        </View>
        <View
          className={`flex-1 bg-white rounded-r-xl py-3 px-4 border-l-4 ml-1 ${isMyTeam ? 'border-green-500' : 'border-red-500'}`}
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
        >
          <View className={`flex-row items-center ${isMyTeam ? 'justify-start' : 'justify-end'}`}>
            {isMyTeam && (
              <>
                {event.eventType === 'card' ? (
                  <View className="w-8 h-12 rounded-sm items-center justify-center mr-3" style={{ backgroundColor: getCardColor(event.eventType, event.eventSubType) }} />
                ) : (
                  <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: config.color }}>
                    <Ionicons name={config.icon} size={16} color="white" />
                  </View>
                )}
              </>
            )}
            <View className={isMyTeam ? 'items-start' : 'items-end'}>
              <Text className="text-base font-bold text-slate-900">
                {config.name}
                {event.eventSubType && ` - ${config.subTypes?.find((st) => st.id === event.eventSubType)?.name || ''}`}
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
              <>
                {event.eventType === 'card' ? (
                  <View className="w-8 h-12 rounded-sm items-center justify-center ml-3" style={{ backgroundColor: getCardColor(event.eventType, event.eventSubType) }} />
                ) : (
                  <View className="w-8 h-8 rounded-full items-center justify-center ml-3" style={{ backgroundColor: config.color }}>
                    <Ionicons name={config.icon} size={16} color="white" />
                  </View>
                )}
              </>
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
      {/* Header */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80' }}
        className="h-72"
        resizeMode="cover"
      >
        <View className="flex-1 bg-black/50">
          <SafeAreaView>
            <View className="flex-row items-center justify-center px-4 mb-4">
              
              <View className="items-center">
                <Text className="text-white text-lg font-bold">Live Match</Text>
                <Text className="text-white text-2xl font-bold mt-1">{formattedTimer}</Text>
              </View>
              
            </View>
          </SafeAreaView>
          {/* Score */}
          <View className="flex-1 justify-center px-4 mb-16">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => handleAddEvent('my')} className="items-center flex-1">
                <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-2 border-2 border-white/30">
                  <Ionicons name="shield" size={40} color="white" />
                </View>
                <Text className="text-white text-sm font-medium text-center mb-1">{matchData.myTeam.teamName}</Text>
                <Text className="text-white text-4xl font-bold">{myTeamScore}</Text>
              </TouchableOpacity>
              <View className="px-8">
                <Text className="text-white text-2xl font-bold">VS</Text>
              </View>
              <TouchableOpacity onPress={() => handleAddEvent('opponent')} className="items-center flex-1">
                <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-2 border-2 border-white/30">
                  <Ionicons name="shield-outline" size={40} color="white" />
                </View>
                <Text className="text-white text-sm font-medium text-center mb-1">{matchData.opponentTeam.teamName}</Text>
                <Text className="text-white text-4xl font-bold">{opponentTeamScore}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Event list */}
      <ScrollView className="flex-1 px-4 pt-4">
        {events.length > 0 ? (
          <>
            <Text className="text-lg font-bold text-slate-900 mb-4">Match Timeline ({events.length})</Text>
            {events.sort((a: MatchEvent, b: MatchEvent) => a.minute - b.minute).map((event: MatchEvent) => renderEventCard(event))}
          </>
        ) : (
          <View className="items-center justify-center py-16">
            <Ionicons name="football" size={48} color="#94a3b8" />
            <Text className="text-slate-500 text-lg font-medium mt-4">No events yet</Text>
            <Text className="text-slate-400 text-sm mt-2">Tap the buttons above to add match events</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom controls: play/pause (left), big centered End Match, extra-time (right, small) */}
      <View className="flex-row items-center p-3 bg-slate-900 border-t border-white">
        {/* Left: Play/Pause */}
        <View className="w-16 items-center">
          <TouchableOpacity onPress={handlePlayPause} className="bg-white/30 p-3 rounded-full" accessibilityLabel="Play or pause timer">
            <Ionicons name={isTimerRunning ? 'pause' : 'play'} size={22} color="white" />
          </TouchableOpacity>
        </View>
        {/* Center: End Match (largest, centered) */}
        <View className="flex-1 items-center">
          <TouchableOpacity
            onPress={handleEndMatch}
            className="bg-red-600 rounded-2xl px-8 py-4 items-center justify-center"
            style={{ minWidth: 180 }}
          >
            <View className="flex-row items-center">
              <Ionicons name="stop-circle" size={20} color="white" />
              <Text className="text-white font-bold text-xl ml-3">End Match</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Right: Extra time indicator (small). Only when allowed and duration > 0 */}
        {extraTimeAllowed && extraTimeMinutes > 0 ? (
          <View className="w-24 items-center">
            <View
              className={`px-3 py-2 rounded-lg items-center justify-center ${isInExtraTime ? 'bg-yellow-400' : 'bg-black'}`}
              style={{ opacity: isInExtraTime ? 1 : 0.45 }}
            >
              <Text className={`${isInExtraTime ? 'text-white font-bold' : 'text-white text-sm'}`}>Extra time</Text>
            </View>
          </View>
        ) : (
          // spacer to keep symmetry when extra-time isn't present
          <View className="w-16" />
        )}
      </View>

      {/* Modal (unchanged) */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        onRequestClose={() => {
          setShowEventModal(false);
          resetEventForm();
        }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <SafeAreaView className="flex-1 bg-white mt-12">
            <View className="flex-row items-center justify-between p-4 border-b border-slate-200">
              <TouchableOpacity onPress={() => { setShowEventModal(false); resetEventForm(); }}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-slate-900">
                Add Event - {selectedTeam === 'my' ? matchData.myTeam.teamName : matchData.opponentTeam.teamName}
              </Text>
              <TouchableOpacity onPress={handleCreateEvent} className="bg-blue-600 px-4 py-2 rounded-lg">
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Event Type selection */}
              <Text className="text-lg font-bold text-slate-900 mb-3">Event Type</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {Object.entries(EVENT_CONFIGS).map(([key, config]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => { setSelectedEventType(key); setSelectedSubType(null); }}
                    className={`flex-row items-center px-4 py-3 rounded-xl border ${selectedEventType === key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
                  >
                    {key === 'card' ? (
                      <View className="w-5 h-7 rounded-sm mr-2" style={{ backgroundColor: config.color }} />
                    ) : (
                      <View className="w-6 h-6 rounded-full items-center justify-center mr-2" style={{ backgroundColor: config.color }}>
                        <Ionicons name={config.icon} size={12} color="white" />
                      </View>
                    )}
                    <Text className={`font-medium ${selectedEventType === key ? 'text-blue-700' : 'text-slate-700'}`}>{config.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sub types */}
              {selectedEventType && EVENT_CONFIGS[selectedEventType as keyof typeof EVENT_CONFIGS]?.subTypes?.length > 0 && (
                <>
                  <Text className="text-lg font-bold text-slate-900 mb-3">Sub Type</Text>
                  <View className="flex-row flex-wrap gap-2 mb-6">
                    {EVENT_CONFIGS[selectedEventType as keyof typeof EVENT_CONFIGS].subTypes.map((subType) => (
                      <TouchableOpacity
                        key={subType.id}
                        onPress={() => setSelectedSubType(subType.id)}
                        className={`px-4 py-2 rounded-lg border ${selectedSubType === subType.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
                      >
                        <Text className={`${selectedSubType === subType.id ? 'text-blue-700' : 'text-slate-700'}`}>{subType.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Player selection */}
              <Text className="text-lg font-bold text-slate-900 mb-3">Player</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <View className="flex-row gap-2">
                  {getCurrentPlayers().map((player) => (
                    <TouchableOpacity
                      key={player.id}
                      onPress={() => setSelectedPlayer(player)}
                      className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${selectedPlayer?.id === player.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
                    >
                      <Text className={`font-medium ${selectedPlayer?.id === player.id ? 'text-blue-700' : 'text-slate-700'}`}>{player.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Assist player */}
              {selectedEventType === 'goal' && (
                <>
                  <Text className="text-lg font-bold text-slate-900 mb-3">Assist Player (Optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                    <View className="flex-row gap-2">
                      <TouchableOpacity onPress={() => setSelectedAssistPlayer(null)} className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${!selectedAssistPlayer ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                        <Text className={`font-medium ${!selectedAssistPlayer ? 'text-blue-700' : 'text-slate-700'}`}>No Assist</Text>
                      </TouchableOpacity>
                      {getCurrentPlayers().filter((p) => p.id !== selectedPlayer?.id).map((player) => (
                        <TouchableOpacity
                          key={player.id}
                          onPress={() => setSelectedAssistPlayer(player)}
                          className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${selectedAssistPlayer?.id === player.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
                        >
                          <Text className={`font-medium ${selectedAssistPlayer?.id === player.id ? 'text-blue-700' : 'text-slate-700'}`}>{player.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              {/* Minute input */}
              <Text className="text-lg font-bold text-slate-900 mb-3">Minute</Text>
              <View className="mb-6">
                <TextInput value={eventMinute} onChangeText={setEventMinute} placeholder="Auto-populated from timer" keyboardType="numeric" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg" />
                <Text className="text-xs text-slate-500 mt-2">Current timer minute: {formattedTimer}</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}