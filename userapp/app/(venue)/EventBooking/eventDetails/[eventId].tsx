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
import uuid from 'react-native-uuid'; // IMPORTED THIS

// STORES & TYPES
import { Event } from '@/types/booking';
import { useBookingStore } from '@/store/venueStore';
import { 
  useRegistrationRequestStore, 
  RegistrationRequest 
} from '@/store/eventRegistrationRequestStore'; // IMPORTED THIS

// Mock User (In real app, get this from your Auth Context)
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

const EventDetailsScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  // 1. GET STORE ACTIONS
  const { getEventById, getVenueById } = useBookingStore();
  const { addRequest } = useRegistrationRequestStore(); // CONNECTED STORE
  
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

  // ... (Keep your getStatusColor and getEventTypeColor helpers here) ...
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

  // ... (Keep your validation functions: validateIndividualForm, validateTeamForm) ...
  const validateIndividualForm = (): boolean => {
    if (!participantForm.name.trim()) { Alert.alert('Error', 'Enter name'); return false; }
    if (!participantForm.contact.trim() || participantForm.contact.length !== 10) { Alert.alert('Error', 'Enter valid contact'); return false; }
    if (!participantForm.email.includes('@')) { Alert.alert('Error', 'Enter valid email'); return false; }
    return true;
  };

  const validateTeamForm = (): boolean => {
    if (!teamName.trim()) { Alert.alert('Error', 'Enter team name'); return false; }
    if (!captainContact.trim()) { Alert.alert('Error', 'Enter captain contact'); return false; }
    if (!captainEmail.includes('@')) { Alert.alert('Error', 'Enter captain email'); return false; }
    for (let i = 0; i < teamMembers.length; i++) {
        if (!teamMembers[i].name || !teamMembers[i].contact) {
            Alert.alert('Error', `Complete details for Player ${i+1}`);
            return false;
        }
    }
    return true;
  };

  /* -------------------- THE CRITICAL FIX -------------------- */
  const handleRegistration = () => {
    if (event.participationType === 'individual') {
      if (!validateIndividualForm()) return;
      
      Alert.alert(
        'Confirm Registration',
        `Register for ${event.name}?\nFee: ₹${event.fees.amount}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              setIsRegistering(true);

              // 1. Construct the Request Object
              const newRequest: RegistrationRequest = {
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

              // 2. Simulate Network Delay then Save to Store
              setTimeout(() => {
                // 3. CALL STORE ACTION
                addRequest(newRequest);
                
                setIsRegistering(false);
                Alert.alert(
                  'Success!',
                  'Registration submitted. Waiting for approval.',
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              }, 1000);
            },
          },
        ]
      );
    } else {
      // TEAM LOGIC
      if (!validateTeamForm()) return;
      
      Alert.alert(
        'Confirm Team Registration',
        `Register team "${teamName}"?\nFee: ₹${event.fees.amount}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              setIsRegistering(true);

              // 1. Construct the Request Object
              const newRequest: RegistrationRequest = {
                id: uuid.v4().toString(),
                eventId: event.id,
                userId: CURRENT_USER_ID,
                teamName: teamName,
                captainContact: captainContact,
                captainEmail: captainEmail,
                teamMembers: teamMembers,
                participationType: 'team',
                teamSize: teamMembers.length,
                status: 'pending',
                submittedAt: new Date().toISOString(),
              };

              // 2. Simulate Network Delay then Save to Store
              setTimeout(() => {
                // 3. CALL STORE ACTION
                addRequest(newRequest);

                setIsRegistering(false);
                Alert.alert(
                  'Success!',
                  'Team registration submitted. Waiting for approval.',
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              }, 1000);
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

  // ... (The rest of your render code for renderDetailsTab and renderRegistrationTab remains exactly the same) ...

  const renderDetailsTab = () => (
    <ScrollView className="flex-1 bg-gray-50">
        {/* ... (Your existing UI code) ... */}
        {/* I am omitting the UI boilerplate to keep the answer concise, 
            but use your exact UI code from the prompt here. */}
        <View className="p-6"><Text>Event Details View Loaded</Text></View>
    </ScrollView>
  );

  const renderRegistrationTab = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-gray-50">
         {/* ... (Your existing UI code for forms) ... */}
         {/* Use your exact UI code from the prompt here. */}
         {/* Note: I'm keeping the form inputs, just ensuring the "Register" button 
             calls the UPDATED handleRegistration function above */}
         
         <View className="px-6 py-8">
            {/* ... Form Logic ... */}
            {isRegistrationOpen && (
            <TouchableOpacity
              className={`${isRegistering ? 'bg-gray-400' : 'bg-green-600'} rounded-xl py-4 shadow-lg`}
              onPress={handleRegistration} // This now calls the fixed function
              disabled={isRegistering}
            >
              <Text className="text-white text-center text-lg font-bold">
                {isRegistering ? 'Processing...' : 'Register Now'}
              </Text>
            </TouchableOpacity>
          )}
         </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* ... (Your Header and Tabs UI) ... */}
       <View className="bg-slate-900 px-4 py-3 flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
            <Text className="text-white font-bold text-lg ml-4">{event.name}</Text>
       </View>

       {/* Tab Buttons */}
       <View className="flex-row bg-white">
          <TouchableOpacity onPress={() => setActiveTab('details')} className="p-4"><Text>Details</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('registration')} className="p-4"><Text>Registration</Text></TouchableOpacity>
       </View>

      {activeTab === 'details' && renderDetailsTab()}
      {activeTab === 'registration' && renderRegistrationTab()}
    </SafeAreaView>
  );
};

export default EventDetailsScreen;