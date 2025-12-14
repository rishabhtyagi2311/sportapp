// screens/EventRegistrationRequestsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '@/store/venueStore';
import { useRegistrationRequestStore } from '@/store/eventRegistrationRequestStore';

interface FilterTab {
  key: 'all' | 'pending' | 'accepted' | 'rejected';
  label: string;
  icon: string;
}

const EventRegistrationRequestsScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const { getEventById } = useBookingStore();
  const { getRequestsByEvent, getEventStats } = useRegistrationRequestStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const event = getEventById(eventId);
  const allRequests = getRequestsByEvent(eventId);
  const stats = getEventStats(eventId);

  const filteredRequests = allRequests.filter((req) => {
    const matchesFilter = activeFilter === 'all' || req.status === activeFilter;
    const isTeam = 'teamName' in req;
    const contactInfo = isTeam ? req.captainContact : req.contact;
    const matchesSearch =
      ('participantName' in req && req.participantName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ('teamName' in req && req.teamName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      contactInfo.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const filterTabs: FilterTab[] = [
    { key: 'pending', label: `Pending (${stats.pending})`, icon: 'time-outline' },
    { key: 'accepted', label: `Accepted (${stats.accepted})`, icon: 'checkmark-circle-outline' },
    { key: 'rejected', label: `Rejected (${stats.rejected})`, icon: 'close-circle-outline' },
  ];

  const getStatusColor = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' };
      case 'accepted':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' };
      case 'rejected':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' };
    }
  };

  const renderRequestCard = (request: any) => {
    const statusColor = getStatusColor(request.status);
    const isTeamRequest = 'teamName' in request;
    const title = isTeamRequest ? request.teamName : request.participantName;
    const subtitle = isTeamRequest ? `${request.teamSize} players` : request.contact;

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/organizer/request-details',
            params: { requestId: request.id, eventId: eventId },
          })
        }
        activeOpacity={0.7}
        className={`p-4 rounded-xl border mb-3 flex-row items-center justify-between ${statusColor.bg} ${statusColor.border}`}
      >
        <View className="flex-row items-center flex-1">
          <View className={`w-3 h-3 rounded-full mr-3 ${statusColor.dot}`} />
          <View className="flex-1">
            <Text className="font-bold text-slate-900 text-base">{title}</Text>
            <Text className="text-sm text-slate-600 mt-1">{subtitle}</Text>
            <View className="flex-row items-center mt-2">
              <Ionicons name="calendar" size={12} color="#94a3b8" />
              <Text className="text-xs text-slate-500 ml-1">
                {new Date(request.submittedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-end ml-4">
          <View
            className={`px-3 py-1 rounded-full ${statusColor.bg}`}
          >
            <Text className={`text-xs font-semibold capitalize ${statusColor.text}`}>
              {request.status}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" className="mt-2" />
        </View>
      </TouchableOpacity>
    );
  };

  if (!event) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600 text-lg">Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#475569" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900">{event.name}</Text>
          <Text className="text-sm text-slate-600">Registration Requests</Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-slate-900">{stats.total}</Text>
            <Text className="text-xs text-slate-600 mt-1">Total</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-yellow-600">{stats.pending}</Text>
            <Text className="text-xs text-slate-600 mt-1">Pending</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">{stats.accepted}</Text>
            <Text className="text-xs text-slate-600 mt-1">Accepted</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-red-600">{stats.rejected}</Text>
            <Text className="text-xs text-slate-600 mt-1">Rejected</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white border-b border-gray-200 px-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-0">
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              className={`mr-4 py-4 border-b-2 ${
                activeFilter === tab.key ? 'border-green-600' : 'border-transparent'
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={activeFilter === tab.key ? '#16a34a' : '#94a3b8'}
                />
                <Text
                  className={`ml-2 font-semibold text-sm ${
                    activeFilter === tab.key ? 'text-green-700' : 'text-slate-500'
                  }`}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Requests List */}
      <ScrollView className="flex-1 px-6 py-4">
        {filteredRequests.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="document-outline" size={48} color="#cbd5e1" />
            <Text className="text-slate-600 text-lg font-semibold mt-4">
              No {activeFilter !== 'all' ? activeFilter : ''} requests
            </Text>
            <Text className="text-slate-400 text-sm mt-2">
              {activeFilter === 'pending'
                ? 'All requests have been processed'
                : 'No requests found'}
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => renderRequestCard(request))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventRegistrationRequestsScreen;