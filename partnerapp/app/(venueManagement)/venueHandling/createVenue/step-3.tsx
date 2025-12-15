import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Platform,
  StatusBar,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

// 1. IMPORT MAIN STORE
import { useVenueStore } from '@/store/venueStore'
import { Amenity, Sport } from '@/types/venue'

/* -------------------------------------------------------------------------- */
/* MASTER DATA                                                                */
/* -------------------------------------------------------------------------- */

const AVAILABLE_AMENITIES: Partial<Amenity>[] = [
  { id: '1', name: 'Parking', icon: 'local-parking' },
  { id: '2', name: 'Drinking Water', icon: 'local-drink' },
  { id: '3', name: 'Washroom', icon: 'wc' },
  { id: '4', name: 'Changing Room', icon: 'checkroom' },
  { id: '5', name: 'Floodlights', icon: 'lightbulb' },
  { id: '6', name: 'CCTV', icon: 'videocam' },
  { id: '7', name: 'First Aid', icon: 'medical-services' },
  { id: '8', name: 'Seating Area', icon: 'chair' },
]

const MASTER_SPORTS: Sport[] = [
  {
    id: 's1',
    name: 'Cricket',
    category: 'outdoor',
    varieties: [
      { id: 'v1_1', name: 'Box Cricket (6x6)', isAvailable: true },
      { id: 'v1_2', name: 'Box Cricket (7x7)', isAvailable: true },
      { id: 'v1_3', name: 'Full Pitch', isAvailable: true },
      { id: 'v1_4', name: 'Nets Practice', isAvailable: true },
    ]
  },
  {
    id: 's2',
    name: 'Football',
    category: 'outdoor',
    varieties: [
      { id: 'v2_1', name: '5-a-side Turf', isAvailable: true },
      { id: 'v2_2', name: '7-a-side Turf', isAvailable: true },
      { id: 'v2_3', name: '11-a-side Ground', isAvailable: true },
    ]
  },
  {
    id: 's3',
    name: 'Badminton',
    category: 'indoor',
    varieties: [
      { id: 'v3_1', name: 'Synthetic Court', isAvailable: true },
      { id: 'v3_2', name: 'Wooden Court', isAvailable: true },
    ]
  }
]

