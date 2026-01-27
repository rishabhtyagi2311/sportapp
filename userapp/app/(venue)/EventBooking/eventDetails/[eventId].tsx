// app/(user)/eventDetails/[eventId].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';

import { Event } from '@/types/booking';
import { useBookingStore } from '@/store/venueStore';
import {
  useRegistrationRequestStore,
  RegularIndividualRequest,
  RegularTeamRequest,
} from '@/store/eventRegistrationRequestStore';


const CURRENT_USER_ID = 'user-123';
const { width } = Dimensions.get('window');

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* SCREEN */
/* -------------------------------------------------------------------------- */

export default function EventDetailsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();

  const { getEventById, getVenueById } = useBookingStore();
  const { addRequest } = useRegistrationRequestStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] =
    useState<'details' | 'registration'>('details');

  const [participantForm, setParticipantForm] = useState<ParticipantForm>({
    name: '',
    contact: '',
    email: '',
  });

  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMemberForm[]>([]);
  const [captainContact, setCaptainContact] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');

  /* ----------------------- LOAD EVENT ----------------------- */

  useEffect(() => {
    const found = getEventById(eventId);
    if (!found) return;

    setEvent(found);

    if (found.participationType === 'team' && found.teamSize) {
      setTeamMembers(
        Array.from({ length: found.teamSize }, (_, i) => ({
          id: `member-${i}`,
          name: '',
          contact: '',
        }))
      );
    }
  }, [eventId]);

  if (!event) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Ionicons name="alert-circle" size={48} color="#9ca3af" />
        <Text className="text-gray-500 mt-3 text-lg">Event not found</Text>
      </SafeAreaView>
    );
  }

  /* ----------------------- DERIVED ----------------------- */

  const venue = getVenueById(event.venueId);
  const eventDate = new Date(event.dateTime);
  const deadline = new Date(event.registrationDeadline);

  const slotsLeft = event.maxParticipants - event.currentParticipants;
  const percentFilled = (event.currentParticipants / event.maxParticipants) * 100;

  const isRegistrationOpen =
    event.status === 'upcoming' &&
    new Date() < deadline &&
    event.currentParticipants < event.maxParticipants;

  /* ----------------------- VALIDATION ----------------------- */

  const validateIndividual = () => {
    if (!participantForm.name.trim()) return false;
    if (participantForm.contact.length !== 10) return false;
    if (!participantForm.email.includes('@')) return false;
    return true;
  };

  const validateTeam = () => {
    if (!teamName.trim()) return false;
    if (captainContact.length !== 10) return false;
    if (!captainEmail.includes('@')) return false;
    return teamMembers.every(
      (m) => m.name.trim() && m.contact.length === 10
    );
  };

  /* ----------------------- SUBMIT ----------------------- */

