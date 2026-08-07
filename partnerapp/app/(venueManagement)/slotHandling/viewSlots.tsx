import React, { useState, useMemo, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StatusBar, ActivityIndicator, Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format, addDays, isSameDay } from 'date-fns'
import { useSlotStore } from '@/store/venueSlotsStore'
import { useDebouncedFocusFetch } from '@/hooks/useDebouncedFocusFetch'

// Stores
import { useVenueStore } from '@/store/venueStore'
import { usePartnerBookingStore } from '@/store/partner-booking-store'
import { useMatchSessionStore } from '@/store/matchSessionStore'
import { VenueSlot, SlotStatus } from '@/types/venue'
import { useResponsive } from '@/hooks/useResponsive'
import FadeInView from '@/components/animated/FadeInView'
import AnimatedPressable from '@/components/animated/AnimatedPressable'

/* -------------------------------------------------------------------------- */
/* TYPES & HELPERS                                                            */
/* -------------------------------------------------------------------------- */

interface SlotState {
  baseSlot: VenueSlot
  status: SlotStatus
  bookingDetails?: { customerName: string; id: string }
  blockDetails?: { reason: string; id: string }
  sessionDetails?: { id: string; playersJoined: number; totalPlayers: number }
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */
export default function SlotManagerView() {
  const router = useRouter()
  const { isTablet } = useResponsive()
  const { venueId, venueName } = useLocalSearchParams() as { venueId: string; venueName?: string }

  // 1. STORES
  const venue = useVenueStore(state => state.venues.find(v => v.id === venueId))
  const { slots, isLoading, loadSlots, generateSlots, updateSlotPrice } = useSlotStore()
  const { bookings, fetchBookings, addManualBlock, removeManualBlock } = usePartnerBookingStore()
  const { sessions, fetchSessions } = useMatchSessionStore()

  // 2. LOCAL STATE
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSport, setSelectedSport] = useState<string | null>(null)
  const [selectedVariety, setSelectedVariety] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<SlotState | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [priceInput, setPriceInput] = useState('')
  const [priceSaving, setPriceSaving] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

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

  // 4. FETCH SLOTS + BOOKINGS ON DATE CHANGE, SESSIONS ON VENUE CHANGE — and
  // on every focus, so returning from blocking/creating a session shows fresh data
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  useDebouncedFocusFetch(() => {
    if (venueId) {
      loadSlots(venueId, selectedDateStr)
      fetchBookings(venueId, selectedDateStr)
    }
  }, 15_000, `${venueId}:${selectedDateStr}`)

  useDebouncedFocusFetch(() => {
    if (venueId) {
      fetchSessions(venueId)
    }
  }, 15_000, venueId)

  // 5. DATA MERGING LOGIC — the backend's slot.status is the source of truth;
  // bookings/sessions are only consulted for extra display detail.
  const filteredDailySlots: SlotState[] = useMemo(() => {
    const filteredBaseSlots = slots.filter(s => s.varietyId === selectedVariety)
    const dateStr = format(selectedDate, 'yyyy-MM-dd')

    return filteredBaseSlots.map(slot => {
      if (slot.status === 'match_session') {
        const session = sessions.find(s => s.slotId === slot.id && s.date === dateStr)
        return {
          baseSlot: slot,
          status: 'match_session',
          sessionDetails: session
            ? { id: session.id, playersJoined: session.playersJoined, totalPlayers: session.totalPlayers }
            : undefined,
        }
      }

      if (slot.status === 'booked') {
        const booking = bookings.find(b => b.slotId === slot.id)
        return {
          baseSlot: slot,
          status: 'booked',
          bookingDetails: booking
            ? { customerName: booking.guestDetails.name || 'Guest', id: booking.id }
            : undefined,
        }
      }

      if (slot.status === 'blocked') {
        return {
          baseSlot: slot,
          status: 'blocked',
          blockDetails: slot.blockId ? { reason: slot.blockReason || 'No reason given', id: slot.blockId } : undefined,
        }
      }

      return { baseSlot: slot, status: 'available' }
    })
  }, [slots, selectedVariety, bookings, sessions, selectedDate])