export default function Step3Sports() {
  const router = useRouter()

  /* -------------------------------------------------------------------------- */
  /* 2. ZUSTAND SELECTORS                                                       */
  /* -------------------------------------------------------------------------- */
  const selectedAmenities = useVenueStore((state) => state.draftVenue.amenities)
  const selectedSports = useVenueStore((state) => state.draftVenue.sports)
  const updateDraftVenue = useVenueStore((state) => state.updateDraftVenue)

  // Local state for the custom amenity input
  const [customAmenityText, setCustomAmenityText] = useState('')

  /* -------------------------------------------------------------------------- */
  /* 3. LOGIC HANDLERS                                                          */
  /* -------------------------------------------------------------------------- */

  // A. Toggle Predefined Amenity
  const toggleAmenity = (amenity: Partial<Amenity>) => {
    const exists = selectedAmenities.find(a => a.id === amenity.id)
    let newAmenities

    if (exists) {
      newAmenities = selectedAmenities.filter(a => a.id !== amenity.id)
    } else {
      newAmenities = [...selectedAmenities, amenity as Amenity]
    }
    updateDraftVenue({ amenities: newAmenities })
  }

  // B. Add Custom Amenity
  const addCustomAmenity = () => {
    if (!customAmenityText.trim()) return

    // Create a new amenity object
    const newAmenity: Amenity = {
      id: `custom_${Date.now()}`,
      name: customAmenityText.trim(),
      category: 'facilities', // Default category
      icon: 'star' // Default icon for custom ones
    }

    // Add to store
    updateDraftVenue({ amenities: [...selectedAmenities, newAmenity] })
    setCustomAmenityText('') // Clear input
  }

  // C. Remove Custom Amenity
  const removeAmenity = (id: string) => {
    const newAmenities = selectedAmenities.filter(a => a.id !== id)
    updateDraftVenue({ amenities: newAmenities })
  }

  // D. Toggle Sports (Same logic as before)
  const toggleSportVariety = (masterSport: Sport, varietyId: string) => {
    const existingSportIndex = selectedSports.findIndex(s => s.id === masterSport.id)
    let newSports = [...selectedSports]

    if (existingSportIndex === -1) {
      const varietyToAdd = masterSport.varieties.find(v => v.id === varietyId)
      if (varietyToAdd) {
        newSports.push({ ...masterSport, varieties: [varietyToAdd] })
      }
    } else {
      const existingSport = { ...newSports[existingSportIndex] }
      const hasVariety = existingSport.varieties.find(v => v.id === varietyId)

      if (hasVariety) {
        existingSport.varieties = existingSport.varieties.filter(v => v.id !== varietyId)
        if (existingSport.varieties.length === 0) {
          newSports = newSports.filter(s => s.id !== masterSport.id)
        } else {
          newSports[existingSportIndex] = existingSport
        }
      } else {
        const varietyToAdd = masterSport.varieties.find(v => v.id === varietyId)
        if (varietyToAdd) {
          existingSport.varieties = [...existingSport.varieties, varietyToAdd]
          newSports[existingSportIndex] = existingSport
        }
      }
    }
    updateDraftVenue({ sports: newSports })
  }

  const handleNext = () => {
    if (selectedSports.length === 0) {
      Alert.alert("Requirement", "Please select at least one sport.")
      return
    }
    // Using relative path './step-4' is safer for navigation context
    router.push('./step-4') 
  }

  /* -------------------------------------------------------------------------- */
  /* 4. RENDER                                                                  */
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
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-6 mb-2">
          <Text className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Step 3 of 5</Text>
          <Text className="text-3xl font-extrabold text-slate-900 mb-2">Activities</Text>
          <Text className="text-slate-500 text-base">Select the amenities and sports available at your venue.</Text>
        </View>

        {/* 1. AMENITIES SECTION */}
        <View className="px-6 pt-6">
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            Common Amenities
          </Text>
          
          {/* Predefined Grid */}
          <View className="flex-row flex-wrap gap-3 mb-4">
            {AVAILABLE_AMENITIES.map((amenity) => {
              const isSelected = selectedAmenities.some(a => a.id === amenity.id)
              return (
                <TouchableOpacity
                  key={amenity.id}
                  onPress={() => toggleAmenity(amenity)}
                  activeOpacity={0.7}
                  className={`flex-row items-center px-4 py-3 rounded-2xl border ${
                    isSelected 
                      ? 'bg-slate-900 border-slate-900' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <MaterialIcons 
                    name={amenity.icon as any} 
                    size={18} 
                    color={isSelected ? 'white' : '#64748b'} 
                  />
                  <Text className={`ml-2 font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                    {amenity.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Custom Amenity Input */}
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 mt-2">
            Add Custom Amenity
          </Text>
          <View className="flex-row gap-3 mb-4">
            <TextInput 
              value={customAmenityText}
              onChangeText={setCustomAmenityText}
              placeholder="e.g. Steam Bath, Sauna..."
              placeholderTextColor="#cbd5e1"
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-medium"
            />
            <TouchableOpacity 
              onPress={addCustomAmenity}
              className="w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center shadow-sm"
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Display Selected Amenities (Including Custom) */}
          {selectedAmenities.length > 0 && (
            <View className="bg-slate-100 p-4 rounded-2xl">
               <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Current Selection ({selectedAmenities.length})</Text>
               <View className="flex-row flex-wrap gap-2">
                 {selectedAmenities.map(amenity => (
                   <View key={amenity.id} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex-row items-center">
                      <Text className="text-xs font-bold text-slate-700 mr-2">{amenity.name}</Text>
                      <TouchableOpacity onPress={() => removeAmenity(amenity.id)}>
                        <MaterialIcons name="close" size={14} color="#ef4444" />
                      </TouchableOpacity>
                   </View>
                 ))}
               </View>
            </View>
          )}

        </View>

        <View className="h-[1px] bg-slate-200 mx-6 my-8" />

        {/* 2. SPORTS LIST */}
        <View className="px-6">
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            Sports & Varieties
          </Text>

          <View className="space-y-6">
            {MASTER_SPORTS.map((sport) => {
              const draftSport = selectedSports.find(s => s.id === sport.id)
              const isSportActive = !!draftSport
              const selectedVarietyIds = draftSport ? draftSport.varieties.map(v => v.id) : []

              return (
                <View 
                  key={sport.id} 
                  className={`border rounded-3xl overflow-hidden shadow-sm ${
                    isSportActive ? 'border-blue-200 bg-white' : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Sport Header */}
                  <View className={`p-5 flex-row items-center ${isSportActive ? 'bg-blue-50/50' : ''}`}>
                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isSportActive ? 'bg-blue-100' : 'bg-slate-100'}`}>
                      <FontAwesome5 
                        name={sport.name === 'Football' ? 'futbol' : 'running'} 
                        size={20} 
                        color={isSportActive ? '#2563eb' : '#64748b'} 
                      />
                    </View>
                    <View className="flex-1">
                      <Text className={`font-bold text-lg ${isSportActive ? 'text-slate-900' : 'text-slate-700'}`}>
                        {sport.name}
                      </Text>
                      <Text className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                        {sport.category}
                      </Text>
                    </View>
                    {isSportActive && (
                      <View className="bg-blue-600 px-3 py-1 rounded-full">
                        <Text className="text-xs font-bold text-white">
                          {selectedVarietyIds.length} Selected
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Varieties Selection Area */}
                  <View className="p-5 pt-0">
                    <Text className="text-xs font-bold text-slate-400 mb-3 mt-2 ml-1">SELECT TYPES:</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {sport.varieties.map((variety) => {
                        const isSelected = selectedVarietyIds.includes(variety.id)
                        return (
                          <TouchableOpacity
                            key={variety.id}
                            onPress={() => toggleSportVariety(sport, variety.id)}
                            className={`px-4 py-2.5 rounded-xl border flex-row items-center ${
                              isSelected 
                                ? 'bg-slate-800 border-slate-800' 
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <View className={`w-4 h-4 rounded-full border items-center justify-center mr-2 ${isSelected ? 'border-blue-400' : 'border-slate-300'}`}>
                              {isSelected && <View className="w-2 h-2 rounded-full bg-blue-400" />}
                            </View>
                            <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                              {variety.name}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </View>
                </View>
              )
            })}
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
          <Text className="text-white font-bold text-lg mr-2">Continue to Schedule</Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}