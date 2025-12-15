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
import { useRegistrationRequestStore, RegistrationRequest } from '@/store/eventRegistrationRequestStore';
import { useBookingStore } from '@/store/venueStore';

const RequestDetailsScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const requestId = params.requestId as string;
  const eventId = params.eventId as string;

  const { getRequestById, updateRequestStatus } = useRegistrationRequestStore();
  const { getEventById } = useBookingStore();

  const request = getRequestById(requestId) as RegistrationRequest | undefined;
  const event = getEventById(eventId);

  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  // Mock manager ID - replace with actual user ID from auth
  const managerId = 'manager-123';

  if (!request || !event) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600 text-lg">Request not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isTeamRequest = 'teamName' in request;

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

  const handleAccept = () => {
    Alert.alert(
      'Accept Registration',
      `Are you sure you want to accept ${isTeamRequest ? `team "${request.teamName}"` : `${request.participantName}`}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            setIsProcessing(true);
            setTimeout(() => {
              updateRequestStatus(requestId, 'accepted', managerId, notes || undefined);
              setIsProcessing(false);
              Alert.alert('Success', 'Registration accepted successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            }, 1000);
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Registration',
      `Are you sure you want to reject ${isTeamRequest ? `team "${request.teamName}"` : `${request.participantName}`}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setShowNotesInput(true);
          },
        },
      ]
    );
  };

  const confirmReject = () => {
    setIsProcessing(true);
    setTimeout(() => {
      updateRequestStatus(requestId, 'rejected', managerId, notes || 'No reason provided');
      setIsProcessing(false);
      Alert.alert('Success', 'Registration rejected', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 1000);
  };

  const statusColor = getStatusColor(request.status);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#475569" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900">
            {isTeamRequest ? 'Team Registration' : 'Individual Registration'}
          </Text>
          <Text className="text-sm text-slate-600">{event.name}</Text>
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

        {/* Registration Details */}
        <View className="mx-6 mb-6">
          {isTeamRequest ? (
            <>
              {/* Team Details */}
              <View className="bg-white rounded-xl p-5 mb-4 border border-gray-200">
                <Text className="text-lg font-bold text-slate-900 mb-4">Team Details</Text>

                <View className="mb-4">
                  <Text className="text-slate-600 text-sm mb-1">Team Name</Text>
                  <Text className="text-slate-900 text-base font-semibold">
                    {request.teamName}
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-slate-600 text-sm mb-1">Team Size</Text>
                  <Text className="text-slate-900 text-base font-semibold">
                    {request.teamSize} Players
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-slate-600 text-sm mb-1">Captain Contact</Text>
                  <Text className="text-slate-900 text-base font-semibold">
                    {request.captainContact}
                  </Text>
                </View>

                <View>
                  <Text className="text-slate-600 text-sm mb-1">Captain Email</Text>
                  <Text className="text-slate-900 text-base font-semibold">
                    {request.captainEmail}
                  </Text>
                </View>
              </View>

              {/* Team Members */}
              <View className="bg-white rounded-xl p-5 border border-gray-200">
                <Text className="text-lg font-bold text-slate-900 mb-4">Team Members</Text>

                {request.teamMembers.map((member, index) => (
                  <View key={member.id} className="mb-4 last:mb-0">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-semibold text-slate-900">
                        Player {index + 1}
                      </Text>
                      {index === request.teamMembers.length - 1 && <></>}
                    </View>

                    <View className="mb-2">
                      <Text className="text-slate-600 text-sm mb-1">Name</Text>
                      <Text className="text-slate-900 font-medium">{member.name}</Text>
                    </View>

                    <View>
                      <Text className="text-slate-600 text-sm mb-1">Contact</Text>
                      <Text className="text-slate-900 font-medium">{member.contact}</Text>
                    </View>

                    {index < request.teamMembers.length - 1 && (
                      <View className="border-b border-gray-200 mt-3" />
                    )}
                  </View>
                ))}
              </View>
            </>
          ) : (
            /* Individual Details */
            <View className="bg-white rounded-xl p-5 border border-gray-200">
              <Text className="text-lg font-bold text-slate-900 mb-4">
                Participant Details
              </Text>

              <View className="mb-4">
                <Text className="text-slate-600 text-sm mb-1">Full Name</Text>
                <Text className="text-slate-900 text-base font-semibold">
                  {request.participantName}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-slate-600 text-sm mb-1">Contact Number</Text>
                <Text className="text-slate-900 text-base font-semibold">
                  {request.contact}
                </Text>
              </View>

              <View>
                <Text className="text-slate-600 text-sm mb-1">Email Address</Text>
                <Text className="text-slate-900 text-base font-semibold">
                  {request.email}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Submission Info */}
        <View className="mx-6 mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={18} color="#2563eb" />
            <Text className="text-blue-900 font-semibold ml-2">Submission Details</Text>
          </View>
          <Text className="text-blue-800 text-sm">
            Submitted on{' '}
            {new Date(request.submittedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Notes Section */}
        {request.notes && (
          <View className="mx-6 mb-6 bg-gray-100 rounded-xl p-4">
            <Text className="text-slate-900 font-semibold mb-2">Manager Notes</Text>
            <Text className="text-slate-700 text-sm">{request.notes}</Text>
          </View>
        )}

        {/* Rejection Notes Input */}
        {showNotesInput && (
          <View className="mx-6 mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <Text className="text-red-900 font-semibold mb-3">Rejection Reason</Text>
            <TextInput
              className="bg-white border border-red-300 rounded-lg px-4 py-3 text-slate-900 mb-3"
              placeholder="Enter reason for rejection (optional)"
              placeholderTextColor="#94a3b8"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowNotesInput(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmReject}
                disabled={isProcessing}
                className="flex-1 bg-red-600 py-2 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">
                  {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons - Only show if pending */}
      {request.status === 'pending' && !showNotesInput && (
        <View className="bg-white border-t border-gray-200 px-6 py-4">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleReject}
              disabled={isProcessing}
              className="flex-1 bg-red-600 py-4 rounded-xl items-center"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <Ionicons name="close-circle" size={20} color="white" />
                <Text className="text-white text-base font-bold ml-2">Reject</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAccept}
              disabled={isProcessing}
              className="flex-1 bg-green-600 py-4 rounded-xl items-center"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text className="text-white text-base font-bold ml-2">
                  {isProcessing ? 'Processing...' : 'Accept'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default RequestDetailsScreen;