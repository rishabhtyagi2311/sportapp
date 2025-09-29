
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '@/types/booking';
import { useBookingStore } from '@/store/venueStore';

interface ParticipantForm {
  name: string;
  contact: string;
  email: string;
}

interface TeamMemberForm {
  id: string;
  name: string;
  contact: string;
}

const EventDetailsScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { getEventById, getVenueById } = useBookingStore();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'registration'>('details');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Individual registration form
  const [participantForm, setParticipantForm] = useState<ParticipantForm>({
    name: '',
    contact: '',
    email: '',
  });
  
  // Team registration form
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMemberForm[]>([]);
  const [captainContact, setCaptainContact] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');

  useEffect(() => {
    const foundEvent = getEventById(eventId);
    if (foundEvent) {
      setEvent(foundEvent);
      
      // Initialize team members array if it's a team event
      if (foundEvent.participationType === 'team' && foundEvent.teamSize) {
        const initialMembers: TeamMemberForm[] = Array.from(
          { length: foundEvent.teamSize },
          (_, index) => ({
            id: `member-${index + 1}`,
            name: '',
            contact: '',
          })
        );
        setTeamMembers(initialMembers);
      }
    }
  }, [eventId]);

  if (!event) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 text-lg">Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const venue = getVenueById(event.venueId);
  const eventDate = new Date(event.dateTime);
  const registrationDeadline = new Date(event.registrationDeadline);
  const spotsLeft = event.maxParticipants - event.currentParticipants;
  const isRegistrationOpen = 
    event.status === 'upcoming' && 
    spotsLeft > 0 && 
    new Date() < registrationDeadline;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'ongoing': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'completed': return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
      case 'cancelled': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'tournament': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case 'league': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      case 'practice': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'friendly': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'training': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const validateIndividualForm = (): boolean => {
    if (!participantForm.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return false;
    }
    if (!participantForm.contact.trim() || participantForm.contact.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit contact number');
      return false;
    }
    if (!participantForm.email.trim() || !participantForm.email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateTeamForm = (): boolean => {
    if (!teamName.trim()) {
      Alert.alert('Validation Error', 'Please enter your team name');
      return false;
    }
    if (!captainContact.trim() || captainContact.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit captain contact number');
      return false;
    }
    if (!captainEmail.trim() || !captainEmail.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid captain email address');
      return false;
    }
    
    for (let i = 0; i < teamMembers.length; i++) {
      const member = teamMembers[i];
      if (!member.name.trim()) {
        Alert.alert('Validation Error', `Please enter name for Team Member ${i + 1}`);
        return false;
      }
      if (!member.contact.trim() || member.contact.length !== 10) {
        Alert.alert('Validation Error', `Please enter valid contact for Team Member ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleRegistration = () => {
    if (event.participationType === 'individual') {
      if (!validateIndividualForm()) return;
      
      Alert.alert(
        'Confirm Registration',
        `Register for ${event.name}?\n\nName: ${participantForm.name}\nContact: ${participantForm.contact}\nFee: ₹${event.fees.amount}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              setIsRegistering(true);
              // Simulate API call
              setTimeout(() => {
                setIsRegistering(false);
                Alert.alert(
                  'Registration Successful!',
                  'You have been registered for the event. Check your email for confirmation.',
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              }, 1500);
            },
          },
        ]
      );
    } else {
      if (!validateTeamForm()) return;
      
      Alert.alert(
        'Confirm Team Registration',
        `Register team "${teamName}" for ${event.name}?\n\nTeam Size: ${teamMembers.length}\nCaptain: ${captainContact}\nFee: ₹${event.fees.amount}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              setIsRegistering(true);
              // Simulate API call
              setTimeout(() => {
                setIsRegistering(false);
                Alert.alert(
                  'Team Registration Successful!',
                  'Your team has been registered for the event. Check your email for confirmation.',
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              }, 1500);
            },
          },
        ]
      );
    }
  };

  const updateTeamMember = (index: number, field: 'name' | 'contact', value: string) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);
  };

  const renderDetailsTab = () => (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Event Header */}
      <View className="bg-white px-6 py-8">
        <View className="flex-row items-center justify-between mb-4">
          <View className={`px-3 py-1.5 rounded-lg border ${getEventTypeColor(event.eventType).bg} ${getEventTypeColor(event.eventType).border}`}>
            <Text className={`text-sm font-semibold capitalize ${getEventTypeColor(event.eventType).text}`}>
              {event.eventType}
            </Text>
          </View>
          
          <View className={`px-3 py-1.5 rounded-lg border ${getStatusColor(event.status).bg} ${getStatusColor(event.status).border}`}>
            <Text className={`text-sm font-semibold capitalize ${getStatusColor(event.status).text}`}>
              {event.status}
            </Text>
          </View>
        </View>

        <Text className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
          {event.name}
        </Text>

        {event.description && (
          <Text className="text-slate-600 text-base leading-relaxed mb-6">
            {event.description}
          </Text>
        )}

        {/* Sport Info */}
        <View className="flex-row items-center mb-4">
          <View className="bg-green-100 px-3 py-2 rounded-lg mr-3">
            <Text className="text-green-800 text-sm font-semibold">
              {event.sport.name}
            </Text>
          </View>
          
          <View className="flex-row items-center bg-slate-100 px-3 py-2 rounded-lg">
            <Ionicons name="people-outline" size={16} color="#475569" />
            <Text className="text-slate-700 text-sm ml-2 font-medium">
              {event.participationType === 'team' 
                ? `Team (${event.teamSize} players)` 
                : 'Individual'
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Event Details Cards */}
      <View className="px-6 py-2">
        {/* Date & Time */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-slate-900 mb-4">Date & Time</Text>
          
          <View className="flex-row items-center mb-3">
            <View className="bg-green-50 p-2 rounded-lg">
              <Ionicons name="calendar" size={20} color="#16a34a" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-slate-500 text-xs mb-1">Event Date</Text>
              <Text className="text-slate-900 text-base font-semibold">
                {eventDate.toLocaleDateString('en-IN', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-3">
            <View className="bg-blue-50 p-2 rounded-lg">
              <Ionicons name="time" size={20} color="#2563eb" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-slate-500 text-xs mb-1">Start Time</Text>
              <Text className="text-slate-900 text-base font-semibold">
                {eventDate.toLocaleTimeString('en-IN', { 
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="bg-purple-50 p-2 rounded-lg">
              <Ionicons name="hourglass-outline" size={20} color="#9333ea" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-slate-500 text-xs mb-1">Duration</Text>
              <Text className="text-slate-900 text-base font-semibold">
                {event.duration} {event.duration === 1 ? 'hour' : 'hours'}
              </Text>
            </View>
          </View>
        </View>

        {/* Venue */}
        {venue && (
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-slate-900 mb-4">Venue</Text>
            
            <View className="flex-row items-start mb-3">
              <View className="bg-orange-50 p-2 rounded-lg">
                <Ionicons name="location" size={20} color="#ea580c" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-slate-900 text-base font-semibold mb-1">
                  {venue.name}
                </Text>
                <Text className="text-slate-600 text-sm leading-relaxed">
                  {venue.address.street}, {venue.address.city}
                </Text>
                <Text className="text-slate-600 text-sm">
                  {venue.address.state} - {venue.address.pincode}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="bg-blue-50 p-2 rounded-lg">
                <Ionicons name="call" size={20} color="#2563eb" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-slate-600 text-sm mb-1">Contact</Text>
                <Text className="text-slate-900 text-base font-semibold">
                  {venue.contactInfo.phone}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Participation Info */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-slate-900 mb-4">Participation</Text>
          
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-600 text-sm">
                {event.currentParticipants}/{event.maxParticipants} {event.participationType === 'team' ? 'teams' : 'participants'} registered
              </Text>
              <Text className="text-slate-900 text-sm font-semibold">
                {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
              </Text>
            </View>
            
            <View className="w-full bg-gray-200 rounded-full h-2.5">
              <View 
                className={`h-2.5 rounded-full ${
                  (event.currentParticipants / event.maxParticipants) * 100 >= 80 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min((event.currentParticipants / event.maxParticipants) * 100, 100)}%` 
                }}
              />
            </View>
          </View>

          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time-outline" size={18} color="#ca8a04" />
              <Text className="text-yellow-800 font-semibold ml-2">Registration Deadline</Text>
            </View>
            <Text className="text-yellow-700 text-sm">
              {registrationDeadline.toLocaleDateString('en-IN', { 
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {/* Fees */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-slate-900 mb-4">Entry Fee</Text>
          
          <View className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-slate-600 text-sm mb-1">
                  {event.fees.type.replace('_', ' ').toUpperCase()}
                </Text>
                <Text className="text-green-700 text-3xl font-bold">
                  ₹{event.fees.amount}
                </Text>
              </View>
              <View className="bg-green-200 p-3 rounded-full">
                <Ionicons name="cash-outline" size={28} color="#15803d" />
              </View>
            </View>
          </View>
        </View>

        {/* Organizer */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-slate-900 mb-4">Organizer</Text>
          
          <View className="flex-row items-center mb-3">
            <View className="bg-purple-50 p-2 rounded-lg">
              <Ionicons name="person" size={20} color="#9333ea" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-slate-500 text-xs mb-1">Name</Text>
              <Text className="text-slate-900 text-base font-semibold">
                {event.organizer.name}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="bg-blue-50 p-2 rounded-lg">
              <Ionicons name="call" size={20} color="#2563eb" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-slate-500 text-xs mb-1">Contact</Text>
              <Text className="text-slate-900 text-base font-semibold">
                {event.organizer.contact}
              </Text>
            </View>
          </View>
        </View>

        {/* Requirements */}
        {event.requirements && event.requirements.length > 0 && (
          <View className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-slate-900 mb-4">Requirements</Text>
            
            {event.requirements.map((requirement, index) => (
              <View key={index} className="flex-row items-start mb-3 last:mb-0">
                <View className="bg-blue-100 rounded-full p-1 mt-0.5">
                  <Ionicons name="checkmark" size={14} color="#1e40af" />
                </View>
                <Text className="text-slate-700 text-sm ml-3 flex-1 leading-relaxed">
                  {requirement}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderRegistrationTab = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-gray-50">
        <View className="px-6 py-8">
          {!isRegistrationOpen ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-6">
              <View className="flex-row items-center mb-3">
                <Ionicons name="close-circle" size={24} color="#dc2626" />
                <Text className="text-red-900 text-lg font-bold ml-3">
                  Registration Closed
                </Text>
              </View>
              <Text className="text-red-700 text-base leading-relaxed">
                {spotsLeft === 0 
                  ? 'This event is full. No more registrations are being accepted.'
                  : event.status === 'cancelled'
                  ? 'This event has been cancelled.'
                  : new Date() >= registrationDeadline
                  ? 'The registration deadline has passed.'
                  : 'Registration is currently not available for this event.'
                }
              </Text>
            </View>
          ) : event.participationType === 'individual' ? (
            <>
              <Text className="text-2xl font-bold text-slate-900 mb-2">
                Individual Registration
              </Text>
              <Text className="text-slate-600 text-base mb-8 leading-relaxed">
                Fill in your details to register for this event
              </Text>

              {/* Individual Form */}
              <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <View className="mb-5">
                  <Text className="text-slate-700 text-sm font-semibold mb-2">
                    Full Name <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3.5 text-slate-900 text-base"
                    placeholder="Enter your full name"
                    value={participantForm.name}
                    onChangeText={(text) => setParticipantForm({ ...participantForm, name: text })}
                  />
                </View>

                <View className="mb-5">
                  <Text className="text-slate-700 text-sm font-semibold mb-2">
                    Contact Number <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3.5 text-slate-900 text-base"
                    placeholder="10-digit mobile number"
                    value={participantForm.contact}
                    onChangeText={(text) => setParticipantForm({ ...participantForm, contact: text.replace(/[^0-9]/g, '') })}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>

                <View className="mb-0">
                  <Text className="text-slate-700 text-sm font-semibold mb-2">
                    Email Address <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3.5 text-slate-900 text-base"
                    placeholder="your.email@example.com"
                    value={participantForm.email}
                    onChangeText={(text) => setParticipantForm({ ...participantForm, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Fee Summary */}
              <View className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-700 text-base font-semibold">
                    Registration Fee
                  </Text>
                  <Text className="text-green-700 text-2xl font-bold">
                    ₹{event.fees.amount}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text className="text-2xl font-bold text-slate-900 mb-2">
                Team Registration
              </Text>
              <Text className="text-slate-600 text-base mb-8 leading-relaxed">
                Register your team of {event.teamSize} players
              </Text>

              {/* Team Details */}
              <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <Text className="text-lg font-bold text-slate-900 mb-5">Team Details</Text>
                
                <View className="mb-5">
                  <Text className="text-slate-700 text-sm font-semibold mb-2">
                    Team Name <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3.5 text-slate-900 text-base"
                    placeholder="Enter your team name"
                    value={teamName}
                    onChangeText={setTeamName}
                  />
                </View>

                <View className="mb-5">
                  <Text className="text-slate-700 text-sm font-semibold mb-2">
                    Captain Contact <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3.5 text-slate-900 text-base"
                    placeholder="10-digit mobile number"
                    value={captainContact}
                    onChangeText={(text) => setCaptainContact(text.replace(/[^0-9]/g, ''))}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>

                <View className="mb-0">
                  <Text className="text-slate-700 text-sm font-semibold mb-2">
                    Captain Email <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3.5 text-slate-900 text-base"
                    placeholder="captain.email@example.com"
                    value={captainEmail}
                    onChangeText={setCaptainEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Team Members */}
              <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <Text className="text-lg font-bold text-slate-900 mb-5">
                  Team Members ({event.teamSize} Players)
                </Text>
                
                {teamMembers.map((member, index) => (
                  <View key={member.id} className="mb-6 last:mb-0">
                    <Text className="text-slate-900 text-base font-semibold mb-3">
                      Player {index + 1}
                    </Text>
                    
                    <View className="mb-3">
                      <Text className="text-slate-700 text-sm font-medium mb-2">
                        Name <Text className="text-red-500">*</Text>
                      </Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                        placeholder="Player name"
                        value={member.name}
                        onChangeText={(text) => updateTeamMember(index, 'name', text)}
                      />
                    </View>

                    <View className="mb-0">
                      <Text className="text-slate-700 text-sm font-medium mb-2">
                        Contact <Text className="text-red-500">*</Text>
                      </Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-slate-900"
                        placeholder="10-digit number"
                        value={member.contact}
                        onChangeText={(text) => updateTeamMember(index, 'contact', text.replace(/[^0-9]/g, ''))}
                        keyboardType="phone-pad"
                        maxLength={10}
                      />
                    </View>

                    {index < teamMembers.length - 1 && (
                      <View className="border-b border-gray-200 mt-5" />
                    )}
                  </View>
                ))}
              </View>

              {/* Fee Summary */}
              <View className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-700 text-base font-semibold">
                    Team Registration Fee
                  </Text>
                  <Text className="text-green-700 text-2xl font-bold">
                    ₹{event.fees.amount}
                  </Text>
                </View>
                <Text className="text-slate-600 text-sm mt-2">
                  {event.fees.type.replace('_', ' ')}
                </Text>
              </View>
            </>
          )}

          {/* Register Button */}
          {isRegistrationOpen && (
            <TouchableOpacity
              className={`${isRegistering ? 'bg-gray-400' : 'bg-green-600'} rounded-xl py-4 shadow-lg`}
              onPress={handleRegistration}
              disabled={isRegistering}
              activeOpacity={0.8}
            >
              <Text className="text-white text-center text-lg font-bold">
                {isRegistering ? 'Processing...' : `Register ${event.participationType === 'team' ? 'Team' : 'Now'}`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Terms */}
          <View className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#2563eb" className="mt-0.5" />
              <Text className="text-blue-800 text-sm ml-3 flex-1 leading-relaxed">
                By registering, you agree to the event terms and conditions. Payment will be collected at the venue.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="bg-slate-900 px-4 py-3 flex-row items-center shadow-sm border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View className="flex-1">
          <Text className="text-lg font-bold text-white" numberOfLines={1}>
            {event.name}
          </Text>
          <Text className="text-sm text-white">
            {eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        </View>

        
      </View>

      {/* Tab Navigation */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row px-6">
          {[
            { key: 'details', label: 'Event Details', icon: 'information-circle-outline' },
            { key: 'registration', label: 'Registration', icon: 'clipboard-outline' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`py-4 mr-8 border-b-3 flex-row items-center ${
                activeTab === tab.key 
                  ? 'border-green-600' 
                  : 'border-transparent'
              }`}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={18} 
                color={activeTab === tab.key ? '#16a34a' : '#64748b'} 
              />
              <Text className={`font-bold text-base ml-2 ${
                activeTab === tab.key 
                  ? 'text-green-700' 
                  : 'text-slate-500'
              }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {activeTab === 'details' && renderDetailsTab()}
      {activeTab === 'registration' && renderRegistrationTab()}

      {/* Floating Action Button (only on details tab) */}
      {activeTab === 'details' && isRegistrationOpen && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
          <TouchableOpacity
            className="bg-green-600 rounded-xl py-4 flex-row items-center justify-center shadow-lg"
            onPress={() => setActiveTab('registration')}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={22} color="white" />
            <Text className="text-white text-center text-lg font-bold ml-2">
              Register for Event
            </Text>
          </TouchableOpacity>
          
          <View className="flex-row items-center justify-center mt-3">
            <Text className="text-slate-600 text-sm">
              Entry Fee: 
            </Text>
            <Text className="text-green-700 text-lg font-bold ml-2">
              ₹{event.fees.amount}
            </Text>
            <Text className="text-slate-500 text-xs ml-2">
              ({event.fees.type.replace('_', ' ')})
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default EventDetailsScreen;