  // 6. DATE TABS — matches the server's rolling generation window
  // (server/src/services/partner/venueManagement/slotGenerator.ts:
  // ROLLING_WINDOW_DAYS). Showing more tabs than the window covers would let
  // partners tap into days that are never actually generated.
  const ROLLING_WINDOW_DAYS = 3
  const dateTabs = useMemo(() => {
    return Array.from({ length: ROLLING_WINDOW_DAYS }).map((_, i) => addDays(new Date(), i))
  }, [])

  const handleSlotPress = (slotState: SlotState) => {
    setSelectedSlot(slotState)
    setBlockReason('')
    setPriceInput(String(slotState.baseSlot.price))
    setModalVisible(true)
  }

  const refreshSlots = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    loadSlots(venueId, dateStr)
  }

  const handleGenerateSlots = async () => {
    if (!venueId) return
    setActionLoading(true)
    try {
      const created = await generateSlots(venueId, format(selectedDate, 'yyyy-MM-dd'))
      Alert.alert(
        created > 0 ? 'Slots Generated' : 'Already Up To Date',
        created > 0
          ? `${created} new slot(s) were added to the upcoming schedule.`
          : 'No new slots were needed — the upcoming schedule is already fully generated.'
      )
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not generate slots')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBlockSlot = async () => {
    if (!venue || !selectedSlot) return
    setActionLoading(true)
    try {
      await addManualBlock({
        venueId: venue.id,
        slotId: selectedSlot.baseSlot.id,
        reason: blockReason || 'Internal Maintenance',
        date: format(selectedDate, 'yyyy-MM-dd'),
      })
      setModalVisible(false)
      refreshSlots()
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not block this slot')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdatePrice = async () => {
    if (!selectedSlot) return
    const price = Number(priceInput)
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.')
      return
    }
    setPriceSaving(true)
    try {
      await updateSlotPrice(selectedSlot.baseSlot.id, price)
      setModalVisible(false)
      refreshSlots()
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not update price')
    } finally {
      setPriceSaving(false)
    }
  }

  const handleUnblockSlot = async () => {
    if (!selectedSlot?.blockDetails) return
    setActionLoading(true)
    try {
      await removeManualBlock(selectedSlot.blockDetails.id)
      setModalVisible(false)
      refreshSlots()
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not unblock this slot')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateMatchSession = () => {
    if (!selectedSlot) return
    setModalVisible(false)
    router.push({
      pathname: '/(venueManagement)/slotHandling/createMatchSession',
      params: {
        venueId,
        venueName: venueName || venue?.name,
        slotId: selectedSlot.baseSlot.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot.baseSlot.startTime,
        endTime: selectedSlot.baseSlot.endTime,
      },
    })
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

        <View className="flex-row items-center">
          {/* SPORT/VARIETY FILTER TRIGGER */}
          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            className="bg-blue-50 px-3 py-2 rounded-xl flex-row items-center"
          >
            <MaterialIcons name="tune" size={18} color="#2563eb" />
            <Text className="text-blue-600 font-bold text-xs ml-2">Switch Court</Text>
          </TouchableOpacity>
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
          <View className={isTablet ? 'self-center w-full max-w-3xl' : 'w-full'}>
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
                  <FadeInView key={baseSlot.id || index} delay={Math.min(index, 10) * 30} className={isTablet ? 'w-[23%] mb-4' : 'w-[48%] mb-4'}>
                    <AnimatedPressable
                      onPress={() => handleSlotPress(slotState)}
                      className={`p-4 rounded-3xl border ${bgClass} flex-row items-center justify-between shadow-sm`}
                    >
                      <View>
                        <Text className={`text-lg font-black ${textClass}`}>{baseSlot.startTime}</Text>
                        <Text className="text-[10px] text-slate-400 font-bold uppercase">{statusLabel}</Text>
                      </View>
                      {icon}
                    </AnimatedPressable>
                  </FadeInView>
                )
              })}

              {filteredDailySlots.length === 0 && (
                <View className="items-center w-full mt-10">
                  <Text className="text-slate-400 text-center mb-4">
                    No slots found for this court on this day.
                  </Text>
                  <AnimatedPressable
                    onPress={handleGenerateSlots}
                    disabled={actionLoading}
                    className="bg-blue-600 px-6 py-3 rounded-2xl flex-row items-center"
                  >
                    {actionLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <MaterialIcons name="event-repeat" size={18} color="white" />
                        <Text className="text-white font-bold ml-2">Generate Slots</Text>
                      </>
                    )}
                  </AnimatedPressable>
                </View>
              )}
            </View>
          </View>
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

      {/* MANAGE SLOT MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-white rounded-3xl p-6">

            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900">
                {selectedSlot?.baseSlot.startTime} - {selectedSlot?.baseSlot.endTime}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Available State */}
            {selectedSlot?.status === 'available' && (
              <View>
                <Text className="text-slate-600 mb-4">This slot is currently available. Block it, or open it up for a match session.</Text>

                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Price</Text>
                <View className="flex-row gap-2 mb-4">
                  <View className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 flex-row items-center">
                    <Text className="text-slate-400 font-bold mr-1">₹</Text>
                    <TextInput
                      value={priceInput}
                      onChangeText={setPriceInput}
                      keyboardType="numeric"
                      className="flex-1 text-slate-900 font-bold py-4"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleUpdatePrice}
                    disabled={priceSaving}
                    className="bg-slate-100 px-5 rounded-xl items-center justify-center"
                  >
                    {priceSaving ? (
                      <ActivityIndicator color="#334155" size="small" />
                    ) : (
                      <Text className="text-slate-700 font-bold">Update</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Reason (e.g. Repair Work)"
                  value={blockReason}
                  onChangeText={setBlockReason}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-slate-900"
                />

                <TouchableOpacity
                  onPress={handleBlockSlot}
                  disabled={actionLoading}
                  className="bg-slate-900 py-4 rounded-xl items-center mb-3"
                >
                  {actionLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Block Slot</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateMatchSession}
                  disabled={actionLoading}
                  className="bg-blue-600 py-4 rounded-xl items-center flex-row justify-center"
                >
                  <FontAwesome5 name="users" size={14} color="white" />
                  <Text className="text-white font-bold ml-2">Create Match Session</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Blocked State */}
            {selectedSlot?.status === 'blocked' && (
              <View>
                <View className="bg-slate-100 p-4 rounded-xl mb-4">
                  <Text className="text-xs font-bold text-slate-500 uppercase">Reason</Text>
                  <Text className="text-slate-900 font-medium mt-1">{selectedSlot.blockDetails?.reason}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleUnblockSlot}
                  disabled={actionLoading || !selectedSlot.blockDetails}
                  className="bg-white border border-slate-200 py-4 rounded-xl items-center"
                >
                  {actionLoading ? <ActivityIndicator /> : <Text className="text-slate-900 font-bold">Unblock Slot</Text>}
                </TouchableOpacity>
              </View>
            )}

            {/* Booked State */}
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

            {/* Match Session State */}
            {selectedSlot?.status === 'match_session' && (
              <View>
                <View className="bg-blue-50 p-4 rounded-xl mb-4">
                  <Text className="text-xs font-bold text-blue-400 uppercase">Match Session</Text>
                  <Text className="text-blue-900 font-bold text-lg mt-1">
                    {selectedSlot.sessionDetails
                      ? `${selectedSlot.sessionDetails.playersJoined} / ${selectedSlot.sessionDetails.totalPlayers} players joined`
                      : 'Session in progress'}
                  </Text>
                </View>
                <Text className="text-xs text-center text-slate-400">Manage this session from the Match Sessions tab.</Text>
              </View>
            )}

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}
