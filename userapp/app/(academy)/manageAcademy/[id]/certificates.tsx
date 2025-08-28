import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAcademyStore } from '@/store/academyStore';
import CertificateCard from '@/components/CertificateCard';
import { certificateTemplates } from '@/constants/dummyData';

export default function CertificatesScreen() {
  const { id } = useLocalSearchParams();
  const { 
    getStudentsByAcademy, 
    getCertificatesByAcademy, 
    addCertificate,
    academies 
  } = useAcademyStore();
  
  const [showCreateCertificate, setShowCreateCertificate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('achievement');
  const [certificateData, setCertificateData] = useState({
    studentId: '',
    achievement: '',
    date: new Date().toISOString().split('T')[0]
  });

  const students = getStudentsByAcademy(id as string);
  const certificates = getCertificatesByAcademy(id as string);
  const academy = academies.find(a => a.id === id);

  const handleCreateCertificate = () => {
    const student = students.find(s => s.id === certificateData.studentId);
    if (!student || !academy) return;

    const certificate = {
      id: Date.now().toString(),
      studentId: certificateData.studentId,
      template: selectedTemplate,
      studentName: student.name,
      academyName: academy.academyName,
      achievement: certificateData.achievement,
      date: certificateData.date,
      certificateNumber: `CERT-${Date.now()}`
    };

    addCertificate(certificate);
    setCertificateData({ studentId: '', achievement: '', date: new Date().toISOString().split('T')[0] });
    setShowCreateCertificate(false);
    Alert.alert('Success', 'Certificate created successfully!');
  };

  const getTemplateColorClass = (templateId: string) => {
    switch(templateId) {
      case 'achievement': return 'bg-yellow-400';
      case 'participation': return 'bg-blue-300';
      case 'excellence': return 'bg-red-400';
      default: return 'bg-gray-300';
    }
  };

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-2xl font-bold text-gray-900">Certificates</Text>
        <TouchableOpacity onPress={() => setShowCreateCertificate(true)}>
          <Ionicons name="add" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={certificates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CertificateCard certificate={item} />}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showCreateCertificate} animationType="slide">
        <View className="flex-1 bg-gray-50 pt-12">
          <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">Create Certificate</Text>
            <TouchableOpacity onPress={() => setShowCreateCertificate(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4">
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-900 mb-3">Select Template</Text>
              <View className="flex-row justify-between">
                {certificateTemplates.map(template => (
                  <TouchableOpacity
                    key={template.id}
                    className={`${getTemplateColorClass(template.id)} rounded-lg p-4 items-center w-[30%] ${
                      selectedTemplate === template.id ? 'border-2 border-blue-600' : ''
                    }`}
                    onPress={() => setSelectedTemplate(template.id)}
                  >
                    <Text className="text-xs font-bold text-gray-900 text-center">
                      {template.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-900 mb-3">Select Student</Text>
              <View>
                {students.map(student => (
                  <TouchableOpacity
                    key={student.id}
                    className={`p-3 rounded-lg mb-2 ${
                      certificateData.studentId === student.id 
                        ? 'bg-blue-600' 
                        : 'bg-gray-200'
                    }`}
                    onPress={() => setCertificateData({...certificateData, studentId: student.id})}
                  >
                    <Text className={`text-base ${
                      certificateData.studentId === student.id 
                        ? 'text-white' 
                        : 'text-gray-900'
                    }`}>{student.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text className="text-base font-semibold text-gray-900 mb-2">Achievement/Reason</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base bg-white mb-6"
              value={certificateData.achievement}
              onChangeText={(text) => setCertificateData({...certificateData, achievement: text})}
              placeholder="e.g., Outstanding Performance in Cricket"
            />

            <TouchableOpacity 
              className="bg-green-600 rounded-lg p-4 items-center mt-5"
              onPress={handleCreateCertificate}
            >
              <Text className="text-white text-base font-bold">Create Certificate</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}