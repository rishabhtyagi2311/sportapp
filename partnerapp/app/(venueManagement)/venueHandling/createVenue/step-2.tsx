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
  Linking,
  Dimensions,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'

// Store Import
import { useVenueStore } from '@/store/venueStore'

const { width } = Dimensions.get('window');

export default function Step2Location() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 1. ZUSTAND SELECTORS
  const address = useVenueStore((state) => state.draftVenue.address)
  const updateDraftAddress = useVenueStore((state) => state.updateDraftAddress)

  const hasCoords = !!(address.coordinates?.latitude && address.coordinates?.longitude);

  // 2. IMPROVED LOCATION DETECTION (Works multiple times)
  const handleDetectLocation = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Re-check permissions every time to ensure context is fresh
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Using High Accuracy to prevent cached/frozen results
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = location.coords;

      // Reverse Geocode: Get address strings from coordinates
      let response = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (response && response.length > 0) {
        const geoCode = response[0];
        updateDraftAddress({
          street: geoCode.name || geoCode.street || '',
          city: geoCode.city || geoCode.district || '',
          state: geoCode.region || '',
          pincode: geoCode.postalCode || '',
          coordinates: { latitude, longitude }
        });
      }
    } catch (err) {
      setError('Could not fetch location. Ensure GPS is enabled.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. ROBUST EXTERNAL MAP OPENING (No-Key Method)
  const openInExternalMap = async () => {
    if (!hasCoords) return;
    const { latitude, longitude } = address.coordinates!;
    const label = encodeURIComponent(address.street || "Venue Location");
    
    // Platform specific protocols
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    const browserUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    try {
      if (url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          // Fallback to Browser if Map App isn't installed (Common on Emulators)
          await Linking.openURL(browserUrl);
        }
      }
    } catch (err) {
      Alert.alert("Error", "Could not open map application.");
    }
  };

  const handleNext = () => {
    if (!address.street || !address.city || !address.pincode) {
      setError("Please provide at least a street, city, and pincode.");
      return;
    }
    router.push('/(venueManagement)/venueHandling/createVenue/step-3');
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
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Step 2 of 5</Text>
            <Text className="text-slate-900 font-bold">Venue Location</Text>
          </View>
          <View className="w-10" />
        </View>
        <View className="h-1.5 w-full bg-slate-100 flex-row">
          <View className="h-full bg-blue-600 w-2/5 rounded-r-full" />
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8">
            <Text className="text-3xl font-black text-slate-900 tracking-tight">Location Details</Text>
            <Text className="text-slate-500 text-lg mt-1">Help players find your turf with precision.</Text>
          </View>

          {/* DETECT LOCATION BUTTON */}
          <TouchableOpacity 
            onPress={handleDetectLocation}
            disabled={loading}
            activeOpacity={0.7}
            className="flex-row items-center justify-center bg-blue-600 rounded-2xl py-4 mb-6 shadow-sm"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <FontAwesome5 name="location-arrow" size={14} color="white" />
                <Text className="text-white font-bold ml-2">Use Current Location</Text>
              </>
            )}
          </TouchableOpacity>

          {/* HYBRID PREVIEW CARD */}
          <Text className="text-sm font-bold text-slate-700 mb-3 ml-1">Map Preview</Text>
          <TouchableOpacity 
            onPress={openInExternalMap}
            disabled={!hasCoords}
            activeOpacity={0.9}
            className={`h-48 rounded-3xl overflow-hidden border-2 ${hasCoords ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-slate-50'} items-center justify-center relative mb-8`}
          >
            {hasCoords ? (
              <>
                <View className="items-center justify-center">
                   <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2">
                      <FontAwesome5 name="map-marked-alt" size={30} color="#2563eb" />
                   </View>
                   <Text className="text-blue-700 font-bold">Location Coordinates Saved</Text>
                   <Text className="text-slate-500 text-xs mt-1">Tap to verify on Google Maps</Text>
                </View>
                
                <View className="absolute bottom-0 left-0 right-0 bg-white p-3 flex-row items-center justify-between border-t border-slate-100">
                   <View className="flex-1 mr-2">
                      <Text className="text-slate-900 font-bold text-xs" numberOfLines={1}>
                        {address.street || "Coordinates Locked"}
                      </Text>
                   </View>
                   <View className="bg-blue-600 px-3 py-1.5 rounded-lg flex-row items-center">
                      <Text className="text-white text-[10px] font-bold mr-1">Verify</Text>
                      <MaterialIcons name="open-in-new" size={12} color="white" />
                   </View>
                </View>
              </>
            ) : (
              <View className="items-center px-10">
                <MaterialIcons name="location-off" size={40} color="#cbd5e1" />
                <Text className="text-slate-400 text-center text-xs font-medium mt-2">
                  Detect location to enable map verification
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ADDRESS FORM */}
          <View className="space-y-6">
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Street / Landmark</Text>
              <TextInput 
                value={address.street}
                onChangeText={(t) => updateDraftAddress({ street: t })}
                placeholder="e.g. Near Humsafar Farms, Main Road"
                placeholderTextColor="#94a3b8"
                className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-semibold shadow-sm mb-4"
              />
            </View>

            <View className="flex-row">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">City</Text>
                <TextInput 
                  value={address.city}
                  onChangeText={(t) => updateDraftAddress({ city: t })}
                  placeholder="City"
                  placeholderTextColor="#94a3b8"
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-semibold shadow-sm"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Pincode</Text>
                <TextInput 
                  value={address.pincode}
                  onChangeText={(t) => updateDraftAddress({ pincode: t.replace(/[^0-9]/g, '') })}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="400001"
                  placeholderTextColor="#94a3b8"
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 font-semibold shadow-sm"
                />
              </View>
            </View>
          </View>

          {error ? (
            <View className="mt-6 p-4 bg-red-50 rounded-2xl flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text className="ml-2 text-red-700 font-medium">{error}</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FOOTER */}
      <View className="p-6 bg-white border-t border-slate-50">
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          className="bg-slate-900 w-full py-4 rounded-2xl items-center flex-row justify-center shadow-lg"
        >
          <Text className="text-white font-bold text-lg mr-2">Next Step</Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}