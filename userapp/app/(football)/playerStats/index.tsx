import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFootballStore } from '@/store/footballTeamStore';
import { useMatchExecutionStore } from '@/store/footballMatchEventStore';
import { useTournamentStore } from '@/store/footballTournamentStore';
import { useKnockoutStore } from '@/store/knockoutTournamentStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// ============ TYPES ============

interface CareerStats {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  goalsScored: number;
  assists: number;
  totalMinutesPlayed: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
}

interface RecentMatchDisplay {
  id: string;
  date: string;
  opponent: string;
  result: 'W' | 'D' | 'L';
  score: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  performance: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

interface TournamentDisplay {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  team: string;
  matchesPlayed: number;
  goals: number;
  assists: number;
  position: string;
}

interface TeamDisplay {
  id: string;
  name: string;
  role: 'Captain' | 'Player';
  joinedDate: string;
  appearances: number;
  status: 'Active' | 'Inactive';
}

// ============ MAIN COMPONENT ============

export default function PlayerStatsScreen() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'recent-matches' | 'tournaments' | 'teams'>('overview');

  // Get stores
  const footballStore = useFootballStore();
  const matchExecutionStore = useMatchExecutionStore();
  const tournamentStore = useTournamentStore();
  const knockoutStore = useKnockoutStore();
  const router = useRouter()

  // Get current player
  const currentPlayer = footballStore.getCurrentPlayer();

  // Handle if no current player
if (!currentPlayer) {
    return (
    <SafeAreaView className='flex-1'>
          <View className="flex-1 bg-slate-900 ">
        {/* Header with Back Button */}
       <View className="px-6 py-4 border-b border-white flex-row items-center mt-4">
            <TouchableOpacity
              className="mr-4"
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">
              Player Statistics 
            </Text>
          </View>

        {/* No Profile Message */}
        <View className="flex-1 items-center justify-center px-6 py-8 mb-12">
          <View
           
            className="rounded-3xl p-8 w-full items-center border border-slate-600"
          >
            

            {/* Title */}
            <Text className="text-2xl font-black text-sky-300 text-center mb-3">
              No Football Profile Found
            </Text>

            {/* Description */}
            <Text className="text-slate-400 text-center text-base leading-6 mb-6">
              It looks like you haven't created a football profile yet. Create one to start tracking your statistics and performance!
            </Text>

            {/* CTA Button */}
            
          </View>
        </View>
      </View>
    </SafeAreaView>
    );
  }

  // Calculate career statistics
  const careerStats = useMemo<CareerStats>(() => {
    const completedMatches = matchExecutionStore.getCompletedMatches();

    const playerMatches = completedMatches.filter((match) => {
      const allPlayers = [
        ...match.matchSetup.myTeam.selectedPlayers,
        ...match.matchSetup.myTeam.substitutes,
        ...match.matchSetup.opponentTeam.selectedPlayers,
        ...match.matchSetup.opponentTeam.substitutes,
      ];
      return allPlayers.includes(currentPlayer.id);
    });

    const stats: CareerStats = {
      matchesPlayed: playerMatches.length,
      matchesWon: 0,
      matchesLost: 0,
      matchesDrawn: 0,
      goalsScored: 0,
      assists: 0,
      totalMinutesPlayed: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
    };

    playerMatches.forEach((match) => {
      const isHomeTeam =
        match.matchSetup.myTeam.selectedPlayers.includes(currentPlayer.id) ||
        match.matchSetup.myTeam.substitutes.includes(currentPlayer.id);

      const playerTeamScore = isHomeTeam ? match.homeTeamScore : match.awayTeamScore;
      const opponentScore = isHomeTeam ? match.awayTeamScore : match.homeTeamScore;

      if (playerTeamScore > opponentScore) stats.matchesWon++;
      else if (playerTeamScore < opponentScore) stats.matchesLost++;
      else stats.matchesDrawn++;

      const playerStats = match.playerStats.find((p) => p.playerId === currentPlayer.id);
      if (playerStats) {
        stats.goalsScored += playerStats.goals;
        stats.assists += playerStats.assists;
        stats.totalMinutesPlayed += playerStats.minutesPlayed;
        stats.yellowCards += playerStats.yellowCards;
        stats.redCards += playerStats.redCards;
      }

      if (currentPlayer.position === 'Goalkeeper' && opponentScore === 0) {
        stats.cleanSheets++;
      }
    });

    return stats;
  }, [currentPlayer.id, currentPlayer.position, matchExecutionStore]);

