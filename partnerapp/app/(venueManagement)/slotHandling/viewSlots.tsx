import React, { useState, useMemo, useEffect } from 'react'
import { 
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StatusBar, ActivityIndicator 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format, addDays, isSameDay } from 'date-fns'
import { useSlotStore } from '@/store/venueSlotsStore'

// Stores
import { useVenueStore } from '@/store/venueStore'

import { usePartnerBookingStore } from '@/store/partner-booking-store'
import { TimeSlot } from '@/types/venue' // Ensure this matches your shared types

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

export default function SlotManagerView() {
  const router = useRouter()
  const { venueId } = useLocalSearchParams() as { venueId: string }
  
  // 1. STORES
  const venue = useVenueStore(state => state.venues.find(v => v.id === venueId))
  const { slots, isLoading, loadSlots } = useSlotStore()
  const { bookings, manualBlocks, addManualBlock, removeManualBlock } = usePartnerBookingStore()
  
  const matchSessions: MatchSessionData[] = [] 

  // 2. LOCAL STATE
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSport, setSelectedSport] = useState<string | null>(null)
  const [selectedVariety, setSelectedVariety] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<SlotState | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [filterModalVisible, setFilterModalVisible] = useState(false)

  // 3. INITIALIZE FILTERS
  useEffect(() => {
    if (venue && venue.sports.length > 0) {
      const firstSport = venue.sports[0]
      setSelectedSport(firstSport.name)
      if (firstSport.varieties.length > 0) {
        setSelectedVariety(firstSport.varieties[0].id)
      }
    }
  }, [venue])

  // 4. FETCH SLOTS ON DATE/VARIETY CHANGE
  useEffect(() => {
    if (venueId && selectedVariety) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      loadSlots(venueId, dateStr)
    }
  }, [venueId, selectedDate, selectedVariety])

  // 5. DATA MERGING LOGIC
  const filteredDailySlots: SlotState[] = useMemo(() => {
    // Only show slots matching the selected Variety (e.g. "Pitch 1")
    const filteredBaseSlots = slots.filter(s => s.sportVarietyId === selectedVariety)
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const dayBookings = bookings.filter(b => b.venueId === venueId && b.date === dateStr)
    const dayBlocks = manualBlocks.filter(b => b.venueId === venueId && b.date === dateStr)

    return filteredBaseSlots.map(slot => {
      // Logic for Status remain as you designed
      const session = matchSessions.find(s => s.slotId === slot.id && s.date === dateStr)
      if (session) return { baseSlot: slot, status: 'match_session', sessionDetails: session }

      const booking = dayBookings.find(b => b.timeSlots.some(s => s.startTime === slot.startTime))
      if (booking) return { baseSlot: slot, status: 'booked', bookingDetails: { customerName: 'John Doe', id: booking.id } }

      const block = dayBlocks.find(b => b.slotId === slot.id)
      if (block) return { baseSlot: slot, status: 'blocked', blockDetails: { reason: block.reason, id: block.id } }

      return { baseSlot: slot, status: 'available' }
    })
  }, [slots, selectedVariety, bookings, manualBlocks, selectedDate, venueId])

  // 6. DATE TABS (Today + 7 Days for Partner)
  const dateTabs = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => addDays(new Date(), i))
  }, [])

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

  if (!venue) return <SafeAreaView className="flex-1 bg-white items-center justify-center"><ActivityIndicator /></SafeAreaView>

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
            <Text className="text-xs text-slate-500">{selectedSport} • {venue.sports.find(s => s.name === selectedSport)?.varieties.find(v => v.id === selectedVariety)?.name}</Text>
          </View>
        </View>

        {/* SPORT/VARIETY FILTER TRIGGER */}
        <TouchableOpacity 
          onPress={() => setFilterModalVisible(true)}
          className="bg-blue-50 px-3 py-2 rounded-xl flex-row items-center"
        >
          <MaterialIcons name="tune" size={18} color="#2563eb" />
          <Text className="text-blue-600 font-bold text-xs ml-2">Switch Court</Text>
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
                className={`mr-3 px-4 py-3 rounded-2xl items-center border ${
                  isSelected ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`text-[10px] font-black mb-1 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                  {format(date, 'EEE').toUpperCase()}
                </Text>
                <Text className={`text-xl font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {format(date, 'dd')}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* SLOT GRID */}
      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {isLoading ? (
          <View className="mt-20"><ActivityIndicator color="#2563eb" /></View>
        ) : (
          <>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              {format(selectedDate, 'EEEE, MMMM do')}
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {filteredDailySlots.map((slotState, index) => {
                const { baseSlot, status } = slotState
                
                let bgClass = 'bg-white border-slate-100'
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
                  statusLabel = 'Match'
                  icon = <FontAwesome5 name="users" size={12} color="#3b82f6" />
                }

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSlotPress(slotState)}
                    className={`w-[48%] mb-4 p-4 rounded-3xl border ${bgClass} flex-row items-center justify-between shadow-sm`}
                  >
                    <View>
                      <Text className={`text-lg font-black ${textClass}`}>{baseSlot.startTime}</Text>
                      <Text className="text-[10px] text-slate-400 font-bold uppercase">{statusLabel}</Text>
                    </View>
                    {icon}
                  </TouchableOpacity>
                )
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* SPORT/VARIETY PICKER MODAL */}
      <Modal visible={filterModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-white rounded-[40px] p-8">
            <Text className="text-2xl font-black text-slate-900 mb-6">Select Court</Text>
            
            {venue.sports.map(sport => (
              <View key={sport.id} className="mb-6">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{sport.name}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {sport.varieties.map(variety => (
                    <TouchableOpacity
                      key={variety.id}
                      onPress={() => {
                        setSelectedSport(sport.name);
                        setSelectedVariety(variety.id);
                        setFilterModalVisible(false);
                      }}
                      className={`px-4 py-3 rounded-2xl border ${selectedVariety === variety.id ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-100'}`}
                    >
                      <Text className={`font-bold ${selectedVariety === variety.id ? 'text-white' : 'text-slate-600'}`}>{variety.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
            
            <TouchableOpacity onPress={() => setFilterModalVisible(false)} className="mt-4 items-center p-2">
              <Text className="text-slate-400 font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MANAGE SLOT MODAL (Keep your existing implementation here) */}
      {/* ... [Insert your existing Slot Modal Code here] ... */}
    </SafeAreaView>
  )
}