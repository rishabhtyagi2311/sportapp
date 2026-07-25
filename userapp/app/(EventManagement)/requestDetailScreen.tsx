// screens/RequestDetailsScreen.tsx

import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

// STORES
import { useRegistrationRequestStore } from '@/store/eventRegistrationRequestStore'
import { useEventManagerStore } from '@/store/eventManagerStore'

const RequestDetailsScreen: React.FC = () => {
  const router = useRouter()
  const { requestId, eventId } = useLocalSearchParams<{
    requestId: string
    eventId: string
  }>()

  const { getRegistrationsByEvent, fetchRegistrationsForEvent, processRegistration } =
    useRegistrationRequestStore()
  const { getEventById, fetchEventById } = useEventManagerStore()

  useFocusEffect(
    useCallback(() => {
      if (!eventId) return
      fetchEventById(eventId)
      fetchRegistrationsForEvent(eventId)
    }, [eventId])
  )

  const request = getRegistrationsByEvent(eventId!).find((r) => r.id === requestId)
  const event = getEventById(eventId!)

  const [isProcessing, setIsProcessing] = useState(false)
  const [notes, setNotes] = useState('')
  const [showNotesInput, setShowNotesInput] = useState(false)

  if (!request || !event) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      </SafeAreaView>
    )
  }

  /* ---------------- HELPERS ---------------- */

  const isTeamRegistration = !!request.footballTeamId

  const getDisplayTitle = () => {
    return isTeamRegistration ? 'Team Registration' : 'Individual Registration'
  }

  const getPrimaryName = () => {
    return request.teamName || request.registrantName || 'Registration'
  }

  /* ---------------- ACCEPT ---------------- */

  const handleAccept = () => {
    Alert.alert(
      'Accept Registration',
      `Accept "${getPrimaryName()}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setIsProcessing(true)
            try {
              await processRegistration(eventId!, request.id, { status: 'accepted', notes: notes || undefined })
              Alert.alert('Success', 'Registration accepted', [
                { text: 'OK', onPress: () => router.back() },
              ])
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not accept registration')
            } finally {
              setIsProcessing(false)
            }
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

  const confirmReject = async () => {
    setIsProcessing(true)
    try {
      await processRegistration(eventId!, request.id, {
        status: 'rejected',
        notes: notes || 'No reason provided',
      })
      Alert.alert('Success', 'Registration rejected', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not reject registration')
    } finally {
      setIsProcessing(false)
    }
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
                disabled={isProcessing}
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
              >
                <Text className="font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmReject}
                disabled={isProcessing}
                className="flex-1 bg-red-600 py-3 rounded-lg items-center"
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold">Confirm</Text>
                )}
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
              disabled={isProcessing}
              className="flex-1 border border-red-300 py-4 rounded-xl items-center"
            >
              <Text className="text-red-600 font-bold">Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAccept}
              disabled={isProcessing}
              className="flex-1 bg-green-600 py-4 rounded-xl items-center"
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold">Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default RequestDetailsScreen
