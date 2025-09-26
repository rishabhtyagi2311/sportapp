// app/(football)/teams/viewMembers.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useFootballStore } from '@/store/footballTeamStore';

const { width } = Dimensions.get('window');

export default function ViewMembersScreen() {
  const { teamId } = useLocalSearchParams();
  const { getTeamById, getTeamPlayers } = useFootballStore();
  
  // Get team by ID from route parameters
  const team = teamId ? getTeamById(teamId as string) : null;
  const teamPlayers = team ? getTeamPlayers(team.id) : [];

  const handleGoBack = () => {
    router.back();
  };

  const renderPlayerItem = (player: any, index: number) => (
    <View
      key={player.id}
      className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100"
    >
      {/* Profile Picture Placeholder */}
      <View className="w-12 h-12 bg-slate-200 rounded-full items-center justify-center mr-4">
        <Ionicons name="person-outline" size={24} color="#64748b" />
      </View>

      {/* Player Info */}
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base mb-1">
          {player.name}
        </Text>
        <Text className="text-gray-500 text-sm">
          {player.position}
        </Text>
      </View>

      {/* Status or Additional Info */}
      <View className="items-end">
        <View className="bg-green-100 px-2 py-1 rounded-full">
          <Text className="text-green-700 text-xs font-medium">
            Active
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-4">
      <View className="items-center">
        <View className="w-20 h-20 bg-gray-100 rounded-full justify-center items-center mb-4">
          <Ionicons name="people-outline" size={32} color="#9ca3af" />
        </View>
        
        <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
          No Players Added
        </Text>
        <Text className="text-gray-600 text-center leading-6 max-w-sm mb-4">
          This team doesn't have any players yet. Add registered players to start building your squad.
        </Text>
        
        {/* Add instruction for plus button */}
        <View className="flex-row items-center bg-slate-50 px-4 py-3 rounded-lg">
          <Ionicons name="add-circle-outline" size={20} color="#64748b" />
          <Text className="text-slate-600 text-sm ml-2">
            Tap the + button to add players
          </Text>
        </View>
      </View>
    </View>
  );

  // Handle case where team is not found
  if (!team) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-4">
          <View className="items-center">
            <View className="w-20 h-20 bg-red-100 rounded-full justify-center items-center mb-4">
              <Ionicons name="alert-circle-outline" size={32} color="#ef4444" />
            </View>
            
            <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Team Not Found
            </Text>
            <Text className="text-gray-600 text-center leading-6 max-w-sm mb-6">
              The team you're looking for doesn't exist or has been deleted.
            </Text>
            
            <TouchableOpacity
              onPress={handleGoBack}
              className="bg-slate-900 rounded-xl py-3 px-6"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-200 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleGoBack}
            className="mr-4 w-8 h-8 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              Team Members
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {team?.teamName || 'Unknown Team'}
            </Text>
          </View>

          {/* Member count */}
          <View className="bg-slate-100 px-3 py-1 rounded-full">
            <Text className="text-slate-700 text-sm font-medium">
              {teamPlayers.length}/{team?.maxPlayers || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Status Bar */}
      <View className="h-1 bg-slate-900" />

      {/* Content */}
      {teamPlayers.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {/* Team Summary */}
          <View className="bg-sky-50 px-4 py-3 border-b border-sky-100">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sky-900 font-medium text-sm">
                  Squad Overview
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={14} color="#0369a1" />
                <Text className="text-sky-700 text-sm ml-1">
                  {team?.city}
                </Text>
              </View>
            </View>
          </View>

          {/* Players List */}
          <View className="flex-1">
            {teamPlayers.map((player, index) => renderPlayerItem(player, index))}
          </View>

          {/* Add padding at bottom for better scrolling */}
          <View className="h-4" />
        </ScrollView>
      )}

      {/* Floating Add Button */}
      {team && teamPlayers.length < team.maxPlayers && (
        <TouchableOpacity
          onPress={() => {
            // Navigate to add members screen with team ID
            router.push(`/(football)/TeamsNestedFiles/addTeamMembers?teamId=${team.id}`);
          }}
          className="absolute bottom-6 right-6 w-14 h-14 bg-slate-900 rounded-full justify-center items-center shadow-lg"
          activeOpacity={0.8}
          style={{
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}