  // Get recent matches
  const recentMatches = useMemo<RecentMatchDisplay[]>(() => {
    return matchExecutionStore
      .getCompletedMatches()
      .filter((match) => {
        const allPlayers = [
          ...match.matchSetup.myTeam.selectedPlayers,
          ...match.matchSetup.myTeam.substitutes,
          ...match.matchSetup.opponentTeam.selectedPlayers,
          ...match.matchSetup.opponentTeam.substitutes,
        ];
        return allPlayers.includes(currentPlayer.id);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((match) => {
        const isHomeTeam =
          match.matchSetup.myTeam.selectedPlayers.includes(currentPlayer.id) ||
          match.matchSetup.myTeam.substitutes.includes(currentPlayer.id);

        const playerTeamScore = isHomeTeam ? match.homeTeamScore : match.awayTeamScore;
        const opponentScore = isHomeTeam ? match.awayTeamScore : match.homeTeamScore;
        const opponent = isHomeTeam ? match.matchSetup.opponentTeam.teamName : match.matchSetup.myTeam.teamName;

        let result: 'W' | 'D' | 'L' = 'D';
        if (playerTeamScore > opponentScore) result = 'W';
        else if (playerTeamScore < opponentScore) result = 'L';

        const playerStats = match.playerStats.find((p) => p.playerId === currentPlayer.id);

        const performance: 'Excellent' | 'Good' | 'Fair' | 'Poor' =
          (playerStats?.goals ?? 0) > 0
            ? 'Excellent'
            : (playerStats?.minutesPlayed ?? 0) === 90
              ? 'Good'
              : (playerStats?.minutesPlayed ?? 0) > 45
                ? 'Fair'
                : 'Poor';

        return {
          id: match.id,
          date: new Date(match.createdAt).toLocaleDateString(),
          opponent,
          result,
          score: `${playerTeamScore}-${opponentScore}`,
          minutesPlayed: playerStats?.minutesPlayed ?? 0,
          goals: playerStats?.goals ?? 0,
          assists: playerStats?.assists ?? 0,
          yellowCards: playerStats?.yellowCards ?? 0,
          performance,
        };
      });
  }, [currentPlayer.id, matchExecutionStore]);

  // Get tournament participation
  const tournaments = useMemo<TournamentDisplay[]>(() => {
    const tournamentList: TournamentDisplay[] = [];

    const playerTeams = footballStore.teams.filter((team) => team.memberPlayerIds.includes(currentPlayer.id));

    tournamentStore.tournaments.forEach((tournament) => {
      playerTeams.forEach((fTeam) => {
        const tTeam = tournament.teams.find((t) => t.teamId === fTeam.id);

        if (tTeam) {
          const tMatches = tournament.fixtures.filter(
            (f) => (f.homeTeamId === tTeam.id || f.awayTeamId === tTeam.id) && f.status === 'completed'
          );

          const tGoals = tMatches.reduce((sum, match) => {
            const events = match.matchData?.events || [];
            return sum + events.filter((e: any) => e.playerId === currentPlayer.id && e.eventType === 'goal').length;
          }, 0);

          const tAssists = tMatches.reduce((sum, match) => {
            const events = match.matchData?.events || [];
            return sum + events.filter((e: any) => e.assistPlayerId === currentPlayer.id && e.eventType === 'goal').length;
          }, 0);

          tournamentList.push({
            id: tournament.id,
            name: tournament.name,
            status: tournament.status,
            team: tTeam.teamName,
            matchesPlayed: tMatches.length,
            goals: tGoals,
            assists: tAssists,
            position: tTeam.position?.toString() || 'TBD',
          });
        }
      });
    });

    knockoutStore.tournaments.forEach((tournament) => {
      playerTeams.forEach((fTeam) => {
        const kTeam = tournament.teams.find((t) => t.teamId === fTeam.id);

        if (kTeam) {
          const kMatches = tournament.fixtures.filter(
            (f) => (f.homeTeamId === kTeam.teamId || f.awayTeamId === kTeam.teamId) && f.status === 'completed'
          );

          const kGoals = kMatches.reduce((sum, match) => {
            const events = match.matchEvents || [];
            return sum + events.filter((e) => e.playerId === currentPlayer.id && e.eventType === 'goal').length;
          }, 0);

          const kAssists = kMatches.reduce((sum, match) => {
            const events = match.matchEvents || [];
            return sum + events.filter((e) => e.assistPlayerId === currentPlayer.id && e.eventType === 'goal').length;
          }, 0);

          tournamentList.push({
            id: tournament.id,
            name: tournament.name,
            status: tournament.status,
            team: kTeam.teamName,
            matchesPlayed: kMatches.length,
            goals: kGoals,
            assists: kAssists,
            position: tournament.winnerId === kTeam.teamId ? 'Winner' : tournament.status === 'completed' ? 'Eliminated' : 'Ongoing',
          });
        }
      });
    });

    return tournamentList;
  }, [currentPlayer.id, footballStore, tournamentStore, knockoutStore]);

  // Get team history
  const teams = useMemo<TeamDisplay[]>(() => {
    const playerTeams = footballStore.teams.filter((team) => team.memberPlayerIds.includes(currentPlayer.id));

    return playerTeams.map((team) => ({
      id: team.id,
      name: team.teamName,
      role: team.captainId === currentPlayer.id ? 'Captain' : 'Player',
      joinedDate: new Date(team.createdAt).toLocaleDateString(),
      appearances: matchExecutionStore
        .getCompletedMatches()
        .filter((match) => {
          const allPlayers = [
            ...match.matchSetup.myTeam.selectedPlayers,
            ...match.matchSetup.myTeam.substitutes,
            ...match.matchSetup.opponentTeam.selectedPlayers,
            ...match.matchSetup.opponentTeam.substitutes,
          ];
          return allPlayers.includes(currentPlayer.id);
        }).length,
      status: team.status === 'active' ? 'Active' : 'Inactive',
    }));
  }, [currentPlayer.id, footballStore, matchExecutionStore]);

  // Calculate statistics
  const winRate = careerStats.matchesPlayed > 0 ? ((careerStats.matchesWon / careerStats.matchesPlayed) * 100).toFixed(1) : '0';
  const goalsPerMatch = careerStats.matchesPlayed > 0 ? (careerStats.goalsScored / careerStats.matchesPlayed).toFixed(2) : '0';
  const avgMinutesPerMatch = careerStats.matchesPlayed > 0 ? Math.round(careerStats.totalMinutesPlayed / careerStats.matchesPlayed) : 0;
  const cleanSheetRate = careerStats.matchesPlayed > 0 ? ((careerStats.cleanSheets / careerStats.matchesPlayed) * 100).toFixed(1) : '0';

  return (
    <ScrollView className="flex-1 bg-slate-900">
      {/* Hero Header */}
      <LinearGradient colors={['#06b6d4', '#0ea5e9']} className="pt-6 pb-4 px-4">
        <View className="gap-4">
          {/* Player Avatar */}
          <View className="flex-row gap-4 items-end">
            <LinearGradient
              colors={['#4ade80', '#059669']}
              className="w-28 h-28 rounded-2xl items-center justify-center border-4 border-white"
            >
              <Text className="text-6xl">
                {currentPlayer.position === 'Goalkeeper' ? '🧤' : '⚽'}
              </Text>
            </LinearGradient>

            {/* Player Info */}
            <View className="flex-1">
              <Text className="text-3xl font-black text-slate-900 mb-2">{currentPlayer.name}</Text>
              <View className="gap-2 mb-2">
                <Badge label={currentPlayer.position} />
               
              </View>
              <Text className="text-slate-700 text-sm font-medium">📱 {currentPlayer.contact}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View className="px-4 py-6 gap-6">
        {/* Key Stats Grid */}
        <View className="gap-3">
          <View className="flex-row gap-3">
            <StatCard label="Matches" value={careerStats.matchesPlayed} color={['#06b6d4', '#0284c7']} />
            <StatCard label="Win Rate" value={`${winRate}%`} color={['#facc15', '#f97316']} />
          </View>
          <View className="flex-row gap-3">
            <StatCard label="Goals" value={careerStats.goalsScored} color={['#4ade80', '#059669']} />
            <StatCard label="Assists" value={careerStats.assists} color={['#f472b6', '#dc2626']} />
          </View>
        </View>

        {/* Secondary Stats */}
        <View className="gap-3">
          <View className="flex-row gap-3">
            <SecondaryStatCard label="Min Played" value={careerStats.totalMinutesPlayed} />
            <SecondaryStatCard label="Avg Min/Match" value={avgMinutesPerMatch} />
          </View>
          <View className="flex-row gap-3">
            <SecondaryStatCard label="Yellow Cards" value={careerStats.yellowCards} />
            <SecondaryStatCard label="Red Cards" value={careerStats.redCards} />
          </View>
          <View className="flex-row gap-3">
            <SecondaryStatCard label="Clean Sheets" value={careerStats.cleanSheets} />
            <SecondaryStatCard label="W-D-L" value={`${careerStats.matchesWon}-${careerStats.matchesDrawn}-${careerStats.matchesLost}`} />
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-slate-700 rounded-xl p-1 gap-1">
          {['overview', 'recent-matches', 'tournaments', 'teams'].map((tab) => (
            <TabButton
              key={tab}
              isActive={selectedTab === (tab as typeof selectedTab)}
              onPress={() => setSelectedTab(tab as typeof selectedTab)}
              label={
                tab === 'overview'
                  ? 'Overview'
                  : tab === 'recent-matches'
                    ? 'Matches'
                    : tab === 'tournaments'
                      ? 'Tournaments'
                      : 'Teams'
              }
            />
          ))}
        </View>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <View className="gap-4">
            <CareerSummary stats={careerStats} />
            <PerformanceInsights
              winRate={winRate}
              goalsPerMatch={goalsPerMatch}
              avgMinutesPerMatch={avgMinutesPerMatch}
              cleanSheetRate={cleanSheetRate}
            />
          </View>
        )}

        {selectedTab === 'recent-matches' && (
          <View className="gap-3">
            {recentMatches.length > 0 ? (
              recentMatches.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <Text className="text-slate-400 text-center py-6">No matches found</Text>
            )}
          </View>
        )}

        {selectedTab === 'tournaments' && (
          <View className="gap-3">
            {tournaments.length > 0 ? (
              tournaments.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)
            ) : (
              <Text className="text-slate-400 text-center py-6">No tournament participation yet</Text>
            )}
          </View>
        )}

