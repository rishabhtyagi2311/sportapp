// app/(football)/matches/createMatch.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFootballStore } from '@/store/footballTeamStore';

interface Team {
  id: string;
  teamName: string;
  city: string;
  memberPlayerIds: string[];
  maxPlayers: number;
  status: string;
}

export default function SelectTeamsScreen() {
  const { teams } = useFootballStore();
  const [selectedMyTeam, setSelectedMyTeam] = useState<Team | null>(null);
  const [selectedOpponentTeam, setSelectedOpponentTeam] = useState<Team | null>(null);

  const handleGoBack = () => {
    router.back();
  };

  const handleProceed = () => {
    if (selectedMyTeam && selectedOpponentTeam) {
     router.push(`/startMatch/basicDetailsOne?myTeamId=${selectedMyTeam.id}&opponentTeamId=${selectedOpponentTeam.id}`);

    }
  };

  const renderTeamCard = (team: Team, isSelected: boolean, onSelect: () => void, teamType: 'my' | 'opponent') => (
    <TouchableOpacity
      key={team.id}
      onPress={onSelect}
      activeOpacity={0.7}
      className={`rounded-2xl p-4 mb-3 border-2 ${
        isSelected 
          ? teamType === 'my' 
            ? 'bg-green-50 border-green-300' 
            : 'bg-blue-50 border-blue-300'
          : 'bg-white border-gray-200'
      }`}
      style={{
        elevation: isSelected ? 3 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isSelected ? 0.15 : 0.05,
        shadowRadius: 4,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Text className={`text-lg font-bold ${
              isSelected 
                ? teamType === 'my' ? 'text-green-800' : 'text-blue-800'
                : 'text-gray-900'
            }`}>
              {team.teamName}
            </Text>
            {team.status === 'active' && (
              <View className="ml-2 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons 
              name="location-outline" 
              size={14} 
              color={isSelected ? (teamType === 'my' ? '#166534' : '#1e40af') : '#6b7280'} 
            />
            <Text className={`text-sm ml-1 ${
              isSelected 
                ? teamType === 'my' ? 'text-green-700' : 'text-blue-700'
                : 'text-gray-600'
            }`}>
              {team.city}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons 
              name="people-outline" 
              size={14} 
              color={isSelected ? (teamType === 'my' ? '#166534' : '#1e40af') : '#6b7280'} 
            />
            <Text className={`text-sm ml-1 ${
              isSelected 
                ? teamType === 'my' ? 'text-green-700' : 'text-blue-700'
                : 'text-gray-600'
            }`}>
              {team.memberPlayerIds.length}/{team.maxPlayers} Players
            </Text>
          </View>
        </View>

        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          isSelected 
            ? teamType === 'my'
              ? 'bg-green-500 border-green-500'
              : 'bg-blue-500 border-blue-500'
            : 'border-gray-300'
        }`}>
          {isSelected && (
            <Ionicons name="checkmark" size={14} color="white" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const canProceed = selectedMyTeam && selectedOpponentTeam && selectedMyTeam.id !== selectedOpponentTeam.id;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-900 px-4 py-6">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleGoBack}
            className="mr-4 w-10 h-10 bg-gray-700 rounded-xl items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">
              Setup Match
            </Text>
            <Text className="text-gray-300 mt-1">
              Choose your team and opponent
            </Text>
          </View>

          <View className="w-10 h-10 bg-gray-700 rounded-xl items-center justify-center">
            <Ionicons name="football" size={20} color="white" />
          </View>
        </View>
      </View>

      {/* Match Preview */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-200 shadow-sm">
        <View className="flex-row items-center justify-between">
          {/* My Team */}
          <View className="flex-1 items-center">
            <View className="w-16 h-16 bg-green-100 rounded-2xl items-center justify-center mb-2">
              <Ionicons 
                name="shield" 
                size={24} 
                color={selectedMyTeam ? "#16a34a" : "#9ca3af"} 
              />
            </View>
            <Text className="text-xs text-green-600 font-semibold mb-1">MY TEAM</Text>
            <Text className="text-sm font-bold text-gray-900 text-center" numberOfLines={1}>
              {selectedMyTeam ? selectedMyTeam.teamName : 'Select Team'}
            </Text>
          </View>

          {/* VS Divider */}
          <View className="mx-4 items-center">
            <View className="w-12 h-12 bg-gray-900 rounded-full items-center justify-center">
              <Text className="text-white font-bold text-sm">VS</Text>
            </View>
          </View>

          {/* Opponent Team */}
          <View className="flex-1 items-center">
            <View className="w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mb-2">
              <Ionicons 
                name="flag" 
                size={24} 
                color={selectedOpponentTeam ? "#2563eb" : "#9ca3af"} 
              />
            </View>
            <Text className="text-xs text-blue-600 font-semibold mb-1">OPPONENT</Text>
            <Text className="text-sm font-bold text-gray-900 text-center" numberOfLines={1}>
              {selectedOpponentTeam ? selectedOpponentTeam.teamName : 'Select Team'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* My Team Selection */}
        <View className="mx-4 mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-green-500 rounded-lg items-center justify-center mr-3">
              <Ionicons name="shield" size={16} color="white" />
            </View>
            <Text className="text-lg font-bold text-gray-900">Select My Team</Text>
          </View>

          {teams.map(team => renderTeamCard(team, selectedMyTeam?.id === team.id, () => setSelectedMyTeam(team), 'my'))}
        </View>

        {/* Opponent Team Selection */}
        <View className="mx-4">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-blue-500 rounded-lg items-center justify-center mr-3">
              <Ionicons name="flag" size={16} color="white" />
            </View>
            <Text className="text-lg font-bold text-gray-900">Select Opponent Team</Text>
          </View>

          {teams.filter(team => team.id !== selectedMyTeam?.id).map(team => 
            renderTeamCard(team, selectedOpponentTeam?.id === team.id, () => setSelectedOpponentTeam(team), 'opponent')
          )}
        </View>
      </ScrollView>

      {/* Proceed Button */}
      <View className="bg-white px-4 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleProceed}
          disabled={!canProceed}
          className={`rounded-2xl py-4 ${canProceed ? 'bg-gray-900' : 'bg-gray-300'}`}
          activeOpacity={0.8}
          style={canProceed ? { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 } : {}}
        >
          <View className="flex-row items-center justify-center">
            <Text className={`font-bold text-lg mr-2 ${canProceed ? 'text-white' : 'text-gray-500'}`}>
              Proceed to Match Setup
            </Text>
            <Ionicons name="arrow-forward" size={20} color={canProceed ? 'white' : '#6b7280'} />
          </View>
        </TouchableOpacity>

        {!canProceed && selectedMyTeam && selectedOpponentTeam && selectedMyTeam.id === selectedOpponentTeam.id && (
          <Text className="text-red-500 text-sm text-center mt-2">
            My team and opponent team must be different
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
