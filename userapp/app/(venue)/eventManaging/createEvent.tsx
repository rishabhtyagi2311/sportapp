// app/(venue)/eventManager/createEvent.tsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { useBookingStore } from '@/store/venueStore';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import uuid from 'react-native-uuid';
import { CURRENT_USER } from './usercontext';



export default function CreateEventScreen() {
  const { addEvent, venues, sports } = useBookingStore();
  
  // Form state
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('tournament');
  const [sportId, setSportId] = useState('');
  const [participationType, setParticipationType] = useState('individual');
  const [teamSize, setTeamSize] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [currentParticipants, setCurrentParticipants] = useState('0');
  const [venueId, setVenueId] = useState('');
  
  // Simplified date and time inputs
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  
  const [duration, setDuration] = useState('2');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeType, setFeeType] = useState('per_person');
  const [registrationDays, setRegistrationDays] = useState('7');
  
  const validateForm = () => {
    if (!eventName.trim()) {
      Alert.alert('Error', 'Please enter an event name');
      return false;
    }
    if (!venueId) {
      Alert.alert('Error', 'Please select a venue');
      return false;
    }
    if (!sportId) {
      Alert.alert('Error', 'Please select a sport');
      return false;
    }
    if (!maxParticipants || parseInt(maxParticipants) <= 0) {
      Alert.alert('Error', 'Please enter a val\id maximum number of participants');
      return false;
    }
    if (participationType === 'team' && (!teamSize || parseInt(teamSize) <= 0)) {
      Alert.alert('Error', 'Please enter a valid team size');
      return false;
    }
    if (!feeAmount || parseFloat(feeAmount) < 0) {
      Alert.alert('Error', 'Please enter a valid fee amount');
      return false;
    }
    if (!eventDate) {
      Alert.alert('Error', 'Please enter a date (YYYY-MM-DD)');
      return false;
    }
    if (!eventTime) {
      Alert.alert('Error', 'Please enter a time (HH:MM)');
      return false;
    }
    
    // Basic validation for date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(eventDate)) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
      return false;
    }
    
    // Basic validation for time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(eventTime)) {
      Alert.alert('Error', 'Please enter time in HH:MM format');
      return false;
    }
    
    return true;
  };

  const handleCreateEvent = () => {
    if (!validateForm()) return;
    
    // Parse date and time
    const [year, month, day] = eventDate.split('-').map(Number);
    const [hours, minutes] = eventTime.split(':').map(Number);
    const eventDateTime = new Date(year, month - 1, day, hours, minutes);
    
    if (isNaN(eventDateTime.getTime())) {
      Alert.alert('Error', 'Invalid date or time format');
      return;
    }
    
    // Calculate registration deadline (x days before event)
    const deadlineDate = new Date(eventDateTime);
    deadlineDate.setDate(deadlineDate.getDate() - parseInt(registrationDays));
    
    // Find sport object
    const selectedSport = sports.find(sport => sport.id === sportId);
    if (!selectedSport) {
      Alert.alert('Error', 'Selected sport not found');
      return;
    }
    
    const newEvent = {
    id: uuid.v4().toString(),
    creatorId: CURRENT_USER.id,  // Set the creatorId to identify the user who created the event
    venueId,
    name: eventName,
    description,
    eventType: eventType as 'tournament' | 'practice' | 'friendly' | 'training' | 'league',
    sport: selectedSport,
    participationType: participationType as 'individual' | 'team',
    teamSize: participationType === 'team' ? parseInt(teamSize) : undefined,
    maxParticipants: parseInt(maxParticipants),
    currentParticipants: parseInt(currentParticipants),
    dateTime: eventDateTime.toISOString(),
    duration: parseFloat(duration),
    fees: {
      amount: parseFloat(feeAmount),
      currency: 'INR' as const,
      type: feeType as 'per_person' | 'per_team' | 'total',
    },
    organizer: {
      name: CURRENT_USER.name,      // The actual organizer's name
      contact: CURRENT_USER.phone,  // The actual contact phone number
    },
    status: 'upcoming' as const,
    isPublic: true,
    registrationDeadline: deadlineDate.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
    addEvent(newEvent);
    Alert.alert('Success', 'Event created successfully');
    router.push('/eventManager/profile');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white p-4">
        <View className="space-y-4">
          {/* Event Name */}
          <View>
            <Text className="text-gray-700 font-medium mb-1">Event Name *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
              placeholder="Enter event name"
              value={eventName}
              onChangeText={setEventName}
            />
          </View>
          
          {/* Description */}
          <View>
            <Text className="text-gray-700 font-medium mb-1">Description</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
              placeholder="Enter event description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Venue */}
          <View>
            <Text className="text-gray-700 font-medium mb-1">Venue *</Text>
            <View className="border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
              <Picker
                selectedValue={venueId}
                onValueChange={(itemValue) => setVenueId(itemValue)}
              >
                <Picker.Item label="Select a venue" value="" />
                {venues.map((venue) => (
                  <Picker.Item key={venue.id} label={venue.name} value={venue.id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Sport */}
          <View>
            <Text className="text-gray-700 font-medium mb-1">Sport *</Text>
            <View className="border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
              <Picker
                selectedValue={sportId}
                onValueChange={(itemValue) => setSportId(itemValue)}
              >
                <Picker.Item label="Select a sport" value="" />
                {sports.map((sport) => (
                  <Picker.Item key={sport.id} label={sport.name} value={sport.id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Event Type */}
          <View>
            <Text className="text-gray-700 font-medium mb-1">Event Type</Text>
            <View className="border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
              <Picker
                selectedValue={eventType}
                onValueChange={(itemValue) => setEventType(itemValue)}
              >
                <Picker.Item label="Tournament" value="tournament" />
                <Picker.Item label="Practice" value="practice" />
                <Picker.Item label="Friendly" value="friendly" />
                <Picker.Item label="Training" value="training" />
                <Picker.Item label="League" value="league" />
              </Picker>
            </View>
          </View>
          
          {/* Participation Type */}
          <View>
            <Text className="text-gray-700 font-medium mb-1">Participation Type</Text>
            <View className="flex-row">
              <TouchableOpacity 
                className={`flex-1 flex-row items-center justify-center py-2 border ${participationType === 'individual' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'} rounded-l-lg`}
                onPress={() => setParticipationType('individual')}
              >
                <Ionicons 
                  name="person" 
                  size={16} 
                  color={participationType === 'individual' ? '#059669' : '#6b7280'} 
                />
                <Text className={`ml-1 ${participationType === 'individual' ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                  Individual
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`flex-1 flex-row items-center justify-center py-2 border ${participationType === 'team' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'} rounded-r-lg`}
                onPress={() => setParticipationType('team')}
              >
                <Ionicons 
                  name="people" 
                  size={16} 
                  color={participationType === 'team' ? '#059669' : '#6b7280'} 
                />
                <Text className={`ml-1 ${participationType === 'team' ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                  Team
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Team Size (if team participation) */}
          {participationType === 'team' && (
            <View>
              <Text className="text-gray-700 font-medium mb-1">Team Size *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                placeholder="Enter team size"
                value={teamSize}
                onChangeText={setTeamSize}
                keyboardType="numeric"
              />
            </View>
          )}
          
          {/* Participants */}
          <View>
            <Text className="text-gray-700 font-medium mb-1">Maximum Participants *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
              placeholder="Enter maximum participants"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="numeric"
            />
          </View>
          
          {/* Date and Time */}
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-gray-700 font-medium mb-1">Date (YYYY-MM-DD) *</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                  placeholder="YYYY-MM-DD"
                  value={eventDate}
                  onChangeText={setEventDate}
                />
                <TouchableOpacity className="absolute right-3" onPress={() => {
                  const today = new Date();
                  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  setEventDate(formattedDate);
                }}>
                  <Ionicons name="calendar" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View className="flex-1">
              <Text className="text-gray-700 font-medium mb-1">Time (HH:MM) *</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                  placeholder="HH:MM"
                  value={eventTime}
                  onChangeText={setEventTime}
                />
                <TouchableOpacity className="absolute right-3" onPress={() => {
                  const now = new Date();
                  const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                  setEventTime(formattedTime);
                }}>
                  <Ionicons name="time" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Duration */}
          <View>
            <Text className="text-gray-700 font-medium mb-1">Duration (hours) *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
              placeholder="Enter duration in hours"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>
          
          {/* Fees */}
          <View className="space-y-2">
            <Text className="text-gray-700 font-medium">Event Fees *</Text>
            <View className="flex-row space-x-2">
              <View className="flex-1">
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                  placeholder="Amount"
                  value={feeAmount}
                  onChangeText={setFeeAmount}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-2 border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                <Picker
                  selectedValue={feeType}
                  onValueChange={(itemValue) => setFeeType(itemValue)}
                >
                  <Picker.Item label="Per Person" value="per_person" />
                  <Picker.Item label="Per Team" value="per_team" />
                  <Picker.Item label="Total" value="total" />
                </Picker>
              </View>
            </View>
          </View>
          
          {/* Registration Deadline */}
          <View>
            <Text className="text-gray-700 font-medium mb-1">Registration Deadline</Text>
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                placeholder="Days before event"
                value={registrationDays}
                onChangeText={setRegistrationDays}
                keyboardType="numeric"
              />
              <Text className="ml-2 text-gray-600">days before event</Text>
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            className="bg-green-600 rounded-lg py-3 items-center mt-4"
            onPress={handleCreateEvent}
          >
            <Text className="text-white font-bold text-lg">Create Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}