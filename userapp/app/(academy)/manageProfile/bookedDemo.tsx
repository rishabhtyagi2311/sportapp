import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDemoBookingStore, DemoBooking } from "@/store/demobookingstore";
import { format, parseISO } from "date-fns";

export default function DemoBookingsScreen() {
  const router = useRouter();
  const demoBookings = useDemoBookingStore((state) => state.demoBookings);
  const updateDemoBookingStatus = useDemoBookingStore((state) => state.updateDemoBookingStatus);
  const [isLoading, setIsLoading] = useState(false);

  // Group bookings by status
  const upcomingBookings = demoBookings.filter(booking => 
    booking.status === 'confirmed' && new Date(booking.bookingDate) >= new Date()
  ).sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
  
  const pastBookings = demoBookings.filter(booking => 
    booking.status === 'completed' || (booking.status === 'confirmed' && new Date(booking.bookingDate) < new Date())
  ).sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  
  const cancelledBookings = demoBookings.filter(booking => 
    booking.status === 'cancelled'
  ).sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

  const handleBackPress = () => {
    router.back();
  };

  const markAsCompleted = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      updateDemoBookingStatus(id, 'completed');
    } catch (error) {
      console.error("Failed to mark as completed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      updateDemoBookingStatus(id, 'cancelled');
    } catch (error) {
      console.error("Failed to cancel booking", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "MMM dd, yyyy • h:mm a");
    } catch (error) {
      console.error("Invalid date format", error);
      return dateString;
    }
  };

  const renderBookingCard = (booking: DemoBooking) => {
    const isPast = new Date(booking.bookingDate) < new Date();
    
    return (
      <View 
        key={booking.id}
        className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-md"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Status Badge */}
        <View className="absolute top-4 right-4 z-10">
          <View className={`rounded-full px-3 py-1 ${
            booking.status === 'confirmed' 
              ? 'bg-blue-50' 
              : booking.status === 'completed' 
                ? 'bg-green-50' 
                : 'bg-red-50'
          }`}>
            <Text className={`text-xs font-medium ${
              booking.status === 'confirmed' 
                ? 'text-blue-600' 
                : booking.status === 'completed' 
                  ? 'text-green-600' 
                  : 'text-red-600'
            }`}>
              {booking.status === 'confirmed' 
                ? (isPast ? 'Overdue' : 'Confirmed') 
                : booking.status === 'completed' 
                  ? 'Completed' 
                  : 'Cancelled'}
            </Text>
          </View>
        </View>

        {/* Child & Academy Info */}
        <Text className="text-slate-900 font-bold text-xl">
          {booking.childName}
        </Text>
        <Text className="text-blue-600 font-medium mt-1">
          {booking.academyName}
        </Text>

        {/* Date & Time */}
        <View className="flex-row items-center mt-4">
          <View className="bg-blue-50 rounded-full p-2 mr-3">
            <Ionicons name="calendar" size={16} color="#3b82f6" />
          </View>
          <Text className="text-slate-700">
            {formatDate(booking.bookingDate)}
          </Text>
        </View>

        {/* Contact Info */}
        <View className="flex-row items-center mt-3">
          <View className="bg-green-50 rounded-full p-2 mr-3">
            <Ionicons name="call-outline" size={16} color="#10b981" />
          </View>
          <View>
            <Text className="text-slate-500 text-xs">Contact</Text>
            <Text className="text-slate-700">
              {booking.fatherName}: {booking.contactNumber}
            </Text>
          </View>
        </View>

        {/* Action Buttons - Only for confirmed and not past bookings */}
        {booking.status === 'confirmed' && !isPast && (
          <View className="flex-row justify-end mt-4 pt-3 border-t border-gray-100">
            <TouchableOpacity
              onPress={() => cancelBooking(booking.id)}
              disabled={isLoading}
              className="bg-red-50 rounded-full px-4 py-2 mr-3 flex-row items-center"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
                  <Text className="text-red-600 font-medium ml-1">Cancel</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => markAsCompleted(booking.id)}
              disabled={isLoading}
              className="bg-green-50 rounded-full px-4 py-2 flex-row items-center"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#10b981" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
                  <Text className="text-green-600 font-medium ml-1">Complete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View className="flex-1 items-center justify-center px-6 mt-10" style={{ minHeight: 400 }}>
        <View className="bg-white rounded-full p-6 mb-4" 
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
        </View>
        <Text className="text-slate-900 text-2xl font-bold mt-4 text-center">
          No Demo Bookings
        </Text>
        <Text className="text-slate-500 text-center mt-2 px-8 text-base">
          Book a demo session at any academy to see it here
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header Section */}
      <View className="bg-slate-900 shadow-lg">
        <View className="flex-row items-center px-4 py-3 border-b border-slate-800">
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBackPress}
            className="mr-3 p-2 rounded-lg"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Header Title */}
          <View className="flex-1">
            <Text className="text-white font-bold text-lg" numberOfLines={1}>
              Demo Bookings
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              Manage your scheduled demos
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {demoBookings.length > 0 ? (
          <>
            {/* Upcoming Bookings Section */}
            {upcomingBookings.length > 0 && (
              <View className="mt-4">
                <Text className="ml-6 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                  Upcoming Demos ({upcomingBookings.length})
                </Text>
                {upcomingBookings.map(renderBookingCard)}
              </View>
            )}

            {/* Past Bookings Section */}
            {pastBookings.length > 0 && (
              <View className="mt-6">
                <Text className="ml-6 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                  Completed Demos ({pastBookings.length})
                </Text>
                {pastBookings.map(renderBookingCard)}
              </View>
            )}

            {/* Cancelled Bookings Section */}
            {cancelledBookings.length > 0 && (
              <View className="mt-6">
                <Text className="ml-6 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                  Cancelled Demos ({cancelledBookings.length})
                </Text>
                {cancelledBookings.map(renderBookingCard)}
              </View>
            )}
          </>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}