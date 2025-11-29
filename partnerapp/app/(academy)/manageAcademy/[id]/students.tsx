import React, { useState } from "react";
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

export default function StudentsScreen() {
    const { id } = useLocalSearchParams();
    const { getStudentsByAcademy, addStudent } = useAcademyStore();
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: "",
        age: "",
        fatherName: "",
        fatherContact: "",
    });

    const students = getStudentsByAcademy(id as string);

    const handleAddStudent = () => {
        if (!newStudent.name || !newStudent.age || !newStudent.fatherName) {
            Alert.alert("Error", "Please fill all required fields.");
            return;
        }
        if (!/^\d{10}$/.test(newStudent.fatherContact)) {
            Alert.alert("Error", "Father's contact must be exactly 10 digits.");
            return;
        }

        const student = {
            id: Date.now().toString(),
            name: newStudent.name,
            age: parseInt(newStudent.age),
            fatherName: newStudent.fatherName,
            fatherContact: newStudent.fatherContact,
            academyId: id as string,
            enrollmentDate: new Date().toISOString().split("T")[0],
        };
        addStudent(student);
        setNewStudent({ name: "", age: "", fatherName: "", fatherContact: "" });
        setShowAddStudent(false);
        Alert.alert("Success", "Student added successfully!");
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="w-full h-full bg-gray-300 mt-2">
                <View className="flex-row items-center px-4 py-3  bg-slate-900 shadow-sm border-b">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-white flex-1">
                        Students
                    </Text>
                    <TouchableOpacity onPress={() => setShowAddStudent(true)}>
                        <Ionicons name="add-circle" size={26} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Students List */}
                <FlatList
                    data={students}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <StudentCard student={item} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16 }}
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
                                    className="border border-gray-300 rounded-lg p-3 text-base bg-white mb-3 text-slate-900"
                                />

                                <TextInput
                                    placeholder="Age"
                                    placeholderTextColor="#9CA3AF"
                                    value={newStudent.age}
                                    onChangeText={(text) =>
                                        setNewStudent({ ...newStudent, age: text })
                                    }
                                    keyboardType="numeric"
                                    className="border border-gray-300 rounded-lg p-3 text-base bg-white mb-3 text-slate-900"
                                />

                                <TextInput
                                    placeholder="Father's Name"
                                    placeholderTextColor="#9CA3AF"
                                    value={newStudent.fatherName}
                                    onChangeText={(text) =>
                                        setNewStudent({ ...newStudent, fatherName: text })
                                    }
                                    className="border border-gray-300 rounded-lg p-3 text-base bg-white mb-3 text-slate-900"
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
                                    className="border border-gray-300 rounded-lg p-3 text-base bg-white mb-4 text-slate-900"
                                />

                                {/* Buttons */}
                                <View className="flex-row justify-end mt-4">
                                    <TouchableOpacity
                                        onPress={() => setShowAddStudent(false)}
                                        className="mr-6 mt-2"
                                    >
                                        <Text className="text-gray-600 font-medium">Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleAddStudent}
                                        className="bg-blue-600 px-5 py-2  rounded-lg"
                                    >
                                        <Text className="text-white font-semibold">Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        </SafeAreaView>
    );
}
