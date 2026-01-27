import React, { useMemo, useState } from "react";
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
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAcademyStore } from "@/store/academyStore";
import StudentCard from "@/components/StudentCard";

/* ---------------- Utils ---------------- */
const generateStudentId = () =>
  `student_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export default function StudentsScreen() {
  /* ---------------- Params ---------------- */
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Invalid academy</Text>
      </SafeAreaView>
    );
  }

  /* ---------------- Store (SAFE SUBSCRIPTIONS) ---------------- */
  const allStudents = useAcademyStore((state) => state.students);
  const addStudent = useAcademyStore((state) => state.addStudent);

  /* ---------------- Derived State (SAFE) ---------------- */
  const students = useMemo(
    () => allStudents.filter((s) => s.academyId === id),
    [allStudents, id]
  );

  /* ---------------- Local State ---------------- */
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    age: "",
    fatherName: "",
    fatherContact: "",
  });

  /* ---------------- Handlers ---------------- */
  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.age || !newStudent.fatherName) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(newStudent.fatherContact)) {
      Alert.alert("Error", "Father's contact must be exactly 10 digits.");
      return;
    }

    addStudent({
      id: generateStudentId(),
      name: newStudent.name,
      age: Number(newStudent.age),
      fatherName: newStudent.fatherName,
      fatherContact: newStudent.fatherContact,
      academyId: id,
      enrollmentDate: new Date().toISOString().split("T")[0],
    });

    setNewStudent({
      name: "",
      age: "",
      fatherName: "",
      fatherContact: "",
    });

    setShowAddStudent(false);
    Alert.alert("Success", "Student added successfully!");
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

        <TouchableOpacity onPress={() => setShowAddStudent(true)}>
          <Ionicons name="add-circle" size={36} color="white" />
        </TouchableOpacity>
      </View>

      {/* Students List */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StudentCard student={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No students added yet
          </Text>
        }
      />

      {/* Add Student Modal */}
      <Modal
        visible={showAddStudent}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddStudent(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-center items-center bg-black/50"
        >
          <View className="bg-white w-11/12 rounded-xl p-5">
            <Text className="text-lg font-bold text-slate-900 mb-4 text-center">
              Add New Student
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                placeholder="Student Name"
                placeholderTextColor="#9CA3AF"
                value={newStudent.name}
                onChangeText={(text) =>
                  setNewStudent({ ...newStudent, name: text })
                }
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Age"
                placeholderTextColor="#9CA3AF"
                value={newStudent.age}
                onChangeText={(text) =>
                  setNewStudent({ ...newStudent, age: text })
                }
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Father's Name"
                placeholderTextColor="#9CA3AF"
                value={newStudent.fatherName}
                onChangeText={(text) =>
                  setNewStudent({ ...newStudent, fatherName: text })
                }
                className="border border-gray-300 rounded-lg p-3 mb-3"
              />

              <TextInput
                placeholder="Father's Contact (10 digits)"
                placeholderTextColor="#9CA3AF"
                value={newStudent.fatherContact}
                onChangeText={(text) =>
                  setNewStudent({ ...newStudent, fatherContact: text })
                }
                keyboardType="phone-pad"
                maxLength={10}
                className="border border-gray-300 rounded-lg p-3 mb-4"
              />

              {/* Buttons */}
              <View className="flex-row justify-end mt-4">
                <TouchableOpacity
                  onPress={() => setShowAddStudent(false)}
                  className="mr-6"
                >
                  <Text className="text-gray-600 font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddStudent}
                  className="bg-blue-600 px-5 py-2 rounded-lg"
                >
                  <Text className="text-white font-semibold">
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
