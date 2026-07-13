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
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useVenueStore } from '@/store/venueStore'
import { venueApiService } from '@/services/venueManagement/venue'
import { Amenity, Sport, SportVariety } from '@/types/venue'
import { useResponsive } from '@/hooks/useResponsive'
import FadeInView from '@/components/animated/FadeInView'
import AnimatedPressable from '@/components/animated/AnimatedPressable'

const PREDEFINED_AMENITIES: Partial<Amenity>[] = [
  { id: '1', name: 'Parking', icon: 'local-parking' },
  { id: '2', name: 'Drinking Water', icon: 'local-drink' },
  { id: '3', name: 'Washroom', icon: 'wc' },
  { id: '4', name: 'Changing Room', icon: 'checkroom' },
  { id: '5', name: 'Floodlights', icon: 'lightbulb' },
]

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

  const [images, setImages] = useState<string[]>(venue?.images || [])
  const [amenities, setAmenities] = useState<Amenity[]>(venue?.amenities || [])
  const [sports, setSports] = useState<Sport[]>(venue?.sports || [])

  const [customAmenityText, setCustomAmenityText] = useState('')
  const [customSportText, setCustomSportText] = useState('')
  const [customVarietyText, setCustomVarietyText] = useState<{ [key: string]: string }>({})

  const [uploadingImage, setUploadingImage] = useState(false)
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

  /* --- IMAGE HANDLERS --- */
  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 5 photos.')
      return
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'We need gallery access to upload photos.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.6,
    })
    if (!result.canceled) {
      const asset = result.assets[0]
      setUploadingImage(true)
      try {
        const { uploadUrl, publicUrl } = await venueApiService.getPresignedUrl(
          asset.fileName || `venue_${Date.now()}.jpg`,
          'image/jpeg',
          venue.name
        )
        await venueApiService.uploadToS3(uploadUrl, asset.uri, 'image/jpeg')
        setImages((prev) => [...prev, publicUrl])
      } catch (err) {
        Alert.alert('Upload Failed', 'Could not upload image to cloud storage.')
      } finally {
        setUploadingImage(false)
      }
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  /* --- AMENITY HANDLERS --- */
  const toggleAmenity = (amenity: Partial<Amenity>) => {
    const exists = amenities.find((a) => a.id === amenity.id)
    setAmenities(exists ? amenities.filter((a) => a.id !== amenity.id) : [...amenities, amenity as Amenity])
  }

  const addCustomAmenity = () => {
    if (!customAmenityText.trim()) return
    setAmenities((prev) => [
      ...prev,
      { id: `ca_${Date.now()}`, name: customAmenityText.trim(), category: 'facilities', icon: 'star' },
    ])
    setCustomAmenityText('')
  }

  const removeCustomAmenity = (amenityId: string) => {
    setAmenities((prev) => prev.filter((a) => a.id !== amenityId))
  }

  /* --- SPORT & VARIETY HANDLERS --- */
  const addCustomSport = () => {
    if (!customSportText.trim()) return
    setSports((prev) => [...prev, { id: `cs_${Date.now()}`, name: customSportText.trim(), category: 'N/A', varieties: [] }])
    setCustomSportText('')
  }

  const removeSport = (sportId: string) => {
    Alert.alert('Remove Sport', 'This will remove this category and all its court types.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setSports((prev) => prev.filter((s) => s.id !== sportId)) },
    ])
  }

  const addVarietyToSport = (sportId: string) => {
    const vText = customVarietyText[sportId]
    if (!vText?.trim()) return
    const newVariety: SportVariety = { id: `cv_${Date.now()}`, name: vText.trim(), isAvailable: true }
    setSports((prev) => prev.map((s) => (s.id === sportId ? { ...s, varieties: [...s.varieties, newVariety] } : s)))
    setCustomVarietyText((prev) => ({ ...prev, [sportId]: '' }))
  }

  const removeVariety = (sportId: string, varietyId: string) => {
    setSports((prev) =>
      prev.map((s) => (s.id === sportId ? { ...s, varieties: s.varieties.filter((v) => v.id !== varietyId) } : s))
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
        images,
        amenities,
        sports,
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

          {/* PHOTOS */}
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Photos (Max 5)</Text>
          <View className="flex-row flex-wrap gap-3 mb-8">
            {images.map((url, index) => (
              <View key={index} className="w-[100px] h-[100px] rounded-2xl overflow-hidden bg-slate-200 relative">
                <Image source={{ uri: url }} className="w-full h-full" />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-white/90 rounded-full p-1"
                >
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                onPress={pickImage}
                disabled={uploadingImage}
                className="w-[100px] h-[100px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl items-center justify-center"
              >
                {uploadingImage ? (
                  <ActivityIndicator color="#2563eb" />
                ) : (
                  <>
                    <MaterialIcons name="add-a-photo" size={22} color="#94a3b8" />
                    <Text className="text-[10px] font-black text-slate-400 mt-1">ADD</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

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

          {/* AMENITIES */}
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Amenities</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {PREDEFINED_AMENITIES.map((item) => {
              const isSelected = amenities.some((a) => a.id === item.id)
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggleAmenity(item)}
                  className={`px-4 py-3 rounded-2xl border ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-slate-50 border-slate-100'}`}
                >
                  <Text className={`font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>{item.name}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          {amenities.filter((a) => !PREDEFINED_AMENITIES.some((p) => p.id === a.id)).length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {amenities
                .filter((a) => !PREDEFINED_AMENITIES.some((p) => p.id === a.id))
                .map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => removeCustomAmenity(item.id)}
                    className="px-4 py-3 rounded-2xl border bg-blue-600 border-blue-600 flex-row items-center"
                  >
                    <Text className="font-bold text-white mr-2">{item.name}</Text>
                    <Ionicons name="close-circle" size={16} color="white" />
                  </TouchableOpacity>
                ))}
            </View>
          )}
          <View className="flex-row gap-2 mb-8">
            <TextInput
              value={customAmenityText}
              onChangeText={setCustomAmenityText}
              placeholder="Add other (e.g. Cafe, Shower)"
              placeholderTextColor="#94a3b8"
              className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-semibold text-slate-900"
            />
            <TouchableOpacity onPress={addCustomAmenity} className="bg-slate-900 px-5 rounded-2xl justify-center">
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* SPORTS & VARIETIES */}
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sports & Court Types</Text>
          <View className="flex-row mb-6 gap-2">
            <TextInput
              value={customSportText}
              onChangeText={setCustomSportText}
              placeholder="New sport category (e.g. Badminton)"
              placeholderTextColor="#94a3b8"
              className="flex-1 bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-3 font-semibold text-blue-900"
            />
            <TouchableOpacity onPress={addCustomSport} className="bg-blue-600 px-6 rounded-2xl justify-center">
              <Text className="text-white font-bold">Add</Text>
            </TouchableOpacity>
          </View>

          {sports.length === 0 && (
            <Text className="text-sm text-slate-400 italic mb-8">No sports added yet.</Text>
          )}

          {sports.map((sport) => (
            <View key={sport.id} className="p-5 rounded-[32px] border border-slate-100 bg-white mb-6 shadow-sm">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="font-black text-lg text-slate-900">{sport.name}</Text>
                <TouchableOpacity onPress={() => removeSport(sport.id)} className="bg-red-50 p-2 rounded-xl">
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-2 mb-4">
                {sport.varieties.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => removeVariety(sport.id, v.id)}
                    className="px-4 py-2.5 rounded-xl border bg-slate-900 border-slate-900 flex-row items-center"
                  >
                    <Text className="text-xs font-bold text-white mr-2">{v.name}</Text>
                    <Ionicons name="close" size={14} color="white" />
                  </TouchableOpacity>
                ))}
                {sport.varieties.length === 0 && (
                  <Text className="text-[10px] text-slate-400 font-medium italic ml-1">No court types added yet.</Text>
                )}
              </View>

              <View className="flex-row gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-50">
                <TextInput
                  value={customVarietyText[sport.id] || ''}
                  onChangeText={(t) => setCustomVarietyText((prev) => ({ ...prev, [sport.id]: t }))}
                  placeholder="Add court type (e.g. 7-a-side)"
                  placeholderTextColor="#cbd5e1"
                  className="flex-1 px-3 py-2 text-xs font-bold text-slate-700"
                />
                <TouchableOpacity onPress={() => addVarietyToSport(sport.id)} className="bg-slate-200 px-4 rounded-xl justify-center">
                  <MaterialIcons name="add" size={18} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* LOCATION */}
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">Location</Text>

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