const handleRegistration = () => {
  if (event.participationType === 'individual') {
    if (!validateIndividual()) {
      Alert.alert('Error', 'Please fill all fields correctly');
      return;
    }

    const request: RegularIndividualRequest = {
      id: uuid.v4().toString(),
      domain: 'regular',

      eventId: event.id,
      userId: CURRENT_USER_ID,

      participationType: 'individual',
      participantName: participantForm.name,
      contact: participantForm.contact,
      email: participantForm.email,

      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    addRequest(request);
    Alert.alert('Success', 'Registration submitted');
    router.back();
  } else {
    if (!validateTeam()) {
      Alert.alert('Error', 'Please fill team details correctly');
      return;
    }

    const request: RegularTeamRequest = {
      id: uuid.v4().toString(),
      domain: 'regular',

      eventId: event.id,
      userId: CURRENT_USER_ID,

      participationType: 'team',
      teamName,
      captainContact,
      captainEmail,

      teamMembers,
      teamSize: teamMembers.length,

      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    addRequest(request);
    Alert.alert('Success', 'Team registration submitted');
    router.back();
  }
};


  const updateMember = (
    index: number,
    field: 'name' | 'contact',
    value: string
  ) => {
    const copy = [...teamMembers];
    copy[index][field] = value;
    setTeamMembers(copy);
  };

  /* ----------------------- DETAILS TAB ----------------------- */

  const renderDetails = () => (
    <ScrollView 
      className="bg-gradient-to-b from-slate-50 to-white flex-1"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 px-6 pt-8 pb-12 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 pr-3">
            <Text className="text-black text-xs font-bold uppercase tracking-wider opacity-90 mb-4 ">
              {event.participationType === 'individual' ? '👤 Individual' : '👥 Team Event'}
            </Text>
            <Text className="text-black text-3xl font-bold leading-tight">
              {event.name}
            </Text>
          </View>
          <View className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Ionicons name="sparkles" size={24} color="black" />
          </View>
        </View>
        {event.description && (
          <Text className="text-black/90 text-sm leading-5">
            {event.description}
          </Text>
        )}
      </View>

      {/* Content Cards */}
      <View className="px-6 pt-6 pb-8">
        {/* Registration Progress */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-green-400/50">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full p-3 mr-3">
                <Ionicons name="people" size={20} color="#059669" />
              </View>
              <View>
                <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  Participation
                </Text>
                <Text className="text-gray-900 text-lg font-bold">
                  {event.currentParticipants}/{event.maxParticipants}
                </Text>
              </View>
            </View>
            <View className="bg-green-50 px-3 py-1 rounded-full border border-green-400">
              <Text className="text-green-700 text-xs font-bold">
                {slotsLeft} left
              </Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <View 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
              style={{ width: `${percentFilled}%` }}
            />
          </View>
          <Text className="text-gray-500 text-xs mt-2">
            {percentFilled.toFixed(0)}% filled
          </Text>
        </View>

        {/* Schedule Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-blue-400/50">
          <View className="flex-row items-center mb-4">
            <View className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-3 mr-3">
              <Ionicons name="calendar" size={20} color="#0369a1" />
            </View>
            <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
              Schedule
            </Text>
          </View>

          <View className="space-y-2">
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-medium w-16">Date:</Text>
              <Text className="text-gray-900 font-semibold">
                {eventDate.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-medium w-16">Time:</Text>
              <View className="flex-row items-center">
                <Ionicons name="time" size={16} color="#6b7280" />
                <Text className="text-gray-900 font-semibold ml-2">
                  {eventDate.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fee Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-orange-400/50">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full p-3 mr-3">
                <Ionicons name="wallet" size={20} color="#d97706" />
              </View>
              <View>
                <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  Entry Fee
                </Text>
                <Text className="text-gray-600 text-sm">
                  {event.fees.type.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <Text className="text-orange-600 text-2xl font-bold">
              ₹{event.fees.amount}
            </Text>
          </View>
        </View>

        {/* Venue Card */}
        {venue && (
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-purple-400/50">
            <View className="flex-row items-center mb-4">
              <View className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-3 mr-3">
                <Ionicons name="location" size={20} color="#9333ea" />
              </View>
              <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                Venue
              </Text>
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-1">
              {venue.name}
            </Text>
            <Text className="text-gray-600 text-sm leading-5">
              {venue.address.street}, {venue.address.city}
            </Text>
          </View>
        )}

        {/* Deadline Info */}
        <View className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 border border-red-400/50">
          <View className="flex-row items-center mb-2">
            <Ionicons name="alert-circle" size={20} color="#dc2626" />
            <Text className="text-red-700 font-bold ml-2">Registration Deadline</Text>
          </View>
          <Text className="text-red-600 text-sm">
            {deadline.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  /* ----------------------- REGISTRATION TAB ----------------------- */

const renderRegistration = () => (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    className="flex-1 bg-slate-50"
  >
    <ScrollView 
      className="flex-1"
      showsVerticalScrollIndicator={false}
    >
      {/* Registration Header */}
      <View className="bg-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm border-b border-slate-100">
        <View className="flex-row items-center mb-2">
          <View className="bg-slate-100 p-2 rounded-lg">
            <Ionicons name="clipboard" size={24} color="black" />
          </View>
          <Text className="text-slate-900 text-2xl font-black ml-3">
            {event.participationType === 'individual' 
              ? 'Participant' 
              : 'Team'} Registration
          </Text>
        </View>
        <Text className="text-slate-500 text-base leading-5 ml-1">
          {event.participationType === 'individual'
            ? 'Fill in your details to secure your spot.'
            : 'Register your team and captain details below.'}
        </Text>
      </View>

      <View className="px-6 py-8">
        {!isRegistrationOpen ? (
          /* Closed State */
          <View className="bg-red-50 border border-red-100 rounded-3xl p-6 items-center">
            <View className="bg-red-100 rounded-full p-4 mb-4">
              <Ionicons name="lock-closed" size={32} color="#dc2626" />
            </View>
            <Text className="text-red-800 font-bold text-lg text-center">
              Registration Closed
            </Text>
            <Text className="text-red-600 text-center mt-2 leading-5">
              We're sorry! Registration for this event has reached its deadline.
            </Text>
          </View>
        ) : (
          <>
            {event.participationType === 'individual' ? (
              /* Individual Form */
              <View className="space-y-4">
                <Text className="text-slate-800 font-bold text-lg mb-2">Your Personal Info</Text>
                
                {/* Name Input */}
                <View className="bg-white border border-slate-200 rounded-2xl px-4 py-4 flex-row items-center mb-4 shadow-sm">
                  <Ionicons name="person-outline" size={20} color="black" />
                  <TextInput
                    placeholder="Full Name"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-3 text-slate-900 font-semibold"
                    value={participantForm.name}
                    onChangeText={(t) => setParticipantForm({ ...participantForm, name: t })}
                  />
                </View>

                {/* Contact Input */}
                <View className="mb-4">
                  <View className="bg-white border border-slate-200 rounded-2xl px-4 py-4 flex-row items-center shadow-sm">
                    <Ionicons name="call-outline" size={20} color="black" />
                    <TextInput
                      placeholder="Phone Number"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      maxLength={10}
                      className="flex-1 ml-3 text-slate-900 font-semibold"
                      value={participantForm.contact}
                      onChangeText={(t) => setParticipantForm({ ...participantForm, contact: t.replace(/\D/g, '') })}
                    />
                  </View>
                  <Text className="text-slate-400 text-[10px] mt-2 ml-2 uppercase font-bold tracking-widest">
                    {participantForm.contact.length} / 10 digits
                  </Text>
                </View>

                {/* Email Input */}
                <View className="bg-white border border-slate-200 rounded-2xl px-4 py-4 flex-row items-center mb-8 shadow-sm">
                  <Ionicons name="mail-outline" size={20} color="black" />
                  <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-3 text-slate-900 font-semibold"
                    value={participantForm.email}
                    onChangeText={(t) => setParticipantForm({ ...participantForm, email: t })}
                  />
                </View>
              </View>
            ) : (
              /* Team Form */
              <View>
                <Text className="text-slate-800 font-bold text-lg mb-4">Team Identity</Text>
                <View className="bg-white border border-slate-200 rounded-2xl px-4 py-4 flex-row items-center mb-6 shadow-sm">
                  <Ionicons name="ribbon-outline" size={22} color="black" />
                  <TextInput
                    placeholder="Enter Team Name"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-3 text-slate-900 font-bold text-base"
                    value={teamName}
                    onChangeText={setTeamName}
                  />
                </View>

                <Text className="text-slate-800 font-bold text-lg mb-4">Captain's Hub</Text>
                <View className="space-y-4 mb-8">
                  <View className="bg-white border border-slate-200 rounded-2xl px-4 py-4 flex-row items-center mb-4 shadow-sm">
                    <Ionicons name="call-outline" size={20} color="black" />
                    <TextInput
                      placeholder="Captain Phone"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      maxLength={10}
                      className="flex-1 ml-3 text-slate-900 font-semibold"
                      value={captainContact}
                      onChangeText={(t) => setCaptainContact(t.replace(/\D/g, ''))}
                    />
                  </View>
                  <View className="bg-white border border-slate-200 rounded-2xl px-4 py-4 flex-row items-center shadow-sm">
                    <Ionicons name="mail-outline" size={20} color="black" />
                    <TextInput
                      placeholder="Captain Email"
                      placeholderTextColor="#94a3b8"
                      className="flex-1 ml-3 text-slate-900 font-semibold"
                      value={captainEmail}
                      onChangeText={setCaptainEmail}
                    />
                  </View>
                </View>

                <Text className="text-slate-800 font-bold text-lg mb-4">Squad Members</Text>
                {teamMembers.map((m, i) => (
                  <View key={m.id} className="mb-6 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                    <View className="flex-row items-center mb-4 justify-between">
                      <View className="flex-row items-center">
                        <View className="bg-slate-500 rounded-full w-7 h-7 items-center justify-center mr-3">
                          <Text className="text-white font-bold text-xs">{i + 1}</Text>
                        </View>
                        <Text className="text-slate-700 font-black uppercase text-xs tracking-widest">
                          Member {i + 1}
                        </Text>
                      </View>
                    </View>

                    <View className="space-y-3">
                       <View className="bg-slate-50 rounded-xl px-4 py-3 flex-row items-center mb-3">
                        <Ionicons name="person-outline" size={18} color="#94a3b8" />
                        <TextInput
                          placeholder="Player Name"
                          placeholderTextColor="#cbd5e1"
                          className="flex-1 ml-3 text-slate-900 font-medium"
                          value={m.name}
                          onChangeText={(t) => updateMember(i, 'name', t)}
                        />
                      </View>
                      <View className="bg-slate-50 rounded-xl px-4 py-3 flex-row items-center">
                        <Ionicons name="call-outline" size={18} color="#94a3b8" />
                        <TextInput
                          placeholder="Phone Number"
                          placeholderTextColor="#cbd5e1"
                          keyboardType="phone-pad"
                          maxLength={10}
                          className="flex-1 ml-3 text-slate-900 font-medium"
                          value={m.contact}
                          onChangeText={(t) => updateMember(i, 'contact', t.replace(/\D/g, ''))}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegistration}
              activeOpacity={0.8}
              className="mt-4 overflow-hidden"
            >
              <View className="bg-slate-900 py-5 rounded-2xl flex-row items-center justify-center shadow-xl shadow-slate-300">
                <Text className="text-white text-center font-black text-lg mr-2 uppercase tracking-widest">
                  Confirm Registration
                </Text>
              </View>
            </TouchableOpacity>
           
          </>
        )}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);
  /* ----------------------- SHELL ----------------------- */

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />

      {/* HEADER - bg-slate-900 with back arrow and event name heading */}
      <View className="bg-slate-900 px-6 py-4 flex-row items-center justify-between shadow-xl">
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => router.back()}
          className=" rounded-full p-3"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Event Name Heading */}
        <Text className="text-white text-lg font-bold flex-1 ml-4 mr-2" numberOfLines={1}>
          {event.name}
        </Text>
        
       
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        {(['details', 'registration'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            className={`flex-1 py-4 px-4 ${
              activeTab === t
                ? 'border-b-2 border-green-600 bg-green-50/30'
                : 'bg-white'
            }`}
            onPress={() => setActiveTab(t)}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons 
                name={t === 'details' ? 'information-circle' : 'clipboard'} 
                size={18} 
                color={activeTab === t ? '#059669' : '#9ca3af'}
              />
              <Text
                className={`ml-2 font-bold ${
                  activeTab === t
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                {t === 'details' ? 'Details' : 'Registration'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'details'
        ? renderDetails()
        : renderRegistration()}
    </SafeAreaView>
  );
}