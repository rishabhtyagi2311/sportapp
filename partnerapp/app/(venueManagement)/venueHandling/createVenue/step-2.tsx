import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

// 1. IMPORT MAIN STORE
import { useVenueStore } from '@/store/venueStore'

export default function Step2Location() {
  const router = useRouter()

  /* -------------------------------------------------------------------------- */
  /* 2. ZUSTAND SELECTORS (Atomic)                                              */
  /* -------------------------------------------------------------------------- */
  const street = useVenueStore((state) => state.draftVenue.address.street)
  const city = useVenueStore((state) => state.draftVenue.address.city)
  const venueState = useVenueStore((state) => state.draftVenue.address.state) // Renamed to avoid conflict with React 'state'
  const pincode = useVenueStore((state) => state.draftVenue.address.pincode)

  const updateDraftAddress = useVenueStore((state) => state.updateDraftAddress)

  /* -------------------------------------------------------------------------- */
  /* 3. LOCAL STATE                                                             */
  /* -------------------------------------------------------------------------- */
  const [error, setError] = useState('')

  /* -------------------------------------------------------------------------- */
  /* 4. HANDLERS                                                                */
  /* -------------------------------------------------------------------------- */
  const handleDetectLocation = () => {
    // Placeholder for Geolocation logic
    alert("Location detection coming soon!") 
  }

  const handleNext = () => {
    // Validation
    if (!street || !city || !venueState || !pincode) {
      setError("Please fill in all address fields.")
      return
    }
    if (pincode.length < 6) {
      setError("Please enter a valid pincode.")
      return
    }

    router.push('/(venueManagement)/venueHandling/createVenue/step-3')
  }

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

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* TITLE SECTION */}
          <View className="mb-8">
            <Text className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Step 2 of 5</Text>
            <Text className="text-3xl font-extrabold text-slate-900 mb-2">Location</Text>
            <Text className="text-slate-500 text-base">
              Where is your venue located? This helps players find you easily.
            </Text>
          </View>

          {/* DETECT LOCATION BUTTON */}
          <TouchableOpacity 
            onPress={handleDetectLocation}
            className="flex-row items-center justify-center bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 active:bg-blue-100"
          >
            <FontAwesome5 name="location-arrow" size={16} color="#2563eb" />
            <Text className="text-blue-700 font-bold ml-2 text-base">Use Current Location</Text>
          </TouchableOpacity>

          {/* FORM FIELDS */}
          <View className="space-y-6">
            
            {/* STREET ADDRESS */}
            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Street / Landmark <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={street}
                onChangeText={(text) => {
                  updateDraftAddress({ street: text })
                  if(error) setError('')
                }}
                placeholder="e.g. Near City Center Mall, MG Road"
                placeholderTextColor="#cbd5e1"
                className={`bg-white border ${error && !street ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-4 py-4 text-slate-900 text-lg font-semibold shadow-sm`}
              />
            </View>

            {/* ROW: CITY & STATE */}
            <View className="flex-row gap-4">
              {/* CITY */}
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  City <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={city}
                  onChangeText={(text) => updateDraftAddress({ city: text })}
                  placeholder="Mumbai"
                  placeholderTextColor="#cbd5e1"
                  className={`bg-white border ${error && !city ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-4 py-4 text-slate-900 text-lg font-semibold shadow-sm`}
                />
              </View>

              {/* STATE */}
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  State <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={venueState}
                  onChangeText={(text) => updateDraftAddress({ state: text })}
                  placeholder="MH"
                  placeholderTextColor="#cbd5e1"
                  className={`bg-white border ${error && !venueState ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-4 py-4 text-slate-900 text-lg font-semibold shadow-sm`}
                />
              </View>
            </View>

            {/* PINCODE */}
            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Pincode <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row">
                 <TextInput
                  value={pincode}
                  onChangeText={(text) => {
                    // Only allow numbers
                    updateDraftAddress({ pincode: text.replace(/[^0-9]/g, '') })
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="400001"
                  placeholderTextColor="#cbd5e1"
                  className={`bg-white border ${error && !pincode ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-4 py-4 text-slate-900 text-lg font-semibold shadow-sm w-1/2`}
                />
              </View>
            </View>

            {/* MAP PREVIEW (Visual Only) */}
            <View className="mt-2 rounded-2xl overflow-hidden h-40 bg-slate-200 border border-slate-300 items-center justify-center relative">
               <MaterialIcons name="map" size={48} color="#94a3b8" />
               <Text className="text-slate-500 text-xs font-bold mt-2">Map Preview</Text>
               <View className="absolute bottom-3 right-3 bg-white/90 px-2 py-1 rounded shadow-sm">
                 <Text className="text-[10px] text-slate-500 font-bold">Google Maps</Text>
               </View>
            </View>

            {/* ERROR MESSAGE */}
            {error ? (
              <View className="bg-red-50 p-4 rounded-xl flex-row items-center">
                <MaterialIcons name="error" size={20} color="#ef4444" />
                <Text className="ml-2 text-red-600 font-bold text-sm">{error}</Text>
              </View>
            ) : null}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FOOTER */}
      <View className="p-6 bg-white border-t border-slate-100 shadow-sm mb-6">
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          className="bg-slate-900 w-full py-4 rounded-2xl items-center shadow-lg shadow-slate-300 flex-row justify-center"
        >
          <Text className="text-white font-bold text-lg mr-2">Next Step</Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}