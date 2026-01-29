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
  const router = useRouter();

  // Get current player
  const currentPlayer = footballStore.getCurrentPlayer();

  // Handle if no current player
  if (!currentPlayer) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="px-6 py-4 border-b border-slate-200 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900">Player Statistics</Text>
        </View>

        {/* Empty State */}
        <View className="flex-1 items-center justify-center px-6 py-8">
          <View className="items-center gap-4">
            <View className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-emerald-100 items-center justify-center">
              <Ionicons name="person" size={40} color="#0f172a" />
            </View>
            <Text className="text-2xl font-bold text-slate-900 text-center">No Football Profile</Text>
            <Text className="text-slate-600 text-center text-base leading-6">
              Create a football profile to start tracking your statistics and performance metrics.
            </Text>
            <TouchableOpacity className="mt-4 px-6 py-3 bg-blue-600 rounded-lg">
              <Text className="text-white font-semibold">Create Profile</Text>
            </TouchableOpacity>
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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 border-b border-slate-200 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-slate-900">Player Profile</Text>
          </View>
          <Ionicons name="settings-outline" size={24} color="#64748b" />
        </View>

        {/* Hero Section - Player Card */}
        <View className="px-6 pt-6 pb-4">
          <View className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-3xl p-6">
            <View className="flex-row gap-4 items-start mb-4">
              {/* Avatar */}
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-24 h-24 rounded-2xl items-center justify-center border-3 border-white shadow-sm"
              >
                <Text className="text-5xl">
                  {currentPlayer.position === 'Goalkeeper' ? '🧤' : '⚽'}
                </Text>
              </LinearGradient>

              {/* Player Info */}
              <View className="flex-1 gap-2">
                <Text className="text-2xl font-bold text-slate-900">{currentPlayer.name}</Text>
                <Badge label={currentPlayer.position} />
                <Text className="text-sm text-slate-600">{currentPlayer.contact}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Key Stats Section */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-slate-900 mb-4">Key Statistics</Text>
          <View className="gap-3">
            <View className="flex-row gap-3">
              <StatCard
                label="Matches"
                value={careerStats.matchesPlayed}
                icon="football"
                color="#3b82f6"
              />
              <StatCard
                label="Goals"
                value={careerStats.goalsScored}
                icon="flash"
                color="#10b981"
              />
            </View>
            <View className="flex-row gap-3">
              <StatCard
                label="Assists"
                value={careerStats.assists}
                icon="share-social"
                color="#0ea5e9"
              />
              <StatCard
                label="Win Rate"
                value={`${winRate}%`}
                icon="trending-up"
                color="#f59e0b"
              />
            </View>
          </View>
        </View>

        {/* Secondary Stats */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-slate-900 mb-4">Performance</Text>
          <View className="bg-white border border-slate-200 rounded-2xl p-4 gap-3">
            <StatRow label="Total Minutes" value={`${careerStats.totalMinutesPlayed} min`} />
            <StatRow label="Avg Min/Match" value={`${avgMinutesPerMatch} min`} />
            <StatRow label="Goals/Match" value={goalsPerMatch} />
            <StatRow label="Record" value={`${careerStats.matchesWon}W-${careerStats.matchesDrawn}D-${careerStats.matchesLost}L`} />
            <StatRow label="Yellow Cards" value={careerStats.yellowCards} />
            <StatRow label="Red Cards" value={careerStats.redCards} />
            {careerStats.cleanSheets > 0 && (
              <StatRow label="Clean Sheets" value={careerStats.cleanSheets} />
            )}
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="px-6 py-4">
          <View className="flex-row bg-slate-100 rounded-lg p-1 gap-1">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'recent-matches', label: 'Matches' },
              { key: 'tournaments', label: 'Tournaments' },
              { key: 'teams', label: 'Teams' },
            ].map((tab) => (
              <TabButton
                key={tab.key}
                isActive={selectedTab === (tab.key as typeof selectedTab)}
                onPress={() => setSelectedTab(tab.key as typeof selectedTab)}
                label={tab.label}
              />
            ))}
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-6 pb-12">
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
                <Text className="text-slate-500 text-center py-8">No matches found</Text>
              )}
            </View>
          )}

          {selectedTab === 'tournaments' && (
            <View className="gap-3">
              {tournaments.length > 0 ? (
                tournaments.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)
              ) : (
                <Text className="text-slate-500 text-center py-8">No tournament participation yet</Text>
              )}
            </View>
          )}

          {selectedTab === 'teams' && (
            <View className="gap-3">
              {teams.length > 0 ? (
                teams.map((team) => <TeamCard key={team.id} team={team} />)
              ) : (
                <Text className="text-slate-500 text-center py-8">No team history found</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============ COMPONENTS ============

interface BadgeProps {
  label: string;
}

function Badge({ label }: BadgeProps) {
  return (
    <View className="inline-flex bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
      <Text className="text-xs font-semibold text-emerald-700">{label}</Text>
    </View>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <View className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 items-center justify-center gap-2">
      <View style={{ backgroundColor: color }} className="w-10 h-10 rounded-lg items-center justify-center">
        <Ionicons name={icon as any} size={20} color="white" />
      </View>
      <Text className="text-xs text-slate-600 font-semibold">{label}</Text>
      <Text className="text-2xl font-bold text-slate-900">{value}</Text>
    </View>
  );
}

interface StatRowProps {
  label: string;
  value: string | number;
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-slate-100 last:border-b-0">
      <Text className="text-slate-700 font-medium text-sm">{label}</Text>
      <Text className="text-slate-900 font-bold text-sm">{value}</Text>
    </View>
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
      className={`flex-1 px-3 py-2.5 rounded-md ${
        isActive ? 'bg-white border border-slate-300' : ''
      }`}
      activeOpacity={0.7}
    >
      <Text
        className={`text-xs font-semibold text-center ${
          isActive ? 'text-slate-900' : 'text-slate-600'
        }`}
      >
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
    <View className="bg-white border border-slate-200 rounded-2xl p-6 gap-1">
      <Text className="text-lg font-bold text-slate-900 mb-4">Career Summary</Text>
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
  );
}

interface SummaryRowProps {
  label: string;
  value: string | number;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-slate-100 last:border-b-0">
      <Text className="text-slate-700 font-medium text-sm">{label}</Text>
      <Text className="text-slate-900 font-bold text-base">{value}</Text>
    </View>
  );
}

interface PerformanceInsightsProps {
  winRate: string;
  goalsPerMatch: string;
  avgMinutesPerMatch: number;
  cleanSheetRate: string;
}

function PerformanceInsights({
  winRate,
  goalsPerMatch,
  avgMinutesPerMatch,
  cleanSheetRate,
}: PerformanceInsightsProps) {
  return (
    <View className="bg-white border border-slate-200 rounded-2xl p-6 gap-3">
      <Text className="text-lg font-bold text-slate-900 mb-2">Performance Insights</Text>
      <InsightCard label="Win Rate" value={`${winRate}%`} description="Based on all matches" icon="checkmark-circle" color="#10b981" />
      <InsightCard label="Goals Per Match" value={goalsPerMatch} description="Average scoring" icon="flash" color="#f59e0b" />
      <InsightCard label="Avg Min/Match" value={avgMinutesPerMatch} description="Playing time" icon="time" color="#3b82f6" />
      <InsightCard label="Clean Sheet Rate" value={`${cleanSheetRate}%`} description="GK performance" icon="shield-checkmark" color="#0ea5e9" />
    </View>
  );
}

interface InsightCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: string;
  color: string;
}

function InsightCard({ label, value, description, icon, color }: InsightCardProps) {
  return (
    <View className="flex-row items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
      <View style={{ backgroundColor: color }} className="w-10 h-10 rounded-lg items-center justify-center flex-shrink-0">
        <Ionicons name={icon as any} size={20} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-slate-700 font-semibold text-sm">{label}</Text>
        <Text className="text-slate-900 font-bold text-lg">{value}</Text>
        <Text className="text-xs text-slate-600 mt-0.5">{description}</Text>
      </View>
    </View>
  );
}

interface MatchCardProps {
  match: RecentMatchDisplay;
}

function MatchCard({ match }: MatchCardProps) {
  const resultColor = match.result === 'W' ? '#10b981' : match.result === 'D' ? '#f59e0b' : '#ef4444';
  const resultBg = match.result === 'W' ? '#d1fae5' : match.result === 'D' ? '#fef3c7' : '#fee2e2';

  return (
    <View className="bg-white border border-slate-200 rounded-2xl p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <View style={{ backgroundColor: resultBg, borderColor: resultColor }} className="w-12 h-12 rounded-full items-center justify-center border-2">
            <Text className="text-lg font-bold" style={{ color: resultColor }}>
              {match.result}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-slate-900 text-base">{match.opponent}</Text>
            <Text className="text-slate-600 text-xs">
              {match.score} • {match.date}
            </Text>
          </View>
        </View>
        <View className="items-end gap-1">
          <View className="bg-slate-100 px-2 py-1 rounded-full">
            <Text className="text-xs font-semibold text-slate-700">{match.performance}</Text>
          </View>
          <Text className="text-xs text-slate-600">{match.minutesPlayed}′</Text>
        </View>
      </View>
      {(match.goals > 0 || match.assists > 0) && (
        <View className="mt-3 pt-3 border-t border-slate-200 flex-row gap-4">
          {match.goals > 0 && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="flash" size={16} color="#10b981" />
              <Text className="text-sm font-semibold text-slate-900">{match.goals} Goals</Text>
            </View>
          )}
          {match.assists > 0 && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="share-social" size={16} color="#0ea5e9" />
              <Text className="text-sm font-semibold text-slate-900">{match.assists} Assists</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

interface TournamentCardProps {
  tournament: TournamentDisplay;
}

function TournamentCard({ tournament }: TournamentCardProps) {
  const statusColor =
    tournament.status === 'completed'
      ? '#10b981'
      : tournament.status === 'active'
        ? '#3b82f6'
        : '#9ca3af';

  const statusBg =
    tournament.status === 'completed'
      ? '#d1fae5'
      : tournament.status === 'active'
        ? '#dbeafe'
        : '#f3f4f6';

  return (
    <View className="bg-white border border-slate-200 rounded-2xl p-4">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900 mb-1">{tournament.name}</Text>
          <Text className="text-sm text-slate-600">{tournament.team}</Text>
        </View>
        <View style={{ backgroundColor: statusBg, borderColor: statusColor }} className="px-3 py-1.5 rounded-full border">
          <Text className="text-xs font-semibold capitalize" style={{ color: statusColor }}>
            {tournament.status}
          </Text>
        </View>
      </View>

      <View className="pt-3 border-t border-slate-200 flex-row gap-2">
        <View className="flex-1 bg-slate-50 rounded-xl p-3 items-center">
          <Text className="text-slate-600 text-xs font-semibold mb-1">Matches</Text>
          <Text className="text-lg font-bold text-slate-900">{tournament.matchesPlayed}</Text>
        </View>
        <View className="flex-1 bg-emerald-50 rounded-xl p-3 items-center border border-emerald-200">
          <Text className="text-emerald-700 text-xs font-semibold mb-1">Goals</Text>
          <Text className="text-lg font-bold text-emerald-900">{tournament.goals}</Text>
        </View>
        <View className="flex-1 bg-blue-50 rounded-xl p-3 items-center border border-blue-200">
          <Text className="text-blue-700 text-xs font-semibold mb-1">Assists</Text>
          <Text className="text-lg font-bold text-blue-900">{tournament.assists}</Text>
        </View>
        <View className="flex-1 bg-amber-50 rounded-xl p-3 items-center border border-amber-200">
          <Text className="text-amber-700 text-xs font-semibold mb-1">Finish</Text>
          <Text className="text-sm font-bold text-amber-900">{tournament.position}</Text>
        </View>
      </View>
    </View>
  );
}

interface TeamCardProps {
  team: TeamDisplay;
}

function TeamCard({ team }: TeamCardProps) {
  return (
    <View className="bg-white border border-slate-200 rounded-2xl p-4">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900 mb-1">{team.name}</Text>
          <View className="gap-1">
            <Text className="text-sm text-slate-600">
              <Text className="font-semibold">Role:</Text> {team.role}
            </Text>
            <Text className="text-sm text-slate-600">
              <Text className="font-semibold">Joined:</Text> {team.joinedDate}
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: team.status === 'Active' ? '#d1fae5' : '#f3f4f6',
            borderColor: team.status === 'Active' ? '#10b981' : '#d1d5db',
          }}
          className="px-3 py-1.5 rounded-full border"
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: team.status === 'Active' ? '#10b981' : '#6b7280' }}
          >
            {team.status}
          </Text>
        </View>
      </View>
      <View className="pt-3 border-t border-slate-200">
        <Text className="text-slate-600 text-xs font-semibold mb-2">Appearances</Text>
        <Text className="text-2xl font-bold text-slate-900">{team.appearances}</Text>
      </View>
    </View>
  );
}