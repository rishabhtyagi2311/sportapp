import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickActionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

// Reusable Button Component for the Grid
const ActionButton = ({ icon, label, onPress }: { icon: any, label: string, onPress: () => void }) => (
  <TouchableOpacity 
    className="items-center justify-center w-24" 
    onPress={onPress}
  >
    <View className="w-16 h-16 bg-slate-800 rounded-full items-center justify-center border border-slate-700 shadow-sm">
      <Ionicons name={icon} size={28} color="#60a5fa" />
    </View>
    <Text className="text-slate-300 mt-2 text-sm font-medium">{label}</Text>
  </TouchableOpacity>
);

// Section Header Component
const SectionHeader = ({ title }: { title: string }) => (
  <View className="items-center my-6">
    <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</Text>
    <View className="h-[1px] bg-slate-800 w-1/2 mt-2" />
  </View>
);

export default function ActionModal({ isVisible, onClose }: QuickActionModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* Dimmed Overlay */}
      <Pressable className="flex-1 bg-black/60" onPress={onClose} />

      {/* Modal Container */}
      <View className="absolute bottom-0 w-full h-[65%] bg-slate-900 rounded-t-[40px] shadow-2xl">
        {/* Handle Bar */}
        <View className="w-12 h-1.5 bg-slate-700 rounded-full self-center mt-4" />
        
        {/* Top Header Section */}
        <View className="px-6 py-4 border-b border-slate-800 flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">Quick Actions</Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close-circle" size={28} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View className="px-6">
          {/* LOG SECTION */}
          <SectionHeader title="Log" />
          <View className="flex-row justify-around items-center">
            <ActionButton icon="barbell-outline" label="Workout" onPress={() => {}} />
            <ActionButton icon="fast-food-outline" label="Nutrition" onPress={() => {}} />
            <ActionButton icon="heart-outline" label="Health" onPress={() => {}} />
          </View>

          {/* BOOK SECTION */}
          <SectionHeader title="Book" />
          <View className="flex-row justify-around items-center">
            <ActionButton icon="ribbon-outline" label="Coach" onPress={() => {}} />
            <ActionButton icon="map-outline" label="Venue" onPress={() => {}} />
            <ActionButton icon="fitness-outline" label="Gym" onPress={() => {}} />
          </View>
        </View>
      </View>
    </Modal>
  );
}