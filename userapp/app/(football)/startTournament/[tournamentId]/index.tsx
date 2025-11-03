// app/(football)/tournaments/[tournamentId].tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTournamentStore, TournamentStage } from '@/store/footballTournamentStore';

type TabType = 'fixtures' | 'standings' | 'matches' | 'bracket';

export default function TournamentDashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tournamentId = params.tournamentId as string;
  
  const {
    getTournament,
    getTournamentFixtures,
    getTournamentFixturesByStage,
    getTournamentTable,
    getUpcomingFixtures,
    getCompletedFixtures,
    startTournament,
    advanceToKnockoutStage,
    initializeTournamentMatch,
  } = useTournamentStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('fixtures');
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<TournamentStage>('group');
  const [refreshKey, setRefreshKey] = useState(0);

  const tournament = useMemo(() => getTournament(tournamentId), [tournamentId, getTournament, refreshKey]);
  const allFixtures = useMemo(() => getTournamentFixtures(tournamentId), [tournamentId, getTournamentFixtures, refreshKey]);
  const upcomingFixtures = useMemo(() => getUpcomingFixtures(tournamentId), [tournamentId, getUpcomingFixtures, refreshKey]);
  const completedFixtures = useMemo(() => getCompletedFixtures(tournamentId), [tournamentId, getCompletedFixtures, refreshKey]);
  const stageFixtures = useMemo(() => 
    getTournamentFixturesByStage(tournamentId, activeStage), 
    [tournamentId, getTournamentFixturesByStage, activeStage, refreshKey]
  );
  
  // Safe access to advancing teams per table
  const advancingTeamsPerTable = useMemo(() => {
    return tournament?.settings?.advancingTeamsPerTable || 2;
  }, [tournament?.settings?.advancingTeamsPerTable]);
  
  // Set initial active table when tournament loads
  useEffect(() => {
    if (tournament?.tables && tournament.tables.length > 0 && !activeTableId) {
      setActiveTableId(tournament.tables[0].id);
    }
  }, [tournament, activeTableId]);
  
  // Set active stage based on tournament's current stage
  useEffect(() => {
    if (tournament?.currentStage) {
      setActiveStage(tournament.currentStage);
    }
  }, [tournament?.currentStage]);

  // Get table standings for the active table
  const tableStandings = useMemo(() => {
    if (!tournament || !activeTableId) return [];
    return getTournamentTable(tournamentId, activeTableId);
  }, [getTournamentTable, tournamentId, activeTableId, refreshKey]);

  // Get active stage name in human readable format
  const activeStageDisplay = useMemo(() => {
    switch(activeStage) {
      case 'group': return 'Group Stage';
      case 'quarterfinals': return 'Quarter Finals';
      case 'semifinals': return 'Semi Finals';
      case 'final': return 'Final';
      default: return 'Group Stage';
    }
  }, [activeStage]);

  // Calculate total teams in knockout stage
  const totalKnockoutTeams = useMemo(() => {
    if (!tournament) return 0;
    return tournament.tables.length * advancingTeamsPerTable;
  }, [tournament, advancingTeamsPerTable]);

  // Determine available knockout stages based on teams advancing
  const availableKnockoutStages = useMemo(() => {
    const stages: TournamentStage[] = [];
    
    // Always show group stage
    stages.push('group');
    
    if (totalKnockoutTeams >= 8) {
      stages.push('quarterfinals');
      stages.push('semifinals');
      stages.push('final');
    } else if (totalKnockoutTeams >= 4) {
      stages.push('semifinals');
      stages.push('final');
    } else if (totalKnockoutTeams >= 2) {
      stages.push('final');
    }
    
    return stages;
  }, [totalKnockoutTeams]);

  // Generate the possible knockout structure display
  const knockoutStructureDisplay = useMemo(() => {
    if (totalKnockoutTeams >= 8) {
      return `${totalKnockoutTeams} teams → Quarter-Finals → Semi-Finals → Final`;
    } else if (totalKnockoutTeams >= 4) {
      return `${totalKnockoutTeams} teams → Semi-Finals → Final`;
    } else if (totalKnockoutTeams >= 2) {
      return `${totalKnockoutTeams} teams → Final`;
    }
    return 'No knockout stage';
  }, [totalKnockoutTeams]);

  // Filter fixtures based on active stage and table
  const filteredUpcomingFixtures = useMemo(() => {
    if (!tournament) return [];
    
    return upcomingFixtures.filter(fixture => {
      if (activeStage !== 'group') {
        return fixture.stage === activeStage;
      } else if (tournament.format === 'league' && activeTableId) {
        return fixture.stage === 'group' && fixture.tableId === activeTableId;
      }
      return fixture.stage === 'group';
    });
  }, [tournament, upcomingFixtures, activeStage, activeTableId]);

  // Filter completed fixtures based on active stage and table
  const filteredCompletedFixtures = useMemo(() => {
    if (!tournament) return [];
    
    return completedFixtures.filter(fixture => {
      if (activeStage !== 'group') {
        return fixture.stage === activeStage;
      } else if (tournament.format === 'league' && activeTableId) {
        return fixture.stage === 'group' && fixture.tableId === activeTableId;
      }
      return fixture.stage === 'group';
    });
  }, [tournament, completedFixtures, activeStage, activeTableId]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (allFixtures.length === 0) return 0;
    return Math.round((completedFixtures.length / allFixtures.length) * 100);
  }, [allFixtures.length, completedFixtures.length]);

  const handleStartTournament = () => {
    Alert.alert(
      'Start Tournament',
      'Are you ready to start this tournament? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          style: 'default',
          onPress: () => {
            startTournament(tournamentId);
            setRefreshKey(prev => prev + 1);
          },
        },
      ]
    );
  };
  
  const handleAdvanceToKnockout = () => {
    // Check if all group matches are completed
    const groupFixtures = allFixtures.filter(f => f.stage === 'group');
    const incompleteMatches = groupFixtures.filter(f => f.status !== 'completed').length;
    
    if (incompleteMatches > 0) {
      Alert.alert(
        'Cannot Advance',
        `Complete all group stage matches first. ${incompleteMatches} matches remaining.`
      );
      return;
    }
    
    // Determine first knockout stage based on number of teams advancing
    let nextStage: TournamentStage = 'final';
    if (totalKnockoutTeams >= 8) {
      nextStage = 'quarterfinals';
    } else if (totalKnockoutTeams >= 4) {
      nextStage = 'semifinals';
    }
    
    Alert.alert(
      'Advance to Knockout Stage',
      `Are you sure you want to advance to the knockout stage? This will create ${nextStage === 'quarterfinals' ? 'quarter-final' : nextStage === 'semifinals' ? 'semi-final' : 'final'} matches with the top ${advancingTeamsPerTable} teams from each group. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Advance',
          style: 'default',
          onPress: () => {
            advanceToKnockoutStage(tournamentId);
            setActiveStage(nextStage);
            setActiveTab('fixtures');
            setRefreshKey(prev => prev + 1);
          },
        },
      ]
    );
  };

  const handlePlayMatch = (fixtureId: string) => {
    const matchData = initializeTournamentMatch(tournamentId, fixtureId);
    
    if (!matchData) {
      Alert.alert('Error', 'Unable to initialize match');
      return;
    }

    router.push(`/(football)/startTournament/${tournamentId}/selectPlayers?fixtureId=${fixtureId}`);
  };

  const handleGoBack = () => {
    router.push('/(football)/landingScreen/tournament');
  };
  
  const handleStageChange = (stage: TournamentStage) => {
    setActiveStage(stage);
    setActiveTab(stage === 'group' ? 'fixtures' : 'bracket');
  };

  // Get human-readable name for previous match source
  const getPreviousMatchSource = (fixtureId?: string) => {
    if (!fixtureId || !tournament) return '';
    
    const matchParts = fixtureId.split('_');
    if (matchParts.length < 4) return '';
    
    const matchNumber = matchParts[3];
    return `Winner of Match ${matchNumber}`;
  };

  // Get group name for a team
  const getTeamGroupName = (teamId?: string | null) => {
    if (!teamId || !tournament) return '';
    
    const team = tournament.teams.find(t => t.id === teamId);
    if (!team || !team.tableId) return '';
    
    const table = tournament.tables.find(t => t.id === team.tableId);
    if (!table) return '';
    
    return table.name;
  };

  if (!tournamentId) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View className="items-center px-6">
          <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="alert-circle" size={32} color="#ef4444" />
          </View>
          <Text className="text-lg font-bold text-slate-900 mb-2">Invalid Tournament ID</Text>
          <Text className="text-slate-500 text-center mb-6">
            No tournament ID was provided.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(football)/landingScreen/tournament')}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go to Tournaments</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View className="items-center px-6">
          <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="trophy-outline" size={32} color="#64748b" />
          </View>
          <Text className="text-lg font-bold text-slate-900 mb-2">Tournament Not Found</Text>
          <Text className="text-slate-500 text-center mb-2">
            ID: {tournamentId}
          </Text>
          <Text className="text-slate-500 text-center mb-6">
            The tournament doesn't exist or may have been deleted.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(football)/landingScreen/tournament')}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go to Tournaments</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={handleGoBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>

        {/* Tournament Header */}
        <View>
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 bg-amber-100 rounded-lg items-center justify-center mr-3">
              <Ionicons name="trophy" size={20} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>
                {tournament.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className={`px-2 py-1 rounded ${
                  tournament.status === 'active' ? 'bg-green-100' :
                  tournament.status === 'completed' ? 'bg-blue-100' :
                  'bg-slate-100'
                }`}>
                  <Text className={`text-xs font-semibold ${
                    tournament.status === 'active' ? 'text-green-700' :
                    tournament.status === 'completed' ? 'text-blue-700' :
                    'text-slate-600'
                  }`}>
                    {tournament.status.toUpperCase()}
                  </Text>
                </View>
                <Text className="text-xs text-slate-500 ml-2">
                  {tournament.format === 'league' 
                    ? (tournament.settings.includeKnockoutStage ? 'Group + Knockout' : 'League Only') 
                    : 'Knockout'}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-slate-600 font-medium">Tournament Progress</Text>
              <Text className="text-xs text-slate-600 font-bold">{progressPercentage}%</Text>
            </View>
            <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <View 
                className="h-full bg-green-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
            <Text className="text-xs text-slate-500 mt-1">
              {completedFixtures.length} of {allFixtures.length} matches completed
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View className="bg-white px-4 py-4 border-b border-slate-100">
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-slate-900">{tournament.teams.length}</Text>
            <Text className="text-xs text-slate-500 mt-1">Teams</Text>
          </View>
          <View className="w-px bg-slate-200" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-slate-900">{tournament.tables.length}</Text>
            <Text className="text-xs text-slate-500 mt-1">
              {tournament.format === 'league' ? 'Groups' : 'Bracket'}
            </Text>
          </View>
          <View className="w-px bg-slate-200" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-slate-900">{allFixtures.length}</Text>
            <Text className="text-xs text-slate-500 mt-1">Matches</Text>
          </View>
        </View>
      </View>
      
      {/* Stage Selector - Only for active tournament */}
      {tournament.status !== 'draft' && tournament.format === 'league' && 
       tournament.settings.includeKnockoutStage && (
        <View className="bg-white px-4 py-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row py-2">
              {/* Available Stage Buttons */}
              {availableKnockoutStages.map(stage => {
                // Only show stages that have fixtures or are group stage
                const hasFixtures = allFixtures.some(f => f.stage === stage) || stage === 'group';
                if (!hasFixtures && tournament.status === 'active' && stage !== tournament.currentStage) {
                  return null;
                }
                
                const stageName = stage === 'group' 
                  ? 'Group Stage'
                  : stage === 'quarterfinals'
                    ? 'Quarter Finals'
                    : stage === 'semifinals'
                      ? 'Semi Finals'
                      : 'Final';
                
                return (
                  <TouchableOpacity
                    key={stage}
                    onPress={() => handleStageChange(stage)}
                    className={`px-4 py-2 rounded-lg mr-2 ${
                      activeStage === stage ? 'bg-blue-600' : 'bg-slate-100'
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${
                      activeStage === stage ? 'text-white' : 'text-slate-600'
                    }`}>
                      {stageName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Group Selector - Only for league format in group stage */}
      {tournament.format === 'league' && activeStage === 'group' && tournament.tables.length > 1 && (
        <View className="bg-white px-4 py-2 border-t border-slate-100">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row py-2">
              {tournament.tables.map((table) => (
                <TouchableOpacity
                  key={table.id}
                  onPress={() => setActiveTableId(table.id)}
                  className={`px-4 py-2 rounded-lg mr-2 ${
                    activeTableId === table.id ? 'bg-green-100' : 'bg-slate-100'
                  }`}
                >
                  <Text className={`text-sm font-semibold ${
                    activeTableId === table.id ? 'text-green-700' : 'text-slate-600'
                  }`}>
                    {table.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Tabs - Adjust based on stage */}
      <View className="bg-white px-4 pt-2 border-b border-slate-100">
        <View className="flex-row">
          {activeStage === 'group' ? (
            <>
              <TouchableOpacity
                onPress={() => setActiveTab('fixtures')}
                className={`flex-1 items-center pb-3 border-b-2 ${
                  activeTab === 'fixtures' ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <Text className={`font-semibold text-sm ${
                  activeTab === 'fixtures' ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  Fixtures
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setActiveTab('standings')}
                className={`flex-1 items-center pb-3 border-b-2 ${
                  activeTab === 'standings' ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <Text className={`font-semibold text-sm ${
                  activeTab === 'standings' ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  Standings
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setActiveTab('matches')}
                className={`flex-1 items-center pb-3 border-b-2 ${
                  activeTab === 'matches' ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <Text className={`font-semibold text-sm ${
                  activeTab === 'matches' ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  Completed
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setActiveTab('bracket')}
                className={`flex-1 items-center pb-3 border-b-2 ${
                  activeTab === 'bracket' ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <Text className={`font-semibold text-sm ${
                  activeTab === 'bracket' ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  Bracket
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setActiveTab('fixtures')}
                className={`flex-1 items-center pb-3 border-b-2 ${
                  activeTab === 'fixtures' ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <Text className={`font-semibold text-sm ${
                  activeTab === 'fixtures' ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  Fixtures
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setActiveTab('matches')}
                className={`flex-1 items-center pb-3 border-b-2 ${
                  activeTab === 'matches' ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <Text className={`font-semibold text-sm ${
                  activeTab === 'matches' ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  Completed
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Fixtures Tab */}
        {activeTab === 'fixtures' && (
          <View>
            {filteredUpcomingFixtures.length === 0 ? (
              <View className="items-center justify-center py-16">
                <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="calendar-outline" size={32} color="#64748b" />
                </View>
                <Text className="text-lg font-bold text-slate-900 mb-2">No Upcoming Fixtures</Text>
                <Text className="text-slate-500 text-center">
                  {tournament.status === 'draft' 
                    ? 'Start the tournament to begin playing matches' 
                    : activeStage === 'group'
                    ? 'All group matches have been completed'
                    : `All ${activeStageDisplay} matches have been completed`}
                </Text>
              </View>
            ) : (
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-4">
                  Upcoming {activeStageDisplay} Matches
                </Text>
                
                {filteredUpcomingFixtures.map((fixture) => (
                  <View
                    key={fixture.id}
                    className="bg-white rounded-xl p-4 mb-3 border border-slate-100"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-xs font-semibold text-slate-500">
                        {fixture.roundName || `Round ${fixture.round}`} • Match {fixture.matchNumber}
                      </Text>
                      <View className="bg-blue-50 px-2 py-1 rounded">
                        <Text className="text-xs font-semibold text-blue-700">UPCOMING</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 bg-emerald-500 rounded-lg items-center justify-center mr-2">
                            <Ionicons name="shield" size={14} color="white" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                              {fixture.homeTeamName}
                            </Text>
                            {fixture.stage !== 'group' && fixture.previousMatchIds && fixture.previousMatchIds.length > 0 && (
                              <Text className="text-xs text-slate-500">
                                {getPreviousMatchSource(fixture.previousMatchIds[0])}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                      <Text className="text-lg font-bold text-slate-400 mx-4">vs</Text>
                      <View className="flex-1 items-end">
                        <View className="flex-row items-center">
                          <View className="flex-1 items-end">
                            <Text className="text-sm font-bold text-slate-900 mr-2" numberOfLines={1}>
                              {fixture.awayTeamName}
                            </Text>
                            {fixture.stage !== 'group' && fixture.previousMatchIds && fixture.previousMatchIds.length > 1 && (
                              <Text className="text-xs text-slate-500 text-right">
                                {getPreviousMatchSource(fixture.previousMatchIds[1])}
                              </Text>
                            )}
                          </View>
                          <View className="w-8 h-8 bg-red-500 rounded-lg items-center justify-center">
                            <Ionicons name="flag" size={14} color="white" />
                          </View>
                        </View>
                      </View>
                    </View>

                    {tournament.status === 'active' && fixture.homeTeamId && fixture.awayTeamId && (
                      <TouchableOpacity
                        onPress={() => handlePlayMatch(fixture.id)}
                        className="bg-blue-600 rounded-lg py-3 items-center"
                      >
                        <Text className="text-white font-semibold text-sm">Play Match</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Standings Tab */}
        {activeTab === 'standings' && tournament.format === 'league' && (
          <View>
            {tableStandings.length === 0 ? (
              <View className="items-center justify-center py-16">
                <Text className="text-slate-500">No standings available yet</Text>
              </View>
            ) : (
              <View className="bg-white rounded-xl border border-slate-100 overflow-hidden mb-6">
                {/* Header */}
                <View className="flex-row items-center bg-slate-50 px-4 py-3 border-b border-slate-100">
                  <Text className="w-10 text-xs font-bold text-slate-600">#</Text>
                  <Text className="flex-1 text-xs font-bold text-slate-600">Team</Text>
                  <Text className="w-10 text-xs font-bold text-slate-600 text-center">P</Text>
                  <Text className="w-10 text-xs font-bold text-slate-600 text-center">W</Text>
                  <Text className="w-10 text-xs font-bold text-slate-600 text-center">D</Text>
                  <Text className="w-10 text-xs font-bold text-slate-600 text-center">L</Text>
                  <Text className="w-12 text-xs font-bold text-slate-600 text-center">GD</Text>
                  <Text className="w-12 text-xs font-bold text-slate-600 text-center">Pts</Text>
                </View>
                
                {/* Rows */}
                {tableStandings.map((team, index) => (
                  <View
                    key={team.id}
                    className={`flex-row items-center px-4 py-3 ${
                      index < tableStandings.length - 1 ? 'border-b border-slate-50' : ''
                    } ${index < advancingTeamsPerTable ? 'bg-green-50' : ''}`}
                  >
                    <Text className="w-10 text-sm font-bold text-slate-900">{index + 1}</Text>
                    <View className="flex-1 flex-row items-center">
                      <View className="w-6 h-6 bg-blue-100 rounded items-center justify-center mr-2">
                        <Ionicons name="shield" size={12} color="#3b82f6" />
                      </View>
                      <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>
                        {team.teamName}
                      </Text>
                    </View>
                    <Text className="w-10 text-sm text-slate-600 text-center">{team.played}</Text>
                    <Text className="w-10 text-sm text-slate-600 text-center">{team.won}</Text>
                    <Text className="w-10 text-sm text-slate-600 text-center">{team.drawn}</Text>
                    <Text className="w-10 text-sm text-slate-600 text-center">{team.lost}</Text>
                    <Text className={`w-12 text-sm font-semibold text-center ${
                      team.goalDifference > 0 ? 'text-green-600' :
                      team.goalDifference < 0 ? 'text-red-600' :
                      'text-slate-600'
                    }`}>
                      {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                    </Text>
                    <Text className="w-12 text-sm font-bold text-slate-900 text-center">{team.points}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Qualification explanation */}
            {tournament.settings.includeKnockoutStage && (
              <View className="bg-green-50 rounded-xl p-4 mb-6">
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#10b981" />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-semibold text-green-900 mb-1">Qualification</Text>
                    <Text className="text-sm text-green-700 leading-5">
                      Top {advancingTeamsPerTable} {advancingTeamsPerTable === 1 ? 'team' : 'teams'} from each group will advance to knockout stage.
                    </Text>
                    <Text className="text-sm text-green-700 mt-1">
                      {knockoutStructureDisplay}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Bracket Tab - For knockout stages */}
        {activeTab === 'bracket' && activeStage !== 'group' && (
          <View>
            {stageFixtures.length === 0 ? (
              <View className="items-center justify-center py-16">
                <Text className="text-slate-500">No matches in this stage yet</Text>
              </View>
            ) : (
              <View>
                <Text className="text-lg font-bold text-slate-900 mb-4">
                  {activeStageDisplay} Bracket
                </Text>
                
                {stageFixtures.map((fixture) => (
                  <View
                    key={fixture.id}
                    className={`bg-white rounded-xl p-4 mb-5 border-2 ${
                      fixture.status === 'completed'
                        ? 'border-green-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-xs font-semibold text-slate-500">
                        {fixture.roundName || activeStageDisplay} • Match {fixture.matchNumber}
                      </Text>
                      <View className={`px-2 py-1 rounded ${
                        fixture.status === 'completed'
                          ? 'bg-green-50'
                          : 'bg-blue-50'
                      }`}>
                        <Text className={`text-xs font-semibold ${
                          fixture.status === 'completed'
                            ? 'text-green-700'
                            : 'text-blue-700'
                        }`}>
                          {fixture.status === 'completed' ? 'COMPLETED' : 'UPCOMING'}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <View className={`w-8 h-8 rounded-lg items-center justify-center mr-2 ${
                            fixture.status === 'completed' && fixture.winnerId === fixture.homeTeamId
                              ? 'bg-green-500'
                              : 'bg-slate-400'
                          }`}>
                            <Ionicons name="shield" size={14} color="white" />
                          </View>
                          <View className="flex-1">
                            <Text className={`text-sm font-bold ${
                              fixture.status === 'completed' && fixture.winnerId === fixture.homeTeamId
                                ? 'text-green-700'
                                : 'text-slate-900'
                            }`} numberOfLines={1}>
                              {fixture.homeTeamName}
                            </Text>
                            
                            {/* Show source info for knockout matches */}
                            {fixture.stage !== 'group' && fixture.previousMatchIds && fixture.previousMatchIds.length > 0 ? (
                              <Text className="text-xs text-slate-500">
                                {getPreviousMatchSource(fixture.previousMatchIds[0])}
                              </Text>
                            ) : fixture.homeTeamId && (
                              <Text className="text-xs text-slate-500">
                                {getTeamGroupName(fixture.homeTeamId)}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                      
                      {fixture.status === 'completed' ? (
                        <View className="mx-4 bg-slate-50 rounded-lg px-3 py-2">
                          <View className="flex-row items-center">
                            <Text className={`text-lg font-bold ${
                              fixture.winnerId === fixture.homeTeamId
                                ? 'text-green-700'
                                : 'text-slate-700'
                            }`}>{fixture.homeScore || 0}</Text>
                            <Text className="text-sm font-medium text-slate-400 mx-2">-</Text>
                            <Text className={`text-lg font-bold ${
                              fixture.winnerId === fixture.awayTeamId
                                ? 'text-green-700'
                                : 'text-slate-700'
                            }`}>{fixture.awayScore || 0}</Text>
                          </View>
                        </View>
                      ) : (
                        <Text className="text-lg font-bold text-slate-400 mx-4">vs</Text>
                      )}
                      
                      <View className="flex-1 items-end">
                        <View className="flex-row items-center">
                          <View className="flex-1 items-end">
                            <Text className={`text-sm font-bold ${
                              fixture.status === 'completed' && fixture.winnerId === fixture.awayTeamId
                                ? 'text-green-700'
                                : 'text-slate-900'
                            }`} numberOfLines={1}>
                              {fixture.awayTeamName}
                            </Text>
                            
                            {/* Show source info for knockout matches */}
                            {fixture.stage !== 'group' && fixture.previousMatchIds && fixture.previousMatchIds.length > 1 ? (
                              <Text className="text-xs text-slate-500 text-right">
                                {getPreviousMatchSource(fixture.previousMatchIds[1])}
                              </Text>
                            ) : fixture.awayTeamId && (
                              <Text className="text-xs text-slate-500 text-right">
                                {getTeamGroupName(fixture.awayTeamId)}
                              </Text>
                            )}
                          </View>
                          <View className={`w-8 h-8 rounded-lg items-center justify-center ml-2 ${
                            fixture.status === 'completed' && fixture.winnerId === fixture.awayTeamId
                              ? 'bg-green-500'
                              : 'bg-slate-400'
                          }`}>
                            <Ionicons name="shield" size={14} color="white" />
                          </View>
                        </View>
                      </View>
                    </View>

                    {tournament.status === 'active' && 
                     fixture.status !== 'completed' && 
                     fixture.homeTeamId && fixture.awayTeamId && (
                      <TouchableOpacity
                        onPress={() => handlePlayMatch(fixture.id)}
                        className="bg-blue-600 rounded-lg py-3 items-center mt-2"
                      >
                        <Text className="text-white font-semibold text-sm">Play Match</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Bracket progression chart */}
            {stageFixtures.length > 0 && (
              <View className="bg-blue-50 rounded-xl p-4 mb-6 mt-2">
                <Text className="text-sm font-semibold text-blue-700 mb-2">Tournament Progression</Text>
                <Text className="text-xs text-blue-600">
                  {knockoutStructureDisplay}
                </Text>
                
                {tournament.winner && (
                  <View className="mt-3 pt-3 border-t border-blue-100">
                    <Text className="text-sm font-semibold text-blue-700">Tournament Winner</Text>
                    <View className="flex-row items-center mt-1">
                      <View className="w-6 h-6 bg-yellow-400 rounded-full items-center justify-center mr-2">
                        <Ionicons name="trophy" size={12} color="#fff" />
                      </View>
                      <Text className="text-base font-bold text-blue-700">{tournament.winner}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Completed Matches Tab */}
        {activeTab === 'matches' && (
          <View>
            {filteredCompletedFixtures.length === 0 ? (
              <View className="items-center justify-center py-16">
                <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle-outline" size={32} color="#64748b" />
                </View>
                <Text className="text-lg font-bold text-slate-900 mb-2">No Completed Matches</Text>
                <Text className="text-slate-500 text-center">
                  Completed matches will appear here
                </Text>
              </View>
            ) : (
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-4">
                  Completed {activeStageDisplay} Matches
                </Text>
                
                {filteredCompletedFixtures.map((fixture) => (
                  <TouchableOpacity
                    key={fixture.id}
                    className="bg-white rounded-xl p-4 mb-3 border border-slate-100"
                    onPress={() => {
                      if (fixture.id) {
                        router.push(`/(football)/landingScreen/matchDetails?matchId=${fixture.id}`);
                      }
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-xs font-semibold text-slate-500">
                        {fixture.roundName || `Round ${fixture.round}`} • Match {fixture.matchNumber}
                      </Text>
                      <View className="bg-green-50 px-2 py-1 rounded">
                        <Text className="text-xs font-semibold text-green-700">COMPLETED</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 flex-row items-center">
                        <View className={`w-8 h-8 rounded-lg items-center justify-center mr-2 ${
                          fixture.winnerId === fixture.homeTeamId ? 'bg-green-500' : 'bg-emerald-500'
                        }`}>
                          <Ionicons name="shield" size={14} color="white" />
                        </View>
                        <Text className={`text-sm font-bold flex-1 ${
                          fixture.winnerId === fixture.homeTeamId ? 'text-green-700' : 'text-slate-900'
                        }`} numberOfLines={1}>
                          {fixture.homeTeamName}
                        </Text>
                      </View>

                      <View className="mx-4 bg-slate-50 rounded-lg px-3 py-2">
                        <View className="flex-row items-center">
                          <Text className="text-lg font-bold text-slate-900">{fixture.homeScore}</Text>
                          <Text className="text-sm font-medium text-slate-400 mx-2">-</Text>
                          <Text className="text-lg font-bold text-slate-900">{fixture.awayScore}</Text>
                        </View>
                      </View>

                      <View className="flex-1 flex-row items-center justify-end">
                        <Text className={`text-sm font-bold flex-1 text-right ${
                          fixture.winnerId === fixture.awayTeamId ? 'text-green-700' : 'text-slate-900'
                        }`} numberOfLines={1}>
                          {fixture.awayTeamName}
                        </Text>
                        <View className={`w-8 h-8 rounded-lg items-center justify-center ml-2 ${
                          fixture.winnerId === fixture.awayTeamId ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          <Ionicons name="flag" size={14} color="white" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Tournament Control Buttons */}
      <View className="bg-white px-4 py-4 border-t border-slate-200">
        {tournament.status === 'draft' ? (
          // Start Tournament Button
          <TouchableOpacity
            onPress={handleStartTournament}
            className="bg-green-600 rounded-xl py-4 items-center"
          >
            <View className="flex-row items-center">
              <Ionicons name="play" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Start Tournament</Text>
            </View>
          </TouchableOpacity>
        ) : tournament.status === 'active' && 
           tournament.format === 'league' && 
           tournament.settings.includeKnockoutStage && 
           tournament.currentStage === 'group' && 
           allFixtures.filter(f => f.stage === 'group').every(f => f.status === 'completed') ? (
          // Advance to Knockout Stage Button
          <TouchableOpacity
            onPress={handleAdvanceToKnockout}
            className="bg-blue-600 rounded-xl py-4 items-center"
          >
            <View className="flex-row items-center">
              <Ionicons name="arrow-forward" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Advance to Knockout Stage
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}