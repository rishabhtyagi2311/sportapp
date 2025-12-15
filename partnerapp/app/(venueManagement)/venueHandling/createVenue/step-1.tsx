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

// 1. IMPORT ONLY THE MAIN STORE
import { useVenueStore } from '@/store/venueStore' // Adjust path if needed

export default function Step1Essentials() {
  const router = useRouter()

  /* -------------------------------------------------------------------------- */
  /* 2. ZUSTAND SELECTORS (Atomic selection to prevent re-renders)              */
  /* -------------------------------------------------------------------------- */
  const draftName = useVenueStore((state) => state.draftVenue.name)
  const draftDesc = useVenueStore((state) => state.draftVenue.description)
  const draftPhone = useVenueStore((state) => state.draftVenue.contactInfo.phone)
  const draftWhatsapp = useVenueStore((state) => state.draftVenue.contactInfo.whatsapp)
  
  const updateDraftVenue = useVenueStore((state) => state.updateDraftVenue)
  const updateDraftContact = useVenueStore((state) => state.updateDraftContact)

  /* -------------------------------------------------------------------------- */
  /* 3. LOCAL STATE (For Input Handling)                                        */
  /* -------------------------------------------------------------------------- */
  const [error, setError] = useState('')

  /* -------------------------------------------------------------------------- */
  /* 4. HANDLERS                                                                */
  /* -------------------------------------------------------------------------- */
  
  const handleNext = () => {
    if (!draftName || draftName.length < 3) {
      setError("Please enter a valid venue name.")
      return
    }
    if (!draftPhone || draftPhone.length < 10) {
      setError("Please enter a valid contact number.")
      return
    }

    // No need to "save" here, data is saved on every keystroke via onChangeText
    // Just navigate
    router.push('/(venueManagement)/venueHandling/createVenue/step-2')
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
          <View className="mb-8">
            <Text className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Step 1 of 5</Text>
            <Text className="text-3xl font-extrabold text-slate-900 mb-2">Basic Details</Text>
            <Text className="text-slate-500 text-base">Enter the essential details for your sports venue.</Text>
          </View>

          <View className="space-y-6">
            
            {/* VENUE NAME */}
            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Venue Name <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={draftName}
                onChangeText={(text) => {
                  updateDraftVenue({ name: text }) // Update store directly
                  if (error) setError('')
                }}
                placeholder="e.g. Spartan Sports Arena"
                placeholderTextColor="#cbd5e1"
                className={`bg-white border ${error ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-4 py-4 text-slate-900 text-lg font-semibold shadow-sm`}
              />
            </View>

            {/* CONTACT NUMBER (Since we removed sign-up store, we need this input back) */}
            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Contact Number <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={draftPhone}
                onChangeText={(text) => {
                   updateDraftContact({ phone: text }) // Updates draftVenue.contactInfo.phone
                   if (error) setError('')
                }}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="98765 43210"
                placeholderTextColor="#cbd5e1"
                className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 text-lg font-semibold shadow-sm"
              />
            </View>

            {/* DESCRIPTION */}
            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                About Venue (Optional)
              </Text>
              <View className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-32">
                <TextInput
                  value={draftDesc}
                  onChangeText={(text) => updateDraftVenue({ description: text })}
                  multiline
                  textAlignVertical="top"
                  placeholder="Tell customers about your turf quality..."
                  placeholderTextColor="#cbd5e1"
                  className="flex-1 text-slate-700 text-base font-medium leading-6"
                />
              </View>
            </View>

            {/* WHATSAPP */}
            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                WhatsApp Number (Optional)
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <FontAwesome5 name="whatsapp" size={20} color="#10b981" />
                </View>
                <TextInput
                  value={draftWhatsapp}
                  onChangeText={(text) => updateDraftContact({ whatsapp: text })}
                  keyboardType="number-pad"
                  maxLength={10}
                  placeholder="If different from contact"
                  placeholderTextColor="#cbd5e1"
                  className="bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 text-base font-medium shadow-sm"
                />
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