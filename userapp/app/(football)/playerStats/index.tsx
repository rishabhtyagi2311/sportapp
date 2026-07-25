import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { footballService } from '@/services/football';
import { FootballProfile, FootballTeam, FootballMatch, PlayerCareerStats } from '@/types/football';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// ============ TYPES ============

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
}

interface TeamDisplay {
  id: number;
  name: string;
  role: 'Captain' | 'Player';
  joinedDate: string;
  appearances: number;
}

// ============ MAIN COMPONENT ============

export default function PlayerStatsScreen() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'recent-matches' | 'teams'>('overview');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<FootballProfile | null>(null);
  const [careerStats, setCareerStats] = useState<PlayerCareerStats | null>(null);
  const [myTeams, setMyTeams] = useState<FootballTeam[]>([]);
  const [recentMatches, setRecentMatches] = useState<RecentMatchDisplay[]>([]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const profileResp = await footballService.profileCheck();
      const p = profileResp?.data?.exists ? profileResp.data.profile : null;
      setProfile(p);

      if (p) {
        const [stats, teams, myMatches] = await Promise.all([
          footballService.fetchPlayerStats(p.id),
          footballService.fetchMyTeams(),
          footballService.fetchMyMatches(),
        ]);
        setCareerStats(stats);
        setMyTeams(teams);

        const completed = myMatches.filter((m) => m.status === 'completed').slice(0, 10);
        const details = await Promise.all(completed.map((m) => footballService.fetchMatchById(m.id)));

        const mapped: RecentMatchDisplay[] = details
          .filter((m): m is FootballMatch => !!m)
          .map((match) => {
            const isHome = match.homeRoster.startingXI.includes(p.id) || match.homeRoster.bench.includes(p.id);
            const teamScore = isHome ? match.homeScore : match.awayScore;
            const opponentScore = isHome ? match.awayScore : match.homeScore;
            const opponent = (isHome ? match.awayTeam?.name : match.homeTeam?.name) ?? 'Unknown';
            const result: 'W' | 'D' | 'L' = teamScore > opponentScore ? 'W' : teamScore < opponentScore ? 'L' : 'D';
            const playerStat = match.stats?.find((s) => s.playerId === p.id);

            return {
              id: match.id,
              date: new Date(match.endedAt ?? match.createdAt).toLocaleDateString(),
              opponent,
              result,
              score: `${teamScore}-${opponentScore}`,
              minutesPlayed: playerStat?.minutesPlayed ?? 0,
              goals: playerStat?.goals ?? 0,
              assists: playerStat?.assists ?? 0,
              yellowCards: playerStat?.yellowCards ?? 0,
            };
          });
        setRecentMatches(mapped);
      }
      setIsLoading(false);
    })();
  }, []);

  const teams = useMemo<TeamDisplay[]>(() => {
    if (!profile) return [];
    return myTeams.map((team) => ({
      id: team.id,
      name: team.name,
      role: team.createdById === profile.id ? 'Captain' : 'Player',
      joinedDate: new Date(team.createdAt).toLocaleDateString(),
      appearances: team.matchesPlayed,
    }));
  }, [myTeams, profile]);

  const goalsPerMatch = careerStats && careerStats.matchesPlayed > 0 ? (careerStats.goals / careerStats.matchesPlayed).toFixed(2) : '0';
  const avgMinutesPerMatch = careerStats && careerStats.matchesPlayed > 0 ? Math.round(careerStats.minutesPlayed / careerStats.matchesPlayed) : 0;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0f172a" />
      </SafeAreaView>
    );
  }

  // Handle if no current player
  if (!profile || !careerStats) {
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
            <TouchableOpacity
              onPress={() => router.push('/(football)/createFootballProfile')}
              className="mt-4 px-6 py-3 bg-blue-600 rounded-lg"
            >
              <Text className="text-white font-semibold">Create Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
                  {profile.role === 'Goalkeeper' ? '🧤' : '⚽'}
                </Text>
              </LinearGradient>

              {/* Player Info */}
              <View className="flex-1 gap-2">
                <Text className="text-2xl font-bold text-slate-900">{profile.nickname}</Text>
                <Badge label={profile.role} />
                <Text className="text-sm text-slate-600">{profile.experience}</Text>
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
                value={careerStats.goals}
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
                label="Minutes"
                value={careerStats.minutesPlayed}
                icon="time"
                color="#f59e0b"
              />
            </View>
          </View>
        </View>

        {/* Secondary Stats */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-slate-900 mb-4">Performance</Text>
          <View className="bg-white border border-slate-200 rounded-2xl p-4 gap-3">
            <StatRow label="Total Minutes" value={`${careerStats.minutesPlayed} min`} />
            <StatRow label="Avg Min/Match" value={`${avgMinutesPerMatch} min`} />
            <StatRow label="Goals/Match" value={goalsPerMatch} />
            <StatRow label="Yellow Cards" value={careerStats.yellowCards} />
            <StatRow label="Red Cards" value={careerStats.redCards} />
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="px-6 py-4">
          <View className="flex-row bg-slate-100 rounded-lg p-1 gap-1">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'recent-matches', label: 'Matches' },
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
                goalsPerMatch={goalsPerMatch}
                avgMinutesPerMatch={avgMinutesPerMatch}
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
  stats: PlayerCareerStats;
}

function CareerSummary({ stats }: CareerSummaryProps) {
  return (
    <View className="bg-white border border-slate-200 rounded-2xl p-6 gap-1">
      <Text className="text-lg font-bold text-slate-900 mb-4">Career Summary</Text>
      <SummaryRow label="Matches Played" value={stats.matchesPlayed} />
      <SummaryRow label="Goals Scored" value={stats.goals} />
      <SummaryRow label="Assists" value={stats.assists} />
      <SummaryRow label="Total Minutes" value={`${stats.minutesPlayed} min`} />
      <SummaryRow label="Yellow Cards" value={stats.yellowCards} />
      <SummaryRow label="Red Cards" value={stats.redCards} />
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
  goalsPerMatch: string;
  avgMinutesPerMatch: number;
}

function PerformanceInsights({
  goalsPerMatch,
  avgMinutesPerMatch,
}: PerformanceInsightsProps) {
  return (
    <View className="bg-white border border-slate-200 rounded-2xl p-6 gap-3">
      <Text className="text-lg font-bold text-slate-900 mb-2">Performance Insights</Text>
      <InsightCard label="Goals Per Match" value={goalsPerMatch} description="Average scoring" icon="flash" color="#f59e0b" />
      <InsightCard label="Avg Min/Match" value={avgMinutesPerMatch} description="Playing time" icon="time" color="#3b82f6" />
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
      </View>
      <View className="pt-3 border-t border-slate-200">
        <Text className="text-slate-600 text-xs font-semibold mb-2">Appearances</Text>
        <Text className="text-2xl font-bold text-slate-900">{team.appearances}</Text>
      </View>
    </View>
  );
}
