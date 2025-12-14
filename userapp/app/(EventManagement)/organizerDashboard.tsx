// screens/OrganizerDashboardScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '@/store/venueStore';

interface DashboardTab {
  key: 'upcoming' | 'completed' | 'requests';
  label: string;
  icon: string;
}

const OrganizerDashboardScreen: React.FC = () => {
  const router = useRouter();
  const { events } = useBookingStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'requests'>('upcoming');

  // Mock organizer ID - replace with actual user ID from auth
  const organizerId = 'org-123';

  // Filter events by organizer and status
  const organizerEvents = events.filter((e) => e.creatorId === organizerId);
  const upcomingEvents = organizerEvents.filter((e) => e.status === 'upcoming');
  const completedEvents = organizerEvents.filter((e) => e.status === 'completed');

  const tabs: DashboardTab[] = [
    { key: 'upcoming', label: 'Upcoming Events', icon: 'calendar-outline' },
    { key: 'completed', label: 'Completed Events', icon: 'checkmark-done-outline' },
    { key: 'requests', label: 'Registration Requests', icon: 'clipboard-outline' },
  ];

  const renderEventCard = (event: any) => (
    <TouchableOpacity
      onPress={() => router.push(`/organizer/event/${event.id}`)}
      activeOpacity={0.7}
      className="bg-white rounded-xl p-5 mb-4 border border-gray-200 shadow-sm"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900 mb-1">{event.name}</Text>
          <Text className="text-sm text-slate-600">{event.sport.name}</Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            event.status === 'upcoming' ? 'bg-green-100' : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              event.status === 'upcoming' ? 'text-green-700' : 'text-gray-700'
            }`}
          >
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <Ionicons name="calendar" size={14} color="#64748b" />
        <Text className="text-sm text-slate-600 ml-2">
          {new Date(event.dateTime).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="people" size={14} color="#64748b" />
          <Text className="text-sm text-slate-600 ml-2">
            {event.currentParticipants}/{event.maxParticipants} registered
          </Text>
        </View>
        <View className="bg-blue-100 px-3 py-1 rounded-lg">
          <Text className="text-xs font-semibold text-blue-700">
            ₹{event.fees.amount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRequestsPreview = () => (
    <View>
      <View className="bg-white rounded-xl p-5 mb-4 border border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-slate-900">Recent Requests</Text>
          <TouchableOpacity
            onPress={() => router.push('/organizer/all-requests')}
            className="flex-row items-center"
          >
            <Text className="text-green-600 font-semibold text-sm mr-1">View All</Text>
            <Ionicons name="arrow-forward" size={16} color="#16a34a" />
          </TouchableOpacity>
        </View>

        <View className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <View className="items-center py-6">
              <Ionicons name="document-outline" size={32} color="#cbd5e1" />
              <Text className="text-slate-500 text-sm mt-2">No upcoming events</Text>
            </View>
          ) : (
            upcomingEvents.slice(0, 3).map((event) => (
              <TouchableOpacity
                key={event.id}
                onPress={() => router.push(`/organizer/event-requests/${event.id}`)}
                activeOpacity={0.7}
                className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold text-slate-900 mb-1">
                      {event.name}
                    </Text>
                    <Text className="text-xs text-slate-600">
                      {event.currentParticipants} participants registered
                    </Text>
                  </View>
                  <View className="bg-blue-600 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">
                      View Requests
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-slate-900">Organizer Hub</Text>
            <Text className="text-sm text-slate-600">Manage your events & registrations</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/organizer/settings')}
            className="bg-gray-100 p-3 rounded-lg"
          >
            <Ionicons name="settings-outline" size={24} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white border-b border-gray-200 flex-row">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 py-4 items-center border-b-3 ${
              activeTab === tab.key ? 'border-green-600' : 'border-transparent'
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.key ? '#16a34a' : '#94a3b8'}
              />
              <Text
                className={`text-xs font-bold ml-1 ${
                  activeTab === tab.key ? 'text-green-700' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {activeTab === 'upcoming' && (
            <>
              {upcomingEvents.length === 0 ? (
                <View className="items-center py-12">
                  <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                  <Text className="text-slate-500 text-lg font-semibold mt-4">
                    No Upcoming Events
                  </Text>
                  <Text className="text-slate-400 text-sm mt-2">
                    Create your first event to get started
                  </Text>
                  <TouchableOpacity className="bg-green-600 mt-6 px-6 py-3 rounded-lg">
                    <Text className="text-white font-bold">Create Event</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                upcomingEvents.map((event) => renderEventCard(event))
              )}
            </>
          )}

          {activeTab === 'completed' && (
            <>
              {completedEvents.length === 0 ? (
                <View className="items-center py-12">
                  <Ionicons name="checkmark-done-outline" size={48} color="#cbd5e1" />
                  <Text className="text-slate-500 text-lg font-semibold mt-4">
                    No Completed Events
                  </Text>
                  <Text className="text-slate-400 text-sm mt-2">
                    Your completed events will appear here
                  </Text>
                </View>
              ) : (
                completedEvents.map((event) => renderEventCard(event))
              )}
            </>
          )}

          {activeTab === 'requests' && renderRequestsPreview()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrganizerDashboardScreen;