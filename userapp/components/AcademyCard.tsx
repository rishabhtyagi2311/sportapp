import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Academy } from '../types';

interface AcademyCardProps {
  academy: Academy;
  onPress: () => void;
}

export default function AcademyCard({ academy, onPress }: AcademyCardProps) {
  return (
    <TouchableOpacity 
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100" 
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-900">{academy.academyName}</Text>
        <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
      </View>
       <Text className="text-sm text-gray-600 mb-2">{academy.address}</Text>
      <Text className="text-sm text-blue-600 mb-1">{academy.city}</Text>
     
      <View className="flex-row justify-between">
        <Text className="text-xs text-gray-500">Coach: {academy.coachName}</Text>
        <Text className="text-xs text-gray-500">Fee: ₹{academy.Fee}/{academy.feeStructure}</Text>
      </View>
    </TouchableOpacity>
  );
}