import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { format, parseISO } from 'date-fns';

import { useUserBookingStore } from '@/store/bookingStore';
import { UserBooking } from '@/types/venue';

export default function MyVenueBookingsScreen() {
  const router = useRouter();
  const { bookings, isLoading, fetchMyBookings, cancelBooking } = useUserBookingStore();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchMyBookings().catch(() => {});
    }, [])
  );

  const isPast = (booking: UserBooking) => {
    const dateOnly = booking.date.slice(0, 10);
    return new Date(`${dateOnly}T${booking.endTime}`) < new Date();
  };

  const upcomingBookings = bookings
    .filter((b) => b.status !== 'cancelled' && !isPast(b))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastBookings = bookings
    .filter((b) => b.status !== 'cancelled' && isPast(b))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const cancelledBookings = bookings
    .filter((b) => b.status === 'cancelled')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString.slice(0, 10)), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const handleCancel = (booking: UserBooking) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel Booking',
        style: 'destructive',
        onPress: async () => {
          setCancellingId(booking.id);
          try {
            await cancelBooking(booking.id);
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Could not cancel booking');
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  };

  const statusStyle = (booking: UserBooking) => {
    if (booking.status === 'cancelled') return { bg: 'bg-red-50', text: 'text-red-600', label: 'Cancelled' };
    if (isPast(booking)) return { bg: 'bg-green-50', text: 'text-green-600', label: 'Completed' };
    if (booking.status === 'pending') return { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Pending' };
    return { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Confirmed' };
  };

  const renderBookingCard = (booking: UserBooking) => {
    const style = statusStyle(booking);
    const canCancel = booking.status !== 'cancelled' && !isPast(booking);

    return (
      <View
        key={booking.id}
        className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-md"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="absolute top-4 right-4 z-10">
          <View className={`rounded-full px-3 py-1 ${style.bg}`}>
            <Text className={`text-xs font-medium ${style.text}`}>{style.label}</Text>
          </View>
        </View>

        <Text className="text-slate-900 font-bold text-xl pr-24">
          {booking.venueName || 'Venue Booking'}
        </Text>

        <View className="flex-row items-center mt-4">
          <View className="bg-blue-50 rounded-full p-2 mr-3">
            <Ionicons name="calendar" size={16} color="#3b82f6" />
          </View>
          <Text className="text-slate-700">
            {formatDate(booking.date)} • {booking.startTime} - {booking.endTime}
          </Text>
        </View>

        <View className="flex-row items-center mt-3">
          <View className="bg-orange-50 rounded-full p-2 mr-3">
            <Ionicons name="wallet" size={16} color="#f97316" />
          </View>
          <Text className="text-slate-700 font-semibold">₹{booking.totalAmount}</Text>
          {booking.participants ? (
            <Text className="text-slate-400 text-sm ml-3">
              {booking.participants} participant{booking.participants !== 1 ? 's' : ''}
            </Text>
          ) : null}
        </View>

        {canCancel && (
          <View className="flex-row justify-end mt-4 pt-3 border-t border-gray-100">
            <TouchableOpacity
              onPress={() => handleCancel(booking)}
              disabled={cancellingId === booking.id}
              className="bg-red-50 rounded-full px-4 py-2 flex-row items-center"
            >
              {cancellingId === booking.id ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
                  <Text className="text-red-600 font-medium ml-1">Cancel</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 mt-10" style={{ minHeight: 400 }}>
      <View
        className="bg-white rounded-full p-6 mb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
      </View>
      <Text className="text-slate-900 text-2xl font-bold mt-4 text-center">No Bookings Yet</Text>
      <Text className="text-slate-500 text-center mt-2 px-8 text-base">
        Book a venue slot to see it here
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View className="bg-slate-900 shadow-lg">
        <View className="flex-row items-center px-4 py-3 border-b border-slate-800">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2 rounded-lg">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg" numberOfLines={1}>
              My Bookings
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">Manage your venue bookings</Text>
          </View>
        </View>
      </View>

      {isLoading && bookings.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          {bookings.length > 0 ? (
            <>
              {upcomingBookings.length > 0 && (
                <View className="mt-4">
                  <Text className="ml-6 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                    Upcoming ({upcomingBookings.length})
                  </Text>
                  {upcomingBookings.map(renderBookingCard)}
                </View>
              )}

              {pastBookings.length > 0 && (
                <View className="mt-6">
                  <Text className="ml-6 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                    Completed ({pastBookings.length})
                  </Text>
                  {pastBookings.map(renderBookingCard)}
                </View>
              )}

              {cancelledBookings.length > 0 && (
                <View className="mt-6">
                  <Text className="ml-6 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                    Cancelled ({cancelledBookings.length})
                  </Text>
                  {cancelledBookings.map(renderBookingCard)}
                </View>
              )}
            </>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
