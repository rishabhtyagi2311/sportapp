// app/(venue)/eventManager/editEvent/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useBookingStore } from '@/store/venueStore';

// Define event type options
type EventType = 'tournament' | 'practice' | 'friendly' | 'training' | 'league';
type ParticipationType = 'individual' | 'team';
type FeeType = 'per_person' | 'per_team' | 'total';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEventById, updateEvent, venues, sports } = useBookingStore();
  
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
    currentParticipants: '0',
    date: '',
    time: '',
    duration: '',
    feeAmount: '',
    feeType: '',
    status: '',
    registrationDays: '7',
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
  
  // Status options
  const statusOptions = ['upcoming', 'ongoing', 'completed', 'cancelled'];
  
  useEffect(() => {
    if (!id) return;
    
    const event = getEventById(id);
    if (!event) {
      Alert.alert('Error', 'Event not found');
      router.push('/eventManager/profile');
      return;
    }
    
    // Format date and time
    const eventDateTime = new Date(event.dateTime);
    const formattedDate = `${eventDateTime.getFullYear()}-${String(eventDateTime.getMonth() + 1).padStart(2, '0')}-${String(eventDateTime.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(eventDateTime.getHours()).padStart(2, '0')}:${String(eventDateTime.getMinutes()).padStart(2, '0')}`;
    
    // Calculate days before event for registration deadline
    const eventDate = new Date(event.dateTime);
    const deadlineDate = new Date(event.registrationDeadline);
    const diffTime = Math.abs(eventDate.getTime() - deadlineDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Fill form with event data
    setFormData({
      name: event.name,
      description: event.description || '',
      venueId: event.venueId,
      sportId: event.sport.id,
      eventType: event.eventType,
      participationType: event.participationType,
      teamSize: event.teamSize?.toString() || '',
      maxParticipants: event.maxParticipants.toString(),
      currentParticipants: event.currentParticipants.toString(),
      date: formattedDate,
      time: formattedTime,
      duration: event.duration.toString(),
      feeAmount: event.fees.amount.toString(),
      feeType: event.fees.type,
      status: event.status,
      registrationDays: diffDays.toString(),
    });
  }, [id, getEventById]);
  
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
  
  // Handle status selection
  const selectStatus = (status: string) => {
    updateForm('status', status);
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
    if (!formData.status) {
      Alert.alert('Error', 'Please select event status');
      return false;
    }
    
    return true;
  };
  
  const handleUpdateEvent = () => {
    if (!validateForm() || !id) return;
    
    try {
      // Parse date and time
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      const eventDateTime = new Date(year, month - 1, day, hours, minutes);
      
      if (isNaN(eventDateTime.getTime())) {
        Alert.alert('Error', 'Invalid date or time format');
        return;
      }
      
      // Calculate registration deadline (days before event)
      const deadlineDate = new Date(eventDateTime);
      deadlineDate.setDate(deadlineDate.getDate() - parseInt(formData.registrationDays));
      
      // Create or find sport object
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
      
      const eventUpdate = {
        name: formData.name,
        description: formData.description,
        eventType: formData.eventType as EventType,
        sport: sportForEvent,
        venueId: formData.venueId,
        participationType: formData.participationType as ParticipationType,
        teamSize: formData.participationType === 'team' ? parseInt(formData.teamSize) : undefined,
        maxParticipants: parseInt(formData.maxParticipants),
        currentParticipants: parseInt(formData.currentParticipants),
        dateTime: eventDateTime.toISOString(),
        duration: parseFloat(formData.duration),
        fees: {
          amount: parseFloat(formData.feeAmount),
          currency: 'INR' as const,
          type: formData.feeType as FeeType,
        },
        status: formData.status as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
        registrationDeadline: deadlineDate.toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      updateEvent(id, eventUpdate);
      Alert.alert('Success', 'Event updated successfully');
      router.push('/eventManager/profile');
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert('Error', 'Failed to update event. Please check your inputs.');
    }
  };
  
  // Handler for back button
  const handleGoBack = () => {
    router.back();
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="w-full h-full bg-slate-900">
        {/* Header */}
        <View className="px-6 py-4 border-b border-white flex-row items-center mt-4">
          <TouchableOpacity
            className="mr-4"
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            Edit Event
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
          
          {/* Venue */}
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
          
          {/* Sport */}
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
          
          {/* Event Status */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Event Status *
            </Text>
            <View className="flex-row flex-wrap mb-3">
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => selectStatus(status)}
                  className={`rounded-lg px-3 py-2 mr-2 mb-2 border ${
                    formData.status === status
                      ? status === 'upcoming' ? "bg-green-600 border-green-500" :
                        status === 'ongoing' ? "bg-blue-600 border-blue-500" :
                        status === 'completed' ? "bg-gray-600 border-gray-500" : 
                        "bg-red-600 border-red-500"
                      : "bg-sky-100 border-gray-300"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm ${
                      formData.status === status
                        ? "text-white font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
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
          
          {/* Maximum & Current Participants */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Participants *
            </Text>
            <View className="flex-row space-x-2">
              <View className="flex-1 bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name="people-circle-outline" size={20} color="#374151" />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="Maximum"
                  placeholderTextColor="#6b7280"
                  value={formData.maxParticipants}
                  onChangeText={(text) => updateForm('maxParticipants', text)}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1 bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
                <Ionicons name="person-add-outline" size={20} color="#374151" />
                <TextInput
                  className="flex-1 text-black py-4 px-3 text-base"
                  placeholder="Current"
                  placeholderTextColor="#6b7280"
                  value={formData.currentParticipants}
                  onChangeText={(text) => updateForm('currentParticipants', text)}
                  keyboardType="numeric"
                />
              </View>
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
          
          {/* Registration Deadline */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Registration Deadline
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="alarm-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="Days before event"
                placeholderTextColor="#6b7280"
                value={formData.registrationDays}
                onChangeText={(text) => updateForm('registrationDays', text)}
                keyboardType="numeric"
              />
              <Text className="text-gray-700 ml-2">days</Text>
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleUpdateEvent}
            className="bg-blue-300 rounded-xl py-4 mb-6 shadow-lg"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-black font-bold text-lg mr-2">
                Update Event
              </Text>
              <Ionicons name="checkmark-circle-outline" size={24} color="black" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}