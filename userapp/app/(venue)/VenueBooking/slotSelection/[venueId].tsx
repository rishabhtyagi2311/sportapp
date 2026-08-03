// app/slotSelection/[venueId].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Venue, Sport, SportVariety } from '@/types/booking';
import { useBookingStore } from '@/store/venueStore';
import { useVenueSlotsStore } from '@/store/venueSlotsStore';
import { useUserBookingStore } from '@/store/bookingStore';
import CalendarModal from '@/components/CalendarModal';

// Local view-model over the server's VenueSlot, keeping the existing
// isAvailable-driven rendering logic below unchanged.
interface TimeSlot {
  id: string;
  sportId?: string;
  sportVarietyId?: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  price: number;
}

function formatTimeWithAmPm(time: string) {
  const [hourStr, minuteStr] = time.split(':');
  const hour24 = parseInt(hourStr, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minuteStr} ${ampm}`;
}

export default function SlotBookingScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const venueId = params.venueId as string;
  const sportId = params.sportId as string;
  const sportVarietyId = params.sportVarietyId as string;

  const { getVenueById, fetchVenueById } = useBookingStore();
  const { fetchSlotsForVenue, getSlots } = useVenueSlotsStore();
  const createBooking = useUserBookingStore((state) => state.createBooking);

  const venue = getVenueById(venueId);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [showCalendar, setShowCalendar] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!venue) {
      fetchVenueById(venueId);
    }
  }, [venueId]);

  // NOT selectedDate.toISOString() — that converts to UTC first, which silently
  // shifts to the wrong calendar day for part of the day in timezones ahead of
  // UTC (e.g. IST, from midnight to 5:30am local). Build the date string from
  // the device's local calendar fields instead.
  const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    setLoadingSlots(true);
    fetchSlotsForVenue(venueId, dateKey)
      .catch((err) => Alert.alert('Could not load slots', err.message))
      .finally(() => setLoadingSlots(false));
    setSelectedSlots(new Set()); // Clear selections when date changes
  }, [venueId, dateKey]);

  const rawSlots = getSlots(venueId, dateKey).filter(
    (s) => s.varietyId === sportVarietyId || !sportVarietyId
  );

  const timeSlots: TimeSlot[] = rawSlots.map((slot) => ({
    id: slot.id,
    sportId,
    sportVarietyId: slot.varietyId,
    startTime: formatTimeWithAmPm(slot.startTime),
    endTime: formatTimeWithAmPm(slot.endTime),
    isAvailable: slot.status === 'available',
    price: slot.price,
  }));

  if (!venue) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 text-lg">Loading venue…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedSport = venue.sports.find(s => s.id === sportId);
  const selectedVariety = selectedSport?.varieties?.find(v => v.id === sportVarietyId);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const formatDateFull = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Clear, simple slot selection logic
  const handleSlotToggle = (slotId: string) => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot || !slot.isAvailable) return;
    
    setSelectedSlots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slotId)) {
        newSet.delete(slotId); // Remove if selected
      } else {
        newSet.add(slotId); // Add if not selected
      }
      return newSet;
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const calculateTotal = (): number => {
    return Array.from(selectedSlots).reduce((total, slotId) => {
      const slot = timeSlots.find(s => s.id === slotId);
      return total + (slot?.price || 0);
    }, 0);
  };

  const getSelectedSlotTimes = (): string => {
    if (selectedSlots.size === 0) return '';
    
    const sortedSlots = Array.from(selectedSlots)
      .map(id => timeSlots.find(s => s.id === id))
      .filter(slot => slot)
      .sort((a, b) => a!.startTime.localeCompare(b!.startTime));
    
    if (sortedSlots.length === 1) {
      return `${sortedSlots[0]!.startTime} - ${sortedSlots[0]!.endTime}`;
    }
    
    return `${selectedSlots.size} slots selected`;
  };

  const handleConfirmBooking = () => {
    if (selectedSlots.size === 0) {
      Alert.alert('No Slots Selected', 'Please select at least one time slot.');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Book ${selectedSlots.size} slot(s) for ${formatDateFull(selectedDate)}?\n\nTotal: ₹${calculateTotal()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setBooking(true);
            try {
              // The backend books one slot per call — loop through the
              // selected slots sequentially so a mid-way failure (e.g.
              // someone else claimed a slot first) is reported precisely.
              for (const slotId of selectedSlots) {
                await createBooking({ venueId, slotId });
              }
              Alert.alert('Success!', 'Your slots have been booked.');
              fetchSlotsForVenue(venueId, dateKey);
              router.back();
            } catch (err: any) {
              Alert.alert('Booking Failed', err.message || 'Please try again.');
              fetchSlotsForVenue(venueId, dateKey);
            } finally {
              setBooking(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      
      {/* Clean Header */}
      <View className="bg-white px-6 py-4 shadow-sm border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold">
                Book Time Slots
              </Text>
              <Text className="text-gray-600 text-sm">
                {selectedSport?.name} • {selectedVariety?.name}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-blue-600 rounded-xl px-4 py-3 flex-row items-center"
            onPress={() => setShowCalendar(true)}
          >
            <Ionicons name="calendar" size={16} color="white" />
            <Text className="text-white text-sm font-semibold ml-2">
              {formatDate(selectedDate)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        className="flex-1 px-6 py-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: selectedSlots.size > 0 ? 160 : 20 }}
      >
        <Text className="text-gray-900 text-xl font-bold mb-2">
          {formatDateFull(selectedDate)}
        </Text>
        <Text className="text-gray-600 text-sm mb-6">
          Tap to select or deselect time slots
        </Text>

        <View className="flex-row flex-wrap justify-between">
          {timeSlots.map(slot => {
            const isSelected = selectedSlots.has(slot.id);
            const isAvailable = slot.isAvailable;
            
            // Clean, independent styling for each slot state
            let slotClasses = "w-[48%] mb-3 rounded-xl p-3 border-2 shadow-sm ";
            let textClasses = "";
            let subtextClasses = "";
            let priceClasses = "";
            let iconClasses = "";
            
            if (!isAvailable) {
              // Booked slots - red theme
              slotClasses += "bg-red-50 border-red-200";
              textClasses = "text-red-700";
              subtextClasses = "text-red-500";
              priceClasses = "text-red-700";
              iconClasses = "text-red-600";
            } else if (isSelected) {
              // Selected slots - strong green theme
              slotClasses += "bg-green-600 border-green-600";
              textClasses = "text-white";
              subtextClasses = "text-green-100";
              priceClasses = "text-white";
              iconClasses = "text-white";
            } else {
              // Available slots - clean white theme
              slotClasses += "bg-white border-gray-200";
              textClasses = "text-gray-900";
              subtextClasses = "text-gray-600";
              priceClasses = "text-gray-900";
              iconClasses = "text-gray-600";
            }
            
            return (
              <TouchableOpacity
                key={slot.id}
                disabled={!isAvailable}
                className={slotClasses}
                onPress={() => handleSlotToggle(slot.id)}
              >
                <View className="items-center">
                  {/* Time Display */}
                  <Text className={`text-sm font-bold text-center ${textClasses}`}>
                    {slot.startTime}
                  </Text>
                  <Text className={`text-xs ${subtextClasses}`}>
                    -
                  </Text>
                  <Text className={`text-sm font-bold text-center ${textClasses}`}>
                    {slot.endTime}
                  </Text>
                  
                  {/* Price */}
                  <Text className={`text-lg font-bold mt-2 ${priceClasses}`}>
                    ₹{slot.price}
                  </Text>
                  
                  {/* Status */}
                  <View className="flex-row items-center mt-2">
                    {!isAvailable && (
                      <Ionicons name="close-circle" size={16} color="#dc2626" />
                    )}
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={16} color="white" />
                    )}
                    <Text className={`text-xs ${isAvailable && !isSelected ? 'ml-0' : 'ml-1'} ${subtextClasses}`}>
                      {!isAvailable ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Panel */}
      {selectedSlots.size > 0 && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 pt-5 shadow-xl"
          style={{ paddingBottom: insets.bottom + 20 }}
        >
          <View className="mb-4">
            <Text className="text-gray-900 text-lg font-bold mb-1">
              {getSelectedSlotTimes()}
            </Text>
            <Text className="text-green-600 text-2xl font-bold">
              Total: ₹{calculateTotal()}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-green-600 rounded-2xl py-4 px-6 shadow-lg"
            onPress={handleConfirmBooking}
            disabled={booking}
          >
            <Text className="text-white text-lg font-bold text-center">
              {booking
                ? 'Booking…'
                : `Confirm Booking (${selectedSlots.size} slot${selectedSlots.size > 1 ? 's' : ''})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
    </SafeAreaView>
  );
}