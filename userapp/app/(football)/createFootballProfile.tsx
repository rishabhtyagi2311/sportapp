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
import * as ImagePicker from 'expo-image-picker';
import { useFootballStore } from '@/store/footballTeamStore';
import { FootballPlayerFormData, FootballPosition, FootballPlayerImage, FootballPlayer } from '@/types/addingMemberTypes';

export default function CreateFootballProfile() {
  const { addPlayer } = useFootballStore();
  
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
  const preferredFootOptions = ['Left', 'Right', 'Both'];

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

  // Handle image selection (now optional)
  const selectImages = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera roll permissions to add photos.');
        return;
      }

      // Check if already at limit
      if (formData.images.length >= 3) {
        Alert.alert('Limit Reached', 'You can only add up to 3 images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 3 - formData.images.length,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets) {
        const newImages: FootballPlayerImage[] = result.assets.map((asset, index) => ({
          id: `${Date.now()}-${index}`,
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          fileName: asset.fileName || `image-${Date.now()}-${index}.jpg`,
          fileSize: asset.fileSize || 0,
        }));

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages],
        }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select images. Please try again.');
    }
  };

  // Remove image
  const removeImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId),
    }));
  };

  // Handle position selection
  const selectPosition = (position: FootballPosition) => {
    setFormData(prev => ({ ...prev, position }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;

    const newPlayer: FootballPlayer = {
      id: `player-${Date.now()}`,
      name: formData.name.trim(),
    
      position: formData.position as FootballPosition,
      isRegistered: true,
      images: formData.images,
      profileImage: formData.images[0]?.uri,
    
      preferredFoot: formData.preferredFoot || undefined,
      experience: formData.experience || undefined,
     
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addPlayer(newPlayer);

    router.push("./landingScreen/matches")
  };

  const renderImagePicker = () => (
    <View className="mb-6">
      <Text className="text-white font-semibold mb-2 text-base">
        Player Photos (Optional - Up to 3)
      </Text>
      <Text className="text-gray-400 text-sm mb-3">
        Add photos to showcase the player (optional)
      </Text>

      {/* Selected Images */}
      {formData.images.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {formData.images.map((image) => (
            <View key={image.id} className="mr-3 relative">
              <Image 
                source={{ uri: image.uri }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => removeImage(image.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={12} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add Images Button */}
      {formData.images.length < 3 && (
        <TouchableOpacity
          onPress={selectImages}
          className="bg-sky-100 rounded-xl border-2 border-dashed border-gray-400 p-4 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="camera" size={32} color="#374151" />
          <Text className="text-gray-700 font-semibold mt-2">
            {formData.images.length === 0 ? 'Add Photos (Optional)' : `Add More (${3 - formData.images.length} left)`}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            Tap to select from gallery
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

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

          {/* Images */}
          {renderImagePicker()}

          {/* Additional Details */}
          <Text className="text-white font-semibold mb-4 text-lg">
            Additional Details (Optional)
          </Text>

          {/* Preferred Foot */}
          <View className="mb-4">
            <Text className="text-white font-semibold mb-2">Preferred Foot</Text>
            <View className="flex-row">
              {preferredFootOptions.map((foot) => (
                <TouchableOpacity
                  key={foot}
                  onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    preferredFoot: foot as 'Left' | 'Right' | 'Both' 
                  }))}
                  className={`flex-1 rounded-lg py-3 px-2 mr-2 border ${
                    formData.preferredFoot === foot
                      ? "bg-green-600 border-green-500"
                      : "bg-sky-100 border-gray-300"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-center text-sm ${
                      formData.preferredFoot === foot
                        ? "text-white font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {foot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
                      ? "bg-purple-600 border-purple-500"
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
            className="bg-white rounded-xl py-4 mb-6 shadow-lg"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-black font-bold text-lg mr-2">
                Create Football Profile
              </Text>
              <Ionicons name="checkmark-circle-outline" size={24} color="black" />
            </View>
          </TouchableOpacity>

         
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}