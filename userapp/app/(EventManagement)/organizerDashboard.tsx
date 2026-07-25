// app/(venue)/eventManager/dashboard.tsx

import React, { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,

} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { useEventManagerStore } from '@/store/eventManagerStore'
import { EventItem } from '@/types/event'

type TabKey = 'upcoming' | 'completed'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming Events' },
  { key: 'completed', label: 'Completed Events' },
]

export default function EventManagerDashboard() {
  const { myEvents, isLoading, fetchMyEvents } = useEventManagerStore()
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming')

  useFocusEffect(
    useCallback(() => {
      fetchMyEvents()
    }, [fetchMyEvents])
  )

  /* ---------- FILTER EVENTS ---------- */
  const filteredEvents = useMemo(() => {
    return myEvents.filter((event) =>
      activeTab === 'upcoming'
        ? event.status !== 'completed' && event.status !== 'cancelled'
        : event.status === 'completed' || event.status === 'cancelled'
    )
  }, [myEvents, activeTab])

  /* ---------- RENDER CARD ---------- */
  const renderEventCard = ({ item }: { item: EventItem }) => (
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
            {item.sportName}
          </Text>
        </View>

        <View
          className={`px-3 py-1 rounded-full ${item.status === 'upcoming'
              ? 'bg-green-100'
              : 'bg-gray-200'
            }`}
        >
          <Text
            className={`text-xs font-semibold ${item.status === 'upcoming'
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
      <View className="bg-slate-900 px-6 py-4 border-b border-gray-200">
        <View className="flex-row  items-center">
          <TouchableOpacity
            className="mr-4"
            onPress={() => router.navigate("/(homeScreenTabs)/profile")}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View >

            <Text className="text-2xl font-bold text-white">
              Event Manager
            </Text>
            
          </View>


        </View>
      </View>

      {/* ---------- TABS ---------- */}
      <View className="flex-row bg-white border-b border-gray-200">
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 py-4 items-center border-b-2 ${activeTab === tab.key
                ? 'border-green-600'
                : 'border-transparent'
              }`}
          >
            <Text
              className={`font-semibold ${activeTab === tab.key
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
      {isLoading && myEvents.length === 0 ? (
        <View className="items-center mt-24">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : (
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
      )}

      {/* ---------- FAB (Restored to Bottom Right) ---------- */}
      <TouchableOpacity
        onPress={() => router.push('/(EventManagement)/selectEventType')}
        className="absolute right-6 bottom-12 bg-slate-900 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}