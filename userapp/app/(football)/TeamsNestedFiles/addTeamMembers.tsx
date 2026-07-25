// app/(football)/teams/addMembers.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useFootballStore } from '@/store/footballTeamStore';
import { FootballProfile } from '@/types/football';

export default function AddMembersScreen() {
  const { teamId: teamIdParam } = useLocalSearchParams();
  const teamId = parseInt(teamIdParam as string, 10);
  const { getTeamById, players, fetchAllPlayers, addTeamMember, isLoading: storeLoading } = useFootballStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const team = getTeamById(teamId);

  useEffect(() => {
    fetchAllPlayers();
  }, []);

  const memberIds = useMemo(() => new Set(team?.members.map((m) => m.footballProfile.id) ?? []), [team]);

  const availablePlayers = useMemo(
    () => players.filter((p) => !memberIds.has(p.id) && !selectedPlayerIds.includes(p.id)),
    [players, memberIds, selectedPlayerIds]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return availablePlayers;
    const term = searchQuery.toLowerCase().trim();
    return availablePlayers.filter(
      (p) => p.nickname.toLowerCase().includes(term) || p.role.toLowerCase().includes(term)
    );
  }, [availablePlayers, searchQuery]);

  const selectedPlayers = players.filter((p) => selectedPlayerIds.includes(p.id));

  const selectPlayer = (player: FootballProfile) => {
    setSelectedPlayerIds((prev) => [...prev, player.id]);
    setSearchQuery('');
  };

  const removePlayer = (playerId: number) => {
    setSelectedPlayerIds((prev) => prev.filter((id) => id !== playerId));
  };

  const saveTeamMembers = async () => {
    if (selectedPlayerIds.length === 0) {
      Alert.alert('No Members', 'Please add at least one team member.');
      return;
    }

    if (!team) {
      Alert.alert('Error', 'Team not found.');
      return;
    }

    const currentMemberCount = team.members.length;
    if (currentMemberCount + selectedPlayerIds.length > team.maxPlayers) {
      Alert.alert(
        'Team Capacity Exceeded',
        `Adding ${selectedPlayerIds.length} players would exceed the team limit of ${team.maxPlayers}. Current members: ${currentMemberCount}`
      );
      return;
    }

    setIsSaving(true);
    try {
      for (const playerId of selectedPlayerIds) {
        await addTeamMember(team.id, playerId);
      }
      Alert.alert('Success', `${selectedPlayerIds.length} player${selectedPlayerIds.length > 1 ? 's' : ''} added to ${team.name}!`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add members.');
    } finally {
      setIsSaving(false);
    }
  };

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
              The team you're trying to add members to doesn't exist.
            </Text>

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-slate-900 rounded-xl py-3 px-6"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderSearchResult = ({ item }: { item: FootballProfile }) => (
    <TouchableOpacity
      onPress={() => selectPlayer(item)}
      className="flex-row items-center p-4 border-b border-gray-200"
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 bg-slate-200 rounded-full items-center justify-center mr-3">
        <Ionicons name="person-outline" size={24} color="#64748b" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base">{item.nickname}</Text>
        <Text className="text-gray-600 text-sm">{item.role}</Text>
        {item.experience && <Text className="text-gray-500 text-xs">{item.experience} level</Text>}
      </View>
      <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
        <Ionicons name="checkmark" size={16} color="white" />
      </View>
    </TouchableOpacity>
  );

  const renderSelectedMember = (member: FootballProfile) => (
    <View key={member.id} className="flex-row items-center p-3 bg-green-50 rounded-lg mb-2 mx-4">
      <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
        <Text className="text-green-600 font-bold">{member.nickname.charAt(0).toUpperCase()}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold">{member.nickname}</Text>
        <Text className="text-gray-600 text-xs">{member.role}</Text>
      </View>
      <TouchableOpacity
        onPress={() => removePlayer(member.id)}
        className="w-6 h-6 bg-red-500 rounded-full items-center justify-center"
      >
        <Ionicons name="close" size={14} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-sky-100 px-4 py-4 flex-row items-center border-b border-gray-200">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-slate-900">Add Team Members</Text>
            <Text className="text-sm text-slate-700 mt-1">{team.name}</Text>
          </View>
          <View className="bg-slate-200 px-3 py-1 rounded-full">
            <Text className="text-slate-700 text-sm font-medium">
              {team.members.length}/{team.maxPlayers}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1">
          {/* Search Section */}
          <View className="p-4">
            <Text className="text-gray-700 font-semibold mb-3">
              Search registered players
            </Text>

            <View className="bg-gray-100 rounded-xl border border-gray-200 flex-row items-center px-4 mb-4">
              <Ionicons name="search" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 py-3 px-3 text-base text-gray-900"
                placeholder="Enter name or position"
                placeholderTextColor="#6b7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={Keyboard.dismiss}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>

            {storeLoading && (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#3b82f6" />
              </View>
            )}
          </View>

          {/* Results */}
          <View className="flex-1">
            <Text className="text-gray-700 font-semibold px-4 mb-2">
              {searchQuery ? `Results (${searchResults.length})` : `Available Players (${searchResults.length})`}
            </Text>
            {searchResults.length === 0 ? (
              <View className="flex-1 items-center justify-center p-8">
                <Ionicons name="search" size={48} color="#9ca3af" />
                <Text className="text-gray-500 text-lg font-semibold mt-4">No players found</Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id.toString()}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: selectedPlayers.length > 0 ? 200 : 20 }}
              />
            )}
          </View>
        </View>

        {/* Selected Members */}
        {selectedPlayers.length > 0 && (
          <View className="bg-gray-50 border-t border-gray-200" style={{ height: 180 }}>
            <Text className="text-gray-700 font-semibold px-4 py-3 border-b border-gray-200">
              Selected Members ({selectedPlayers.length})
            </Text>
            <FlatList
              data={selectedPlayers}
              renderItem={({ item }) => renderSelectedMember(item)}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          </View>
        )}

        {/* Save Button */}
        {selectedPlayers.length > 0 && (
          <View className="p-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={saveTeamMembers}
              disabled={isSaving}
              className="bg-slate-900 rounded-xl py-4"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-center text-lg">
                {isSaving ? 'Saving…' : `Save Team Members (${selectedPlayers.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
