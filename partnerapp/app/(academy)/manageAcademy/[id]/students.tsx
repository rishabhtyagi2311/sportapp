import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAcademyStore } from "@/store/academyStore";
import StudentCard from "@/components/StudentCard";
import { Student } from "@/types";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";
import AnimatedPressable from "@/components/animated/AnimatedPressable";

export default function StudentsScreen() {
  /* ---------------- Params ---------------- */
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isTablet } = useResponsive();

  /* ---------------- Store (SAFE SUBSCRIPTIONS) ---------------- */
  const allStudents = useAcademyStore((state) => state.students);
  const isLoading = useAcademyStore((state) => state.isLoading);
  const fetchStudents = useAcademyStore((state) => state.fetchStudents);
  const addStudent = useAcademyStore((state) => state.addStudent);
  const updateStudent = useAcademyStore((state) => state.updateStudent);
  const removeStudent = useAcademyStore((state) => state.removeStudent);

  useFocusEffect(
    useCallback(() => {
      if (id) fetchStudents(id);
    }, [id, fetchStudents])
  );

  /* ---------------- Derived State (SAFE) ---------------- */
  const students = useMemo(
    () => allStudents.filter((s) => s.academyId === id),
    [allStudents, id]
  );

  /* ---------------- Local State ---------------- */
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: "",
    age: "",
    fatherName: "",
    fatherContact: "",
  });

  if (!id) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Invalid academy</Text>
      </SafeAreaView>
    );
  }

  /* ---------------- Handlers ---------------- */
  const openAddModal = () => {
    setEditingStudentId(null);
    setStudentForm({ name: "", age: "", fatherName: "", fatherContact: "" });
    setModalVisible(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudentId(student.id);
    setStudentForm({
      name: student.name,
      age: String(student.age),
      fatherName: student.fatherName,
      fatherContact: student.fatherContact,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!studentForm.name || !studentForm.age || !studentForm.fatherName) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(studentForm.fatherContact)) {
      Alert.alert("Error", "Father's contact must be exactly 10 digits.");
      return;
    }

    const payload = {
      name: studentForm.name,
      age: Number(studentForm.age),
      fatherName: studentForm.fatherName,
      fatherContact: studentForm.fatherContact,
    };

    setSubmitting(true);
    try {
      if (editingStudentId) {
        await updateStudent(id, editingStudentId, payload);
        Alert.alert("Success", "Student updated successfully!");
      } else {
        await addStudent(id, payload);
        Alert.alert("Success", "Student added successfully!");
      }
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Could not save student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    Alert.alert("Remove Student", "Are you sure you want to remove this student?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeStudent(id, studentId).catch((err: any) =>
            Alert.alert("Error", err.response?.data?.message || "Could not remove student")
          );
        },
      },
    ]);
  };

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-slate-900 border-b">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-white flex-1">
          Students
        </Text>

        {isLoading && <ActivityIndicator color="white" size="small" style={{ marginRight: 12 }} />}

        <TouchableOpacity onPress={openAddModal}>
          <Ionicons name="add-circle" size={36} color="white" />
        </TouchableOpacity>
      </View>

      {/* Students List */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <FadeInView delay={Math.min(index, 8) * 50}>
            <StudentCard
              student={item}
              onEdit={() => openEditModal(item)}
              onDelete={() => handleRemoveStudent(item.id)}
            />
          </FadeInView>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, maxWidth: isTablet ? 768 : undefined, width: '100%', alignSelf: 'center' }}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No students added yet
          </Text>
        }
      />

      {/* Add / Edit Student Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-center items-center bg-black/50"
        >
          <View className="bg-white w-11/12 rounded-xl p-5">
            <Text className="text-lg font-bold text-slate-900 mb-4 text-center">
              {editingStudentId ? "Edit Student" : "Add New Student"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                placeholder="Student Name"
                placeholderTextColor="#9CA3AF"
                value={studentForm.name}
                onChangeText={(text) =>
                  setStudentForm({ ...studentForm, name: text })
                }
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Age"
                placeholderTextColor="#9CA3AF"
                value={studentForm.age}
                onChangeText={(text) =>
                  setStudentForm({ ...studentForm, age: text })
                }
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Father's Name"
                placeholderTextColor="#9CA3AF"
                value={studentForm.fatherName}
                onChangeText={(text) =>
                  setStudentForm({ ...studentForm, fatherName: text })
                }
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Father's Contact (10 digits)"
                placeholderTextColor="#9CA3AF"
                value={studentForm.fatherContact}
                onChangeText={(text) =>
                  setStudentForm({ ...studentForm, fatherContact: text })
                }
                keyboardType="phone-pad"
                maxLength={10}
                className="border border-gray-300 rounded-lg p-3 mb-4"
              />

              {/* Buttons */}
              <View className="flex-row justify-end mt-4">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  disabled={submitting}
                  className="mr-6"
                >
                  <Text className="text-gray-600 font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <AnimatedPressable
                  onPress={handleSubmit}
                  disabled={submitting}
                  className="bg-blue-600 px-5 py-2 rounded-lg items-center justify-center"
                >
                  {submitting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-semibold">
                      Save
                    </Text>
                  )}
                </AnimatedPressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
