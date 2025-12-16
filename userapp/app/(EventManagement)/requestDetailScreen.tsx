// screens/RequestDetailsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// STORES
import { useRegistrationRequestStore, RegistrationRequest } from '@/store/eventRegistrationRequestStore';
// 🛑 FIXED: Remove BookingStore, use EventManagerStore for source of truth
import { useEventManagerStore } from '@/store/eventManagerStore';

const RequestDetailsScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const requestId = params.requestId as string;
  const eventId = params.eventId as string;

  const { getRequestById, updateRequestStatus } = useRegistrationRequestStore();
  
  // 🛑 FIXED: Fetch event from Managed Store
  const { managedEvents, updateEvent } = useEventManagerStore();
  
  const request = getRequestById(requestId) as RegistrationRequest | undefined;
  const event = managedEvents.find(e => e.id === eventId); // Find within managed events

  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  // Mock manager ID
  const managerId = 'manager-123';

  if (!request || !event) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600 text-lg">Request or Event not found</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4">
             <Text className="text-blue-600">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Helper for type narrowing
  const isTeam = request.participationType === 'team';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' };
      case 'accepted':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' };
      case 'rejected':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', dot: 'bg-gray-500' };
    }
  };

  /* ---------------- LOGIC: ACCEPT REQUEST ---------------- */
  const handleAccept = () => {
    // 1. Calculate new participants
    const addCount = isTeam ? request.teamSize : 1;
    const newTotal = event.currentParticipants + addCount;

    // 2. Validation: Check Capacity
    if (newTotal > event.maxParticipants) {
      Alert.alert(
        'Capacity Full',
        `Cannot accept this request. It requires ${addCount} spots, but only ${event.maxParticipants - event.currentParticipants} are available.`
      );
      return;
    }

    Alert.alert(
      'Accept Registration',
      `Accept ${isTeam ? `team "${request.teamName}"` : request.participantName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            setIsProcessing(true);
            
            setTimeout(() => {
              // 3. Update Request Status
              updateRequestStatus(requestId, 'accepted', managerId, notes || undefined);

              // 4. Update Event Participant Count (Syncs Manager & Public Store)
              updateEvent(event.id, {
                 currentParticipants: newTotal
              });

              setIsProcessing(false);
              Alert.alert('Success', 'Registration accepted', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            }, 500);
          },
        },
      ]
    );
  };

  /* ---------------- LOGIC: REJECT REQUEST ---------------- */
  const handleReject = () => {
    Alert.alert(
      'Reject Registration',
      `Reject ${isTeam ? `team "${request.teamName}"` : request.participantName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => setShowNotesInput(true),
        },
      ]
    );
  };

  const confirmReject = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Update status to rejected
      updateRequestStatus(requestId, 'rejected', managerId, notes || 'No reason provided');
      
      setIsProcessing(false);
      Alert.alert('Success', 'Registration rejected', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 500);
  };

  const statusColor = getStatusColor(request.status);

  /* ---------------- UI RENDER ---------------- */
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#475569" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900">
            {isTeam ? 'Team Registration' : 'Individual Registration'}
          </Text>
          <Text className="text-sm text-slate-600" numberOfLines={1}>{event.name}</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Status Card */}
        <View className={`m-6 p-5 rounded-xl border ${statusColor.bg} ${statusColor.border}`}>
          <View className="flex-row items-center mb-3">
            <View className={`w-3 h-3 rounded-full mr-3 ${statusColor.dot}`} />
            <Text className={`font-bold text-base capitalize ${statusColor.text}`}>
              {request.status}
            </Text>
          </View>
          <Text className={`text-sm ${statusColor.text}`}>
            {request.status === 'pending'
              ? 'Waiting for your action'
              : request.status === 'accepted'
              ? 'Registration accepted'
              : 'Registration rejected'}
          </Text>
          {request.processedAt && (
            <Text className={`text-xs ${statusColor.text} mt-2`}>
              Processed on{' '}
              {new Date(request.processedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          )}
        </View>

        {/* ... (Rest of the UI for details, submission info, etc. remains exactly as provided) ... */}
        {/* ... Paste the rest of your ScrollView content here ... */}
        
        {/* Simplified View for brevity, assumes standard details render */}
        <View className="mx-6 mb-6">
             {/* Render Participant/Team details here */}
             <Text className="text-slate-500">
                {isTeam ? `Team: ${request.teamName}` : `Participant: ${request.participantName}`}
             </Text>
        </View>

        {/* Rejection Notes Input */}
        {showNotesInput && (
          <View className="mx-6 mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <Text className="text-red-900 font-semibold mb-3">Rejection Reason</Text>
            <TextInput
              className="bg-white border border-red-300 rounded-lg px-4 py-3 text-slate-900 mb-3"
              placeholder="Enter reason for rejection"
              placeholderTextColor="#94a3b8"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowNotesInput(false)}
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmReject}
                disabled={isProcessing}
                className="flex-1 bg-red-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Action Buttons */}
      {request.status === 'pending' && !showNotesInput && (
        <View className="bg-white border-t border-gray-200 px-6 py-4 shadow-sm">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleReject}
              disabled={isProcessing}
              className="flex-1 bg-white border border-red-200 py-4 rounded-xl items-center"
            >
              <Text className="text-red-600 text-base font-bold">Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAccept}
              disabled={isProcessing}
              className="flex-1 bg-green-600 py-4 rounded-xl items-center"
            >
              <Text className="text-white text-base font-bold">
                {isProcessing ? 'Processing...' : 'Accept Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default RequestDetailsScreen;