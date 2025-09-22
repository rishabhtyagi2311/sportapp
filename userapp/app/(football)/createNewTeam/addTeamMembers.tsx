// app/add-members.tsx
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
import { router } from 'expo-router';
import * as Contacts from 'expo-contacts';
import { useUserStore } from '@/store/addingFootballMemberStore';
import { User, TeamMember } from '@/types/addingMemberTypes';

export default function AddMembersScreen() {
  const { users, isLoading, fetchUsers } = useUserStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [pendingContact, setPendingContact] = useState<{name: string; contactNumber: string} | null>(null);

  // Load users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle search with proper filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      const searchTerm = searchQuery.toLowerCase().trim();
      const normalizedQuery = searchQuery.replace(/\D/g, '');

      const results = users.filter(user => {
        const nameMatch = user.name.toLowerCase().includes(searchTerm);
        const phoneMatch = user.contactNumber.replace(/\D/g, '').includes(normalizedQuery);
        
        return nameMatch || phoneMatch;
      });

      setSearchResults(results);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, users]);

  // Add member to team
  const addMember = (member: TeamMember) => {
    const exists = selectedMembers.find(m => m.contactNumber === member.contactNumber);
    if (!exists) {
      setSelectedMembers(prev => [...prev, member]);
      setSearchQuery('');
      setSearchResults([]);
      console.log('Member added:', member); // Debug log
    } else {
      Alert.alert('Already Added', 'This member is already in your team.');
    }
  };

  // Remove member from team
  const removeMember = (contactNumber: string) => {
    setSelectedMembers(prev => prev.filter(m => m.contactNumber !== contactNumber));
  };

  // Handle registered user selection
  const selectRegisteredUser = (user: User) => {
    const teamMember: TeamMember = {
      userId: user.id,
      name: user.name,
      contactNumber: user.contactNumber,
      isRegistered: true,
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
    
    // Check if user is already registered
    const registeredUser = users.find(user => 
      user.contactNumber.replace(/\D/g, '') === normalizedNumber
    );
    
    if (registeredUser) {
      // Show registered user for confirmation
      setPendingContact(null);
      setSearchResults([registeredUser]);
      setSearchQuery(contactName);
    } else {
      // Show unregistered contact for invite/cancel options
      setPendingContact({
        name: contactName,
        contactNumber: normalizedNumber
      });
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  // Handle pending contact actions
  const handleInviteContact = async () => {
    if (!pendingContact) return;

    try {
      const message = `Hi ${pendingContact.name}! You've been invited to join our football team. Download our app to get started: https://yourapp.com/download`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `whatsapp://send?phone=91${pendingContact.contactNumber}&text=${encodedMessage}`;
      
      const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpenWhatsApp) {
        await Linking.openURL(whatsappUrl);
      } else {
        const webWhatsappUrl = `https://wa.me/91${pendingContact.contactNumber}?text=${encodedMessage}`;
        await Linking.openURL(webWhatsappUrl);
      }
      
      // Add to team as invited member
      const teamMember: TeamMember = {
        name: pendingContact.name,
        contactNumber: pendingContact.contactNumber,
        isRegistered: false,
        invitedAt: new Date().toISOString(),
      };
      addMember(teamMember);
      setPendingContact(null);
      
    } catch (error) {
      // Still add the member even if WhatsApp fails
      const teamMember: TeamMember = {
        name: pendingContact.name,
        contactNumber: pendingContact.contactNumber,
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

    console.log('Team members to save:', selectedMembers);
    Alert.alert('Success', 'Team members added successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const renderSearchResult = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => selectRegisteredUser(item)}
      className="flex-row items-center p-4 border-b border-gray-200"
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
        <Text className="text-blue-600 font-bold text-lg">
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base">{item.name}</Text>
        <Text className="text-gray-600 text-sm">{item.contactNumber}</Text>
      </View>
      <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
        <Ionicons name="checkmark" size={16} color="white" />
      </View>
    </TouchableOpacity>
  );

  const renderSelectedMember = ({ item }: { item: TeamMember }) => (
    <View className="flex-row items-center p-3 bg-green-50 rounded-lg mb-2 mx-4">
      <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
        <Text className="text-green-600 font-bold">
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold">{item.name}</Text>
        <Text className="text-gray-600 text-xs">{item.contactNumber}</Text>
      </View>
      <View className="flex-row items-center">
        {item.isRegistered ? (
          <View className="bg-green-500 px-2 py-1 rounded mr-2">
            <Text className="text-white text-xs font-semibold">Registered</Text>
          </View>
        ) : (
          <View className="bg-orange-500 px-2 py-1 rounded mr-2">
            <Text className="text-white text-xs font-semibold">Invited</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => removeMember(item.contactNumber)}
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
              <Text className="text-yellow-600 font-bold text-lg">
                {pendingContact.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">{pendingContact.name}</Text>
              <Text className="text-gray-600 text-sm">{pendingContact.contactNumber}</Text>
            </View>
          </View>
          
          <View className="bg-yellow-100 rounded-lg p-3 mb-4">
            <Text className="text-yellow-800 font-semibold text-center">
              User not registered in app
            </Text>
            <Text className="text-yellow-700 text-sm text-center mt-1">
              Send an invite to join your team or cancel selection
            </Text>
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleInviteContact}
              className="flex-1 bg-green-500 rounded-lg py-3"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="paper-plane" size={16} color="white" />
                <Text className="text-white font-semibold ml-2">Send Invite</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCancelContact}
              className="flex-1 bg-gray-500 rounded-lg py-3"
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
          <Text className="text-xl font-bold text-slate-900">Add Team Members</Text>
        </View>

        {/* Main Content */}
        <View className="flex-1">
          {/* Search Section */}
          <View className="p-4">
            <Text className="text-gray-700 font-semibold mb-3">Search by name or phone number</Text>
            
            <View className="flex-row mb-4">
              <View className="flex-1 bg-gray-100 rounded-xl border border-gray-200 flex-row items-center px-4 mr-3">
                <Ionicons name="search" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 py-3 px-3 text-base text-gray-900"
                  placeholder="Enter name or phone number"
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

            {isLoading && (
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
              <Text className="text-gray-700 font-semibold px-4 mb-2">Search Results</Text>
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
              <Text className="text-gray-500 text-lg font-semibold mt-4">No results found</Text>
              <Text className="text-gray-400 text-center mt-2">
                Try searching with a different name or phone number
              </Text>
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
              {selectedMembers.map((member) => (
                <View key={member.contactNumber} className="flex-row items-center p-3 bg-green-50 rounded-lg mb-2 mx-4">
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-green-600 font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold">{member.name}</Text>
                    <Text className="text-gray-600 text-xs">{member.contactNumber}</Text>
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
                      onPress={() => removeMember(member.contactNumber)}
                      className="w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Save Button - Always at bottom */}
        {selectedMembers.length > 0 && !pendingContact && (
          <View className="p-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={saveTeamMembers}
              className="bg-blue-600 rounded-xl py-4"
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