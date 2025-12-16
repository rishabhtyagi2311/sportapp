import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAcademyStore } from "@/store/academyStore";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const ITEM_SIZE = width / COLUMN_COUNT - 8; 

export default function AcademyPhotosScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // ✅ Get specific actions from the store
  const academy = useAcademyStore((state) => 
    state.academies.find((a) => a.id === id)
  );
  const addPhoto = useAcademyStore((state) => state.addPhoto);
  const removePhoto = useAcademyStore((state) => state.removePhoto);

  const [uploading, setUploading] = useState(false);

  // If academy is lost (e.g. reload), go back safely
  if (!academy) {
     return (
        <SafeAreaView className="flex-1 items-center justify-center bg-white">
            <Text>Academy not found</Text>
        </SafeAreaView>
     )
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission Needed", "Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUploading(true);
      
      // Simulate network request
      setTimeout(() => {
        const newUri = result.assets[0].uri;
        
        // ✅ FIX 2: Use the dedicated store action (No useEffect needed)
        if (typeof id === 'string') {
            addPhoto(id, newUri);
        }
        
        setUploading(false);
      }, 1000);
    }
  };

  const handleDelete = (uriToDelete: string) => {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to remove this photo?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
             // ✅ FIX: Use dedicated store action
             if (typeof id === 'string') {
                removePhoto(id, uriToDelete);
             }
          }
        }
      ]
    );
  };

  const renderPhotoItem = ({ item }: { item: string }) => (
    <View className="m-1 relative shadow-sm">
      <Image
        source={{ uri: item }}
        style={{ width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 12 }}
        resizeMode="cover"
      />
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        className="absolute top-1 right-1 bg-black/50 p-1.5 rounded-full"
      >
        <Ionicons name="trash-outline" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-slate-900 pt-2 pb-4 px-4 shadow-md">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="p-2 bg-white/10 rounded-full mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Gallery</Text>
            <Text className="text-slate-300 text-xs">
              Manage your academy's photos
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-1">
        <FlatList
          // ✅ Read directly from store (with fallback)
          data={academy.photos || []}
          keyExtractor={(item) => item}
          numColumns={COLUMN_COUNT}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          
          ListHeaderComponent={
            <View className="px-1 mb-6">
              <TouchableOpacity
                onPress={pickImage}
                activeOpacity={0.8}
                disabled={uploading}
                className="w-full h-40 border-2 border-dashed border-blue-300 bg-blue-50 rounded-2xl items-center justify-center mb-4"
              >
                {uploading ? (
                  <View className="items-center">
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text className="text-blue-600 font-medium mt-2">
                      Uploading...
                    </Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <View className="bg-blue-100 p-4 rounded-full mb-2">
                      <Ionicons name="cloud-upload" size={32} color="#2563EB" />
                    </View>
                    <Text className="text-slate-700 font-bold text-lg">
                      Upload New Photo
                    </Text>
                    <Text className="text-slate-500 text-sm">
                      Tap to select from gallery
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View className="flex-row items-center justify-between mb-2 px-1">
                <Text className="text-slate-800 font-bold text-lg">
                  All Photos ({academy.photos?.length || 0})
                </Text>
              </View>
            </View>
          }
          
          renderItem={renderPhotoItem}
          
          // ✅ FIX 1: Use Ternary to return null instead of false
          ListEmptyComponent={
            !uploading ? (
              <View className="items-center justify-center py-10">
                <Ionicons name="images-outline" size={64} color="#CBD5E1" />
                <Text className="text-slate-400 mt-4 text-center">
                  No photos added yet.{"\n"}Upload some to showcase your academy!
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}