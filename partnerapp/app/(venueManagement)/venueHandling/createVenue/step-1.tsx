import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useVenueStore } from '@/store/venueStore'

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function Step1Essentials() {
  const router = useRouter()
  const [activeField, setActiveField] = useState<string | null>(null)
  
  const draftName = useVenueStore((state) => state.draftVenue.name)
  const draftDesc = useVenueStore((state) => state.draftVenue.description)
  const draftPhone = useVenueStore((state) => state.draftVenue.contactInfo.phone)
  const draftWhatsapp = useVenueStore((state) => state.draftVenue.contactInfo.whatsapp)
  
  const updateDraftVenue = useVenueStore((state) => state.updateDraftVenue)
  const updateDraftContact = useVenueStore((state) => state.updateDraftContact)

  const [error, setError] = useState('')

  const handleNext = () => {
    if (!draftName || draftName.length < 3) {
      setError("Venue name must be at least 3 characters.")
      return
    }
    if (!draftPhone || draftPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number.")
      return
    }
    router.push('/(venueManagement)/venueHandling/createVenue/step-2')
  }

  // Common Input Style Helper
 const getInputStyle = (fieldName: string) => {
  const base = "bg-white border rounded-2xl px-4 py-4 text-slate-900 text-lg font-semibold shadow-sm mb-4";
  
  if (error && fieldName === 'name' && !draftName) {
    return `${base} border-red-500 bg-red-50`;
  }
  
  return activeField === fieldName 
    ? `${base} border-blue-600` // Use a simple border color change instead of a ring
    : `${base} border-slate-200`;
}
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER & PROGRESS */}
      <View className="bg-white border-b border-slate-50">
        <View className="flex-row items-center px-4 py-3 justify-between">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Ionicons name="close-outline" size={28} color="#64748b" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Setup</Text>
            <Text className="text-slate-900 font-bold">Venue Identity</Text>
          </View>
          <View className="w-10" /> 
        </View>
        {/* Modern Progress Bar */}
        <View className="h-1.5 w-full bg-slate-100 flex-row">
          <View className="h-full bg-blue-600 w-1/5 rounded-r-full" />
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 bg-slate-50/50"
          contentContainerStyle={{ 
            paddingHorizontal: isTablet ? 40 : 20, 
            paddingTop: 32, 
            paddingBottom: 120 
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* CONTENT WRAPPER (Restricts width on Tablets) */}
          <View className="self-center w-full max-w-2xl">
            <View className="mb-10">
              <Text className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                Let's start with the basics
              </Text>
            </View>

            <View className="space-y-8">
              
              {/* VENUE NAME */}
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-3 ml-1">
                  Venue Name <Text className="text-blue-600">*</Text>
                </Text>
                <TextInput
                  value={draftName}
                  onFocus={() => setActiveField('name')}
                  onBlur={() => setActiveField(null)}
                  onChangeText={(text) => {
                    updateDraftVenue({ name: text })
                    if (error) setError('')
                  }}
                  placeholder="The Grand Arena"
                  placeholderTextColor="#94a3b8"
                  className={getInputStyle('name')}
                />
              </View>

              {/* CONTACT & WHATSAPP ROW (Grid for Tablet, Stack for Mobile) */}
              <View className={`${isTablet ? 'flex-row space-x-4' : 'space-y-8'}`}>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-700 mb-3 ml-1">Contact Phone</Text>
                  <TextInput
                    value={draftPhone}
                    onFocus={() => setActiveField('phone')}
                    onBlur={() => setActiveField(null)}
                    onChangeText={(text) => updateDraftContact({ phone: text })}
                    keyboardType="number-pad"
                    maxLength={10}
                    placeholder="99999 00000"
                    placeholderTextColor="#94a3b8"
                    className={getInputStyle('phone')}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-700 mb-3 ml-1">WhatsApp (Optional)</Text>
                  <View className="relative">
                    <View className="absolute left-4 top-4 z-10">
                      <FontAwesome5 name="whatsapp" size={20} color={activeField === 'whatsapp' ? '#10b981' : '#cbd5e1'} />
                    </View>
                    <TextInput
                      value={draftWhatsapp}
                      onFocus={() => setActiveField('whatsapp')}
                      onBlur={() => setActiveField(null)}
                      onChangeText={(text) => updateDraftContact({ whatsapp: text })}
                      keyboardType="number-pad"
                      maxLength={10}
                      className={`${getInputStyle('whatsapp')} pl-12`}
                    />
                  </View>
                </View>
              </View>

              {/* DESCRIPTION */}
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-3 ml-1">About the Venue</Text>
                <TextInput
                  value={draftDesc}
                  onFocus={() => setActiveField('desc')}
                  onBlur={() => setActiveField(null)}
                  onChangeText={(text) => updateDraftVenue({ description: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholder="Briefly describe your facilities, turf type, or special features..."
                  placeholderTextColor="#94a3b8"
                  className={`${getInputStyle('desc')} h-32 leading-6 py-4`}
                />
              </View>

              {/* ERROR ALERT */}
              {error ? (
                <View className="bg-red-50 border border-red-100 p-4 rounded-2xl flex-row items-center">
                  <Ionicons name="alert-circle" size={24} color="#ef4444" />
                  <Text className="ml-3 text-red-700 font-semibold flex-1">{error}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* STICKY FOOTER */}
      <View 
        className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 items-center"
        style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}
      >
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          className={`bg-slate-900 rounded-2xl items-center flex-row justify-center h-16 ${isTablet ? 'w-80' : 'w-full'}`}
        >
          <Text className="text-white font-black text-lg mr-2">Continue</Text>
          <MaterialIcons name="arrow-forward" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}