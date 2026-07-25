import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { KeyboardAvoidingView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

// STORES
import { useRegistrationRequestStore } from '@/store/eventRegistrationRequestStore'
import { useEventManagerStore } from '@/store/eventManagerStore'

// TYPES
import { EventRegistration } from '@/types/event'

type FilterKey = 'pending' | 'accepted' | 'rejected'

const EventRegistrationRequestsScreen: React.FC = () => {
  const router = useRouter()
  const { eventId } = useLocalSearchParams<{ eventId: string }>()

  const { getEventById, fetchEventById, deleteEvent } = useEventManagerStore()
  const {
    getRegistrationsByEvent,
    getEventStats,
    fetchRegistrationsForEvent,
    isLoading,
  } = useRegistrationRequestStore()

  const [activeFilter, setActiveFilter] = useState<FilterKey>('pending')

  const event = getEventById(eventId!)
  const requests = getRegistrationsByEvent(eventId!)
  const stats = getEventStats(eventId!)

  useFocusEffect(
    useCallback(() => {
      if (!eventId) return
      fetchEventById(eventId)
      fetchRegistrationsForEvent(eventId)
    }, [eventId])
  )

  if (!event) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        {isLoading ? (
          <ActivityIndicator size="large" color="#0f172a" />
        ) : (
          <>
            <Text className="text-slate-500">Event not found</Text>
            <TouchableOpacity onPress={() => router.back()} className="mt-4">
              <Text className="text-blue-600">Go Back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    )
  }

  const filteredRequests = requests.filter(
    (r) => r.status === activeFilter
  )

  const acceptedTeamCount = requests.filter(
    (r) => r.status === 'accepted' && !!r.footballTeamId
  ).length

  /* ---------------- ACTIONS ---------------- */

  const handleCreateTournament = () => {
    if (acceptedTeamCount < 2) {
      Alert.alert(
        'Not Enough Teams',
        'You need at least 2 accepted team registrations before you can create a tournament.'
      )
      return
    }

    if (event.tournamentFormat === 'knockout') {
      router.push({
        pathname: '/(football)/startKnockOutTournament/step1',
        params: { eventId: event.id },
      })
    } else {
      router.push({
        pathname: '/(football)/startTournament/createTournament',
        params: { eventId: event.id },
      })
    }
  }

  const handleDeleteEvent = () => {
    Alert.alert(
      'Delete Event',
      'This will permanently delete the event and all associated requests.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(event.id)
              router.back()
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not delete event')
            }
          },
        },
      ]
    )
  }

  /* ---------------- HELPERS ---------------- */

  const getRequestTitle = (req: EventRegistration) => {
    return req.teamName || req.registrantName || 'Registration'
  }

  const getRequestSubtitle = (req: EventRegistration) => {
    return req.footballTeamId ? 'Team registration' : 'Individual registration'
  }

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
    <KeyboardAvoidingView className="flex-1" behavior="padding">
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#475569" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>
            {event.name}
          </Text>
          <Text className="text-sm text-slate-600">Event Management</Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push(`/(EventManagement)/editEvent/${event.id}`)
          }
          className="mr-4"
        >
          <Ionicons name="create-outline" size={22} color="#16a34a" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDeleteEvent}>
          <Ionicons name="trash-outline" size={22} color="#dc2626" />
        </TouchableOpacity>
      </View>

      {/* EVENT SUMMARY */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row justify-between mb-2">
          <Text className="text-slate-700 font-semibold">
            {event.sportName}
          </Text>
          <Text className="text-slate-500 text-sm">
            {new Date(event.dateTime).toLocaleDateString('en-IN')}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-slate-600 text-sm">
            {event.currentParticipants}/{event.maxParticipants} participants
          </Text>
          <Text className="text-green-700 font-semibold">
            ₹{event.feeAmount}
          </Text>
        </View>
      </View>

      {/* STATS */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row justify-around">
        <Stat label="Pending" value={stats.pending} color="text-yellow-600" />
        <Stat label="Accepted" value={stats.accepted} color="text-green-600" />
        <Stat label="Rejected" value={stats.rejected} color="text-red-600" />
      </View>

      {/* CREATE TOURNAMENT — football-tournament events only */}
      {event.eventType === 'footballtournament' && (
        <View className="bg-white px-6 pb-4 border-b border-gray-200">
          <TouchableOpacity
            onPress={handleCreateTournament}
            className="bg-green-600 rounded-xl py-3 flex-row items-center justify-center"
          >
            <Ionicons name="trophy-outline" size={18} color="white" />
            <Text className="text-white font-bold ml-2">
              Create Tournament ({acceptedTeamCount} team{acceptedTeamCount === 1 ? '' : 's'} accepted)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FILTER TABS */}
      <View className="bg-white px-6 flex-row border-b border-gray-200">
        {(['pending', 'accepted', 'rejected'] as const).map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveFilter(key)}
            className={`py-4 mr-6 border-b-2 ${
              activeFilter === key
                ? 'border-green-600'
                : 'border-transparent'
            }`}
          >
            <Text
              className={`font-semibold capitalize ${
                activeFilter === key
                  ? 'text-green-700'
                  : 'text-slate-500'
              }`}
            >
              {key}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* REQUEST LIST */}
      <ScrollView className="px-6 py-4">
        {filteredRequests.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          filteredRequests.map((req) => (
            <TouchableOpacity
              key={req.id}
              onPress={() =>
                router.push({
                  pathname: '/(EventManagement)/requestDetailScreen',
                  params: { requestId: req.id, eventId: event.id },
                })
              }
              className="bg-white p-4 rounded-xl border border-gray-200 mb-3 shadow-sm"
            >
              <Text className="font-bold text-slate-900 text-base">
                {getRequestTitle(req)}
              </Text>
              <Text className="text-sm text-slate-600 mt-1">
                {getRequestSubtitle(req)}
              </Text>

              <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <Text className="text-xs text-slate-400">
                  {new Date(req.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#94a3b8"
                />
              </View>
            </TouchableOpacity>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

/* ---------------- SMALL COMPONENTS ---------------- */

const Stat = ({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) => (
  <View className="items-center">
    <Text className={`text-xl font-bold ${color}`}>{value}</Text>
    <Text className="text-xs text-slate-600 mt-1">{label}</Text>
  </View>
)

const EmptyState = ({ filter }: { filter: string }) => (
  <View className="items-center mt-12 opacity-70">
    <View className="bg-gray-100 p-4 rounded-full mb-4">
      <Ionicons name="document-text-outline" size={32} color="#94a3b8" />
    </View>
    <Text className="text-slate-600 font-semibold text-lg capitalize">
      No {filter} Requests
    </Text>
    <Text className="text-slate-400 text-sm text-center px-10 mt-1">
      Requests that are {filter} will appear here.
    </Text>
  </View>
)

export default EventRegistrationRequestsScreen
