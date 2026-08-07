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
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMatchCreationStore } from '@/store/footballMatchCreationStore';
import { useMatchExecutionStore } from '@/store/footballMatchEventStore';
import { useFootballStore } from '@/store/footballTeamStore';
import { FootballProfile, MatchEvent } from '@/types/football';

// UPDATED EVENT CONFIGS
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
  save: {
    name: 'Save',
    icon: 'hand-left' as const,
    color: '#3b82f6',
    subTypes: [],
  },
  penalty: {
    name: 'Penalty',
    icon: 'radio-button-on' as const,
    color: '#8b5cf6',
    subTypes: [],
  },
  free_kick: {
    name: 'Free Kick',
    icon: 'arrow-redo' as const,
    color: '#8b5cf6',
    subTypes: [],
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

const getCardColor = (eventType: string, eventSubType?: string): string => {
  if (eventType === 'yellow_card' || eventSubType === 'yellow_card') return '#fbbf24';
  if (eventType === 'red_card' || eventSubType === 'red_card' || eventSubType === 'second_yellow') return '#ef4444';
  return '#f59e0b';
};

/** Maps the UI's category+subtype picker onto the server's flat event-type
 *  vocabulary — only 'goal'/'own_goal'/'yellow_card'/'red_card' affect the
 *  score/stats server-side, everything else is stored as informational. */
const resolveServerEventType = (category: string, subType: string | null): string => {
  if (category === 'goal') return subType === 'own_goal' ? 'own_goal' : 'goal';
  if (category === 'card') return subType === 'red_card' || subType === 'second_yellow' ? 'red_card' : 'yellow_card';
  return category;
};

export default function MatchScoringScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tournamentId?: string; format?: 'league' | 'knockout' }>();
  const isTournamentMatch = !!params.tournamentId;
  const isKnockout = params.format === 'knockout';
  const { matchData } = useMatchCreationStore();
  const { getTeamById } = useFootballStore();
  const {
    activeMatch,
    roster,
    startMatch,
    addEvent,
    endMatch,
    performSubstitution,
    togglePossession,
    pausePossessionSync,
    resumePossessionSync,
  } = useMatchExecutionStore();

  const extraTimeAllowed = matchData?.matchSettings?.extraTimeAllowed;
  const extraTime = matchData?.matchSettings?.extraTimeDuration ?? 0;

  // Timer state
  const [timer, setTimer] = useState<number>(0); // timer in seconds
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

  const [selectedPlayer, setSelectedPlayer] = useState<FootballProfile | null>(null); // Main player or Player out
  const [selectedSubInPlayer, setSelectedSubInPlayer] = useState<FootballProfile | null>(null); // Only for substitutions
  const [selectedAssistPlayer, setSelectedAssistPlayer] = useState<FootballProfile | null>(null);

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

  // Mirrors isTimerRunning for the AppState listener below, which needs the
  // latest value without re-subscribing on every play/pause toggle.
  const isTimerRunningRef = useRef(isTimerRunning);
  useEffect(() => {
    isTimerRunningRef.current = isTimerRunning;
  }, [isTimerRunning]);

  // Possession accrual is server-timestamp-driven (see MatchService), so the
  // app must explicitly tell the server when it stops actively tracking —
  // otherwise the whole backgrounded duration would get silently credited to
  // whichever team held the ball when the app was last in the foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        pausePossessionSync().catch(() => {});
      } else if (nextState === 'active' && isTimerRunningRef.current) {
        resumePossessionSync().catch(() => {});
      }
    });
    return () => subscription.remove();
  }, [pausePossessionSync, resumePossessionSync]);

  // Ticks once a second purely to re-render the live possession bar between
  // real syncs — never sent to the server, just a smooth local estimate.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const possessionSplit = useMemo(() => {
    if (!activeMatch) return { homePct: 50, awayPct: 50 };
    let home = activeMatch.homePossessionSeconds;
    let away = activeMatch.awayPossessionSeconds;
    if (activeMatch.currentPossessionTeamId && activeMatch.possessionStartedAt) {
      const elapsed = Math.max(0, Math.floor((nowTick - new Date(activeMatch.possessionStartedAt).getTime()) / 1000));
      if (activeMatch.currentPossessionTeamId === activeMatch.homeTeamId) home += elapsed;
      else away += elapsed;
    }
    const total = home + away || 1;
    return { homePct: Math.round((home / total) * 100), awayPct: Math.round((away / total) * 100) };
  }, [
    activeMatch?.homePossessionSeconds,
    activeMatch?.awayPossessionSeconds,
    activeMatch?.currentPossessionTeamId,
    activeMatch?.possessionStartedAt,
    activeMatch?.homeTeamId,
    nowTick,
  ]);

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timer]);

  const currentMinute = useMemo(() => Math.floor(timer / 60), [timer]);
  const isInExtraTime = useMemo(() => currentMinute > 90 && extraTimeMinutes > 0, [currentMinute, extraTimeMinutes]);

  useEffect(() => {
    if (!activeMatch && matchData) {
      startMatch(matchData).catch((err: any) => {
        Alert.alert('Error', err.message || 'Could not start match');
      });
    }
  }, [activeMatch, matchData, startMatch]);

  // Team rosters, resolved from the real team records (not a flat "all players" list)
  const myTeamData = getTeamById(matchData?.myTeam?.teamId ?? -1);
  const opponentTeamData = getTeamById(matchData?.opponentTeam?.teamId ?? -1);

  const allRosterPlayers = useMemo(() => {
    const map = new Map<number, FootballProfile>();
    myTeamData?.members.forEach((m) => map.set(m.footballProfile.id, m.footballProfile));
    opponentTeamData?.members.forEach((m) => map.set(m.footballProfile.id, m.footballProfile));
    return map;
  }, [myTeamData, opponentTeamData]);

  const resolvePlayers = (ids: number[]) =>
    ids.map((id) => allRosterPlayers.get(id)).filter((p): p is FootballProfile => !!p);

  const myTeamOnPitch = useMemo(
    () => resolvePlayers(roster?.homeOnPitch ?? matchData?.myTeam?.selectedPlayers ?? []),
    [roster?.homeOnPitch, matchData?.myTeam?.selectedPlayers, allRosterPlayers]
  );
  const myTeamBench = useMemo(
    () => resolvePlayers(roster?.homeBench ?? matchData?.myTeam?.substitutes ?? []),
    [roster?.homeBench, matchData?.myTeam?.substitutes, allRosterPlayers]
  );
  const opponentTeamOnPitch = useMemo(
    () => resolvePlayers(roster?.awayOnPitch ?? matchData?.opponentTeam?.selectedPlayers ?? []),
    [roster?.awayOnPitch, matchData?.opponentTeam?.selectedPlayers, allRosterPlayers]
  );
  const opponentTeamBench = useMemo(
    () => resolvePlayers(roster?.awayBench ?? matchData?.opponentTeam?.substitutes ?? []),
    [roster?.awayBench, matchData?.opponentTeam?.substitutes, allRosterPlayers]
  );

  const events = useMemo(() => activeMatch?.events || [], [activeMatch?.events]);

  const { myTeamScore, opponentTeamScore } = useMemo(() => {
    if (!activeMatch) return { myTeamScore: 0, opponentTeamScore: 0 };
    return { myTeamScore: activeMatch.homeScore, opponentTeamScore: activeMatch.awayScore };
  }, [activeMatch?.homeScore, activeMatch?.awayScore]);

  const resetEventForm = useCallback(() => {
    setSelectedEventType(null);
    setSelectedSubType(null);
    setSelectedPlayer(null);
    setSelectedSubInPlayer(null);
    setSelectedAssistPlayer(null);
    setEventMinute(formattedTimer.toString());
    setSelectedTeam(null);
  }, [formattedTimer]);

  const handlePlayPause = useCallback(() => {
    setIsTimerRunning((prev) => {
      const next = !prev;
      if (next) {
        resumePossessionSync().catch((err: any) => Alert.alert('Error', err.message || 'Could not resume possession tracking'));
      } else {
        pausePossessionSync().catch((err: any) => Alert.alert('Error', err.message || 'Could not pause possession tracking'));
      }
      return next;
    });
  }, [pausePossessionSync, resumePossessionSync]);

  const handleCreateEvent = useCallback(async () => {
    if (!selectedEventType || !selectedPlayer || !eventMinute.trim() || !selectedTeam || !matchData || !activeMatch) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Special validation for substitutions
    if (selectedEventType === 'substitution' && !selectedSubInPlayer) {
      Alert.alert('Error', 'Please select a player coming in from the bench.');
      return;
    }

    let minute: number;
    let seconds: number = 0;

    if (eventMinute.includes(':')) {
      const parts = eventMinute.split(':');
      minute = parseInt(parts[0], 10);
      seconds = parseInt(parts[1], 10);
    } else {
      minute = parseInt(eventMinute, 10);
      seconds = 0;
    }

    if (isNaN(minute) || minute < 0 || minute > 120 || isNaN(seconds) || seconds < 0 || seconds > 59) {
      Alert.alert('Error', 'Invalid time format.');
      return;
    }

    const teamId = selectedTeam === 'my' ? matchData.myTeam.teamId : matchData.opponentTeam.teamId;

    try {
      if (selectedEventType === 'substitution' && selectedSubInPlayer) {
        await performSubstitution(teamId, selectedPlayer.id, selectedSubInPlayer.id, minute, seconds);
      } else {
        await addEvent({
          teamId,
          eventType: resolveServerEventType(selectedEventType, selectedSubType),
          eventSubType: selectedSubType ?? undefined,
          playerId: selectedPlayer.id,
          relatedPlayerId: selectedAssistPlayer?.id,
          minute,
          seconds,
        });
      }
      setShowEventModal(false);
      resetEventForm();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not record event');
    }
  }, [
    selectedEventType, selectedPlayer, selectedSubInPlayer, selectedAssistPlayer,
    selectedTeam, eventMinute, selectedSubType, matchData, activeMatch,
    addEvent, performSubstitution, resetEventForm
  ]);

  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [penaltyHome, setPenaltyHome] = useState('');
  const [penaltyAway, setPenaltyAway] = useState('');

  const goToPostMatchScreen = useCallback(() => {
    if (isTournamentMatch && params.tournamentId) {
      router.push({ pathname: '/(football)/startTournament/[tournamentId]', params: { tournamentId: params.tournamentId } });
    } else {
      router.push('/(football)/landingScreen/matches');
    }
  }, [isTournamentMatch, params.tournamentId, router]);

  const finishMatch = useCallback(async (penaltyScores?: { penaltyHomeScore: number; penaltyAwayScore: number }) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    try {
      await endMatch(penaltyScores);
      setShowPenaltyModal(false);
      goToPostMatchScreen();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not end match');
    }
  }, [endMatch, goToPostMatchScreen]);

  const handleEndMatch = useCallback(() => {
    if (isKnockout && myTeamScore === opponentTeamScore) {
      Alert.alert(
        'Match Tied',
        'This is a knockout match — a winner must be decided by a penalty shootout.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enter Penalty Scores', onPress: () => setShowPenaltyModal(true) },
        ]
      );
      return;
    }

    Alert.alert(
      'End Match',
      'Are you sure you want to end this match? All data will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Match', style: 'destructive', onPress: () => finishMatch() },
      ]
    );
  }, [isKnockout, myTeamScore, opponentTeamScore, finishMatch]);

  const confirmPenaltyShootout = useCallback(() => {
    const home = parseInt(penaltyHome, 10);
    const away = parseInt(penaltyAway, 10);
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      Alert.alert('Error', 'Please enter valid penalty scores.');
      return;
    }
    if (home === away) {
      Alert.alert('Error', 'Penalty shootout cannot end in a tie.');
      return;
    }
    finishMatch({ penaltyHomeScore: home, penaltyAwayScore: away });
  }, [penaltyHome, penaltyAway, finishMatch]);

  const handleAddEvent = useCallback((team: 'my' | 'opponent') => {
    setSelectedTeam(team);
    setEventMinute(formattedTimer);
    setShowEventModal(true);
  }, [formattedTimer]);

  const handleTogglePossession = useCallback((team: 'my' | 'opponent') => {
    if (!matchData) return;
    const teamId = team === 'my' ? matchData.myTeam.teamId : matchData.opponentTeam.teamId;
    togglePossession(teamId).catch((err: any) => {
      Alert.alert('Error', err.message || 'Could not update possession');
    });
  }, [matchData, togglePossession]);

  // Helpers for the modal UI
  const getCurrentPlayersOnPitch = useCallback((): FootballProfile[] => {
    return selectedTeam === 'my' ? myTeamOnPitch : opponentTeamOnPitch;
  }, [selectedTeam, myTeamOnPitch, opponentTeamOnPitch]);

  const getCurrentPlayersOnBench = useCallback((): FootballProfile[] => {
    return selectedTeam === 'my' ? myTeamBench : opponentTeamBench;
  }, [selectedTeam, myTeamBench, opponentTeamBench]);

  const renderEventCard = useCallback((event: MatchEvent) => {
    const isMyTeam = event.teamId === matchData?.myTeam?.teamId;
    const isCard = event.eventType === 'yellow_card' || event.eventType === 'red_card';
    const config = isCard
      ? EVENT_CONFIGS.card
      : EVENT_CONFIGS[event.eventType as keyof typeof EVENT_CONFIGS] ?? EVENT_CONFIGS.goal;

    const player = allRosterPlayers.get(event.playerId ?? -1);
    const relatedPlayer = allRosterPlayers.get(event.relatedPlayerId ?? -1);

    return (
      <View key={event.id} className="flex-row mb-4">
        <View className="bg-slate-800 rounded-l-xl py-3 px-4 items-center justify-center">
          <Text className="text-white text-lg font-bold">{event.minute}:{event.seconds.toString().padStart(2, '0')}'</Text>
        </View>
        <View
          className={`flex-1 bg-white rounded-r-xl py-3 px-4 border-l-4 ml-1 ${isMyTeam ? 'border-green-500' : 'border-red-500'}`}
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
        >
          <View className={`flex-row items-center ${isMyTeam ? 'justify-start' : 'justify-end'}`}>
            {isMyTeam && (
              <>
                {isCard ? (
                  <View className="w-8 h-12 rounded-sm items-center justify-center mr-3" style={{ backgroundColor: getCardColor(event.eventType, event.eventSubType) }} />
                ) : (
                  <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: config.color }}>
                    <Ionicons name={config.icon as any} size={16} color="white" />
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
                {event.eventType === 'substitution'
                  ? `${relatedPlayer?.nickname ?? '—'} ⬇️ / ${player?.nickname ?? '—'} ⬆️`
                  : player?.nickname ?? '—'}
                {event.eventType !== 'substitution' && relatedPlayer && ` (Assist: ${relatedPlayer.nickname})`}
              </Text>
              <Text className={`text-xs font-medium ${isMyTeam ? 'text-green-600' : 'text-red-600'}`}>
                {isMyTeam ? matchData?.myTeam?.teamName : matchData?.opponentTeam?.teamName}
              </Text>
            </View>
            {!isMyTeam && (
              <>
                {isCard ? (
                  <View className="w-8 h-12 rounded-sm items-center justify-center ml-3" style={{ backgroundColor: getCardColor(event.eventType, event.eventSubType) }} />
                ) : (
                  <View className="w-8 h-8 rounded-full items-center justify-center ml-3" style={{ backgroundColor: config.color }}>
                    <Ionicons name={config.icon as any} size={16} color="white" />
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    );
  }, [matchData, allRosterPlayers]);

  if (!matchData) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100 items-center justify-center">
        <Text className="text-slate-500 text-lg">No match data found</Text>
      </SafeAreaView>
    );
  }

  const isHomePossessing = activeMatch?.currentPossessionTeamId === matchData.myTeam.teamId;
  const isAwayPossessing = activeMatch?.currentPossessionTeamId === matchData.opponentTeam.teamId;

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80' }}
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

          {/* Score & Possession Area */}
          <View className="flex-1 justify-center px-4 mb-10">
            <View className="flex-row items-center justify-between">
              {/* Home Team */}
              <View className="items-center flex-1">
                <TouchableOpacity onPress={() => handleAddEvent('my')} className="items-center">
                  <View className={`w-20 h-20 rounded-full items-center justify-center mb-2 border-2 ${activeMatch?.currentPossessionTeamId === matchData.myTeam.teamId ? 'bg-blue-600/50 border-blue-400' : 'bg-white/20 border-white/30'}`}>
                    <Ionicons name="shield" size={40} color="white" />
                  </View>
                  <Text className="text-white text-sm font-medium text-center mb-1">{matchData.myTeam.teamName}</Text>
                  <Text className="text-white text-4xl font-bold">{myTeamScore}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTogglePossession('my')}
                  disabled={isHomePossessing}
                  className={`mt-3 px-3 py-1 rounded-full border ${isHomePossessing ? 'bg-black/10 border-white/10 opacity-40' : 'bg-black/40 border-white/20'}`}
                >
                  <Text className="text-white text-xs">Set Possession</Text>
                </TouchableOpacity>
              </View>

              <View className="px-8">
                <Text className="text-white text-2xl font-bold">VS</Text>
              </View>

              {/* Away Team */}
              <View className="items-center flex-1">
                <TouchableOpacity onPress={() => handleAddEvent('opponent')} className="items-center">
                  <View className={`w-20 h-20 rounded-full items-center justify-center mb-2 border-2 ${activeMatch?.currentPossessionTeamId === matchData.opponentTeam.teamId ? 'bg-blue-600/50 border-blue-400' : 'bg-white/20 border-white/30'}`}>
                    <Ionicons name="shield-outline" size={40} color="white" />
                  </View>
                  <Text className="text-white text-sm font-medium text-center mb-1">{matchData.opponentTeam.teamName}</Text>
                  <Text className="text-white text-4xl font-bold">{opponentTeamScore}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTogglePossession('opponent')}
                  disabled={isAwayPossessing}
                  className={`mt-3 px-3 py-1 rounded-full border ${isAwayPossessing ? 'bg-black/10 border-white/10 opacity-40' : 'bg-black/40 border-white/20'}`}
                >
                  <Text className="text-white text-xs">Set Possession</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Live Possession Bar */}
            <View className="mt-6 px-2">
              <View className="flex-row justify-between mb-1">
                <Text className="text-white text-xs font-bold">{possessionSplit.homePct}%</Text>
                <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Possession</Text>
                <Text className="text-white text-xs font-bold">{possessionSplit.awayPct}%</Text>
              </View>
              <View className="h-1.5 bg-white/20 rounded-full flex-row overflow-hidden">
                <View style={{ width: `${possessionSplit.homePct}%` }} className="bg-blue-400 h-full" />
                <View className="flex-1 bg-red-400 h-full" />
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Event list */}
      <ScrollView className="flex-1 px-4 pt-4">
        {events.length > 0 ? (
          <>
            <Text className="text-lg font-bold text-slate-900 mb-4">Match Timeline ({events.length})</Text>
            {[...events].sort((a, b) => a.minute === b.minute ? a.seconds - b.seconds : a.minute - b.minute).map((event) => renderEventCard(event))}
          </>
        ) : (
          <View className="items-center justify-center py-16">
            <Ionicons name="football" size={48} color="#94a3b8" />
            <Text className="text-slate-500 text-lg font-medium mt-4">No events yet</Text>
            <Text className="text-slate-400 text-sm mt-2">Tap the team badges above to add match events</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom controls */}
      <View className="flex-row items-center p-3 bg-slate-900 border-t border-white">
        <View className="w-16 items-center">
          <TouchableOpacity onPress={handlePlayPause} className="bg-white/30 p-3 rounded-full">
            <Ionicons name={isTimerRunning ? 'pause' : 'play'} size={22} color="white" />
          </TouchableOpacity>
        </View>
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
          <View className="w-16" />
        )}
      </View>

      {/* Modal Form */}
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
                        <Ionicons name={config.icon as any} size={12} color="white" />
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

              {/* Player selection (Pitch) */}
              <Text className="text-lg font-bold text-slate-900 mb-3">
                {selectedEventType === 'substitution' ? 'Player Coming Off' : 'Player'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <View className="flex-row gap-2">
                  {getCurrentPlayersOnPitch().map((player) => (
                    <TouchableOpacity
                      key={player.id}
                      onPress={() => setSelectedPlayer(player)}
                      className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${selectedPlayer?.id === player.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
                    >
                      <Text className={`font-medium ${selectedPlayer?.id === player.id ? 'text-blue-700' : 'text-slate-700'}`}>{player.nickname}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Substitution In selection (Bench) */}
              {selectedEventType === 'substitution' && (
                <>
                  <Text className="text-lg font-bold text-slate-900 mb-3">Player Coming In (Bench)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                    <View className="flex-row gap-2">
                      {getCurrentPlayersOnBench().map((player) => (
                        <TouchableOpacity
                          key={player.id}
                          onPress={() => setSelectedSubInPlayer(player)}
                          className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${selectedSubInPlayer?.id === player.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
                        >
                          <Text className={`font-medium ${selectedSubInPlayer?.id === player.id ? 'text-blue-700' : 'text-slate-700'}`}>{player.nickname}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              {/* Assist player */}
              {selectedEventType === 'goal' && (
                <>
                  <Text className="text-lg font-bold text-slate-900 mb-3">Assist Player (Optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                    <View className="flex-row gap-2">
                      <TouchableOpacity onPress={() => setSelectedAssistPlayer(null)} className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${!selectedAssistPlayer ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                        <Text className={`font-medium ${!selectedAssistPlayer ? 'text-blue-700' : 'text-slate-700'}`}>No Assist</Text>
                      </TouchableOpacity>
                      {getCurrentPlayersOnPitch().filter((p) => p.id !== selectedPlayer?.id).map((player) => (
                        <TouchableOpacity
                          key={player.id}
                          onPress={() => setSelectedAssistPlayer(player)}
                          className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${selectedAssistPlayer?.id === player.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
                        >
                          <Text className={`font-medium ${selectedAssistPlayer?.id === player.id ? 'text-blue-700' : 'text-slate-700'}`}>{player.nickname}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              {/* Minute input */}
              <Text className="text-lg font-bold text-slate-900 mb-3">Time</Text>
              <View className="mb-12">
                <TextInput value={eventMinute} onChangeText={setEventMinute} placeholder="Auto-populated from timer" keyboardType="numeric" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg" />
                <Text className="text-xs text-slate-500 mt-2">Current match time: {formattedTimer}</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Penalty Shootout Modal (knockout ties only) */}
      <Modal visible={showPenaltyModal} animationType="fade" transparent onRequestClose={() => setShowPenaltyModal(false)}>
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full">
            <Text className="text-lg font-bold text-slate-900 mb-1">Penalty Shootout</Text>
            <Text className="text-sm text-slate-600 mb-4">Enter the final penalty shootout score.</Text>

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-xs font-semibold text-slate-600 mb-1">{matchData?.myTeam.teamName}</Text>
                <TextInput
                  value={penaltyHome}
                  onChangeText={setPenaltyHome}
                  keyboardType="numeric"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg text-center"
                />
              </View>
              <Text className="text-slate-400 font-bold mt-5">-</Text>
              <View className="flex-1 ml-2">
                <Text className="text-xs font-semibold text-slate-600 mb-1">{matchData?.opponentTeam.teamName}</Text>
                <TextInput
                  value={penaltyAway}
                  onChangeText={setPenaltyAway}
                  keyboardType="numeric"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg text-center"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setShowPenaltyModal(false)} className="flex-1 border border-slate-300 rounded-xl py-3 items-center">
                <Text className="text-slate-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmPenaltyShootout} className="flex-1 bg-red-600 rounded-xl py-3 items-center">
                <Text className="text-white font-semibold">Confirm & End Match</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
