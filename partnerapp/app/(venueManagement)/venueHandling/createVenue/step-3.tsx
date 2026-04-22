import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Platform,
  StatusBar,
  Alert,
  Dimensions,
  KeyboardAvoidingView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useVenueStore } from '@/store/venueStore'
import { Amenity, Sport, SportVariety } from '@/types/venue'

const { width } = Dimensions.get('window');
const isTablet = width > 768;

const PREDEFINED_AMENITIES: Partial<Amenity>[] = [
  { id: '1', name: 'Parking', icon: 'local-parking' },
  { id: '2', name: 'Drinking Water', icon: 'local-drink' },
  { id: '3', name: 'Washroom', icon: 'wc' },
  { id: '4', name: 'Changing Room', icon: 'checkroom' },
  { id: '5', name: 'Floodlights', icon: 'lightbulb' },
]

const INITIAL_MASTER_SPORTS: Sport[] = [
  {
    id: 's1',
    name: 'Cricket',
    category: 'outdoor',
    varieties: [
      { id: 'v1_1', name: 'Box Cricket (6x6)', isAvailable: true },
      { id: 'v1_2', name: 'Box Cricket (7x7)', isAvailable: true },
      { id: 'v1_3', name: 'Full Pitch', isAvailable: true },
    ]
  },
  {
    id: 's2',
    name: 'Football',
    category: 'outdoor',
    varieties: [
      { id: 'v2_1', name: '5-a-side Turf', isAvailable: true },
      { id: 'v2_2', name: '7-a-side Turf', isAvailable: true },
    ]
  }
]

