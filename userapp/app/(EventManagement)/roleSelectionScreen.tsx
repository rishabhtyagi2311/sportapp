// screens/RoleSelectionScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const RoleSelectionScreen: React.FC = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'user' | 'organizer' | null>(null);

  const handleContinue = () => {
    if (selectedRole === 'user') {
      router.replace('/(tabs)/explore');
    } else if (selectedRole === 'organizer') {
      router.push('/organizer-dashboard');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View className="flex-1 px-6 py-8 justify-between">
        {/* Header */}
        <View className="mt-8">
          <View className="items-center mb-8">
            
            <Text className="text-4xl font-bold text-white mb-3">SportHub</Text>
            <Text className="text-gray-300 text-center text-base leading-relaxed">
              Book venues, organize events, and manage registrations
            </Text>
          </View>
        </View>

        {/* Role Selection Cards */}
        <View className="space-y-4 mb-8">
          {/* User Role Card */}
          <TouchableOpacity
            onPress={() => setSelectedRole('user')}
            activeOpacity={0.7}
            className={`p-6 rounded-2xl border-2 transition-all ${
              selectedRole === 'user'
                ? 'bg-green-50 border-green-500'
                : 'bg-slate-700 border-slate-600'
            }`}
          >
            <View className="flex-row items-start">
              <View
                className={`p-3 rounded-lg mr-4 ${
                  selectedRole === 'user' ? 'bg-green-100' : 'bg-slate-600'
                }`}
              >
                <Ionicons
                  name="person-outline"
                  size={28}
                  color={selectedRole === 'user' ? '#16a34a' : '#cbd5e1'}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-xl font-bold mb-2 ${
                    selectedRole === 'user' ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Player / Participant
                </Text>
                <Text
                  className={`text-sm leading-relaxed ${
                    selectedRole === 'user' ? 'text-slate-700' : 'text-gray-400'
                  }`}
                >
                  Browse venues, register for events, and manage your bookings
                </Text>
              </View>
              {selectedRole === 'user' && (
                <View className="ml-2">
                  <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Organizer Role Card */}
          <TouchableOpacity
            onPress={() => setSelectedRole('organizer')}
            activeOpacity={0.7}
            className={`p-6 rounded-2xl border-2 transition-all ${
              selectedRole === 'organizer'
                ? 'bg-blue-50 border-blue-500'
                : 'bg-slate-700 border-slate-600'
            }`}
          >
            <View className="flex-row items-start">
              <View
                className={`p-3 rounded-lg mr-4 ${
                  selectedRole === 'organizer' ? 'bg-blue-100' : 'bg-slate-600'
                }`}
              >
                <Ionicons
                  name="clipboard-outline"
                  size={28}
                  color={selectedRole === 'organizer' ? '#2563eb' : '#cbd5e1'}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-xl font-bold mb-2 ${
                    selectedRole === 'organizer' ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Event Organizer
                </Text>
                <Text
                  className={`text-sm leading-relaxed ${
                    selectedRole === 'organizer' ? 'text-slate-700' : 'text-gray-400'
                  }`}
                >
                  Create events, manage registrations, and track participants
                </Text>
              </View>
              {selectedRole === 'organizer' && (
                <View className="ml-2">
                  <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selectedRole}
          className={`py-4 rounded-xl items-center mb-4 ${
            selectedRole ? 'bg-green-600' : 'bg-gray-600'
          }`}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold">
            Continue as{' '}
            {selectedRole === 'user'
              ? 'Player'
              : selectedRole === 'organizer'
              ? 'Organizer'
              : 'User'}
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View className="items-center">
          <Text className="text-gray-400 text-sm">
            You can switch roles anytime in settings
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RoleSelectionScreen;