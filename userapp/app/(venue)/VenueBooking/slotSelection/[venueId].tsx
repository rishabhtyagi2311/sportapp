// app/slotSelection/[venueId].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Venue, Sport, SportVariety } from '@/types/booking';
import { dummyVenues } from '@/constants/venueData';

// Clean TimeSlot interface
interface TimeSlot {
  id: string;
  sportId?: string;
  sportVarietyId?: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  price: number;
}

// Professional Calendar Component
const CalendarModal = ({ 
  visible, 
  onClose, 
  selectedDate, 
  onDateSelect 
}: {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const getMonthName = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const isPastDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  const renderMonth = (monthDate: Date) => {
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    
    const weeks = [];
    let currentWeek = [];
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(
        <View key={`empty-${i}`} className="w-12 h-12 items-center justify-center" />
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isPast = isPastDate(year, month, day);
      const isSelectedDay = isSelected(date);
      const isTodayDay = isToday(date);
      
      currentWeek.push(
        <TouchableOpacity
          key={day}
          disabled={isPast}
          className={`w-12 h-12 items-center justify-center rounded-lg ${
            isPast 
              ? 'opacity-40' 
              : isSelectedDay 
                ? 'bg-blue-600' 
                : isTodayDay 
                  ? 'bg-blue-100 border border-blue-300' 
                  : 'hover:bg-gray-50'
          }`}
          onPress={() => !isPast && onDateSelect(date)}
        >
          <Text className={`text-sm font-medium ${
            isPast 
              ? 'text-gray-400' 
              : isSelectedDay 
                ? 'text-white' 
                : isTodayDay 
                  ? 'text-blue-700' 
                  : 'text-gray-800'
          }`}>
            {day}
          </Text>
        </TouchableOpacity>
      );
      
      // If we've reached the end of a week or the end of the month
      if (currentWeek.length === 7 || day === daysInMonth) {
        // Fill remaining slots if needed
        while (currentWeek.length < 7) {
          currentWeek.push(
            <View key={`empty-end-${currentWeek.length}`} className="w-12 h-12" />
          );
        }
        
        weeks.push(
          <View key={`week-${weeks.length}`} className="flex-row justify-between mb-1">
            {currentWeek}
          </View>
        );
        currentWeek = [];
      }
    }
    
    return (
      <View className="mb-8">
        <Text className="text-xl font-bold text-gray-900 mb-4 text-center">
          {getMonthName(monthDate)}
        </Text>
        
        {/* Days of week header */}
        <View className="flex-row justify-between mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <View key={dayName} className="w-12 items-center">
              <Text className="text-xs font-semibold text-gray-600">{dayName}</Text>
            </View>
          ))}
        </View>
        
        {/* Calendar weeks */}
        {weeks}
      </View>
    );
  };
  
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center p-4">
        <View className="bg-white rounded-2xl p-6 max-h-4/5">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900">Select Date</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderMonth(currentMonth)}
            {renderMonth(nextMonth)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function SlotBookingScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const venueId = params.venueId as string;
  const sportId = params.sportId as string;
  const sportVarietyId = params.sportVarietyId as string;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [showCalendar, setShowCalendar] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const foundVenue = dummyVenues.find(v => v.id === venueId);
    if (foundVenue) {
      setVenue(foundVenue);
    }
  }, [venueId]);

  useEffect(() => {
    // Generate fresh slots when date changes
    if (venue) {
      const selectedSport = venue.sports.find(s => s.id === sportId);
      const selectedVariety = selectedSport?.varieties?.find(v => v.id === sportVarietyId);
      setTimeSlots(generateTimeSlots(selectedVariety));
      setSelectedSlots(new Set()); // Clear selections when date changes
    }
  }, [venue, selectedDate, sportId, sportVarietyId]);

  const generateTimeSlots = (variety: SportVariety | undefined): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 6; hour < 23; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      // Format time with AM/PM
      const formatTimeWithAmPm = (time: string) => {
        const [hourStr] = time.split(':');
        const hour24 = parseInt(hourStr);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:00 ${ampm}`;
      };
      
      // Fixed availability - some slots are permanently booked
      const isAvailable = ![10, 14, 18].includes(hour); // 10 AM, 2 PM, 6 PM are booked
      const basePrice = variety?.basePrice || 500;
      const priceMultiplier = hour >= 17 ? 1.5 : hour <= 8 ? 0.8 : 1.0; // Peak/off-peak pricing
      
      slots.push({
        id: `slot_${hour}`,
        sportId,
        sportVarietyId,
        startTime: formatTimeWithAmPm(startTime),
        endTime: formatTimeWithAmPm(endTime),
        isAvailable,
        price: Math.round(basePrice * priceMultiplier),
      });
    }
    return slots;
  };

  if (!venue) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 text-lg">Venue not found</Text>
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
          onPress: () => {
            Alert.alert('Success!', 'Your slots have been booked.');
            router.back();
          }
        }
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
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-5 shadow-xl">
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
          >
            <Text className="text-white text-lg font-bold text-center">
              Confirm Booking ({selectedSlots.size} slot{selectedSlots.size > 1 ? 's' : ''})
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