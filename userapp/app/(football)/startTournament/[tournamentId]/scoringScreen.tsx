// app/(football)/tournaments/[tournamentId]/scoringScreen.tsx
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useTournamentStore } from '@/store/footballTournamentStore';
import { useMatchExecutionStore } from '@/store/footballMatchEventStore';
import { useFootballStore } from '@/store/footballTeamStore';
import { FootballPlayer } from '@/types/addingMemberTypes';

/* Event configs same as your other screen (keeps UI consistent) */
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

export default function TournamentMatchScoringScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tournamentId = params.tournamentId as string;
  const fixtureId = params.fixtureId as string;

  // stores
  const {
    activeTournamentMatch,
    initializeTournamentMatch,
    setTournamentMatchPlayers,
    setTournamentMatchCaptains,
    setTournamentMatchReferees,
    addTournamentMatchEvent,
    endTournamentMatch,
    getTournament,
  } = useTournamentStore();

  const {
    activeMatch,
    startMatch,
    addEvent: addLiveEvent,
    endMatch: endLiveMatch,
    getCurrentMatchTime,
    getTeamScore,
    getTeamEvents,
    updateMatchStatus,
  } = useMatchExecutionStore();

  const { players } = useFootballStore();

  // Local UI state for modal/event selection
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<FootballPlayer | null>(null);
  const [selectedAssistPlayer, setSelectedAssistPlayer] = useState<FootballPlayer | null>(null);
  const [eventMinuteInput, setEventMinuteInput] = useState(''); // accepts "MM" or "MM:SS"

  
 
  // When tournament match is present, start a live match in matchExecution store (if not already started)
  useEffect(() => {
    if (activeTournamentMatch && !activeMatch) {
      // Build a minimal MatchCreationData-like object expected by matchExecution.startMatch
      const matchSetup = {
        id: `tourney_${activeTournamentMatch.fixtureId}`,
        myTeam: {
          teamId: activeTournamentMatch.homeTeamId,
          selectedPlayers: activeTournamentMatch.homeTeamPlayers || [],
          substitutes: [], // you can fill substitutes if you track them earlier
        },
        opponentTeam: {
          teamId: activeTournamentMatch.awayTeamId,
          selectedPlayers: activeTournamentMatch.awayTeamPlayers || [],
          substitutes: [],
        },
        referees: (activeTournamentMatch.referees || []).map((r) => ({ name: r })),
        venue: { name: '' },
      };
      startMatch(matchSetup as any); // store expects MatchCreationData; this minimal object works with the store's calculations
      // also mirror tournament match status
      updateMatchStatus('in_progress');
    }
  }, [activeTournamentMatch, activeMatch, startMatch, updateMatchStatus]);

  // Timer (derived from matchExecution.getCurrentMatchTime)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => s + 1), 500); // 2x/sec for responsive timer display
    return () => clearInterval(t);
  }, []);

  const currentTime = useMemo(() => getCurrentMatchTime(), [tick, getCurrentMatchTime]);
  const formattedTimer = `${String(currentTime.minutes).padStart(2, '0')}:${String(currentTime.seconds).padStart(2, '0')}`;

  // Teams/players shown in UI (map ids to player objects)
  const homePlayers = useMemo(() => {
    const ids = activeTournamentMatch?.homeTeamPlayers || [];
    return ids.map((id) => players.find((p) => p.id === id)).filter(Boolean) as FootballPlayer[];
  }, [activeTournamentMatch?.homeTeamPlayers, players]);

  const awayPlayers = useMemo(() => {
    const ids = activeTournamentMatch?.awayTeamPlayers || [];
    return ids.map((id) => players.find((p) => p.id === id)).filter(Boolean) as FootballPlayer[];
  }, [activeTournamentMatch?.awayTeamPlayers, players]);

  const liveHomeScore = useMemo(() => getTeamScore(activeMatch?.matchSetup.myTeam.teamId || ''), [getTeamScore, activeMatch]);
  const liveAwayScore = useMemo(() => getTeamScore(activeMatch?.matchSetup.opponentTeam.teamId || ''), [getTeamScore, activeMatch]);

  const events = useMemo(() => {
    // prefer matchExecution events (has seconds), fall back to tournament events
    return activeMatch?.events ?? activeTournamentMatch?.events ?? [];
  }, [activeMatch, activeTournamentMatch]);

  // Helper to parse minute input (MM or MM:SS)
  const parseMinuteAndSeconds = (input: string) => {
    const parts = input.split(':').map((p) => p.trim());
    const minute = parseInt(parts[0] || '0', 10);
    const seconds = parts[1] ? parseInt(parts[1].slice(0, 2), 10) : 0;
    return {
      minute: isNaN(minute) ? 0 : minute,
      seconds: isNaN(seconds) ? 0 : seconds,
    };
  };

  // Add event: push to matchExecution (with seconds) and to tournament store (tournament doesn't have seconds)
  const handleCreateEvent = async () => {
    if (!selectedEventType || !selectedPlayer || !selectedTeam) {
      Alert.alert('Error', 'Please select team, event type and player');
      return;
    }

    // if user didn't edit minute field, use current time
    const minuteSource = eventMinuteInput.trim().length ? eventMinuteInput.trim() : formattedTimer;
    const { minute, seconds } = parseMinuteAndSeconds(minuteSource);

    // isExtraTime: we mark it if minute > 90 (you can refine using tournament.settings.matchDuration)
    const isExtraTime = minute > (getTournament(tournamentId)?.settings.matchDuration ?? 90);

    // Compose payload for matchExecution store (includes seconds)
    const livePayload: any = {
      teamId: selectedTeam === 'home' ? activeMatch?.matchSetup.myTeam.teamId : activeMatch?.matchSetup.opponentTeam.teamId,
      eventType: selectedEventType,
      eventSubType: selectedSubType,
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      assistPlayerId: selectedAssistPlayer?.id,
      assistPlayerName: selectedAssistPlayer?.name,
      minute,
      seconds,
      isExtraTime,
    };

    // Add to matchExecution live store (updates live score)
    addLiveEvent(livePayload);

    // Also add compatible event to tournament store (tournament event shape doesn't include seconds)
    const tournamentPayload = {
      teamId: livePayload.teamId,
      eventType: livePayload.eventType,
      eventSubType: livePayload.eventSubType,
      playerId: livePayload.playerId,
      playerName: livePayload.playerName,
      assistPlayerId: livePayload.assistPlayerId,
      assistPlayerName: livePayload.assistPlayerName,
      minute: livePayload.minute,
      isExtraTime: livePayload.isExtraTime,
    };
    // This uses tournament store's addTournamentMatchEvent and will update tournament activeTournamentMatch home/away scores
    addTournamentMatchEvent(tournamentPayload as any);

    // Reset modal
    setShowEventModal(false);
    setSelectedEventType(null);
    setSelectedSubType(null);
    setSelectedPlayer(null);
    setSelectedAssistPlayer(null);
    setEventMinuteInput('');
    setSelectedTeam(null);
  };

  // End match: end live match, then sync results into tournament store and call tournament end
  const handleEndMatch = useCallback(() => {
    Alert.alert(
      'End Match',
      'Are you sure you want to end this match? This will save the result to the tournament.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: () => {
            // End live match in matchExecution store (this will move it to completedMatches or return CompletedMatch)
            const completed = endLiveMatch?.();
            // sync into tournament store
            // 1) ensure tournament active match exists (it should)
            if (!activeTournamentMatch) {
              Alert.alert('Error', 'Tournament active match not found for sync');
              return;
            }

            // 2) make sure tournament active match has players/referees/captains set (we assume earlier steps did this).
            // We explicitly run setters (no-op if same).
            setTournamentMatchPlayers(activeTournamentMatch.homeTeamPlayers, activeTournamentMatch.awayTeamPlayers);
            if (activeTournamentMatch.homeCaptain && activeTournamentMatch.awayCaptain) {
              setTournamentMatchCaptains(activeTournamentMatch.homeCaptain, activeTournamentMatch.awayCaptain);
            }
            if (activeTournamentMatch.referees && activeTournamentMatch.referees.length > 0) {
              setTournamentMatchReferees(activeTournamentMatch.referees);
            }

            // 3) push events from completed (or from live activeMatch.events if completed not returned)
            const finalEvents = completed?.events ?? activeMatch?.events ?? [];
            finalEvents.forEach((ev: any) => {
              // tournament store expects no seconds; we pass minute + isExtraTime
              addTournamentMatchEvent({
                teamId: ev.teamId,
                eventType: ev.eventType,
                eventSubType: ev.eventSubType,
                playerId: ev.playerId,
                playerName: ev.playerName,
                assistPlayerId: ev.assistPlayerId,
                assistPlayerName: ev.assistPlayerName,
                minute: ev.minute,
                isExtraTime: ev.isExtraTime || false,
              } as any);
            });

            // 4) override activeTournamentMatch scores to match live final scores (tournament.addTournamentMatchEvent already updates scores when adding goal events)
            // Finally call tournament end function which updates fixture & standings
            endTournamentMatch();
            // navigate back to tournament dashboard
            router.push(`/(football)/startTournament/${tournamentId}`);
          },
        },
      ]
    );
  }, [
    endLiveMatch,
    activeTournamentMatch,
    setTournamentMatchPlayers,
    setTournamentMatchCaptains,
    setTournamentMatchReferees,
    addTournamentMatchEvent,
    endTournamentMatch,
    router,
    tournamentId,
    activeMatch,
  ]);

  // UI helpers
  const handleAddEventPress = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    setEventMinuteInput(formattedTimer);
    setShowEventModal(true);
  };

  const getCurrentPlayers = useCallback(() => (selectedTeam === 'home' ? homePlayers : awayPlayers), [selectedTeam, homePlayers, awayPlayers]);

  const renderEventCard = (ev: any) => {
    const cfg = EVENT_CONFIGS[ev.eventType as keyof typeof EVENT_CONFIGS];
    const isHome = ev.teamId === activeMatch?.matchSetup.myTeam.teamId;
    if (!cfg) return null;
    return (
      <View key={ev.id} className="flex-row mb-4">
        <View className="bg-slate-800 rounded-l-xl py-3 px-4 items-center justify-center">
          <Text className="text-white text-lg font-bold">{ev.minute}:{String(ev.seconds ?? 0).padStart(2, '0')}'</Text>
        </View>
        <View className={`flex-1 bg-white rounded-r-xl py-3 px-4 border-l-4 ml-1 ${isHome ? 'border-green-500' : 'border-red-500'}`}>
          <View className={`flex-row items-center ${isHome ? 'justify-start' : 'justify-end'}`}>
            {isHome && (
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: cfg.color }}>
                <Ionicons name={cfg.icon} size={16} color="white" />
              </View>
            )}
            <View className={isHome ? 'items-start' : 'items-end'}>
              <Text className="text-base font-bold text-slate-900">
                {cfg.name}{ev.eventSubType ? ` - ${cfg.subTypes?.find(s => s.id === ev.eventSubType)?.name || ''}` : ''}
              </Text>
              <Text className="text-sm text-slate-600">
                {ev.playerName}{ev.assistPlayerName ? ` (Assist: ${ev.assistPlayerName})` : ''}
              </Text>
              <Text className={`text-xs font-medium ${isHome ? 'text-green-600' : 'text-red-600'}`}>
                {isHome ? activeTournamentMatch?.homeTeamName : activeTournamentMatch?.awayTeamName}
              </Text>
            </View>
            {!isHome && (
              <View className="w-8 h-8 rounded-full items-center justify-center ml-3" style={{ backgroundColor: cfg.color }}>
                <Ionicons name={cfg.icon} size={16} color="white" />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!activeTournamentMatch) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100 items-center justify-center">
        <Text className="text-slate-500 text-lg">No tournament match selected</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
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
                <Text className="text-white text-sm font-medium text-center mb-1">{activeTournamentMatch.homeTeamName}</Text>
                <Text className="text-white text-4xl font-bold">{liveHomeScore ?? 0}</Text>
              </TouchableOpacity>

              <View className="px-8">
                <Text className="text-white text-2xl font-bold">VS</Text>
              </View>

              <TouchableOpacity onPress={() => handleAddEventPress('away')} className="items-center flex-1">
                <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-2 border-2 border-white/30">
                  <Ionicons name="shield-outline" size={40} color="white" />
                </View>
                <Text className="text-white text-sm font-medium text-center mb-1">{activeTournamentMatch.awayTeamName}</Text>
                <Text className="text-white text-4xl font-bold">{liveAwayScore ?? 0}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {events.length > 0 ? (
          <>
            <Text className="text-lg font-bold text-slate-900 mb-4">Match Timeline ({events.length})</Text>
            {[...events].sort((a, b) => (a.minute - b.minute) || ((a.seconds ?? 0) - (b.seconds ?? 0))).map((ev) => renderEventCard(ev))}
          </>
        ) : (
          <View className="items-center justify-center py-16">
            <Ionicons name="football" size={48} color="#94a3b8" />
            <Text className="text-slate-500 text-lg font-medium mt-4">No events yet</Text>
            <Text className="text-slate-400 text-sm mt-2">Tap the team buttons above to add match events</Text>
          </View>
        )}
      </ScrollView>

      <View className="flex-row items-center p-3 bg-slate-900 border-t border-white">
        <View className="w-16 items-center">
          <TouchableOpacity onPress={() => updateMatchStatus(activeMatch?.status === 'in_progress' ? 'half_time' : 'in_progress')} className="bg-white/30 p-3 rounded-full">
            <Ionicons name={activeMatch?.status === 'in_progress' ? 'pause' : 'play'} size={22} color="white" />
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
              <Text className="text-lg font-bold text-slate-900">
                Add Event - {selectedTeam === 'home' ? activeTournamentMatch.homeTeamName : activeTournamentMatch.awayTeamName}
              </Text>
              <TouchableOpacity onPress={handleCreateEvent} className="bg-blue-600 px-4 py-2 rounded-lg">
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
              <Text className="text-lg font-bold text-slate-900 mb-3">Event Type</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {Object.entries(EVENT_CONFIGS).map(([key, cfg]) => (
                  <TouchableOpacity key={key} onPress={() => { setSelectedEventType(key); setSelectedSubType(null); }} className={`flex-row items-center px-4 py-3 rounded-xl border ${selectedEventType === key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                    <View className="w-6 h-6 rounded-full items-center justify-center mr-2" style={{ backgroundColor: cfg.color }}>
                      <Ionicons name={cfg.icon} size={12} color="white" />
                    </View>
                    <Text className={`${selectedEventType === key ? 'text-blue-700' : 'text-slate-700'} font-medium`}>{cfg.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

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

              <Text className="text-lg font-bold text-slate-900 mb-3">Player</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <View className="flex-row gap-2">
                  {getCurrentPlayers().map((p) => (
                    <TouchableOpacity key={p.id} onPress={() => setSelectedPlayer(p)} className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${selectedPlayer?.id === p.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                      <Text className={`${selectedPlayer?.id === p.id ? 'text-blue-700' : 'text-slate-700'} font-medium`}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {selectedEventType === 'goal' && (
                <>
                  <Text className="text-lg font-bold text-slate-900 mb-3">Assist Player (Optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                    <View className="flex-row gap-2">
                      <TouchableOpacity onPress={() => setSelectedAssistPlayer(null)} className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${!selectedAssistPlayer ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                        <Text className={`font-medium ${!selectedAssistPlayer ? 'text-blue-700' : 'text-slate-700'}`}>No Assist</Text>
                      </TouchableOpacity>
                      {getCurrentPlayers().filter((pp) => pp.id !== selectedPlayer?.id).map((p) => (
                        <TouchableOpacity key={p.id} onPress={() => setSelectedAssistPlayer(p)} className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${selectedAssistPlayer?.id === p.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                          <Text className={`font-medium ${selectedAssistPlayer?.id === p.id ? 'text-blue-700' : 'text-slate-700'}`}>{p.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
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
