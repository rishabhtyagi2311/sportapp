// app/(venue)/eventManager/createEvent.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useBookingStore } from '@/store/venueStore';
import uuid from 'react-native-uuid';
import { CURRENT_USER } from './usercontext';

// Define event type options
type EventType = 'tournament' | 'practice' | 'friendly' | 'training' | 'league';
type ParticipationType = 'individual' | 'team';
type FeeType = 'per_person' | 'per_team' | 'total';

export default function CreateEventScreen() {
  const { addEvent, venues, sports } = useBookingStore();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venueId: '',
    sportId: '',
    eventType: '',
    participationType: '',
    teamSize: '',
    maxParticipants: '',
    date: '',
    time: '',
    duration: '',
    feeAmount: '',
    feeType: '',
  });
  
  // Event type options
  const eventTypes: EventType[] = [
    'tournament',
    'practice',
    'friendly',
    'training',
    'league'
  ];
  
  // Participation types
  const participationTypes: ParticipationType[] = ['individual', 'team'];
  
  // Fee types
  const feeTypes: FeeType[] = ['per_person', 'per_team', 'total'];
  
  // Update form data
  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle event type selection
  const selectEventType = (type: EventType) => {
    updateForm('eventType', type);
  };
  
  // Handle participation type selection
  const selectParticipationType = (type: ParticipationType) => {
    updateForm('participationType', type);
  };
  
  // Handle fee type selection
  const selectFeeType = (type: FeeType) => {
    updateForm('feeType', type);
  };
  
  // Handle date input with format control
  const handleDateChange = (text: string) => {
    // Allow only digits and hyphens
    const sanitized = text.replace(/[^\d-]/g, '');
    
    // Format as YYYY-MM-DD
    let formatted = sanitized;
    if (sanitized.length > 4 && !sanitized.includes('-')) {
      formatted = sanitized.slice(0, 4) + '-' + sanitized.slice(4);
    }
    if (sanitized.length > 7 && sanitized.split('-').length === 2) {
      const parts = formatted.split('-');
      formatted = parts[0] + '-' + parts[1].slice(0, 2) + '-' + parts[1].slice(2);
    }
    
    // Ensure we don't exceed the expected format length
    if (formatted.length <= 10) {
      updateForm('date', formatted);
    }
  };
  
  // Handle time input with format control
  const handleTimeChange = (text: string) => {
    // Allow only digits and colons
    const sanitized = text.replace(/[^\d:]/g, '');
    
    // Format as HH:MM
    let formatted = sanitized;
    if (sanitized.length > 2 && !sanitized.includes(':')) {
      formatted = sanitized.slice(0, 2) + ':' + sanitized.slice(2);
    }
    
    // Ensure we don't exceed the expected format length
    if (formatted.length <= 5) {
      updateForm('time', formatted);
    }
  };
  
  // Validate form data
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter event name');
      return false;
    }
    if (!formData.venueId) {
      Alert.alert('Error', 'Please enter venue');
      return false;
    }
    if (!formData.sportId) {
      Alert.alert('Error', 'Please enter sport');
      return false;
    }
    if (!formData.eventType) {
      Alert.alert('Error', 'Please select event type');
      return false;
    }
    if (!formData.participationType) {
      Alert.alert('Error', 'Please select participation type');
      return false;
    }
    if (formData.participationType === 'team' && !formData.teamSize) {
      Alert.alert('Error', 'Please enter team size');
      return false;
    }
    if (!formData.maxParticipants) {
      Alert.alert('Error', 'Please enter maximum participants');
      return false;
    }
    
    // Date validation
    if (!formData.date) {
      Alert.alert('Error', 'Please enter event date');
      return false;
    }
    if (formData.date.length !== 10 || !formData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
      return false;
    }
    
    // Time validation
    if (!formData.time) {
      Alert.alert('Error', 'Please enter event time');
      return false;
    }
    if (formData.time.length !== 5 || !formData.time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      Alert.alert('Error', 'Please enter time in HH:MM format');
      return false;
    }
    
    if (!formData.duration) {
      Alert.alert('Error', 'Please enter event duration');
      return false;
    }
    if (!formData.feeAmount) {
      Alert.alert('Error', 'Please enter fee amount');
      return false;
    }
    if (!formData.feeType) {
      Alert.alert('Error', 'Please select fee type');
      return false;
    }
    return true;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    try {
      // Parse date and time
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      const eventDateTime = new Date(year, month - 1, day, hours, minutes);
      
      // Calculate registration deadline (7 days before)
      const deadlineDate = new Date(eventDateTime);
      deadlineDate.setDate(deadlineDate.getDate() - 7);
      
      // Create a sport object if it doesn't exist in the current sports list
      let sportForEvent;
      const existingSport = sports.find(sport => sport.id === formData.sportId);
      
      if (existingSport) {
        sportForEvent = existingSport;
      } else {
        // Create a new sport object with the given ID
        sportForEvent = {
          id: formData.sportId,
          name: formData.sportId, // Use ID as name if not found
          category: 'outdoor' as const,
          varieties: [], // Empty varieties
        };
      }
      
      // Create new event
      const newEvent = {
        id: uuid.v4().toString(),
        creatorId: CURRENT_USER.id,
        venueId: formData.venueId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        eventType: formData.eventType as EventType,
        sport: sportForEvent,
        participationType: formData.participationType as ParticipationType,
        teamSize: formData.participationType === 'team' ? parseInt(formData.teamSize) : undefined,
        maxParticipants: parseInt(formData.maxParticipants),
        currentParticipants: 0,
        dateTime: eventDateTime.toISOString(),
        duration: parseFloat(formData.duration || '2'),
        fees: {
          amount: parseFloat(formData.feeAmount),
          currency: 'INR' as const,
          type: formData.feeType as FeeType,
        },
        organizer: {
          name: CURRENT_USER.name,
          contact: CURRENT_USER.phone,
        },
        status: 'upcoming' as const,
        isPublic: true,
        registrationDeadline: deadlineDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add to store
      addEvent(newEvent);
      
      // Navigate back
      router.push('/eventManaging/profile');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please check your inputs.');
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="w-full h-full bg-slate-900">
        {/* Header */}
        <View className="px-6 py-4 border-b border-white flex-row items-center mt-4">
          <TouchableOpacity
            className="mr-4"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            Create Event
          </Text>
        </View>
        
        {/* Form */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Event Name */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Event Name *
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="trophy-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="Enter event name"
                placeholderTextColor="#6b7280"
                value={formData.name}
                onChangeText={(text) => updateForm('name', text)}
              />
            </View>
          </View>
          
          {/* Venue Selection */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Venue *
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="location-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="Enter venue"
                placeholderTextColor="#6b7280"
                value={formData.venueId}
                onChangeText={(text) => updateForm('venueId', text)}
              />
            </View>
          </View>
          
          {/* Sport Selection */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Sport *
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="basketball-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="Enter sport"
                placeholderTextColor="#6b7280"
                value={formData.sportId}
                onChangeText={(text) => updateForm('sportId', text)}
              />
            </View>
          </View>
          
          {/* Event Type Selection */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Event Type *
            </Text>
            <Text className="text-gray-400 text-sm mb-3">
              Select the type of event
            </Text>
            
            <View className="flex-row flex-wrap mb-3">
              {eventTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => selectEventType(type)}
                  className={`rounded-lg px-3 py-2 mr-2 mb-2 border ${
                    formData.eventType === type
                      ? "bg-green-600 border-green-500"
                      : "bg-sky-100 border-gray-300"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm ${
                      formData.eventType === type
                        ? "text-white font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Description */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Description (Optional)
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 px-4">
              <TextInput
                className="w-full text-black py-4 text-base"
                placeholder="Enter event description"
                placeholderTextColor="#6b7280"
                value={formData.description}
                onChangeText={(text) => updateForm('description', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          {/* Participation Type */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Participation Type *
            </Text>
            <View className="flex-row">
              {participationTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => selectParticipationType(type)}
                  className={`flex-1 rounded-lg py-3 px-2 mr-2 border ${
                    formData.participationType === type
                      ? "bg-green-600 border-green-500"
                      : "bg-sky-100 border-gray-300"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-center text-sm ${
                      formData.participationType === type
                        ? "text-white font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Team Size (if applicable) */}
          {formData.participationType === 'team' && (
            <View className="mb-6">
              <Text className="text-white font-semibold mb-2 text-base">
                Team Size *
              </Text>
              <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name="people-outline" size={20} color="#374151" />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="Enter team size"
                  placeholderTextColor="#6b7280"
                  value={formData.teamSize}
                  onChangeText={(text) => updateForm('teamSize', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}
          
          {/* Maximum Participants */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Maximum {formData.participationType === 'team' ? 'Teams' : 'Participants'} *
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="people-circle-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder={`Enter maximum ${formData.participationType === 'team' ? 'teams' : 'participants'}`}
                placeholderTextColor="#6b7280"
                value={formData.maxParticipants}
                onChangeText={(text) => updateForm('maxParticipants', text)}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          {/* Date & Time */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Date & Time *
            </Text>
            <View className="flex-row space-x-2">
              <View className="flex-1 bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name="calendar-outline" size={20} color="#374151" />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6b7280"
                  value={formData.date}
                  onChangeText={handleDateChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              <View className="flex-1 bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name="time-outline" size={20} color="#374151" />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="HH:MM"
                  placeholderTextColor="#6b7280"
                  value={formData.time}
                  onChangeText={handleTimeChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>
          </View>
          
          {/* Duration */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Duration (hours) *
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="hourglass-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="Enter duration in hours"
                placeholderTextColor="#6b7280"
                value={formData.duration}
                onChangeText={(text) => updateForm('duration', text)}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          {/* Fee Amount & Type */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Fee Details *
            </Text>
            <View className="mb-3 bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Text className="text-gray-700 font-bold text-lg">₹</Text>
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="Enter fee amount"
                placeholderTextColor="#6b7280"
                value={formData.feeAmount}
                onChangeText={(text) => updateForm('feeAmount', text)}
                keyboardType="numeric"
              />
            </View>
            
            <Text className="text-white font-semibold mb-2">Fee Type</Text>
            <View className="flex-row flex-wrap">
              {feeTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => selectFeeType(type)}
                  className={`rounded-lg py-2 px-3 mr-2 mb-2 border ${
                    formData.feeType === type
                      ? "bg-green-600 border-green-500"
                      : "bg-sky-100 border-gray-300"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm ${
                      formData.feeType === type
                        ? "text-white font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {type === 'per_person' ? 'Per Person' : 
                     type === 'per_team' ? 'Per Team' : 'Total (Fixed)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-blue-300 rounded-xl py-4 mb-6 shadow-lg"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-black font-bold text-lg mr-2">
                Create Event
              </Text>
              <Ionicons name="checkmark-circle-outline" size={24} color="black" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}