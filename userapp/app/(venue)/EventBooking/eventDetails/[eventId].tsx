// app/(user)/eventDetails/[eventId].tsx

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
import uuid from 'react-native-uuid';

import { Event } from '@/types/booking';
import { useBookingStore } from '@/store/venueStore';
import {
  useRegistrationRequestStore,
  RegistrationRequest,
} from '@/store/eventRegistrationRequestStore';

const CURRENT_USER_ID = 'user-123';

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

export default function EventDetailsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();

  const { getEventById, getVenueById } = useBookingStore();
  const { addRequest } = useRegistrationRequestStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'registration'>('details');
  const [isRegistering, setIsRegistering] = useState(false);

  const [participantForm, setParticipantForm] = useState<ParticipantForm>({
    name: '',
    contact: '',
    email: '',
  });

  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMemberForm[]>([]);
  const [captainContact, setCaptainContact] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');

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
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Event not found</Text>
      </SafeAreaView>
    );
  }

  const venue = getVenueById(event.venueId);
  const eventDate = new Date(event.dateTime);
  const deadline = new Date(event.registrationDeadline);

  const isTournament = event.eventType === 'tournament';

  const finalizedSlotsLeft =
    event.maxParticipants - event.currentParticipants;

  const isRegistrationOpen =
    event.status === 'upcoming' &&
    new Date() < deadline &&
    (
      !isTournament ||
      (event.maxRegistrations !== undefined &&
        event.currentParticipants < event.maxRegistrations)
    );

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

  const handleRegistration = () => {
    if (event.participationType === 'individual') {
      if (!validateIndividual()) {
        Alert.alert('Error', 'Please fill all fields correctly');
        return;
      }

      const request: RegistrationRequest = {
        id: uuid.v4().toString(),
        eventId: event.id,
        userId: CURRENT_USER_ID,
        participantName: participantForm.name,
        contact: participantForm.contact,
        email: participantForm.email,
        participationType: 'individual',
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      addRequest(request);
      Alert.alert('Success', 'Registration request submitted');
      router.back();
    } else {
      if (!validateTeam()) {
        Alert.alert('Error', 'Please fill team details correctly');
        return;
      }

      const request: RegistrationRequest = {
        id: uuid.v4().toString(),
        eventId: event.id,
        userId: CURRENT_USER_ID,
        teamName,
        captainContact,
        captainEmail,
        teamMembers,
        participationType: 'team',
        teamSize: teamMembers.length,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      addRequest(request);
      Alert.alert('Success', 'Team registration request submitted');
      router.back();
    }
  };

  const updateMember = (index: number, field: 'name' | 'contact', value: string) => {
    const copy = [...teamMembers];
    copy[index][field] = value;
    setTeamMembers(copy);
  };

  /* ---------------------- DETAILS TAB ---------------------- */

  const renderDetails = () => (
    <ScrollView className="bg-gray-50 px-6 py-6">
      <Text className="text-3xl font-bold mb-3">{event.name}</Text>

      {event.description && (
        <Text className="text-slate-600 mb-4">{event.description}</Text>
      )}

      {isTournament && event.tournamentFormat && (
        <View className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <Text className="font-semibold text-orange-700">
            Tournament Format
          </Text>
          <Text className="capitalize text-orange-900">
            {event.tournamentFormat}
          </Text>
        </View>
      )}

      <View className="bg-white rounded-xl p-4 mb-4">
        <Text className="font-semibold mb-2">Participation</Text>
        <Text>
          {event.currentParticipants}/{event.maxParticipants} teams finalized
        </Text>
        <Text className="text-sm text-gray-500">
          {finalizedSlotsLeft} slots remaining
        </Text>

        {isTournament && event.maxRegistrations && (
          <Text className="text-sm text-gray-500 mt-1">
            Max registration requests: {event.maxRegistrations}
          </Text>
        )}
      </View>

      <View className="bg-white rounded-xl p-4 mb-4">
        <Text className="font-semibold mb-2">Entry Fee</Text>
        <Text className="text-2xl font-bold">
          ₹{event.fees.amount} ({event.fees.type.replace('_', ' ')})
        </Text>
      </View>

      {venue && (
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="font-semibold mb-1">{venue.name}</Text>
          <Text className="text-gray-600">
            {venue.address.street}, {venue.address.city}
          </Text>
        </View>
      )}

      
      
    </ScrollView>
  );

  /* ---------------------- REGISTRATION TAB ---------------------- */

  const renderRegistration = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView className="bg-gray-50 px-6 py-6">
        {!isRegistrationOpen ? (
          <Text className="text-red-600 font-semibold">
            Registration closed
          </Text>
        ) : event.participationType === 'individual' ? (
          <>
            <TextInput
              placeholder="Name"
              className="bg-white p-4 rounded mb-3"
              value={participantForm.name}
              onChangeText={(t) => setParticipantForm({ ...participantForm, name: t })}
            />
            <TextInput
              placeholder="Contact"
              keyboardType="phone-pad"
              maxLength={10}
              className="bg-white p-4 rounded mb-3"
              value={participantForm.contact}
              onChangeText={(t) =>
                setParticipantForm({ ...participantForm, contact: t.replace(/\D/g, '') })
              }
            />
            <TextInput
              placeholder="Email"
              className="bg-white p-4 rounded mb-6"
              value={participantForm.email}
              onChangeText={(t) => setParticipantForm({ ...participantForm, email: t })}
            />
          </>
        ) : (
          <>
            <TextInput
              placeholder="Team Name"
              className="bg-white p-4 rounded mb-3"
              value={teamName}
              onChangeText={setTeamName}
            />

            <TextInput
              placeholder="Captain Contact"
              keyboardType="phone-pad"
              maxLength={10}
              className="bg-white p-4 rounded mb-3"
              value={captainContact}
              onChangeText={(t) => setCaptainContact(t.replace(/\D/g, ''))}
            />

            <TextInput
              placeholder="Captain Email"
              className="bg-white p-4 rounded mb-4"
              value={captainEmail}
              onChangeText={setCaptainEmail}
            />

            {teamMembers.map((m, i) => (
              <View key={m.id} className="mb-4">
                <Text className="font-semibold mb-1">Player {i + 1}</Text>
                <TextInput
                  placeholder="Name"
                  className="bg-white p-3 rounded mb-2"
                  value={m.name}
                  onChangeText={(t) => updateMember(i, 'name', t)}
                />
                <TextInput
                  placeholder="Contact"
                  keyboardType="phone-pad"
                  maxLength={10}
                  className="bg-white p-3 rounded"
                  value={m.contact}
                  onChangeText={(t) =>
                    updateMember(i, 'contact', t.replace(/\D/g, ''))
                  }
                />
              </View>
            ))}
          </>
        )}

        {isRegistrationOpen && (
          <TouchableOpacity
            className="bg-green-600 py-4 rounded-xl"
            onPress={handleRegistration}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isTournament ? 'Request Registration' : 'Register Now'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <View className="bg-slate-900 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-4">
          {event.name}
        </Text>
      </View>

      <View className="flex-row bg-white border-b">
        {(['details', 'registration'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            className={`flex-1 py-3 ${
              activeTab === t ? 'border-b-2 border-green-600' : ''
            }`}
            onPress={() => setActiveTab(t)}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === t ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {t === 'details' ? 'Details' : 'Registration'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'details' ? renderDetails() : renderRegistration()}
    </SafeAreaView>
  );
}
