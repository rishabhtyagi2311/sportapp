import React, { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ActivityIndicator,
} from "react-native";
// ✅ 1. Import useRouter hook instead of global router
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAcademyStore } from "@/store/academyStore";
import NavigationCard from "@/components/NavigationCard";
import { Coach } from "@/types";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";

export default function AcademyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // ✅ 2. Initialize the router hook here
  const router = useRouter();
  const { isTablet } = useResponsive();

  const academies = useAcademyStore((state) => state.academies);
  const fetchMyAcademies = useAcademyStore((state) => state.fetchMyAcademies);
  const addCoach = useAcademyStore((state) => state.addCoach);
  const updateCoach = useAcademyStore((state) => state.updateCoach);
  const removeCoach = useAcademyStore((state) => state.removeCoach);
  const academy = academies.find((a) => a.id === id);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoachId, setEditingCoachId] = useState<string | null>(null);
  const [coachForm, setCoachForm] = useState<Partial<Coach>>({});
  const [error, setError] = useState("");
  const [savingCoach, setSavingCoach] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMyAcademies();
    }, [fetchMyAcademies])
  );

  if (!academy) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-600">Academy not found</Text>
      </SafeAreaView>
    );
  }

  const openAddCoachModal = () => {
    setEditingCoachId(null);
    setCoachForm({});
    setError("");
    setModalVisible(true);
  };

  const openEditCoachModal = (coach: Coach) => {
    setEditingCoachId(coach.id);
    setCoachForm(coach);
    setError("");
    setModalVisible(true);
  };

  const validateAndSave = async () => {
    if (!coachForm.name || !coachForm.specialization) {
      setError("Please fill in name and specialization.");
      return;
    }
    if (!/^\d{10}$/.test(coachForm.contact || "")) {
      setError("Contact must be exactly 10 digits.");
      return;
    }
    setError("");
    setSavingCoach(true);
    try {
      const payload = {
        name: coachForm.name,
        specialization: coachForm.specialization,
        experience: coachForm.experience || "",
        contact: coachForm.contact || "",
      };
      if (editingCoachId) {
        await updateCoach(academy.id, editingCoachId, payload);
      } else {
        await addCoach(academy.id, payload);
      }
      setCoachForm({});
      setModalVisible(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not save coach");
    } finally {
      setSavingCoach(false);
    }
  };

  const handleDeleteCoach = (coachId: string) => {
    Alert.alert(
      "Delete Coach",
      "Are you sure you want to delete this coach?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeCoach(academy.id, coachId).catch((err: any) =>
              Alert.alert("Error", err.response?.data?.message || "Could not delete coach")
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Custom Header */}
      <View className="w-full h-full bg-slate-900 mt-2">
        <View className="flex-row items-center px-4 py-3 bg-white shadow-sm border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 flex-1">
            {academy.academyName}
          </Text>
          
          {/* ✅ Improved Edit Button Clickability */}
          <TouchableOpacity 
            onPress={() => router.push(`/manageAcademy/${id}/edit`)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} // Expands touch area
            className="p-2"
          >
            <Ionicons name="create-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className={isTablet ? 'self-center w-full max-w-2xl' : 'w-full'}>

          {/* ✅ 1. Navigation Cards (Moved to Top) */}
          <FadeInView direction="none" className="flex-row flex-wrap justify-between mb-6" style={{ rowGap: 12 }}>
            <NavigationCard
              icon="people"
              title="Students"
              onPress={() => router.push(`/manageAcademy/${id}/students`)}
            />
            <NavigationCard
              icon="calendar"
              title="Attendance"
              onPress={() => router.push(`/manageAcademy/${id}/attendance`)}
            />
            <NavigationCard
              icon="images"
              title="Photos"
              onPress={() => router.push(`/manageAcademy/${id}/photos`)}
            />
            <NavigationCard
              icon="ribbon"
              title="Certificates"
              onPress={() => router.push(`/manageAcademy/${id}/certificates`)}
            />
            <NavigationCard
              icon="megaphone"
              title="Info Channel"
              onPress={() => router.push(`/manageAcademy/${id}/announcements`)}
            />
            <NavigationCard
              icon="calendar-outline"
              title="Demo Requests"
              onPress={() => router.push(`/manageAcademy/${id}/demoRequests`)}
            />
            <NavigationCard
              icon="person-add-outline"
              title="Enrollment Requests"
              onPress={() => router.push(`/manageAcademy/${id}/enrollmentRequests`)}
            />
          </FadeInView>

          {/* ✅ 2. Basic Info */}
          <FadeInView delay={80} className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Basic Information
            </Text>
            <View className="flex-row mb-2">
              <Text className="text-sm font-semibold text-gray-600 w-20">
                Sport:
              </Text>
              <Text className="text-sm text-gray-900 flex-1">
                {academy.sportType}
              </Text>
            </View>
            <View className="flex-row mb-2">
              <Text className="text-sm font-semibold text-gray-600 w-20">
                Address:
              </Text>
              <Text className="text-sm text-gray-900 flex-1">
                {academy.address}
              </Text>
            </View>
            <View className="flex-row mb-2">
              <Text className="text-sm font-semibold text-gray-600 w-20">
                Contact:
              </Text>
              <Text className="text-sm text-gray-900 flex-1">
                {academy.contactNumber}
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm font-semibold text-gray-600 w-20">
                Fees:
              </Text>
              <Text className="text-sm text-gray-900 flex-1">
                ₹{academy.fee}{" per month"}
              </Text>
            </View>
          </FadeInView>

          {/* ✅ 3. Coaches */}
          <FadeInView delay={130} className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">Coaches</Text>
              <TouchableOpacity
                onPress={openAddCoachModal}
                className="flex-row items-center"
              >
                <Ionicons name="add-circle" size={22} color="#3B82F6" />
                <Text className="ml-1 text-blue-600 font-semibold">Add</Text>
              </TouchableOpacity>
            </View>

            {academy.coaches?.map((coach) => (
              <View
                key={coach.id}
                className="bg-gray-100 rounded-lg p-3 mb-2 flex-row justify-between items-center"
              >
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 mb-1">
                    {coach.name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Specialization: {coach.specialization}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Experience: {coach.experience}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Contact: {coach.contact}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => openEditCoachModal(coach)} className="p-2">
                  <Ionicons name="create-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCoach(coach.id)} className="p-2">
                  <Ionicons name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}

            {academy.coaches?.length === 0 && (
              <Text className="text-sm text-gray-500">No coaches added yet.</Text>
            )}
          </FadeInView>

          {/* ✅ 4. Facilities */}
          <FadeInView delay={180} className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-3">Facilities</Text>
            <Text className="text-sm text-gray-900 leading-5">
              {academy.facilities}
            </Text>
          </FadeInView>

        </View>
        </ScrollView>

        {/* Add / Edit Coach Modal */}
        <Modal
          transparent
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-center items-center bg-black/50 px-4">
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="w-full"
              >
                <ScrollView
                  contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                  keyboardShouldPersistTaps="handled"
                >
                  <View className="bg-white w-full rounded-2xl p-6 shadow-lg">
                    <Text className="text-xl font-bold text-slate-900 text-center mb-6">
                      {editingCoachId ? "Edit Coach" : "Add New Coach"}
                    </Text>

                    <TextInput
                      placeholder="Enter coach name"
                      placeholderTextColor="#94a3b8"
                      value={coachForm.name || ""}
                      onChangeText={(text) =>
                        setCoachForm({ ...coachForm, name: text })
                      }
                      className="border border-slate-300 text-slate-900 px-4 py-3 mb-4 rounded-lg"
                    />
                    <TextInput
                      placeholder="Specialization (e.g. Football, Fitness)"
                      placeholderTextColor="#94a3b8"
                      value={coachForm.specialization || ""}
                      onChangeText={(text) =>
                        setCoachForm({ ...coachForm, specialization: text })
                      }
                      className="border border-slate-300 text-slate-900 px-4 py-3 mb-4 rounded-lg"
                    />
                    <TextInput
                      placeholder="Years of experience"
                      placeholderTextColor="#94a3b8"
                      value={coachForm.experience || ""}
                      onChangeText={(text) =>
                        setCoachForm({ ...coachForm, experience: text })
                      }
                      className="border border-slate-300 text-slate-900 px-4 py-3 mb-4 rounded-lg"
                    />
                    <TextInput
                      placeholder="10-digit contact number"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      maxLength={10}
                      value={coachForm.contact || ""}
                      onChangeText={(text) =>
                        setCoachForm({ ...coachForm, contact: text })
                      }
                      className="border border-slate-300 text-slate-900 px-4 py-3 mb-2 rounded-lg"
                    />

                    {error ? (
                      <Text className="text-red-600 text-sm mb-3">{error}</Text>
                    ) : null}

                    <View className="flex-row justify-end mt-4">
                      <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        disabled={savingCoach}
                        className="px-4 py-2 mr-3 rounded-lg"
                      >
                        <Text className="text-slate-600 font-medium">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={validateAndSave}
                        disabled={savingCoach}
                        className="bg-blue-600 px-5 py-2 rounded-lg items-center justify-center"
                      >
                        {savingCoach ? (
                          <ActivityIndicator color="white" size="small" />
                        ) : (
                          <Text className="text-white font-semibold">Save</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </SafeAreaView>
  );
}