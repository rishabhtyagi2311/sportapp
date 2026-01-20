import React, { useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";
import { usechildStore } from "@/store/academyChildProfile";
import { useEnrollmentStore } from "@/store/academyEnrollmentStore";
import { useDemoBookingStore } from "@/store/demobookingstore";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const { getAcademyById } = useAcademyStore();
  const childProfiles = usechildStore((state) => state.childProfiles);
  const { enrollChild, isChildEnrolled } = useEnrollmentStore();
  const { addDemoBooking, isDemoBooked } = useDemoBookingStore();
  
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [nextDemoDate, setNextDemoDate] = useState<string>("");
  const [nextDemoDay, setNextDemoDay] = useState<string>("");
  
  const academy = getAcademyById(id as string);

  if (!academy) return null;

  // Function to calculate next working day (excluding weekends)
  const calculateNextWorkingDay = () => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date();
    const nextDay = new Date(today);
    
    // Add 1 day to get tomorrow
    nextDay.setDate(today.getDate() + 1);
    
    // If tomorrow is a weekend (Saturday = 6, Sunday = 0), adjust to Monday
    if (nextDay.getDay() === 0) { // Sunday
      nextDay.setDate(nextDay.getDate() + 1); // Move to Monday
    } else if (nextDay.getDay() === 6) { // Saturday
      nextDay.setDate(nextDay.getDate() + 2); // Move to Monday
    }
    
    // Format the date and day
    const formattedDate = nextDay.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dayName = daysOfWeek[nextDay.getDay()];
    
    return { date: formattedDate, day: dayName, isoDate: nextDay.toISOString() };
  };

  const handleEnrollPress = () => {
    if (childProfiles.length === 0) {
      Alert.alert(
        "No Profiles",
        "Please create a child profile first before enrolling.",
        [{ text: "OK" }]
      );
      return;
    }
    setShowEnrollModal(true);
  };

  const handleDemoPress = () => {
    if (childProfiles.length === 0) {
      Alert.alert(
        "No Profiles",
        "Please create a child profile first before booking a demo.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Calculate next working day
    const { date, day, isoDate } = calculateNextWorkingDay();
    setNextDemoDate(date);
    setNextDemoDay(day);
    
    setShowDemoModal(true);
  };

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
  };

  const handleConfirmEnrollment = () => {
    if (!selectedChildId) {
      Alert.alert("Error", "Please select a child profile");
      return;
    }

    // Check if already enrolled
    if (isChildEnrolled(selectedChildId, academy.id)) {
      Alert.alert("Already Enrolled", "This child is already enrolled in this academy.");
      return;
    }

    const selectedChild = childProfiles.find((c) => c.id === selectedChildId);
    if (!selectedChild) return;

    // Create enrollment
    enrollChild({
      childId: selectedChild.id,
      childName: selectedChild.childName,
      academyId: academy.id,
      academyName: academy.academyName,
      status: 'active',
    });

    setShowEnrollModal(false);
    setSelectedChildId(null);

    Alert.alert(
      "Success!",
      `${selectedChild.childName} has been enrolled in ${academy.academyName}!`,
      [{ text: "OK" }]
    );
  };

  const handleConfirmDemoBooking = () => {
    if (!selectedChildId) {
      Alert.alert("Error", "Please select a child profile");
      return;
    }

    // Check if demo already booked
    if (isDemoBooked(selectedChildId, academy.id)) {
      Alert.alert("Already Booked", "This child already has a demo class booked with this academy.");
      return;
    }

    const selectedChild = childProfiles.find((c) => c.id === selectedChildId);
    if (!selectedChild) return;

    // Calculate the demo date (ensure fresh calculation)
    const { isoDate } = calculateNextWorkingDay();

    // Create demo booking
    addDemoBooking({
      childId: selectedChild.id,
      childName: selectedChild.childName,
      fatherName: selectedChild.fatherName,
      contactNumber: "", // You might want to add this to the child profile or fetch from user profile
      academyId: academy.id,
      academyName: academy.academyName,
      bookingDate: isoDate,
      status: 'confirmed',
    });

    setShowDemoModal(false);
    setSelectedChildId(null);

    Alert.alert(
      "Demo Booked!",
      `${selectedChild.childName}'s demo class with ${academy.academyName} has been confirmed for ${nextDemoDate} (${nextDemoDay})!`,
      [{ text: "OK" }]
    );
  };

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50 p-6">
        <Text className="text-slate-900 text-2xl font-bold mb-6">
          Academy Information
        </Text>

        {/* Basic Details Card */}
        <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <View className="flex-row items-center mb-5">
            <View className="bg-slate-900 rounded-xl p-3 mr-4">
              <Ionicons name="information-circle-outline" size={24} color="white" />
            </View>
            <Text className="text-slate-900 font-bold text-xl">Basic Details</Text>
          </View>

          <View className="space-y-1">
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <Text className="text-gray-600 font-medium text-base">Sport Type</Text>
              <View className="bg-slate-900 px-3 py-1 rounded-lg">
                <Text className="text-white font-bold text-sm">{academy.sportType}</Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <Text className="text-gray-600 font-medium text-base">Head Coach</Text>
              <Text className="text-slate-900 font-bold text-base">{academy.coachName}</Text>
            </View>
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <Text className="text-gray-600 font-medium text-base">Fee Structure</Text>
              <Text className="text-slate-900 font-bold text-base capitalize">month</Text>
            </View>
            <View className="flex-row justify-between items-center py-4">
              <Text className="text-gray-600 font-medium text-base">Contact</Text>
              <View className="flex-row items-center">
                <Ionicons name="call-outline" size={16} color="#6b7280" />
                <Text className="text-slate-900 font-bold text-base ml-2">
                  {academy.contactNumber}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Facilities Card */}
        <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <View className="flex-row items-center mb-5">
            <View className="bg-green-500 rounded-xl p-3 mr-4">
              <Ionicons name="checkmark-circle-outline" size={24} color="white" />
            </View>
            <Text className="text-slate-900 font-bold text-xl">
              Facilities & Amenities
            </Text>
          </View>
          <Text className="text-gray-700 leading-7 text-base">{academy.facilities}</Text>
        </View>

        {/* 👇 BOOK A DEMO CLASS BUTTON - THIS IS THE NEW BUTTON */}
        <TouchableOpacity
          onPress={handleDemoPress}
          className="bg-green-500 rounded-2xl py-4 mb-4 shadow-lg"
          activeOpacity={0.8}
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="calendar" size={22} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Book a Demo Class
            </Text>
          </View>
        </TouchableOpacity>

        {/* 👇 ENROLL BUTTON */}
        <TouchableOpacity
          onPress={handleEnrollPress}
          className="bg-blue-500 rounded-2xl py-4 mb-6 shadow-lg"
          activeOpacity={0.8}
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="person-add" size={22} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Enroll Child
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* 👇 ENROLLMENT MODAL */}
      <Modal
        visible={showEnrollModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEnrollModal(false)}
      >
        <View 
          style={{ 
            flex: 1, 
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View 
            className="bg-white rounded-3xl mx-6 p-6"
            style={{ 
              width: "90%",
              maxHeight: "80%",
            }}
          >
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-slate-900 text-xl font-bold">
                Select Child Profile
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEnrollModal(false);
                  setSelectedChildId(null);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={28} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Child Profiles List */}
            <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
              {childProfiles.map((child) => {
                const alreadyEnrolled = isChildEnrolled(child.id, academy.id);
                const isSelected = selectedChildId === child.id;

                return (
                  <TouchableOpacity
                    key={child.id}
                    onPress={() => !alreadyEnrolled && handleSelectChild(child.id)}
                    disabled={alreadyEnrolled}
                    className={`rounded-2xl p-4 mb-3 border-2 ${
                      alreadyEnrolled
                        ? "bg-gray-100 border-gray-300"
                        : isSelected
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-200"
                    }`}
                    activeOpacity={0.9}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className={`font-bold text-lg mb-1 ${
                          alreadyEnrolled ? "text-gray-400" : "text-slate-900"
                        }`}>
                          {child.childName}
                        </Text>
                        <View className="flex-row items-center">
                          <Ionicons 
                            name="calendar-outline" 
                            size={14} 
                            color={alreadyEnrolled ? "#9ca3af" : "#64748b"} 
                          />
                          <Text className={`ml-1 text-sm ${
                            alreadyEnrolled ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {child.childAge} years
                          </Text>
                          <Ionicons 
                            name="location-outline" 
                            size={14} 
                            color={alreadyEnrolled ? "#9ca3af" : "#64748b"}
                            style={{ marginLeft: 12 }} 
                          />
                          <Text className={`ml-1 text-sm ${
                            alreadyEnrolled ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {child.city}
                          </Text>
                        </View>
                        {alreadyEnrolled && (
                          <View className="flex-row items-center mt-2">
                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                            <Text className="text-green-600 text-xs font-semibold ml-1">
                              Already Enrolled
                            </Text>
                          </View>
                        )}
                      </View>
                      {!alreadyEnrolled && isSelected && (
                        <Ionicons name="checkmark-circle" size={28} color="#3b82f6" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setShowEnrollModal(false);
                  setSelectedChildId(null);
                }}
                className="flex-1 bg-gray-200 rounded-xl py-4 mr-2"
                activeOpacity={0.8}
              >
                <Text className="text-slate-900 font-bold text-center text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmEnrollment}
                className="flex-1 bg-blue-500 rounded-xl py-4"
                activeOpacity={0.8}
                disabled={!selectedChildId}
                style={{
                  opacity: selectedChildId ? 1 : 0.5,
                }}
              >
                <Text className="text-white font-bold text-center text-base">
                  Enroll
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 👇 DEMO BOOKING MODAL - THIS IS THE NEW MODAL */}
      <Modal
        visible={showDemoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDemoModal(false)}
      >
        <View 
          style={{ 
            flex: 1, 
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View 
            className="bg-white rounded-3xl mx-6 p-6"
            style={{ 
              width: "90%",
              maxHeight: "80%",
            }}
          >
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-slate-900 text-xl font-bold">
                Book a Demo Class
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowDemoModal(false);
                  setSelectedChildId(null);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={28} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Demo Date Info */}
            <View className="bg-slate-100 rounded-xl p-4 mb-6">
              <Text className="text-slate-900 text-base font-medium mb-1">
                Your demo class with {academy.academyName} will be scheduled for:
              </Text>
              <View className="flex-row items-center mt-2">
                <Ionicons name="calendar" size={20} color="#10b981" />
                <Text className="text-green-600 font-bold text-lg ml-2">
                  {nextDemoDate} ({nextDemoDay})
                </Text>
              </View>
            </View>

            {/* Child Profiles List */}
            <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
              {childProfiles.map((child) => {
                const alreadyBooked = isDemoBooked(child.id, academy.id);
                const isSelected = selectedChildId === child.id;

                return (
                  <TouchableOpacity
                    key={child.id}
                    onPress={() => !alreadyBooked && handleSelectChild(child.id)}
                    disabled={alreadyBooked}
                    className={`rounded-2xl p-4 mb-3 border-2  ${
                      alreadyBooked
                        ? "bg-gray-100 border-gray-300"
                        : isSelected
                        ? "bg-green-50 border-green-500"
                        : "bg-white border-gray-200"
                    }`}
                    activeOpacity={0.9}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className={`font-bold text-lg mb-1 ${
                          alreadyBooked ? "text-gray-400" : "text-slate-900"
                        }`}>
                          {child.childName}
                        </Text>
                        <View className="flex-row items-center">
                          <Ionicons 
                            name="calendar-outline" 
                            size={14} 
                            color={alreadyBooked ? "#9ca3af" : "#64748b"} 
                          />
                          <Text className={`ml-1 text-sm ${
                            alreadyBooked ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {child.childAge} years
                          </Text>
                          <Ionicons 
                            name="location-outline" 
                            size={14} 
                            color={alreadyBooked ? "#9ca3af" : "#64748b"}
                            style={{ marginLeft: 12 }} 
                          />
                          <Text className={`ml-1 text-sm ${
                            alreadyBooked ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {child.city}
                          </Text>
                        </View>
                        {alreadyBooked && (
                          <View className="flex-row items-center mt-2">
                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                            <Text className="text-green-600 text-xs font-semibold ml-1">
                              Demo Already Booked
                            </Text>
                          </View>
                        )}
                      </View>
                      {!alreadyBooked && isSelected && (
                        <Ionicons name="checkmark-circle" size={28} color="#10b981" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => {
                  setShowDemoModal(false);
                  setSelectedChildId(null);
                }}
                className="flex-1 bg-gray-200 rounded-xl py-4 mr-2"
                activeOpacity={0.8}
              >
                <Text className="text-slate-900 font-bold text-center text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDemoBooking}
                className="flex-1 bg-green-500 rounded-xl py-4"
                activeOpacity={0.8}
                disabled={!selectedChildId}
                style={{
                  opacity: selectedChildId ? 1 : 0.5,
                }}
              >
                <Text className="text-white font-bold text-center text-base">
                  Book Demo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}