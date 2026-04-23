import React, { useState, useEffect, useMemo } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Modal, 
  FlatList,
  Platform,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useVenueStore } from '@/store/venueStore'
import { TimeSlot, WeeklyOperatingHours } from '@/types/venue'

const { width } = Dimensions.get('window');
const isTablet = width > 768;

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const formatTime = (totalMins: number) => {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const generateSlots = (startStr: string, endStr: string, price: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startMins = toMinutes(startStr);
  const endMins = toMinutes(endStr);
  
  if (startMins >= endMins) return [];

  let currentMins = startMins;
  while (currentMins + 30 <= endMins) {
    slots.push({
      id: Math.random().toString(36).substr(2, 9),
      startTime: formatTime(currentMins),
      endTime: formatTime(currentMins + 30),
      isAvailable: true,
      price: price,
      priceType: 'per_slot',
    });
    currentMins += 30;
  }
  return slots;
};

const TIME_OPTIONS = Array.from({ length: 48 }).map((_, i) => {
  const time = formatTime(i * 30);
  return { value: time, label: time };
});

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
/* -------------------------------------------------------------------------- */

const TimePickerModal = ({ visible, onClose, onSelect, title }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View className="flex-1 bg-black/50 justify-end">
      <View className="bg-white rounded-t-[40px] h-[45%] shadow-2xl">
        <View className="p-6 border-b border-slate-100 flex-row justify-between items-center">
          <Text className="font-black text-xl text-slate-900">{title}</Text>
          <TouchableOpacity onPress={onClose} className="bg-slate-100 p-2 rounded-full">
            <Ionicons name="close" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={TIME_OPTIONS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => { onSelect(item.value); onClose(); }}
              className="py-5 border-b border-slate-50 items-center"
            >
              <Text className="text-xl font-bold text-slate-700">{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </Modal>
);

export default function Step4Schedule() {
  const router = useRouter();
  const updateDraftVenue = useVenueStore((state) => state.updateDraftVenue);
  const draftHours = useVenueStore((state) => state.draftVenue.operatingHours);

  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [basePrice, setBasePrice] = useState('1000');
  const [selectedDays, setSelectedDays] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showClosePicker, setShowClosePicker] = useState(false);

  const DAYS = [
    { key: 'monday', label: 'Mon' }, { key: 'tuesday', label: 'Tue' }, { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' }, { key: 'friday', label: 'Fri' }, { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ];

  const estimatedSlotsPerDay = useMemo(() => 
    generateSlots(openTime, closeTime, 0).length, 
  [openTime, closeTime]);

  const toggleDay = (key: string) => {
    setSelectedDays(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]);
  };

 const handleNext = () => {
  if (toMinutes(openTime) >= toMinutes(closeTime)) {
    Alert.alert("Invalid Hours", "Closing time must be after opening time.");
    return;
  }
  if (selectedDays.length === 0) {
    Alert.alert("Days Required", "Please select at least one working day.");
    return;
  }

  
  const newHours = {} as WeeklyOperatingHours;
  DAYS.forEach(day => {
    newHours[day.key as keyof WeeklyOperatingHours] = {
      open: openTime,
      close: closeTime,
      isOpen: selectedDays.includes(day.key)
    };
  });

  
  updateDraftVenue({
    operatingHours: newHours,
   
    timeSlots: [{
      id: 'template',
      startTime: openTime,
      endTime: closeTime,
      isAvailable: true,
      price: parseInt(basePrice || '0'),
      priceType: 'per_slot'
    }]
  });

  router.push('/(venueManagement)/venueHandling/createVenue/step-5');
};

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="bg-white border-b border-slate-50">
        <View className="flex-row items-center px-4 py-3 justify-between">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Step 4 of 5</Text>
            <Text className="text-slate-900 font-bold">Business Hours</Text>
          </View>
          <View className="w-10" />
        </View>
        <View className="h-1.5 w-full bg-slate-100 flex-row">
          <View className="h-full bg-blue-600 w-4/5 rounded-r-full" />
        </View>
      </View>

      <ScrollView className="flex-1 bg-slate-50/30" showsVerticalScrollIndicator={false}>
        <View className="self-center w-full max-w-2xl px-6 pt-8">
          <Text className="text-3xl font-black text-slate-900 mb-2">Setup Timing</Text>
          <Text className="text-slate-500 text-lg mb-8">When is your venue open for bookings?</Text>

          {/* 1. TIMING CARDS */}
          <View className="flex-row gap-3 mb-8">
            {[ { t: 'Opens At', v: openTime, set: setShowOpenPicker }, { t: 'Closes At', v: closeTime, set: setShowClosePicker } ].map((item, idx) => (
              <TouchableOpacity 
                key={idx}
                onPress={() => item.set(true)}
                className="flex-1 bg-white border border-slate-100 p-5 rounded-[30px] shadow-sm items-center"
              >
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{item.t}</Text>
                <Text className="text-2xl font-black text-slate-900">{item.v}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 2. WORKING DAYS */}
          <View className="mb-8">
            <View className="flex-row justify-between items-end mb-4 px-1">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Working Days</Text>
              <TouchableOpacity onPress={() => setSelectedDays(DAYS.map(d => d.key))}>
                <Text className="text-blue-600 font-bold text-xs">Select All</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between bg-white p-2 rounded-[25px] border border-slate-100 shadow-sm">
              {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day.key);
                return (
                  <TouchableOpacity
                    key={day.key}
                    onPress={() => toggleDay(day.key)}
                    className={`flex-1 aspect-square m-1 rounded-full items-center justify-center ${isSelected ? 'bg-slate-900' : 'bg-slate-50'}`}
                  >
                    <Text className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3. PRICING */}
          <View className="mb-8">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Standard Pricing</Text>
            <View className="bg-white border border-slate-100 rounded-[30px] p-6 flex-row items-center shadow-sm">
              <View className="bg-green-500 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                <MaterialCommunityIcons name="currency-inr" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-slate-400 uppercase">Rate per 30 min slot</Text>
                <TextInput 
                  value={basePrice}
                  onChangeText={setBasePrice}
                  keyboardType="numeric"
                  placeholder="0"
                  className="text-3xl font-black text-slate-900 p-0 m-0"
                />
              </View>
            </View>
          </View>

          {/* SUMMARY */}
          <View className="bg-blue-600 rounded-[30px] p-6 flex-row items-center mb-10 shadow-lg shadow-blue-200">
            <View className="bg-white/20 p-3 rounded-2xl">
              <MaterialCommunityIcons name="calendar-clock" size={28} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white font-black text-lg">{estimatedSlotsPerDay} Slots/Day</Text>
              <Text className="text-blue-100 text-xs font-medium">Auto-generated across {selectedDays.length} working days.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View className="p-6 bg-white border-t border-slate-50 items-center" style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
        <TouchableOpacity
          onPress={handleNext}
          className={`bg-slate-900 h-16 rounded-3xl items-center justify-center flex-row shadow-xl ${isTablet ? 'w-96' : 'w-full'}`}
        >
          <Text className="text-white font-black text-lg mr-2">Preview Venue</Text>
          <MaterialIcons name="arrow-forward" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <TimePickerModal visible={showOpenPicker} onClose={() => setShowOpenPicker(false)} onSelect={setOpenTime} title="Opening Time" />
      <TimePickerModal visible={showClosePicker} onClose={() => setShowClosePicker(false)} onSelect={setCloseTime} title="Closing Time" />
    </SafeAreaView>
  );
}