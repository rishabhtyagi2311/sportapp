import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAcademyStore } from "@/store/academyStore";
import { certificateTemplates } from "@/constants/dummyData";
import { Certificate } from "@/types";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";
import AnimatedPressable from "@/components/animated/AnimatedPressable";

export default function CertificatesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isTablet } = useResponsive();

  const isLoading = useAcademyStore((state) => state.isLoading);
  const students = useAcademyStore((state) => state.getStudentsByAcademy(id));
  const certificates = useAcademyStore((state) => state.getCertificatesByAcademy(id));
  const fetchStudents = useAcademyStore((state) => state.fetchStudents);
  const fetchCertificates = useAcademyStore((state) => state.fetchCertificates);
  const createCertificate = useAcademyStore((state) => state.createCertificate);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(certificateTemplates[0].id);
  const [achievement, setAchievement] = useState("");
  const [generating, setGenerating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchStudents(id);
        fetchCertificates(id);
      }
    }, [id, fetchStudents, fetchCertificates])
  );

  if (!id) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Invalid academy</Text>
      </SafeAreaView>
    );
  }

  const openModal = () => {
    setSelectedStudentId(students[0]?.id ?? null);
    setSelectedTemplate(certificateTemplates[0].id);
    setAchievement("");
    setModalVisible(true);
  };

  const handleGenerate = async () => {
    if (!selectedStudentId) {
      Alert.alert("Error", "Please select a student.");
      return;
    }
    if (!achievement.trim()) {
      Alert.alert("Error", "Please describe the achievement.");
      return;
    }

    setGenerating(true);
    try {
      await createCertificate(selectedStudentId, selectedTemplate, achievement.trim());
      setModalVisible(false);
      Alert.alert("Success", "Certificate generated successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not generate certificate");
    } finally {
      setGenerating(false);
    }
  };

  const renderCertificate = ({ item, index }: { item: Certificate; index: number }) => {
    const template = certificateTemplates.find((t) => t.id === item.template);
    return (
      <FadeInView
        delay={Math.min(index, 8) * 50}
        className="bg-white rounded-2xl p-4 mb-3 border-2 shadow-sm"
        style={{ borderColor: template?.color || '#e2e8f0' }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-bold text-slate-900">{item.studentName}</Text>
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${template?.color}22` }}>
            <Text className="text-[10px] font-bold uppercase" style={{ color: template?.color }}>
              {template?.name || item.template}
            </Text>
          </View>
        </View>
        <Text className="text-sm text-slate-600 mb-2">{item.achievement}</Text>
        <View className="flex-row justify-between">
          <Text className="text-xs text-slate-400">#{item.certificateNumber}</Text>
          <Text className="text-xs text-slate-400">{item.date}</Text>
        </View>
      </FadeInView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-slate-900 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white flex-1">Certificates</Text>
        {isLoading && <ActivityIndicator color="white" size="small" style={{ marginRight: 12 }} />}
        <TouchableOpacity onPress={openModal}>
          <Ionicons name="add-circle" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Certificates List */}
      <FlatList
        data={certificates}
        keyExtractor={(item) => item.id}
        renderItem={renderCertificate}
        contentContainerStyle={{ padding: 16, maxWidth: isTablet ? 768 : undefined, width: '100%', alignSelf: 'center' }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <MaterialIcons name="workspace-premium" size={56} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4 text-center">
              No certificates issued yet.{"\n"}Tap + to generate one for a student.
            </Text>
          </View>
        }
      />

      {/* Generate Certificate Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-center items-center bg-black/50 px-4"
        >
          <View className="bg-white w-full rounded-2xl p-6">
            <Text className="text-xl font-bold text-slate-900 text-center mb-6">
              Generate Certificate
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {/* Student Picker */}
              <Text className="text-sm font-bold text-slate-700 mb-2">Student</Text>
              {students.length === 0 ? (
                <Text className="text-sm text-slate-400 mb-4">No students in this academy yet.</Text>
              ) : (
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {students.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setSelectedStudentId(s.id)}
                      className={`px-4 py-2 rounded-xl border ${
                        selectedStudentId === s.id
                          ? "bg-blue-600 border-blue-600"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <Text className={`text-sm font-semibold ${selectedStudentId === s.id ? "text-white" : "text-slate-700"}`}>
                        {s.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Template Picker */}
              <Text className="text-sm font-bold text-slate-700 mb-2">Template</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {certificateTemplates.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedTemplate(t.id)}
                    className={`px-4 py-2 rounded-xl border ${
                      selectedTemplate === t.id ? "border-2" : "bg-slate-50 border-slate-200"
                    }`}
                    style={selectedTemplate === t.id ? { backgroundColor: `${t.color}22`, borderColor: t.color } : undefined}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={selectedTemplate === t.id ? { color: t.color } : { color: '#334155' }}
                    >
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Achievement */}
              <Text className="text-sm font-bold text-slate-700 mb-2">Achievement</Text>
              <TextInput
                placeholder="e.g. Winner of U-14 State Championship"
                placeholderTextColor="#94a3b8"
                value={achievement}
                onChangeText={setAchievement}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="border border-slate-300 text-slate-900 px-4 py-3 mb-2 rounded-lg h-24"
              />
            </ScrollView>

            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                disabled={generating}
                className="px-4 py-2 mr-3 rounded-lg"
              >
                <Text className="text-slate-600 font-medium">Cancel</Text>
              </TouchableOpacity>
              <AnimatedPressable
                onPress={handleGenerate}
                disabled={generating}
                className="bg-blue-600 px-5 py-2 rounded-lg items-center justify-center"
              >
                {generating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-semibold">Generate</Text>
                )}
              </AnimatedPressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
