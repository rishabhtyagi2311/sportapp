import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useRegistrationRequestStore } from '@/store/eventRegistrationRequestStore';
import { EventRegistration } from '@/types/event';

export default function UserRegistrationsScreen() {
  const router = useRouter();

  const { myRegistrations, isLoading, fetchMyRegistrations } = useRegistrationRequestStore();

  useFocusEffect(
    useCallback(() => {
      fetchMyRegistrations();
    }, [])
  );

  const sortedRequests = [...myRegistrations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          bg: 'bg-green-100',
          textColor: '#15803d',
          icon: 'checkmark-circle',
          textClass: 'text-green-700',
        };
      case 'rejected':
        return {
          bg: 'bg-red-100',
          textColor: '#b91c1c',
          icon: 'close-circle',
          textClass: 'text-red-700',
        };
      default:
        return {
          bg: 'bg-yellow-100',
          textColor: '#a16207',
          icon: 'time',
          textClass: 'text-yellow-700',
        };
    }
  };

  const handlePressRequest = (req: EventRegistration) => {
    if (req.notes) {
      Alert.alert('Manager Notes', req.notes, [{ text: 'Close' }]);
    }
  };

  const renderRequestCard = ({ item }: { item: EventRegistration }) => {
    const event = item.event;
    if (!event) return null;

    const statusStyle = getStatusColor(item.status);

    const participationLabel =
      event.eventType === 'footballtournament'
        ? 'Football Tournament'
        : item.footballTeamId
          ? 'Team Entry'
          : 'Individual';

    const appliedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePressRequest(item)}
        className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm"
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-2">
            <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>
              {event.name}
            </Text>
            <Text className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
              {event.sportName} • {participationLabel}
            </Text>
            {item.teamName && (
              <Text className="text-xs text-slate-400 mt-0.5">{item.teamName}</Text>
            )}
          </View>
          <View className="bg-slate-100 px-2 py-1 rounded">
            <Text className="text-slate-700 font-bold text-xs">
              ₹{event.feeAmount}
            </Text>
          </View>
        </View>

        {/* Status */}
        <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-100">
          <View className={`flex-row items-center px-2.5 py-1 rounded-full ${statusStyle.bg}`}>
            <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.textColor} />
            <Text className={`text-xs font-bold ml-1.5 capitalize ${statusStyle.textClass}`}>
              {item.status}
            </Text>
          </View>

          <View className="flex-row">
            <Text className="text-xs text-slate-400">Applied: </Text>
            <Text className="text-xs text-slate-400">{appliedDate}</Text>
          </View>
        </View>

        {/* Notes */}
        {item.notes && (
          <View className="mt-3 bg-gray-50 p-2 rounded-lg flex-row items-start">
            <Ionicons name="chatbox-ellipses-outline" size={14} color="#64748b" />
            <Text className="text-xs text-slate-600 ml-2 flex-1" numberOfLines={1}>
              {`Manager note: "${item.notes}"`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="bg-slate-900 px-6 py-4 border-b border-gray-200 mt-2">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4" onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-white">My Requests</Text>
          </View>
        </View>
      </View>

      {/* List */}
      {isLoading && myRegistrations.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : (
        <FlatList
          data={sortedRequests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 opacity-60">
              <Ionicons name="ticket-outline" size={64} color="#94a3b8" />
              <Text className="text-slate-500 text-lg font-semibold mt-4">
                No requests found
              </Text>
              <Text className="text-slate-400 text-sm text-center px-10">
                You haven't registered for any events yet.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(homeScreenTabs)')}
                className="mt-6 bg-blue-600 px-6 py-3 rounded-full"
              >
                <Text className="text-white font-bold">Explore Events</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
