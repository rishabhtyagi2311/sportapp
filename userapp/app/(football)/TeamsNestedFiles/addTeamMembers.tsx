// app/(football)/teams/addMembers.tsx
import React, { useState, useEffect } from 'react';
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
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Contacts from 'expo-contacts';
import { useFootballStore } from '@/store/footballTeamStore';
import { FootballPlayer } from '@/types/addingMemberTypes';

// Extended TeamMember interface to handle both registered and invited members
interface TeamMember {
  playerId?: string; // For registered football players
  name: string;
  contact?: string; // For contact-based invites
  isRegistered: boolean;
  position?: string;
  invitedAt?: string;
  joinedAt?: string;
}

export default function AddMembersScreen() {
  const { teamId } = useLocalSearchParams();
  const { 
    getTeamById, 
    getAllPlayers, 
    getAvailablePlayersForTeam, 
    addPlayerToTeam,
    isLoading: storeLoading 
  } = useFootballStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
  const [searchResults, setSearchResults] = useState<FootballPlayer[]>([]);
  const [pendingContact, setPendingContact] = useState<{name: string; contact: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get team and available players
  const team = teamId ? getTeamById(teamId as string) : null;
  const allPlayers = getAllPlayers();
  const availableRegisteredPlayers = teamId ? getAvailablePlayersForTeam(teamId as string) : [];

  // Handle search with proper filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      const searchTerm = searchQuery.toLowerCase().trim();
      const normalizedQuery = searchQuery.replace(/\D/g, '');

      const results = allPlayers.filter(player => {
        const nameMatch = player.name.toLowerCase().includes(searchTerm);
        const positionMatch = player.position.toLowerCase().includes(searchTerm);
        // Search by contact number if player has one
        const contactMatch = player.contact ? 
          player.contact.replace(/\D/g, '').includes(normalizedQuery) : false;
        
        return nameMatch || positionMatch || contactMatch;
      });

      setSearchResults(results);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Add member to team (can be registered player or invited contact)
  const addMember = (member: TeamMember) => {
    const identifier = member.playerId || member.contact || member.name;
    const exists = selectedMembers.find(m => 
      (m.playerId && m.playerId === member.playerId) ||
      (m.contact && m.contact === member.contact) ||
      m.name === member.name
    );
    
    if (!exists) {
      setSelectedMembers(prev => [...prev, member]);
      setSearchQuery('');
      setSearchResults([]);
      console.log('Member added:', member);
    } else {
      Alert.alert('Already Added', 'This member is already in your team.');
    }
  };

  // Remove member from team
  const removeMember = (identifier: string) => {
    setSelectedMembers(prev => prev.filter(m => 
      m.playerId !== identifier && 
      m.contact !== identifier && 
      m.name !== identifier
    ));
  };

  // Handle registered player selection
  const selectRegisteredPlayer = (player: FootballPlayer) => {
    const teamMember: TeamMember = {
      playerId: player.id,
      name: player.name,
      isRegistered: true,
      position: player.position,
      joinedAt: new Date().toISOString(),
    };
    addMember(teamMember);
  };

  // Handle phone contacts access
  const openPhoneContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your contacts to add team members.');
        return;
      }

      const contact = await Contacts.presentContactPickerAsync();
      
      if (contact) {
        handleContactSelection(contact);
      }

    } catch (error) {
      console.error('Contact picker error:', error);
      Alert.alert('Error', 'Failed to open contacts.');
    }
  };

  // Handle the selected contact from native picker
  const handleContactSelection = (contact: Contacts.Contact) => {
    // Extract name properly from contact
    let contactName = 'Unknown Contact';
    
    if (contact.name) {
      contactName = contact.name;
    } else if (contact.firstName) {
      contactName = contact.firstName;
      if (contact.lastName) {
        contactName += ` ${contact.lastName}`;
      }
    } else if (contact.lastName) {
      contactName = contact.lastName;
    }

    const phoneNumber = contact.phoneNumbers?.[0]?.number;

    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'This contact does not have a phone number.');
      return;
    }

    const normalizedNumber = phoneNumber.replace(/\D/g, '');
    
    // Check if user is already registered (by name or contact number if available)
    const registeredPlayer = allPlayers.find(player => 
      player.name.toLowerCase().trim() === contactName.toLowerCase().trim() ||
      (player.contact && player.contact.replace(/\D/g, '') === normalizedNumber)
    );
    
    if (registeredPlayer) {
      // If player doesn't have contact number, add it to their profile
      if (!registeredPlayer.contact) {
        const { updatePlayer } = useFootballStore.getState();
        updatePlayer(registeredPlayer.id, { contact: phoneNumber });
      }
      
      // Show registered player for confirmation
      setPendingContact(null);
      setSearchResults([registeredPlayer]);
      setSearchQuery(contactName);
      Alert.alert(
        'Registered Player Found', 
        `${contactName} is already registered! You can add them directly to the team.`
      );
    } else {
      // Show unregistered contact for invite/cancel options
      setPendingContact({
        name: contactName,
        contact: normalizedNumber
      });
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  // Handle pending contact actions
  const handleInviteContact = async () => {
    if (!pendingContact) return;

    try {
      const message = `Hi ${pendingContact.name}! You've been invited to join our football team "${team?.teamName}". Download our app to register as a player and join: https://yourapp.com/download`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `whatsapp://send?phone=91${pendingContact.contact}&text=${encodedMessage}`;
      
      const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpenWhatsApp) {
        await Linking.openURL(whatsappUrl);
      } else {
        const webWhatsappUrl = `https://wa.me/91${pendingContact.contact}?text=${encodedMessage}`;
        await Linking.openURL(webWhatsappUrl);
      }
      
      // Add to team as invited member
      const teamMember: TeamMember = {
        name: pendingContact.name,
        contact: pendingContact.contact,
        isRegistered: false,
        invitedAt: new Date().toISOString(),
      };
      addMember(teamMember);
      setPendingContact(null);
      
    } catch (error) {
      // Still add the member even if WhatsApp fails
      const teamMember: TeamMember = {
        name: pendingContact.name,
        contact: pendingContact.contact,
        isRegistered: false,
        invitedAt: new Date().toISOString(),
      };
      addMember(teamMember);
      setPendingContact(null);
      Alert.alert('Member Added', 'Member added to team. WhatsApp could not be opened, please invite manually.');
    }
  };

  const handleCancelContact = () => {
    setPendingContact(null);
  };

  // Save team with members
  const saveTeamMembers = () => {
    if (selectedMembers.length === 0) {
      Alert.alert('No Members', 'Please add at least one team member.');
      return;
    }

    if (!team || !teamId) {
      Alert.alert('Error', 'Team not found.');
      return;
    }

    // Check team capacity
    const registeredMembers = selectedMembers.filter(m => m.isRegistered);
    const currentMemberCount = team.memberPlayerIds.length;
    const newTotalMembers = currentMemberCount + registeredMembers.length;
    
    if (newTotalMembers > team.maxPlayers) {
      Alert.alert(
        'Team Capacity Exceeded', 
        `Adding ${registeredMembers.length} registered players would exceed the team limit of ${team.maxPlayers}. Current members: ${currentMemberCount}`
      );
      return;
    }

    // Add registered players to the team using store methods
    registeredMembers.forEach(member => {
      if (member.playerId) {
        addPlayerToTeam(teamId as string, member.playerId);
      }
    });

    // Note: Invited (non-registered) members are tracked separately for now
    // You might want to extend your store to handle invited members as well
    
    const registeredCount = registeredMembers.length;
    const invitedCount = selectedMembers.length - registeredCount;
    
    let message = '';
    if (registeredCount > 0 && invitedCount > 0) {
      message = `${registeredCount} registered player${registeredCount > 1 ? 's' : ''} added to team and ${invitedCount} invitation${invitedCount > 1 ? 's' : ''} sent!`;
    } else if (registeredCount > 0) {
      message = `${registeredCount} registered player${registeredCount > 1 ? 's' : ''} added to ${team.teamName}!`;
    } else {
      message = `${invitedCount} invitation${invitedCount > 1 ? 's' : ''} sent!`;
    }

    console.log('Team members to save:', selectedMembers);
    Alert.alert('Success', message, [
      { text: 'OK', onPress: () => router.back() }
    ]);
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

  const renderSearchResult = ({ item }: { item: FootballPlayer }) => (
    <TouchableOpacity
      onPress={() => selectRegisteredPlayer(item)}
      className="flex-row items-center p-4 border-b border-gray-200"
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 bg-slate-200 rounded-full items-center justify-center mr-3">
        {item.profileImage ? (
          <Ionicons name="person" size={24} color="#64748b" />
        ) : (
          <Ionicons name="person-outline" size={24} color="#64748b" />
        )}
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base">{item.name}</Text>
        <Text className="text-gray-600 text-sm">{item.position}</Text>
        {item.contact && (
          <Text className="text-gray-500 text-xs mt-1">{item.contact}</Text>
        )}
        {item.experience && (
          <Text className="text-gray-500 text-xs">{item.experience} level</Text>
        )}
      </View>
      <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
        <Ionicons name="checkmark" size={16} color="white" />
      </View>
    </TouchableOpacity>
  );

  const renderSelectedMember = (member: TeamMember) => (
    <View key={member.playerId || member.contact || member.name} className="flex-row items-center p-3 bg-green-50 rounded-lg mb-2 mx-4">
      <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
        <Text className="text-green-600 font-bold">
          {member.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold">{member.name}</Text>
        <Text className="text-gray-600 text-xs">
          {member.position || member.contact || 'Invited member'}
        </Text>
      </View>
      <View className="flex-row items-center">
        {member.isRegistered ? (
          <View className="bg-green-500 px-2 py-1 rounded mr-2">
            <Text className="text-white text-xs font-semibold">Registered</Text>
          </View>
        ) : (
          <View className="bg-orange-500 px-2 py-1 rounded mr-2">
            <Text className="text-white text-xs font-semibold">Invited</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => removeMember(member.playerId || member.contact || member.name)}
          className="w-6 h-6 bg-red-500 rounded-full items-center justify-center"
        >
          <Ionicons name="close" size={14} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render pending contact (unregistered user from contacts)
  const renderPendingContact = () => {
    if (!pendingContact) return null;

    return (
      <View className="mx-4 mb-4">
        <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-yellow-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="person-add-outline" size={24} color="#d97706" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">{pendingContact.name}</Text>
              <Text className="text-gray-600 text-sm">{pendingContact.contact}</Text>
            </View>
            <View className="bg-yellow-100 px-2 py-1 rounded-full">
              <Text className="text-yellow-700 text-xs font-medium">Not Registered</Text>
            </View>
          </View>
          
          <View className="bg-yellow-100 rounded-lg p-3 mb-4">
            <View className="flex-row items-center justify-center mb-2">
              <Ionicons name="information-circle" size={16} color="#d97706" />
              <Text className="text-yellow-800 font-semibold ml-2">
                Player not found in registered list
              </Text>
            </View>
            <Text className="text-yellow-700 text-sm text-center">
              Send an invitation to join your football team and register as a player
            </Text>
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleInviteContact}
              className="flex-1 bg-green-500 rounded-xl py-3"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="paper-plane" size={16} color="white" />
                <Text className="text-white font-semibold ml-2">Send Invite</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCancelContact}
              className="flex-1 bg-gray-400 rounded-xl py-3"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="close" size={16} color="white" />
                <Text className="text-white font-semibold ml-2">Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
            <Text className="text-sm text-slate-700 mt-1">{team.teamName}</Text>
          </View>
          {/* Team capacity info */}
          <View className="bg-slate-200 px-3 py-1 rounded-full">
            <Text className="text-slate-700 text-sm font-medium">
              {team.memberPlayerIds.length}/{team.maxPlayers}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1">
          {/* Search Section */}
          <View className="p-4">
            <Text className="text-gray-700 font-semibold mb-3">
              Search registered players or add from contacts
            </Text>
            
            <View className="flex-row mb-4">
              <View className="flex-1 bg-gray-100 rounded-xl border border-gray-200 flex-row items-center px-4 mr-3">
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
              
              <TouchableOpacity
                onPress={openPhoneContacts}
                className="bg-blue-600 rounded-xl px-4 items-center justify-center"
                activeOpacity={0.8}
              >
                <Ionicons name="person-add" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {(isLoading || storeLoading) && (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#3b82f6" />
              </View>
            )}
          </View>

          {/* Pending Contact */}
          {renderPendingContact()}

          {/* Search Results */}
          {searchResults.length > 0 && !pendingContact && (
            <View className="flex-1">
              <Text className="text-gray-700 font-semibold px-4 mb-2">
                Registered Players ({searchResults.length})
              </Text>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {/* No results message */}
          {searchQuery.length > 0 && searchResults.length === 0 && !isLoading && !pendingContact && (
            <View className="flex-1 items-center justify-center p-8">
              <Ionicons name="search" size={48} color="#9ca3af" />
              <Text className="text-gray-500 text-lg font-semibold mt-4">No registered players found</Text>
              <Text className="text-gray-400 text-center mt-2">
                Try searching with a different name or position, or use contacts to invite new players
              </Text>
            </View>
          )}

          {/* Show all registered players when not searching */}
          {searchQuery.length === 0 && !pendingContact && (
            <View className="flex-1">
              <Text className="text-gray-700 font-semibold px-4 mb-2">
                All Registered Players ({allPlayers.length})
              </Text>
              <FlatList
                data={allPlayers}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: selectedMembers.length > 0 ? 200 : 20 }}
              />
            </View>
          )}
        </View>

        {/* Selected Members - Fixed section */}
        {selectedMembers.length > 0 && (
          <View className="bg-gray-50 border-t border-gray-200" style={{ height: 180 }}>
            <Text className="text-gray-700 font-semibold px-4 py-3 border-b border-gray-200">
              Selected Members ({selectedMembers.length})
            </Text>
            <ScrollView 
              style={{ flex: 1 }} 
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              {selectedMembers.map(member => renderSelectedMember(member))}
            </ScrollView>
          </View>
        )}

        {/* Save Button - Always at bottom */}
        {selectedMembers.length > 0 && !pendingContact && (
          <View className="p-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={saveTeamMembers}
              className="bg-slate-900 rounded-xl py-4"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-center text-lg">
                Save Team Members ({selectedMembers.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}