// app/(football)/tournaments/create.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTournamentStore, TournamentFormat } from '@/store/footballTournamentStore';

export default function CreateTournamentScreen() {
  const router = useRouter();
  const { startTournamentCreation, updateCreationDraft, creationDraft } = useTournamentStore();
  
  const [tournamentName, setTournamentName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<TournamentFormat>('league');
  
  // New state variables for team count and tables
  const [teamCount, setTeamCount] = useState('8');
  const [tableCount, setTableCount] = useState('2');
  const [includeKnockoutStage, setIncludeKnockoutStage] = useState(true);
  
  // Calculate max tables based on team count
  const maxTables = parseInt(teamCount) > 0 ? Math.floor(parseInt(teamCount) / 2) : 1;
  
  // Validate table count when team count changes
  useEffect(() => {
    const teams = parseInt(teamCount);
    const tables = parseInt(tableCount);
    
    if (teams > 0 && tables > maxTables) {
      setTableCount(maxTables.toString());
    }
  }, [teamCount, maxTables]);

  const handleContinue = () => {
    if (!tournamentName.trim()) {
      Alert.alert('Error', 'Please enter a tournament name');
      return;
    }

    // Validate team count
    const teams = parseInt(teamCount);
    if (isNaN(teams) || teams < 2 || teams % 2 !== 0) {
      Alert.alert('Error', 'Please enter an even number of teams (minimum 2)');
      return;
    }

    // Validate table count for league format
    if (selectedFormat === 'league') {
      const tables = parseInt(tableCount);
      if (isNaN(tables) || tables < 1) {
        Alert.alert('Error', 'Please enter at least 1 table');
        return;
      }
      
      if (teams % tables !== 0) {
        Alert.alert('Error', `Team count (${teams}) must be evenly divisible by table count (${tables})`);
        return;
      }
    }

    // Initialize creation draft
    startTournamentCreation(tournamentName);
    updateCreationDraft({
      description: description.trim() || undefined,
      format: selectedFormat,
      teamCount: teams,
      tableCount: selectedFormat === 'league' ? parseInt(tableCount) : 1,
      includeKnockoutStage: selectedFormat === 'league' ? includeKnockoutStage : true,
    });

    // Navigate to team selection
    router.push('/(football)/startTournament/selectTeams');
  };

  const formatOptions = [
    {
      id: 'league' as TournamentFormat,
      name: 'League',
      description: 'Group stage format with tables, optionally followed by knockout rounds',
      icon: 'list',
      color: '#10b981',
    },
    {
      id: 'knockout' as TournamentFormat,
      name: 'Knockout',
      description: 'Single-elimination tournament format',
      icon: 'trophy',
      color: '#f59e0b',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-slate-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="close" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Create Tournament</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="bg-white px-4 py-3 border-b border-slate-100">
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center">
            <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
              <Text className="text-white font-bold text-sm">1</Text>
            </View>
            <View className="flex-1 h-1 bg-slate-200 mx-2" />
          </View>
          <View className="flex-1 flex-row items-center">
            <View className="w-8 h-8 bg-slate-200 rounded-full items-center justify-center">
              <Text className="text-slate-400 font-bold text-sm">2</Text>
            </View>
            <View className="flex-1 h-1 bg-slate-200 mx-2" />
          </View>
          <View className="w-8 h-8 bg-slate-200 rounded-full items-center justify-center">
            <Text className="text-slate-400 font-bold text-sm">3</Text>
          </View>
        </View>
        <View className="flex-row justify-between mt-2 px-1">
          <Text className="text-xs font-medium text-blue-600">Basic Info</Text>
          <Text className="text-xs text-slate-400">Teams</Text>
          <Text className="text-xs text-slate-400">Settings</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Tournament Name */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 mb-2">Tournament Name *</Text>
          <TextInput
            value={tournamentName}
            onChangeText={setTournamentName}
            placeholder="e.g. Summer Championship 2024"
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 mb-2">Description (Optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description of the tournament..."
            multiline
            numberOfLines={3}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900"
            placeholderTextColor="#94a3b8"
            textAlignVertical="top"
          />
        </View>

        {/* Team Count */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 mb-2">Number of Teams *</Text>
          <View className="flex-row items-center">
            <TextInput
              value={teamCount}
              onChangeText={setTeamCount}
              keyboardType="numeric"
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 flex-1"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <Text className="text-xs text-slate-500 mt-2">
            Please enter an even number (e.g., 4, 6, 8, 12, 16, etc.)
          </Text>
        </View>

        {/* Tournament Format */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 mb-3">Tournament Format *</Text>
          {formatOptions.map((format) => (
            <TouchableOpacity
              key={format.id}
              onPress={() => setSelectedFormat(format.id)}
              className={`bg-white rounded-xl p-4 mb-3 border-2 ${
                selectedFormat === format.id ? 'border-blue-500' : 'border-slate-100'
              }`}
            >
              <View className="flex-row items-start">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: `${format.color}15` }}
                >
                  <Ionicons name={format.icon as any} size={24} color={format.color} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-base font-bold text-slate-900">{format.name}</Text>
                    {selectedFormat === format.id && (
                      <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-slate-600 leading-5">{format.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* League Format Options */}
        {selectedFormat === 'league' && (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-slate-700 mb-3">League Configuration</Text>
            
            {/* Table Count */}
            <View className="bg-white rounded-xl p-4 mb-3 border border-slate-200">
              <Text className="text-sm font-semibold text-slate-700 mb-2">Number of Tables/Groups *</Text>
              <View className="flex-row items-center">
                <TextInput
                  value={tableCount}
                  onChangeText={setTableCount}
                  keyboardType="numeric"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 flex-1"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <Text className="text-xs text-slate-500 mt-2">
                Teams per table: {parseInt(teamCount) > 0 && parseInt(tableCount) > 0 ? Math.floor(parseInt(teamCount) / parseInt(tableCount)) : 0}
                {parseInt(tableCount) > maxTables && (
                  <Text className="text-red-500"> (Max tables: {maxTables})</Text>
                )}
              </Text>
            </View>

            {/* Knockout Stage Option */}
            <View className="bg-white rounded-xl p-4 mb-3 border border-slate-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-700">Include Knockout Stage</Text>
                  <Text className="text-xs text-slate-500 mt-1">
                    Top teams from each table advance to knockout rounds
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setIncludeKnockoutStage(!includeKnockoutStage)}
                  className={`w-12 h-7 rounded-full ${includeKnockoutStage ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <View className={`absolute top-1 ${includeKnockoutStage ? 'right-1' : 'left-1'} w-5 h-5 bg-white rounded-full`} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Info Box */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-blue-900 mb-1">Tournament Structure</Text>
              <Text className="text-sm text-blue-700 leading-5">
                {selectedFormat === 'league' ? (
                  includeKnockoutStage ? (
                    `${parseInt(teamCount)} teams will be divided into ${parseInt(tableCount)} ${parseInt(tableCount) > 1 ? 'groups' : 'group'} with ${parseInt(teamCount) > 0 && parseInt(tableCount) > 0 ? Math.floor(parseInt(teamCount) / parseInt(tableCount)) : 0} teams each. After the group stage, top teams will advance to knockout rounds.`
                  ) : (
                    `${parseInt(teamCount)} teams will be divided into ${parseInt(tableCount)} ${parseInt(tableCount) > 1 ? 'groups' : 'group'} with ${parseInt(teamCount) > 0 && parseInt(tableCount) > 0 ? Math.floor(parseInt(teamCount) / parseInt(tableCount)) : 0} teams each. The tournament winner will be determined by group standings.`
                  )
                ) : (
                  `${parseInt(teamCount)} teams will compete in a single-elimination knockout tournament.`
                )}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="bg-white px-4 py-4 border-t border-slate-200">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-blue-600 rounded-xl py-4 items-center"
          disabled={!tournamentName.trim()}
        >
          <Text className="text-white font-bold text-base">Continue to Team Selection</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}