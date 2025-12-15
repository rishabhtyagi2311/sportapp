import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { usePartnerBookingStore } from '@/store/partner-booking-store'

export default function BookingDetailsScreen() {
  const router = useRouter()
  const { bookingId } = useLocalSearchParams() as { bookingId: string }
  
  const booking = usePartnerBookingStore(state => state.getBookingById(bookingId))
  const cancelBooking = usePartnerBookingStore(state => state.cancelBooking)

  if (!booking) return <View className="flex-1 bg-white items-center justify-center"><Text>Booking not found</Text></View>

  const isCancelled = booking.status === 'cancelled'

  const handleCall = () => {
    Linking.openURL(`tel:${booking.guestDetails.phone}`)
  }

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking?",
      "Are you sure you want to cancel this booking? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive", 
          onPress: () => {
            cancelBooking(booking.id)
            router.back()
          }
        }
      ]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* HEADER */}
      <View className="px-5 py-4 border-b border-slate-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="close" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-900">Booking Details</Text>
        <View className="w-8" /> 
      </View>

      <ScrollView className="flex-1 bg-slate-50">
        
        {/* 1. STATUS BANNER */}
        <View className={`px-6 py-8 items-center ${isCancelled ? 'bg-red-50' : 'bg-green-50'}`}>
          <MaterialIcons 
            name={isCancelled ? "cancel" : "check-circle"} 
            size={48} 
            color={isCancelled ? "#ef4444" : "#10b981"} 
          />
          <Text className={`text-xl font-bold mt-2 capitalize ${isCancelled ? 'text-red-700' : 'text-green-700'}`}>
            {booking.status}
          </Text>
          <Text className="text-slate-500 text-sm mt-1">Ref: #{booking.id.substring(0, 8)}</Text>
        </View>

        {/* 2. CUSTOMER CARD */}
        <View className="px-5 -mt-6">
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Guest</Text>
            
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-slate-900">{booking.guestDetails.name}</Text>
                <Text className="text-slate-500 mt-1">{booking.guestDetails.phone}</Text>
              </View>
              <TouchableOpacity onPress={handleCall} className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                <MaterialIcons name="call" size={24} color="#15803d" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3. BOOKING INFO */}
        <View className="px-5 mt-4">
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Schedule</Text>
            
            <View className="flex-row items-center">
              <MaterialIcons name="calendar-today" size={20} color="#64748b" />
              <Text className="ml-3 text-base font-medium text-slate-700">{booking.date}</Text>
            </View>
            
            <View className="flex-row items-center">
              <MaterialIcons name="schedule" size={20} color="#64748b" />
              <Text className="ml-3 text-base font-medium text-slate-700">
                {booking.timeSlots[0].startTime} - {booking.timeSlots[0].endTime}
              </Text>
            </View>

            <View className="flex-row items-center">
              <MaterialIcons name="groups" size={20} color="#64748b" />
              <Text className="ml-3 text-base font-medium text-slate-700">{booking.participants} Players</Text>
            </View>
          </View>
        </View>

        {/* 4. PAYMENT INFO */}
        <View className="px-5 mt-4 mb-10">
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Payment</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-600">Total Amount</Text>
              <Text className="text-xl font-bold text-slate-900">₹{booking.totalAmount}</Text>
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-slate-600">Status</Text>
              <Text className={`font-bold uppercase text-xs px-2 py-1 rounded ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {booking.paymentStatus}
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* FOOTER ACTION */}
      {!isCancelled && (
        <View className="p-5 bg-white border-t border-slate-100">
          <TouchableOpacity 
            onPress={handleCancel}
            className="w-full bg-white border border-red-200 py-4 rounded-xl items-center"
          >
            <Text className="text-red-600 font-bold text-lg">Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  )
}