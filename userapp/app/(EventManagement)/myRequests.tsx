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

// MOCK USER ID (Replace with actual auth ID)
const CURRENT_USER_ID = 'user-123';

export default function UserRegistrationsScreen() {
  const router = useRouter();

  // 1. Fetch Data Helpers
  const { getRequestsByUser } = useRegistrationRequestStore();
  const { getEventById } = useBookingStore();

  // 2. Get ALL requests first (Stable Selector)
  // FIX: We select the raw array to prevent infinite re-renders
  const allRequests = useRegistrationRequestStore((state) => state.requests);

  // 3. Filter and Sort
  // We do the filtering inside useMemo so it only recalculates when 'allRequests' changes
  const sortedRequests = useMemo(() => {
    // A. Filter for current user
    const myRequests = allRequests.filter(r => r.userId === CURRENT_USER_ID);

    // B. Sort by submission date (newest first)
    return myRequests.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }, [allRequests]);

  /* ---------------- HELPERS ---------------- */
   
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': 
        return { bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle' };
      case 'rejected': 
        return { bg: 'bg-red-100', text: 'text-red-700', icon: 'close-circle' };
      default: 
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'time' };
    }
  };

  const handlePressRequest = (req: RegistrationRequest) => {
    if (req.notes) {
      Alert.alert(
        'Manager Notes',
        req.notes,
        [{ text: 'Close' }]
      );
    }
  };

  /* ---------------- RENDER ITEM ---------------- */

  const renderRequestCard = ({ item }: { item: RegistrationRequest }) => {
    // Cross-reference Event Data
    const event = getEventById(item.eventId);
    const statusStyle = getStatusColor(item.status);

    // If event was deleted, handle gracefully
    if (!event) return null; 

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePressRequest(item)}
        className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm"
      >
        {/* Header: Event Name & Price */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-2">
            <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>
              {event.name}
            </Text>
            <Text className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
              {event.sport.name} • {item.participationType === 'team' ? 'Team Entry' : 'Individual'}
            </Text>
          </View>
          <View className="bg-slate-100 px-2 py-1 rounded">
             <Text className="text-slate-700 font-bold text-xs">₹{event.fees.amount}</Text>
          </View>
        </View>

        {/* Status Badge Area */}
        <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-100">
           
          {/* Status Pill */}
          <View className={`flex-row items-center px-2.5 py-1 rounded-full ${statusStyle.bg}`}>
            <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.text === 'text-green-700' ? '#15803d' : statusStyle.text === 'text-red-700' ? '#b91c1c' : '#a16207'} />
            <Text className={`text-xs font-bold ml-1.5 capitalize ${statusStyle.text}`}>
              {item.status}
            </Text>
          </View>

          {/* Date Submitted */}
          <Text className="text-xs text-slate-400">
            Applied: {new Date(item.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        </View>

        {/* Manager Notes Indicator */}
        {item.notes && (
          <View className="mt-3 bg-gray-50 p-2 rounded-lg flex-row items-start">
            <Ionicons name="chatbox-ellipses-outline" size={14} color="#64748b" className="mt-0.5" />
            <Text className="text-xs text-slate-600 ml-2 flex-1" numberOfLines={1}>
              Manager note: "{item.notes}"
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /* ---------------- MAIN UI ---------------- */

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
       
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-slate-900">My Requests</Text>
            <Text className="text-sm text-slate-500">Track your event applications</Text>
          </View>
          <View className="bg-blue-50 w-10 h-10 rounded-full items-center justify-center">
            <Ionicons name="person" size={20} color="#2563eb" />
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