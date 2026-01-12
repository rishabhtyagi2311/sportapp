import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAnnouncementStore, Announcement } from "@/store/announcementStore";

const backgroundImage = require("@/assets/images/bgEnhancedCoverImage.png");

export default function UserAnnouncementsScreen() {
  // We only need 'posts' here. No 'addPost' since users can't write.
  const { posts } = useAnnouncementStore();

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }: { item: Announcement }) => (
    // Reuse the exact same card design for brand consistency
    <View className="bg-slate-800/90 rounded-2xl p-5 mb-4 border border-slate-700/50 shadow-sm">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center space-x-3">
          <LinearGradient
            colors={["#3b82f6", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-2 rounded-xl"
          >
            <Ionicons name="notifications" size={18} color="white" />
          </LinearGradient>
          <Text className="text-white font-bold text-base tracking-wide ml-2">
            Academy Update
          </Text>
        </View>
        <Text className="text-slate-400 text-xs font-medium mt-1">
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <Text className="text-slate-200 text-[15px] leading-7 pl-1">
        {item.content}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" />

      {/* 1. HEADER - Simplified title for the user */}
      <SafeAreaView className="bg-white z-20 shadow-md shadow-black/20">
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-800">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full bg-slate-800"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text className="text-black text-lg font-bold tracking-tight flex-1 text-center mr-10">
            Notice Board
          </Text>
        </View>
      </SafeAreaView>

      {/* 2. CONTENT LIST */}
      <ImageBackground
        source={backgroundImage}
        className="flex-1"
        resizeMode="cover"
      >
        {/* Dark overlay for readability */}
        <View className="flex-1 bg-slate-950/70 px-4 pt-4">
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListHeaderComponent={
              <Text className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-widest pl-1 mt-2">
                Latest Updates
              </Text>
            }
            ListEmptyComponent={
              <View className="items-center justify-center mt-20">
                <Text className="text-slate-500 text-base">
                  No announcements yet.
                </Text>
              </View>
            }
          />
        </View>
      </ImageBackground>
    </View>
  );
}