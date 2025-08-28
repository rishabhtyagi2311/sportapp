import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Certificate } from '../types';

interface CertificateCardProps {
  certificate: Certificate;
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const handleDownload = () => {
    console.log('Downloading certificate:', certificate.certificateNumber);
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-900">{certificate.studentName}</Text>
        <TouchableOpacity 
          className="flex-row items-center bg-gray-100 rounded-lg px-3 py-1.5"
          onPress={handleDownload}
        >
          <Ionicons name="download" size={16} color="#3B82F6" />
          <Text className="text-xs text-blue-600 ml-1">Download</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-sm font-bold text-blue-600 mb-1">
        {certificate.template.toUpperCase()} CERTIFICATE
      </Text>
      <Text className="text-base text-gray-900 mb-2">{certificate.achievement}</Text>
      <Text className="text-sm text-gray-600 mb-1">Date: {certificate.date}</Text>
      <Text className="text-xs text-gray-500">#{certificate.certificateNumber}</Text>
    </View>
  );
}