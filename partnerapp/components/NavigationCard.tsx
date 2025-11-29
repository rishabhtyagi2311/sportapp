import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavigationCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}

export default function NavigationCard({ icon, title, onPress }: NavigationCardProps) {
  return (
    <TouchableOpacity 
      className="bg-white rounded-xl p-5 items-center w-[30%] shadow-sm border border-gray-100" 
      onPress={onPress}
    >
      <Ionicons name={icon} size={30} color="#3B82F6" />
      <Text className="text-sm font-semibold text-gray-900 mt-2">{title}</Text>
    </TouchableOpacity>
  );
}