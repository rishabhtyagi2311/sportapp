// app/(venue)/eventManager/dashboard.tsx

import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEventManagerStore } from '@/store/eventManagerStore'
import { Event } from '@/types/booking'

type TabKey = 'upcoming' | 'completed'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming Events' },
  { key: 'completed', label: 'Completed Events' },
]

export default function EventManagerDashboard() {
  const { managedEvents } = useEventManagerStore()
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming')

  /* ---------- FILTER EVENTS ---------- */
  const filteredEvents = useMemo(() => {
    return managedEvents.filter((event) =>
      activeTab === 'upcoming'
        ? event.status !== 'completed' && event.status !== 'cancelled'
        : event.status === 'completed' || event.status === 'cancelled'
    )
  }, [managedEvents, activeTab])

  /* ---------- RENDER CARD ---------- */
  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      // FIXED: Passing eventId so the next screen knows which event to load
      onPress={() => router.push({
        pathname: '/(EventManagement)/requestListScreen', // Ensure this matches your file name
        params: { eventId: item.id }
      })}
      className="bg-white rounded-xl p-5 mb-4 border border-gray-200 shadow-sm"
    >
      {/* Title & Status */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-lg font-bold text-slate-900">
            {item.name}
          </Text>
          <Text className="text-sm text-slate-600">
            {item.sport.name}
          </Text>
        </View>

        <View
          className={`px-3 py-1 rounded-full ${
            item.status === 'upcoming'
              ? 'bg-green-100'
              : 'bg-gray-200'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              item.status === 'upcoming'
                ? 'text-green-700'
                : 'text-gray-700'
            }`}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Meta */}
      <View className="flex-row items-center justify-between mt-3">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text className="text-sm text-slate-600 ml-2">
            {new Date(item.dateTime).toLocaleDateString('en-IN')}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="people-outline" size={14} color="#64748b" />
          <Text className="text-sm text-slate-600 ml-2">
            {item.currentParticipants}/{item.maxParticipants}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* ---------- HEADER (Settings Button Restored) ---------- */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-slate-900">
              Event Manager
            </Text>
            <Text className="text-sm text-slate-600">
              Manage your created events
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/eventManager/settings')}
            className="bg-gray-100 p-3 rounded-lg"
          >
            <Ionicons name="settings-outline" size={22} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- TABS ---------- */}
      <View className="flex-row bg-white border-b border-gray-200">
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 py-4 items-center border-b-2 ${
              activeTab === tab.key
                ? 'border-green-600'
                : 'border-transparent'
            }`}
          >
            <Text
              className={`font-semibold ${
                activeTab === tab.key
                  ? 'text-green-700'
                  : 'text-slate-500'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ---------- LIST ---------- */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center mt-24">
            <Ionicons
              name="calendar-outline"
              size={48}
              color="#cbd5e1"
            />
            <Text className="text-slate-500 text-lg font-semibold mt-4">
              No events found
            </Text>
            <Text className="text-slate-400 text-sm mt-1">
              Create your first event to get started
            </Text>
          </View>
        }
      />

      {/* ---------- FAB (Restored to Bottom Right) ---------- */}
      <TouchableOpacity
        onPress={() => router.push('/(EventManagement)/selectEventType')}
        className="absolute right-6 bottom-6 bg-green-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}