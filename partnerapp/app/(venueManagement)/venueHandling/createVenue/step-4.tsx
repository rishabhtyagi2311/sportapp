import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Modal, 
  FlatList,
  Platform,
  StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

// 1. IMPORT MAIN STORE
import { useVenueStore } from '@/store/venueStore'
import { TimeSlot, WeeklyOperatingHours } from '@/types/venue'
import { v4 as uuidv4 } from 'uuid' // Ensure uuid is installed or use a helper

/* -------------------------------------------------------------------------- */
/* HELPER: SLOT GENERATION LOGIC                                              */
/* -------------------------------------------------------------------------- */

const generateSlots = (startStr: string, endStr: string, price: number): TimeSlot[] => {
  const slots: TimeSlot[] = []
  
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  const startMins = toMinutes(startStr)
  const endMins = toMinutes(endStr)
  let currentMins = startMins

  while (currentMins < endMins) {
    // Format minutes back to HH:mm
    const formatTime = (totalMins: number) => {
      const h = Math.floor(totalMins / 60)
      const m = totalMins % 60
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }

    // Stop if next slot exceeds closing time
    if (currentMins + 30 > endMins) break

    slots.push({
      id: Math.random().toString(36).substr(2, 9), // Temp ID (replaced on save)
      startTime: formatTime(currentMins),
      endTime: formatTime(currentMins + 30),
      isAvailable: true,
      price: price,
      priceType: 'per_slot',
    })

    currentMins += 30
  }

  return slots
}

const TIME_OPTIONS = Array.from({ length: 48 }).map((_, i) => {
  const totalMins = i * 30
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  const hh = h.toString().padStart(2, '0')
  const mm = m.toString().padStart(2, '0')
  return { value: `${hh}:${mm}`, label: `${hh}:${mm}` }
})

/* -------------------------------------------------------------------------- */
/* SUB-COMPONENT: TIME PICKER MODAL                                           */
/* -------------------------------------------------------------------------- */

