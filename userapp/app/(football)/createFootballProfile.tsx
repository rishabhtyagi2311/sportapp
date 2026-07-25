// app/create-football-profile.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFootballStore } from '@/store/footballTeamStore';
import { FootballPlayerFormData, FootballPosition } from '@/types/addingMemberTypes';

export default function CreateFootballProfile() {
  const { registerProfile } = useFootballStore();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FootballPlayerFormData>({
    name: '',
    position: '',
    images: [],
    preferredFoot: '',
    experience: '',
  });
  
  const footballPositions: FootballPosition[] = [
    'Goalkeeper',
    'Right Back',
    'Left Back', 
    'Centre Back',
    'Defensive Midfielder',
    'Central Midfielder',
    'Attacking Midfielder',
    'Right Winger',
    'Left Winger',
    'Striker',
    'Centre Forward',
  ];
  
  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
  
  // Validate form data
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter player name');
      return false;
    }
    if (!formData.position) {
      Alert.alert('Error', 'Please select a position');
      return false;
    }
    return true;
  };
  
  // Handle position selection
  const selectPosition = (position: FootballPosition) => {
    setFormData(prev => ({ ...prev, position }));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await registerProfile({
        nickname: formData.name.trim(),
        role: formData.position,
        experience: formData.experience || 'Beginner',
      });

      router.push("/(football)/landingScreen/matches");
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create football profile.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="w-full h-full bg-slate-900">
        {/* Header */}
        <View className="px-6 py-4 border-b border-white flex-row items-center mt-4">
          <TouchableOpacity
            className="mr-4"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            Create Football Profile
          </Text>
        </View>
        
        {/* Form */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Player Name */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Player Name *
            </Text>
            <View className="bg-sky-100 rounded-xl border border-gray-200 flex-row items-center px-4">
              <Ionicons name="person-outline" size={20} color="#374151" />
              <TextInput
                className="flex-1 text-black py-4 px-3 text-base"
                placeholder="Enter full name"
                placeholderTextColor="#6b7280"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData(prev => ({ ...prev, name: text }))
                }
                autoCapitalize="words"
              />
            </View>
          </View>
          
          {/* Position Selection */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 text-base">
              Football Position *
            </Text>
            <Text className="text-gray-400 text-sm mb-3">
              Select the player's primary position
            </Text>
            
            <View className="flex-row flex-wrap mb-3">
              {footballPositions.map((position) => (
                <TouchableOpacity
                  key={position}
                  onPress={() => selectPosition(position)}
                  className={`rounded-lg px-3 py-2 mr-2 mb-2 border ${
                    formData.position === position
                      ? "bg-green-600 border-green-500"
                      : "bg-sky-100 border-gray-300"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm ${
                      formData.position === position
                        ? "text-white font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {position}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        
          {/* Additional Details */}
          <Text className="text-white font-semibold mb-4 text-lg">
            Additional Details (Optional)
          </Text>
          
          {/* Experience Level */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2">Experience Level</Text>
            <View className="flex-row flex-wrap">
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    experience: level as 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional' 
                  }))}
                  className={`rounded-lg py-2 px-3 mr-2 mb-2 border ${
                    formData.experience === level
                      ? "bg-green-600 border-green-500"
                      : "bg-sky-100 border-gray-300"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm ${
                      formData.experience === level
                        ? "text-white font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className="bg-blue-300 rounded-xl py-4 mb-6 shadow-lg"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-black font-bold text-lg mr-2">
                {submitting ? 'Creating…' : 'Create Football Profile'}
              </Text>
              <Ionicons name="checkmark-circle-outline" size={24} color="black" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}