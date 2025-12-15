import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,

  StatusBar,
  Alert,
} from 'react-native'
import { KeyboardAvoidingView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { useBookingStore } from '@/store/venueStore'
import { useRegistrationRequestStore } from '@/store/eventRegistrationRequestStore'
import { useEventManagerStore } from '@/store/eventManagerStore'

type FilterKey = 'pending' | 'accepted' | 'rejected'

const EventRegistrationRequestsScreen: React.FC = () => {
  const router = useRouter()
  const { eventId } = useLocalSearchParams<{ eventId: string }>()

  const { getEventById } = useBookingStore()
  const { deleteEvent } = useEventManagerStore()
  const { getRequestsByEvent, getEventStats } =
    useRegistrationRequestStore()

  const [activeFilter, setActiveFilter] =
    useState<FilterKey>('pending')

  const event = getEventById(eventId!)
  const requests = getRequestsByEvent(eventId!)
  const stats = getEventStats(eventId!)

  if (!event) {
    return (
      <KeyboardAvoidingView className="flex-1 items-center justify-center">
        <Text>Event not found</Text>
      </KeyboardAvoidingView>
    )
  }

  const filteredRequests = requests.filter(
    (r) => r.status === activeFilter
  )

  /* ---------------------------- ACTIONS ---------------------------- */

  const handleDeleteEvent = () => {
    Alert.alert(
      'Delete Event',
      'This will permanently delete the event and all requests.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteEvent(event.id)
            router.back()
          },
        },
      ]
    )
  }

  /* ---------------------------- UI ---------------------------- */

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#475569" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900">
            {event.name}
          </Text>
          <Text className="text-sm text-slate-600">
            Event Management
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push(`/eventManager/editEvent/${event.id}`)
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
            {event.sport.name}
          </Text>
          <Text className="text-slate-500 text-sm">
            {new Date(event.dateTime).toLocaleDateString('en-IN')}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-slate-600 text-sm">
            {event.currentParticipants}/{event.maxParticipants}{' '}
            participants
          </Text>
          <Text className="text-green-700 font-semibold">
            ₹{event.fees.amount}
          </Text>
        </View>
      </View>

      {/* STATS */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row justify-around">
        <Stat label="Pending" value={stats.pending} color="text-yellow-600" />
        <Stat label="Accepted" value={stats.accepted} color="text-green-600" />
        <Stat label="Rejected" value={stats.rejected} color="text-red-600" />
      </View>

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
                  pathname: '/organizer/request-details',
                  params: { requestId: req.id, eventId: event.id },
                })
              }
              className="bg-white p-4 rounded-xl border border-gray-200 mb-3"
            >
              <Text className="font-bold text-slate-900">
                {'teamName' in req ? req.teamName : req.participantName}
              </Text>
              <Text className="text-sm text-slate-600 mt-1">
                {'teamName' in req
                  ? `${req.teamSize} players`
                  : req.contact}
              </Text>

              <View className="flex-row justify-between items-center mt-3">
                <Text className="text-xs text-slate-500">
                  {new Date(req.submittedAt).toLocaleDateString('en-IN')}
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
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/* ---------------------------- SMALL COMPONENTS ---------------------------- */

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
  <View className="items-center mt-20">
    <Ionicons name="document-outline" size={48} color="#cbd5e1" />
    <Text className="text-slate-600 font-semibold mt-4">
      No {filter} requests
    </Text>
  </View>
)

export default EventRegistrationRequestsScreen