const TimePickerModal = ({ 
  visible, onClose, onSelect, title 
}: { visible: boolean, onClose: () => void, onSelect: (t: string) => void, title: string }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View className="flex-1 bg-black/60 justify-end">
      <View className="bg-white rounded-t-3xl h-[50%] overflow-hidden">
        <View className="p-4 border-b border-slate-100 flex-row justify-between items-center bg-slate-50">
          <Text className="font-bold text-lg text-slate-900">{title}</Text>
          <TouchableOpacity onPress={onClose} className="p-2 bg-slate-200 rounded-full">
            <MaterialIcons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={TIME_OPTIONS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => { onSelect(item.value); onClose() }}
              className="py-4 border-b border-slate-50 items-center active:bg-slate-50"
            >
              <Text className="text-xl font-medium text-slate-700">{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </Modal>
)

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function Step4Schedule() {
  const router = useRouter()
  
  // 1. STORE SELECTORS
  const draftOperatingHours = useVenueStore((state) => state.draftVenue.operatingHours)
  const updateDraftVenue = useVenueStore((state) => state.updateDraftVenue)

  // 2. LOCAL STATE
  const [openTime, setOpenTime] = useState('09:00')
  const [closeTime, setCloseTime] = useState('22:00')
  const [basePrice, setBasePrice] = useState('1000')
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ])
  const [showOpenPicker, setShowOpenPicker] = useState(false)
  const [showClosePicker, setShowClosePicker] = useState(false)

  // 3. INIT (Pre-fill logic if editing draft)
  useEffect(() => {
    // Check if we have data in the store to pre-fill
    const firstActiveDay = Object.values(draftOperatingHours).find(d => d.isOpen)
    if (firstActiveDay) {
      setOpenTime(firstActiveDay.open)
      setCloseTime(firstActiveDay.close)
      
      // Find which days are open
      const activeDays = Object.entries(draftOperatingHours)
        .filter(([_, val]) => val.isOpen)
        .map(([key]) => key)
      setSelectedDays(activeDays)
    }
  }, [])

  // 4. LOGIC
  const DAYS = [
    { key: 'monday', label: 'M' }, { key: 'tuesday', label: 'T' }, { key: 'wednesday', label: 'W' },
    { key: 'thursday', label: 'T' }, { key: 'friday', label: 'F' }, { key: 'saturday', label: 'S' },
    { key: 'sunday', label: 'S' },
  ]

  const toggleDay = (key: string) => {
    setSelectedDays(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key])
  }

  // Calculate slots for preview
  const estimatedSlotsPerDay = generateSlots(openTime, closeTime, 0).length

  const handleNext = () => {
    if (selectedDays.length === 0) {
      alert("Please select at least one operating day.")
      return
    }
    if (!basePrice || isNaN(Number(basePrice))) {
      alert("Please enter a valid base price.")
      return
    }

    // A. Build Operating Hours Object
    const newHours = { ...draftOperatingHours } as WeeklyOperatingHours
    
    // Reset all to closed first
    Object.keys(newHours).forEach(k => {
      // @ts-ignore
      newHours[k] = { open: openTime, close: closeTime, isOpen: false }
    })
    // Set active days
    selectedDays.forEach(day => {
       // @ts-ignore
      newHours[day] = { open: openTime, close: closeTime, isOpen: true }
    })

    // B. Generate Slot Array
    const newSlots = generateSlots(openTime, closeTime, parseInt(basePrice))

    // C. Update Store
    updateDraftVenue({
      operatingHours: newHours,
      timeSlots: newSlots
    })

    router.push('/(venueManagement)/venueHandling/createVenue/step-5')
  }

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">Add New Venue</Text>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 mb-2">
          <Text className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Step 4 of 5</Text>
          <Text className="text-3xl font-extrabold text-slate-900 mb-2">Schedule</Text>
          <Text className="text-slate-500 text-base">Set your operating hours and standard pricing.</Text>
        </View>

        {/* 1. TIMING SECTION */}
        <View className="px-6 pt-6">
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            Operating Hours
          </Text>
          
          <View className="flex-row gap-4 mb-8">
            {/* OPEN TIME */}
            <TouchableOpacity 
              onPress={() => setShowOpenPicker(true)}
              activeOpacity={0.8}
              className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm"
            >
              <Text className="text-xs font-bold text-slate-400 uppercase mb-1">Opens At</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-slate-900">{openTime}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            {/* CLOSE TIME */}
            <TouchableOpacity 
              onPress={() => setShowClosePicker(true)}
              activeOpacity={0.8}
              className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm"
            >
              <Text className="text-xs font-bold text-slate-400 uppercase mb-1">Closes At</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-slate-900">{closeTime}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. DAYS SECTION */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Working Days
            </Text>
            <TouchableOpacity onPress={() => setSelectedDays(DAYS.map(d => d.key))}>
              <Text className="text-blue-600 font-bold text-xs">Select All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            {DAYS.map((day) => {
              const isSelected = selectedDays.includes(day.key)
              return (
                <TouchableOpacity
                  key={day.key}
                  onPress={() => toggleDay(day.key)}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    isSelected ? 'bg-slate-900 shadow-md' : 'bg-slate-50'
                  }`}
                >
                  <Text className={`font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* 3. PRICING SECTION */}
        <View className="px-6 mb-8">
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            Base Pricing
          </Text>
          
          <View className="bg-white border border-green-200 rounded-2xl p-4 flex-row items-center shadow-sm">
            <View className="bg-green-50 w-12 h-12 rounded-full items-center justify-center mr-4 border border-green-100">
              <Text className="text-green-700 font-bold text-xl">₹</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-400 uppercase">Price per 30 mins</Text>
              <TextInput 
                value={basePrice}
                onChangeText={setBasePrice}
                keyboardType="numeric"
                className="text-2xl font-bold text-slate-900 p-0 h-8"
                placeholder="0"
              />
            </View>
          </View>
        </View>

        {/* SUMMARY INFO */}
        <View className="mx-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex-row items-start">
          <MaterialCommunityIcons name="lightning-bolt" size={20} color="#3b82f6" />
          <View className="ml-3 flex-1">
            <Text className="text-blue-900 font-bold text-sm mb-1">Configuration Summary</Text>
            <Text className="text-blue-700 text-xs leading-5">
              We will generate <Text className="font-bold">{estimatedSlotsPerDay} slots</Text> for each selected day. You can manage individual slot availability later.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* FOOTER */}
      <View className="p-6 bg-white border-t border-slate-100 shadow-sm mb-6">
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          className="bg-slate-900 w-full py-4 rounded-2xl items-center shadow-lg shadow-slate-300 flex-row justify-center"
        >
          <Text className="text-white font-bold text-lg mr-2">Review & Create</Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* MODALS */}
      <TimePickerModal 
        visible={showOpenPicker} 
        onClose={() => setShowOpenPicker(false)} 
        onSelect={setOpenTime}
        title="Select Opening Time"
      />
      <TimePickerModal 
        visible={showClosePicker} 
        onClose={() => setShowClosePicker(false)} 
        onSelect={setCloseTime}
        title="Select Closing Time"
      />

    </SafeAreaView>
  )
}