import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// STORES
import { useKnockoutStore, KnockoutMatchEvent } from '@/store/knockoutTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';
import { FootballPlayer } from '@/types/addingMemberTypes';

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
  substitution: { name: 'Substitution', icon: 'swap-horizontal' as const, color: '#6366f1', subTypes: [] },
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
  corner: { name: 'Corner', icon: 'flag' as const, color: '#8b5cf6', subTypes: [] },
  offside: { name: 'Offside', icon: 'flag-outline' as const, color: '#ef4444', subTypes: [] },
};

// Helper for card colors
const getCardColor = (eventType: string, eventSubType?: string): string => {
  if (eventType === 'card') {
    if (eventSubType === 'red_card' || eventSubType === 'second_yellow') return '#ef4444';
    if (eventSubType === 'yellow_card') return '#fbbf24';
  }
  return '#f59e0b';
};

export default function KnockoutMatchScoringScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tournamentId = params.tournamentId as string;
  const fixtureId = params.fixtureId as string;

  // Stores
  const { 
    activeMatch, 
    addEvent, 
    endMatch,
    startMatch
  } = useKnockoutStore();

  const { players: allPlayers } = useFootballStore();

  // Local UI state
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  
  const [selectedPlayer, setSelectedPlayer] = useState<FootballPlayer | null>(null);
  const [selectedAssistPlayer, setSelectedAssistPlayer] = useState<FootballPlayer | null>(null);
  const [eventMinuteInput, setEventMinuteInput] = useState('');

  // Timer tick
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000); 
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formattedTimer = useMemo(() => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [seconds]);

  const events = useMemo(() => activeMatch?.events ?? [], [activeMatch]);

  /* -------------------------------------------------------------------------- */
  /* ROSTER CALCULATION                                                       */
  /* -------------------------------------------------------------------------- */
  const calculateRealTimeSquads = useCallback((teamSide: 'home' | 'away') => {
    if (!activeMatch) return { active: [], bench: [] };

    const isHome = teamSide === 'home';
    const teamId = isHome ? activeMatch.homeTeamId : activeMatch.awayTeamId;
    
    // 1. Get Initial IDs
    const starterIds = isHome ? activeMatch.homeTeamPlayers : activeMatch.awayTeamPlayers;
    const subIds = isHome ? activeMatch.homeTeamSubstitutes : activeMatch.awayTeamSubstitutes;

    // 2. Resolve IDs to Objects
    const starterPlayers = starterIds
      .map(id => allPlayers.find(p => p.id === id))
      .filter((p): p is FootballPlayer => !!p);

    const benchPlayers = subIds
      .map(id => allPlayers.find(p => p.id === id))
      .filter((p): p is FootballPlayer => !!p);
    
    // 3. Calculate "Current Active" based on events (Substitutions)
    let currentActive = [...starterPlayers];
    let currentBench = [...benchPlayers]; 

    // Replay substitutions
    events.forEach(ev => {
       if (ev.teamId === teamId && ev.eventType === 'substitution') {
         // Player OUT
         currentActive = currentActive.filter(p => p.id !== ev.playerId);
         // Player IN
         const playerIn = allPlayers.find(p => p.id === ev.assistPlayerId);
         if (playerIn) {
            currentBench = currentBench.filter(p => p.id !== ev.assistPlayerId);
            currentActive.push(playerIn);
         }
       }
    });

    return { active: currentActive, bench: currentBench };
  }, [activeMatch, allPlayers, events]);

  const homeSquad = useMemo(() => calculateRealTimeSquads('home'), [calculateRealTimeSquads]);
  const awaySquad = useMemo(() => calculateRealTimeSquads('away'), [calculateRealTimeSquads]);

  // Ensure activeMatch exists before rendering
  if (!activeMatch) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100 items-center justify-center">
        <Text className="text-slate-500 text-lg">Loading match data...</Text>
      </SafeAreaView>
    );
  }

  const parseMinuteAndSeconds = (input: string) => {
    const parts = input.split(':').map((p) => p.trim());
    const minute = parseInt(parts[0] || '0', 10);
    const secs = parts[1] ? parseInt(parts[1].slice(0, 2), 10) : 0;
    return {
      minute: isNaN(minute) ? 0 : minute,
      seconds: isNaN(secs) ? 0 : secs,
    };
  };

  const handleCreateEvent = () => {
    // Validation
    if (!selectedEventType || !selectedPlayer || !selectedTeam) {
      Alert.alert('Error', 'Please select team, event type and player');
      return;
    }

    if (selectedEventType === 'substitution' && !selectedAssistPlayer) {
      Alert.alert('Error', 'Please select the incoming player (Player IN).');
      return;
    }

    const minuteSource = eventMinuteInput.trim().length ? eventMinuteInput.trim() : formattedTimer;
    const { minute, seconds: eventSecs } = parseMinuteAndSeconds(minuteSource);
    
    // FIX: Explicitly resolve teamId string here
    const teamId = selectedTeam === 'home' ? activeMatch.homeTeamId : activeMatch.awayTeamId;

    if (!teamId) {
        Alert.alert("Error", "Team ID not found.");
        return;
    }

    addEvent({
      teamId: teamId, // Now strongly typed as string
      eventType: selectedEventType as any,
      eventSubType: selectedSubType || undefined,
      playerId: selectedPlayer.id, 
      playerName: selectedPlayer.name,
      assistPlayerId: selectedAssistPlayer?.id, 
      assistPlayerName: selectedAssistPlayer?.name,
      minute,
      seconds: eventSecs,
      isExtraTime: false,
    });

    // Reset modal
    setShowEventModal(false);
    setSelectedEventType(null);
    setSelectedSubType(null);
    setSelectedPlayer(null);
    setSelectedAssistPlayer(null);
    setEventMinuteInput('');
    setSelectedTeam(null);
  };

  const handleEndMatch = () => {
    Alert.alert(
      'End Match',
      'Are you sure? This will finalize the result and advance the winner.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: () => {
            endMatch();
            router.push(`/(football)/startKnockOutTournament/${tournamentId}/dashboard`)
          }
          
            
          
        },
      ]
    );
  };

  // UI Helpers
  const handleAddEventPress = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    setEventMinuteInput(formattedTimer);
    setShowEventModal(true);
  };

  const getCurrentSquad = () => (selectedTeam === 'home' ? homeSquad : awaySquad);

  const renderEventCard = (ev: KnockoutMatchEvent) => {
    const cfg = EVENT_CONFIGS[ev.eventType as keyof typeof EVENT_CONFIGS];
    const isHome = ev.teamId === activeMatch.homeTeamId;
    if (!cfg) return null;

    let mainText = cfg.name;
    let subText = ev.playerName;

    if (ev.eventType === 'substitution') {
        mainText = "Substitution";
        subText = `IN: ${ev.assistPlayerName} \nOUT: ${ev.playerName}`;
    } else {
         if(ev.eventSubType) mainText += ` - ${cfg.subTypes?.find(s => s.id === ev.eventSubType)?.name || ''}`;
         if(ev.assistPlayerName) subText += ` (Assist: ${ev.assistPlayerName})`;
    }

    return (
      <View key={ev.id} className="flex-row mb-4">
        <View className="bg-slate-800 rounded-l-xl py-3 px-4 items-center justify-center">
          <Text className="text-white text-lg font-bold">{ev.minute}:{String(ev.seconds ?? 0).padStart(2, '0')}'</Text>
        </View>
        <View className={`flex-1 bg-white rounded-r-xl py-3 px-4 border-l-4 ml-1 ${isHome ? 'border-green-500' : 'border-red-500'}`} style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
          <View className={`flex-row items-center ${isHome ? 'justify-start' : 'justify-end'}`}>
            {isHome && (
                ev.eventType === 'card' ? (
                    <View className="w-8 h-12 rounded-sm items-center justify-center mr-3" style={{ backgroundColor: getCardColor(ev.eventType, ev.eventSubType) }} />
                ) : (
                    <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: cfg.color }}>
                        <Ionicons name={cfg.icon} size={16} color="white" />
                    </View>
                )
            )}
            <View className={isHome ? 'items-start' : 'items-end'}>
              <Text className="text-base font-bold text-slate-900">{mainText}</Text>
              <Text className={`text-sm text-slate-600 ${isHome ? 'text-left' : 'text-right'}`}>
                {subText}
              </Text>
            </View>
            {!isHome && (
                ev.eventType === 'card' ? (
                    <View className="w-8 h-12 rounded-sm items-center justify-center ml-3" style={{ backgroundColor: getCardColor(ev.eventType, ev.eventSubType) }} />
                ) : (
                    <View className="w-8 h-8 rounded-full items-center justify-center ml-3" style={{ backgroundColor: cfg.color }}>
                        <Ionicons name={cfg.icon} size={16} color="white" />
                    </View>
                )
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=2340&q=80' }}
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

          <View className="flex-1 justify-center px-4 mb-16">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => handleAddEventPress('home')} className="items-center flex-1">
                <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-2 border-2 border-white/30">
                  <Ionicons name="shield" size={40} color="white" />
                </View>
                <Text className="text-white text-sm font-medium text-center mb-1">{activeMatch.homeTeamName}</Text>
                <Text className="text-white text-4xl font-bold">{activeMatch.homeScore}</Text>
              </TouchableOpacity>

              <View className="px-8">
                <Text className="text-white text-2xl font-bold">VS</Text>
              </View>

              <TouchableOpacity onPress={() => handleAddEventPress('away')} className="items-center flex-1">
                <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-2 border-2 border-white/30">
                  <Ionicons name="shield-outline" size={40} color="white" />
                </View>
                <Text className="text-white text-sm font-medium text-center mb-1">{activeMatch.awayTeamName}</Text>
                <Text className="text-white text-4xl font-bold">{activeMatch.awayScore}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {events.length > 0 ? (
          <>
            <Text className="text-lg font-bold text-slate-900 mb-4">Match Timeline ({events.length})</Text>
            {[...events].reverse().map((ev) => renderEventCard(ev))}
          </>
        ) : (
          <View className="items-center justify-center py-16">
            <Ionicons name="football" size={48} color="#94a3b8" />
            <Text className="text-slate-500 text-lg font-medium mt-4">No events yet</Text>
            <Text className="text-slate-400 text-sm mt-2">Tap teams to add goals or cards.</Text>
          </View>
        )}
      </ScrollView>

      <View className="flex-row items-center p-3 bg-slate-900 border-t border-white">
        <View className="w-16 items-center">
          <TouchableOpacity onPress={() => setIsRunning(!isRunning)} className="bg-white/30 p-3 rounded-full">
            <Ionicons name={isRunning ? 'pause' : 'play'} size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center">
          <TouchableOpacity onPress={handleEndMatch} className="bg-red-600 rounded-2xl px-8 py-4 items-center justify-center" style={{ minWidth: 180 }}>
            <View className="flex-row items-center">
              <Ionicons name="stop-circle" size={20} color="white" />
              <Text className="text-white font-bold text-xl ml-3">End Match</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View className="w-16" />
      </View>

      {/* Event Modal */}
      <Modal visible={showEventModal} animationType="slide" onRequestClose={() => setShowEventModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <SafeAreaView className="flex-1 bg-white mt-12">
            <View className="flex-row items-center justify-between p-4 border-b border-slate-200">
              <TouchableOpacity onPress={() => setShowEventModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-slate-900">Add Event</Text>
              <TouchableOpacity onPress={handleCreateEvent} className="bg-blue-600 px-4 py-2 rounded-lg">
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
              {/* Event Type */}
              <Text className="text-lg font-bold text-slate-900 mb-3">Event Type</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {Object.entries(EVENT_CONFIGS).map(([key, cfg]) => (
                  <TouchableOpacity key={key} onPress={() => { setSelectedEventType(key); setSelectedSubType(null); setSelectedPlayer(null); setSelectedAssistPlayer(null); }} className={`flex-row items-center px-4 py-3 rounded-xl border ${selectedEventType === key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                    <View className="w-6 h-6 rounded-full items-center justify-center mr-2" style={{ backgroundColor: cfg.color }}>
                      <Ionicons name={cfg.icon} size={12} color="white" />
                    </View>
                    <Text className={`${selectedEventType === key ? 'text-blue-700' : 'text-slate-700'} font-medium`}>{cfg.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sub-Type Selection */}
              {selectedEventType && EVENT_CONFIGS[selectedEventType as keyof typeof EVENT_CONFIGS]?.subTypes?.length > 0 && (
                <>
                  <Text className="text-lg font-bold text-slate-900 mb-3">Sub Type</Text>
                  <View className="flex-row flex-wrap gap-2 mb-6">
                    {EVENT_CONFIGS[selectedEventType as keyof typeof EVENT_CONFIGS].subTypes.map((st) => (
                      <TouchableOpacity key={st.id} onPress={() => setSelectedSubType(st.id)} className={`px-4 py-2 rounded-lg border ${selectedSubType === st.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                        <Text className={`${selectedSubType === st.id ? 'text-blue-700' : 'text-slate-700'}`}>{st.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* DYNAMIC PLAYER SELECTION */}
              <Text className="text-lg font-bold text-slate-900 mb-3">
                {selectedEventType === 'substitution' ? 'Player OUT (Active)' : 'Player'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <View className="flex-row gap-2">
                  {getCurrentSquad().active.map((p) => (
                    <TouchableOpacity key={p.id} onPress={() => setSelectedPlayer(p)} className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${selectedPlayer?.id === p.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                      <Text className={`${selectedPlayer?.id === p.id ? 'text-blue-700' : 'text-slate-700'} font-medium`}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {getCurrentSquad().active.length === 0 && (
                    <Text className="text-slate-400 italic p-2">No active players found.</Text>
                  )}
                </View>
              </ScrollView>

              {/* SECONDARY PLAYER SELECTION */}
              {selectedEventType === 'substitution' ? (
                <>
                  <Text className="text-lg font-bold text-slate-900 mb-3">Player IN (Bench)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                    <View className="flex-row gap-2">
                        {getCurrentSquad().bench.length > 0 ? (
                          getCurrentSquad().bench.map((p) => (
                            <TouchableOpacity key={p.id} onPress={() => setSelectedAssistPlayer(p)} className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${selectedAssistPlayer?.id === p.id ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'}`}>
                              <Text className={`font-medium ${selectedAssistPlayer?.id === p.id ? 'text-green-700' : 'text-slate-700'}`}>{p.name}</Text>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <Text className="text-slate-400 p-2 italic">Bench empty. Check setup.</Text>
                        )}
                    </View>
                  </ScrollView>
                </>
              ) : (
                selectedEventType === 'goal' && (
                  <>
                    <Text className="text-lg font-bold text-slate-900 mb-3">Assist Player (Optional)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                      <View className="flex-row gap-2">
                        <TouchableOpacity onPress={() => setSelectedAssistPlayer(null)} className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${!selectedAssistPlayer ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                          <Text className={`font-medium ${!selectedAssistPlayer ? 'text-blue-700' : 'text-slate-700'}`}>No Assist</Text>
                        </TouchableOpacity>
                        {getCurrentSquad().active.filter((pp) => pp.id !== selectedPlayer?.id).map((p) => (
                          <TouchableOpacity key={p.id} onPress={() => setSelectedAssistPlayer(p)} className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${selectedAssistPlayer?.id === p.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                            <Text className={`font-medium ${selectedAssistPlayer?.id === p.id ? 'text-blue-700' : 'text-slate-700'}`}>{p.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </>
                )
              )}

              <Text className="text-lg font-bold text-slate-900 mb-3">Minute</Text>
              <View className="mb-6">
                <TextInput value={eventMinuteInput} onChangeText={setEventMinuteInput} placeholder="MM or MM:SS" keyboardType="numeric" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg" />
                <Text className="text-xs text-slate-500 mt-2">Current timer: {formattedTimer}</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}