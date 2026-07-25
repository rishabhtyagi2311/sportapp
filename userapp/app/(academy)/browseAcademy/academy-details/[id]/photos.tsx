import React, { useEffect } from "react";
import { View, Text, Image, FlatList, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useAcademyStore } from "@/store/academyStore";

const { width } = Dimensions.get("window");
const tileSize = (width - 48) / 2;

export default function PhotosScreen() {
  const { id } = useLocalSearchParams();
  const academyId = id as string;
  const { getAcademyById, fetchAcademyById } = useAcademyStore();
  const academy = getAcademyById(academyId);

  useEffect(() => {
    fetchAcademyById(academyId);
  }, [academyId]);

  const photos = academy?.photos || [];

  if (photos.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-8">
        <View className="bg-white rounded-3xl p-10 items-center shadow-xl border border-gray-100 w-full max-w-sm">
          <View className="bg-slate-900 rounded-3xl p-8 mb-6">
            <Ionicons name="images-outline" size={64} color="white" />
          </View>
          <Text className="text-slate-900 text-xl font-bold mb-4 text-center">
            No Photos Available
          </Text>
          <Text className="text-gray-500 text-center text-base leading-7 px-2">
            The academy owner hasn't uploaded any photos yet. Check back later for academy images and facility tours!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      keyExtractor={(url, index) => `${url}-${index}`}
      numColumns={2}
      contentContainerStyle={{ padding: 16 }}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      renderItem={({ item }) => (
        <Image
          source={{ uri: item }}
          style={{ width: tileSize, height: tileSize, borderRadius: 16, marginBottom: 16 }}
          resizeMode="cover"
        />
      )}
    />
  );
}
