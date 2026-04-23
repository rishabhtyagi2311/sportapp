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
  StatusBar,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import axios from 'axios'

// API and Store Imports
import { useVenueStore } from '@/store/venueStore'
import { venueApiService } from '@/services/venueManagement/venue'

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function Step5Review() {
  const router = useRouter()
  
  // Zustand Selectors
  const draftVenue = useVenueStore((state) => state.draftVenue)
  const updateDraftVenue = useVenueStore((state) => state.updateDraftVenue)
  const resetDraftVenue = useVenueStore((state) => state.resetDraftVenue)

  // Local UI State
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* -------------------------------------------------------------------------- */
  /* IMAGE PICKING & S3 PRODUCTION UPLOAD                                       */
  /* -------------------------------------------------------------------------- */

  const pickImage = async () => {
    if (draftVenue.images.length >= 5) {
      Alert.alert("Limit Reached", "You can upload a maximum of 5 photos.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need gallery access to upload photos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.6, 
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      handleS3Upload(asset.uri, asset.fileName || `venue_${Date.now()}.jpg`);
    }
  };

  const handleS3Upload = async (uri: string, fileName: string) => {
    setUploading(true);
    try {
      // 1. Get pre-signed URL from our backend service
      const { uploadUrl, publicUrl } = await venueApiService.getPresignedUrl(fileName, 'image/jpeg');

      // 2. Convert URI to Blob (Crucial for direct S3 binary upload)
      const response = await fetch(uri);
      const blob = await response.blob();

      // 3. Upload directly to S3 using the Put URL
      await venueApiService.uploadToS3(uploadUrl, blob, 'image/jpeg');

      // 4. Save the permanent public URL in Zustand
      updateDraftVenue({
        images: [...draftVenue.images, publicUrl]
      });
    } catch (err) {
      console.error("Upload Process Error:", err);
      Alert.alert("Upload Failed", "Could not upload image to cloud storage.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = draftVenue.images.filter((_, i) => i !== index);
    updateDraftVenue({ images: newImages });
  };

  /* -------------------------------------------------------------------------- */
  /* FINAL VENUE LAUNCH                                                         */
  /* -------------------------------------------------------------------------- */

  const handleFinalLaunch = async () => {
    if (draftVenue.images.length === 0) {
      Alert.alert("Photos Missing", "Please add at least one photo of your venue.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send the entire draft object to the backend
      await venueApiService.createVenue(draftVenue);
      
      Alert.alert(
        "Venue Launched! 🎉",
        "Your venue is now live and slots have been generated.",
        [{ 
          text: "Go to Dashboard", 
          onPress: () => {
            resetDraftVenue(); // Clear the wizard state
            router.navigate("/(venueManagement)/venueHandling/landingDashboard");
          }
        }]
      );
    } catch (err) {
      console.error("Venue Creation Error:", err);
      Alert.alert("Launch Failed", "There was an error saving your venue details.");
    } finally {
      setIsSubmitting(false);
    }
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
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Step 5 of 5</Text>
            <Text className="text-slate-900 font-bold">Review & Photos</Text>
          </View>
          <View className="w-10" />
        </View>
        <View className="h-1.5 w-full bg-slate-100 flex-row">
          <View className="h-full bg-green-500 w-full rounded-r-full" />
        </View>
      </View>

      <ScrollView className="flex-1 bg-slate-50/30" showsVerticalScrollIndicator={false}>
        <View className="self-center w-full max-w-2xl px-6 pt-8">
          <Text className="text-3xl font-black text-slate-900 mb-2">Final Review</Text>
          <Text className="text-slate-500 text-lg mb-8">Add photos and verify your details.</Text>

          {/* PHOTO UPLOAD SECTION */}
          <View className="mb-10">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Venue Gallery (Max 5)</Text>
            <View className="flex-row flex-wrap gap-4">
              
              {/* Add Button */}
              {draftVenue.images.length < 5 && (
                <TouchableOpacity 
                  onPress={pickImage}
                  disabled={uploading}
                  className="w-[105px] h-[105px] bg-white border-2 border-dashed border-slate-200 rounded-[30px] items-center justify-center shadow-sm"
                >
                  {uploading ? (
                    <ActivityIndicator color="#2563eb" />
                  ) : (
                    <>
                      <MaterialIcons name="add-a-photo" size={28} color="#94a3b8" />
                      <Text className="text-[10px] font-black text-slate-400 mt-1">ADD</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Uploaded Images */}
              {draftVenue.images.map((url, index) => (
                <View key={index} className="w-[105px] h-[105px] rounded-[30px] overflow-hidden bg-slate-200 relative shadow-sm">
                  <Image source={{ uri: url }} className="w-full h-full" />
                  <TouchableOpacity 
                    onPress={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white/90 rounded-full p-1"
                  >
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* SUMMARY REVIEW CARDS */}
          <View className="space-y-4 pb-10">
            {/* Identity Info */}
            <View className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
              <View className="flex-row justify-between mb-4">
                <Text className="text-[10px] font-bold text-slate-400 uppercase">Venue Identity</Text>
                <TouchableOpacity onPress={() => router.push('./step-1')}>
                  <Text className="text-blue-600 font-bold text-xs">Change</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-xl font-black text-slate-900">{draftVenue.name}</Text>
              <Text className="text-slate-500 font-medium mt-1">{draftVenue.address.city}, {draftVenue.address.state}</Text>
            </View>

            {/* Sports Info */}
            <View className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
              <View className="flex-row justify-between mb-4">
                <Text className="text-[10px] font-bold text-slate-400 uppercase">Sports & Facilities</Text>
                <TouchableOpacity onPress={() => router.push('./step-3')}>
                  <Text className="text-blue-600 font-bold text-xs">Change</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {draftVenue.sports.map(s => (
                  <View key={s.id} className="bg-slate-900 px-3 py-1 rounded-full">
                    <Text className="text-[10px] font-bold text-white">{s.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Schedule Info */}
            <View className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
              <View className="flex-row justify-between mb-4">
                <Text className="text-[10px] font-bold text-slate-400 uppercase">Pricing & Slots</Text>
                <TouchableOpacity onPress={() => router.push('./step-4')}>
                  <Text className="text-blue-600 font-bold text-xs">Change</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-2xl font-black text-slate-900">₹{draftVenue.timeSlots[0]?.price || 0}</Text>
              <Text className="text-slate-400 text-xs font-bold">Standard rate per 30-min slot</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View className="p-6 bg-white border-t border-slate-50 items-center" style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
        <TouchableOpacity
          onPress={handleFinalLaunch}
          disabled={isSubmitting || uploading}
          className={`h-16 rounded-3xl items-center justify-center flex-row shadow-xl ${isSubmitting ? 'bg-slate-700' : 'bg-green-600'} ${isTablet ? 'w-96' : 'w-full'}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-black text-lg mr-2">Launch Venue</Text>
              <MaterialIcons name="rocket-launch" size={24} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}