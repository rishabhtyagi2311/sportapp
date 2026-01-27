// screens/RequestDetailsScreen.tsx

import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  
  StatusBar,
  Alert,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

// STORES
import {
  useRegistrationRequestStore,
  RegistrationRequest,
} from '@/store/eventRegistrationRequestStore'
import { useEventManagerStore } from '@/store/eventManagerStore'

const RequestDetailsScreen: React.FC = () => {
  const router = useRouter()
  const { requestId, eventId } = useLocalSearchParams<{
    requestId: string
    eventId: string
  }>()

  const { getRequestById, updateRequestStatus } =
    useRegistrationRequestStore()
  const { managedEvents, updateEvent } = useEventManagerStore()

  const request = getRequestById(requestId!)
  const event = managedEvents.find((e) => e.id === eventId)

  const [isProcessing, setIsProcessing] = useState(false)
  const [notes, setNotes] = useState('')
  const [showNotesInput, setShowNotesInput] = useState(false)

  const managerId = 'manager-123'

  if (!request || !event) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600 text-lg">
            Request or Event not found
          </Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text className="text-blue-600">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  /* ---------------- DOMAIN CHECK ---------------- */

  const isFootballTournament = request.domain === 'football_tournament'
  const isRegularTeam =
    request.domain === 'regular' &&
    request.participationType === 'team'

  /* ---------------- HELPERS ---------------- */

  const getDisplayTitle = () => {
    if (isFootballTournament) return 'Football Tournament Registration'
    if (isRegularTeam) return 'Team Registration'
    return 'Individual Registration'
  }

  const getPrimaryName = () => {
    if (isFootballTournament) return request.teamName
    if (isRegularTeam) return request.teamName
    return request.participantName
  }

  const getSlotCount = () => {
    if (isFootballTournament) return 1
    if (isRegularTeam) return request.teamSize
    return 1
  }

  /* ---------------- ACCEPT ---------------- */

  const handleAccept = () => {
    const addCount = getSlotCount()
    const newTotal = event.currentParticipants + addCount

    if (newTotal > event.maxParticipants) {
      Alert.alert(
        'Capacity Full',
        `Only ${
          event.maxParticipants - event.currentParticipants
        } slots remaining`
      )
      return
    }

    Alert.alert(
      'Accept Registration',
      `Accept "${getPrimaryName()}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            setIsProcessing(true)

            setTimeout(() => {
              updateRequestStatus(
                request.id,
                'accepted',
                managerId,
                notes || undefined
              )

              updateEvent(event.id, {
                currentParticipants: newTotal,
              })

              setIsProcessing(false)
              Alert.alert('Success', 'Registration accepted', [
                { text: 'OK', onPress: () => router.back() },
              ])
            }, 400)
          },
        },
      ]
    )
  }

  /* ---------------- REJECT ---------------- */

  const handleReject = () => {
    Alert.alert(
      'Reject Registration',
      `Reject "${getPrimaryName()}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => setShowNotesInput(true),
        },
      ]
    )
  }

  const confirmReject = () => {
    setIsProcessing(true)

    setTimeout(() => {
      updateRequestStatus(
        request.id,
        'rejected',
        managerId,
        notes || 'No reason provided'
      )

      setIsProcessing(false)
      Alert.alert('Success', 'Registration rejected', [
        { text: 'OK', onPress: () => router.back() },
      ])
    }, 400)
  }

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#475569" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900">
            {getDisplayTitle()}
          </Text>
          <Text className="text-sm text-slate-600" numberOfLines={1}>
            {event.name}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        <View className="bg-white rounded-xl p-4 border border-gray-200">
          <Text className="text-slate-500 text-sm">Applicant</Text>
          <Text className="text-lg font-bold text-slate-900 mt-1">
            {getPrimaryName()}
          </Text>

          {isFootballTournament && (
            <Text className="text-sm text-slate-600 mt-1">
              Captain: {request.captainName}
            </Text>
          )}
        </View>

        {/* Rejection Notes */}
        {showNotesInput && (
          <View className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <Text className="text-red-900 font-semibold mb-2">
              Rejection Reason
            </Text>
            <TextInput
              className="bg-white border border-red-300 rounded-lg px-4 py-3 mb-3"
              placeholder="Enter reason"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowNotesInput(false)}
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
              >
                <Text className="font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmReject}
                className="flex-1 bg-red-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ACTIONS */}
      {request.status === 'pending' && !showNotesInput && (
        <View className="bg-white border-t border-gray-200 px-6 py-4">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleReject}
              className="flex-1 border border-red-300 py-4 rounded-xl items-center"
            >
              <Text className="text-red-600 font-bold">Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAccept}
              className="flex-1 bg-green-600 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold">
                Accept
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default RequestDetailsScreen
