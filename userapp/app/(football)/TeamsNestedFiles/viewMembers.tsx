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


export default function ViewMembersScreen() {
  const { teamId } = useLocalSearchParams();
  const { getTeamById, getTeamPlayers } = useFootballStore();
  
  // Get team by ID from route parameters
  const team = teamId ? getTeamById(teamId as string) : null;
  const teamPlayers = team ? getTeamPlayers(team.id) : [];

  const handleGoBack = () => {
    router.back();
  };

  // Get position color for better visual organization
  const getPositionColor = (position: string) => {
    const positionColors = {
      'Goalkeeper': '#ef4444', // red
      'Right Back': '#3b82f6', // blue
      'Left Back': '#3b82f6',
      'Centre Back': '#3b82f6',
      'Defensive Midfielder': '#10b981', // green
      'Central Midfielder': '#10b981',
      'Attacking Midfielder': '#f59e0b', // yellow
      'Right Winger': '#8b5cf6', // purple
      'Left Winger': '#8b5cf6',
      'Striker': '#f97316', // orange
      'Centre Forward': '#f97316'
    };
    return positionColors[position as keyof typeof positionColors] || '#6b7280';
  };

  const renderPlayerCard = (player: any, index: number) => (
    <View
      key={player.id}
      className="bg-white rounded-xl mx-4 mb-3 shadow-sm border border-gray-100"
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }}
    >
      <View className="flex-row items-center p-4">
        {/* Position Color Bar */}
        <View 
          className="w-1 h-12 rounded-full mr-3"
          style={{ backgroundColor: getPositionColor(player.position) }}
        />
        
        {/* Profile Picture with Position Initial */}
        <View 
          className="w-12 h-12 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: getPositionColor(player.position) + '15' }}
        >
          <Text 
            className="font-bold text-sm"
            style={{ color: getPositionColor(player.position) }}
          >
            {player.position.charAt(0)}
          </Text>
        </View>

        {/* Player Info */}
        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-base mb-1">
            {player.name}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-gray-600 text-sm">
              {player.position}
            </Text>
            {player.experience && (
              <>
                <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
                <Text className="text-gray-500 text-xs">
                  {player.experience}
                </Text>
              </>
            )}
          </View>
          {player.contact && (
            <Text className="text-gray-400 text-xs mt-1">
              {player.contact}
            </Text>
          )}
        </View>

        {/* Jersey Number & Status */}
        <View className="items-end">
          <View className="bg-slate-900 w-8 h-8 rounded-lg items-center justify-center mb-2">
            <Text className="text-white text-xs font-bold">
              {index + 1}
            </Text>
          </View>
          <View className="bg-green-100 px-2 py-1 rounded-full">
            <Text className="text-green-700 text-xs font-medium">
              Active
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <View className="items-center">
        <View className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl justify-center items-center mb-6">
          <Ionicons name="people-outline" size={40} color="#64748b" />
        </View>
        
        <Text className="text-xl font-bold text-gray-900 mb-3 text-center">
          Build Your Squad
        </Text>
        <Text className="text-gray-600 text-center leading-6 max-w-sm mb-6">
          Your team is ready for players! Add registered football players to start building your winning squad.
        </Text>
        
        <View className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
          <View className="flex-row items-center">
            <Ionicons name="add-circle" size={18} color="#0ea5e9" />
            <Text className="text-slate-700 text-sm ml-2 font-medium">
              Tap the + button to add players
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Handle case where team is not found
  if (!team) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <View className="items-center">
            <View className="w-24 h-24 bg-red-100 rounded-2xl justify-center items-center mb-6">
              <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
            </View>
            
            <Text className="text-xl font-bold text-gray-900 mb-3 text-center">
              Team Not Found
            </Text>
            <Text className="text-gray-600 text-center leading-6 max-w-sm mb-8">
              The team you're looking for doesn't exist or has been deleted.
            </Text>
            
            <TouchableOpacity
              onPress={handleGoBack}
              className="bg-slate-900 rounded-xl py-4 px-8"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleGoBack}
            className="mr-3 w-10 h-10 bg-slate-100 rounded-xl items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              Squad
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {team?.teamName}
            </Text>
          </View>

          {/* Member count with progress indicator */}
          <View className="items-end">
            <View className="bg-slate-900 px-3 py-2 rounded-lg">
              <Text className="text-white text-sm font-bold">
                {teamPlayers.length}/{team?.maxPlayers || 0}
              </Text>
            </View>
            <View className="w-12 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <View 
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${(teamPlayers.length / (team?.maxPlayers || 1)) * 100}%`
                }}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      {teamPlayers.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView 
          className="flex-1 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Quick Stats */}
          <View className="flex-row mx-4 mb-4 space-x-3">
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="#0ea5e9" />
                <Text className="text-sky-700 font-medium text-sm ml-2">
                  {team?.city}
                </Text>
              </View>
            </View>
            
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="trophy" size={16} color="#f59e0b" />
                <Text className="text-amber-600 font-medium text-sm ml-2">
                  {team?.matchesWon || 0}W {team?.matchesLost || 0}L
                </Text>
              </View>
            </View>
          </View>

          {/* Players List */}
          <View className="flex-1">
            {teamPlayers.map((player, index) => renderPlayerCard(player, index))}
          </View>
        </ScrollView>
      )}

      {/* Floating Add Button */}
      {team && teamPlayers.length < team.maxPlayers && (
        <TouchableOpacity
          onPress={() => {
            router.push(`/(football)/TeamsNestedFiles/addTeamMembers?teamId=${team.id}`);
          }}
          className="absolute bottom-6 right-6 w-16 h-16 mb-6 bg-slate-900 rounded-full justify-center items-center shadow-lg"
          activeOpacity={0.9}
          style={{
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}