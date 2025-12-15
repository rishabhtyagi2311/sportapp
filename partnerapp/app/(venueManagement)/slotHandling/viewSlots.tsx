import React, { useState, useMemo } from 'react'
import { 
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StatusBar 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format, addDays, isSameDay, parseISO } from 'date-fns'

// Stores
import { useVenueStore } from '@/store/venueStore'
import { usePartnerBookingStore } from '@/store/partner-booking-store'
import { TimeSlot } from '@/types/booking'

/* -------------------------------------------------------------------------- */
/* TYPES & HELPERS                                                            */
/* -------------------------------------------------------------------------- */

type SlotStatus = 'available' | 'booked' | 'blocked' | 'past'

interface SlotState {
  baseSlot: TimeSlot
  status: SlotStatus
  bookingDetails?: { customerName: string; id: string }
  blockDetails?: { reason: string; id: string }
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function SlotManagerView() {
  const router = useRouter()
  const { venueId } = useLocalSearchParams() as { venueId: string }
  
  // 1. Get Data from Stores
  const venue = useVenueStore(state => state.venues.find(v => v.id === venueId))
  const { bookings, manualBlocks, addManualBlock, removeManualBlock } = usePartnerBookingStore()

  // 2. Local State
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<SlotState | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [modalVisible, setModalVisible] = useState(false)

  // 3. Generate Date Tabs (Today + 3 Days)
  const dateTabs = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => addDays(new Date(), i))
  }, [])

  // 4. MERGE DATA LOGIC (The Core Brain)
  const dailySlots: SlotState[] = useMemo(() => {
    if (!venue) return []
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    
    // Get relevant data for this specific day
    const dayBookings = bookings.filter(b => b.venueId === venueId && b.date === dateStr)
    const dayBlocks = manualBlocks.filter(b => b.venueId === venueId && b.date === dateStr)

    // Map base slots to their real-time status
    return venue.timeSlots.map(slot => {
      // Check if Booked
      const booking = dayBookings.find(b => b.timeSlots.some(s => s.startTime === slot.startTime)) // Simplified matching by time
      if (booking) {
        return { 
          baseSlot: slot, 
          status: 'booked', 
          bookingDetails: { customerName: 'John Doe', id: booking.id } // Mock customer name for now
        }
      }

      // Check if Blocked manually
      const block = dayBlocks.find(b => b.slotId === slot.id)
      if (block) {
        return {
          baseSlot: slot,
          status: 'blocked',
          blockDetails: { reason: block.reason, id: block.id }
        }
      }

      return { baseSlot: slot, status: 'available' }
    })
  }, [venue, bookings, manualBlocks, selectedDate])


  // 5. HANDLERS
  const handleSlotPress = (slotState: SlotState) => {
    setSelectedSlot(slotState)
    setBlockReason('')
    setModalVisible(true)
  }

  const handleBlockSlot = () => {
    if (!venue || !selectedSlot) return
    
    addManualBlock({
      venueId: venue.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      slotId: selectedSlot.baseSlot.id,
      reason: blockReason || 'Maintenance'
    })
    setModalVisible(false)
  }

  const handleUnblockSlot = () => {
    if (selectedSlot?.blockDetails) {
      removeManualBlock(selectedSlot.blockDetails.id)
      setModalVisible(false)
    }
  }

  if (!venue) return <View className="flex-1 bg-white items-center justify-center"><Text>Venue not found</Text></View>

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="bg-white border-b border-slate-100 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold text-slate-900">{venue.name}</Text>
            <Text className="text-xs text-slate-500">Slot Manager</Text>
          </View>
        </View>
        <TouchableOpacity className="p-2 bg-slate-100 rounded-full">
          <MaterialIcons name="filter-list" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* DATE TABS */}
      <View className="bg-white py-3 shadow-sm">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {dateTabs.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate)
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDate(date)}
                className={`mr-3 px-4 py-3 rounded-xl items-center border ${
                  isSelected ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`text-xs font-bold mb-1 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                  {format(date, 'EEE').toUpperCase()}
                </Text>
                <Text className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {format(date, 'dd')}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* SLOT GRID */}
      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
          {format(selectedDate, 'EEEE, MMMM do')}
        </Text>

        <View className="flex-row flex-wrap justify-between">
          {dailySlots.map((slotState, index) => {
            const { baseSlot, status } = slotState
            
            // Color Logic
            let bgClass = 'bg-white border-slate-200'
            let textClass = 'text-slate-900'
            let icon = null

            if (status === 'booked') {
              bgClass = 'bg-red-50 border-red-100'
              textClass = 'text-red-800'
              icon = <MaterialIcons name="lock" size={14} color="#ef4444" />
            } else if (status === 'blocked') {
              bgClass = 'bg-slate-200 border-slate-300'
              textClass = 'text-slate-500'
              icon = <MaterialIcons name="block" size={14} color="#64748b" />
            } else {
              bgClass = 'bg-white border-green-200'
              textClass = 'text-slate-900'
              icon = <View className="w-2 h-2 rounded-full bg-green-500" />
            }

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleSlotPress(slotState)}
                className={`w-[48%] mb-3 p-3 rounded-xl border ${bgClass} flex-row items-center justify-between`}
              >
                <View>
                  <Text className={`text-lg font-bold ${textClass}`}>
                    {baseSlot.startTime}
                  </Text>
                  <Text className="text-xs text-slate-400 font-medium">
                    {status === 'booked' ? 'Booked' : status === 'blocked' ? 'Blocked' : 'Available'}
                  </Text>
                </View>
                {icon}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      {/* MANAGE SLOT MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-white rounded-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900">
                {selectedSlot?.baseSlot.startTime} - {selectedSlot?.baseSlot.endTime}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {selectedSlot?.status === 'available' && (
              <View>
                <Text className="text-slate-600 mb-4">This slot is currently available. Do you want to block it for maintenance or offline booking?</Text>
                
                <TextInput
                  placeholder="Reason (e.g. Repair Work)"
                  value={blockReason}
                  onChangeText={setBlockReason}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-slate-900"
                />

                <TouchableOpacity 
                  onPress={handleBlockSlot}
                  className="bg-slate-900 py-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">Block Slot</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedSlot?.status === 'blocked' && (
              <View>
                <View className="bg-slate-100 p-4 rounded-xl mb-4">
                  <Text className="text-xs font-bold text-slate-500 uppercase">Reason</Text>
                  <Text className="text-slate-900 font-medium mt-1">{selectedSlot.blockDetails?.reason}</Text>
                </View>
                <TouchableOpacity 
                  onPress={handleUnblockSlot}
                  className="bg-white border border-slate-200 py-4 rounded-xl items-center"
                >
                  <Text className="text-slate-900 font-bold">Unblock Slot</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedSlot?.status === 'booked' && (
              <View>
                 <View className="bg-red-50 p-4 rounded-xl mb-4">
                  <Text className="text-xs font-bold text-red-400 uppercase">Booked By</Text>
                  <Text className="text-red-900 font-bold text-lg mt-1">{selectedSlot.bookingDetails?.customerName}</Text>
                  <Text className="text-red-700 text-xs mt-1">Booking ID: #{selectedSlot.bookingDetails?.id.substring(0,6)}</Text>
                </View>
                <Text className="text-xs text-center text-slate-400">To cancel this booking, please go to the 'Bookings' tab.</Text>
              </View>
            )}

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}