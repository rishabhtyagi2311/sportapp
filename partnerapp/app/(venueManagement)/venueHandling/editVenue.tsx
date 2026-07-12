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
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useVenueStore } from '@/store/venueStore'
import { useResponsive } from '@/hooks/useResponsive'
import FadeInView from '@/components/animated/FadeInView'
import AnimatedPressable from '@/components/animated/AnimatedPressable'

export default function EditVenue() {
  const router = useRouter()
  const { isTablet } = useResponsive()
  const { venueId } = useLocalSearchParams() as { venueId: string }

  const venue = useVenueStore((state) => state.getVenueById(venueId))
  const updateVenue = useVenueStore((state) => state.updateVenue)

  const [name, setName] = useState(venue?.name || '')
  const [description, setDescription] = useState(venue?.description || '')
  const [isActive, setIsActive] = useState(venue?.isActive ?? true)
  const [street, setStreet] = useState(venue?.address.street || '')
  const [city, setCity] = useState(venue?.address.city || '')
  const [state, setState] = useState(venue?.address.state || '')
  const [pincode, setPincode] = useState(venue?.address.pincode || '')
  const [phone, setPhone] = useState(venue?.contactInfo.phone || '')
  const [email, setEmail] = useState(venue?.contactInfo.email || '')
  const [whatsapp, setWhatsapp] = useState(venue?.contactInfo.whatsapp || '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!venue) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-slate-400 font-medium">Venue not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-blue-600 font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const handleSave = async () => {
    if (!name || name.length < 3) {
      setError('Venue name must be at least 3 characters.')
      return
    }
    if (!street || !city || !pincode) {
      setError('Please provide at least a street, city, and pincode.')
      return
    }

    setError('')
    setSaving(true)
    try {
      await updateVenue(venueId, {
        name,
        description,
        isActive,
        address: { street, city, state, pincode },
        contactInfo: { phone, email, whatsapp },
      })
      router.back()
    } catch (err: any) {
      setError(err.message || 'Could not save venue changes.')
    } finally {
      setSaving(false)
    }
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
          <Text className="text-slate-900 font-bold">Edit Venue</Text>
          <View className="w-10" />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <FadeInView className={isTablet ? 'self-center w-full max-w-xl' : 'w-full'}>
          {/* IDENTITY */}
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Identity</Text>

          <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Venue Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Venue name"
            placeholderTextColor="#94a3b8"
            className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-semibold shadow-sm mb-4"
          />

          <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tell players about your venue"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-semibold shadow-sm mb-4 h-28"
          />

          <View className="flex-row bg-slate-50 rounded-2xl p-1 mb-8">
            <TouchableOpacity
              onPress={() => setIsActive(true)}
              className={`flex-1 py-3 rounded-xl items-center ${isActive ? 'bg-green-600' : ''}`}
            >
              <Text className={`font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsActive(false)}
              className={`flex-1 py-3 rounded-xl items-center ${!isActive ? 'bg-slate-900' : ''}`}
            >
              <Text className={`font-bold ${!isActive ? 'text-white' : 'text-slate-500'}`}>Draft</Text>
            </TouchableOpacity>
          </View>

          {/* LOCATION */}
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Location</Text>

          <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Street / Landmark</Text>
          <TextInput
            value={street}
            onChangeText={setStreet}
            placeholder="Street / Landmark"
            placeholderTextColor="#94a3b8"
            className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-semibold shadow-sm mb-4"
          />

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">City</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#94a3b8"
                className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-semibold shadow-sm"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Pincode</Text>
              <TextInput
                value={pincode}
                onChangeText={(t) => setPincode(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="400001"
                placeholderTextColor="#94a3b8"
                className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-semibold shadow-sm"
              />
            </View>
          </View>

          <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">State</Text>
          <TextInput
            value={state}
            onChangeText={setState}
            placeholder="State"
            placeholderTextColor="#94a3b8"
            className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-semibold shadow-sm mb-8"
          />

          {/* CONTACT */}
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Contact</Text>

          <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Phone number"
            placeholderTextColor="#94a3b8"
            className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-semibold shadow-sm mb-4"
          />

          <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Email (optional)"
            placeholderTextColor="#94a3b8"
            className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-semibold shadow-sm mb-4"
          />

          <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">WhatsApp</Text>
          <TextInput
            value={whatsapp}
            onChangeText={setWhatsapp}
            keyboardType="phone-pad"
            placeholder="WhatsApp number (optional)"
            placeholderTextColor="#94a3b8"
            className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-semibold shadow-sm"
          />

          {error ? (
            <View className="mt-6 p-4 bg-red-50 rounded-2xl flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text className="ml-2 text-red-700 font-medium flex-1">{error}</Text>
            </View>
          ) : null}
        </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FOOTER */}
      <View className="p-6 bg-white border-t border-slate-50 items-center">
        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          className={`bg-slate-900 py-4 rounded-2xl items-center flex-row justify-center shadow-lg ${isTablet ? 'w-96' : 'w-full'}`}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>
            </>
          )}
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  )
}
