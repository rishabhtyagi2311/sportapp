import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert, 
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

// 1. IMPORT MAIN STORE
import { useVenueStore } from '@/store/venueStore'

export default function Step5Review() {
  const router = useRouter()
  
  /* -------------------------------------------------------------------------- */
  /* 2. ZUSTAND SELECTORS                                                       */
  /* -------------------------------------------------------------------------- */
  const draftVenue = useVenueStore((state) => state.draftVenue)
  const updateDraftVenue = useVenueStore((state) => state.updateDraftVenue)
  const submitDraftVenue = useVenueStore((state) => state.submitDraftVenue)

  /* -------------------------------------------------------------------------- */
  /* 3. LOCAL STATE                                                             */
  /* -------------------------------------------------------------------------- */
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* -------------------------------------------------------------------------- */
  /* 4. HANDLERS                                                                */
  /* -------------------------------------------------------------------------- */

  // MOCK Image Picker
  const handleAddImage = () => {
    const mockImages = [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&w=500&q=80',
    ]
    const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)]
    
    updateDraftVenue({
      images: [...draftVenue.images, randomImg]
    })
  }

  const removeImage = (index: number) => {
    const newImages = [...draftVenue.images]
    newImages.splice(index, 1)
    updateDraftVenue({ images: newImages })
  }

  const handleLaunch = async () => {
    if (draftVenue.images.length === 0) {
      Alert.alert("Photos Required", "Please add at least one photo of your venue.")
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      // 1. Commit to Store
      submitDraftVenue()
      
      setIsSubmitting(false)
      
      // 2. Success & Redirect
      Alert.alert(
        "Venue Live! 🎉", 
        "Your venue has been successfully listed and is ready for bookings.",
        [
          { 
            text: "Go to Dashboard", 
            onPress: () => router.navigate("/(venueManagement)/venueHandling/landingDashboard") 
          }
        ]
      )
    }, 1500)
  }

  /* -------------------------------------------------------------------------- */
  /* 5. RENDER                                                                  */
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
        <Text className="text-xl font-bold text-slate-900">Review Details</Text>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 mb-2">
          <Text className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Step 5 of 5</Text>
          <Text className="text-3xl font-extrabold text-slate-900 mb-2">Finalize</Text>
          <Text className="text-slate-500 text-base">Add photos and review your details before launching.</Text>
        </View>

        {/* 1. PHOTOS SECTION */}
        <View className="px-6 pt-6">
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            Venue Photos
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {/* Add Button */}
            <TouchableOpacity 
              onPress={handleAddImage}
              className="w-24 h-24 bg-white border-2 border-dashed border-slate-300 rounded-2xl items-center justify-center active:bg-slate-50"
            >
              <MaterialIcons name="add-a-photo" size={24} color="#64748b" />
              <Text className="text-[10px] font-bold text-slate-500 mt-1">ADD NEW</Text>
            </TouchableOpacity>

            {/* Image List */}
            {draftVenue.images.map((img, index) => (
              <View key={index} className="w-24 h-24 relative shadow-sm">
                <Image 
                  source={{ uri: img }} 
                  className="w-full h-full rounded-2xl bg-slate-200" 
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center border-2 border-white shadow-sm"
                >
                  <MaterialIcons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View className="h-[1px] bg-slate-200 mx-6 my-8" />

        {/* 2. REVIEW DETAILS */}
        <View className="px-6">
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            Summary
          </Text>

          {/* CARD 1: IDENTITY */}
          <View className="bg-white p-4 rounded-2xl border border-slate-200 mb-4 shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identity</Text>
              <TouchableOpacity onPress={() => router.push('/(venueManagement)/venueHandling/createVenue/step-1')}>
                <Text className="text-blue-600 text-xs font-bold">Edit</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-lg font-bold text-slate-900">{draftVenue.name || 'Unnamed Venue'}</Text>
            <Text className="text-slate-500 text-sm mt-1">{draftVenue.address.street}, {draftVenue.address.city}</Text>
            <View className="flex-row items-center mt-2">
               <MaterialIcons name="phone" size={14} color="#64748b" />
               <Text className="text-slate-500 text-xs ml-1 font-medium">{draftVenue.contactInfo.phone}</Text>
            </View>
          </View>

          {/* CARD 2: SPORTS */}
          <View className="bg-white p-4 rounded-2xl border border-slate-200 mb-4 shadow-sm">
             <View className="flex-row justify-between items-start mb-2">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activities</Text>
              <TouchableOpacity onPress={() => router.push('/(venueManagement)/venueHandling/createVenue/step-3')}>
                <Text className="text-blue-600 text-xs font-bold">Edit</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {draftVenue.sports.map(s => (
                <View key={s.id} className="bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                  <Text className="text-xs font-bold text-blue-700">{s.name}</Text>
                </View>
              ))}
            </View>
            <Text className="text-slate-500 text-xs font-medium">
              + {draftVenue.amenities.length} Amenities Listed
            </Text>
          </View>

          {/* CARD 3: SCHEDULE */}
          <View className="bg-white p-4 rounded-2xl border border-slate-200 mb-4 shadow-sm">
             <View className="flex-row justify-between items-start mb-2">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule</Text>
              <TouchableOpacity onPress={() => router.push('/(venueManagement)/venueHandling/createVenue/step-4')}>
                <Text className="text-blue-600 text-xs font-bold">Edit</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center mb-1">
              <MaterialIcons name="schedule" size={16} color="#059669" />
              <Text className="text-slate-900 font-bold ml-1">
                {/* FIXED CALCULATION: Simply show array length */}
                {draftVenue.timeSlots.length} Slots / Day
              </Text>
            </View>
            {/* Show first active day as example */}
            {Object.values(draftVenue.operatingHours).find(v => v.isOpen) && (
              <Text className="text-slate-500 text-sm mt-1">
                Open Hours: <Text className="font-medium">{Object.values(draftVenue.operatingHours).find(v => v.isOpen)?.open}</Text> to <Text className="font-medium">{Object.values(draftVenue.operatingHours).find(v => v.isOpen)?.close}</Text>
              </Text>
            )}
            <Text className="text-slate-500 text-xs mt-2">
              Price: ₹{draftVenue.timeSlots[0]?.price || 'N/A'} / slot
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* FOOTER */}
      <View className="p-6 bg-white border-t border-slate-100 shadow-sm mb-6">
        <TouchableOpacity
          onPress={handleLaunch}
          disabled={isSubmitting}
          activeOpacity={0.9}
          className={`w-full py-4 rounded-2xl items-center shadow-lg shadow-green-200 flex-row justify-center ${
            isSubmitting ? 'bg-slate-700' : 'bg-green-600'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : (
            <MaterialIcons name="rocket-launch" size={20} color="white" style={{ marginRight: 8 }} />
          )}
          <Text className="text-white font-bold text-lg">
            {isSubmitting ? 'Creating Venue...' : 'Launch Venue'}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}