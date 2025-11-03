// app/(football)/teams/viewMembers.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useFootballStore } from '@/store/footballTeamStore';
import * as ImagePicker from 'expo-image-picker';

export default function ViewMembersScreen() {
  const { teamId } = useLocalSearchParams();
  const { 
    getTeamById, 
    getTeamPlayers, 
    setTeamCaptain, 
    getTeamCaptain, 
    setTeamLogo,
    getTeamLogoUri
  } = useFootballStore();
  
  // Get team by ID from route parameters
  const team = teamId ? getTeamById(teamId as string) : null;
  const teamPlayers = team ? getTeamPlayers(team.id) : [];
  const captain = team ? getTeamCaptain(team.id) : undefined;
  const teamLogoUri = team ? getTeamLogoUri(team.id) : undefined;

  // State for captain selection modal
  const [captainModalVisible, setCaptainModalVisible] = useState(false);
  const [selectedPlayerForCaptain, setSelectedPlayerForCaptain] = useState<string | null>(null);

  const handleGoBack = () => {
    router.back();
  };

  // Handle team logo selection
  const handleSelectTeamLogo = async () => {
    if (!team) return;
    
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your photos to set a team logo');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        // Set team logo in store
        setTeamLogo(team.id, result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  // Open captain management modal
  const handleOpenCaptainModal = () => {
    if (!team) return;
    setCaptainModalVisible(true);
  };

  // Handle setting a player as team captain
  const handleSetCaptain = (playerId: string) => {
    if (!team) return;
    
    // Set as new captain
    setTeamCaptain(team.id, playerId);
    setCaptainModalVisible(false);
    setSelectedPlayerForCaptain(null);

    // Show confirmation
    Alert.alert('Success', 'Team captain has been updated');
  };

  // Handle removing captain
  const handleRemoveCaptain = () => {
    if (!team) return;
    
    Alert.alert(
      'Remove Captain',
      'Are you sure you want to remove the current captain?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            setTeamCaptain(team.id, ''); // Empty string to remove captain
            setCaptainModalVisible(false);
            setSelectedPlayerForCaptain(null);
          },
          style: 'destructive',
        },
      ]
    );
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

  const renderPlayerCard = (player: any, index: number) => {
    const isCaptain = captain?.id === player.id;
    
    return (
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
            <View className="flex-row items-center">
              <Text className="text-gray-900 font-bold text-base mb-1">
                {player.name}
              </Text>
              {isCaptain && (
                <View className="ml-2 bg-amber-100 rounded-full px-2 py-0.5">
                  <Text className="text-amber-700 text-xs font-bold">CAPTAIN</Text>
                </View>
              )}
            </View>
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
            <View className={`w-8 h-8 rounded-lg items-center justify-center mb-2 ${isCaptain ? 'bg-amber-500' : 'bg-slate-900'}`}>
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
  };

  const renderCaptainSelectionModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={captainModalVisible}
        onRequestClose={() => setCaptainModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Manage Team Captain</Text>
              <TouchableOpacity 
                onPress={() => setCaptainModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-outline" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            {captain && (
              <View className="bg-amber-50 rounded-xl p-4 mb-4">
                <Text className="text-amber-700 font-semibold mb-1">Current Captain</Text>
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-amber-200 items-center justify-center mr-3">
                    <Text className="font-bold text-amber-700">{captain.name.charAt(0)}</Text>
                  </View>
                  <Text className="text-gray-900 font-medium flex-1">{captain.name}</Text>
                  <TouchableOpacity 
                    onPress={handleRemoveCaptain}
                    className="bg-white border border-red-300 rounded-lg px-3 py-1"
                  >
                    <Text className="text-red-600 font-medium">Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            <Text className="text-gray-700 font-semibold mb-3">
              {captain ? 'Select New Captain' : 'Select Captain'}
            </Text>
            
            <ScrollView className="max-h-96 mb-4">
              {teamPlayers.map((player, index) => (
                <TouchableOpacity
                  key={player.id}
                  onPress={() => setSelectedPlayerForCaptain(player.id)}
                  className={`flex-row items-center p-3 rounded-xl mb-2 border ${
                    selectedPlayerForCaptain === player.id
                      ? 'bg-sky-50 border-sky-300'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: getPositionColor(player.position) + '20' }}
                  >
                    <Text 
                      className="font-bold text-sm"
                      style={{ color: getPositionColor(player.position) }}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">{player.name}</Text>
                    <Text className="text-gray-500 text-sm">{player.position}</Text>
                  </View>
                  {selectedPlayerForCaptain === player.id && (
                    <View className="bg-sky-100 rounded-full h-6 w-6 items-center justify-center">
                      <Ionicons name="checkmark" size={16} color="#0284c7" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setCaptainModalVisible(false)}
                className="flex-1 border border-gray-300 rounded-xl py-3 mr-2"
              >
                <Text className="text-gray-700 font-medium text-center">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => selectedPlayerForCaptain && handleSetCaptain(selectedPlayerForCaptain)}
                className={`flex-1 rounded-xl py-3 ml-2 ${
                  selectedPlayerForCaptain ? 'bg-blue-500' : 'bg-blue-300'
                }`}
                disabled={!selectedPlayerForCaptain}
              >
                <Text className="text-white font-bold text-center">Confirm Captain</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

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
      <ScrollView 
        className="flex-1 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Team Logo Section */}
        <View className="items-center mb-6">
          <TouchableOpacity 
            onPress={handleSelectTeamLogo}
            activeOpacity={0.8}
            className="mb-3"
          >
            {teamLogoUri ? (
              <Image 
                source={{ uri: teamLogoUri }} 
                className="w-24 h-24 rounded-full"
                style={{
                  borderWidth: 3,
                  borderColor: '#f8fafc',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              />
            ) : (
              <View className="w-24 h-24 bg-slate-200 rounded-full items-center justify-center">
                <Ionicons name="image-outline" size={32} color="#64748b" />
                <Text className="text-slate-600 text-xs mt-1 font-medium">Add Logo</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <Text className="text-lg font-bold text-gray-800">{team.teamName}</Text>
          
          {/* Captain Section - New UI */}
          <TouchableOpacity 
            onPress={handleOpenCaptainModal}
            className="flex-row items-center mt-2 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200"
            activeOpacity={0.7}
          >
            <Ionicons name="shield-outline" size={16} color="#b45309" />
            {captain ? (
              <Text className="text-amber-700 ml-2 font-medium">
                Captain: {captain.name}
              </Text>
            ) : (
              <Text className="text-amber-700 ml-2 font-medium">
                Assign Captain
              </Text>
            )}
            <Ionicons name="chevron-forward" size={14} color="#b45309" className="ml-1" />
          </TouchableOpacity>
        </View>
        
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
        {teamPlayers.length === 0 ? (
          renderEmptyState()
        ) : (
          <View className="mt-2">
            <View className="mx-4 mb-3 flex-row justify-between items-center">
              <View>
                <Text className="text-gray-900 font-bold text-lg">Players</Text>
                <Text className="text-gray-500 text-sm">
                  Roster of your team
                </Text>
              </View>
              
              <TouchableOpacity 
                onPress={handleOpenCaptainModal}
                className="bg-slate-100 py-1 px-3 rounded-lg border border-slate-200"
              >
                <Text className="text-slate-700 font-medium">Manage Captain</Text>
              </TouchableOpacity>
            </View>
            
            {teamPlayers.map((player, index) => renderPlayerCard(player, index))}
          </View>
        )}
      </ScrollView>
      
      {/* Floating Add Button */}
      {team && teamPlayers.length < team.maxPlayers && (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: '/(football)/TeamsNestedFiles/addTeamMembers',
              params: { teamId: team.id }
            });
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
      
      {/* Captain Selection Modal */}
      {renderCaptainSelectionModal()}
      
    </SafeAreaView>
  );
}