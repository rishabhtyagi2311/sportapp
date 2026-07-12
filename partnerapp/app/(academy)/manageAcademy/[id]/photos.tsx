import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAcademyStore } from "@/store/academyStore";
import { academyApiService } from "@/services/academyManagement/academy";
import { AcademyPhoto } from "@/types";
import { useResponsive } from "@/hooks/useResponsive";
import FadeInView from "@/components/animated/FadeInView";
import AnimatedPressable from "@/components/animated/AnimatedPressable";

export default function AcademyPhotosScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width, isTablet } = useResponsive();
  const columnCount = isTablet ? 5 : 3;
  const itemSize = width / columnCount - 8;

  const academy = useAcademyStore((state) =>
    state.academies.find((a) => a.id === id)
  );
  const photos = useAcademyStore((state) => state.getPhotosByAcademy(id));
  const fetchPhotos = useAcademyStore((state) => state.fetchPhotos);
  const addPhoto = useAcademyStore((state) => state.addPhoto);
  const removePhoto = useAcademyStore((state) => state.removePhoto);

  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id) fetchPhotos(id);
    }, [id, fetchPhotos])
  );

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
      const asset = result.assets[0];
      handleUpload(asset.uri, asset.fileName || `academy_${Date.now()}.jpg`);
    }
  };

  const handleUpload = async (uri: string, fileName: string) => {
    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await academyApiService.getPresignedUrl(
        fileName,
        'image/jpeg',
        academy.academyName
      );

      const response = await fetch(uri);
      const blob = await response.blob();
      await academyApiService.uploadToS3(uploadUrl, blob, 'image/jpeg');

      await addPhoto(academy.id, publicUrl);
    } catch (err) {
      console.error("Academy photo upload error:", err);
      Alert.alert("Upload Failed", "Could not upload photo to cloud storage.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (photo: AcademyPhoto) => {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to remove this photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removePhoto(academy.id, photo.id).catch(() =>
              Alert.alert("Error", "Could not remove photo")
            );
          }
        }
      ]
    );
  };

  const renderPhotoItem = ({ item, index }: { item: AcademyPhoto; index: number }) => (
    <FadeInView delay={Math.min(index, 12) * 30} className="m-1 relative shadow-sm">
      <Image
        source={{ uri: item.url }}
        style={{ width: itemSize, height: itemSize, borderRadius: 12 }}
        resizeMode="cover"
      />
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        className="absolute top-1 right-1 bg-black/50 p-1.5 rounded-full"
      >
        <Ionicons name="trash-outline" size={16} color="white" />
      </TouchableOpacity>
    </FadeInView>
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
          key={columnCount}
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={columnCount}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}

          ListHeaderComponent={
            <View className="px-1 mb-6">
              <AnimatedPressable
                onPress={pickImage}
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
              </AnimatedPressable>

              <View className="flex-row items-center justify-between mb-2 px-1">
                <Text className="text-slate-800 font-bold text-lg">
                  All Photos ({photos.length})
                </Text>
              </View>
            </View>
          }

          renderItem={renderPhotoItem}

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