        {selectedTab === 'teams' && (
          <View className="gap-3">
            {teams.length > 0 ? (
              teams.map((team) => <TeamCard key={team.id} team={team} />)
            ) : (
              <Text className="text-slate-400 text-center py-6">No team history found</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ============ COMPONENTS ============

interface BadgeProps {
  label: string;
}

function Badge({ label }: BadgeProps) {
  return (
    <View className="bg-white bg-opacity-70 px-3 py-1 rounded-full">
      <Text className="text-xs font-bold text-slate-900">{label}</Text>
    </View>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  color: [string, string];
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <LinearGradient colors={color} className="flex-1 rounded-2xl p-4 items-center justify-center">
      <Text className="text-xs font-semibold text-white opacity-90 mb-1">{label}</Text>
      <Text className="text-3xl font-black text-white">{value}</Text>
    </LinearGradient>
  );
}

interface SecondaryStatCardProps {
  label: string;
  value: string | number;
}

function SecondaryStatCard({ label, value }: SecondaryStatCardProps) {
  return (
    <LinearGradient colors={['#1e293b', '#0f172a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="flex-1 rounded-xl p-3 border border-slate-600">
      <Text className="text-xs font-semibold text-sky-300 mb-1">{label}</Text>
      <Text className="text-xl font-black text-white">{value}</Text>
    </LinearGradient>
  );
}

interface TabButtonProps {
  isActive: boolean;
  onPress: () => void;
  label: string;
}

function TabButton({ isActive, onPress, label }: TabButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 px-3 py-2 rounded-lg ${isActive ? 'bg-sky-400' : ''}`}
    >
      <Text className={`text-xs font-semibold text-center ${isActive ? 'text-slate-900' : 'text-sky-200'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface CareerSummaryProps {
  stats: CareerStats;
}

function CareerSummary({ stats }: CareerSummaryProps) {
  return (
    <LinearGradient colors={['#1e293b', '#0f172a']} className="rounded-2xl p-4 border border-slate-600">
      <Text className="text-xl font-black text-sky-300 mb-4">Career Summary</Text>
      <View className="gap-3">
        <SummaryRow label="Matches Played" value={stats.matchesPlayed} />
        <SummaryRow label="Wins" value={stats.matchesWon} />
        <SummaryRow label="Draws" value={stats.matchesDrawn} />
        <SummaryRow label="Losses" value={stats.matchesLost} />
        <SummaryRow label="Goals Scored" value={stats.goalsScored} />
        <SummaryRow label="Assists" value={stats.assists} />
        <SummaryRow label="Total Minutes" value={`${stats.totalMinutesPlayed} min`} />
        <SummaryRow label="Yellow Cards" value={stats.yellowCards} />
        <SummaryRow label="Red Cards" value={stats.redCards} />
        {stats.cleanSheets > 0 && <SummaryRow label="Clean Sheets" value={stats.cleanSheets} />}
      </View>
    </LinearGradient>
  );
}

interface PerformanceInsightsProps {
  winRate: string;
  goalsPerMatch: string;
  avgMinutesPerMatch: number;
  cleanSheetRate: string;
}

function PerformanceInsights({ winRate, goalsPerMatch, avgMinutesPerMatch, cleanSheetRate }: PerformanceInsightsProps) {
  return (
    <LinearGradient colors={['#1e293b', '#0f172a']} className="rounded-2xl p-4 border border-slate-600">
      <Text className="text-xl font-black text-sky-300 mb-4">Performance Insights</Text>
      <View className="gap-3">
        <InsightCard label="Win Rate" value={`${winRate}%`} description="Based on all matches" color="#4ade80" />
        <InsightCard label="Goals Per Match" value={goalsPerMatch} description="Average scoring" color="#f97316" />
        <InsightCard label="Avg Min/Match" value={avgMinutesPerMatch} description="Playing time" color="#06b6d4" />
        <InsightCard label="Clean Sheet Rate" value={`${cleanSheetRate}%`} description="GK performance" color="#10b981" />
      </View>
    </LinearGradient>
  );
}

interface SummaryRowProps {
  label: string;
  value: string | number;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-slate-600">
      <Text className="text-sky-200 font-medium text-sm">{label}</Text>
      <Text className="text-lg font-black text-white">{value}</Text>
    </View>
  );
}

interface InsightCardProps {
  label: string;
  value: string | number;
  description: string;
  color: string;
}

function InsightCard({ label, value, description, color }: InsightCardProps) {
  return (
    <LinearGradient colors={['#334155', '#1e293b']} className="rounded-xl p-3 border border-slate-600">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-sky-200 text-xs font-semibold">{label}</Text>
        <Text style={{ color }} className="text-2xl font-black">
          {value}
        </Text>
      </View>
      <Text className="text-xs text-slate-400">{description}</Text>
    </LinearGradient>
  );
}

interface MatchCardProps {
  match: RecentMatchDisplay;
}

function MatchCard({ match }: MatchCardProps) {
  const resultColor =
    match.result === 'W' ? '#22c55e' : match.result === 'D' ? '#eab308' : '#ef4444';
  const resultBgColor =
    match.result === 'W' ? '#16a34a' : match.result === 'D' ? '#ca8a04' : '#b91c1c';
  const performanceColor =
    match.performance === 'Excellent'
      ? '#4ade80'
      : match.performance === 'Good'
        ? '#06b6d4'
        : '#fbbf24';

  return (
    <LinearGradient colors={['#1e293b', '#0f172a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="rounded-2xl p-4 border border-slate-600">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <View
            style={{ backgroundColor: resultBgColor }}
            className="w-12 h-12 rounded-full items-center justify-center"
          >
            <Text className="text-lg font-black text-white">{match.result}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-black text-white">{match.opponent}</Text>
            <Text className="text-sky-300 font-semibold text-xs">
              {match.score} • {match.date}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text style={{ color: performanceColor }} className="text-xs font-bold mb-1">
            {match.performance}
          </Text>
          <Text className="text-xs text-slate-400">{match.minutesPlayed} min</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

interface TournamentCardProps {
  tournament: TournamentDisplay;
}

function TournamentCard({ tournament }: TournamentCardProps) {
  const statusColor =
    tournament.status === 'completed'
      ? '#22c55e'
      : tournament.status === 'active'
        ? '#3b82f6'
        : '#6b7280';

  return (
    <LinearGradient colors={['#1e293b', '#0f172a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="rounded-2xl p-4 border border-slate-600">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-base font-black text-white mb-1">{tournament.name}</Text>
          <Text className="text-sky-300 font-semibold text-sm">{tournament.team}</Text>
        </View>
        <View style={{ backgroundColor: statusColor }} className="px-3 py-1 rounded-full">
          <Text className="text-xs font-bold text-white capitalize">{tournament.status}</Text>
        </View>
      </View>

      <View className="flex-row gap-3 pt-3 border-t border-slate-600">
        <View className="flex-1">
          <Text className="text-slate-400 text-xs font-semibold mb-1">Matches</Text>
          <Text className="text-xl font-black text-sky-300">{tournament.matchesPlayed}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-slate-400 text-xs font-semibold mb-1">Goals</Text>
          <Text className="text-xl font-black text-green-400">{tournament.goals}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-slate-400 text-xs font-semibold mb-1">Assists</Text>
          <Text className="text-xl font-black text-pink-400">{tournament.assists}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-slate-400 text-xs font-semibold mb-1">Finish</Text>
          <Text className="text-sm font-black text-yellow-400">{tournament.position}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

interface TeamCardProps {
  team: TeamDisplay;
}

function TeamCard({ team }: TeamCardProps) {
  return (
    <LinearGradient colors={['#1e293b', '#0f172a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="rounded-2xl p-4 border border-slate-600">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-black text-white mb-2">{team.name}</Text>
          <View className="gap-1">
            <Text className="text-sky-300 font-semibold text-xs">Role: {team.role}</Text>
            <Text className="text-slate-400 text-xs">Joined: {team.joinedDate}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-slate-400 text-xs font-semibold mb-1">Appearances</Text>
          <Text className="text-2xl font-black text-green-400 mb-2">{team.appearances}</Text>
          <View
            style={{ backgroundColor: team.status === 'Active' ? '#22c55e' : '#4b5563' }}
            className="px-2 py-1 rounded-full"
          >
            <Text className="text-xs font-bold text-white">{team.status}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}