import React, { useMemo } from 'react'
import { View, Text, SectionList, TouchableOpacity, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'

import { usePartnerBookingStore, PartnerBooking } from '@/store/partner-booking-store'

export default function BookingListScreen() {
  const router = useRouter()
  const { venueId } = useLocalSearchParams() as { venueId: string }
  const bookings = usePartnerBookingStore(state => state.bookings)

  // 1. Group & Sort Logic
  const sections = useMemo(() => {
    // Filter by venue
    const venueBookings = bookings.filter(b => b.venueId === venueId)
    
    // Sort by date + time
    venueBookings.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.timeSlots[0].startTime}`)
      const dateB = new Date(`${b.date}T${b.timeSlots[0].startTime}`)
      return dateA.getTime() - dateB.getTime()
    })

    const groups: { title: string; data: PartnerBooking[] }[] = []
    
    venueBookings.forEach(booking => {
      const date = parseISO(booking.date)
      let title = format(date, 'MMMM d, yyyy') // Default
      
      if (isToday(date)) title = 'Today'
      else if (isTomorrow(date)) title = 'Tomorrow'

      const existingGroup = groups.find(g => g.title === title)
      if (existingGroup) {
        existingGroup.data.push(booking)
      } else {
        groups.push({ title, data: [booking] })
      }
    })

    return groups
  }, [bookings, venueId])

  // 2. Render Item
  const renderBookingCard = ({ item }: { item: PartnerBooking }) => {
    const isCancelled = item.status === 'cancelled'
    const isPending = item.status === 'pending'
    
    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: './bookingDetail', params: { bookingId: item.id } })}
        className={`bg-white p-4 rounded-xl mb-3 border ${isCancelled ? 'border-red-100 bg-red-50/30' : 'border-slate-200'} shadow-sm`}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="bg-slate-100 px-2 py-1 rounded-md">
            <Text className="text-xs font-bold text-slate-700">
              {item.timeSlots[0].startTime} - {item.timeSlots[0].endTime}
            </Text>
          </View>
          <View className={`px-2 py-1 rounded-full ${isCancelled ? 'bg-red-100' : isPending ? 'bg-orange-100' : 'bg-green-100'}`}>
            <Text className={`text-[10px] font-bold uppercase ${isCancelled ? 'text-red-700' : isPending ? 'text-orange-700' : 'text-green-700'}`}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text className={`text-lg font-bold ${isCancelled ? 'text-slate-400' : 'text-slate-900'}`}>
          {item.guestDetails.name}
        </Text>
        
        <View className="flex-row items-center mt-1">
          <MaterialIcons name="phone" size={12} color="#94a3b8" />
          <Text className="text-slate-500 text-xs ml-1">{item.guestDetails.phone}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View className="px-5 py-4 bg-white border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">Bookings</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        stickySectionHeadersEnabled={false}
        renderItem={renderBookingCard}
        renderSectionHeader={({ section: { title } }) => (
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 mt-2">
            {title}
          </Text>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text className="text-slate-400">No bookings found for this venue.</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}