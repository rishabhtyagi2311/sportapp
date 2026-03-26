import React, { useState, useMemo } from 'react'
import { 
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StatusBar 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format, addDays, isSameDay } from 'date-fns'

// Stores
import { useVenueStore } from '@/store/venueStore'
import { usePartnerBookingStore } from '@/store/partner-booking-store'
import { TimeSlot } from '@/types/booking'

/* -------------------------------------------------------------------------- */
/* TYPES & HELPERS                                                            */
/* -------------------------------------------------------------------------- */

type SlotStatus = 'available' | 'booked' | 'blocked' | 'match_session' | 'past'

interface MatchSessionData {
  slotId: string;
  date: string;
  matchId: string;
  playersJoined: number;
  maxPlayers: number;
  gameType: string;
}

interface SlotState {
  baseSlot: TimeSlot
  status: SlotStatus
  bookingDetails?: { customerName: string; id: string }
  blockDetails?: { reason: string; id: string }
  sessionDetails?: MatchSessionData
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
  
  // Typed as MatchSessionData[] to prevent "never" inference errors
  const matchSessions: MatchSessionData[] = [] 

  // 2. Local State
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<SlotState | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [modalVisible, setModalVisible] = useState(false)

  // 3. Generate Date Tabs (Today + 3 Days)
  const dateTabs = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => addDays(new Date(), i))
  }, [])

  // 4. MERGE DATA LOGIC
  const dailySlots: SlotState[] = useMemo(() => {
    if (!venue) return []
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const dayBookings = bookings.filter(b => b.venueId === venueId && b.date === dateStr)
    const dayBlocks = manualBlocks.filter(b => b.venueId === venueId && b.date === dateStr)

    return venue.timeSlots.map(slot => {
      // 1. Check if it's a Public Match Session
      const session = matchSessions.find(s => s.slotId === slot.id && s.date === dateStr)
      if (session) {
        return { 
          baseSlot: slot, 
          status: 'match_session',
          sessionDetails: session 
        }
      }

      // 2. Check if Booked
      const booking = dayBookings.find(b => b.timeSlots.some(s => s.startTime === slot.startTime))
      if (booking) {
        return { 
          baseSlot: slot, 
          status: 'booked', 
          bookingDetails: { customerName: 'John Doe', id: booking.id } 
        }
      }

      // 3. Check if Blocked manually
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
  }, [venue, bookings, manualBlocks, selectedDate, matchSessions, venueId])


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
      reason: blockReason || 'Internal Maintenance'
    })
    setModalVisible(false)
  }

  const handleUnblockSlot = () => {
    if (selectedSlot?.blockDetails) {
      removeManualBlock(selectedSlot.blockDetails.id)
      setModalVisible(false)
    }
  }

  if (!venue) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text>Venue not found</Text>
      </View>
    )
  }

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
            
            let bgClass = 'bg-white border-slate-200'
            let textClass = 'text-slate-900'
            let statusLabel = 'Available'
            let icon = <View className="w-2 h-2 rounded-full bg-green-500" />

            if (status === 'booked') {
              bgClass = 'bg-red-50 border-red-100'
              textClass = 'text-red-800'
              statusLabel = 'Booked'
              icon = <MaterialIcons name="lock" size={14} color="#ef4444" />
            } else if (status === 'blocked') {
              bgClass = 'bg-slate-100 border-slate-200'
              textClass = 'text-slate-500'
              statusLabel = 'Blocked'
              icon = <MaterialIcons name="block" size={14} color="#64748b" />
            } else if (status === 'match_session') {
              bgClass = 'bg-blue-50 border-blue-200'
              textClass = 'text-blue-800'
              statusLabel = 'Match Session'
              icon = <FontAwesome5 name="users" size={12} color="#3b82f6" />
            }

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleSlotPress(slotState)}
                className={`w-[48%] mb-3 p-3 rounded-xl border ${bgClass} flex-row items-center justify-between`}
              >
                <View>
                  <Text className={`text-lg font-bold ${textClass}`}>{baseSlot.startTime}</Text>
                  <Text className="text-[10px] text-slate-400 font-bold uppercase">{statusLabel}</Text>
                </View>
                {icon}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      {/* MANAGE SLOT MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 pb-12">
            <View className="w-12 h-1 bg-slate-200 rounded-full self-center mb-6" />
            
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-2xl font-bold text-slate-900">Slot Options</Text>
                <Text className="text-slate-500">{selectedSlot?.baseSlot.startTime} - {selectedSlot?.baseSlot.endTime}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-slate-100 p-2 rounded-full">
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedSlot?.status === 'available' && (
              <View>
                <TouchableOpacity 
                  onPress={() => {
                    setModalVisible(false);
                    router.push({
                      pathname: '/(venueManagement)/slotHandling/createMatchSession' as any, 
                      params: { 
                        venueId: venue.id,
                        venueName: venue.name,
                        slotId: selectedSlot.baseSlot.id,
                        startTime: selectedSlot.baseSlot.startTime,
                        endTime: selectedSlot.baseSlot.endTime,
                        date: format(selectedDate, 'yyyy-MM-dd')
                      }
                    });
                  }}
                  className="bg-blue-600 p-4 rounded-2xl flex-row items-center mb-4 shadow-sm"
                >
                  <View className="bg-white/20 p-3 rounded-xl mr-4">
                    <FontAwesome5 name="trophy" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">Create Match Session</Text>
                    <Text className="text-blue-100 text-xs">Allow users to join and pay per head</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>

                <View className="flex-row items-center my-2 opacity-30">
                  <View className="flex-1 h-[1px] bg-slate-300" />
                  <Text className="mx-4 text-slate-500 font-bold">OR</Text>
                  <View className="flex-1 h-[1px] bg-slate-300" />
                </View>

                <Text className="text-xs font-bold text-slate-400 uppercase mb-3 mt-4">Internal Block / Maintenance</Text>
                <TextInput
                  placeholder="Reason (e.g. Offline Booking)"
                  value={blockReason}
                  onChangeText={setBlockReason}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-slate-900 font-medium"
                />
                <TouchableOpacity 
                  onPress={handleBlockSlot}
                  className="bg-slate-900 py-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold text-base">Confirm Block</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedSlot?.status === 'blocked' && (
              <View>
                <View className="bg-slate-50 p-5 rounded-2xl mb-6 border border-slate-100">
                  <Text className="text-xs font-bold text-slate-400 uppercase mb-1">Reason for Block</Text>
                  <Text className="text-slate-900 font-bold text-lg">{selectedSlot.blockDetails?.reason}</Text>
                </View>
                <TouchableOpacity 
                  onPress={handleUnblockSlot}
                  className="bg-white border-2 border-slate-900 py-4 rounded-xl items-center"
                >
                  <Text className="text-slate-900 font-bold text-base">Lift Block (Make Available)</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedSlot?.status === 'booked' && (
              <View className="bg-red-50 p-5 rounded-2xl border border-red-100">
                <View className="flex-row items-center mb-3">
                  <MaterialIcons name="info" size={20} color="#ef4444" />
                  <Text className="ml-2 text-red-800 font-bold text-lg">Private Booking</Text>
                </View>
                <Text className="text-red-700 font-medium mb-1">Customer: {selectedSlot.bookingDetails?.customerName}</Text>
                <Text className="text-red-500 text-xs">This slot was booked privately. Manage this in the Bookings tab.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}