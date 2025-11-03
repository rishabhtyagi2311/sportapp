// app/(football)/tournaments/selectTeams.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTournamentStore } from '@/store/footballTournamentStore';
import { useFootballStore } from '@/store/footballTeamStore';

export default function SelectTeamsScreen() {
  const router = useRouter();
  const { teams } = useFootballStore();
  const { 
    creationDraft, 
    addTeamToDraft, 
    removeTeamFromDraft, 
    assignTeamToTable, 
    updateCreationDraft 
  } = useTournamentStore();
  
  const selectedTeamIds = creationDraft?.selectedTeamIds || [];
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  
  // Create table objects for UI
  const tables = useMemo(() => {
    if (!creationDraft || creationDraft.format !== 'league') return [];
    
    return Array.from({ length: creationDraft.tableCount }, (_, index) => ({
      id: `table_${index + 1}`,
      name: `Group ${String.fromCharCode(65 + index)}`, // Group A, B, C, etc.
    }));
  }, [creationDraft]);
  
  // Calculate teams per table
  const teamsPerTable = useMemo(() => {
    if (!creationDraft) return 0;
    return Math.floor(creationDraft.teamCount / creationDraft.tableCount);
  }, [creationDraft]);
  
  // Set initial active table
  useEffect(() => {
    if (tables.length > 0 && !activeTableId) {
      setActiveTableId(tables[0].id);
    }
  }, [tables, activeTableId]);

  // Initialize teamTableAssignments if not present
  useEffect(() => {
    if (creationDraft && creationDraft.format === 'league' && !creationDraft.teamTableAssignments) {
      updateCreationDraft({
        teamTableAssignments: {},
      });
    }
  }, [creationDraft, updateCreationDraft]);
  
  // Get teams assigned to current table
  const teamsInCurrentTable = useMemo(() => {
    if (!activeTableId || !creationDraft?.teamTableAssignments) return [];
    
    return selectedTeamIds.filter(teamId => 
      creationDraft.teamTableAssignments?.[teamId] === activeTableId
    );
  }, [selectedTeamIds, activeTableId, creationDraft?.teamTableAssignments]);
  
  // Check if teams are evenly distributed
  const tableDistribution = useMemo(() => {
    if (!creationDraft || !creationDraft.teamTableAssignments || tables.length === 0) {
      return { isEven: false, distribution: {} };
    }
    
    const distribution: Record<string, number> = {};
    tables.forEach(table => {
      distribution[table.id] = 0;
    });
    
    // Count teams per table
    Object.entries(creationDraft.teamTableAssignments).forEach(([teamId, tableId]) => {
      if (selectedTeamIds.includes(teamId) && distribution[tableId] !== undefined) {
        distribution[tableId]++;
      }
    });
    
    // Check if all tables have the same number of teams
    const isEven = Object.values(distribution).every(count => count === teamsPerTable);
    
    return { isEven, distribution };
  }, [creationDraft, selectedTeamIds, tables, teamsPerTable]);

  const handleToggleTeam = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      removeTeamFromDraft(teamId);
    } else if (selectedTeamIds.length < (creationDraft?.teamCount || 0)) {
      // If adding a team
      addTeamToDraft(teamId);
      
      // For league format, assign to current table if it's not full
      if (creationDraft?.format === 'league' && activeTableId) {
        const teamsInTable = selectedTeamIds.filter(id => 
          creationDraft.teamTableAssignments?.[id] === activeTableId
        ).length;
        
        if (teamsInTable < teamsPerTable) {
          assignTeamToTable(teamId, activeTableId);
        } else {
          // Table is full, show alert
          Alert.alert(
            'Group Full', 
            `Group ${tables.find(t => t.id === activeTableId)?.name.split(' ')[1]} already has ${teamsPerTable} teams. Please select another group.`,
            [
              { 
                text: 'OK', 
                onPress: () => {
                  // Find a table with space
                  const tableWithSpace = tables.find(table => {
                    const count = selectedTeamIds.filter(id => 
                      creationDraft.teamTableAssignments?.[id] === table.id
                    ).length;
                    return count < teamsPerTable;
                  });
                  
                  if (tableWithSpace) {
                    setActiveTableId(tableWithSpace.id);
                    assignTeamToTable(teamId, tableWithSpace.id);
                  }
                }
              }
            ]
          );
        }
      }
    } else {
      Alert.alert('Team Limit Reached', 
        `You can only select ${creationDraft?.teamCount} teams for this tournament.`);
    }
  };
  
  const handleAssignToTable = (teamId: string, tableId: string) => {
    if (!creationDraft) return;
    
    // Check if the target table has space
    const teamsInTable = selectedTeamIds.filter(id => 
      creationDraft.teamTableAssignments?.[id] === tableId
    ).length;
    
    if (teamsInTable >= teamsPerTable) {
      Alert.alert('Group Full', 
        `Group ${tables.find(t => t.id === tableId)?.name.split(' ')[1]} already has the maximum number of teams (${teamsPerTable}).`);
      return;
    }
    
    assignTeamToTable(teamId, tableId);
  };

  const handleContinue = () => {
    if (selectedTeamIds.length < (creationDraft?.teamCount || 0)) {
      Alert.alert('Error', `Please select all ${creationDraft?.teamCount} teams needed for this tournament.`);
      return;
    }
    
    // For league format, ensure all teams are assigned to tables
    if (creationDraft?.format === 'league') {
      const unassignedTeams = selectedTeamIds.filter(
        teamId => !creationDraft.teamTableAssignments?.[teamId]
      );
      
      if (unassignedTeams.length > 0) {
        Alert.alert('Error', 'Please assign all selected teams to groups.');
        return;
      }
      
      // Check if teams are evenly distributed
      if (!tableDistribution.isEven) {
        // Count teams in each table for the error message
        const imbalancedGroups = Object.entries(tableDistribution.distribution)
          .filter(([_, count]) => count !== teamsPerTable)
          .map(([tableId, count]) => {
            const tableName = tables.find(t => t.id === tableId)?.name || 'Unknown';
            return `${tableName}: ${count}/${teamsPerTable} teams`;
          })
          .join('\n');
        
        Alert.alert(
          'Groups Not Balanced', 
          `Each group must have exactly ${teamsPerTable} teams.\n\nImbalanced groups:\n${imbalancedGroups}`,
          [
            {
              text: 'Fix Now',
              style: 'cancel'
            },
            {
              text: 'Continue Anyway',
              style: 'destructive',
              onPress: () => router.push('/(football)/startTournament/tournamentSpecifics')
            }
          ]
        );
        return;
      }
    }
    
    // Navigate to settings
    router.push('/(football)/startTournament/tournamentSpecifics');
  };

  const handleBack = () => {
    router.back();
  };

  // Calculate total matches based on format
  const totalMatches = useMemo(() => {
    if (!creationDraft) return 0;
    const n = creationDraft.teamCount;
    if (n < 2) return 0;

    if (creationDraft.format === 'league') {
      // Each team plays every other team in their group once
      const matchesPerTable = (teamsPerTable * (teamsPerTable - 1)) / 2;
      let total = matchesPerTable * creationDraft.tableCount;
      
      // Add knockout stage matches if enabled
      if (creationDraft.includeKnockoutStage) {
        const teamsAdvancing = creationDraft.tableCount * (creationDraft.settings.advancingTeamsPerTable || 2);
        // Knockout matches = teams - 1
        total += teamsAdvancing - 1;
      }
      
      return total;
    } else {
      // Knockout: teams - 1
      return n - 1;
    }
  }, [creationDraft, teamsPerTable]);

  // Group teams by some criteria or just show all
  const availableTeams = useMemo(() => {
    return teams.filter(team => team.teamName); // Filter valid teams
  }, [teams]);

  if (!creationDraft) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500">No tournament draft found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Select Teams</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="bg-white px-4 py-3 border-b border-slate-100">
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center">
            <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
            <View className="flex-1 h-1 bg-green-600 mx-2" />
          </View>
          <View className="flex-1 flex-row items-center">
            <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
              <Text className="text-white font-bold text-sm">2</Text>
            </View>
            <View className="flex-1 h-1 bg-slate-200 mx-2" />
          </View>
          <View className="w-8 h-8 bg-slate-200 rounded-full items-center justify-center">
            <Text className="text-slate-400 font-bold text-sm">3</Text>
          </View>
        </View>
        <View className="flex-row justify-between mt-2 px-1">
          <Text className="text-xs font-medium text-green-600">Basic Info</Text>
          <Text className="text-xs font-medium text-blue-600">Teams</Text>
          <Text className="text-xs text-slate-400">Settings</Text>
        </View>
      </View>

      {/* Table Tabs - Only for League Format */}
      {creationDraft.format === 'league' && tables.length > 0 && (
        <View className="bg-white px-4 py-3 border-b border-slate-100">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {tables.map((table) => {
                const currentCount = tableDistribution.distribution[table.id] || 0;
                const isFull = currentCount >= teamsPerTable;
                const isOverfilled = currentCount > teamsPerTable;
                return (
                  <TouchableOpacity
                    key={table.id}
                    onPress={() => setActiveTableId(table.id)}
                    className={`px-4 py-2 rounded-lg mr-2 ${
                      activeTableId === table.id 
                        ? 'bg-blue-100' 
                        : isOverfilled
                          ? 'bg-red-100'
                          : isFull
                            ? 'bg-green-100'
                            : 'bg-slate-100'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Text className={`text-sm font-semibold ${
                        activeTableId === table.id 
                          ? 'text-blue-700'
                          : isOverfilled
                            ? 'text-red-700'
                            : isFull
                              ? 'text-green-700'
                              : 'text-slate-600'
                      }`}>
                        {table.name}
                      </Text>
                      
                      {/* Status indicator */}
                      <View className={`ml-2 px-2 py-0.5 rounded-full ${
                        isOverfilled
                          ? 'bg-red-200'
                          : isFull
                            ? 'bg-green-200'
                            : 'bg-slate-200'
                      }`}>
                        <Text className={`text-xs font-medium ${
                          isOverfilled
                            ? 'text-red-800'
                            : isFull
                              ? 'text-green-800'
                              : 'text-slate-600'
                        }`}>
                          {currentCount}/{teamsPerTable}
                          {isFull && !isOverfilled && ' ✓'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Selected Count */}
      <View className="bg-blue-50 mx-4 mt-4 rounded-xl p-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-sm text-blue-700 mb-1">Selected Teams</Text>
            <Text className="text-2xl font-bold text-blue-900">
              {selectedTeamIds.length} / {creationDraft.teamCount}
            </Text>
            {creationDraft.format === 'league' && (
              <Text className="text-xs text-blue-700 mt-1">
                Each group must have exactly {teamsPerTable} teams
              </Text>
            )}
          </View>
          <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center">
            <Ionicons name="people" size={24} color="#1e40af" />
          </View>
        </View>
        
        {selectedTeamIds.length > 0 && (
          <View className="border-t border-blue-200 pt-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="trophy-outline" size={14} color="#1e40af" />
                <Text className="text-xs text-blue-700 ml-1 font-medium">Total Matches:</Text>
              </View>
              <Text className="text-sm font-bold text-blue-900">{totalMatches}</Text>
            </View>
            
            {/* Tournament format info */}
            {creationDraft.format === 'league' ? (
              <Text className="text-xs text-blue-600 mt-2 italic">
                {creationDraft.includeKnockoutStage 
                  ? 'Group stage followed by knockout rounds' 
                  : 'Group stage only, winner by points'}
              </Text>
            ) : (
              <Text className="text-xs text-blue-600 mt-2 italic">
                Single-elimination knockout tournament
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Teams List */}
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {availableTeams.length === 0 ? (
          <View className="items-center justify-center py-16">
            <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="people-outline" size={32} color="#64748b" />
            </View>
            <Text className="text-slate-900 font-bold text-lg mb-2">No Teams Available</Text>
            <Text className="text-slate-500 text-center mb-6">
              You need to create teams first before creating a tournament
            </Text>
          </View>
        ) : (
          <>
            {/* Title - Different for League vs Knockout */}
            {creationDraft.format === 'league' && activeTableId ? (
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-semibold text-slate-700">
                  {tables.find(t => t.id === activeTableId)?.name} • Available Teams
                </Text>
                
                {/* Show current group status */}
                {activeTableId && (
                  <View className={`px-2 py-1 rounded-lg ${
                    teamsInCurrentTable.length > teamsPerTable
                      ? 'bg-red-100'
                      : teamsInCurrentTable.length === teamsPerTable
                        ? 'bg-green-100'
                        : 'bg-blue-50'
                  }`}>
                    <Text className={`text-xs font-semibold ${
                      teamsInCurrentTable.length > teamsPerTable
                        ? 'text-red-700'
                        : teamsInCurrentTable.length === teamsPerTable
                          ? 'text-green-700'
                          : 'text-blue-700'
                    }`}>
                      {teamsInCurrentTable.length}/{teamsPerTable} Teams
                      {teamsInCurrentTable.length === teamsPerTable && ' (Full)'}
                      {teamsInCurrentTable.length > teamsPerTable && ' (Over Limit)'}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text className="text-sm font-semibold text-slate-700 mb-3">
                Available Teams ({availableTeams.length})
              </Text>
            )}
            
            {availableTeams.map((team) => {
              const isSelected = selectedTeamIds.includes(team.id);
              const teamTableId = creationDraft.teamTableAssignments?.[team.id];
              const isInActiveTable = activeTableId && teamTableId === activeTableId;
              
              // For league format with active table, only show teams in this table or unassigned teams
              if (creationDraft.format === 'league' && activeTableId && isSelected && teamTableId && !isInActiveTable) {
                return null;
              }
              
              // Calculate if this team should be disabled
              const isDisabled = Boolean(
                creationDraft.format === 'league' && 
                activeTableId && 
                teamsInCurrentTable.length >= teamsPerTable && 
                !isInActiveTable
              );
              
              return (
                <TouchableOpacity
                  key={team.id}
                  onPress={() => handleToggleTeam(team.id)}
                  className={`bg-white rounded-xl p-4 mb-3 border-2 ${
                    isSelected 
                      ? isInActiveTable ? 'border-blue-500' : 'border-green-500' 
                      : 'border-slate-100'
                  }`}
                  disabled={isDisabled}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View
                        className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                          isSelected 
                            ? isInActiveTable ? 'bg-blue-100' : 'bg-green-100' 
                            : 'bg-slate-100'
                        }`}
                      >
                        <Ionicons
                          name="shield"
                          size={24}
                          color={
                            isSelected 
                              ? isInActiveTable ? '#3b82f6' : '#10b981' 
                              : '#64748b'
                          }
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                          {team.teamName}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-sm text-slate-500">
                            {team.memberPlayerIds?.length || 0} Players
                          </Text>
                          
                          {/* Show table assignment for selected teams */}
                          {isSelected && teamTableId && creationDraft.format === 'league' && (
                            <View className="bg-slate-100 rounded px-2 py-0.5 ml-2">
                              <Text className="text-xs text-slate-600">
                                {tables.find(t => t.id === teamTableId)?.name}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    
                    {/* Different actions based on selection state */}
                    {isSelected ? (
                      // If selected, show either move/remove options or checkmark
                      creationDraft.format === 'league' && teamTableId !== activeTableId ? (
                        <TouchableOpacity
                          onPress={() => handleAssignToTable(team.id, activeTableId!)}
                          className={`px-3 py-1 rounded-lg ${
                            teamsInCurrentTable.length >= teamsPerTable 
                              ? 'bg-slate-300' 
                              : 'bg-blue-600'
                          }`}
                          disabled={teamsInCurrentTable.length >= teamsPerTable}
                        >
                          <Text className={`text-xs font-semibold ${
                            teamsInCurrentTable.length >= teamsPerTable 
                              ? 'text-slate-500' 
                              : 'text-white'
                          }`}>
                            {teamsInCurrentTable.length >= teamsPerTable 
                              ? 'Group Full' 
                              : `Move to ${tables.find(t => t.id === activeTableId)?.name}`
                            }
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View
                          className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
                            isInActiveTable
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-green-600 border-green-600'
                          }`}
                        >
                          <Ionicons name="checkmark" size={14} color="white" />
                        </View>
                      )
                    ) : (
                      // If not selected, show add button or disabled state
                      selectedTeamIds.length < creationDraft.teamCount ? (
                        creationDraft.format !== 'league' || 
                        !activeTableId || 
                        teamsInCurrentTable.length < teamsPerTable ? (
                          <View
                            className="w-6 h-6 rounded-full items-center justify-center border-2 border-slate-300"
                          />
                        ) : (
                          <View className="bg-slate-200 px-2 py-1 rounded">
                            <Text className="text-xs text-slate-600">
                              Group Full
                            </Text>
                          </View>
                        )
                      ) : (
                        <View className="bg-slate-200 px-2 py-1 rounded">
                          <Text className="text-xs text-slate-600">Full</Text>
                        </View>
                      )
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
        <View className="h-24" />
      </ScrollView>

      {/* Continue Button */}
      <View className="bg-white px-4 py-4 border-t border-slate-200">
        <TouchableOpacity
          onPress={handleContinue}
          className={`rounded-xl py-4 items-center ${
            selectedTeamIds.length === creationDraft.teamCount && 
            (creationDraft.format !== 'league' || tableDistribution.isEven)
              ? 'bg-blue-600' 
              : 'bg-slate-300'
          }`}
          disabled={selectedTeamIds.length !== creationDraft.teamCount || 
                  (creationDraft.format === 'league' && !tableDistribution.isEven)}
        >
          <Text className="text-white font-bold text-base">
            Continue to Settings ({selectedTeamIds.length}/{creationDraft.teamCount} teams)
          </Text>
        </TouchableOpacity>
        
        {/* Warning message for uneven distribution */}
        {creationDraft.format === 'league' && 
         selectedTeamIds.length === creationDraft.teamCount && 
         !tableDistribution.isEven && (
          <View className="mt-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <Text className="text-amber-800 text-xs text-center">
              Each group must have exactly {teamsPerTable} teams. Please rebalance your groups to continue.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}