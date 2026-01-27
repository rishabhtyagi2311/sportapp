import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// STORES
import { useRegistrationRequestStore } from '@/store/eventRegistrationRequestStore';
import { useBookingStore } from '@/store/venueStore';
import { RegistrationRequest } from '@/store/eventRegistrationRequestStore';

// MOCK USER ID (Replace with actual auth / player mapping)
const CURRENT_USER_ID = 'user-123';

export default function UserRegistrationsScreen() {
  const router = useRouter();

  /* ---------------- STORE ACCESS ---------------- */

  const { getEventById } = useBookingStore();
  const allRequests = useRegistrationRequestStore((state) => state.requests);

  /* ---------------- FILTER + SORT ---------------- */

  const sortedRequests = useMemo(() => {
    const myRequests = allRequests.filter((r) => {
      // Regular events → owned by userId
      if (r.domain === 'regular') {
        return 'userId' in r && r.userId === CURRENT_USER_ID;
      }

      // Football tournaments → owned by captain
      if (r.domain === 'football_tournament') {
        return r.captainPlayerId === CURRENT_USER_ID;
      }

      return false;
    });

    return myRequests.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() -
        new Date(a.submittedAt).getTime()
    );
  }, [allRequests]);

  /* ---------------- HELPERS ---------------- */

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          icon: 'checkmark-circle',
        };
      case 'rejected':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          icon: 'close-circle',
        };
      default:
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          icon: 'time',
        };
    }
  };

  const handlePressRequest = (req: RegistrationRequest) => {
    if (req.notes) {
      Alert.alert('Manager Notes', req.notes, [{ text: 'Close' }]);
    }
  };

  /* ---------------- RENDER CARD ---------------- */

  const renderRequestCard = ({ item }: { item: RegistrationRequest }) => {
    const event = getEventById(item.eventId);
    if (!event) return null;

    const statusStyle = getStatusColor(item.status);

    const participationLabel =
      item.domain === 'football_tournament'
        ? 'Football Tournament'
        : item.participationType === 'team'
          ? 'Team Entry'
          : 'Individual';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePressRequest(item)}
        className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm"
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-2">
            <Text
              className="text-lg font-bold text-slate-900"
              numberOfLines={1}
            >
              {event.name}
            </Text>
            <Text className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
              {event.sport.name} • {participationLabel}
            </Text>
          </View>

          <View className="bg-slate-100 px-2 py-1 rounded">
            <Text className="text-slate-700 font-bold text-xs">
              ₹{event.fees.amount}
            </Text>
          </View>
        </View>

        {/* Status */}
        <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-100">
          <View
            className={`flex-row items-center px-2.5 py-1 rounded-full ${statusStyle.bg}`}
          >
            <Ionicons
              name={statusStyle.icon as any}
              size={14}
              color={
                statusStyle.text === 'text-green-700'
                  ? '#15803d'
                  : statusStyle.text === 'text-red-700'
                    ? '#b91c1c'
                    : '#a16207'
              }
            />
            <Text
              className={`text-xs font-bold ml-1.5 capitalize ${statusStyle.text}`}
            >
              {item.status}
            </Text>
          </View>

          <Text className="text-xs text-slate-400">
            Applied:{' '}
            {new Date(item.submittedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </Text>
        </View>

        {/* Notes */}
        {item.notes && (
          <View className="mt-3 bg-gray-50 p-2 rounded-lg flex-row items-start">
            <Ionicons
              name="chatbox-ellipses-outline"
              size={14}
              color="#64748b"
            />
            <Text
              className="text-xs text-slate-600 ml-2 flex-1"
              numberOfLines={1}
            >
              Manager note: "{item.notes}"
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="bg-slate-900 px-6 py-4 border-b border-gray-200 mt-2">
        <View className="flex-row items-center ">
          <TouchableOpacity
            className="mr-4"
            onPress={() => router.back()}
            activeOpacity={0.7}
          > <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-white">
              My Requests
            </Text>

          </View>

        </View>
      </View>

      {/* List */}
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
    </SafeAreaView>
  );
}