export default function Step3Sports() {
  const router = useRouter()
  
  // Zustand State
  const selectedAmenities = useVenueStore((state) => state.draftVenue.amenities)
  const selectedSports = useVenueStore((state) => state.draftVenue.sports)
  const updateDraftVenue = useVenueStore((state) => state.updateDraftVenue)

  // Local UI State
  const [customAmenityText, setCustomAmenityText] = useState('')
  const [customSportText, setCustomSportText] = useState('')
  // Stores text input for variety per sport ID
  const [customVarietyText, setCustomVarietyText] = useState<{ [key: string]: string }>({})
  const [masterSports, setMasterSports] = useState<Sport[]>(INITIAL_MASTER_SPORTS)

  /* --- AMENITY HANDLERS --- */
  const toggleAmenity = (amenity: Partial<Amenity>) => {
    const exists = selectedAmenities.find(a => a.id === amenity.id)
    updateDraftVenue({ 
        amenities: exists ? selectedAmenities.filter(a => a.id !== amenity.id) : [...selectedAmenities, amenity as Amenity] 
    })
  }

  const addCustomAmenity = () => {
    if (!customAmenityText.trim()) return
    const newAmenity: Amenity = { 
      id: `ca_${Date.now()}`, 
      name: customAmenityText.trim(), 
      category: 'facilities', 
      icon: 'star' 
    }
    updateDraftVenue({ amenities: [...selectedAmenities, newAmenity] })
    setCustomAmenityText('')
  }

  /* --- SPORT & VARIETY HANDLERS --- */
  const addCustomSport = () => {
    if (!customSportText.trim()) return
    const newSport: Sport = {
      id: `cs_${Date.now()}`,
      name: customSportText.trim(),
      category: 'N/A',
      varieties: [] 
    }
    setMasterSports(prev => [...prev, newSport])
    setCustomSportText('')
  }

  const addVarietyToSport = (sportId: string) => {
    const vText = customVarietyText[sportId]
    if (!vText?.trim()) return

    const newVariety: SportVariety = {
      id: `cv_${Date.now()}`,
      name: vText.trim(),
      isAvailable: true
    }

    setMasterSports(prev => prev.map(s => 
      s.id === sportId ? { ...s, varieties: [...s.varieties, newVariety] } : s
    ))
    
    setCustomVarietyText(prev => ({ ...prev, [sportId]: '' }))
  }

  const deleteMasterSport = (sportId: string) => {
    Alert.alert("Remove Sport", "This will remove this category and all selected types under it.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => {
          setMasterSports(prev => prev.filter(s => s.id !== sportId))
          // Clear from Zustand as well
          updateDraftVenue({ sports: selectedSports.filter(s => s.id !== sportId) })
      }}
    ])
  }

  const toggleSportVariety = (masterSport: Sport, varietyId: string) => {
    const existingSportIndex = selectedSports.findIndex(s => s.id === masterSport.id)
    let newSports = [...selectedSports]

    if (existingSportIndex === -1) {
      // Sport not in store yet, add it with this first variety
      const varietyToAdd = masterSport.varieties.find(v => v.id === varietyId)
      if (varietyToAdd) {
        newSports.push({ ...masterSport, varieties: [varietyToAdd] })
      }
    } else {
      // Sport exists, toggle the variety within it
      const existingSport = { ...newSports[existingSportIndex] }
      const isSelected = existingSport.varieties.some(v => v.id === varietyId)

      if (isSelected) {
        existingSport.varieties = existingSport.varieties.filter(v => v.id !== varietyId)
        // If no varieties left, remove the whole sport from store
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
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Step 3 of 5</Text>
            <Text className="text-slate-900 font-bold">Activities</Text>
          </View>
          <View className="w-10" />
        </View>
        <View className="h-1.5 w-full bg-slate-100 flex-row">
          <View className="h-full bg-blue-600 w-3/5 rounded-r-full" />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          
          <Text className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Facilities</Text>

          {/* 1. AMENITIES SECTION */}
          <View className="mb-12">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Venue Amenities</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {PREDEFINED_AMENITIES.map((item) => {
                const isSelected = selectedAmenities.some(a => a.id === item.id)
                return (
                  <TouchableOpacity key={item.id} onPress={() => toggleAmenity(item)}
                    className={`px-4 py-3 rounded-2xl border ${isSelected ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                    <Text className={`font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>{item.name}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <View className="flex-row gap-2">
              <TextInput 
                value={customAmenityText} 
                onChangeText={setCustomAmenityText} 
                placeholder="Add other (e.g. Cafe, Shower)" 
                placeholderTextColor="#94a3b8"
                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-semibold text-slate-900" 
              />
              <TouchableOpacity onPress={addCustomAmenity} className="bg-slate-900 px-5 rounded-2xl justify-center active:scale-95">
                <MaterialIcons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. SPORTS SECTION */}
          <View>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sports & Varieties</Text>
            
            {/* Master Sport Input */}
            <View className="flex-row mb-8 gap-2">
              <TextInput 
                value={customSportText} 
                onChangeText={setCustomSportText} 
                placeholder="New sport category (e.g. Badminton)" 
                placeholderTextColor="#94a3b8"
                className="flex-1 bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-3 font-semibold text-blue-900" 
              />
              <TouchableOpacity onPress={addCustomSport} className="bg-blue-600 px-6 rounded-2xl justify-center shadow-sm shadow-blue-200">
                <Text className="text-white font-bold">Add Sport</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-6">
              {masterSports.map((sport) => {
                const draftSport = selectedSports.find(s => s.id === sport.id)
                const isSportActive = !!draftSport

                return (
                  <View key={sport.id} className={`p-5 rounded-[32px] border ${isSportActive ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100 bg-white shadow-sm shadow-slate-100'} mb-6`}>
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center">
                         <View className={`w-10 h-10 rounded-2xl items-center justify-center ${isSportActive ? 'bg-blue-600' : 'bg-slate-100'}`}>
                           <FontAwesome5 name={sport.name === 'Football' ? 'futbol' : 'medal'} size={16} color={isSportActive ? 'white' : '#94a3b8'} />
                         </View>
                         <Text className="ml-3 font-black text-lg text-slate-900">{sport.name}</Text>
                      </View>
                      
                      <TouchableOpacity onPress={() => deleteMasterSport(sport.id)} className="bg-red-50 p-2 rounded-xl">
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>

                    {/* Variety Selection Chips */}
                    <View className="flex-row flex-wrap gap-2 mb-5">
                      {sport.varieties.map((v) => {
                        const isSelected = draftSport?.varieties.some(sv => sv.id === v.id)
                        return (
                          <TouchableOpacity key={v.id} onPress={() => toggleSportVariety(sport, v.id)}
                            className={`px-4 py-2.5 rounded-xl border ${isSelected ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200 shadow-xs'}`}>
                            <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-500'}`}>{v.name}</Text>
                          </TouchableOpacity>
                        )
                      })}
                      {sport.varieties.length === 0 && (
                        <Text className="text-[10px] text-slate-400 font-medium italic ml-1">No types added yet. Add one below ↓</Text>
                      )}
                    </View>

                    {/* Add Custom Variety Input */}
                    <View className="flex-row gap-2 bg-white/50 p-2 rounded-2xl border border-slate-50">
                      <TextInput 
                        value={customVarietyText[sport.id] || ''} 
                        onChangeText={(t) => setCustomVarietyText(prev => ({ ...prev, [sport.id]: t }))} 
                        placeholder="Add court type (e.g. 7-a-side)" 
                        placeholderTextColor="#cbd5e1"
                        className="flex-1 px-3 py-2 text-xs font-bold text-slate-700" 
                      />
                      <TouchableOpacity onPress={() => addVarietyToSport(sport.id)} className="bg-slate-100 px-4 rounded-xl justify-center">
                        <MaterialIcons name="add" size={18} color="#475569" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FOOTER */}
      <View className="p-6 bg-white border-t border-slate-50 items-center" style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
        <TouchableOpacity onPress={() => router.push('/(venueManagement)/venueHandling/createVenue/step-4')} 
          className={`bg-slate-900 h-16 rounded-3xl items-center justify-center flex-row shadow-xl shadow-slate-200 ${isTablet ? 'w-96' : 'w-full'}`}>
          <Text className="text-white font-black text-lg mr-2">Continue</Text>
          <MaterialIcons name="arrow-forward" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}