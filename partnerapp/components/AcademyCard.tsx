import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Academy } from '../types';
import AnimatedPressable from './animated/AnimatedPressable';

interface AcademyCardProps {
  academy: Academy;
  onPress: () => void;
  onDelete?: () => void;
}

export default function AcademyCard({ academy, onPress, onDelete }: AcademyCardProps) {
  const thumbnail = academy.photos?.[0];

  return (
    <AnimatedPressable
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 flex-row"
      onPress={onPress}
    >
      <View className="w-16 h-16 rounded-lg bg-gray-100 items-center justify-center overflow-hidden mr-3">
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <MaterialIcons name="school" size={26} color="#cbd5e1" />
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>{academy.academyName}</Text>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} className="mr-2">
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          )}
          <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
        </View>
        <Text className="text-sm text-gray-600 mb-2">{academy.address}</Text>
        <Text className="text-sm text-blue-600 mb-1">{academy.city}</Text>

        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-500">Coach: {academy.coachName}</Text>
          <Text className="text-xs text-gray-500">Fee: ₹{academy.fee}/month</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}