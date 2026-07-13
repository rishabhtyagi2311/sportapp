import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useAcademyStore } from "@/store/academyStore";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";
import AnimatedPressable from "@/components/animated/AnimatedPressable";

export default function SportsAcademyRegistration() {
  const createAcademy = useAcademyStore((state) => state.createAcademy);
  const router = useRouter();
  const { isTablet } = useResponsive();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    academyName: "",
    sportType: "",
    address: "",
    city: "",
    coachName: "",
    contactNumber: "",
    facilities: "",

  });

  const [Fee, setFee] = useState("");
  const [locating, setLocating] = useState(false);

  const handleDetectLocation = async () => {
    setLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Needed", "Location permission was denied.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;

      let response = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (response && response.length > 0) {
        const geoCode = response[0];
        const street = geoCode.name || geoCode.street || "";
        const district = geoCode.district ? `, ${geoCode.district}` : "";
        setFormData((prev) => ({
          ...prev,
          address: `${street}${district}`.trim(),
          city: geoCode.city || geoCode.district || prev.city,
        }));
      }
    } catch (err) {
      Alert.alert("Error", "Could not fetch location. Ensure GPS is enabled.");
    } finally {
      setLocating(false);
    }
  };



  const popularSports = [
    { name: "Cricket", icon: "🏏" },
    { name: "Football", icon: "⚽" },
    { name: "Basketball", icon: "🏀" },
    { name: "Badminton", icon: "🏸" },
    { name: "Tennis", icon: "🎾" },
    { name: "Swimming", icon: "🏊" },
  ];



  const getSportSpecificPlaceholder = () => {
    const sport = formData.sportType.toLowerCase();
    if (sport.includes("cricket")) {
      return "e.g., Turf pitch, Concrete pitch, Indoor nets, Bowling machine...";
    } else if (sport.includes("football") || sport.includes("soccer")) {
      return "e.g., Grass field, Artificial turf, Indoor court, Goal posts...";
    } else if (sport.includes("basketball")) {
      return "e.g., Indoor court, Outdoor court, Wooden floor...";
    } else if (sport.includes("badminton")) {
      return "e.g., Indoor courts, Wooden floor, Synthetic surface...";
    } else if (sport.includes("tennis")) {
      return "e.g., Hard court, Clay court, Grass court, Indoor courts...";
    } else if (sport.includes("swimming")) {
      return "e.g., Olympic pool, Training pool, Heated pool, Diving board...";
    } else {
      return "Describe your training facilities, equipment, indoor/outdoor setup, etc.";
    }
  };

  const handleSportSelection = (sportName: string) => {
    setFormData((prev) => ({ ...prev, sportType: sportName }));
  };

  const handleSubmit = async () => {
    if (
      !formData.academyName ||
      !formData.sportType ||
      !formData.address ||
      !formData.city || // 👈 check for city
      !formData.coachName ||
      !formData.contactNumber ||
      !formData.facilities ||
      !Fee
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // basic phone + fee validation
    if (!/^\d{10}$/.test(formData.contactNumber)) {
      Alert.alert("Error", "Enter a valid 10-digit contact number");
      return;
    }
    if (isNaN(Number(Fee))) {
      Alert.alert("Error", "Fee must be a valid number");
      return;
    }

    setSubmitting(true);
    try {
      await createAcademy({ ...formData, fee: Number(Fee) });

      Alert.alert("Success", "Sports academy registered successfully!");

      // reset form
      setFormData({
        academyName: "",
        sportType: "",
        address: "",
        city: "",
        coachName: "",
        contactNumber: "",
        facilities: "",

      });
      setFee("");
      router.navigate("./manageAcademy");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not register academy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="w-full h-full bg-slate-900">
        {/* Header */}
        <View className="px-6 py-4 border-b border-white flex-row items-center mt-4">
          <TouchableOpacity
            className="mr-4"
            onPress={() => router.navigate("/(homeScreenTabs)/academy")}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            Register Your Sports Academy
          </Text>
        </View>

        {/* Form */}
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === "ios" ? 20 : 50}
        >
        <FadeInView className={isTablet ? 'self-center w-full max-w-xl' : 'w-full'}>
          {/* Academy Name */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2">
              Academy Name *
            </Text>
            <View className="bg-slate-800 rounded-xl border border-slate-700 flex-row items-center px-4">
              <Ionicons name="trophy-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-4 px-3 text-base"
                placeholder="Enter academy name"
                placeholderTextColor="#64748b"
                value={formData.academyName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, academyName: text }))
                }
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Sport Type */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2">
              Sport/Activity *
            </Text>
            <Text className="text-slate-400 text-sm mb-3">
              Select from popular sports or type your own
            </Text>

            <View className="flex-row flex-wrap mb-3">
              {popularSports.map((sport) => (
                <TouchableOpacity
                  key={sport.name}
                  onPress={() => handleSportSelection(sport.name)}
                  className={`flex-row items-center rounded-lg px-3 py-2 mr-2 mb-2 border ${
                    formData.sportType === sport.name
                      ? "bg-orange-600 border-orange-500"
                      : "bg-slate-800 border-slate-700"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className="mr-1 text-base">{sport.icon}</Text>
                  <Text
                    className={`text-sm ${
                      formData.sportType === sport.name
                        ? "text-white font-semibold"
                        : "text-slate-300"
                    }`}
                  >
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="bg-slate-800 rounded-xl border border-slate-700 flex-row items-center px-4">
              <Ionicons name="fitness-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-4 px-3 text-base"
                placeholder="Or type your sport/activity"
                placeholderTextColor="#64748b"
                value={formData.sportType}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, sportType: text }))
                }
              />
            </View>
          </View>

          {/* Address */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2">Address *</Text>

            <TouchableOpacity
              onPress={handleDetectLocation}
              disabled={locating}
              activeOpacity={0.7}
              className="flex-row items-center justify-center bg-blue-600 rounded-xl py-3 mb-3"
            >
              {locating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <FontAwesome5 name="location-arrow" size={13} color="white" />
                  <Text className="text-white font-bold ml-2">Use Current Location</Text>
                </>
              )}
            </TouchableOpacity>

            <View className="bg-slate-800 rounded-xl border border-slate-700">
              <View className="flex-row items-start px-4 pt-4">
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#94a3b8"
                  style={{ marginTop: 4 }}
                />
                <TextInput
                  className="flex-1 text-white py-0 px-3 text-base"
                  placeholder="Complete address with landmarks"
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, address: text }))
                  }
                  style={{ minHeight: 80, paddingBottom: 16 }}
                />
              </View>
            </View>
          </View>

          {/* City */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2">City *</Text>
            <View className="bg-slate-800 rounded-xl border border-slate-700 flex-row items-center px-4">
              <Ionicons name="business-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-4 px-3 text-base"
                placeholder="Enter city name"
                placeholderTextColor="#64748b"
                value={formData.city}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, city: text }))
                }
              />
            </View>
          </View>

          {/* Handler (Coach) Details */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-3">
              Handler Details
            </Text>

            <View className="bg-slate-800 rounded-xl border border-slate-700 flex-row items-center px-4 mb-3">
              <Ionicons name="person-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-4 px-3 text-base"
                placeholder="Handler full name *"
                placeholderTextColor="#64748b"
                value={formData.coachName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, coachName: text }))
                }
                autoCapitalize="words"
              />
            </View>

            <View className="bg-slate-800 rounded-xl border border-slate-700 flex-row items-center px-4">
              <Ionicons name="call-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 text-white py-4 px-3 text-base"
                placeholder="Handler contact number *"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                maxLength={10}
                value={formData.contactNumber}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, contactNumber: text }))
                }
              />
            </View>
          </View>

          {/* Facilities */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2">
              Training Facilities & Equipment *
            </Text>
            <Text className="text-slate-400 text-sm mb-3">
              Enter comma separated values
            </Text>

            <View className="bg-slate-800 rounded-xl border border-slate-700">
              <View className="flex-row items-start px-4 pt-4">
                <Ionicons
                  name="barbell-outline"
                  size={20}
                  color="#94a3b8"
                  style={{ marginTop: 4 }}
                />
                <TextInput
                  className="flex-1 text-white py-0 px-3 text-base"
                  placeholder={getSportSpecificPlaceholder()}
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={formData.facilities}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, facilities: text }))
                  }
                  style={{ minHeight: 100, paddingBottom: 16 }}
                />
              </View>
            </View>
          </View>

          {/* Fee Structure */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-3">Training Fees</Text>

        
            <View className="bg-slate-800 rounded-xl border border-slate-700 flex-row items-center px-4">
              <Text className="text-slate-300 text-lg font-semibold mt-2">
                ₹
              </Text>
              <TextInput
                className="flex-1 text-white py-4 px-3 text-base"
                placeholder="Enter training fee *"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={Fee}
                onChangeText={setFee}
              />
           
            </View>
          </View>

          {/* Submit Button */}
          <AnimatedPressable
            onPress={handleSubmit}
            disabled={submitting}
            className="bg-white rounded-xl py-4 mb-6 shadow-lg"
          >
            {submitting ? (
              <ActivityIndicator color="black" />
            ) : (
              <View className="flex-row items-center justify-center">
                <Text className="text-black font-bold text-lg mr-2">
                  Register Your Academy
                </Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="black"
                />
              </View>
            )}
          </AnimatedPressable>

          {/* Footer Note */}
          <View className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-row justify-center align-middle mb-10">
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="white"
              className="ml-2"
            />
            <Text className="text-slate-400 text-sm text-center leading-4 mr-2">
              You can add Trainer's details and Academy Photos from your Academy
              Management Dashboard
            </Text>
          </View>
        </FadeInView>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}
